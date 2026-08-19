# Cahier des Charges — Application de Gestion de Temps

**Projet :** TimeTrack — Suivi d'activités personnelles  
**Version :** 1.0  
**Date :** 19 août 2026  
**Auteur :** [Ton nom]  
**Statut :** Brouillon — en cours de validation

---

## 1. Contexte et Objectifs

### 1.1 Contexte
L'utilisateur souhaite disposer d'une application simple et rapide pour enregistrer le temps passé sur ses différentes activités quotidiennes (travail, études, sport, lecture, projets personnels, etc.). L'objectif est de pouvoir **noter une activité en un clic**, avec la date, l'heure de début, l'heure de fin et le temps total, puis de consulter l'**historique complet** de ces enregistrements.

### 1.2 Objectifs fonctionnels
- Permettre l'enregistrement rapide d'une activité avec ses horodatages.
- Calculer automatiquement la durée d'une session.
- Offrir une vue d'ensemble de l'historique des activités.
- Permettre la recherche et le filtrage de l'historique.
- Exporter les données pour analyse externe.

### 1.3 Objectifs non-fonctionnels
- **Simplicité :** l'ajout d'une activité doit se faire en 3 clics maximum.
- **Rapidité :** temps de réponse < 200 ms pour l'enregistrement.
- **Fiabilité :** aucune perte de données en cas de fermeture brutale.
- **Accessibilité :** fonctionne hors-ligne si possible (PWA).
- **Responsive :** utilisable sur mobile, tablette et desktop.

---

## 2. Périmètre du projet

### 2.1 Inclus (dans la V1)
- Enregistrement manuel d'une session d'activité.
- Timer intégré (démarrer / arrêter) pour le suivi en temps réel.
- Historique avec liste chronologique.
- Filtres par date et par catégorie d'activité.
- Export CSV.
- Stockage local (localStorage / IndexedDB).

### 2.2 Exclus (hors périmètre V1)
- Synchronisation cloud / multi-appareils.
- Authentification utilisateur.
- Statistiques avancées (graphiques, tendances).
- Notifications push.
- Partage social.
- Application native iOS/Android (la V1 est web/PWA).

---

## 3. Description fonctionnelle

### 3.1 Acteurs
| Acteur | Description |
|--------|-------------|
| Utilisateur | Personne qui enregistre et consulte ses activités. Unique acteur dans la V1. |

### 3.2 Cas d'utilisation (Use Cases)

#### UC-01 : Enregistrer une session manuellement
**Précondition :** L'application est ouverte.  
**Déclencheur :** L'utilisateur clique sur "Nouvelle activité".  
**Flux principal :**
1. L'utilisateur saisit le nom de l'activité (ex: "Développement web", "Lecture").
2. L'utilisateur sélectionne la date (par défaut : aujourd'hui).
3. L'utilisateur saisit l'heure de début (par défaut : maintenant).
4. L'utilisateur saisit l'heure de fin (par défaut : maintenant + 1h).
5. Le système calcule automatiquement la durée (fin − début).
6. L'utilisateur clique sur "Enregistrer".
7. Le système sauvegarde la session et affiche un message de confirmation.

**Flux alternatif A — Heure de fin avant heure de début :**
- Le système affiche une erreur : "L'heure de fin doit être postérieure à l'heure de début."

**Flux alternatif B — Champs obligatoires manquants :**
- Le système met en évidence les champs vides et affiche : "Veuillez remplir tous les champs obligatoires."

**Postcondition :** La session est enregistrée et visible dans l'historique.

---

#### UC-02 : Démarrer un timer en temps réel
**Précondition :** L'application est ouverte.  
**Déclencheur :** L'utilisateur clique sur "Démarrer le timer".  
**Flux principal :**
1. L'utilisateur saisit le nom de l'activité.
2. L'utilisateur clique sur "Démarrer".
3. Le système enregistre l'heure de début et lance un chronomètre visible.
4. L'utilisateur travaille sur son activité.
5. L'utilisateur clique sur "Arrêter".
6. Le système enregistre l'heure de fin, calcule la durée et sauvegarde la session.

**Flux alternatif A — Pause :**
- L'utilisateur peut cliquer "Pause" à tout moment. Le chronomètre se fige. "Reprendre" relance le comptage.

**Postcondition :** La session est enregistrée avec les horodatages réels.

---

#### UC-03 : Consulter l'historique
**Précondition :** Au moins une session est enregistrée.  
**Déclencheur :** L'utilisateur accède à l'onglet "Historique".  
**Flux principal :**
1. Le système affiche la liste de toutes les sessions, triées par date décroissante (la plus récente en haut).
2. Chaque ligne affiche : nom de l'activité, date, heure de début, heure de fin, durée totale.
3. L'utilisateur peut faire défiler la liste (scroll infini ou pagination).

