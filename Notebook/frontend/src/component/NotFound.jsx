import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="empty-state">
      <p className="eyebrow">404</p>
      <h1>That page has gone missing.</h1>
      <p>Return to your workspace and keep your day moving.</p>
      <Link className="button button-primary" to="/">
        Go to notes
      </Link>
    </section>
  );
}
