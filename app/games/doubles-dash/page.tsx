import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Doubles Dash',
  robots: { index: false, follow: false },
};

export default function DoublesDashPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #fffbf2 0%, #fff5e1 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.25rem',
      }}
    >
      <div style={{ maxWidth: '32rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#4e342e', margin: '0 0 0.75rem' }}>
          Doubles Dash is not available
        </h1>
        <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: '#795548', margin: '0 0 1.5rem' }}>
          This game is not on the games list.
        </p>
        <Link
          href="/games"
          style={{
            display: 'inline-block',
            background: '#ffb300',
            color: '#4e342e',
            fontWeight: 800,
            textDecoration: 'none',
            borderRadius: '999px',
            padding: '0.85rem 1.4rem',
          }}
        >
          Back to games
        </Link>
      </div>
    </main>
  );
}
