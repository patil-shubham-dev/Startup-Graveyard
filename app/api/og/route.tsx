import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'Startup Graveyard';
    const type = searchParams.get('type') || 'CASE_STUDY';

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://startupgraveyard.com';
    const bg = `${siteUrl}/og-bg.png`;

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
            backgroundImage: `url(${bg})`,
            backgroundSize: '1200px 630px',
            position: 'relative',
            fontFamily: 'Georgia, serif',
          }}
        >
          {/* Forensic border frame */}
          <div
            style={{
              position: 'absolute',
              top: 24,
              left: 24,
              right: 24,
              bottom: 24,
              border: '1.5px solid rgba(180, 140, 100, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Top label */}
            <div
              style={{
                position: 'absolute',
                top: -1,
                left: 48,
                display: 'flex',
                backgroundColor: '#1a1a1a',
                padding: '0 12px',
                fontSize: 10,
                letterSpacing: '0.2em',
                color: '#b48c64',
                textTransform: 'uppercase',
                fontFamily: 'monospace',
              }}
            >
              STARTUP GRAVEYARD // {type}
            </div>

            {/* Decorative line */}
            <div
              style={{
                position: 'absolute',
                top: 60,
                left: 60,
                right: 60,
                height: 1,
                backgroundColor: 'rgba(180, 140, 100, 0.15)',
              }}
            />

            {/* Main title */}
            <div
              style={{
                fontSize: title.length > 30 ? 48 : 64,
                fontWeight: 700,
                color: '#f0ede8',
                textAlign: 'center',
                maxWidth: '80%',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                fontStyle: 'italic',
                fontFamily: 'Georgia, serif',
              }}
            >
              {title}
            </div>

            {/* Category badge */}
            <div
              style={{
                marginTop: 32,
                padding: '8px 24px',
                border: '1.5px solid rgba(180, 140, 100, 0.4)',
                borderRadius: 2,
                fontSize: 14,
                letterSpacing: '0.3em',
                color: '#b48c64',
                textTransform: 'uppercase',
                fontFamily: 'monospace',
              }}
            >
              FORENSIC AUTOPSY
            </div>
          </div>

          {/* Bottom watermark */}
          <div
            style={{
              position: 'absolute',
              bottom: 36,
              right: 48,
              fontSize: 10,
              letterSpacing: '0.15em',
              color: 'rgba(180, 140, 100, 0.2)',
              fontFamily: 'monospace',
            }}
          >
            startupgraveyard.com
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
