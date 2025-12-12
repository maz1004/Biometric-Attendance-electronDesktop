// Client HTTP principal pour les appels API
import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL, API_VERSION, API_TIMEOUT } from './config/api';

// Création de l'instance Axios
export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}${API_VERSION}`,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur de requête (pour ajouter le token si nécessaire)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Récupérer le token depuis localStorage (clé 'token' comme dans le backend)
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse (gestion globale des erreurs)
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Gestion des erreurs communes (401, 403, 500)
    if (error.response) {
      const { status } = error.response;
      const errorData = error.response.data as any;

      if (status === 401) {
        // Non autorisé - supprimer le token et rediriger vers login
        console.warn('Non autorisé - Redirection vers login');
        localStorage.removeItem('token');
        // window.location.href = '/login'; // À activer si besoin
      } else if (status === 403) {
        console.warn('Accès interdit - Permissions insuffisantes');
      } else if (status === 500) {
        console.error('Erreur serveur:', errorData?.error || errorData?.message);
      }
    }
    return Promise.reject(error);
  }
);


