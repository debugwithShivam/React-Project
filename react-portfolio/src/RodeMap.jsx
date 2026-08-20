import usePageReveal from "./usePageReveal";
const Roadmap = () => {
    usePageReveal();
    return (
        <div className="page-wrapper container detail-section">
            <div className="section-header page-reveal" style={{ opacity: 0, transform: 'translateY(40px)' }}>
                <h2>Learning & Technology Roadmap</h2>
                <div className="underline"></div>
            </div>

            <div className="glass-card gs-reveal" style={{ opacity: 0, transform: 'translateY(40px)' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Continuous improvement is critical in tech. Here are the core areas and technologies I am actively studying or plan to master.</p>

                <div className="roadmap-timeline">
                    <div className="timeline-item gs-reveal" style={{ opacity: 0, transform: 'translateY(30px)' }}>
                        <h3>Backend Development (In-Depth)</h3>
                        <p>Moving beyond basic CRUD to architectural patterns, microservices, scalability, caching, and robust security practices.</p>
                    </div>

                    <div className="timeline-item gs-reveal" style={{ opacity: 0, transform: 'translateY(30px)' }}>
                        <h3>SQL Optimization & Advanced DB Concepts</h3>
                        <p>Deep dive into relational databases, indexing strategies, complex joins, subqueries, and database performance tuning.</p>
                    </div>

                    <div className="timeline-item gs-reveal" style={{ opacity: 0, transform: 'translateY(30px)' }}>
                        <h3>Redis</h3>
                        <p>Mastering in-memory data structures for caching, rate limiting, and pub/sub to improve application speed and scale.</p>
                    </div>

                    <div className="timeline-item gs-reveal" style={{ opacity: 0, transform: 'translateY(30px)' }}>
                        <h3>RADIUS / AAA Protocols</h3>
                        <p>Understanding Authentication, Authorization, and Accounting (AAA) systems for deep network and identity management.</p>
                    </div>

                    <div className="timeline-item gs-reveal" style={{ opacity: 0, transform: 'translateY(30px)' }}>
                        <h3>Industry Relevant Additions</h3>
                        <p>Exploring Docker / Containerization, CI/CD pipelines basics (GitHub Actions / Jenkins), and core AWS Services (EC2, S3, RDS).</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Roadmap