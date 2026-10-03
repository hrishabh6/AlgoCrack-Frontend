"use client";

type InputPanelProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function InputPanel({ value, onChange, disabled }: InputPanelProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b px-3 py-2 text-xs font-medium text-muted-foreground">Input (stdin)</div>
      <textarea
        className="min-h-0 flex-1 resize-none bg-transparent p-3 font-mono text-sm outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        spellCheck={false}
        aria-label="Standard input"
      />
    </div>
  );
}
