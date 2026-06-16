"use client";

// SizeSelector — size picker for product detail page
// TODO: Show sold-out sizes as disabled, highlight selected size
interface SizeSelectorProps {
  sizes: string[];
  selectedSize: string | null;
  onSelect: (size: string) => void;
}

export function SizeSelector({ sizes, selectedSize, onSelect }: SizeSelectorProps) {
  return (
    <div>
      <p className="text-sm text-zinc-400 mb-3">Size</p>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => onSelect(size)}
            className={`px-4 py-2 border rounded text-sm transition ${
              selectedSize === size
                ? "border-white text-white"
                : "border-zinc-700 text-zinc-400 hover:border-zinc-400"
            }`}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}
