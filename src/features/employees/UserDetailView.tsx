import styled from "styled-components";
import { Employee } from "./EmployeeTypes";
import Button from "../../ui/Button";
import { HiCamera, HiDocumentText, HiArrowDownTray, HiPencil, HiEye } from "react-icons/hi2";
import EfficiencyBadge from "./components/EfficiencyBadge";
import { useRef, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiClient, getUserAttendanceStats } from "../../services";
import Spinner from "../../ui/Spinner";
import toast from "react-hot-toast";
import SecureImage from "../../ui/SecureImage";
import AvatarCropper from "./components/AvatarCropper";
import Modal from "../../ui/Modal";
import AbsenceHistoryView from "./AbsenceHistoryView";

// --- Styled Components ---

const Viewport = styled.div`
  width: 800px;
  height: 600px;
  overflow: hidden;
  position: relative;
`;

const Slider = styled.div<{ $view: 'details' | 'history' }>`
  display: flex;
  width: 200%;
  height: 100%;
  transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  transform: translateX(${props => props.$view === 'details' ? '0' : '-50%'});
`;

const Slide = styled.div`
  width: 50%;
  height: 100%;
  flex-shrink: 0;
  overflow-y: auto;
  
  /* Custom Scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--color-grey-300);
    border-radius: 3px;
  }
`;

const DetailContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  padding-right: 1rem;
`;

const Wrapper = styled.div`
  width: 100%;
  min-width: 650px; /* Kept for reference, but strictly controlled by parent Viewport now */
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
`;

const Header = styled.div`
  display: flex;
  gap: 2.5rem;
  align-items: flex-start;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--color-border-card);
`;

const AvatarContainer = styled.div`
  position: relative;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid var(--color-grey-200);
  background: var(--color-grey-100);
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: var(--shadow-md);

  &:hover .overlay {
    opacity: 1;
  }
`;

const AvatarImg = styled(SecureImage)`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AvatarOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.2s;
  font-size: 1.2rem;
  font-weight: 500;
  gap: 0.5rem;
`;

const Info = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  justify-content: center;
`;

