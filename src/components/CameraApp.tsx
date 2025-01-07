"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { uploadToArweave } from "../../utils/arweaveUtils";
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
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
        video: {
          facingMode: facingMode,
          aspectRatio: 3 / 4,
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log("camera started successfully");
      }
      setCameraError(null);
    } catch (err) {
      console.error("Error accessing the camera", err);
      const message =
        "Unable to access the camera. Please check your permissions.";
      setCameraError(message);
      setErrorMessage(message);
      setShowErrorPopup(true);
    }
  }, [facingMode, cameraEnabled]);

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
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        // Match canvas size to video's display size
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw the video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL("image/jpeg");
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
        setCapturedImage(null);
        // Restart camera after successful upload
        if (cameraEnabled) {
          await startCamera();
        }
      } catch (error) {
        console.error("Upload failed:", error);
        setErrorMessage("There was an error uploading your image.");
        setShowErrorPopup(true);
      } finally {
        setUploading(false);
      }
    }
  }, [capturedImage, cameraEnabled, startCamera]);

  const switchCamera = useCallback(async () => {
    // First stop the current stream
    await stopCamera();

    // Update facing mode
    setFacingMode((prevMode) => (prevMode === "user" ? "environment" : "user"));

    // Restart camera with new facing mode
    await startCamera();
  }, [stopCamera, startCamera]);

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
    <div className="relative w-full max-w-md mx-auto bg-black overflow-hidden my-4 rounded-3xl aspect-[3/4]">
      {showBetaPopup && <BetaPopup onClose={() => setShowBetaPopup(false)} />}
      {showErrorPopup && (
        <div className="absolute inset-0 z-10 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{errorMessage}</p>
            <button
              className="bg-black text-white px-4 py-2 rounded"
              onClick={() => setShowErrorPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

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
            className="absolute top-10 left-0 right-0 text-center text-4xl font-bold text-white"
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

          <canvas ref={canvasRef} className="hidden" />
        </>
      ) : (
        <Gallery onBack={handleGalleryClose} />
      )}
    </div>
  );
}
