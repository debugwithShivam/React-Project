import { useRef,useEffect,useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import gsap from 'gsap';

gsap.registerPlugin(ScrollTrigger);
// --- Home Route (Original Portfolio Recreated) ---
const Home = () => {
    useEffect(() => {
        // Hero Entry Animation
        gsap.to(".animate-up", {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            stagger: 0.2
        });

        // Scroll reveal animations
        const revealElements = gsap.utils.toArray(".gs-reveal");
        revealElements.forEach((elem) => {
            gsap.to(elem, {
                scrollTrigger: {
                    trigger: elem,
                    start: "top 85%",
                    toggleActions: "play none none reverse",
                },
                y: 0,
                opacity: 1,
                duration: 0.8,
                ease: "power2.out"
            });
        });

        // Refresh ScrollTrigger when moving between pages
        ScrollTrigger.refresh();
    }, []);

    return (
        <>
            {/* Hero Section */}
            <section id="home" className="hero">
                <div className="hero-content">
                    <h2 className="animate-up" style={{ opacity: 0, transform: 'translateY(30px)' }}>Hello, I'm</h2>
                    <h1 className="animate-up" style={{ opacity: 0, transform: 'translateY(30px)' }}>Shivam Pandey</h1>
                    <p className="animate-up" style={{ opacity: 0, transform: 'translateY(30px)' }}>Aspiring Full-Stack Developer creating scalable web applications & aesthetic UIs.</p>
                    <div className="cta-buttons animate-up" style={{ opacity: 0, transform: 'translateY(30px)' }}>
                        <a href="#projects" className="btn primary">View My Work</a>
                        <a href="#about" className="btn secondary">About Me</a>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="about">
                <div className="container section-header gs-reveal" style={{ opacity: 0, transform: 'translateY(40px)' }}>
                    <h2>About Me</h2>
                    <div className="underline"></div>
                </div>
                <div className="container about-content gs-reveal" style={{ opacity: 0, transform: 'translateY(40px)' }}>
                    <div className="glass-card about-card">
                        <p>Hi, I'm Shivam 👋 Aspiring Full-Stack Developer focused on building scalable web applications. Currently sharpening my skills in <strong>React, Node.js, and MongoDB</strong>.</p>
                        <p>I am passionate about problem-solving, clean code, continuous learning, and exploring modern aesthetics with tools like Three.js and GSAP.</p>
                    </div>
                </div>
            </section>

            {/* Skills Section */}
            <section id="skills" className="skills">
                <div className="container section-header gs-reveal" style={{ opacity: 0, transform: 'translateY(40px)' }}>
                    <h2>Technical Skills</h2>
                    <div className="underline"></div>
                </div>
                <div className="container skills-grid">
                    <div className="glass-card skill-card gs-reveal" style={{ opacity: 0, transform: 'translateY(40px)' }}>
                        <h3>Frontend</h3>
                        <div className="tags">
                            <span>React</span><span>Redux</span><span>JavaScript (ES6+)</span>
                            <span>Three.js</span><span>HTML5</span><span>CSS3</span>
                            <span>Microfrontends</span><span>Accessibility</span><span>I18Next</span>
                        </div>
                    </div>
                    <div className="glass-card skill-card gs-reveal" style={{ opacity: 0, transform: 'translateY(40px)' }}>
                        <h3>Backend</h3>
                        <div className="tags">
                            <span>Node.js</span><span>Express</span><span>REST APIs</span>
                        </div>
                    </div>
                    <div className="glass-card skill-card gs-reveal" style={{ opacity: 0, transform: 'translateY(40px)' }}>
                        <h3>Database</h3>
                        <div className="tags">
                            <span>MongoDB</span><span>SQL Frameworks</span>
                        </div>
                    </div>
                    <div className="glass-card skill-card gs-reveal" style={{ opacity: 0, transform: 'translateY(40px)' }}>
                        <h3>Tools & Other</h3>
                        <div className="tags">
                            <span>Git & GitHub</span><span>Webpack/Vite</span>
                            <span>Networking</span><span>Virtualization</span><span>Service Worker</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Projects Section */}
            <section id="projects" className="projects">
                <div className="container section-header gs-reveal" style={{ opacity: 0, transform: 'translateY(40px)' }}>
                    <h2>Featured Projects</h2>
                    <div className="underline"></div>
                </div>
                <div className="container projects-grid">
                    <div className="glass-card project-card gs-reveal" style={{ opacity: 0, transform: 'translateY(40px)' }}>
                        <div className="project-content">
                            <h3>React-Project</h3>
                            <p>A scalable and production-ready React application built with modern best practices, reusable component architecture, and clean state management.</p>
                            <div className="project-tags">
                                <span>React</span><span>JavaScript</span>
                            </div>
                        </div>
                        <div className="project-links">
                            <a href="https://github.com/debugwithShivam/React-Project" target="_blank" rel="noreferrer" className="btn outline">View on GitHub</a>
                        </div>
                    </div>

                    <div className="glass-card project-card gs-reveal" style={{ opacity: 0, transform: 'translateY(40px)' }}>
                        <div className="project-content">
                            <h3>React-Basic-projects</h3>
                            <p>A collection of foundational React projects documenting my learning journey, strengthening core concepts and real-world UI applications.</p>
                            <div className="project-tags">
                                <span>React</span><span>UI/UX</span>
                            </div>
                        </div>
                        <div className="project-links">
                            <a href="https://github.com/debugwithShivam/React-Basic-projects" target="_blank" rel="noreferrer" className="btn outline">View on GitHub</a>
                        </div>
                    </div>

                    <div className="glass-card project-card gs-reveal" style={{ opacity: 0, transform: 'translateY(40px)' }}>
                        <div className="project-content">
                            <h3>Local NoteBook App</h3>
                            <p>A local web application built showing my ability to build utility applications and handle local storage or basic data structures.</p>
                            <div className="project-tags">
                                <span>HTML</span><span>CSS</span><span>JS</span>
                            </div>
                        </div>
                        <div className="project-links">
                            <span className="local-badge">Local Workspace</span>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Home