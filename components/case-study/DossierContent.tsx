'use client';

import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';

interface DossierContentProps {
  source: MDXRemoteSerializeResult;
}

const components = {
  h2: (props: any) => <h2 className="font-display text-3xl font-bold mt-12 mb-6" {...props} />,
  h3: (props: any) => <h3 className="font-display text-2xl font-bold mt-8 mb-4" {...props} />,
  p: (props: any) => <p className="text-text-muted leading-relaxed mb-6 text-lg" {...props} />,
  ul: (props: any) => <ul className="list-disc pl-6 space-y-3 text-text-muted mb-8" {...props} />,
  li: (props: any) => <li className="leading-relaxed" {...props} />,
  blockquote: (props: any) => (
    <blockquote className="border-l-4 border-amber-500 bg-surface/50 p-6 italic my-8 text-text" {...props} />
  ),
  code: (props: any) => <code className="bg-surface-2 border border-border px-1.5 py-0.5 rounded font-mono text-sm" {...props} />,
};

export function DossierContent({ source }: DossierContentProps) {
  return (
    <div className="prose prose-invert max-w-none prose-headings:font-display prose-p:font-body">
      <MDXRemote {...source} components={components} />
    </div>
  );
}
