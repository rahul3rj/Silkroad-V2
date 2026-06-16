// UI Skeleton component — animated placeholder for loading states
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-zinc-800 rounded ${className}`} />
  );
}
