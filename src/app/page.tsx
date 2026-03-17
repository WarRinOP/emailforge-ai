export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg-primary)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 56,
            height: 56,
            background: "linear-gradient(135deg, #a78bfa, #8b5cf6)",
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            fontSize: 28,
          }}
        >
          ✉
        </div>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: "var(--color-text-primary)",
            marginBottom: 8,
          }}
        >
          EmailForge
        </h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: 15 }}>
          AI Email Sequence Builder — Phase 1 Foundation Complete
        </p>
      </div>
    </main>
  );
}
