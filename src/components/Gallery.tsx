"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { queryUploadsFromArweave } from "../../utils/arweaveUtils";
import ExpandedImage from "./ExpandedImage";

interface GalleryImage {
  id: string;
  url: string;
}

export default function Gallery({ onBack }: { onBack: () => void }) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch transaction IDs from Arweave
        const txIds = await queryUploadsFromArweave();

        // Convert transaction IDs to image URLs
        const imageList = txIds.map((id) => ({
          id,
          url: `https://arweave.net/${id}`,
        }));

        setImages(imageList);
      } catch (err) {
        console.error("Failed to fetch images:", err);
        setError("Failed to load images. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  if (selectedImage) {
    return (
      <ExpandedImage
        imageUrl={selectedImage}
        onBack={() => setSelectedImage(null)}
      />
    );
  }

  return (
    <div className="h-full w-full bg-black text-white p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:text-gray-300"
          onClick={onBack}
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h2
          className="text-2xl font-bold"
          style={{ fontFamily: "Lobster, cursive" }}
        >
          Gallery
        </h2>
        <div className="w-10" />
      </div>

      <p className="text-gray-500 text-sm text-muted-foreground mb-4">
        Note: New uploads may take a few minutes to appear in the gallery
      </p>

      {error ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p>{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-square bg-gray-800 animate-pulse rounded-lg"
                />
              ))
            : images.map((image) => (
                <div
                  key={image.id}
                  className="aspect-square rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => setSelectedImage(image.url)}
                >
                  <img
                    src={image.url}
                    alt={`Uploaded ${image.id}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement!.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center bg-gray-800">
                          <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                        </div>
                      `;
                    }}
                  />
                </div>
              ))}
        </div>
      )}
    </div>
  );
}
