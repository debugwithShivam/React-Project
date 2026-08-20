import React from 'react';
import { educationAndJourney } from '../data/portfolioData';
import { 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Award, 
  CheckCircle2,
  Sparkles,
  MapPin
} from 'lucide-react';

const Education = () => {
  return (
    <section id="journey" className="education-section">
      <div className="container">
        
        {/* Section Header */}
        <div className="section-header gs-reveal">
          <div className="section-subtitle">
            <GraduationCap size={16} className="subtitle-icon" />
            <span>Academic Background & Growth</span>
          </div>
          <h2>Education & Self-Taught Journey</h2>
          <div className="underline"></div>
          <p className="section-desc">
            A strong foundation in computer science principles coupled with disciplined, hands-on full-stack product building.
          </p>
        </div>

        {/* Timeline Cards */}
        <div className="education-grid">
          {educationAndJourney.map((item, idx) => (
            <div key={idx} className="glass-card education-card gs-reveal">
              <div className="edu-card-top">
                <div className="edu-icon-badge">
                  {item.type === 'education' ? (
                    <GraduationCap size={22} className="edu-icon" />
                  ) : (
                    <BookOpen size={22} className="edu-icon" />
                  )}
                </div>
                <div className="edu-badge-tag">{item.badge}</div>
              </div>

              <h3 className="edu-title">{item.title}</h3>
              <h4 className="edu-institution">{item.institution}</h4>

              <div className="edu-period">
                <Calendar size={14} className="period-icon" />
                <span>{item.period}</span>
              </div>

              <p className="edu-desc">{item.description}</p>

              <div className="edu-coursework-section">
                <h5 className="coursework-heading">Key Subjects & Focus Areas:</h5>
                <ul className="coursework-list">
                  {item.coursework.map((course, cIdx) => (
                    <li key={cIdx} className="coursework-item">
                      <CheckCircle2 size={14} className="course-check" />
                      <span>{course}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Education;
