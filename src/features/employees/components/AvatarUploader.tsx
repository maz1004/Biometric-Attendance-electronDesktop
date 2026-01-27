import { useRef, useState, useEffect } from "react";
import styled from "styled-components";
import { HiCamera, HiTrash } from "react-icons/hi2";
import AvatarCropper from "./AvatarCropper";
import Heading from "../../../ui/Heading";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.6rem;
`;

const AvatarContainer = styled.div`
  position: relative;
  width: 14rem;
  height: 14rem;
`;

const Avatar = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--color-brand-100);
  background-color: var(--color-grey-100);
`;

const UploadOverlay = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  background: var(--color-brand-600);
  color: white;
  padding: 0.8rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: var(--shadow-sm);

  &:hover {
    background: var(--color-brand-700);
    transform: scale(1.1);
  }

  svg {
    width: 2rem;
    height: 2rem;
  }
`;

const DeleteButton = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  background: var(--color-red-600);
  color: white;
  padding: 0.6rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: var(--shadow-sm);
  z-index: 2;

  &:hover {
    background: var(--color-red-700);
    transform: scale(1.1);
  }

  svg {
    width: 1.6rem;
    height: 1.6rem;
  }
`;

const CropperWrapper = styled.div`
  width: 100%;
  max-width: 500px;
`;

interface AvatarUploaderProps {
    defaultImage?: string;
    onImageChanged: (file: File | null) => void;
    disabled?: boolean;
}

export default function AvatarUploader({
    defaultImage,
    onImageChanged,
    disabled = false,
}: AvatarUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [preview, setPreview] = useState<string>(
        defaultImage || "/default-user.jpg"
    );

    // Sync with defaultImage if it changes (e.g. edit mode loaded)
    useEffect(() => {
        if (defaultImage) {
            setPreview(defaultImage);
        }
    }, [defaultImage]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
            // Reset input
            e.target.value = "";
        }
    };

    const handleCropSave = (croppedBlob: Blob) => {
        // Generate file
        const file = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });

        // Update parent
        onImageChanged(file);

        // Update local preview
        const url = URL.createObjectURL(croppedBlob);
        setPreview(url);

        // Close cropper
        setSelectedImage(null);
    };

    const handleCropCancel = () => {
        setSelectedImage(null);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onImageChanged(null);
        setPreview("/default-user.jpg");
    };

    if (selectedImage) {
        return (
            <CropperWrapper>
                <Heading as="h4">Ajuster la photo</Heading>
                <AvatarCropper
                    imageSrc={selectedImage}
                    onCropComplete={handleCropSave}
                    onCancel={handleCropCancel}
                />
            </CropperWrapper>
        );
    }

    return (
        <Container>
            <AvatarContainer>
                <Avatar
                    src={preview}
                    alt="Avatar"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = "/default-user.jpg";
                    }}
                />
                {!disabled && (
                    <UploadOverlay onClick={() => fileInputRef.current?.click()}>
                        <HiCamera />
                    </UploadOverlay>
                )}
                {!disabled && preview !== "/default-user.jpg" && (
                    <DeleteButton onClick={handleDelete} title="Supprimer la photo">
                        <HiTrash />
                    </DeleteButton>
                )}
            </AvatarContainer>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleFileChange}
                disabled={disabled}
            />
        </Container>
    );
}
