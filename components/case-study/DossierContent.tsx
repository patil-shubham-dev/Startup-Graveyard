'use client';

import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';

interface DossierContentProps {
  source: MDXRemoteSerializeResult;
}

const components = {
  h2: (props: any) => (
    <h2 className="font-header text-3xl font-bold mt-20 mb-8 flex items-center gap-4 text-text-primary">
      <div className="w-1.5 h-8 bg-amber-500/40" />
      {props.children}
    </h2>
  ),
  h3: (props: any) => <h3 className="font-sans text-xl font-bold mt-12 mb-6 text-text-primary tracking-tight" {...props} />,
  p: (props: any) => <p className="text-text-muted leading-[1.8] mb-8 text-[17px] font-sans" {...props} />,
  ul: (props: any) => <ul className="space-y-4 mb-10 ml-4 border-l border-white/5 pl-8" {...props} />,
  li: (props: any) => (
    <li className="relative leading-relaxed text-text-muted list-none">
      <div className="absolute -left-[35px] top-3 w-1.5 h-1.5 bg-amber-500/40 rounded-full" />
      {props.children}
    </li>
  ),
  blockquote: (props: any) => (
    <div className="relative my-12 p-10 glass-dossier border-l-4 border-amber-500/60 rounded-[2px] bg-amber-500/[0.02]">
      <div className="absolute top-4 left-6 font-mono text-[9px] text-amber-500/60 tracking-[0.2em] uppercase">FIELD_NOTE // OBSERVATION</div>
      <blockquote className="italic text-text-primary text-lg leading-relaxed pt-4" {...props} />
    </div>
  ),
  code: (props: any) => <code className="bg-white/5 border border-white/10 px-2 py-0.5 rounded font-mono text-xs text-violet-400" {...props} />,
};

export function DossierContent({ source }: DossierContentProps) {
  return (
    <div className="max-w-none">
      <MDXRemote {...source} components={components} />
    </div>
  );
}
