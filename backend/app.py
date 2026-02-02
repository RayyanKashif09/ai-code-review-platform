"""
LogicGuard - Flask Backend
===========================
This Flask API provides the /analyze endpoint for code review.
It uses Groq AI (FREE) to analyze code and provide feedback.
With MySQL Database Integration for data persistence.
"""

from flask import Flask, request, jsonify, redirect, session
from flask_cors import CORS
import os
import json
import re
import requests
import urllib.parse
from datetime import datetime
from dotenv import load_dotenv
from openai import OpenAI
from models import db, User, Project, AnalysisHistory, UserSettings

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'logicguard-secret-key-2025')
CORS(app, supports_credentials=True, origins=['http://localhost:3000'])

# Database Configuration
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '3306')
DB_NAME = os.getenv('DB_NAME', 'logicguard')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')

# URL encode the password to handle special characters like @
DB_PASSWORD_ENCODED = urllib.parse.quote_plus(DB_PASSWORD)

# Configure SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://{DB_USER}:{DB_PASSWORD_ENCODED}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = False

# Initialize database
db.init_app(app)

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


def get_or_create_user(provider_id, provider, email, name, picture):
    """Get existing user or create new one in database"""
    user = User.query.filter_by(provider=provider, provider_id=provider_id).first()

    if user:
        # Update last login
        user.last_login = datetime.utcnow()
        user.name = name
        user.picture = picture
        db.session.commit()
    else:
        # Create new user
        user = User(
            provider_id=provider_id,
            provider=provider,
            email=email,
            name=name,
            picture=picture
        )
        db.session.add(user)
        db.session.commit()

        # Create default settings for new user
        settings = UserSettings(user_id=user.id)
        db.session.add(settings)
        db.session.commit()

    return user


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify API is running."""
    return jsonify({
        "status": "healthy",
        "message": "LogicGuard API is running",
        "database": "connected"
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
    Saves analysis to database if user is logged in.
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
        user_id = data.get('user_id')  # Optional: to save to history
        project_id = data.get('project_id')  # Optional: to associate with project

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

        # Save to database if user_id provided
        if user_id:
            try:
                analysis = AnalysisHistory(
                    user_id=user_id,
                    project_id=project_id,
                    code_snippet=code,
                    language=language,
                    score=result.get('score'),
                    summary=result.get('summary'),
                    bugs=result.get('bugs'),
                    optimizations=result.get('optimizations'),
                    positives=result.get('positives'),
                    metrics=result.get('metrics')
                )
                db.session.add(analysis)
                db.session.commit()
                result['analysis_id'] = analysis.id
            except Exception as db_error:
                print(f"Database error: {db_error}")
                # Continue even if database save fails

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

        # Save user to database
        db_user = get_or_create_user(
            provider_id=user_info.get('id'),
            provider='google',
            email=user_info.get('email'),
            name=user_info.get('name'),
            picture=user_info.get('picture')
        )

        # Store user in session
        session['user'] = {
            'id': db_user.id,
            'provider_id': user_info.get('id'),
            'email': user_info.get('email'),
            'name': user_info.get('name'),
            'picture': user_info.get('picture'),
            'provider': 'google'
        }

        # Redirect to frontend with user data
        user_param = json.dumps(session['user'])
        encoded_user = urllib.parse.quote(user_param)
        return redirect(f"{FRONTEND_URL}/home?user={encoded_user}")

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

        # Save user to database
        db_user = get_or_create_user(
            provider_id=str(user_info.get('id')),
            provider='github',
            email=email,
            name=user_info.get('name') or user_info.get('login'),
            picture=user_info.get('avatar_url')
        )

        # Store user in session
        session['user'] = {
            'id': db_user.id,
            'provider_id': str(user_info.get('id')),
            'email': email,
            'name': user_info.get('name') or user_info.get('login'),
            'picture': user_info.get('avatar_url'),
            'provider': 'github'
        }

        # Redirect to frontend with user data
        user_param = json.dumps(session['user'])
        encoded_user = urllib.parse.quote(user_param)
        return redirect(f"{FRONTEND_URL}/home?user={encoded_user}")

    except Exception as e:
        return redirect(f"{FRONTEND_URL}/auth?error={str(e)}")


@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user with email and password."""
    data = request.get_json()

    if not data:
        return jsonify({"success": False, "error": "No data provided"}), 400

    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    name = data.get('name', '').strip()

    # Validate input
    if not email or not password:
        return jsonify({"success": False, "error": "Email and password are required"}), 400

    if len(password) < 6:
        return jsonify({"success": False, "error": "Password must be at least 6 characters"}), 400

    # Check if email already exists
    existing_user = User.query.filter_by(email=email, provider='email').first()
    if existing_user:
        return jsonify({"success": False, "error": "Email already registered"}), 400

    try:
        # Create new user
        user = User(
            provider_id=email,  # Use email as provider_id for email auth
            provider='email',
            email=email,
            name=name or email.split('@')[0]  # Use email prefix as name if not provided
        )
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        # Create default settings for new user
        settings = UserSettings(user_id=user.id)
        db.session.add(settings)
        db.session.commit()

        # Return user data (without auto-login, user needs to login separately)
        return jsonify({
            "success": True,
            "message": "Registration successful! Please login.",
            "user": {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'provider': 'email'
            }
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": f"Registration failed: {str(e)}"}), 500


@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login with email and password."""
    data = request.get_json()

    if not data:
        return jsonify({"success": False, "error": "No data provided"}), 400

    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({"success": False, "error": "Email and password are required"}), 400

    # Find user by email
    user = User.query.filter_by(email=email, provider='email').first()

    if not user:
        return jsonify({"success": False, "error": "Invalid email or password"}), 401

    if not user.check_password(password):
        return jsonify({"success": False, "error": "Invalid email or password"}), 401

    # Update last login
    user.last_login = datetime.utcnow()
    db.session.commit()

    # Store user in session
    session['user'] = {
        'id': user.id,
        'provider_id': user.provider_id,
        'email': user.email,
        'name': user.name,
        'picture': user.picture,
        'provider': 'email'
    }

    return jsonify({
        "success": True,
        "message": "Login successful!",
        "user": session['user']
    })


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


# ==================== Project Endpoints ====================

@app.route('/api/projects', methods=['GET'])
def get_projects():
    """Get all projects for the current user."""
    user_id = request.args.get('user_id')
    archived = request.args.get('archived', 'false').lower() == 'true'

    if not user_id:
        return jsonify({"success": False, "error": "User ID required"}), 400

    projects = Project.query.filter_by(user_id=user_id, is_archived=archived).order_by(Project.updated_at.desc()).all()
    return jsonify({
        "success": True,
        "data": [p.to_dict() for p in projects]
    })


@app.route('/api/projects', methods=['POST'])
def create_project():
    """Create a new project."""
    data = request.get_json()

    if not data or not data.get('user_id') or not data.get('name'):
        return jsonify({"success": False, "error": "User ID and project name required"}), 400

    project = Project(
        user_id=data['user_id'],
        name=data['name'],
        description=data.get('description', ''),
        language=data.get('language', 'python')
    )
    db.session.add(project)
    db.session.commit()

    return jsonify({
        "success": True,
        "data": project.to_dict()
    })


@app.route('/api/projects/<int:project_id>', methods=['DELETE'])
def delete_project(project_id):
    """Delete a project."""
    project = Project.query.get(project_id)
    if not project:
        return jsonify({"success": False, "error": "Project not found"}), 404

    db.session.delete(project)
    db.session.commit()

    return jsonify({"success": True, "message": "Project deleted"})


@app.route('/api/projects/<int:project_id>/archive', methods=['PUT'])
def archive_project(project_id):
    """Archive a project."""
    project = Project.query.get(project_id)
    if not project:
        return jsonify({"success": False, "error": "Project not found"}), 404

    project.is_archived = True
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Project archived",
        "data": project.to_dict()
    })


@app.route('/api/projects/<int:project_id>/unarchive', methods=['PUT'])
def unarchive_project(project_id):
    """Unarchive/restore a project."""
    project = Project.query.get(project_id)
    if not project:
        return jsonify({"success": False, "error": "Project not found"}), 404

    project.is_archived = False
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Project restored",
        "data": project.to_dict()
    })


# ==================== History Endpoints ====================

@app.route('/api/history', methods=['GET'])
def get_history():
    """Get analysis history for the current user."""
    user_id = request.args.get('user_id')
    limit = request.args.get('limit', 20, type=int)

    if not user_id:
        return jsonify({"success": False, "error": "User ID required"}), 400

    history = AnalysisHistory.query.filter_by(user_id=user_id)\
        .order_by(AnalysisHistory.created_at.desc())\
        .limit(limit)\
        .all()

    return jsonify({
        "success": True,
        "data": [h.to_dict() for h in history]
    })


@app.route('/api/history/<int:analysis_id>', methods=['GET'])
def get_analysis_detail(analysis_id):
    """Get detailed analysis result."""
    analysis = AnalysisHistory.query.get(analysis_id)
    if not analysis:
        return jsonify({"success": False, "error": "Analysis not found"}), 404

    # Return full code snippet for detail view
    result = analysis.to_dict()
    result['code_snippet'] = analysis.code_snippet

    return jsonify({
        "success": True,
        "data": result
    })


@app.route('/api/projects/<int:project_id>/analyses', methods=['GET'])
def get_project_analyses(project_id):
    """Get all analyses for a specific project."""
    project = Project.query.get(project_id)
    if not project:
        return jsonify({"success": False, "error": "Project not found"}), 404

    analyses = AnalysisHistory.query.filter_by(project_id=project_id)\
        .order_by(AnalysisHistory.created_at.desc())\
        .all()

    # Return full code snippet for each analysis
    results = []
    for analysis in analyses:
        result = analysis.to_dict()
        result['code_snippet'] = analysis.code_snippet
        results.append(result)

    return jsonify({
        "success": True,
        "data": {
            "project": project.to_dict(),
            "analyses": results
        }
    })


# ==================== Chat with Code Endpoint ====================

CODE_CHAT_PROMPT = """You are an expert code assistant helping users understand their code. The user has uploaded the following {language} code and is asking a question about it.

CODE:
```{language}
{code}
```

USER'S QUESTION: {question}

Provide a helpful, clear, and beginner-friendly response. If the question is about:
- Performance: Explain what might be slow and why
- Bugs: Identify potential issues and explain them
- Understanding: Explain how the code works
- Improvements: Suggest specific improvements

Keep your response concise but thorough. Use code examples when helpful.
Do NOT return JSON - just provide a natural language response that directly answers the user's question."""


@app.route('/api/chat', methods=['POST'])
def chat_with_code():
    """
    Chat endpoint for asking questions about code.
    Uses AI to answer questions based on the provided code context.
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "error": "No data provided"
            }), 400

        code = data.get('code', '').strip()
        language = data.get('language', 'python').lower()
        question = data.get('question', '').strip()
        chat_history = data.get('chat_history', [])  # Previous messages for context

        if not code:
            return jsonify({
                "success": False,
                "error": "No code provided"
            }), 400

        if not question:
            return jsonify({
                "success": False,
                "error": "No question provided"
            }), 400

        # Check if API key is configured
        if not os.getenv('GROQ_API_KEY'):
            return jsonify({
                "success": False,
                "error": "Groq API key not configured"
            }), 500

        # Build messages for chat completion
        messages = [
            {
                "role": "system",
                "content": "You are an expert code assistant. Provide helpful, clear, and beginner-friendly responses about code. Be concise but thorough."
            }
        ]

        # Add chat history for context (last 5 exchanges to keep token count reasonable)
        for msg in chat_history[-10:]:
            messages.append({
                "role": msg.get("role", "user"),
                "content": msg.get("content", "")
            })

        # Add current question with code context
        prompt = CODE_CHAT_PROMPT.format(language=language, code=code, question=question)
        messages.append({
            "role": "user",
            "content": prompt
        })

        # Call Groq API
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.5,
            max_tokens=1500
        )

        answer = response.choices[0].message.content.strip()

        return jsonify({
            "success": True,
            "data": {
                "answer": answer,
                "question": question
            }
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ==================== AI Code Generation Endpoint ====================

CODE_GENERATION_PROMPT = """You are an expert programmer. Generate clean, well-commented, production-ready code based on the user's request.

USER'S REQUEST: {prompt}

PROGRAMMING LANGUAGE: {language}

Requirements:
1. Write clean, readable, and well-structured code
2. Include helpful comments explaining key parts
3. Follow best practices for the specified language
4. Handle edge cases appropriately
5. Make the code production-ready

Return ONLY the code without any additional explanation or markdown formatting. The code should be ready to copy and use directly."""


@app.route('/api/generate', methods=['POST'])
def generate_code():
    """
    AI Code Generation endpoint.
    Generates code based on user's natural language prompt.
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "error": "No data provided"
            }), 400

        prompt = data.get('prompt', '').strip()
        language = data.get('language', 'python').lower()

        if not prompt:
            return jsonify({
                "success": False,
                "error": "No prompt provided"
            }), 400

        # Check if API key is configured
        if not os.getenv('GROQ_API_KEY'):
            return jsonify({
                "success": False,
                "error": "Groq API key not configured"
            }), 500

        # Build the generation prompt
        generation_prompt = CODE_GENERATION_PROMPT.format(prompt=prompt, language=language)

        # Call Groq API
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": f"You are an expert {language} programmer. Generate clean, production-ready code. Return ONLY code without markdown formatting or explanations."
                },
                {
                    "role": "user",
                    "content": generation_prompt
                }
            ],
            temperature=0.3,
            max_tokens=2000
        )

        generated_code = response.choices[0].message.content.strip()

        # Remove markdown code blocks if present
        if generated_code.startswith('```'):
            lines = generated_code.split('\n')
            # Remove first line (```language) and last line (```)
            if lines[-1].strip() == '```':
                lines = lines[1:-1]
            else:
                lines = lines[1:]
            generated_code = '\n'.join(lines)

        return jsonify({
            "success": True,
            "data": {
                "code": generated_code,
                "language": language,
                "prompt": prompt
            }
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ==================== Settings Endpoints ====================

@app.route('/api/settings', methods=['GET'])
def get_settings():
    """Get user settings."""
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"success": False, "error": "User ID required"}), 400

    settings = UserSettings.query.filter_by(user_id=user_id).first()
    if not settings:
        # Create default settings
        settings = UserSettings(user_id=user_id)
        db.session.add(settings)
        db.session.commit()

    return jsonify({
        "success": True,
        "data": settings.to_dict()
    })


