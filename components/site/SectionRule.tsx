interface SectionRuleProps {
  index: string;
  label: string;
  right?: string;
}

export function SectionRule({ index, label, right }: SectionRuleProps) {
  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-6">
      <div className="flex items-baseline justify-between gap-6 border-t border-line pt-3">
        <p className="footnote">
          {index} · {label}
        </p>
        {right ? (
          <p className="footnote">{right}</p>
        ) : (
          <span aria-hidden className="h-px w-16 bg-line" />
        )}
      </div>
    </div>
  );
}
