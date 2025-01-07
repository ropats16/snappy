"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { uploadToArweave } from "../../utils/arweaveUpload";
import { useToast } from "@/hooks/use-toast";
import Gallery from "./Gallery";
import BetaPopup from "./BetaPopup";
import CameraControls from "./CameraControls";
import CaptureControls from "./CaptureControls";

export default function CameraApp() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [showGallery, setShowGallery] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showBetaPopup, setShowBetaPopup] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const stopCamera = useCallback(async () => {
    console.log("stopCamera called");
    const video = videoRef.current;

    if (video?.srcObject) {
      const stream = video.srcObject as MediaStream;
      const tracks = stream.getTracks();

      tracks.forEach((track) => {
        track.stop();
        stream.removeTrack(track);
      });

      video.srcObject = null;
      video.load();
    }

    // Also stop any other video tracks that might be active
    const videoTracks = await navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => stream.getVideoTracks())
      .catch(() => []);

    videoTracks.forEach((track) => track.stop());
  }, []);

  const startCamera = useCallback(async () => {
    console.log("startCamera called, enabled:", cameraEnabled);

    if (!cameraEnabled) {
      stopCamera();
      setCameraError(null);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, aspectRatio: 9 / 16 },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log("camera started successfully");
      }
      setCameraError(null);
    } catch (err) {
      console.error("Error accessing the camera", err);
      setCameraError(
        "Unable to access the camera. Please check your permissions."
      );
      toast({
        title: "Camera Error",
        description:
          "Unable to access the camera. Please check your permissions.",
        variant: "destructive",
      });
    }
  }, [facingMode, cameraEnabled, toast]);

  // Handle camera enable/disable
  useEffect(() => {
    console.log("Camera enabled changed:", cameraEnabled);
    if (cameraEnabled) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [cameraEnabled, startCamera, stopCamera]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Show the beta popup whenever camera is enabled
  useEffect(() => {
    if (cameraEnabled) {
      setShowBetaPopup(true);
    }
  }, [cameraEnabled]);

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        context.drawImage(
          videoRef.current,
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
        const imageDataUrl = canvasRef.current.toDataURL("image/jpeg");
        setCapturedImage(imageDataUrl);
      }
    }
  }, []);

  const uploadImage = useCallback(async () => {
    if (capturedImage) {
      setUploading(true);
      try {
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        const result = await uploadToArweave(blob);
        console.log("Upload successful:", result);
        toast({
          title: "Upload Successful",
          description: "Your image has been uploaded to Arweave.",
        });
        setCapturedImage(null);
      } catch (error) {
        console.error("Upload failed:", error);
        toast({
          title: "Upload Failed",
          description: "There was an error uploading your image.",
          variant: "destructive",
        });
      } finally {
        setUploading(false);
      }
    }
  }, [capturedImage, toast]);

  const switchCamera = useCallback(() => {
    setFacingMode((prevMode) => (prevMode === "user" ? "environment" : "user"));
  }, []);

  const cancelImage = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  // Add effect to handle gallery state changes
  useEffect(() => {
    if (!showGallery && cameraEnabled) {
      // When returning from gallery and camera is enabled, restart it
      startCamera();
    }
  }, [showGallery, cameraEnabled, startCamera]);

  // Modify the gallery close handler
  const handleGalleryClose = useCallback(() => {
    setShowGallery(false);
    if (cameraEnabled) {
      // Ensure camera restarts when closing gallery
      startCamera();
    }
  }, [cameraEnabled, startCamera]);

  return (
    <div className="relative w-full max-w-md mx-auto bg-black overflow-hidden my-4 rounded-3xl aspect-[9/16]">
      {showBetaPopup && <BetaPopup onClose={() => setShowBetaPopup(false)} />}

      {!showGallery ? (
        <>
          <div className="absolute inset-0 rounded-3xl overflow-hidden">
            {cameraEnabled &&
              !cameraError &&
              (!capturedImage ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="h-full w-full object-contain"
                />
              ) : (
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="h-full w-full object-contain"
                />
              ))}
            {cameraError && (
              <div className="h-full w-full flex items-center justify-center bg-gray-900 text-white text-center p-4">
                <p>{cameraError}</p>
              </div>
            )}
          </div>

          <h1
            className="absolute top-4 left-0 right-0 text-center text-4xl font-bold text-white"
            style={{ fontFamily: "Lobster, cursive" }}
          >
            SnappyCam
          </h1>

          <CameraControls
            cameraEnabled={cameraEnabled}
            onCameraToggle={setCameraEnabled}
            onSwitchCamera={switchCamera}
          />

          <CaptureControls
            capturedImage={capturedImage}
            cameraEnabled={cameraEnabled}
            cameraError={cameraError}
            uploading={uploading}
            onCapture={captureImage}
            onCancel={cancelImage}
            onUpload={uploadImage}
            onGalleryOpen={() => setShowGallery(true)}
          />

          <canvas
            ref={canvasRef}
            className="hidden"
            width={720}
            height={1280}
          />
        </>
      ) : (
        <Gallery onBack={handleGalleryClose} />
      )}
    </div>
  );
}
