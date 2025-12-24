# AI Smart Code Review Platform

A modern, professional web application that provides AI-powered code review and analysis. Built with React.js frontend and Python Flask backend, powered by GPT-4 for intelligent code analysis.

![Platform Preview](https://via.placeholder.com/800x400/0a0a0f/3b82f6?text=AI+Code+Review+Platform)

## Features

- **AI-Powered Analysis**: Get intelligent code review using GPT-4
- **Bug Detection**: Identify syntax errors, logical bugs, and potential runtime issues
- **Optimization Suggestions**: Receive performance improvement recommendations
- **Code Quality Score**: Get a 0-100 quality score with detailed metrics
- **Beginner-Friendly Explanations**: Issues explained in simple, student-friendly language
- **Multi-Language Support**: Python, JavaScript, TypeScript, Java, C++, C, Go, Rust
- **Modern Dark Theme**: Professional developer-style UI
- **Monaco Editor**: VS Code-like code editing experience
- **File Upload**: Support for .py, .js, .java, .cpp files
- **Download Reports**: Export analysis results as JSON

## Tech Stack

### Frontend
- **React.js 18** - UI framework
- **Monaco Editor** - VS Code-based code editor
- **Framer Motion** - Smooth animations
- **Axios** - HTTP client
- **Lucide React** - Icon library

### Backend
- **Python Flask** - REST API framework
- **Flask-CORS** - Cross-origin resource sharing
- **OpenAI API** - GPT-4 for code analysis
- **python-dotenv** - Environment variables

## Project Structure

```
ai-code-review-platform/
├── backend/
│   ├── app.py              # Flask API server
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment variables template
├── frontend/
│   ├── public/
│   │   └── index.html      # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.js           # App header
│   │   │   ├── Header.css
│   │   │   ├── CodeEditor.js       # Monaco editor wrapper
│   │   │   ├── CodeEditor.css
│   │   │   ├── ReviewResults.js    # Analysis results display
│   │   │   ├── ReviewResults.css
│   │   │   ├── LoadingState.js     # Loading animation
│   │   │   ├── LoadingState.css
│   │   │   ├── EmptyState.js       # Empty state placeholder
│   │   │   ├── EmptyState.css
│   │   │   ├── Notification.js     # Toast notifications
│   │   │   └── Notification.css
│   │   ├── styles/
│   │   │   ├── index.css           # Global styles & variables
│   │   │   └── App.css             # App layout styles
│   │   ├── App.js                  # Main app component
│   │   └── index.js                # React entry point
│   └── package.json        # Node dependencies
└── README.md               # This file
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- OpenAI API key

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd ai-code-review-platform/backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv

   # Windows
   venv\Scripts\activate

   # macOS/Linux
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create `.env` file from template:
   ```bash
   cp .env.example .env
   ```

5. Add your OpenAI API key to `.env`:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

6. Start the Flask server:
   ```bash
   python app.py
   ```

   The API will be running at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ai-code-review-platform/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

   The app will open at `http://localhost:3000`

## API Endpoints

### POST /api/analyze
Analyze code and return review results.

**Request Body:**
```json
{
  "code": "def hello():\n    print('Hello World')",
  "language": "python"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 85,
    "summary": "Code is well-structured with minor improvements possible.",
    "bugs": [
      {
        "severity": "low",
        "line": 2,
        "title": "Missing docstring",
        "description": "Functions should have docstrings.",
        "suggestion": "Add a docstring explaining the function purpose."
      }
    ],
    "optimizations": [
      {
        "category": "best-practices",
        "title": "Use f-strings",
        "description": "Modern Python prefers f-strings for formatting.",
        "code_example": "print(f'Hello World')"
      }
    ],
    "positives": ["Clear function naming"],
    "metrics": {
      "complexity": "low",
      "readability": 90,
      "maintainability": 85,
      "security": 100
    }
  }
}
```

### GET /api/health
Health check endpoint.

### GET /api/supported-languages
Get list of supported programming languages.

## AI Prompt Logic

The AI analyzes code using this structured prompt:

1. **Bug Detection**: Identifies syntax errors, logical bugs, and potential runtime issues
2. **Optimization Suggestions**: Recommends performance improvements and best practices
3. **Readability Analysis**: Evaluates code structure and naming conventions
4. **Security Review**: Checks for common security vulnerabilities
5. **Quality Scoring**: Assigns a 0-100 score based on overall code quality
6. **Beginner-Friendly Explanations**: Explains issues in simple, educational language

## Architecture Overview

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│                  │     │                  │     │                  │
│   React.js       │────▶│   Flask API      │────▶│   OpenAI GPT-4   │
│   Frontend       │◀────│   Backend        │◀────│   API            │
│                  │     │                  │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
     Port 3000               Port 5000

1. User enters code in Monaco Editor
2. Frontend sends POST request to /api/analyze
3. Backend formats code into structured prompt
4. GPT-4 analyzes code and returns JSON response
5. Backend parses response and sends to frontend
6. Frontend displays results with animations
```

## Color Scheme

| Purpose      | Color        | Hex       |
|--------------|--------------|-----------|
| Background   | Dark Gray    | `#0a0a0f` |
| Card BG      | Dark Blue    | `#16161e` |
| Accent       | Blue         | `#3b82f6` |
| Success      | Green        | `#22c55e` |
| Warning      | Yellow       | `#f59e0b` |
| Error        | Red          | `#ef4444` |
| Text Primary | Light Gray   | `#f8fafc` |

## Environment Variables

### Backend (.env)
```
OPENAI_API_KEY=sk-...     # Required: OpenAI API key
FLASK_DEBUG=True          # Optional: Enable debug mode
PORT=5000                 # Optional: Server port
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api  # Optional: API URL
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Acknowledgments

- OpenAI for GPT-4 API
- Monaco Editor team
- React.js community
- Framer Motion for animations
