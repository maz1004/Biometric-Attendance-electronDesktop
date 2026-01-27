# Exportation PDF & CSV – Attendance

## 🎯 Objectif

Définir une architecture claire et réutilisable pour l’export **PDF** et **CSV** des rapports d’attendance (daily, weekly, monthly, employee-specific) avec **react-pdf** (pdf-renderer) et un système d’export CSV flexible (sélection de composants / données), sans dépendre de la navigation de l’app.

---

## 🧱 Périmètre des rapports

### Types de PDF

1. **Daily Attendance PDF**
2. **Weekly Attendance PDF**
3. **Monthly Attendance PDF**
4. **Employee-Specific PDF**

> Tous partagent une structure commune + des sections conditionnelles selon le type.

---

## 🧩 Structure Générique d’un PDF

### 1. En-tête (Header – commun)

* Nom de l’entreprise (gauche)
* Type de rapport (Daily / Weekly / Monthly / Employee)
* Date exacte de l’export

### 2. Objet / Intitulé (Title)

* Texte en **gras**
* Exemple :

  > *Liste d’attendance du mois Mars 2026*

### 3. Section conditionnelle AVANT tableau

| Type PDF        | Contenu spécifique                        |
| --------------- | ----------------------------------------- |
| Employee        | Photo de profil + fiche détaillée employé |
| Weekly          | Graphique de ponctualité hebdomadaire     |
| Daily / Monthly | Rien (direct tableau)                     |

### 4. Tableau d’attendance (core)

Colonnes :

* Nom
* Département
* Check-in
* Check-out
* Statut (Present / Late / Absent)

### 5. Statistiques (Footer)

* % Présence
* % Retard
* % Absence
* Taux d’efficacité (PMU)
* Badge visuel (si applicable)

---

## 👤 Cas Spécifique : PDF Employee

### Header enrichi

* Photo de profil (gauche)
* Nom complet
* ID / Département

### Fiche employé (avant tableau)

* Nom
* Prénom
* Email
* Téléphone
* Département
* Poste

> ⚠️ Les données doivent être **réutilisées depuis la modal view** existante (pas de duplication de logique).

### Tableau

* Historique complet d’attendance de l’employé

### Footer

* Statistiques individuelles
* Badge d’efficacité

---

## 📊 Cas Spécifique : PDF Weekly

### Graphique avant tableau

* Graphique **Ponctualité de la semaine**
* Déjà calculé dans l’app
* Injecté comme image (PNG / SVG) ou composant React-PDF

---

## 🧠 Architecture Technique (React)

### Principe clé

> **Un moteur de layout PDF générique + des blocs conditionnels**

### Arborescence suggérée

```
/export
  /pdf
    PdfLayout.tsx        // layout global (header, footer)
    PdfHeader.tsx
    PdfTitle.tsx
    PdfTable.tsx
    PdfStats.tsx
    blocks/
      EmployeeBlock.tsx
      WeeklyGraphBlock.tsx
    reports/
      DailyReport.tsx
      WeeklyReport.tsx
      MonthlyReport.tsx
      EmployeeReport.tsx

  /csv
    exporters/
      attendanceCsv.ts
      employeeCsv.ts
    CsvSchema.ts
```

---

## 📄 Génération PDF (react-pdf)

### Bonnes pratiques

* 1 composant = 1 responsabilité
* Pas de logique métier dans les composants PDF
* Données **préformatées AVANT** l’appel au PDF

### Flow

```
UI → prepareReportData(type) → <ReportPdf data={}/>
```

---

## 📑 Export CSV

### Objectifs

* Export CSV **au lieu de PDF**
* Sélectionner un **sous-ensemble de données / composants**
* CSV ouvrable directement dans Excel / Google Sheets / Word

### Approche

* Pas de rendu visuel
* Mapping direct data → colonnes CSV

### Exemple de schéma

```ts
AttendanceCSVRow = {
  name: string
  department: string
  checkIn: string
  checkOut: string
  status: "present" | "late" | "absent"
}
```

---

## 🧩 Export “à la Facebook” (Composable)

### Besoin

> Sélectionner un composant (ou ses données) et l’exporter **hors app** (CSV / Word)

### Solution conceptuelle

* Chaque composant expose un **export adapter**

```ts
interface Exportable<T> {
  getExportData(): T[]
}
```

### Avantages

* Export indépendant du rendu UI
* Réutilisable (PDF, CSV, Word)
* Testable facilement

---

## 🧪 Points de vigilance

* Pagination PDF (tables longues)
* Fuseaux horaires (check-in/out)
* Cohérence stats ↔ tableau
* Performance (pré-calcul des stats)

---

## 🚀 Évolutions futures

* Export Word (.docx)
* Templates custom par entreprise
* Signature numérique PDF
* Historique des exports

---

## ✅ Résumé

* Un **layout PDF générique**
* Des **blocs conditionnels par type de rapport**
* Données préparées en amont
* CSV = moteur parallèle, pas un sous-produit du PDF
* Export composable et découplé de l’UI

---

> Ce document sert de **repère technique** pour Antigravity afin de travailler proprement, sans bricolage ni duplication.
