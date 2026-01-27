import styled from "styled-components";
import Button from "../../ui/Button";
import { Capture, Device } from "./DeviceTypes";

const Card = styled.div`
  border: 1px solid var(--color-border-card);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  display: grid;
  grid-template-columns: 160px 1fr;
  background: var(--color-bg-elevated);
`;
const Img = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #000;
`;
const Meta = styled.div`
  padding: 0.8rem 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.2rem;
`;


export default function CaptureCard(props: {
  capture: Capture;
  device?: Device;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const c = props.capture;
  return (
    <Card>
      <Img src={c.imageUrl} alt="capture" />
      <Meta>
        {/* Top Row: Guess (Left) and Timestamp (Right) */}
        {/* Top Section: Guess, Score/Liveness, Timestamp */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', position: 'relative' }}>

          {/* Date absolute top right to be independent */}
          <small style={{ position: 'absolute', top: 0, right: 0, opacity: 0.8, fontSize: "1.1rem", whiteSpace: "nowrap", color: "var(--color-text-dim)" }}>
            {new Date(c.tsISO).toLocaleString()}
          </small>

          {/* Guess */}
          {c.employeeNameGuess ? (
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--color-text-strong)", lineHeight: 1.2, paddingRight: '140px' /* Space for date */ }}>
              guess: {c.employeeNameGuess}
            </div>
          ) : (
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--color-text-dim)", paddingRight: '140px' }}>
              Unknown
            </div>
          )}

          {/* Meta Tags - Directly below Guess */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "1.3rem", color: "var(--color-text-dim)" }}>
              score: <strong style={{ color: "var(--color-text-strong)" }}>{c.score ?? 0}</strong>
            </span>
            <span style={{ fontSize: "1.3rem", color: "var(--color-text-dim)" }}>
              liveness: <strong style={{ color: "var(--color-text-strong)" }}>{c.liveness ?? "pass"}</strong>
            </span>
            <span style={{ fontSize: "1.3rem", color: "var(--color-text-dim)" }}>
              status: <strong style={{ color: "var(--color-text-strong)" }}>{c.status}</strong>
            </span>
          </div>
        </div>

        {/* Buttons - Even Thinner and Controlled Width */}
        {/* Buttons - Bottom Anchored */}
        <div style={{ display: "flex", gap: "1rem", marginTop: "auto", paddingTop: "0.8rem" }}>
          <Button
            size="small"
            onClick={() => props.onAccept(c.id)}
            style={{
              backgroundColor: 'var(--color-green-600)',
              color: 'white',
              border: 'none',
              padding: '0.2rem 1rem',
              fontSize: '1.1rem',
              height: '30px',
              flex: 1,
              maxWidth: '120px'
            }}
          >
            Accept
          </Button>
          <Button
            variation="danger"
            size="small"
            onClick={() => props.onReject(c.id)}
            style={{
              padding: '0.2rem 1rem',
              fontSize: '1.1rem',
              height: '30px',
              flex: 1,
              maxWidth: '120px'
            }}
          >
            Reject
          </Button>
        </div>
      </Meta>
    </Card>
  );
}
