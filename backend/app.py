"""
LogicGuard - Flask Backend
===========================
This Flask API provides the /analyze endpoint for code review.
It uses Groq AI (FREE) to analyze code and provide feedback.
"""

from flask import Flask, request, jsonify, redirect, session
from flask_cors import CORS
import os
import json
import re
import requests
import urllib.parse
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'logicguard-secret-key-2025')
CORS(app, supports_credentials=True, origins=['http://localhost:3000'])

# OAuth Configuration
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID', '')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET', '')
GITHUB_CLIENT_ID = os.getenv('GITHUB_CLIENT_ID', '')
GITHUB_CLIENT_SECRET = os.getenv('GITHUB_CLIENT_SECRET', '')

FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')

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
        "message": "LogicGuard API is running"
    })


@app.route('/api/welcome', methods=['GET'])
def welcome():
    """Welcome page API endpoint with app information."""
    return jsonify({
        "success": True,
        "data": {
            "name": "LogicGuard",
            "tagline": "AI Code Review & Quality Assessment",
            "subtitle": "Protecting Code Logic, Quality, and Performance Using Artificial Intelligence",
            "features": [
                {
                    "id": "bug-detection",
                    "title": "Bug Detection",
                    "description": "Identify syntax errors, logical bugs, and potential runtime issues"
                },
                {
                    "id": "performance-analysis",
                    "title": "Performance Analysis",
                    "description": "Get performance improvement recommendations and optimizations"
                },
                {
                    "id": "security-review",
                    "title": "Security Review",
                    "description": "Identify security vulnerabilities and get fixes"
                },
                {
                    "id": "smart-suggestions",
                    "title": "Smart Suggestions",
                    "description": "Receive AI-powered code improvement suggestions"
                }
            ],
            "version": "1.0.0",
            "copyright": "All Copyright Reserved @ LogicGuard 2025"
        }
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


# ==================== OAuth Endpoints ====================

@app.route('/api/auth/google', methods=['GET'])
def google_login():
    """Redirect to Google OAuth login."""
    if not GOOGLE_CLIENT_ID:
        return jsonify({"error": "Google OAuth not configured"}), 500

    redirect_uri = f"{request.host_url}api/auth/google/callback"
    google_auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={GOOGLE_CLIENT_ID}&"
        f"redirect_uri={redirect_uri}&"
        f"response_type=code&"
        f"scope=openid%20email%20profile&"
        f"access_type=offline"
    )
    return redirect(google_auth_url)


@app.route('/api/auth/google/callback', methods=['GET'])
def google_callback():
    """Handle Google OAuth callback."""
    code = request.args.get('code')
    error = request.args.get('error')

    if error:
        return redirect(f"{FRONTEND_URL}/auth?error={error}")

    if not code:
        return redirect(f"{FRONTEND_URL}/auth?error=no_code")

    try:
        # Exchange code for tokens
        redirect_uri = f"{request.host_url}api/auth/google/callback"
        token_response = requests.post(
            'https://oauth2.googleapis.com/token',
            data={
                'client_id': GOOGLE_CLIENT_ID,
                'client_secret': GOOGLE_CLIENT_SECRET,
                'code': code,
                'grant_type': 'authorization_code',
                'redirect_uri': redirect_uri
            }
        )
        tokens = token_response.json()

        if 'error' in tokens:
            return redirect(f"{FRONTEND_URL}/auth?error={tokens['error']}")

        # Get user info
        user_response = requests.get(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            headers={'Authorization': f"Bearer {tokens['access_token']}"}
        )
        user_info = user_response.json()

        # Store user in session
        session['user'] = {
            'id': user_info.get('id'),
            'email': user_info.get('email'),
            'name': user_info.get('name'),
            'picture': user_info.get('picture'),
            'provider': 'google'
        }

        # Redirect to frontend with user data
        user_param = json.dumps(session['user'])
        encoded_user = urllib.parse.quote(user_param)
        return redirect(f"{FRONTEND_URL}/app?user={encoded_user}")

    except Exception as e:
        return redirect(f"{FRONTEND_URL}/auth?error={str(e)}")


@app.route('/api/auth/github', methods=['GET'])
def github_login():
    """Redirect to GitHub OAuth login."""
    if not GITHUB_CLIENT_ID:
        return jsonify({"error": "GitHub OAuth not configured"}), 500

    redirect_uri = f"{request.host_url}api/auth/github/callback"
    github_auth_url = (
        f"https://github.com/login/oauth/authorize?"
        f"client_id={GITHUB_CLIENT_ID}&"
        f"redirect_uri={redirect_uri}&"
        f"scope=user:email"
    )
    return redirect(github_auth_url)


@app.route('/api/auth/github/callback', methods=['GET'])
def github_callback():
    """Handle GitHub OAuth callback."""
    code = request.args.get('code')
    error = request.args.get('error')

    if error:
        return redirect(f"{FRONTEND_URL}/auth?error={error}")

    if not code:
        return redirect(f"{FRONTEND_URL}/auth?error=no_code")

    try:
        # Exchange code for access token
        token_response = requests.post(
            'https://github.com/login/oauth/access_token',
            headers={'Accept': 'application/json'},
            data={
                'client_id': GITHUB_CLIENT_ID,
                'client_secret': GITHUB_CLIENT_SECRET,
                'code': code
            }
        )
        tokens = token_response.json()

        if 'error' in tokens:
            return redirect(f"{FRONTEND_URL}/auth?error={tokens['error']}")

        access_token = tokens.get('access_token')

        # Get user info
        user_response = requests.get(
            'https://api.github.com/user',
            headers={
                'Authorization': f"Bearer {access_token}",
                'Accept': 'application/json'
            }
        )
        user_info = user_response.json()

        # Get user email (may be private)
        email = user_info.get('email')
        if not email:
            email_response = requests.get(
                'https://api.github.com/user/emails',
                headers={
                    'Authorization': f"Bearer {access_token}",
                    'Accept': 'application/json'
                }
            )
            emails = email_response.json()
            if emails and len(emails) > 0:
                primary_email = next((e for e in emails if e.get('primary')), emails[0])
                email = primary_email.get('email')

        # Store user in session
        session['user'] = {
            'id': str(user_info.get('id')),
            'email': email,
            'name': user_info.get('name') or user_info.get('login'),
            'picture': user_info.get('avatar_url'),
            'provider': 'github'
        }

        # Redirect to frontend with user data
        user_param = json.dumps(session['user'])
        encoded_user = urllib.parse.quote(user_param)
        return redirect(f"{FRONTEND_URL}/app?user={encoded_user}")

    except Exception as e:
        return redirect(f"{FRONTEND_URL}/auth?error={str(e)}")


@app.route('/api/auth/user', methods=['GET'])
def get_current_user():
    """Get current logged in user."""
    user = session.get('user')
    if user:
        return jsonify({"success": True, "user": user})
    return jsonify({"success": False, "user": None})


@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """Logout current user."""
    session.pop('user', None)
    return jsonify({"success": True, "message": "Logged out successfully"})


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
