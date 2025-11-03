import { useEffect, useRef, useState, useCallback } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  display: grid;
  gap: 1.2rem;
  width: 100%;
`;

const VideoBox = styled.div`
  width: 100%;
  background-color: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--color-toolbar-input-border);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  position: relative;
  aspect-ratio: 3 / 4;

  display: flex;
  align-items: center;
  justify-content: center;

  video,
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    background-color: black;
  }
`;

const ErrorBox = styled.div`
  color: var(--color-red-500, #ef4444);
  font-size: 1.3rem;
  text-align: center;
  padding: 1rem;
`;

const CaptureButton = styled.button`
  justify-self: center;

  background-color: var(--color-brand-600);
  border: 1px solid var(--color-brand-600);
  color: #fff;

  border-radius: var(--border-radius-sm);
  font-size: 1.4rem;
  font-weight: 600;
  line-height: 1.2;
  padding: 0.8rem 1.6rem;
  box-shadow: var(--shadow-sm);
  cursor: pointer;

  &:hover {
    background-color: var(--color-brand-700);
    border-color: var(--color-brand-700);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const PreviewWrap = styled.div`
  display: grid;
  gap: 0.6rem;
`;

const PreviewLabel = styled.div`
  font-size: 1.2rem;
  color: var(--color-text-dim);
  text-align: center;
`;

const PreviewImg = styled.img`
  width: 8rem;
  height: 8rem;
  border-radius: var(--border-radius-md);
  object-fit: cover;
  justify-self: center;
  border: 1px solid var(--color-toolbar-input-border);
  background-color: rgba(0, 0, 0, 0.4);
`;

export type CameraCaptureProps = {
  onCapture: (imgBase64: string) => void;
  onAfterStop?: () => void; // optional hook for parent to know camera is done
};

export default function CameraCapture({
  onCapture,
  onAfterStop,
}: CameraCaptureProps): JSX.Element {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewShot, setPreviewShot] = useState<string | null>(null);

  // start camera
  useEffect(() => {
    let active = true;

    async function init() {
      try {
        const media = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: { ideal: "user" }, // front cam
          },
          audio: false,
        });

        if (!active) {
          // if component unmounted before getUserMedia resolved
          media.getTracks().forEach((t) => t.stop());
          return;
        }

        setStream(media);

        if (videoRef.current) {
          videoRef.current.srcObject = media;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setIsReady(true);
          };
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("Camera access refused or not available.");
      }
    }

    init();

    // cleanup on unmount: stop tracks
    return () => {
      active = false;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
    // NOTE: we intentionally do NOT include `stream` in deps here,
    // because we only want this init block to run once on mount,
    // and cleanup to execute current `stream` snapshot on unmount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // helper: stop stream now
  const stopStreamNow = useCallback(() => {
    if (!stream) return;
    stream.getTracks().forEach((track) => track.stop());
    setStream(null);
    setIsReady(false);

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (onAfterStop) onAfterStop();
  }, [stream, onAfterStop]);

  // snapshot + stop
  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const videoEl = videoRef.current;
    const canvasEl = canvasRef.current;
    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;

    // draw current frame
    canvasEl.width = videoEl.videoWidth;
    canvasEl.height = videoEl.videoHeight;
    ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);

    // export frame
    const dataUrl = canvasEl.toDataURL("image/jpeg", 0.9);
    setPreviewShot(dataUrl);
    onCapture(dataUrl);

    // stop camera right after capture
    stopStreamNow();
  }, [onCapture, stopStreamNow]);

  return (
    <Wrapper>
      <VideoBox>
        {errorMsg ? (
          <ErrorBox>{errorMsg}</ErrorBox>
        ) : previewShot ? (
          // after capture, show frozen snapshot instead of live camera
          <img src={previewShot} alt="captured face" />
        ) : (
          <video ref={videoRef} playsInline muted autoPlay />
        )}
      </VideoBox>

      {!previewShot && (
        <CaptureButton
          disabled={!isReady || !!errorMsg}
          onClick={handleCapture}
        >
          {isReady ? "Capture face" : "Initializing camera..."}
        </CaptureButton>
      )}

      {previewShot && (
        <PreviewWrap>
          <PreviewLabel>Captured</PreviewLabel>
          <PreviewImg src={previewShot} alt="preview" />
        </PreviewWrap>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </Wrapper>
  );
}
