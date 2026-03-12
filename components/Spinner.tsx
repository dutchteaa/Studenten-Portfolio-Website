export default function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent-1)' }} />
      <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Laden...</span>
    </div>
  );
}
