# 📁 Services API - Architecture

## Structure des Services

```
services/
├── config/
│   └── api.ts              # Configuration API (URL, timeout, etc.)
├── types/
│   └── index.ts            # Types TypeScript partagés
├── api.ts                  # Client HTTP principal
├── auth.ts                 # Authentification (login, logout, tokens)
├── employees.ts            # Gestion des employés
├── biometric.ts            # Biométrie (enrôlement, reconnaissance)
├── attendance.ts           # Pointage et présences
├── planning.ts             # Planning et shifts
├── users.ts                # Utilisateurs système (admins, managers)
├── health.ts               # Health checks des services
└── index.ts                # Export centralisé
```

## Modules

### 🔐 auth.ts
- `login()` - Connexion utilisateur
- `logout()` - Déconnexion
- `getCurrentUser()` - Récupération utilisateur courant
- `refreshToken()` - Rafraîchissement du token
- `updatePassword()` - Mise à jour du mot de passe

### 👥 employees.ts
- `getEmployees()` - Liste des employés (avec filtres)
- `getEmployee()` - Détails d'un employé
- `createEmployee()` - Création d'un employé
- `updateEmployee()` - Mise à jour d'un employé
- `deleteEmployee()` - Suppression d'un employé

### 🔬 biometric.ts
- `enrollEmployee()` - Enrôlement biométrique
- `recognize()` - Reconnaissance faciale/iris
- `extractEmbedding()` - Extraction d'embedding
- `checkQuality()` - Vérification qualité d'image

### 📊 attendance.ts
- `getAttendance()` - Liste des pointages
- `getAttendanceStats()` - Statistiques de présence
- `createAttendance()` - Création d'un pointage
- `updateAttendance()` - Mise à jour d'un pointage
- `validateAnomaly()` - Validation d'anomalie
- `exportAttendance()` - Export CSV/PDF

### 📅 planning.ts
- `getPlanning()` - Récupération du planning hebdomadaire
- `createShift()` - Création d'un shift
- `updateShift()` - Mise à jour d'un shift
- `deleteShift()` - Suppression d'un shift
- `duplicateShift()` - Duplication d'un shift
- `createTeam()` - Création d'une équipe
- `updateTeam()` - Mise à jour d'une équipe
- `deleteTeam()` - Suppression d'une équipe

### 👤 users.ts
- `getUsers()` - Liste des utilisateurs système
- `getUser()` - Détails d'un utilisateur
- `createUser()` - Création d'un utilisateur
- `updateUser()` - Mise à jour d'un utilisateur
- `deleteUser()` - Suppression d'un utilisateur

### ❤️ health.ts
- `checkHealth()` - Vérification santé globale
- `checkFaceServiceHealth()` - Santé du service facial
- `checkIrisServiceHealth()` - Santé du service iris

## Configuration

Les variables d'environnement sont définies dans `config/api.ts` :
- `VITE_API_URL` : URL de base du backend (défaut: `http://localhost:8080`)
- `API_VERSION` : Version de l'API (`/api/v1`)
- `API_TIMEOUT` : Timeout des requêtes (30s)

## Utilisation

```typescript
import { getEmployees, enrollEmployee } from '@/services';

// Utilisation dans un composant
const employees = await getEmployees({ page: 1, limit: 10 });
const result = await enrollEmployee({ 
  employeeId: 'EMP-001', 
  imageBase64: 'data:image/jpeg;base64,...' 
});
```

## État Actuel

⚠️ **Tous les services sont des stubs** - Les fonctions lancent `Error('Not implemented')`  
✅ **Architecture complète** - Structure prête pour l'implémentation  
📝 **Types définis** - Interfaces TypeScript complètes

## Prochaines Étapes

1. Implémenter le client HTTP dans `api.ts` (axios ou fetch)
2. Ajouter les intercepteurs (auth, errors, retry)
3. Implémenter chaque service progressivement
4. Ajouter la gestion d'erreurs centralisée
5. Intégrer avec React Query dans les hooks

