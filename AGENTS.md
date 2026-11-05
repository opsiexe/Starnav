# AGENTS.md — Contexte du projet Freight Star Citizen

Ce fichier donne le contexte du projet aux agents IA. Lis-le en entier avant de toucher au code. Le détail fonctionnel est dans `docs/SPECIFICATION.md`.

## 1. Le projet en deux phrases

Outil web auto-hébergé pour le freight dans Star Citizen : visualiseur de prix et de trades, visualiseur 3D de soute, et planificateur de routes sous forme de **feuille de route vivante** (étapes à cocher, recalcul sur prix et stocks).
L'utilisateur est un joueur : l'outil **propose**, il ne décide jamais à sa place.

## 2. Règles non négociables

| # | Règle |
|---|---|
| 1 | **Jamais de modification de route ou de cargaison sans confirmation explicite du joueur.** Toute proposition passe par une notification que le joueur accepte ou refuse. |
| 2 | **Après le statut « Chargé », l'itinéraire est verrouillé.** Aucune proposition de changement de cargaison. On peut seulement signaler un risque. |
| 3 | **Le classement des options se fait par rentabilité nette par heure**, pas par seuils de prix. |
| 4 | Le classement est recalculé **depuis la position actuelle** du joueur. |
| 5 | Une proposition doit être **évaluée comme une vraie route** (distance, stock, budget, plan de chargement, coûts) avant d'être notifiée. |
| 6 | Le plan de chargement est présenté en **étapes de chargement**, jamais niveau par niveau. |
| 7 | Le **max de conteneur est défini par grille**, pas par vaisseau. |
| 8 | Toute donnée de prix affiche son **âge**. Ne jamais présenter un prix sans sa fraîcheur. |
| 9 | Aucun secret (clé API, mot de passe) dans le dépôt. |

## 3. Vocabulaire du domaine

