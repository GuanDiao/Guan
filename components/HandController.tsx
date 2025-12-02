import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

interface HandControllerProps {
  onInteractionChange: (value: number) => void;
  onDetectionChange: (detected: boolean) => void;
}

const HandController: React.FC<HandControllerProps> = ({ onInteractionChange, onDetectionChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const lastVideoTimeRef = useRef(-1);
  const requestRef = useRef<number>(0);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);

  useEffect(() => {
    const initMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        
        setIsLoaded(true);
        startWebcam();
      } catch (error) {
        console.error("Error initializing MediaPipe:", error);
      }
    };

    initMediaPipe();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startWebcam = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener("loadeddata", predictWebcam);
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    }
  };

  const predictWebcam = () => {
    if (!handLandmarkerRef.current || !videoRef.current) return;

    let startTimeMs = performance.now();
    if (lastVideoTimeRef.current !== videoRef.current.currentTime) {
      lastVideoTimeRef.current = videoRef.current.currentTime;
      const results = handLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

      if (results.landmarks && results.landmarks.length > 0) {
        onDetectionChange(true);
        const landmarks = results.landmarks[0];
        
        // Calculate distance between thumb tip (4) and index finger tip (8)
        // Or calculate average spread of hand to determine "openness"
        
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const wrist = landmarks[0];

        // Euclidean distance between thumb and index
        const pinchDist = Math.sqrt(
          Math.pow(thumbTip.x - indexTip.x, 2) +
          Math.pow(thumbTip.y - indexTip.y, 2) +
          Math.pow(thumbTip.z - indexTip.z, 2)
        );

        // Normalize approx distance (0.02 is close, 0.2 is far usually in screen coords)
        // Inverting logic: Open hand = 1 (particles expand), Closed pinch = 0 (particles contract)
        // Wait, request says: "hands open/close control scale/diffusion"
        // Let's map 0.05 to 0.3 range to 0-1
        
        let val = (pinchDist - 0.02) / (0.2 - 0.02);
        val = Math.max(0, Math.min(1, val));
        
        onInteractionChange(val);
      } else {
        onDetectionChange(false);
        // Slowly decay interaction if hand lost? or just keep last?
        // Let's reset to neutral (0.5) gracefully in parent, or send -1 to indicate lost.
      }
    }
    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-32 h-24 rounded-lg overflow-hidden border-2 border-white/20 shadow-lg bg-black">
       {/* Mirror the video */}
      <video 
        ref={videoRef} 
        className="w-full h-full object-cover transform -scale-x-100" 
        autoPlay 
        playsInline 
        muted 
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-xs text-white">
          Loading AI...
        </div>
      )}
    </div>
  );
};

export default HandController;