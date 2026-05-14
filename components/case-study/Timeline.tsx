'use client';

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  type: 'milestone' | 'warning' | 'crisis';
}

export function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {events.map((event, i) => (
        <div key={i} style={{ display: 'flex', gap: '32px', minHeight: '120px' }}>
          {/* Date Column */}
          <div
            style={{
              width: '100px',
              flexShrink: 0,
              paddingTop: '4px',
              textAlign: 'right',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '11px',
                fontWeight: '600',
                color: 'var(--ink-black)',
                letterSpacing: '0.05em',
              }}
            >
              {event.date}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '9px',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: event.type === 'crisis' ? 'var(--rust-accent)' : event.type === 'warning' ? 'var(--ochre-signal)' : 'var(--ink-muted)',
                marginTop: '4px',
              }}
            >
              {event.type}
            </div>
          </div>

          {/* Line & Dot Column */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '1px',
              backgroundColor: 'var(--cream-dark)',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: event.type === 'crisis' ? 'var(--rust-accent)' : 'var(--cream-base)',
                border: `2px solid ${event.type === 'crisis' ? 'var(--rust-accent)' : 'var(--cream-dark)'}`,
                position: 'absolute',
                top: '6px',
                zIndex: 2,
              }}
            />
          </div>

          {/* Content Column */}
          <div style={{ paddingBottom: '48px', paddingTop: '2px' }}>
            <h4
              style={{
                fontFamily: 'var(--font-cormorant), Georgia, serif',
                fontSize: '20px',
                fontWeight: '700',
                color: 'var(--ink-black)',
                marginBottom: '8px',
                lineHeight: 1.1,
              }}
            >
              {event.title}
            </h4>
            <p
              style={{
                fontFamily: 'var(--font-source-serif), Georgia, serif',
                fontSize: '14px',
                lineHeight: 1.65,
                color: 'var(--ink-soft)',
                maxWidth: '42ch',
              }}
            >
              {event.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
