/**
 * CodeEditor Component
 * Monaco Editor integration with language selection and action buttons
 */

import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { motion } from 'framer-motion';
import './CodeEditor.css';

// Supported programming languages
const LANGUAGES = [
  { id: 'python', name: 'Python', icon: '🐍' },
  { id: 'javascript', name: 'JavaScript', icon: '📜' },
  { id: 'typescript', name: 'TypeScript', icon: '📘' },
  { id: 'java', name: 'Java', icon: '☕' },
  { id: 'cpp', name: 'C++', icon: '⚙️' },
  { id: 'c', name: 'C', icon: '🔧' },
  { id: 'go', name: 'Go', icon: '🐹' },
  { id: 'rust', name: 'Rust', icon: '🦀' }
];

// Monaco Editor theme configuration
const editorTheme = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'C586C0' },
    { token: 'string', foreground: 'CE9178' },
    { token: 'number', foreground: 'B5CEA8' },
    { token: 'function', foreground: 'DCDCAA' },
    { token: 'variable', foreground: '9CDCFE' },
    { token: 'type', foreground: '4EC9B0' }
  ],
  colors: {
    'editor.background': '#0d0d12',
    'editor.foreground': '#d4d4d4',
    'editor.lineHighlightBackground': '#1a1a24',
    'editor.selectionBackground': '#264f78',
    'editorLineNumber.foreground': '#4a4a5a',
    'editorLineNumber.activeForeground': '#c6c6c6',
    'editorCursor.foreground': '#3b82f6',
    'editor.selectionHighlightBackground': '#3b82f620'
  }
};

function CodeEditor({
  code,
  setCode,
  language,
  setLanguage,
  onAnalyze,
  onClear,
  onLoadSample,
  onFileUpload,
  isAnalyzing
}) {
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  /**
   * Handle editor mount
   */
  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;

    // Define custom theme
    monaco.editor.defineTheme('code-review-dark', editorTheme);
    monaco.editor.setTheme('code-review-dark');

    // Focus editor
    editor.focus();
  };

  /**
   * Trigger file input click
   */
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Get line count
   */
  const lineCount = code.split('\n').length;

  return (
    <div className="code-editor-container">
      {/* Toolbar */}
      <div className="editor-toolbar">
        <div className="toolbar-left">
          {/* Language Selector */}
          <div className="language-selector">
            <label htmlFor="language-select" className="sr-only">
              Select Language
            </label>
            <select
              id="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="language-dropdown"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.icon} {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* File Upload */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleUploadClick}
            title="Upload a code file"
          >
            <span className="btn-icon">📁</span>
            Upload
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".py,.js,.ts,.java,.cpp,.c,.go,.rs"
            onChange={onFileUpload}
            className="file-input"
          />

          {/* Load Sample */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={onLoadSample}
            title="Load sample code"
          >
            <span className="btn-icon">📝</span>
            Sample
          </button>
        </div>

        <div className="toolbar-right">
          {/* Stats */}
          <div className="editor-stats">
            <span className="stat">
              <span className="stat-value">{lineCount}</span>
              <span className="stat-label">lines</span>
            </span>
            <span className="stat">
              <span className="stat-value">{code.length}</span>
              <span className="stat-label">chars</span>
            </span>
          </div>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="editor-wrapper">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(value) => setCode(value || '')}
          onMount={handleEditorMount}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
            lineNumbers: 'on',
            glyphMargin: false,
            folding: true,
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 3,
            renderLineHighlight: 'line',
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            tabSize: 4,
            wordWrap: 'on',
            automaticLayout: true,
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: true,
              indentation: true
            }
          }}
        />

        {/* Empty State Overlay */}
        {!code && (
          <motion.div
            className="editor-placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="placeholder-content">
              <span className="placeholder-icon">✨</span>
              <p>Paste your code here or upload a file</p>
              <p className="placeholder-hint">
                Supports Python, JavaScript, Java, C++ and more
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="editor-actions">
        <button
          className="btn btn-secondary"
          onClick={onClear}
          disabled={!code || isAnalyzing}
        >
          <span className="btn-icon">🗑️</span>
          Clear Code
        </button>

        <motion.button
          className="btn btn-primary btn-lg analyze-btn"
          onClick={onAnalyze}
          disabled={!code || isAnalyzing}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isAnalyzing ? (
            <>
              <span className="btn-icon spinner">⚙️</span>
              Analyzing...
            </>
          ) : (
            <>
              <span className="btn-icon">🚀</span>
              Analyze Code
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}

export default CodeEditor;
