# Starnav Star Citizen

Outil web **dynamique** de freight pour Star Citizen. Il répond à une question : *avec mon vaisseau, mon budget et ma position, qu'est-ce que j'achète, où, où je le revends, et dans quel ordre ?*

Auto-hébergé sur VPS.

---

## Sommaire

1. [Principes](#1-principes)
2. [Fonctionnalités](#2-fonctionnalités)
3. [Planificateur de routes](#3-planificateur-de-routes)
4. [Module cargo](#4-module-cargo)
5. [Profits](#5-profits)
6. [Données](#6-données)
7. [Architecture](#7-architecture)
8. [Modèle de données](#8-modèle-de-données)
9. [Déploiement](#9-déploiement)
10. [Milestones](#10-milestones)
11. [Questions ouvertes](#11-questions-ouvertes)
12. [Risques](#12-risques)

---

## 1. Principes

| Principe | Description |
|---|---|
| **Le joueur décide** | L'outil propose, il n'impose jamais. Aucun changement de route ou de cargaison sans validation explicite. |
| **Feuille de route vivante** | Une route est un plan de « journée » avec des étapes à cocher, pas une liste figée. |
| **Dynamique** | Prix et stocks changent en permanence : l'outil les surveille et réévalue. |
| **Cargo intégré** | Chaque transaction produit un plan de chargement avec les plus gros conteneurs d'abord. |
| **Rentabilité nette** | Le profit tient compte de la distance, du temps, du carburant et du coût du vaisseau. |

---

## 2. Fonctionnalités

### 2.1 Modules de base

Équivalents de [SC Trade Tools](https://sc-trade.tools) et [sc-cargo.space](https://sc-cargo.space).

| # | Module | Contenu |
|---|---|---|
| A | Visualiseur de prix | Prix d'achat et de vente par commodity et par lieu, stocks, fraîcheur de la donnée. |
| B | Visualiseur de trades | Un trade = (commodity, lieu d'achat → lieu de vente) avec marge, volume réalisable, distance. |
| C | Visualiseur 3D de soute | Grille cargo de chaque vaisseau du jeu, placement des conteneurs. |

### 2.2 Modules avancés

| # | Module | Contenu |
|---|---|---|
| D | Planificateur de routes | Entrées : vaisseau, budget, lieu de départ. Sortie : feuille de route multi-étapes. |
| E | Suivi d'exécution | Étapes cochables, statuts (chargement, en route…), temps ajusté au rythme réel. |
| F | Moteur de classement et d'alertes | Classe les options de trade et propose une meilleure option quand elle apparaît. |
| G | Gestion des profits | Profit prévu et réel, coûts (location, carburant), ajustement du prix de vente, bilan de route. |

---

## 3. Planificateur de routes

### 3.1 Entrées

| Entrée | Rôle |
|---|---|
| Vaisseau | Capacité, grilles, max de conteneur par grille, vitesse, consommation. |
| Budget (aUEC) | Plafond d'achat par route. |
| Lieu de départ | Point de départ du premier déplacement. |
| Contraintes (optionnel) | Rayon max, systèmes exclus, durée max. |

### 3.2 Contenu d'une route

Une suite d'**étapes** ordonnées : aller au point d'achat → acheter et charger → transporter → vendre et décharger → éventuel nouveau cycle.

Chaque étape d'achat porte : commodity, quantité, prix unitaire estimé, plan de chargement.
Chaque étape de vente porte : lieu, prix unitaire estimé, profit estimé.
La route porte un **temps prévu** global, et un temps prévu par trade.

### 3.3 Statuts d'une étape

```
À faire → En route → Arrivé → Chargement → Chargé → En route (vente) → Arrivé → Déchargement → Terminé
```

| Statut | Rôle |
|---|---|
| En route | Alimente le temps de trajet réel. |
| Chargement / Déchargement | Alimente le temps de manutention (selon le nombre de conteneurs). |
| **Chargé** | **Verrouille l'itinéraire** : plus aucune proposition de changement de cargaison. |
| Terminé | Clôt l'étape et fige son profit réel. |

### 3.4 Classement des options et alertes

Le planificateur ne fonctionne pas par seuils de prix mais par **classement**.

**Principe**

1. À la création de la route, toutes les options de trade accessibles (vaisseau, budget, position) sont classées par **rentabilité nette par heure**.
2. La route démarre sur l'option n° 1.
3. À chaque rafraîchissement des prix, le classement est recalculé **depuis la position actuelle**.
4. Si l'option suivie n'est plus la meilleure, la nouvelle n° 1 est **évaluée comme une vraie route** (distance, stock, budget, plan de chargement, coûts).
5. Si elle est pertinente, une **notification** propose le changement avec le comparatif. Le joueur accepte ou refuse.

**Score de classement**

```
score = (ventes − achats − coûts) / temps total estimé
```

Le temps total inclut le trajet depuis la position actuelle jusqu'au point d'achat, puis jusqu'au point de vente.

**Garde-fous**

| Garde-fou | Raison |
|---|---|
| **Marge minimale** : la nouvelle option doit dépasser l'option suivie d'un écart configurable. | Évite que deux options très proches se doublent sans cesse. |
| **Persistance** : l'écart doit tenir sur plusieurs rafraîchissements consécutifs. | Évite de réagir à une variation passagère. |
| **Coût déjà engagé** : le trajet déjà effectué vers le point d'achat est pris en compte dans le comparatif. | Une option meilleure sur le papier peut l'être moins une fois le détour compté. |
| **Vérification de stock et de budget** avant toute proposition. | Évite de proposer une option inachetable. |
| **Anti-spam** : délai minimum entre deux notifications, pas de répétition pour une même variation refusée. | Garde les alertes utiles. |
| **Verrouillage après chargement** : plus de proposition une fois « Chargé ». | Le joueur est engagé, l'outil ne change pas l'itinéraire. |

Une fois la cargaison chargée, l'outil peut uniquement **signaler** un risque (ex. prix de vente effondré à destination) sans rien modifier.

### 3.5 Gestion des distances

| Élément | Effet sur les propositions |
|---|---|
| Distance départ → achat → vente | Entre dans le temps estimé, donc dans le score. |
| Carburant | Quantum et hydrogène, consommés selon la distance, déduits du profit. |
| Rayon maximum | Exclut les options trop lointaines. |
| **Routes chaînées** | Favorise les ventes proches d'un prochain point d'achat pour éviter les trajets à vide. |
| Position actuelle | Le classement est recalculé depuis l'endroit où se trouve le joueur. |

### 3.6 Estimation du temps (« comme une liseuse »)

Un temps **théorique** de départ, corrigé par le rythme réel du joueur.

| Étape | Temps théorique | Ajustement |
|---|---|---|
| Trajet | Distance ÷ vitesse (quantum et SCM). | Ratio réel ÷ théorique observé. |
| Chargement / déchargement | Nombre de conteneurs × temps moyen. | Ratio observé sur les sessions. |
| Temps fixes | Atterrissage, ascenseur, ouverture, achat. | Moyenne des durées observées. |

Méthode : **moyenne mobile exponentielle** des écarts réel/prévu, par type d'activité et par vaisseau.

---

## 4. Module cargo

### 4.1 Objectif

Pour une quantité à transporter : produire la **meilleure combinaison de conteneurs** et un **plan de chargement en étapes**, en privilégiant les **plus gros conteneurs** pour réduire le temps de chargement.

### 4.2 Règles du jeu à modéliser

| Règle | Conséquence |
|---|---|
| Conteneurs de 1, 2, 4, 8, 16, 24, 32 SCU, en cases de 1,25 m. | Dimensions fixes en cases. |
| Le **max de conteneur varie par vaisseau et par grille**. | Stocker `max_container` par grille. |
| Une grille se décrit en cases L × l × h ; un vaisseau peut en avoir plusieurs. | Modèle « vaisseau → grilles ». |
| Le joueur peut tourner un conteneur en pitch et yaw au placement. | Les 6 orientations sont possibles. |
| Le jeu verrouille les conteneurs sur la grille, du sol au plafond. | Empilement possible dans le volume de la grille. |
| Tous les vaisseaux ne sont pas louables. | Champ `rentable` à connaître pour le choix du vaisseau. |

Exemples de max de conteneur relevés sur le wiki : Freelancer MAX 16, Hull A 16, Cutlass Black 2, Constellation Taurus 16, C2 Hercules 32. Le Caterpillar a quatre soutes à 24 SCU max et une soute avant à 16 SCU max.

### 4.3 Plan de chargement en étapes

Le plan n'est pas affiché niveau par niveau. Il est présenté comme une **suite d'étapes de chargement**, parce qu'un emplacement vide peut devenir **inaccessible** une fois les gros conteneurs posés.

**Principe**

1. Calculer la disposition finale (les plus gros d'abord, puis combler).
2. Déterminer l'**ordre de chargement** : un conteneur ne peut être posé que si son emplacement est encore atteignable depuis l'entrée de la soute avec les conteneurs déjà posés.
3. Si aucun ordre valide n'existe pour une disposition, la rejeter et en chercher une autre.
4. Regrouper les conteneurs de même taille voisins en une seule étape.

**Exemple de rendu**

| Étape | Action |
|---|---|
| 1 | Poser 2 × 16 SCU tout au fond, côté gauche. |
| 2 | Poser 2 × 16 SCU tout au fond, côté droit. |
| 3 | Combler les vides latéraux avec 4 × 4 SCU. |
| 4 | Finir par 2 × 2 SCU près de la porte. |

**Cas multi-destinations** : l'ordre de chargement respecte l'ordre de déchargement, pour ne pas bloquer l'accès au cargo de la première destination.

**Donnée nécessaire** : par grille, le **côté d'accès** (porte, rampe, ascenseur) et la taille maximale de conteneur qui passe. Cette donnée n'est pas disponible dans les sources de grille et sera saisie à la main.

### 4.4 Visualisation 3D

| Choix | Détail |
|---|---|
| Rendu | **React + Three.js**, comme sc-cargo.space (son auteur dit l'avoir construit pour apprendre React et Three.js). |
| Fonctions | Caméra libre, plusieurs vaisseaux côte à côte, conteneurs colorés par taille. |
| Lecture du plan | Lecture étape par étape avec rejeu de l'ordre de chargement. |
| Grilles non officielles | Interrupteur pour afficher les placements non officiels (idée vue sur sc-cargo.space : emplacements en rouge). |

### 4.5 Moteur de placement

Le moteur est une **bibliothèque TypeScript partagée** entre le front (visualisation) et le back (calcul des routes), pour que les deux utilisent exactement la même logique.

---

## 5. Profits

### 5.1 Calcul

```
profit net = ventes − achats − coûts
```

| Poste de coût | Mode |
|---|---|
| **Location du vaisseau** | Prix et durée de location au terminal choisi, répartis sur les routes de la période. |
| **Carburant** (hydrogène, quantum) | Estimé selon la distance et le vaisseau, ajustable à la saisie. |
| Autres frais (assurance, réparations, frais divers) | Saisie manuelle par ligne. |

### 5.2 Fonctions

| Fonction | Description |
|---|---|
| Profit prévu | Par trade et par route, coûts inclus. |
| Profit réel | Basé sur les montants saisis à la clôture de chaque étape. |
| **Ajustement du prix de vente** | Le joueur corrige le prix réel obtenu ; le profit final est recalculé. |
| Bilan de route | À « Route terminée » : profit total ajusté, durée réelle, profit par heure. |
| Historique | Routes passées, utilisées pour recalibrer les estimations. |

---

## 6. Données

### 6.1 Sources

| Source | Usage | Validation |
|---|---|---|
| UEX Corp (API publique) | Prix, stocks, terminaux, commodities. Le wiki Star Citizen cite UEX pour ses prix. | Milestone M0 : accès, quotas, licence de réutilisation. |
| API du wiki Star Citizen | Fiches des vaisseaux, capacités. | Milestone M0 : présence des dimensions de grille et du max de conteneur. |
| Pages wiki par vaisseau | Capacité, max de conteneur, louable ou non, prix de location par terminal. | Relevé manuel pour compléter. |
| Guide de référence des grilles de la communauté (cité comme inspiration de sc-cargo.space) | Disposition des grilles. | Milestone M1 : vérifier le contenu. |
| Saisie manuelle | Grilles manquantes, côtés d'accès, grilles non officielles. | Interface d'édition (M8). |

### 6.2 Règles de qualité

- Afficher l'**âge** de chaque prix.
- Pénaliser dans le score les données anciennes ou isolées.
- Mettre en **cache** côté serveur ; ne jamais interroger les sources à chaque clic.
- **Versionner** les données de vaisseaux par patch du jeu.
- Respecter les conditions d'utilisation de chaque source.

---

## 7. Architecture

### 7.1 Composants

| Composant | Rôle |
|---|---|
| Collecteur | Récupère périodiquement les données externes. |
| Base de données | Prix historisés, terminaux, vaisseaux, grilles, routes, sessions. |
| API | Prix, calcul de routes, placement cargo. |
| Moteur de routes | Génère les routes, classe les options, recalcule. |
| Moteur cargo | Placement et ordre de chargement. |
| Front web | Écrans de prix, trades, planificateur, 3D. |
| Notifications | Alertes en temps réel dans l'interface. |

### 7.2 Stack

| Élément | Choix |
|---|---|
| Langage | TypeScript, front et back |
| Front | React + Three.js |
| Back | Node.js |
| Base | PostgreSQL |
| Temps réel | Server-Sent Events (WebSocket si besoin d'échanges dans les deux sens) |
| Conteneurs | Docker |

### 7.3 Structure du dépôt

```
.
├── apps/
│   ├── web/              # front React + Three.js
│   └── api/              # API et planificateur
├── packages/
│   ├── cargo-engine/     # placement et ordre de chargement
│   ├── route-engine/     # classement, score, recalcul
│   └── shared/           # types et constantes communes
├── data/                 # grilles et vaisseaux versionnés
├── infra/                # Docker Compose, configuration du serveur
└── docs/
```

---

## 8. Modèle de données

| Entité | Champs principaux |
|---|---|
| `Ship` | id, nom, louable, vitesse, capacité totale, consommation |
| `CargoGrid` | id, ship_id, nom, L, l, h (cases), `max_container`, côté d'accès |
| `Container` | taille (SCU), dimensions en cases |
| `Commodity` | id, nom, catégorie |
| `Location` | id, nom, système, type, coordonnées |
| `PriceSnapshot` | commodity_id, location_id, prix achat/vente, stock, horodatage, source |
| `Trade` | commodity, lieu d'achat, lieu de vente, marge, volume max, distance |
| `Route` | id, vaisseau, budget, départ, statut, temps prévu, profit prévu |
| `RouteStep` | route_id, type, ordre, statut, temps prévu/réel, plan de chargement |
| `LoadingPlan` | step_id, étapes de chargement ordonnées, conteneurs par étape |
| `CostLine` | route_id, type (location, carburant, autre), montant, mode (estimé / saisi) |
| `Alert` | route_id, option proposée, comparatif, état (proposée / acceptée / refusée) |
| `SessionStat` | type d'activité, ratio réel/prévu |

---

## 9. Déploiement

Auto-hébergé sur VPS.

| Élément | Détail |
|---|---|
| Orchestration | Docker Compose |
| Exposition | Reverse proxy existant du serveur, avec HTTPS |
| Services | `web`, `api`, `collector`, `postgres` |
| Planification | Tâches périodiques de collecte des prix (cron ou ordonnanceur interne) |
| Sauvegardes | Dump PostgreSQL planifié |
| Configuration | Variables d'environnement, aucun secret dans le dépôt |

---

## 10. Milestones

Chaque milestone a un objectif, des tâches et une **définition de terminé**. On ne passe au suivant que quand le précédent est terminé.

### M0 — Validation des données

Objectif : savoir précisément ce qu'on peut obtenir.

- [ ] Tester l'accès à l'API de prix (UEX) : endpoints, authentification, quotas.
- [ ] Lire les conditions d'utilisation et la licence de réutilisation.
- [ ] Inspecter l'API du wiki : champs de vaisseau, capacités, grilles.
- [ ] Lister ce qui manque (dimensions de grilles, côtés d'accès, prix de location).
- [ ] Décider des sources retenues.

**Terminé quand** : un document liste, par donnée nécessaire, sa source et ses limites.

### M1 — Socle du dépôt et données de vaisseaux

- [ ] Créer le dépôt et la structure (apps, packages, data).
- [ ] Définir les types partagés (`Ship`, `CargoGrid`, `Container`).
- [ ] Saisir les grilles de 3 à 5 vaisseaux de départ (Freelancer MAX, Hull A, Cutlass Black, Constellation Taurus, Caterpillar).
- [ ] Mettre en place les tests du paquet partagé.

**Terminé quand** : les vaisseaux de départ se chargent depuis `data/` avec leurs grilles validées.

### M2 — Moteur cargo

- [ ] Placement des conteneurs dans une grille (toutes orientations).
- [ ] Contrainte de max de conteneur par grille.
- [ ] Objectif « un seul trajet » : maximum rangeable si la quantité exacte est impossible.
- [ ] Ordre de chargement avec test d'accessibilité depuis l'entrée.
- [ ] Génération du plan en étapes.
- [ ] Tests sur cas connus (Freelancer MAX, 120 SCU).

**Terminé quand** : le moteur produit un plan en étapes valide pour chaque vaisseau de départ.

### M3 — Collecte et stockage des prix

- [ ] Schéma PostgreSQL des commodities, lieux et prix.
- [ ] Collecteur périodique avec cache.
- [ ] Historisation des prix avec horodatage.
- [ ] Mesure de la fraîcheur des données.

**Terminé quand** : la base se met à jour toute seule et on connaît l'âge de chaque prix.

### M4 — Visualiseurs de prix et de trades

- [ ] Écran prix par commodity et par lieu, avec stocks.
- [ ] Écran trades individuels : marge, volume, distance.
- [ ] Tri et filtres.
- [ ] Affichage de la fraîcheur.

**Terminé quand** : on peut trouver les meilleurs trades à vue, avec des données à jour.

### M5 — Visualiseur 3D de soute

- [ ] Scène React + Three.js d'une grille.
- [ ] Conteneurs colorés par taille, caméra libre.
- [ ] Rejeu du plan de chargement étape par étape.
- [ ] Sélecteur de vaisseau.

**Terminé quand** : le plan du moteur cargo s'affiche et se rejoue en 3D.

### M6 — Distances, temps et coûts

- [ ] Modèle de distances entre lieux.
- [ ] Estimation du temps de trajet.
- [ ] Estimation du carburant.
- [ ] Coût de location du vaisseau.
- [ ] Calcul du profit net.

**Terminé quand** : chaque trade affiche un temps et un profit net estimés.

### M7 — Générateur de routes

- [ ] Classement des options par rentabilité nette par heure.
- [ ] Génération d'une route à partir (vaisseau, budget, départ).
- [ ] Routes chaînées.
- [ ] Plan de chargement par étape d'achat.

**Terminé quand** : une route complète et chiffrée est générée.

### M8 — Feuille de route interactive

- [ ] Étapes cochables et statuts complets.
- [ ] Verrouillage de l'itinéraire à « Chargé ».
- [ ] Suivi des temps réels.
- [ ] Interface de saisie des grilles manquantes.

**Terminé quand** : on suit une route pas à pas pendant une vraie session de jeu.

### M9 — Alertes et recalcul

- [ ] Recalcul du classement depuis la position actuelle.
- [ ] Marge minimale, persistance, coût déjà engagé, anti-spam.
- [ ] Notifications avec acceptation ou refus.
- [ ] Aucune modification sans confirmation.

**Terminé quand** : l'outil propose une meilleure option sans jamais changer la route seul.

### M10 — Temps adaptatif et profits finaux

- [ ] Moyenne mobile des écarts réel/prévu.
- [ ] Ajustement du prix de vente à la clôture.
- [ ] Bilan de route.
- [ ] Historique des routes.

**Terminé quand** : les estimations de temps se resserrent après quelques routes.

### M11 — Extension et déploiement

- [ ] Couverture de tous les vaisseaux de fret.
- [ ] Grilles non officielles avec interrupteur.
- [ ] Déploiement Docker Compose sur le VPS, HTTPS, sauvegardes.
- [ ] Surveillance de la collecte.

**Terminé quand** : l'outil tourne en continu sur le serveur.

---

## 11. Questions ouvertes

| Question | Pourquoi elle compte |
|---|---|
| Quelle source de prix est utilisable techniquement et légalement ? | Conditionne tout l'outil (M0). |
| Outil personnel ou public ? | Charge, comptes, conditions d'utilisation. |
| Comment obtenir les dimensions de toutes les grilles ? | Aucune source unique identifiée. |
| Comment modéliser distances et temps de trajet quantum ? | Impact direct sur le classement. |
| Quel format pour les côtés d'accès des grilles ? | Nécessaire à l'ordre de chargement. |
| Quel comportement si la source de prix tombe ? | Robustesse en pleine session. |

---

## 12. Risques

| Risque | Gravité | Parade |
|---|---|---|
| Source de prix indisponible ou interdite | Haute | Valider en M0. |
| Données de grille incomplètes | Moyenne | Démarrer avec quelques vaisseaux, compléter par saisie. |
| Prix périmés qui faussent les routes | Moyenne | Afficher la fraîcheur, pénaliser les données anciennes. |
| Ordre de chargement difficile à modéliser | Moyenne | Commencer par des règles simples d'accessibilité, valider en jeu. |
| Périmètre trop large | Haute | Un milestone utilisable avant d'attaquer le suivant. |
| Changements de patch | Moyenne | Versionner les données de vaisseaux. |
