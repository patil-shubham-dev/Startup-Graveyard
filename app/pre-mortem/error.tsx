'use client';

export default function PreMortemError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="w-full h-[calc(100vh-80px)] flex items-center justify-center bg-[#F7F4EE]">
      <div className="text-center max-w-md px-6">
        <div className="font-monospace text-[9px] tracking-widest text-[#D35A22] uppercase font-bold mb-4">DIAGNOSTIC FAILURE</div>
        <h1 className="font-serif text-[32px] font-semibold text-[#111111] mb-3">Analysis Interrupted</h1>
        <p className="font-sans text-sm text-[#9A9187] mb-8 leading-relaxed">
          {error.message || 'The pre-mortem engine encountered an unexpected error during analysis.'}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#D35A22] text-white text-xs uppercase tracking-widest font-bold rounded-lg hover:bg-[#B84A1A] transition-colors"
        >
          RETRY ANALYSIS
        </button>
      </div>
    </div>
  );
}
