"use client";

// ProductImageGallery — main image + thumbnail strip for product detail page
// TODO: Implement lightbox, zoom on hover, swipe on mobile
interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  return (
    <div className="flex gap-4">
      {/* Thumbnail strip */}
      <div className="flex flex-col gap-2">
        {images.map((src, i) => (
          <div key={i} className="w-16 h-20 bg-zinc-900 rounded overflow-hidden cursor-pointer">
            {/* TODO: <Image src={src} alt={`${productName} ${i+1}`} width={64} height={80} className="object-cover" /> */}
          </div>
        ))}
      </div>
      {/* Main image */}
      <div className="flex-1 aspect-[3/4] bg-zinc-900 rounded overflow-hidden">
        {/* TODO: <Image src={images[0]} alt={productName} fill className="object-cover" /> */}
      </div>
    </div>
  );
}
