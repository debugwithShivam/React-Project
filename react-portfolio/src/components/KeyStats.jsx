import React from 'react';
import { keyMetrics } from '../data/portfolioData';
import { ShieldCheck, Zap, Layers, Server, Activity } from 'lucide-react';

const icons = [Layers, Server, Zap, Activity, ShieldCheck];

const KeyStats = () => {
  return (
    <section className="stats-section">
      <div className="container">
        <div className="stats-grid">
          {keyMetrics.map((item, index) => {
            const Icon = icons[index % icons.length];
            return (
              <div key={index} className="glass-card stat-card gs-reveal">
                <div className="stat-icon-wrapper">
                  <Icon size={20} className="stat-icon" />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{item.value}</div>
                  <div className="stat-label">{item.label}</div>
                  <div className="stat-sub">{item.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default KeyStats;
