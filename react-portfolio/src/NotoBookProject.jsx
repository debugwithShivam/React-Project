import usePageReveal from "./usePageReveal";
const NotebookProject = () => {
    usePageReveal();
    return (
        <div className="page-wrapper container detail-section">
            <div className="section-header page-reveal" style={{ opacity: 0, transform: 'translateY(40px)' }}>
                <h2>Future Idea: Student Notebook App</h2>
                <div className="underline"></div>
            </div>

            <div className="glass-card gs-reveal" style={{ opacity: 0, transform: 'translateY(40px)' }}>
                <p style={{ lineHeight: '1.8', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    Designed primarily as a learning tool for students, this application aims to replace physical notebooks with an interactive, robust Web platform. Users can create multiple notebooks, each containing multiple pages.
                </p>

                <h3 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>Key Technologies & Concepts</h3>
                <div className="tags" style={{ marginBottom: '2rem' }}>
                    <span>Vite</span>
                    <span>Protective Routing</span>
                    <span>Service Workers</span>
                    <span>Web Manifest</span>
                    <span>Three.js (3D Interactions)</span>
                </div>

                <div className="projects-grid" style={{ gridTemplateColumns: 'minmax(250px, 1fr)' }}>
                    <div className="glass-card" style={{ background: 'rgba(0, e5, ff, 0.05)' }}>
                        <h4 style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }}>Core Feature</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Offline support via Service Workers and installable PWA characteristics using Web Manifests.</p>
                    </div>
                    <div className="glass-card" style={{ background: 'rgba(138, 43, 226, 0.05)' }}>
                        <h4 style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>3D Interactive Elements</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Three.js driven visualization to make learning and note interaction engaging and aesthetic.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotebookProject