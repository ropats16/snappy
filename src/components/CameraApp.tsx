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
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);

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
          width: { ideal: 720 },
          height: { ideal: 960 },
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
        // Set canvas size to match video's actual dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Clear the canvas before drawing
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw maintaining orientation and aspect ratio
        context.save();
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        context.restore();

        const imageDataUrl = canvas.toDataURL("image/jpeg", 1.0);
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
      } catch (error: unknown) {
        console.error("Upload failed:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        setErrorMessage(
          `There was an error uploading your image: ${errorMessage}`
        );
        setShowErrorPopup(true);
      } finally {
        setUploading(false);
      }
    }
  }, [capturedImage, cameraEnabled, startCamera]);

  const switchCamera = useCallback(async () => {
    setIsSwitchingCamera(true);
    try {
      await stopCamera();
      setFacingMode((prevMode) =>
        prevMode === "user" ? "environment" : "user"
      );
      await startCamera();

      // Wait for video to be ready
      if (videoRef.current) {
        await new Promise((resolve) => {
          const video = videoRef.current!;
          video.onloadeddata = () => {
            video.play();
            resolve(true);
          };
        });
      }
    } finally {
      setIsSwitchingCamera(false);
    }
  }, [stopCamera, startCamera]);

  const cancelImage = useCallback(async () => {
    setCapturedImage(null);
    // Wait for state update before restarting camera
    await new Promise((resolve) => setTimeout(resolve, 0));
    if (cameraEnabled) {
      await startCamera();
    }
  }, [startCamera, cameraEnabled]);

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
    <div className="relative h-[100dvh] md:h-auto w-full md:max-w-md mx-auto bg-black overflow-hidden md:rounded-3xl md:aspect-[9/16]">
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
      {isSwitchingCamera && (
        <div className="absolute inset-0 z-20 bg-black/80 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <p className="text-white">Switching camera...</p>
          </div>
        </div>
      )}

      {!showGallery ? (
        <>
          <div className="absolute inset-0 h-[110vw] md:h-[70%] top-1/2 -translate-y-1/2">
            {/* <div className="absolute inset-0 h-[70%] top-1/2 -translate-y-1/2"> */}
            {cameraEnabled &&
              !cameraError &&
              (!capturedImage ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className={`h-full w-full object-cover ${
                    facingMode === "user" ? "-scale-x-100" : ""
                  }`}
                />
              ) : (
                <img
                  src={capturedImage}
                  alt="Captured"
                  className={`h-full w-full object-cover ${
                    facingMode === "user" ? "-scale-x-100" : ""
                  }`}
                />
              ))}
            {/* </div> */}
          </div>

          <h1
            className="absolute top-10 left-0 right-0 text-center text-4xl font-bold text-white"
            style={{ fontFamily: "Lobster, cursive" }}
          >
            Snappy
          </h1>

          <CameraControls
            cameraEnabled={cameraEnabled}
            onCameraToggle={setCameraEnabled}
            onSwitchCamera={switchCamera}
            isSwitchingCamera={isSwitchingCamera}
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
