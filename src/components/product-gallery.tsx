"use client";

import { useState } from "react";
import Image from "next/image";

// Product er chobi gallery
// choto chobi te click korle boro chobi change hoy
export default function ProductGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  // kon chobi ta ekhon boro hoye dekhabe (0 mane prothom ta)
  const [activeImage, setActiveImage] = useState(0);

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:gap-4">
      {/* choto chobi gula - mobile e niche, desktop e bame column */}
      <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:w-[152px] lg:shrink-0 lg:flex-col lg:overflow-visible">
        {images.map((image, index) => (
          <button
            key={image}
            type="button"
            onClick={() => setActiveImage(index)}
            aria-label={`Show image ${index + 1}`}
            className={`relative aspect-square w-[76px] shrink-0 overflow-hidden rounded-[16px] border-2 bg-muted lg:w-full ${
              index === activeImage ? "border-foreground" : "border-transparent"
            }`}
          >
            <Image
              src={image}
              alt=""
              fill
              sizes="160px"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* boro chobi */}
      <div className="relative order-1 aspect-square flex-1 overflow-hidden rounded-[20px] bg-muted lg:order-2">
        <Image
          src={images[activeImage]}
          alt={title}
          fill
          priority
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
