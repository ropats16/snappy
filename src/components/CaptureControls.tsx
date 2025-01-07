import { Button } from "@/components/ui/button";
import { ImageIcon, Upload, X } from "lucide-react";

interface CaptureControlsProps {
  capturedImage: string | null;
  cameraEnabled: boolean;
  cameraError: string | null;
  uploading: boolean;
  onCapture: () => void;
  onCancel: () => void;
  onUpload: () => void;
  onGalleryOpen: () => void;
}

export default function CaptureControls({
  capturedImage,
  cameraEnabled,
  cameraError,
  uploading,
  onCapture,
  onCancel,
  onUpload,
  onGalleryOpen,
}: CaptureControlsProps) {
  return (
    <div className="absolute bottom-8 left-4 right-4 flex justify-between items-center">
      <Button
        size="icon"
        variant="ghost"
        className="rounded-full w-12 h-12 bg-black/30 text-white hover:bg-black/50"
        onClick={onGalleryOpen}
      >
        <ImageIcon className="w-6 h-6" />
      </Button>
      {!capturedImage ? (
        <Button
          size="icon"
          variant="outline"
          className="rounded-full w-20 h-20 border-4 border-white bg-transparent hover:bg-white/20"
          onClick={onCapture}
          disabled={!cameraEnabled || !!cameraError}
        >
          <div className="w-16 h-16 rounded-full bg-white" />
        </Button>
      ) : (
        <div className="flex items-center space-x-8">
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full w-16 h-16 bg-white/30 text-white hover:bg-white/50"
            onClick={onCancel}
          >
            <X className="w-8 h-8" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full w-16 h-16 bg-white/30 text-white hover:bg-white/50"
            onClick={onUpload}
            disabled={uploading}
          >
            {uploading ? (
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-8 h-8" />
            )}
          </Button>
        </div>
      )}
      <div className="w-12 h-12" /> {/* Placeholder for alignment */}
    </div>
  );
}
