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
  display: grid;
  gap: 0.4rem;
`;
const Tag = styled.span`
  display: inline-block;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  font-size: 12px;
  border: 1px solid var(--color-border-card);
  background: var(--color-toolbar-bg);
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <strong>{props.device?.name ?? c.deviceId}</strong>
          <small style={{ opacity: 0.7 }}>
            {new Date(c.tsISO).toLocaleString()}
          </small>
        </div>
        <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap" }}>
          <Tag>score: {c.score ?? "—"}</Tag>
          <Tag>liveness: {c.liveness ?? "unknown"}</Tag>
          <Tag>status: {c.status}</Tag>
          {c.employeeNameGuess && <Tag>guess: {c.employeeNameGuess}</Tag>}
        </div>
        <div style={{ display: "flex", gap: ".6rem", marginTop: ".4rem" }}>
          <Button
            variation="primary"
            size="small"
            onClick={() => props.onAccept(c.id)}
          >
            Accept
          </Button>
          <Button
            variation="danger"
            size="small"
            onClick={() => props.onReject(c.id)}
          >
            Reject
          </Button>
        </div>
      </Meta>
    </Card>
  );
}
