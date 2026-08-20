import React, { useState } from 'react';
import { codeSnippets } from '../data/codeSnippets';
import { 
  Code2, 
  Copy, 
  Check, 
  Terminal, 
  FileCode, 
  Cpu, 
  Sparkles,
  Info
} from 'lucide-react';

const CodeShowcase = () => {
  const [selectedSnippetId, setSelectedSnippetId] = useState(codeSnippets[0].id);
  const [copied, setCopied] = useState(false);

  const activeSnippet = codeSnippets.find(s => s.id === selectedSnippetId) || codeSnippets[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="code-showcase" className="code-showcase-section">
      <div className="container">
        
        {/* Section Header */}
        <div className="section-header gs-reveal">
          <div className="section-subtitle">
            <Code2 size={16} className="subtitle-icon" />
            <span>Architecture & Code Standards</span>
          </div>
          <h2>How I Code & Architect Systems</h2>
          <div className="underline"></div>
          <p className="section-desc">
            Clean, maintainable, and defensive code patterns implemented across my full-stack applications.
          </p>
        </div>

        {/* Code Showcase Container */}
        <div className="code-showcase-wrapper glass-card gs-reveal">
          
          {/* Top Bar / Snippet Tabs */}
          <div className="code-tabs-bar">
            <div className="window-dots">
              <span className="dot dot-red"></span>
              <span className="dot dot-yellow"></span>
              <span className="dot dot-green"></span>
            </div>

            <div className="snippet-tabs-list">
              {codeSnippets.map((snippet) => (
                <button
                  key={snippet.id}
                  className={`snippet-tab ${selectedSnippetId === snippet.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedSnippetId(snippet.id);
                    setCopied(false);
                  }}
                >
                  <FileCode size={14} />
                  <span>{snippet.title.split(' ')[0]} {snippet.title.split(' ')[1]}</span>
                </button>
              ))}
            </div>

            <button 
              onClick={handleCopy} 
              className="copy-code-btn"
              title="Copy code snippet"
            >
              {copied ? (
                <>
                  <Check size={14} className="copy-icon-success" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Snippet Meta Info */}
          <div className="snippet-meta-row">
            <div className="snippet-file-badge">
              <Terminal size={14} />
              <code>{activeSnippet.file}</code>
            </div>
            <span className="snippet-category-badge">{activeSnippet.badge}</span>
          </div>

          {/* Code Viewer */}
          <div className="code-viewer-container">
            <pre className="code-block">
              <code>{activeSnippet.code}</code>
            </pre>
          </div>

          {/* Context & Rationale Footer */}
          <div className="code-rationale-box">
            <div className="rationale-header">
              <Info size={16} className="rationale-icon" />
              <h4>Why This Pattern Matters in Production:</h4>
            </div>
            <p className="rationale-text">{activeSnippet.description}</p>
          </div>

        </div>

      </div>
    </section>
  );
};

export default CodeShowcase;
