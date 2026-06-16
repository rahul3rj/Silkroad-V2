"use client";

/**
 * PageLoader — full-viewport loader shown while product data is fetching.
 * Matches the same SVG spinner used in the search page loader.
 */
export function PageLoader() {
  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-center bg-white page-loader-enter">
      <img
        src="/loader.svg"
        alt="Loading…"
        className="w-10 h-10"
        draggable={false}
      />
    </div>
  );
}
