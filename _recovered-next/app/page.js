/**
 * Placeholder index page. The eventual user-facing routes are
 * /contributor/<handle> and /quote/<slug>. This root page exists mostly
 * so the deploy has something to render; it'll evolve into a basic
 * library-index view in a later phase.
 */

export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: 32,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 22,
          color: 'var(--brass-mid)',
          letterSpacing: '0.4em',
          marginBottom: 8,
        }}
      >
        ⁂
      </div>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontWeight: 500,
          fontSize: 48,
          color: 'var(--brass-deep)',
          margin: '0 0 12px',
          letterSpacing: '0.01em',
        }}
      >
        Dialecta
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-reading)',
          fontStyle: 'italic',
          color: 'var(--soft)',
          fontSize: 14,
          margin: 0,
          maxWidth: 480,
          lineHeight: 1.7,
        }}
      >
        Path C scaffold is up. The library and contributor surfaces will
        live here as the migration progresses.
      </p>
    </main>
  );
}