---

#### UC-04 : Filtrer l'historique
**Précondition :** L'utilisateur est sur l'écran Historique.  
**Déclencheur :** L'utilisateur utilise les filtres.  
**Flux principal :**
1. L'utilisateur sélectionne une plage de dates (du … au …).
2. OU l'utilisateur saisit un mot-clé dans la barre de recherche (recherche dans le nom de l'activité).
3. Le système met à jour la liste en temps réel pour n'afficher que les sessions correspondantes.
4. L'utilisateur peut réinitialiser les filtres.

---

#### UC-05 : Modifier une session
**Précondition :** L'utilisateur est sur l'écran Historique.  
**Déclencheur :** L'utilisateur clique sur l'icône "Modifier" d'une session.  
**Flux principal :**
1. Le système affiche un formulaire pré-rempli avec les données de la session.
2. L'utilisateur modifie un ou plusieurs champs.
3. L'utilisateur clique sur "Sauvegarder".
4. Le système valide et met à jour la session.

---

#### UC-06 : Supprimer une session
**Précondition :** L'utilisateur est sur l'écran Historique.  
**Déclencheur :** L'utilisateur clique sur l'icône "Supprimer" d'une session.  
**Flux principal :**
1. Le système affiche une boîte de confirmation : "Supprimer cette session ? Cette action est irréversible."
2. L'utilisateur confirme.
3. Le système supprime la session de la base de données.

---

#### UC-07 : Exporter les données
**Précondition :** L'utilisateur est sur l'écran Historique.  
**Déclencheur :** L'utilisateur clique sur "Exporter".  
**Flux principal :**
1. Le système génère un fichier CSV contenant toutes les sessions (ou les sessions filtrées).
2. Le navigateur propose le téléchargement du fichier.
3. Format CSV : `id,activite,date,heure_debut,heure_fin,duree_minutes,notes`

---

## 4. Spécifications de l'interface utilisateur

### 4.1 Écrans principaux

#### Écran 1 — Tableau de bord (Dashboard)
- **Header :** titre de l'app + date du jour.
- **Section Timer :** gros bouton "Démarrer une session" avec un champ de saisie rapide pour le nom de l'activité.
- **Section Résumé du jour :** temps total enregistré aujourd'hui + nombre de sessions.
- **Navigation :** onglets ou menu latéral (Timer / Historique / Paramètres).

