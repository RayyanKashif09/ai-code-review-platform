import React from 'react';
import Editor from '@monaco-editor/react';

function CodeEditor({ code, setCode, language, setLanguage, onAnalyze, onClear, onLoadSample, isAnalyzing }) {
  const languages = [
    { id: 'python', name: 'Python' },
    { id: 'javascript', name: 'JavaScript' },
    { id: 'typescript', name: 'TypeScript' },
    { id: 'java', name: 'Java' },
    { id: 'cpp', name: 'C++' },
    { id: 'c', name: 'C' },
    { id: 'go', name: 'Go' },
    { id: 'rust', name: 'Rust' }
  ];

  return (
    <div className="code-editor">
      <div className="editor-toolbar">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="language-select"
        >
          {languages.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.name}
            </option>
          ))}
        </select>
        <button className="btn btn-secondary" onClick={onLoadSample}>
          Sample
        </button>
        <span className="editor-stats">
          {code.split('\n').length} lines | {code.length} chars
        </span>
      </div>

      <div className="editor-container">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(value) => setCode(value || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on'
          }}
        />
      </div>

      <div className="editor-actions">
        <button className="btn btn-secondary" onClick={onClear}>
          Clear Code
        </button>
        <button
          className="btn btn-primary"
          onClick={onAnalyze}
          disabled={isAnalyzing || !code.trim()}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Code'}
        </button>
      </div>
    </div>
  );
}

export default CodeEditor;