| Terme | Sens |
|---|---|
| **SCU** | Standard Cargo Unit, unité de volume de fret. |
| **aUEC** | Monnaie du jeu. |
| **Commodity** | Marchandise échangeable. |
| **Conteneur** | Caisse de 1, 2, 4, 8, 16, 24 ou 32 SCU. |
| **Case** | 1,25 m de côté. Les grilles sont décrites en cases. |
| **Grille (cargo grid)** | Volume où les conteneurs se verrouillent, du sol au plafond. |
| **Trade** | (commodity, lieu d'achat → lieu de vente). |
| **Route** | Suite d'étapes de trade planifiées. |
| **Étape** | Unité de la feuille de route (aller, acheter, charger, transporter, vendre…). |

## 4. Données de conteneurs

| Taille | Dimensions (cases) |
|---|---|
| 1 SCU | 1 × 1 × 1 |
| 2 SCU | 2 × 1 × 1 |
| 4 SCU | 2 × 2 × 1 |
| 8 SCU | 2 × 2 × 2 |
| 16 SCU | 4 × 2 × 2 |
| 24 SCU | 6 × 2 × 2 |
| 32 SCU | 8 × 2 × 2 |

Les conteneurs peuvent être tournés (6 orientations). Un conteneur ne rentre que si sa taille est ≤ au `max_container` de la grille.

## 5. Architecture

```
.
├── apps/
│   ├── web/              # front React + Three.js
│   └── api/              # API et planificateur (Node.js)
├── packages/
│   ├── cargo-engine/     # placement et ordre de chargement
│   ├── route-engine/     # classement, score, recalcul
│   └── shared/           # types et constantes communes
├── data/                 # grilles et vaisseaux versionnés
├── infra/                # Docker Compose, configuration du serveur
└── docs/
```

| Choix | Valeur |
|---|---|
| Langage | TypeScript partout |
| Front | React + Three.js |
| Back | Node.js |
| Base | PostgreSQL |
| Temps réel | Server-Sent Events |
| Déploiement | Docker Compose sur VPS auto-hébergé, derrière un reverse proxy |

Le **moteur cargo** est une bibliothèque partagée : le front et le back doivent utiliser exactement la même logique. Ne pas la dupliquer.

## 6. Règles métier détaillées

### Score de classement

```
score = (ventes − achats − coûts) / temps total estimé
```

- Le temps inclut le trajet depuis la position actuelle → achat → vente, plus la manutention.
- Les coûts incluent la **location du vaisseau**, le **carburant** (hydrogène, quantum) et les autres frais.

### Garde-fous des alertes

- Marge minimale entre l'option suivie et la nouvelle meilleure.
- L'écart doit persister sur plusieurs rafraîchissements.
- Le trajet déjà engagé vers le point d'achat est compté dans le comparatif.
- Vérifier stock et budget avant de proposer.
- Anti-spam : délai entre deux notifications, pas de répétition pour une variation refusée.

### Plan de chargement

1. Disposition finale : plus gros conteneurs d'abord, puis combler.
2. Ordre de chargement : un conteneur n'est posé que si son emplacement est encore atteignable depuis l'entrée.
3. Si aucun ordre valide n'existe, rejeter la disposition et en chercher une autre.
4. Objectif **un seul trajet** : si la quantité exacte est impossible, proposer le maximum rangeable et indiquer le manque.
5. Multi-destinations : l'ordre de chargement respecte l'ordre de déchargement.

### Temps estimé

Temps théorique corrigé par une moyenne mobile exponentielle des écarts réel/prévu, par type d'activité et par vaisseau.

## 7. Conventions de code

| Sujet | Règle |
|---|---|
| Typage | TypeScript strict, pas de `any` sans justification. |
| Nommage | Code et identifiants en anglais, textes d'interface en français. |
| Logique métier | Dans `packages/`, pas dans les composants. |
| Données de jeu | Dans `data/`, versionnées par patch du jeu. |
| Tests | Tout moteur (`cargo-engine`, `route-engine`) a des tests unitaires sur des cas connus. |
| Cas de référence cargo | Freelancer MAX : grille principale 9 × 4 × 3 cases et deux grilles latérales de 1 × 2 × 3, `max_container` 16. |
| Commits | Petits et ciblés, un sujet par commit. |
| Dépendances | Justifier chaque nouvelle dépendance. |

## 8. Données externes

- Mettre en **cache** côté serveur, ne jamais appeler les sources externes à chaque requête.
- Respecter les conditions d'utilisation de chaque source.
- Si une donnée manque (grille, côté d'accès), ne pas l'inventer : la marquer comme manquante et la signaler.
- Les prix du jeu sont collaboratifs et peuvent être faux ou périmés : pénaliser les données anciennes dans le score.

## 9. Façon de collaborer avec le développeur

Le développeur veut **apprendre en construisant**, pas recevoir un projet livré clé en main.

- Avant de créer un fichier, **expliquer à quoi il sert** (son but dans le projet).
- Proposer un **exercice guidé** menant à l'objectif, pas un code complet d'emblée.
- Expliquer les **concepts** et le **pas-à-pas**, pas seulement une phrase par fichier.
- Réponses en **français**, directes et concises.
- Pour une correction, donner la correction courte plutôt qu'un long exposé.
- Préférer les **tableaux** pour comparer ou lister.
- En cas de doute sur un choix de conception, poser **une** question précise plutôt que de deviner.

## 10. À ne pas faire

- Ne pas changer une route automatiquement.
- Ne pas afficher un plan de chargement niveau par niveau.
- Ne pas coder en dur le max de conteneur par vaisseau.
- Ne pas dupliquer le moteur cargo entre front et back.
- Ne pas ajouter de fonctionnalité hors du milestone en cours.
- Ne pas commiter de clés, jetons ou données personnelles.

## 11. Milestone en cours

À mettre à jour à chaque changement de milestone.

**Milestone actuel : M0 — Validation des données.**

| Milestone | Sujet |
|---|---|
| M0 | Validation des données (sources, accès, licences) |
| M1 | Socle du dépôt et données de vaisseaux |
| M2 | Moteur cargo |
| M3 | Collecte et stockage des prix |
| M4 | Visualiseurs de prix et de trades |
| M5 | Visualiseur 3D de soute |
| M6 | Distances, temps et coûts |
| M7 | Générateur de routes |
| M8 | Feuille de route interactive |
| M9 | Alertes et recalcul |
| M10 | Temps adaptatif et profits finaux |
| M11 | Extension et déploiement |

Le détail de chaque milestone (tâches et définition de terminé) est dans `docs/SPECIFICATION.md`.

## 12. Commandes

À compléter quand le dépôt sera initialisé.

| Action | Commande |
|---|---|
| Installer | `à définir` |
| Lancer en développement | `à définir` |
| Tests | `à définir` |
| Build | `à définir` |
| Déployer | `à définir` |
