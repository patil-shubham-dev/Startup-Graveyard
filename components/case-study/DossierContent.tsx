'use client';

import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';

export function DossierContent({ source }: { source: MDXRemoteSerializeResult }) {
  return (
    <div className="dossier-content-wrapper">
      <MDXRemote {...source} />

      <style jsx global>{`
        .dossier-content-wrapper {
          font-family: var(--font-body), 'Georgia', serif;
          font-size: 17px;
          line-height: 1.8;
          color: var(--ink-soft);
        }
        .dossier-content-wrapper p {
          margin-bottom: 24px;
        }
        .dossier-content-wrapper h2 {
          font-family: var(--font-display), 'Georgia', serif;
          font-size: 32px;
          font-weight: 700;
          color: var(--ink-black);
          margin: 48px 0 24px;
          line-height: 1.1;
        }
        .dossier-content-wrapper h3 {
          font-family: var(--font-display), 'Georgia', serif;
          font-size: 24px;
          font-weight: 700;
          color: var(--ink-black);
          margin: 32px 0 16px;
        }
        .dossier-content-wrapper blockquote {
          border-left: 3px solid var(--rust-accent);
          padding-left: 24px;
          font-style: italic;
          color: var(--ink-muted);
          margin: 32px 0;
        }
        .dossier-content-wrapper ul {
          margin-bottom: 24px;
          padding-left: 20px;
          list-style-type: square;
        }
        .dossier-content-wrapper li {
          margin-bottom: 8px;
        }
      `}</style>
    </div>
  );
}
