import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { toast } from 'react-hot-toast';

export const useUserUpload = () => {
    const queryClient = useQueryClient();
    const [uploading, setUploading] = useState(false);

    const uploadPhoto = async (userId: string, file: File) => {
        setUploading(true);
        const formData = new FormData();
        formData.append('photo', file);

        try {
            await apiClient.post(`/users/${userId}/photo`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('Profile photo uploaded successfully');
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['user', userId] });
        } catch (error) {
            console.error(error);
            toast.error('Failed to upload profile photo');
        } finally {
            setUploading(false);
        }
    };

    const uploadCV = async (userId: string, file: File) => {
        setUploading(true);
        // backend expects base64 + custom json body for CV? 
        // Wait, let's check backend implementation. 
        // Backend: UploadUserCV(ctx, id, cvData, fileName)
        // Request Body: UploadCVRequest { CvData string, FileName string }
        // So we need to convert file to base64.

        const reader = new FileReader();
        reader.readAsDataURL(file);

        return new Promise<void>((resolve, reject) => {
            reader.onload = async () => {
                try {
                    const base64Content = (reader.result as string).split(',')[1];
                    await apiClient.post(`/users/${userId}/cv`, {
                        cv_data: base64Content,
                        file_name: file.name
                    }); // DTO keys: cv_data, file_name (json tags)

                    toast.success('CV uploaded successfully');
                    queryClient.invalidateQueries({ queryKey: ['users'] });
                    queryClient.invalidateQueries({ queryKey: ['user', userId] });
                    resolve();
                } catch (error) {
                    console.error(error);
                    toast.error('Failed to upload CV');
                    reject(error);
                } finally {
                    setUploading(false);
                }
            };
            reader.onerror = (error) => {
                setUploading(false);
                reject(error);
            };
        });
    };

    return {
        uploadPhoto,
        uploadCV,
        uploading
    };
};
