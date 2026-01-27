# 📡 Architecture Services Frontend - Liaison Backend

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Structure Créée](#structure-créée)
3. [Mapping Frontend ↔ Backend](#mapping-frontend--backend)
4. [État Actuel](#état-actuel)
5. [Ce qui Manque](#ce-qui-manque)
6. [Plan d'Implémentation](#plan-dimplémentation)
7. [Exemples d'Utilisation](#exemples-dutilisation)
8. [Intégration avec React Query](#intégration-avec-react-query)

---

## 🎯 Vue d'ensemble

Ce document décrit l'architecture des services API créés dans `src/services/` pour connecter le frontend React/Electron au backend Go.

### Objectif

Créer une couche d'abstraction propre entre le frontend et le backend qui :
- ✅ Centralise tous les appels API
- ✅ Fournit des types TypeScript stricts
- ✅ Gère l'authentification automatiquement
- ✅ Simplifie l'utilisation dans les composants React
- ✅ Facilite la maintenance et les tests

---

## 📁 Structure Créée

```
src/services/
├── config/
│   └── api.ts              # Configuration API (URL, timeout)
├── types/
│   └── index.ts            # Types TypeScript partagés
├── api.ts                  # Client HTTP principal (À IMPLÉMENTER)
├── auth.ts                 # Authentification (6 fonctions)
├── employees.ts            # Gestion employés (5 fonctions)
├── biometric.ts            # Biométrie (4 fonctions)
├── attendance.ts           # Pointage (6 fonctions)
├── planning.ts             # Planning (8 fonctions)
├── users.ts                # Utilisateurs système (5 fonctions)
├── health.ts               # Health checks (3 fonctions)
├── index.ts                # Export centralisé
└── README.md               # Documentation
```

### Modules Créés

#### 🔐 `auth.ts` - Authentification
- `login()` - Connexion utilisateur
- `logout()` - Déconnexion
- `getCurrentUser()` - Récupération utilisateur courant
- `refreshToken()` - Rafraîchissement du token
- `updatePassword()` - Mise à jour du mot de passe

#### 👥 `employees.ts` - Gestion Employés
- `getEmployees()` - Liste des employés (avec filtres)
- `getEmployee()` - Détails d'un employé
- `createEmployee()` - Création d'un employé
- `updateEmployee()` - Mise à jour d'un employé
- `deleteEmployee()` - Suppression d'un employé

#### 🔬 `biometric.ts` - Biométrie
- `enrollEmployee()` - Enrôlement biométrique
- `recognize()` - Reconnaissance faciale/iris
- `extractEmbedding()` - Extraction d'embedding
- `checkQuality()` - Vérification qualité d'image

#### 📊 `attendance.ts` - Pointage
- `getAttendance()` - Liste des pointages
- `getAttendanceStats()` - Statistiques de présence
- `createAttendance()` - Création d'un pointage
- `updateAttendance()` - Mise à jour d'un pointage
- `validateAnomaly()` - Validation d'anomalie
- `exportAttendance()` - Export CSV/PDF

#### 📅 `planning.ts` - Planning
- `getPlanning()` - Récupération du planning hebdomadaire
- `createShift()` - Création d'un shift
- `updateShift()` - Mise à jour d'un shift
- `deleteShift()` - Suppression d'un shift
- `duplicateShift()` - Duplication d'un shift
- `createTeam()` - Création d'une équipe
- `updateTeam()` - Mise à jour d'une équipe
- `deleteTeam()` - Suppression d'une équipe

#### 👤 `users.ts` - Utilisateurs Système
- `getUsers()` - Liste des utilisateurs système
- `getUser()` - Détails d'un utilisateur
- `createUser()` - Création d'un utilisateur
- `updateUser()` - Mise à jour d'un utilisateur
- `deleteUser()` - Suppression d'un utilisateur

#### ❤️ `health.ts` - Health Checks
- `checkHealth()` - Vérification santé globale
- `checkFaceServiceHealth()` - Santé du service facial
- `checkIrisServiceHealth()` - Santé du service iris

---

## 🔗 Mapping Frontend ↔ Backend

### Tableau de Correspondance

| Fonctionnalité Frontend | Service | Fonction | Endpoint Backend | État |
|------------------------|---------|----------|-----------------|------|
| **Authentification** |
| Login | `auth.ts` | `login()` | `POST /api/v1/auth/login` | ❌ Non implémenté |
| Logout | `auth.ts` | `logout()` | `POST /api/v1/auth/logout` | ❌ Non implémenté |
| User courant | `auth.ts` | `getCurrentUser()` | `GET /api/v1/auth/me` | ❌ Non implémenté |
| **Employés** |
| Liste employés | `employees.ts` | `getEmployees()` | `GET /api/v1/users?page=1&limit=10` | ❌ Non implémenté |
| Détails employé | `employees.ts` | `getEmployee()` | `GET /api/v1/users/:id` | ❌ Non implémenté |
| Créer employé | `employees.ts` | `createEmployee()` | `POST /api/v1/users` | ❌ Non implémenté |
| Modifier employé | `employees.ts` | `updateEmployee()` | `PUT /api/v1/users/:id` | ❌ Non implémenté |
| Supprimer employé | `employees.ts` | `deleteEmployee()` | `DELETE /api/v1/users/:id` | ❌ Non implémenté |
| **Biométrie** |
| Enrôlement | `biometric.ts` | `enrollEmployee()` | `POST /api/v1/biometric/enroll` | ❌ Non implémenté |
| Reconnaissance | `biometric.ts` | `recognize()` | `POST /api/v1/biometric/recognize` | ❌ Non implémenté |
| Extraction embedding | `biometric.ts` | `extractEmbedding()` | `POST /api/v1/facial/extract` | ❌ Non implémenté |
| Vérification qualité | `biometric.ts` | `checkQuality()` | `POST /api/v1/facial/quality` | ❌ Non implémenté |
| **Pointage** |
| Liste pointages | `attendance.ts` | `getAttendance()` | `GET /api/v1/attendance?period=day` | ❌ Non implémenté |
| Statistiques | `attendance.ts` | `getAttendanceStats()` | `GET /api/v1/attendance/stats` | ❌ Non implémenté |
| Créer pointage | `attendance.ts` | `createAttendance()` | `POST /api/v1/attendance` | ❌ Non implémenté |
| Valider anomalie | `attendance.ts` | `validateAnomaly()` | `POST /api/v1/attendance/:id/validate` | ❌ Non implémenté |
| Export CSV/PDF | `attendance.ts` | `exportAttendance()` | `GET /api/v1/attendance/export?format=csv` | ❌ Non implémenté |
| **Planning** |
| Planning semaine | `planning.ts` | `getPlanning()` | `GET /api/v1/planning/week/:weekISO` | ❌ Non implémenté |
| Créer shift | `planning.ts` | `createShift()` | `POST /api/v1/planning/shifts` | ❌ Non implémenté |
| Modifier shift | `planning.ts` | `updateShift()` | `PUT /api/v1/planning/shifts/:id` | ❌ Non implémenté |
| Supprimer shift | `planning.ts` | `deleteShift()` | `DELETE /api/v1/planning/shifts/:id` | ❌ Non implémenté |
| Créer équipe | `planning.ts` | `createTeam()` | `POST /api/v1/planning/teams` | ❌ Non implémenté |
| **Health** |
| Health global | `health.ts` | `checkHealth()` | `GET /api/v1/health` | ❌ Non implémenté |
| Health face service | `health.ts` | `checkFaceServiceHealth()` | `GET /api/v1/facial/health` | ❌ Non implémenté |

---

## ⚠️ État Actuel

### ✅ Ce qui est Fait

1. **Architecture complète** : Tous les fichiers de services créés
2. **Types TypeScript** : Interfaces définies pour toutes les réponses
3. **Structure modulaire** : Un service par domaine métier
4. **Export centralisé** : Point d'entrée unique via `index.ts`
5. **Documentation** : README avec liste des fonctions

### ❌ Ce qui Manque

1. **Client HTTP** : `api.ts` est vide (stub)
2. **Implémentation** : Toutes les fonctions lancent `Error('Not implemented')`
3. **Authentification** : Pas de gestion de tokens JWT
4. **Intercepteurs** : Pas de gestion d'erreurs/retry
5. **Configuration** : Variables d'environnement non utilisées
6. **Intégration React Query** : Pas encore connecté aux hooks

---

## 🔧 Ce qui Manque - Détails

### 1. Client HTTP (`api.ts`)

**État actuel :**
```typescript
export const apiClient = {
  // À implémenter
};
```

**À implémenter :**
- ✅ Instance HTTP (axios ou fetch)
- ✅ Configuration base URL
- ✅ Intercepteur pour ajouter le token JWT
- ✅ Intercepteur pour gérer les erreurs
- ✅ Retry logic pour les requêtes échouées
- ✅ Timeout configurable
- ✅ Gestion des erreurs réseau

**Exemple de structure :**
```typescript
import axios from 'axios';
import { API_BASE_URL, API_VERSION, API_TIMEOUT } from './config/api';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}${API_VERSION}`,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Gestion d'erreurs centralisée
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 2. Implémentation des Services

**État actuel :**
```typescript
export const login = async (credentials: LoginCredentials) => {
  // TODO: POST /api/v1/auth/login
  throw new Error('Not implemented');
};
```

**À implémenter :**
Chaque fonction doit faire un appel HTTP réel au backend.

**Exemple :**
```typescript
export const login = async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
  const response = await apiClient.post('/auth/login', credentials);
  return response;
};
```

### 3. Gestion d'Authentification

**À créer :**
- Stockage du token (localStorage ou sessionStorage)
- Refresh automatique du token
- Déconnexion automatique si token expiré
- Context React pour l'état d'authentification

### 4. Variables d'Environnement

**À créer :** `.env` ou `.env.local`
```env
VITE_API_URL=http://localhost:8080
VITE_API_TIMEOUT=30000
```

### 5. Intégration avec les Hooks Existants

**Fichiers à modifier :**
- `src/features/employees/useEmployees.ts` - Remplacer données mockées
- `src/features/attendance/useAttendance.ts` - Remplacer données mockées
- `src/features/planning/usePlanning.ts` - Remplacer données mockées
- `src/features/authentication/useUser.ts` - Connecter à `auth.ts`

---

## 📋 Plan d'Implémentation

### Phase 1 : Infrastructure (Priorité 🔴)

1. **Installer axios** (ou utiliser fetch natif)
   ```bash
   npm install axios
   ```

2. **Implémenter `api.ts`**
   - Client HTTP avec axios
   - Intercepteurs (auth, errors)
   - Retry logic
   - Gestion timeout

3. **Créer `.env.local`**
   ```env
   VITE_API_URL=http://localhost:8080
   ```

### Phase 2 : Authentification (Priorité 🔴)

1. **Implémenter `auth.ts`**
   - `login()` - POST /api/v1/auth/login
   - `logout()` - POST /api/v1/auth/logout
   - `getCurrentUser()` - GET /api/v1/auth/me
   - `refreshToken()` - POST /api/v1/auth/refresh

2. **Créer AuthContext**
   - Gestion état utilisateur
   - Stockage token
   - Refresh automatique

3. **Modifier `LoginForm.tsx`**
   - Utiliser `login()` du service
   - Gérer les erreurs
   - Redirection après login

### Phase 3 : Services Métier (Priorité 🟡)

1. **Implémenter `employees.ts`**
   - Toutes les fonctions CRUD
   - Gestion upload avatar

2. **Implémenter `biometric.ts`**
   - `enrollEmployee()` - Envoi image base64
   - `recognize()` - Reconnaissance
   - `checkQuality()` - Vérification qualité

3. **Implémenter `attendance.ts`**
   - Liste avec filtres
   - Statistiques
   - Export CSV/PDF

4. **Implémenter `planning.ts`**
   - Gestion shifts
   - Gestion équipes

### Phase 4 : Intégration React Query (Priorité 🟡)

1. **Modifier `useEmployees.ts`**
   ```typescript
   import { useQuery, useMutation } from '@tanstack/react-query';
   import { getEmployees, createEmployee } from '@/services';
   
   export function useEmployees() {
     const { data, isLoading } = useQuery({
       queryKey: ['employees'],
       queryFn: () => getEmployees(),
     });
     
     const createMutation = useMutation({
       mutationFn: createEmployee,
       onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['employees'] });
       },
     });
     
     return { employees: data?.data?.data || [], isLoading, createMutation };
   }
   ```

2. **Modifier `useAttendance.ts`**
   - Remplacer données mockées
   - Utiliser React Query avec filtres

3. **Modifier `usePlanning.ts`**
   - Remplacer données mockées
   - Mutations pour CRUD

### Phase 5 : Tests et Validation (Priorité 🟢)

1. **Tests de connexion**
   - Health check backend
   - Test CORS
   - Test authentification

2. **Tests fonctionnels**
   - Enrôlement biométrique
   - Reconnaissance
   - Pointage

---

## 💡 Exemples d'Utilisation

### Exemple 1 : Login

```typescript
// Dans LoginForm.tsx
import { login } from '@/services';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

function LoginForm() {
  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      if (response.success && response.data) {
        localStorage.setItem('token', response.data.token);
        toast.success('Connexion réussie');
        navigate('/dashboard');
      }
    },
    onError: (error) => {
      toast.error('Erreur de connexion');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({
      email: 'user@example.com',
      password: 'password',
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
    </form>
  );
}
```

### Exemple 2 : Liste Employés

```typescript
// Dans useEmployees.ts
import { useQuery } from '@tanstack/react-query';
import { getEmployees } from '@/services';

export function useEmployees(filters?: EmployeeFilters) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['employees', filters],
    queryFn: () => getEmployees(filters),
  });

  return {
    employees: data?.data?.data || [],
    total: data?.data?.total || 0,
    isLoading,
    error,
  };
}
```

### Exemple 3 : Enrôlement Biométrique

```typescript
// Dans EnrollFaceModal.tsx
import { enrollEmployee } from '@/services';
import { useMutation } from '@tanstack/react-query';

function EnrollFaceModal({ employee, onCloseModal }) {
  const enrollMutation = useMutation({
    mutationFn: enrollEmployee,
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Enrôlement réussi');
        onCloseModal();
        // Invalider le cache des employés
        queryClient.invalidateQueries({ queryKey: ['employees'] });
      }
    },
    onError: (error) => {
      toast.error('Erreur lors de l\'enrôlement');
    },
  });

  const handleEnroll = (imageBase64: string) => {
    enrollMutation.mutate({
      employeeId: employee.id,
      imageBase64,
    });
  };

  return (
    <AutoCaptureFaceOnly onAutoCapture={handleEnroll} />
  );
}
```

### Exemple 4 : Reconnaissance (Pointage)

```typescript
// Dans Checkin.tsx ou Mobile App
import { recognize } from '@/services';
import { useMutation } from '@tanstack/react-query';

function Checkin() {
  const recognizeMutation = useMutation({
    mutationFn: recognize,
    onSuccess: (response) => {
      if (response.success && response.data?.identified) {
        toast.success(`Bienvenue ${response.data.employeeId}`);
        // Créer le pointage automatiquement
      } else {
        toast.error('Reconnaissance échouée');
      }
    },
  });

  const handleCapture = (imageBase64: string) => {
    recognizeMutation.mutate({
      imageBase64,
      deviceId: 'DEVICE-001',
      includeIris: true,
    });
  };

  return (
    <CameraCapture onCapture={handleCapture} />
  );
}
```

---

## 🔄 Intégration avec React Query

### Configuration React Query

Déjà configuré dans `App.tsx` :
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60 * 1000 },
  },
});
```

### Pattern d'Utilisation

**Pour les lectures (GET) :**
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['resource', filters],
  queryFn: () => getResource(filters),
});
```

**Pour les écritures (POST/PUT/DELETE) :**
```typescript
const mutation = useMutation({
  mutationFn: createResource,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['resource'] });
  },
});
```

### Cache Management

- **Invalidation** : Après création/modification
- **Refetch** : Sur focus de la fenêtre
- **Stale time** : 60 secondes par défaut

---

## 📝 Checklist de Complétion

### Infrastructure
- [ ] Installer axios (ou utiliser fetch)
- [ ] Implémenter `api.ts` avec intercepteurs
- [ ] Créer `.env.local` avec variables
- [ ] Tester connexion backend (health check)

### Authentification
- [ ] Implémenter toutes les fonctions de `auth.ts`
- [ ] Créer AuthContext pour état global
- [ ] Modifier `LoginForm.tsx` pour utiliser le service
- [ ] Gérer refresh token automatique
- [ ] Protéger les routes avec `ProtectedRoute`

### Services Métier
- [ ] Implémenter `employees.ts` (5 fonctions)
- [ ] Implémenter `biometric.ts` (4 fonctions)
- [ ] Implémenter `attendance.ts` (6 fonctions)
- [ ] Implémenter `planning.ts` (8 fonctions)
- [ ] Implémenter `users.ts` (5 fonctions)
- [ ] Implémenter `health.ts` (3 fonctions)

### Intégration Frontend
- [ ] Modifier `useEmployees.ts` avec React Query
- [ ] Modifier `useAttendance.ts` avec React Query
- [ ] Modifier `usePlanning.ts` avec React Query
- [ ] Modifier `useUser.ts` avec React Query
- [ ] Connecter `EnrollFaceModal` à `enrollEmployee()`
- [ ] Connecter `Checkin` à `recognize()`

### Tests
- [ ] Tester login/logout
- [ ] Tester CRUD employés
- [ ] Tester enrôlement biométrique
- [ ] Tester reconnaissance
- [ ] Tester pointage
- [ ] Tester export CSV/PDF

---

## 🎯 Conclusion

### État Actuel
✅ **Architecture complète** - Structure prête  
❌ **Implémentation manquante** - Tous les services sont des stubs  
📝 **Types définis** - Interfaces TypeScript complètes  

### Prochaines Étapes
1. **Implémenter `api.ts`** (client HTTP)
2. **Implémenter `auth.ts`** (authentification)
3. **Implémenter les services métier** un par un
4. **Intégrer avec React Query** dans les hooks
5. **Tester** chaque fonctionnalité

### Temps Estimé
- Phase 1 (Infrastructure) : 2-3h
- Phase 2 (Auth) : 2-3h
- Phase 3 (Services) : 8-10h
- Phase 4 (Intégration) : 4-6h
- **Total** : ~20-25h

---

**Date de création** : 2024  
**Version** : 1.0.0  
**Statut** : Architecture créée, implémentation en attente

