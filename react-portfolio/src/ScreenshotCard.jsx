const ScreenshotCard = ({ image, title, description }) => {
  return (
    <div
      className="glass-card gs-reveal"
      style={{
        opacity: 0,
        transform: "translateY(40px)",
        marginTop: "2rem",
        overflow: "hidden",
      }}
    >
      <div style={{ marginBottom: "1rem" }}>
        <img
          src={image}
          alt={title}
          style={{
            width: "100%",
            borderRadius: "10px",
            display: "block",
          }}
        />
      </div>

      <h3
        style={{
          color: "var(--accent)",
          marginBottom: "0.7rem",
          fontSize: "1.4rem",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          color: "var(--text-muted)",
          lineHeight: "1.8",
        }}
      >
        {description}
      </p>
    </div>
  );
};

export default ScreenshotCard;