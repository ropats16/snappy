import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Camera, RefreshCcw } from "lucide-react";

interface CameraControlsProps {
  cameraEnabled: boolean;
  onCameraToggle: (enabled: boolean) => void;
  onSwitchCamera: () => void;
}

export default function CameraControls({
  cameraEnabled,
  onCameraToggle,
  onSwitchCamera,
}: CameraControlsProps) {
  return (
    <div className="absolute top-10 left-4 right-4 flex justify-between items-center">
      <div className="flex items-center bg-black/30 rounded-full p-1">
        <Switch
          id="camera-toggle"
          checked={cameraEnabled}
          onCheckedChange={onCameraToggle}
        />
        <span className="sr-only">Toggle Camera</span>
        <Camera className="w-4 h-4 text-white ml-1" />
      </div>
      <Button
        size="icon"
        variant="ghost"
        className="rounded-full w-12 h-12 bg-black/30 text-white hover:bg-black/50"
        onClick={onSwitchCamera}
      >
        <RefreshCcw className="w-6 h-6" />
      </Button>
    </div>
  );
}
