import React, { useEffect, useState } from 'react';
import { GithubIcon } from './Icons';
import { 
  X, 
  ExternalLink, 
  CheckCircle2, 
  Server, 
  Layers, 
  Cpu, 
  Image as ImageIcon,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const ProjectModal = ({ project, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'endpoints' | 'screenshots'

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  if (!project) return null;

  const hasEndpoints = project.endpoints && project.endpoints.length > 0;
  const hasScreenshots = project.screenshots && project.screenshots.length > 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container glass-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="project-badge">{project.badge}</span>
            <h2 className="modal-title">{project.title}</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Modal Subnav Tabs */}
        <div className="modal-tabs">
          <button 
            className={`modal-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Layers size={16} />
            <span>Architecture & Features</span>
          </button>
          
          {hasEndpoints && (
            <button 
              className={`modal-tab ${activeTab === 'endpoints' ? 'active' : ''}`}
              onClick={() => setActiveTab('endpoints')}
            >
              <Server size={16} />
              <span>API Endpoints ({project.endpoints.length})</span>
            </button>
          )}

          {hasScreenshots && (
            <button 
              className={`modal-tab ${activeTab === 'screenshots' ? 'active' : ''}`}
              onClick={() => setActiveTab('screenshots')}
            >
              <ImageIcon size={16} />
              <span>UI Screenshots ({project.screenshots.length})</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="modal-section-content">
              {/* Short Description */}
              <div className="overview-summary">
                <p>{project.shortDesc}</p>
              </div>

              {/* Verified Metrics */}
              {project.metrics && (
                <div className="modal-metrics-box">
                  <h4 className="box-title">
                    <Sparkles size={16} className="title-icon" />
                    Verified Technical Achievements & Metrics
                  </h4>
                  <ul className="metrics-list">
                    {project.metrics.map((metric, i) => (
                      <li key={i} className="metric-item">
                        <CheckCircle2 size={16} className="metric-check" />
                        <span>{metric}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Architectural Highlights */}
              {project.highlights && (
                <div className="modal-highlights">
                  <h4 className="box-title">
                    <Cpu size={16} className="title-icon" />
                    Engineering Deep Dive & Implementation Details
                  </h4>
                  <div className="highlights-grid">
                    {project.highlights.map((h, i) => (
                      <div key={i} className="highlight-card">
                        <h5 className="highlight-title">
                          <ChevronRight size={16} className="chevron-icon" />
                          {h.title}
                        </h5>
                        <p className="highlight-desc">{h.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tech Stack Pills */}
              <div className="modal-tech-stack">
                <h4 className="box-title">Technologies Used</h4>
                <div className="tags">
                  {project.techStack.map((tech, i) => (
                    <span key={i}>{tech}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: API ENDPOINTS */}
          {activeTab === 'endpoints' && hasEndpoints && (
            <div className="modal-section-content">
              <div className="endpoints-intro">
                <p>
                  All endpoints were designed with custom middleware authentication, token verification, and integration tested using Node.js's native test runner (<code>node --test</code>).
                </p>
              </div>

              <div className="endpoints-table-wrapper">
                <table className="endpoints-table">
                  <thead>
                    <tr>
                      <th>Method</th>
                      <th>Endpoint Route</th>
                      <th>Description & Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.endpoints.map((ep, i) => (
                      <tr key={i}>
                        <td>
                          <span className={`method-badge method-${ep.method.toLowerCase()}`}>
                            {ep.method}
                          </span>
                        </td>
                        <td>
                          <code className="endpoint-path">{ep.path}</code>
                        </td>
                        <td className="endpoint-desc">{ep.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: SCREENSHOTS */}
          {activeTab === 'screenshots' && hasScreenshots && (
            <div className="modal-section-content">
              <div className="screenshots-gallery">
                {project.screenshots.map((s, i) => (
                  <div key={i} className="screenshot-item-card glass-card">
                    <div className="screenshot-img-wrapper">
                      <img src={s.img} alt={s.title} className="screenshot-img" />
                    </div>
                    <div className="screenshot-info">
                      <h4 className="screenshot-title">{s.title}</h4>
                      <p className="screenshot-desc">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <a 
            href={project.githubLink} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn primary"
          >
            <GithubIcon size={16} />
            <span>View Source on GitHub</span>
          </a>

          {project.liveDemo && (
            <a 
              href={project.liveDemo} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn outline"
            >
              <ExternalLink size={16} />
              <span>Project Link</span>
            </a>
          )}

          <button onClick={onClose} className="btn secondary modal-dismiss-btn">
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProjectModal;
