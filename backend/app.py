"""
LogicGuard - Flask Backend
===========================
This Flask API provides the /analyze endpoint for code review.
It uses Groq AI (FREE) to analyze code and provide feedback.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import re
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Configure Groq API Client (uses OpenAI-compatible API)
client = OpenAI(
    api_key=os.getenv('GROQ_API_KEY'),
    base_url="https://api.groq.com/openai/v1"
)

# AI Prompt Template for Code Analysis
CODE_ANALYSIS_PROMPT = """You are an expert code reviewer and software engineer. Analyze the following {language} code and provide a comprehensive review.

CODE TO ANALYZE:
```{language}
{code}
```

Provide your analysis in the following JSON format (ONLY return valid JSON, no markdown):
{{
    "score": <number between 0-100>,
    "summary": "<brief 1-2 sentence summary of code quality>",
    "bugs": [
        {{
            "severity": "critical|high|medium|low",
            "line": <line number or null if general>,
            "title": "<short bug title>",
            "description": "<detailed explanation in simple, student-friendly language>",
            "suggestion": "<how to fix it>"
        }}
    ],
    "optimizations": [
        {{
            "category": "performance|readability|best-practices|security",
            "title": "<short title>",
            "description": "<explanation in beginner-friendly terms>",
            "code_example": "<optional improved code snippet or null>"
        }}
    ],
    "positives": [
        "<things done well in the code>"
    ],
    "metrics": {{
        "complexity": "<low|medium|high>",
        "readability": <score 0-100>,
        "maintainability": <score 0-100>,
        "security": <score 0-100>
    }}
}}

Guidelines for your review:
1. Detect syntax errors, logical bugs, and potential runtime issues
2. Suggest performance improvements and optimizations
3. Recommend best practices and coding standards
4. Identify security vulnerabilities if any
5. Explain issues in simple, beginner-friendly language that a student can understand
6. Be constructive and helpful, not harsh
7. Assign a fair quality score based on overall code quality

Return ONLY the JSON object, no additional text or markdown formatting."""


def parse_ai_response(response_text):
    """
    Parse the AI response and extract the JSON data.
    Handles potential formatting issues in the response.
    """
    try:
        # Try to parse directly
        return json.loads(response_text)
    except json.JSONDecodeError:
        # Try to extract JSON from markdown code blocks
        json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', response_text)
        if json_match:
            try:
                return json.loads(json_match.group(1))
            except json.JSONDecodeError:
                pass

        # Try to find JSON object in the response
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            try:
                return json.loads(json_match.group(0))
            except json.JSONDecodeError:
                pass

    # Return default response if parsing fails
    return {
        "score": 50,
        "summary": "Unable to fully parse the AI response. Please try again.",
        "bugs": [],
        "optimizations": [],
        "positives": ["Code was submitted successfully"],
        "metrics": {
            "complexity": "medium",
            "readability": 50,
            "maintainability": 50,
            "security": 50
        }
    }


def analyze_code_with_ai(code, language):
    """
    Send code to Groq API for analysis.
    Returns structured review data.
    """
    prompt = CODE_ANALYSIS_PROMPT.format(language=language, code=code)

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert code reviewer. Always respond with valid JSON only."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            max_tokens=2000
        )

        response_text = response.choices[0].message.content.strip()
        return parse_ai_response(response_text)

    except Exception as e:
        raise Exception(f"Error analyzing code: {str(e)}")


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify API is running."""
    return jsonify({
        "status": "healthy",
        "message": "LogicGuard API is running (Powered by Groq)"
    })


@app.route('/api/analyze', methods=['POST'])
def analyze_code():
    """
    Main endpoint for code analysis.

    Request Body:
    {
        "code": "string - the source code to analyze",
        "language": "string - programming language (python, javascript, java, cpp)"
    }

    Returns:
    {
        "success": boolean,
        "data": {
            "score": number,
            "summary": string,
            "bugs": array,
            "optimizations": array,
            "positives": array,
            "metrics": object
        }
    }
    """
    try:
        # Get request data
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "error": "No data provided"
            }), 400

        code = data.get('code', '').strip()
        language = data.get('language', 'python').lower()

        # Validate input
        if not code:
            return jsonify({
                "success": False,
                "error": "No code provided for analysis"
            }), 400

        # Supported languages
        supported_languages = ['python', 'javascript', 'java', 'cpp', 'c', 'typescript', 'go', 'rust']
        if language not in supported_languages:
            language = 'python'  # Default to Python

        # Check if API key is configured
        if not os.getenv('GROQ_API_KEY'):
            return jsonify({
                "success": False,
                "error": "Groq API key not configured. Please set GROQ_API_KEY environment variable."
            }), 500

        # Analyze code with AI
        result = analyze_code_with_ai(code, language)

        return jsonify({
            "success": True,
            "data": result
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/supported-languages', methods=['GET'])
def get_supported_languages():
    """Return list of supported programming languages."""
    languages = [
        {"id": "python", "name": "Python", "extension": ".py"},
        {"id": "javascript", "name": "JavaScript", "extension": ".js"},
        {"id": "typescript", "name": "TypeScript", "extension": ".ts"},
        {"id": "java", "name": "Java", "extension": ".java"},
        {"id": "cpp", "name": "C++", "extension": ".cpp"},
        {"id": "c", "name": "C", "extension": ".c"},
        {"id": "go", "name": "Go", "extension": ".go"},
        {"id": "rust", "name": "Rust", "extension": ".rs"}
    ]
    return jsonify({"languages": languages})


if __name__ == '__main__':
    # Run the Flask development server
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'

    print(f"""
    ==============================================
              LogicGuard API

         Running on: http://localhost:{port}
         Debug Mode: {debug}
         AI Model: Groq Llama 3.3 70B (FREE)
    ==============================================
    """)

    app.run(host='0.0.0.0', port=port, debug=debug)
