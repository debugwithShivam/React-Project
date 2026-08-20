import React, { useState } from 'react';
import { skillCategories } from '../data/portfolioData';
import { 
  Layout, 
  Server, 
  Database, 
  Cpu, 
  CheckCircle2, 
  Sparkles,
  Search,
  Code
} from 'lucide-react';

const categoryIcons = {
  Layout: Layout,
  Server: Server,
  Database: Database,
  Cpu: Cpu
};

const SkillsMatrix = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = skillCategories.map(cat => {
    if (activeCategory !== 'All' && cat.category !== activeCategory) {
      return null;
    }
    const filteredSkills = cat.skills.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.note.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filteredSkills.length === 0) return null;
    return { ...cat, skills: filteredSkills };
  }).filter(Boolean);

  return (
    <section id="skills" className="skills-section">
      <div className="container">
        
        {/* Section Header */}
        <div className="section-header gs-reveal">
          <div className="section-subtitle">
            <Cpu size={16} className="subtitle-icon" />
            <span>Technical Capabilities</span>
          </div>
          <h2>Technical Skills & Applied Mastery</h2>
          <div className="underline"></div>
          <p className="section-desc">
            Technologies and engineering tools used to build full-stack, tested, and deployable web & desktop applications.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="skills-toolbar gs-reveal">
          <div className="category-filter-buttons">
            <button 
              className={`cat-btn ${activeCategory === 'All' ? 'active' : ''}`}
              onClick={() => setActiveCategory('All')}
            >
              All Domains
            </button>
            {skillCategories.map(cat => (
              <button 
                key={cat.category}
                className={`cat-btn ${activeCategory === cat.category ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.category)}
              >
                {cat.category}
              </button>
            ))}
          </div>

          <div className="skill-search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input 
              type="text"
              placeholder="Search skills or use cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="skill-search-input"
            />
          </div>
        </div>

        {/* Skills Grid */}
        <div className="skills-domains-grid">
          {filteredCategories.map((cat, idx) => {
            const IconComponent = categoryIcons[cat.icon] || Code;
            return (
              <div key={idx} className="glass-card skill-domain-card gs-reveal">
                <div className="domain-card-header">
                  <div className="domain-icon-wrapper" style={{ borderColor: cat.color }}>
                    <IconComponent size={20} style={{ color: cat.color }} />
                  </div>
                  <h3 className="domain-title">{cat.category}</h3>
                </div>

                <div className="skills-items-list">
                  {cat.skills.map((skill, sIdx) => (
                    <div key={sIdx} className="skill-item-row">
                      <div className="skill-main-info">
                        <span className="skill-name">{skill.name}</span>
                        <span className={`skill-level-pill level-${skill.level.toLowerCase()}`}>
                          {skill.level}
                        </span>
                      </div>
                      <div className="skill-applied-note">
                        <span className="note-bullet">&bull;</span>
                        <span>{skill.note}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default SkillsMatrix;
