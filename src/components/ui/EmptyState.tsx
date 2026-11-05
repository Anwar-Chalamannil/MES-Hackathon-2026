import type { ReactNode } from 'react';

export default function EmptyState({ title, text, children }: { title: string; text?: string; children?: ReactNode }) {
  return (
    <div className="rounded-card border border-dashed border-line bg-surface p-6 text-center">
      <h2 className="text-[17px] font-bold">{title}</h2>
      {text && <p className="mt-1 text-[15px] text-muted">{text}</p>}
      {children && <div className="mt-4 flex justify-center">{children}</div>}
    </div>
  );
}
