import styled from "styled-components";
import Button from "../../ui/Button";
import { Capture, Device } from "./DeviceTypes";
import { useTranslation } from "react-i18next";
import SecureImage from "../../ui/SecureImage";

const Card = styled.div`
  border: 1px solid var(--color-border-card);
  border-radius: var(--border-radius-md);
  display: grid;
  grid-template-columns: 160px 1fr;
  background: var(--color-bg-elevated);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    z-index: 10;
  }
`;
const Img = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #000;
  border-top-left-radius: var(--border-radius-md);
  border-bottom-left-radius: var(--border-radius-md);
  /* Auto-correct EXIF rotation tag */
  image-orientation: from-image;
`;
const Meta = styled.div`
  padding: 0.8rem 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.2rem;
`;

const NameWrapper = styled.div`
  position: relative;
  display: inline-block;
  cursor: help;
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-text-strong);
  line-height: 1.2;
  padding-right: 140px; /* Space for date */

  &:hover .hover-photo {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
`;

const HoverPhoto = styled.div`
  position: absolute;
  bottom: 100%;
  left: 0;
  margin-bottom: 8px;
  width: 140px;
  height: 140px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-card);
  border-radius: var(--border-radius-md);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  opacity: 0;
  visibility: hidden;
  transform: translateY(5px);
  transition: all 0.2s ease;
  z-index: 999;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    /* Auto-correct EXIF rotation tag */
    image-orientation: from-image;
  }
`;

export default function CaptureCard(props: {
  capture: Capture;
  device?: Device;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const { t } = useTranslation();
  const c = props.capture;

  return (
    <Card>
      <Img src={c.imageUrl} alt="capture" />
      <Meta>
        {/* Top Section: Guess, Score/Liveness, Timestamp */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', position: 'relative' }}>

          {/* Date absolute top right to be independent */}
          <small style={{ position: 'absolute', top: 0, right: 0, opacity: 0.8, fontSize: "1.1rem", whiteSpace: "nowrap", color: "var(--color-text-dim)" }}>
            {new Date(c.tsISO).toLocaleString()}
          </small>

          {/* Guess */}
          {c.employeeNameGuess ? (
            <NameWrapper>
              {c.score === 0 ? "Saisie manuelle :" : `${t("devices.validation.card.guess")}:`} {c.employeeNameGuess}
              {c.employeePhotoUrl && (
                <HoverPhoto className="hover-photo">
                  <SecureImage
                    src={c.employeePhotoUrl}
                    alt={c.employeeNameGuess}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </HoverPhoto>
              )}
            </NameWrapper>
          ) : (
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--color-text-dim)", paddingRight: '140px' }}>
              {t("devices.validation.card.unknown")}
            </div>
          )}

          {/* Meta Tags - Directly below Guess */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "1.3rem", color: "var(--color-text-dim)" }}>
              {t("devices.validation.card.score")}: <strong style={{ color: "var(--color-text-strong)" }}>{c.score ?? 0}</strong>
            </span>
            <span style={{ fontSize: "1.3rem", color: "var(--color-text-dim)" }}>
              {t("devices.validation.card.liveness")}: <strong style={{ color: "var(--color-text-strong)" }}>{t(`devices.validation.card.values.${c.liveness}`)}</strong>
            </span>
            <span style={{ fontSize: "1.3rem", color: "var(--color-text-dim)" }}>
              {t("devices.validation.card.status")}: <strong style={{ color: "var(--color-text-strong)" }}>{t(`devices.validation.card.values.${c.status}`)}</strong>
            </span>
          </div>
        </div>

        {/* Buttons - Bottom Anchored */}
        {c.status === "pending" && (
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
              {t("devices.validation.card.accept")}
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
              {t("devices.validation.card.reject")}
            </Button>
          </div>
        )}
      </Meta>
    </Card>
  );
}
