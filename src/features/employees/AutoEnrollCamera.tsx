import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
} from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  display: grid;
  gap: 1.2rem;
  width: 100%;
`;

const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  border-radius: var(--border-radius-md);
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--color-toolbar-input-border);

  video,
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    background-color: black;
  }
`;

const OverlayGuide = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;

  /* face framing ring */
  &::after {
    content: "";
    width: 55%;
    max-width: 200px;
    aspect-ratio: 1 / 1;
    border-radius: 9999px;
    border: 2px solid rgba(255, 255, 255, 0.4);
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.8), 0 0 4px rgba(255, 255, 255, 0.5);
  }
`;

const StatusText = styled.div`
  font-size: 1.2rem;
  line-height: 1.4;
  text-align: center;
  color: var(--color-text-dim);

  &.ok {
    color: var(--color-green-text, #86efac);
  }
  &.error {
    color: var(--color-red-text, #fecdd3);
  }
`;

export type AutoEnrollCameraProps = {
  onAutoCapture: (imgBase64: string) => void;
};

// helper type definition for FaceDetector
type DetectedFaceBox = {
  width: number;
  height: number;
  x: number;
  y: number;
};
type DetectedFace = {
  boundingBox: DetectedFaceBox;
};

declare global {
  interface Window {
    FaceDetector?: new (options?: {
      fastMode?: boolean;
      maxDetectedFaces?: number;
    }) => {
      detect: (image: CanvasImageSource) => Promise<DetectedFace[]>;
    };
  }
}

export default function AutoEnrollCamera({
  onAutoCapture,
}: AutoEnrollCameraProps): JSX.Element {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);

  // UI status line
  const [status, setStatus] = useState<
    "init" | "noface" | "hold" | "done" | "error"
  >("init");

  // this counts how long we've had a "good face"
  const stableCountRef = useRef<number>(0);

  // init camera
  useEffect(() => {
    let active = true;

    async function init() {
      try {
        const media = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: { ideal: "user" },
          },
          audio: false,
        });

        if (!active) {
          media.getTracks().forEach((t) => t.stop());
          return;
        }

        setStream(media);
        if (videoRef.current) {
          videoRef.current.srcObject = media;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setStatus("noface"); // camera ready, looking for face
          };
        }
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    }

    init();

    return () => {
      active = false;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // stop stream helper
  const stopStreamNow = useCallback(() => {
    if (!stream) return;
    stream.getTracks().forEach((t) => t.stop());
    setStream(null);
    if (videoRef.current) videoRef.current.srcObject = null;
  }, [stream]);

  // capture current frame into base64
  const takeSnapshot = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;
    const v = videoRef.current;
    const c = canvasRef.current;
    const ctx = c.getContext("2d");
    if (!ctx) return null;

    c.width = v.videoWidth;
    c.height = v.videoHeight;
    ctx.drawImage(v, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.9);
  }, []);

  // is the face "good enough"?
  // rules:
  // - exactly one face
  // - face is reasonably centered (inside middle 50% of frame)
  // - face takes enough area (> ~15% frame height)
  const faceLooksGood = useCallback(
    (face: DetectedFace, videoW: number, videoH: number): boolean => {
      const box = face.boundingBox;
      const faceCx = box.x + box.width / 2;
      const faceCy = box.y + box.height / 2;

      // center window (middle 50%)
      const centerXMin = videoW * 0.25;
      const centerXMax = videoW * 0.75;
      const centerYMin = videoH * 0.2;
      const centerYMax = videoH * 0.7;

      const centered =
        faceCx >= centerXMin &&
        faceCx <= centerXMax &&
        faceCy >= centerYMin &&
        faceCy <= centerYMax;

      // size check
      const sizeOk = box.height >= videoH * 0.2; // at least 20% of frame height

      return centered && sizeOk;
    },
    []
  );

  // detection loop
  useLayoutEffect(() => {
    if (!window.FaceDetector) {
      // no browser face detection support
      return;
    }
    if (!videoRef.current) return;
    if (captured) return; // we already captured, stop checking

    const detector = new window.FaceDetector({
      fastMode: true,
      maxDetectedFaces: 1,
    });

    let rafId: number;
    let running = true;

    async function tick() {
      if (!running) return;
      const v = videoRef.current;
      if (!v || v.readyState < 2) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      try {
        const faces = await detector.detect(v);

        if (!faces || faces.length === 0) {
          // no face
          stableCountRef.current = 0;
          if (status !== "init" && status !== "error") {
            setStatus("noface");
          }
        } else if (faces.length === 1) {
          const ok = faceLooksGood(faces[0], v.videoWidth, v.videoHeight);

          if (!ok) {
            // face but not stable/centered
            stableCountRef.current = 0;
            setStatus("noface");
          } else {
            // looks good
            stableCountRef.current += 1;

            // require ~1s of stillness:
            // 1s / (approx ~6 loops/sec) ≈ 6 frames
            if (stableCountRef.current >= 6) {
              // SNAP
              const snap = takeSnapshot();
              if (snap) {
                setCaptured(snap);
                setStatus("done");
                stopStreamNow();
                onAutoCapture(snap);
                running = false;
                return;
              }
            } else {
              setStatus("hold");
            }
          }
        } else {
          // more than one face -> reject
          stableCountRef.current = 0;
          setStatus("noface");
        }
      } catch (err) {
        console.error(err);
        // detector threw -> stop loop but don't crash UI
        running = false;
        if (!captured) {
          setStatus("error");
        }
        return;
      }

      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
    };
  }, [
    captured,
    faceLooksGood,
    onAutoCapture,
    status,
    stopStreamNow,
    takeSnapshot,
  ]);

  // what to render inside the frame:
  // - if captured: show captured img
  // - else show live video + guide circle
  const videoRegion = captured ? (
    <img src={captured} alt="captured face" />
  ) : (
    <>
      <video ref={videoRef} playsInline muted autoPlay />
      <OverlayGuide />
    </>
  );

  // human-readable status line
  let statusMsg = "";
  let statusClass = "";
  switch (status) {
    case "init":
      statusMsg = "Initializing camera…";
      break;
    case "noface":
      statusMsg = "Center your face in the circle";
      break;
    case "hold":
      statusMsg = "Hold still…";
      break;
    case "done":
      statusMsg = "Face captured ✓";
      statusClass = "ok";
      break;
    case "error":
      statusMsg = "Camera / detection not available. Please try again.";
      statusClass = "error";
      break;
  }

  return (
    <Wrapper>
      <VideoContainer>{videoRegion}</VideoContainer>

      <StatusText className={statusClass}>{statusMsg}</StatusText>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </Wrapper>
  );
}
