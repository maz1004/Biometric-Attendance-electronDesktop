import { apiClient } from './api';

export interface SiblingSite {
    id: string;
    name: string;
    location?: string;
    is_active?: boolean;
    organization_id?: string;
    api_url?: string;
    last_sync_at?: string;
}

/**
 * Récupère les sites frères configurés sur le Control Plane.
 * Accessible uniquement si l'Edge local est en mode Master.
 */
export const getSiblingSites = async (): Promise<SiblingSite[]> => {
    try {
        const response = await apiClient.get('/system/sibling-sites');
        return response.data?.data || response.data || [];
    } catch (error: any) {
        // Si 403 (Non Master) ou 404, on retourne un tableau vide silencieusement
        if (error.response?.status === 403 || error.response?.status === 404) {
            return [];
        }
        console.error("Erreur lors de la récupération des Sibling Sites:", error);
        return [];
    }
};
