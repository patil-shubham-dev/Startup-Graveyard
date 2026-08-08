import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const PAPER = '#faf9f6';
const INK = '#1b1a17';
const INK_MUTE = '#63615a';
const LINE = '#e7e4dc';
const ACCENT = '#7a2416';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'Failure leaves clues. The archive preserves them.';
    const type = searchParams.get('type') || 'CASE_STUDY';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: PAPER,
            position: 'relative',
          }}
        >
          {/* Hairline frame */}
          <div
            style={{
              position: 'absolute',
              top: 24,
              left: 24,
              right: 24,
              bottom: 24,
              border: `1px solid ${LINE}`,
            }}
          />

          {/* Top label */}
          <div
            style={{
              position: 'absolute',
              top: 42,
              left: 48,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div style={{ width: 10, height: 10, backgroundColor: ACCENT }} />
            <div
              style={{
                fontSize: 11,
                letterSpacing: '0.18em',
                color: INK_MUTE,
                textTransform: 'uppercase',
                fontFamily: 'monospace',
              }}
            >
              Start-up Graveyard · Forensic Intelligence Archive
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: title.length > 40 ? 44 : 56,
              fontWeight: 700,
              color: INK,
              textAlign: 'center',
              maxWidth: '74%',
              lineHeight: 1.12,
              letterSpacing: '-0.02em',
              fontStyle: 'italic',
              fontFamily: 'Georgia, serif',
            }}
          >
            {title}
          </div>

          {/* Badge */}
          <div
            style={{
              marginTop: 32,
              padding: '8px 20px',
              border: `1px solid rgba(122, 36, 22, 0.4)`,
              fontSize: 13,
              letterSpacing: '0.28em',
              color: ACCENT,
              textTransform: 'uppercase',
              fontFamily: 'monospace',
            }}
          >
            {type === 'CASE_STUDY' ? 'Case file' : type.replace(/_/g, ' ')}
          </div>

          {/* Bottom mark */}
          <div
            style={{
              position: 'absolute',
              bottom: 36,
              right: 48,
              fontSize: 10,
              letterSpacing: '0.15em',
              color: INK_MUTE,
              fontFamily: 'monospace',
            }}
          >
            VOL. I · EVIDENCE OVER OPINION
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch {
    return new Response('Failed to generate OG image', { status: 500 });
  }
}
