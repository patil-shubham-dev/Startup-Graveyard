'use client';

export const AutopsyLoader = ({ customContext }: { customContext?: string }) => {
  return (
    <div className="flex items-start gap-3 w-full py-2">
      <div className="flex items-center gap-1.5 pt-1">
        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      {customContext && (
        <span className="text-xs text-gray-400 font-mono">{customContext}</span>
      )}
    </div>
  );
};