@app.route('/api/settings', methods=['PUT'])
def update_settings():
    """Update user settings."""
    data = request.get_json()

    if not data or not data.get('user_id'):
        return jsonify({"success": False, "error": "User ID required"}), 400

    settings = UserSettings.query.filter_by(user_id=data['user_id']).first()
    if not settings:
        settings = UserSettings(user_id=data['user_id'])
        db.session.add(settings)

    if 'default_language' in data:
        settings.default_language = data['default_language']
    if 'email_notifications' in data:
        settings.email_notifications = data['email_notifications']
    if 'theme' in data:
        settings.theme = data['theme']

    db.session.commit()

    return jsonify({
        "success": True,
        "data": settings.to_dict()
    })


if __name__ == '__main__':
    # Create tables if they don't exist
    with app.app_context():
        try:
            db.create_all()
            print("Database tables created/verified successfully!")
        except Exception as e:
            print(f"Database connection error: {e}")
            print("Make sure MySQL is running and the database 'logicguard' exists.")
            print("Run the database.sql script in MySQL Workbench first!")

    # Run the Flask development server
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'

    print(f"""
    ==============================================
              LogicGuard API

         Running on: http://localhost:{port}
         Debug Mode: {debug}
         AI Model: Groq Llama 3.3 70B (FREE)
         Database: MySQL (logicguard)
    ==============================================
    """)

    app.run(host='0.0.0.0', port=port, debug=debug)
