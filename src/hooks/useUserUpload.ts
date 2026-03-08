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
            await apiClient.post(`/admin/users/${userId}/photo`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
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
        const formData = new FormData();
        formData.append('cv', file);

        try {
            await apiClient.post(`/admin/users/${userId}/cv`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success('CV uploaded successfully');
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['user', userId] });
        } catch (error) {
            console.error(error);
            toast.error('Failed to upload CV');
        } finally {
            setUploading(false);
        }
    };

    return {
        uploadPhoto,
        uploadCV,
        uploading
    };
};
