export const SkeletonCard = () => (
  <div className="bg-card border border-border p-5 rounded-lg animate-pulse">
    <div className="flex items-center gap-3 mb-3">
      <div className="h-10 w-10 rounded-lg bg-secondary" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 bg-secondary rounded" />
        <div className="h-3 w-20 bg-secondary rounded" />
      </div>
    </div>
    <div className="flex gap-4 mb-4">
      <div className="h-3 w-20 bg-secondary rounded" />
      <div className="h-3 w-16 bg-secondary rounded" />
    </div>
    <div className="h-10 w-full bg-secondary rounded-lg" />
  </div>
);
