import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import styled from 'styled-components'
import getCroppedImg from '../../../utils/canvasUtils'
import Button from '../../../ui/Button'
import { HiMagnifyingGlassPlus, HiMagnifyingGlassMinus } from "react-icons/hi2";

const CropperContainer = styled.div`
  position: relative;
  width: 100%;
  height: 300px;
  background: #333;
  border-radius: var(--border-radius-md);
  overflow: hidden;
  margin-bottom: 1.5rem;
`

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0 1rem;
`

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--color-text-dim);
  
  svg {
    width: 2rem;
    height: 2rem;
  }
`

const Slider = styled.input`
  flex: 1;
  -webkit-appearance: none;
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: var(--color-brand-200);
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--color-brand-600);
    cursor: pointer;
    transition: background .15s ease-in-out;
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border: 0;
    border-radius: 50%;
    background: var(--color-brand-600);
    cursor: pointer;
    transition: background .15s ease-in-out;
  }
`

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`

interface AvatarCropperProps {
    imageSrc: string
    onCropComplete: (croppedBlob: Blob) => void
    onCancel: () => void
}

export default function AvatarCropper({ imageSrc, onCropComplete, onCancel }: AvatarCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop)
    }

    const onZoomChange = (zoom: number) => {
        setZoom(zoom)
    }

    const onCropCompleteHandler = useCallback((_: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleSave = async () => {
        try {
            const croppedImage = await getCroppedImg(
                imageSrc,
                croppedAreaPixels
            )
            if (croppedImage) {
                onCropComplete(croppedImage)
            }
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div>
            <CropperContainer>
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={true}
                    onCropChange={onCropChange}
                    onCropComplete={onCropCompleteHandler}
                    onZoomChange={onZoomChange}
                />
            </CropperContainer>

            <Controls>
                <SliderContainer>
                    <HiMagnifyingGlassMinus />
                    <Slider
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="Zoom"
                        onChange={(e) => {
                            setZoom(Number(e.target.value))
                        }}
                    />
                    <HiMagnifyingGlassPlus />
                </SliderContainer>

                <Actions>
                    <Button variation="secondary" onClick={onCancel} type="button">Annuler</Button>
                    <Button onClick={handleSave} type="button">Enregistrer</Button>
                </Actions>
            </Controls>
        </div>
    )
}
