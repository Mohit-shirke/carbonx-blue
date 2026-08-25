export default function Loading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[var(--bg)]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-primary-500/20"/>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 animate-spin"/>
        </div>
        <p className="text-sm text-[var(--text-muted)] font-medium animate-pulse">Loading CarbonX…</p>
      </div>
    </div>
  )
}