const Name = styled.h1`
  font-size: 2.6rem;
  font-weight: 700;
  color: var(--color-text-strong);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const Meta = styled.div`
  font-size: 1.5rem;
  color: var(--color-text-dim);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Tag = styled.span<{ type: "role" | "dept" }>`
  background: ${props => props.type === "role" ? "var(--color-brand-100)" : "var(--color-grey-100)"};
  color: ${props => props.type === "role" ? "var(--color-brand-700)" : "var(--color-grey-700)"};
  padding: 0.4rem 0.8rem;
  border-radius: 100px;
  font-size: 1.2rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const StatCard = styled.div`
  background: var(--color-bg-elevated);
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-border-card);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    border-color: var(--color-brand-500);
    box-shadow: var(--shadow-md);
  }

  h3 {
    font-size: 1.3rem;
    color: var(--color-text-dim);
    margin-bottom: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .value {
    font-size: 3.6rem;
    font-weight: 800;
    color: var(--color-text-strong);
    line-height: 1;
  }

  .sub {
    font-size: 1.2rem;
    color: var(--color-text-dim);
    margin-top: 0.5rem;
  }
`;

const CardOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.4));
  backdrop-filter: blur(3px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  /* Text & Icon Styles */
  color: #fff;
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;

  & svg {
    width: 3.2rem;
    height: 3.2rem;
    margin-bottom: 0.5rem;
    transform: translateY(-10px);
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    color: var(--color-brand-200);
  }

  ${StatCard}:hover & {
    opacity: 1;
    & svg {
      transform: translateY(0);
    }
  }
`;

const Documents = styled.div`
  padding-top: 1rem;
`;

const SectionTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  h2 {
    font-size: 1.8rem;
    font-weight: 600;
    color: var(--color-text-strong);
    margin: 0;
  }
`;

const DocCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  border: 1px solid var(--color-border-card);
  border-radius: var(--border-radius-md);
  background: var(--color-bg-elevated);
  transition: border-color 0.2s;

  &:hover {
    border-color: var(--color-brand-500);
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 1rem;
`;

const IdentityInfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 2rem 0;
  border-top: 1px solid var(--color-border-card);
  border-bottom: 1px solid var(--color-border-card);
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  label {
    font-size: 1.2rem;
    color: var(--color-text-dim);
    text-transform: uppercase;
    font-weight: 600;
  }
  
  span {
    font-size: 1.4rem;
    color: var(--color-text-strong);
    font-weight: 500;
  }
`;

interface UserDetailViewProps {
  employee: Employee;
  onCloseModal?: () => void;
}

export default function UserDetailView({ employee }: UserDetailViewProps) {
  const {
    id,
    firstName,
    lastName,
    role,
    department,
    createdAt,
    avatar,
    cv,
    stats,
  } = employee;

  const queryClient = useQueryClient();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [view, setView] = useState<'details' | 'history'>('details');

  const { data: realStats } = useQuery({
    queryKey: ['userStats', id, 'month'],
    queryFn: () => getUserAttendanceStats(id, 'month'),
    enabled: !!id
  });

  const displayStats = {
    presenceRatePct: realStats ? Math.round((realStats.present_days / realStats.total_days) * 100) : stats?.presenceRatePct || 0,
    lateCount30d: realStats ? realStats.late_days : stats?.lateCount30d || 0,
    absenceCount30d: realStats ? realStats.absent_days : stats?.absenceCount30d || 0,
    efficiencyScore: realStats ? Math.round(realStats.punctuality_rate) : stats?.efficiencyScore || 0
  };

  const { mutate: uploadAvatar } = useMutation({
    mutationFn: async (file: File) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const base64String = reader.result?.toString().split(',')[1];
          if (base64String) {
            apiClient.post(`/users/${id}/photo`, {
              photo_data: base64String,
              file_name: file.name
            }).then(res => resolve(res.data)).catch(reject);
          } else {
            reject(new Error("Failed to encode image"));
          }
        };
        reader.onerror = error => reject(error);
      });
    },
    onSuccess: () => {
      toast.success("Avatar updated successfully");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setIsUploading(false);
    },
    onError: (err: any) => {
      toast.error("Failed to upload avatar: " + err.message);
      setIsUploading(false);
    }
  });

  const { mutate: uploadCV } = useMutation({
    mutationFn: async (file: File) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const base64String = reader.result?.toString().split(',')[1];
          if (base64String) {
            apiClient.post(`/users/${id}/cv`, {
              cv_data: base64String,
              file_name: file.name
            }).then(res => resolve(res.data)).catch(reject);
          } else {
            reject(new Error("Failed to encode PDF"));
          }
        };
        reader.onerror = error => reject(error);
      });
    },
    onSuccess: () => {
      toast.success("CV uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setIsUploading(false);
    },
    onError: (err: any) => {
      toast.error("Failed to upload CV: " + err.message);
      setIsUploading(false);
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cv') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (type === 'avatar') {
        const reader = new FileReader();
        reader.onload = () => {
          setSelectedImage(reader.result as string);
        };
        reader.readAsDataURL(file);
        e.target.value = "";
      } else {
        setIsUploading(true);
        uploadCV(file);
      }
    }
  };

  const handleCropSave = (croppedBlob: Blob) => {
    const file = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });
    setIsUploading(true);
    uploadAvatar(file);
    setSelectedImage(null);
  };

  const handleCropCancel = () => {
    setSelectedImage(null);
  };

  if (selectedImage) {
    return (
      <Viewport>
        <Wrapper style={{ alignItems: 'center', justifyContent: 'center', minHeight: '400px', height: '100%' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--color-text-strong)', marginBottom: '2rem' }}>Ajuster la photo</h2>
          <AvatarCropper
            imageSrc={selectedImage}
            onCropComplete={handleCropSave}
            onCancel={handleCropCancel}
          />
        </Wrapper>
      </Viewport>
    );
  }

  return (
    <Viewport>
      <Slider $view={view}>
        {/* SLIDE 1: User Details */}
        <Slide>
          <DetailContent>
            {/* 1. Header: Avatar + Name */}
            <Header>
              <AvatarContainer onClick={() => !isUploading && avatarInputRef.current?.click()}>
                <AvatarImg src={avatar || "/default-user.jpg"} />
                <AvatarOverlay className="overlay">
                  {isUploading ? <Spinner /> : <><HiCamera size={28} /><span>Change</span></>}
                </AvatarOverlay>
              </AvatarContainer>
              <HiddenInput
                type="file"
                ref={avatarInputRef}
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'avatar')}
              />

              <Info>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                  <Name>
                    {firstName} {lastName}
                    <EfficiencyBadge score={displayStats.efficiencyScore} />
                  </Name>

                  <Modal.Open opens="edit-employee">
                    <Button size="small" variation="secondary">
                      <HiPencil /> Edit
                    </Button>
                  </Modal.Open>
                </div>

                <Meta>
                  <Tag type="role">{role}</Tag>
                  <span>•</span>
                  <Tag type="dept">{department}</Tag>
                </Meta>
              </Info>
            </Header>

            {/* 2. Stats */}
            <StatsGrid>
              <StatCard>
                <h3>Presence</h3>
                <div className="value" style={{ color: 'var(--color-brand-600)' }}>{displayStats.presenceRatePct}%</div>
                <div className="sub">Last 30 Days</div>
              </StatCard>
              <StatCard>
                <h3>Lateness</h3>
                <div className="value" style={{ color: 'var(--color-warning-500)' }}>{displayStats.lateCount30d}</div>
                <div className="sub">Late arrivals</div>
              </StatCard>



              {/* Converted Absences Card to Switch View */}
              <StatCard onClick={() => setView('history')}>
                <h3>Absences</h3>
                <div className="value" style={{ color: 'var(--color-danger-500)' }}>{displayStats.absenceCount30d}</div>
                <div className="sub">Unexcused</div>

                <CardOverlay>
                  <HiEye />
                  <span>Détail</span>
                </CardOverlay>
              </StatCard>
            </StatsGrid>

            {/* 3. Details (2 Columns) */}
            <IdentityInfoGrid>
              <InfoItem>
                <label>Date of Birth</label>
                <span>{employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
              </InfoItem>
              <InfoItem>
                <label>Joined Date</label>
                <span>{new Date(createdAt).toLocaleDateString()}</span>
              </InfoItem>
              <InfoItem>
                <label>Email</label>
                <span>{employee.email || 'N/A'}</span>
              </InfoItem>
              <InfoItem>
                <label>Phone Number</label>
                <span>{employee.phoneNumber || 'N/A'}</span>
              </InfoItem>
            </IdentityInfoGrid>

            {/* 4. Documents */}
            <Documents>
              <SectionTitle>
                <h2>Documents</h2>
                <Button
                  size="small"
                  variation="secondary"
                  onClick={() => cvInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? <Spinner /> : "Upload New CV"}
                </Button>
                <HiddenInput
                  type="file"
                  ref={cvInputRef}
                  accept="application/pdf"
                  onChange={(e) => handleFileChange(e, 'cv')}
                />
              </SectionTitle>

              {cv ? (
                <DocCard>
                  <HiDocumentText size={32} color="var(--color-brand-600)" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '1.2rem' }}>Curriculum Vitae</div>
                    <div style={{ fontSize: '1.1rem', color: 'var(--color-text-dim)' }}>PDF Document</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                      size="small"
                      variation="secondary"
                      onClick={() => window.open(cv, '_blank')}
                    >
                      <HiArrowDownTray /> Download
                    </Button>
                  </div>
                </DocCard>
              ) : (
                <div style={{
                  padding: '2rem',
                  textAlign: 'center',
                  border: '2px dashed var(--color-border-card)',
                  borderRadius: 'var(--border-radius-md)',
                  color: 'var(--color-text-dim)'
                }}>
                  No CV uploaded yet.
                </div>
              )}
            </Documents>
          </DetailContent>
        </Slide>

        {/* SLIDE 2: Absence History */}
        <Slide>
          <AbsenceHistoryView
            employee={employee}
            onCloseModal={() => setView('details')}
          />
        </Slide>
      </Slider>
    </Viewport>
  );
}
