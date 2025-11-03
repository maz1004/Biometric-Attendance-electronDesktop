import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
} from "react";
import styled from "styled-components";

import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-backend-cpu";
import * as faceDetection from "@tensorflow-models/face-detection";

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

export type AutoCaptureFaceOnlyProps = {
  onAutoCapture: (imgBase64: string) => void;
};

export default function AutoCaptureFaceOnly({
  onAutoCapture,
}: AutoCaptureFaceOnlyProps): JSX.Element {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [model, setModel] = useState<faceDetection.FaceDetector | null>(null);

  const [status, setStatus] = useState<
    | "init"
    | "askingCamera"
    | "loadingBackend"
    | "loadingModel"
    | "noface"
    | "hold"
    | "done"
    | "error"
  >("init");

  const [captured, setCaptured] = useState<string | null>(null);

  const stableCountRef = useRef<number>(0);

  // STEP 1: ask for camera
  useEffect(() => {
    let active = true;

    async function initCamera() {
      try {
        setStatus("askingCamera");

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
            setStatus("loadingBackend"); // next step
          };
        }
      } catch (err) {
        console.error("getUserMedia failed:", err);
        setStatus("error");
      }
    }

    initCamera();

    return () => {
      active = false;
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // STEP 2: pick tf backend (webgl if possible, fallback cpu), then load model
  useEffect(() => {
    let cancelled = false;

    async function prepareModel() {
      if (status !== "loadingBackend" && status !== "loadingModel") return;
      try {
        // only run once
        if (!model) {
          // 2a: set backend
          try {
            await tf.setBackend("webgl");
          } catch {
            console.warn("webgl backend failed, using cpu");
            await tf.setBackend("cpu");
          }
          await tf.ready();
          if (cancelled) return;

          setStatus("loadingModel");

          // 2b: load detector
          const detector = await faceDetection.createDetector(
            faceDetection.SupportedModels.MediaPipeFaceDetector,
            {
              runtime: "tfjs",
              maxFaces: 1,
            }
          );

          if (cancelled) return;
          setModel(detector);

          // camera + model ready → start detecting
          setStatus("noface");
        }
      } catch (err) {
        console.error("model init failed:", err);
        if (!cancelled) setStatus("error");
      }
    }

    prepareModel();

    return () => {
      cancelled = true;
    };
  }, [status, model]);

  // STOP camera helper after capture
  const stopStreamNow = useCallback(() => {
    if (!stream) return;
    stream.getTracks().forEach((t) => t.stop());
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  // snapshot helper
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

  // helper: is the detected face good enough (1 face, centered, big)
  const faceLooksGood = useCallback(
    (face: faceDetection.Face, videoW: number, videoH: number): boolean => {
      const box = face.box;
      const boxW = box.xMax - box.xMin;
      const boxH = box.yMax - box.yMin;
      const cx = box.xMin + boxW / 2;
      const cy = box.yMin + boxH / 2;

      const centerXMin = videoW * 0.25;
      const centerXMax = videoW * 0.75;
      const centerYMin = videoH * 0.2;
      const centerYMax = videoH * 0.7;

      const centered =
        cx >= centerXMin &&
        cx <= centerXMax &&
        cy >= centerYMin &&
        cy <= centerYMax;

      const sizeOk = boxH >= videoH * 0.2;

      return centered && sizeOk;
    },
    []
  );

  // STEP 3: detection loop
  useLayoutEffect(() => {
    if (!model) return;
    if (!videoRef.current) return;
    if (captured) return; // stop once we captured

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
        const faces = await model?.estimateFaces(v);

        if (!faces || faces.length === 0) {
          stableCountRef.current = 0;
          // only show "noface" if we already were past init stages
          if (
            status !== "init" &&
            status !== "askingCamera" &&
            status !== "loadingBackend" &&
            status !== "loadingModel" &&
            status !== "error"
          ) {
            setStatus("noface");
          }
        } else if (faces.length === 1) {
          const ok = faceLooksGood(faces[0], v.videoWidth, v.videoHeight);

          if (!ok) {
            stableCountRef.current = 0;
            setStatus("noface");
          } else {
            // face looks centered and big enough
            stableCountRef.current += 1;

            // wait ~6 frames of stability (~1s-ish)
            if (stableCountRef.current >= 6) {
              const snap = takeSnapshot();
              if (snap) {
                setCaptured(snap);
                stopStreamNow();
                setStatus("done");
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
        console.error("detection loop error:", err);
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
    model,
    captured,
    faceLooksGood,
    onAutoCapture,
    status,
    stopStreamNow,
    takeSnapshot,
  ]);

  // which visual to show in the main camera box
  const frameEl = captured ? (
    <img src={captured} alt="captured face" />
  ) : (
    <>
      <video ref={videoRef} playsInline muted autoPlay />
      <OverlayGuide />
    </>
  );

  // human-readable status
  let statusMsg = "";
  let statusClass = "";
  switch (status) {
    case "init":
      statusMsg = "Opening enrollment…";
      break;
    case "askingCamera":
      statusMsg = "Requesting camera access…";
      break;
    case "loadingBackend":
      statusMsg = "Preparing vision backend…";
      break;
    case "loadingModel":
      statusMsg = "Loading face detector…";
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
      statusMsg = "Camera / detection error. Check permissions.";
      statusClass = "error";
      break;
  }

  return (
    <Wrapper>
      <VideoContainer>{frameEl}</VideoContainer>

      <StatusText className={statusClass}>{statusMsg}</StatusText>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </Wrapper>
  );
}