#### Écran 2 — Formulaire manuel
- Champ "Nom de l'activité" (texte, autocomplete sur les activités déjà utilisées).
- Champ "Date" (sélecteur de date, défaut = aujourd'hui).
- Champ "Heure de début" (sélecteur d'heure, défaut = maintenant).
- Champ "Heure de fin" (sélecteur d'heure).
- Champ "Notes" (optionnel, textarea).
- Bouton "Enregistrer".
- Bouton "Annuler" (retour au Dashboard).

#### Écran 3 — Timer en cours
- Grand affichage du chronomètre (HH:MM:SS).
- Nom de l'activité affiché en dessous.
- Boutons : Pause / Reprendre / Arrêter.
- Bouton "Annuler" (abandonne la session sans l'enregistrer).

#### Écran 4 — Historique
- Barre de filtres en haut :
  - Recherche textuelle.
  - Sélecteur de plage de dates.
  - Bouton "Réinitialiser les filtres".
- Liste des sessions sous forme de tableau ou de cartes :
  - Colonnes : Activité | Date | Début | Fin | Durée | Actions (✏️ / 🗑️).
- Pied de page : bouton "Exporter en CSV".

#### Écran 5 — Paramètres
- Choix du format d'heure (24h / 12h AM/PM).
- Choix du format de date (JJ/MM/AAAA ou AAAA-MM-JJ).
- Gestion des catégories d'activités (ajouter / renommer / supprimer).
- Bouton "Vider tout l'historique" (avec confirmation).
- À propos / version.

### 4.2 Charte graphique (suggestions)
- **Couleurs :** fond clair, accents sobres (noir/gris pour le texte, une couleur d'accent unique pour les actions principales — ex: vert ou bleu foncé).
- **Typographie :** police sans-serif, lisible, taille minimum 16px sur mobile.
- **Boutons principaux :** pleine largeur sur mobile, coins légèrement arrondis (8px).
- **Feedback :** toast / notification en bas d'écran pour confirmer les actions (succès, erreur).

---

## 5. Modèle de données

### 5.1 Entité principale : `Session`

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `id` | String (UUID) | Oui | Identifiant unique de la session. |
| `activityName` | String | Oui | Nom de l'activité (ex: "Développement web"). |
| `category` | String | Non | Catégorie de l'activité (ex: "Travail", "Loisir"). |
| `date` | String (ISO 8601) | Oui | Date de la session (YYYY-MM-DD). |
| `startTime` | String (HH:MM) | Oui | Heure de début. |
| `endTime` | String (HH:MM) | Oui | Heure de fin. |
| `durationMinutes` | Integer | Oui | Durée calculée en minutes. |
| `notes` | String | Non | Notes libres de l'utilisateur. |
| `createdAt` | Timestamp | Oui | Date de création de l'enregistrement. |
| `updatedAt` | Timestamp | Non | Date de dernière modification. |

### 5.2 Entité secondaire : `Category`

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `id` | String (UUID) | Oui | Identifiant unique. |
| `name` | String | Oui | Nom de la catégorie. |
| `color` | String (hex) | Non | Couleur associée (pour l'UI). |

### 5.3 Relations
- Une `Session` appartient à 0 ou 1 `Category`.
- Une `Category` peut être associée à plusieurs `Session`.

### 5.4 Exemple de données JSON
```json
{
  "sessions": [
    {
      "id": "sess_001",
      "activityName": "Développement front-end",
      "category": "Travail",
      "date": "2026-08-19",
      "startTime": "09:00",
      "endTime": "12:30",
      "durationMinutes": 210,
      "notes": "Mise en place du cahier des charges",
      "createdAt": "2026-08-19T09:00:00Z",
      "updatedAt": "2026-08-19T12:30:00Z"
    }
  ],
  "categories": [
    { "id": "cat_001", "name": "Travail", "color": "#2563EB" },
    { "id": "cat_002", "name": "Sport", "color": "#16A34A" },
    { "id": "cat_003", "name": "Lecture", "color": "#9333EA" }
  ],
  "settings": {
    "timeFormat": "24h",
    "dateFormat": "DD/MM/YYYY"
  }
}
```

---

## 6. Architecture technique

### 6.1 Type d'application
**Application Web Progressive (PWA)** — fonctionne dans le navigateur, installable sur mobile/desktop, fonctionne hors-ligne.

### 6.2 Stack technique suggérée

| Couche | Technologie suggérée | Alternative |
|--------|----------------------|-------------|
| **Frontend** | Vanilla JavaScript + HTML5 + CSS3 | React / Vue / Svelte si tu maîtrises déjà |
| **Stockage** | IndexedDB (via Dexie.js ou idb) | localStorage (plus simple mais limité à 5 Mo) |
| **Build** | Vite (rapide, simple) | Parcel, ou aucun (fichiers statiques) |
| **UI** | CSS custom properties + Flexbox/Grid | Tailwind CSS, Bootstrap |
| **PWA** | Service Worker + manifest.json | — |
| **Export CSV** | Blob + URL.createObjectURL | — |

### 6.3 Structure des fichiers (proposition)
```
timetrack/
├── index.html              # Écran principal (Dashboard + Timer)
├── history.html            # Écran Historique
├── settings.html           # Écran Paramètres
├── css/
│   ├── main.css            # Variables, reset, layout global
│   ├── components.css      # Boutons, cartes, formulaires
│   └── responsive.css      # Media queries mobile/tablet/desktop
├── js/
│   ├── app.js              # Point d'entrée, routing
│   ├── db.js               # Couche d'accès aux données (IndexedDB)
│   ├── timer.js            # Logique du chronomètre
│   ├── session.js          # CRUD des sessions
│   ├── history.js          # Filtrage, tri, affichage historique
│   ├── export.js           # Génération CSV
│   └── utils.js            # Helpers (formatDate, formatTime, UUID, etc.)
├── sw.js                   # Service Worker (cache + offline)
├── manifest.json           # Configuration PWA
└── assets/
    └── icons/              # Icônes 192x192, 512x512
```

### 6.4 Schéma de l'architecture
```
┌─────────────────────────────────────┐
│         Interface Utilisateur        │
│  (HTML + CSS + JS — PWA)            │
├─────────────────────────────────────┤
│         Couche Logique (JS)          │
│  • Validation des formulaires        │
│  • Calcul des durées                 │
│  • Filtrage / Tri                    │
│  • Génération CSV                    │
├─────────────────────────────────────┤
│         Couche Données               │
│  • IndexedDB (stockage local)        │
│  • Service Worker (cache offline)    │
└─────────────────────────────────────┘
```

---

## 7. Règles de gestion (Business Rules)

| ID | Règle | Sévérité |
|----|-------|----------|
| BR-01 | L'heure de fin doit être strictement postérieure à l'heure de début. | Bloquante |
| BR-02 | Le nom de l'activité est obligatoire (min. 1 caractère, max. 100). | Bloquante |
| BR-03 | La durée est calculée automatiquement : `(heure_fin − heure_début)` en minutes. | Système |
| BR-04 | Deux sessions peuvent se chevaucher dans le temps (pas de contrainte d'unicité horaire). | Information |
| BR-05 | La suppression d'une session est définitive (pas de corbeille en V1). | Information |
| BR-06 | L'export CSV utilise le point-virgule (`;`) comme séparateur pour compatibilité Excel (fr). | Information |
| BR-07 | Les données sont stockées uniquement en local (pas de serveur en V1). | Architecture |

---

## 8. Contraintes et exigences

### 8.1 Contraintes techniques
- **Navigateurs cibles :** Chrome, Firefox, Safari, Edge (2 dernières versions majeures).
- **Mobile :** iOS Safari 14+, Chrome Android.
- **Pas de dépendance externe obligatoire** (l'app doit fonctionner sans connexion Internet).
- **Performance :** chargement initial < 2s sur connexion 3G.

### 8.2 Contraintes de sécurité
- Aucune donnée sensible n'est collectée (pas de nom, email, mot de passe).
- Les données restent sur l'appareil de l'utilisateur.

### 8.3 Contraintes de maintenance
- Code commenté en français ou en anglais (cohérent).
- Pas de framework lourd si non nécessaire (privilégier la simplicité).

---

## 9. Plan de développement (phases)

### Phase 1 — MVP (Minimum Viable Product)
- [ ] Structure HTML de base (3 écrans).
- [ ] CSS responsive (mobile first).
- [ ] Stockage localStorage (sessions simples).
- [ ] Formulaire manuel d'ajout.
- [ ] Affichage de l'historique (liste simple).
- [ ] Suppression d'une session.

### Phase 2 — Fonctionnalités core
- [ ] Timer en temps réel (démarrer / pause / arrêter).
- [ ] IndexedDB (remplace localStorage).
- [ ] Modification d'une session.
- [ ] Filtres par date et recherche textuelle.
- [ ] Export CSV.

### Phase 3 — Polish & PWA
- [ ] Service Worker + manifest.json.
- [ ] Mode hors-ligne fonctionnel.
- [ ] Gestion des catégories.
- [ ] Paramètres (format date/heure).
- [ ] Animations et feedback visuels (toasts).
- [ ] Tests manuels sur mobile et desktop.

### Phase 4 — Améliorations futures (V2)
- [ ] Statistiques (temps total par semaine/mois, graphiques).
- [ ] Synchronisation cloud (Firebase, Supabase, ou backend perso).
- [ ] Application native (Capacitor / React Native).
- [ ] Rappels / notifications.

---

## 10. Critères d'acceptation

| ID | Critère | Comment vérifier |
|----|---------|------------------|
| CA-01 | Ajouter une session manuelle en < 10 secondes. | Test chronométré. |
| CA-02 | Le timer affiche le temps écoulé en temps réel (rafraîchissement toutes les secondes). | Test visuel. |
| CA-03 | L'historique affiche toutes les sessions triées par date décroissante. | Test de données. |
| CA-04 | Le filtre par date masque correctement les sessions hors plage. | Test avec 10+ sessions. |
| CA-05 | Le fichier CSV exporté s'ouvre correctement dans Excel/LibreOffice. | Test d'ouverture. |
| CA-06 | L'application fonctionne après fermeture et réouverture du navigateur (données persistées). | Test de persistance. |
| CA-07 | L'application est utilisable sur un écran de 375px de large (iPhone SE). | Test responsive. |

---

## 11. Glossaire

| Terme | Définition |
|-------|------------|
| **Session** | Enregistrement d'une période de temps dédiée à une activité. |
| **Timer** | Chronomètre intégré permettant de mesurer le temps en temps réel. |
| **PWA** | Progressive Web App — application web installable et fonctionnant hors-ligne. |
| **IndexedDB** | Base de données NoSQL intégrée au navigateur pour le stockage local structuré. |
| **CSV** | Comma-Separated Values — format de fichier texte pour l'échange de données tabulaires. |
| **UUID** | Universally Unique Identifier — identifiant unique généré automatiquement. |

---

## 12. Annexes

### Annexe A — Wireframes (suggestions)
- **Mobile :** navigation par onglets en bas de l'écran (3 onglets : Timer | Historique | Paramètres).
- **Desktop :** barre latérale gauche fixe avec les 3 sections, contenu principal à droite.

### Annexe B — Exemple de fichier CSV exporté
```csv
id;activite;categorie;date;heure_debut;heure_fin;duree_minutes;notes
sess_001;Développement front-end;Travail;19/08/2026;09:00;12:30;210;Mise en place CDC
sess_002;Lecture;Loisir;19/08/2026;14:00;15:30;90;Chapitre 3-4
sess_003;Sport;Santé;19/08/2026;18:00;19:00;60;Course à pied
```

---

*Fin du cahier des charges — Version 1.0*
