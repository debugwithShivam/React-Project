import React, { useState } from 'react';
import { projects } from '../data/portfolioData';
import { GithubIcon } from './Icons';
import { 
  ExternalLink, 
  Layers, 
  Terminal, 
  Sparkles, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

const Projects = ({ onSelectProject }) => {
  const [filter, setFilter] = useState('All');

  const categories = ['All', 'Full-Stack / Desktop', 'Frontend', 'Backend'];

  const filteredProjects = filter === 'All' 
    ? projects 
    : projects.filter(p => p.category === filter);

  const flagship = projects.find(p => p.isFlagship);
  const regularProjects = filteredProjects.filter(p => !p.isFlagship || filter !== 'All');

  return (
    <section id="projects" className="projects-section">
      <div className="container">
        
        {/* Section Header */}
        <div className="section-header gs-reveal">
          <div className="section-subtitle">
            <Sparkles size={16} className="subtitle-icon" />
            <span>Real Code & Shipped Architecture</span>
          </div>
          <h2>Featured Production-Style Projects</h2>
          <div className="underline"></div>
          <p className="section-desc">
            Projects demonstrating end-to-end full-stack engineering: schema design, REST APIs, stateless authentication, performance optimization, and cross-platform desktop integration.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="project-filter-tabs gs-reveal">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-tab ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FLAGSHIP PROJECT SPOTLIGHT (Shown when filter is 'All' or matches Flagship category) */}
        {(filter === 'All' || filter === 'Full-Stack / Desktop') && flagship && (
          <div className="flagship-spotlight-card glass-card gs-reveal">
            <div className="flagship-badge-row">
              <span className="flagship-tag">
                <Sparkles size={14} />
                Flagship Project
              </span>
              <span className="platform-tag">Web + Native Electron Desktop</span>
            </div>

            <div className="flagship-grid">
              <div className="flagship-content">
                <h3 className="flagship-title">{flagship.title}</h3>
                <p className="flagship-desc">{flagship.shortDesc}</p>

                {/* Key Metrics Grid */}
                <div className="flagship-metrics-grid">
                  {flagship.metrics.slice(0, 4).map((metric, i) => (
                    <div key={i} className="flagship-metric-item">
                      <CheckCircle2 size={16} className="metric-check-icon" />
                      <span>{metric}</span>
                    </div>
                  ))}
                </div>

                {/* Tech Stack */}
                <div className="tags flagship-tags">
                  {flagship.techStack.map((tech, i) => (
                    <span key={i}>{tech}</span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flagship-actions">
                  <button 
                    onClick={() => onSelectProject(flagship)} 
                    className="btn primary glow-btn"
                  >
                    <Layers size={16} />
                    <span>Deep Dive & Inspect Endpoints</span>
                  </button>

                  <a 
                    href={flagship.githubLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn outline"
                  >
                    <GithubIcon size={16} />
                    <span>View GitHub Repo</span>
                  </a>
                </div>
              </div>

              {/* Architectural Mini-Card / Snapshot */}
              <div className="flagship-tech-visual glass-card">
                <div className="visual-header">
                  <Terminal size={16} className="terminal-icon" />
                  <span>Architecture Highlights</span>
                </div>
                <div className="visual-body">
                  <div className="tech-stat-row">
                    <span className="label">Frontend:</span>
                    <span className="value">React 19 &bull; Redux Toolkit &bull; TanStack Query</span>
                  </div>
                  <div className="tech-stat-row">
                    <span className="label">Code Editor:</span>
                    <span className="value">Monaco Editor (VS Code core)</span>
                  </div>
                  <div className="tech-stat-row">
                    <span className="label">Backend:</span>
                    <span className="value">Express 5 &bull; MongoDB / Mongoose</span>
                  </div>
                  <div className="tech-stat-row">
                    <span className="label">Security:</span>
                    <span className="value">JWT Access/Refresh + Nodemailer OTP</span>
                  </div>
                  <div className="tech-stat-row">
                    <span className="label">Desktop IPC:</span>
                    <span className="value">Electron Multi-Window Pop-outs</span>
                  </div>
                  <div className="tech-stat-row">
                    <span className="label">Offline-First:</span>
                    <span className="value">Dexie.js (IndexedDB local state)</span>
                  </div>
                  <div className="tech-stat-row">
                    <span className="label">Testing:</span>
                    <span className="value">Node.js Built-in Test Runner</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REGULAR PROJECTS GRID */}
        <div className="projects-grid">
          {regularProjects.map((project) => (
            <div key={project.id} className="glass-card project-card gs-reveal">
              <div className="project-card-header">
                <span className="project-category-badge">{project.badge}</span>
                <h3 className="project-title">{project.title}</h3>
              </div>

              <p className="project-desc">{project.shortDesc}</p>

              {/* Key Metrics / Highlights */}
              {project.metrics && (
                <div className="project-card-metrics">
                  {project.metrics.slice(0, 2).map((m, i) => (
                    <div key={i} className="card-metric-bullet">
                      <CheckCircle2 size={14} className="metric-bullet-icon" />
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tech Tags */}
              <div className="tags project-card-tags">
                {project.techStack.slice(0, 5).map((tech, i) => (
                  <span key={i}>{tech}</span>
                ))}
                {project.techStack.length > 5 && (
                  <span className="more-tag">+{project.techStack.length - 5} more</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="project-card-actions">
                <button 
                  onClick={() => onSelectProject(project)} 
                  className="btn outline card-detail-btn"
                >
                  <span>Deep Dive</span>
                  <ArrowRight size={15} />
                </button>

                <a 
                  href={project.githubLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="icon-action-btn"
                  title="View Source on GitHub"
                >
                  <GithubIcon size={18} />
                </a>

                {project.liveDemo && (
                  <a 
                    href={project.liveDemo} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="icon-action-btn"
                    title="Live Link / Demo"
                  >
                    <ExternalLink size={18} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Projects;
