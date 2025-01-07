import { Button } from "@/components/ui/button";

interface BetaPopupProps {
  onClose: () => void;
}

export default function BetaPopup({ onClose }: BetaPopupProps) {
  return (
    <div className="absolute inset-0 z-10 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
        <h2 className="text-xl font-bold mb-2">Camera is in Beta</h2>
        <p className="text-gray-600 mb-4 text-muted-foreground">
          Please note that currently all images are public. The developer is not
          responsible for sensitive data uploads. Due to browser issues, you may
          continue to see the camera light even after disabling the camera. We
          are also looking into fixing this but in the meantime you can close
          the app to close the camera. We are looking into adding support for
          bundling, but until then, uploads are also chargeable.
        </p>
        <p className="text-black mb-4 font-semibold">
          Have fun and reach out to me on{" "}
          <a
            href="https://x.com/ropats16/"
            className="text-blue-600 underline"
            target="_blank"
          >
            X
          </a>{" "}
          for feedback.
        </p>
        <Button onClick={onClose}>I understand</Button>
      </div>
    </div>
  );
}
