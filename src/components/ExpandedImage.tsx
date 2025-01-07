import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ExpandedImageProps {
  imageUrl: string;
  onBack: () => void;
}

export default function ExpandedImage({
  imageUrl,
  onBack,
}: ExpandedImageProps) {
  return (
    <div className="h-full w-full bg-black text-white flex flex-col">
      <div className="p-4 flex items-center justify-between">
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
          Image Details
        </h2>
        <div className="w-10" /> {/* Placeholder for alignment */}
      </div>
      <div className="flex-1 overflow-hidden pt-2 pb-10">
        <img
          src={imageUrl}
          alt="Expanded"
          className="h-full w-full object-contain"
        />
      </div>
    </div>
  );
}
