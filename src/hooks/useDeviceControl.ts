import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { setDeviceMode, syncDevice } from '../services/devices';
import { toast } from 'react-hot-toast';

export const useDeviceControl = () => {
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);

    const handleSetMode = async (id: string, mode: 'enrollment' | 'recognition') => {
        setLoading(true);
        try {
            await setDeviceMode(id, mode);
            toast.success(`Device mode set to ${mode}`);
            queryClient.invalidateQueries({ queryKey: ['devices'] });
        } catch (error) {
            console.error(error);
            toast.error('Failed to set device mode');
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async (id: string) => {
        setLoading(true);
        try {
            await syncDevice(id);
            toast.success('Device sync triggered');
        } catch (error) {
            console.error(error);
            toast.error('Failed to trigger sync');
        } finally {
            setLoading(false);
        }
    };

    return {
        handleSetMode,
        handleSync,
        loading
    };
};
