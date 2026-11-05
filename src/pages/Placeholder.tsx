export default function Placeholder({ title, phase }: { title: string; phase?: string }) {
  return (
    <div>
      <h1 className="text-[24px] font-extrabold tracking-tight">{title}</h1>
      {phase && <p className="mt-2 text-muted">Coming in phase {phase}.</p>}
    </div>
  );
}
