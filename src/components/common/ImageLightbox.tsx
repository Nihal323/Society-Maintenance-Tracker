import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Maximize2, ExternalLink } from "lucide-react";

interface ImageLightboxProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImageLightbox({ src, alt, className = "h-48 w-full object-cover rounded-xl" }: ImageLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        className="relative group cursor-pointer overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-sm"
        onClick={() => setIsOpen(true)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className={`${className} transition-transform duration-300 group-hover:scale-105`}
        />
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-medium text-xs">
          <Maximize2 className="w-4 h-4" /> Click to view full image
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} maxWidth="2xl">
        <div className="flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="max-h-[75vh] w-auto max-w-full rounded-xl object-contain shadow-xl"
          />
          <div className="mt-4 flex items-center justify-between w-full text-xs text-slate-500">
            <span>{alt}</span>
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-500 hover:underline"
            >
              Open raw file <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </Modal>
    </>
  );
}
