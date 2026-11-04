# Sources de données

Document du milestone **M0** (issues M0-2, M0-3, M0-4, M0-5). Il liste, pour chaque donnée dont l'outil a besoin, d'où elle vient, ce qui est confirmé, ce qui reste à tester et ce qu'il faudra saisir à la main.

- **Créé le :** 2026-11-04 — **mis à jour le :** 2026-11-04 (tests 1, 3, 4 faits)
- **Sources principales :** API UEX 2.0 et API du wiki Star Citizen
- **Comment l'utiliser :** remplir les colonnes « Testé le » et « Résultat réel » au fil des tests Postman, puis mettre à jour la colonne « Statut ».

**Légende des statuts**

| Symbole | Sens |
|---|---|
| ✅ | Confirmé (par la doc ou par un appel réel) |
| ❓ | Piste identifiée, à tester |
| ❌ | Aucune source trouvée, pas encore tranché |
| Manuel | Aucune source : donnée saisie ou mesurée à la main, décision prise |

---

## 1. Sources et rôle de chacune

| Source | Rôle dans l'outil | Accès | Limites connues | Plan B si elle tombe |
|---|---|---|---|---|
| **API UEX 2.0** | Prix, stocks, terminaux, distances, carburant, location et achat de vaisseaux, `scu` et `container_sizes` des vaisseaux | Jeton Bearer créé dans « My Apps » sur uexcorp.space | 60 requêtes par minute, 86 400 par jour. Prix collaboratifs, donc parfois périmés. | Servir le dernier relevé stocké en base, avec son âge affiché. |
| **API du wiki Star Citizen** | **Source de vérité de la géométrie des vaisseaux** : grilles de soute (`cargo_grids`), dimensions, vitesses, carburant, quantum ; hiérarchie des lieux | Publique, sans jeton cité dans le guide | Recherche limitée à 60 requêtes par minute et par IP. Usage commercial non autorisé. | Instantané des données de vaisseaux versionné dans `data/`. |
| **Saisie manuelle** | Données absentes des deux API (côtés d'accès des soutes, table de correspondance des slugs, temps mesurés, coûts divers) | Fichiers dans `data/` | Demande de l'entretien à chaque patch. | Sans objet. |

---

## 2. Licence et conditions d'utilisation (M0-2)

| Source | Ce qui est connu | À faire |
|---|---|---|
| API du wiki | Il faut **citer l'API** (api.star-citizen.wiki) dans un projet public. **L'usage commercial n'est pas autorisé** (référence citée : FAQ RSI Fandom). | Prévoir la mention dans le pied de page de l'outil. |
| UEX | Conditions non lues à ce jour. | Lire les conditions d'utilisation et la politique de réutilisation sur uexcorp.space. |
| Conséquence pour le projet | Usage **personnel** : pas de blocage identifié. Usage **public** : à trancher après lecture des conditions d'UEX. | Décider : outil personnel ou public ? |

---

## 3. Inventaire des données (M0-4)

Les colonnes « Testé le » et « Résultat réel » sont remplies au fil des tests (tests faits le 2026-11-04 : wiki Freelancer MAX et Caterpillar, wiki `/locations`, UEX `/vehicles`).

### 3.1 Prix et marché

| Donnée | Source | Endpoint ou champ | Statut | Testé le | Résultat réel |
|---|---|---|---|---|---|
| Liste des commodities | UEX | `commodities` | ✅ | | |
| Prix d'achat et de vente par terminal | UEX | `commodities_prices`, `commodities_prices_all` | ✅ | | |
| Stock disponible | UEX | `scu_sell_stock`, `scu_buy`, `scu_sell` | ✅ | | |
| Fraîcheur du prix | UEX | `date_modified` | ✅ | | |
| Tailles de conteneurs proposées par terminal | UEX | `container_sizes` dans les prix | ✅ (contenu réel à vérifier) | | |
| Volatilité, statut offre/demande | UEX | `volatility_price_*`, `status_buy`, `status_sell` | ✅ | | |
| Historique des prix | UEX | `commodities_prices_history` | ✅ | | |
| Moyennes et score | UEX | `commodities_averages` (`cax_score`) | ✅ | | |
| Version du jeu | UEX | `game_versions`, `game_version` | ✅ | | |

### 3.2 Lieux et distances

| Donnée | Source | Endpoint ou champ | Statut | Testé le | Résultat réel |
|---|---|---|---|---|---|
| Terminaux (nom, type, système, planète, orbite) | UEX | `terminals`, `star_systems` | ✅ | | |
| Distance terminal → terminal | UEX | `terminals_distances` | ✅ | | |
| Distance entre orbites et entre systèmes | UEX | `orbits_distances` | ✅ | | |
| Hiérarchie des lieux (système → planète → lune), rayons de voyage quantique | Wiki API | `/api/locations` (68 pages de 30) | ✅ | 2026-11-04 | Types vus en page 1 : Moon, Planet, Outpost, Asteroid. Champs `parent`, `system`, `size`, `quantum_travel`. |
| Coordonnées 3D des lieux | Wiki API | `/api/locations` | ❌ | 2026-11-04 | Aucun champ de position x/y/z. Distances à prendre chez UEX. |
| Distance surface → orbite | aucune | | ❌ | | |

### 3.3 Vaisseaux et cargo

| Donnée | Source | Endpoint ou champ | Statut | Testé le | Résultat réel |
|---|---|---|---|---|---|
| Capacité totale en SCU | UEX | `vehicles.scu` | ✅ | 2026-11-04 | Freelancer MAX 120, Caterpillar 576, C2 Hercules 696, Hull A 64, Hull C 4608. |
| Capacité totale en SCU (recoupement) | Wiki API | `cargo_capacity` | ✅ | 2026-11-04 | Caterpillar 576 : identique à UEX. |
| Tailles de conteneurs acceptées par vaisseau | UEX | `vehicles.container_sizes` | ✅ (partielle) | 2026-11-04 | Liste globale par vaisseau. Renseignée pour 95 vaisseaux sur 140 ayant un `scu` (vide pour Hull D, Hull E, 600i, Endeavor…). Faux pour le Freelancer MAX (donne 24 et 32) et le Caterpillar (donne 24 max, le wiki autorise 32). **Non retenue pour le placement.** |
| `max_container` du vaisseau | UEX | plus grande valeur de `container_sizes` | ❌ | 2026-11-04 | Non fiable, remplacé par `max_scu_box` par grille. |
| `max_container` **par grille** | Wiki API | `cargo_grids[].max_scu_box` | ✅ | 2026-11-04 | Freelancer MAX : 16 (principale), 2 (latérales). Caterpillar : 32, 16, 16, 2, 2. |
| Dimensions de chaque grille (L × l × h) | Wiki API | `cargo_grids[].width/height/length`, `scu` | ✅ | 2026-11-04 | Ex. grille principale Freelancer MAX : 5 × 3,75 × 11,25 m, 108 SCU. |
| Nombre de grilles par vaisseau | Wiki API | `cargo_grids` (tableau) | ✅ | 2026-11-04 | Freelancer MAX : 3. Caterpillar : 14 (somme 576 SCU, cohérente avec `cargo_capacity`). |
| Contraintes d'orientation d'une caisse | Wiki API | `cargo_grids[].max_size` (x, y, z en m) | ✅ (à valider en jeu) | 2026-11-04 | Ex. grille principale Freelancer MAX : 2,5 × 10 × 2,5 m, ce qui impose le sens de pose des caisses de 24 et 32 SCU. |
| Identifiant commun wiki ↔ UEX | Wiki + UEX | `uuid` (présent des deux côtés) | ✅ | 2026-11-04 | Les slugs diffèrent (`drak-caterpillar` côté wiki, `caterpillar` côté UEX) : passer par l'`uuid`. |
| Dimensions et masse du vaisseau | Wiki API | `dimension.length/width/height`, `mass_total` | ✅ | | |
| Côté d'accès de chaque soute | aucune | | Manuel | 2026-11-04 | Ports `CargoGrid`, `Door`, `SeatAccess` : `position` vaut `null`. |
| Taille max qui passe la porte ou la rampe | aucune | | Manuel | 2026-11-04 | Aucun champ trouvé. |
| Grilles non officielles | Communauté | | Manuel | | |

### 3.4 Temps de trajet et carburant

| Donnée | Source | Endpoint ou champ | Statut | Testé le | Résultat réel |
|---|---|---|---|---|---|
| Vitesses SCM et boost, agilité | Wiki API | section « Flight Characteristics » | ✅ | | |
| Capacités hydrogène et quantum | Wiki API | section « Fuel & Quantum » | ✅ | | |
| Consommation quantum | Wiki API | `ports` → `QuantumDrive` → `quantum_drive.quantum_fuel_requirement` | ✅ | 2026-11-04 | Freelancer MAX (Odyssey) : 0,0109. |
| Portée et vitesse quantum, préparation | Wiki API | `quantum` (vaisseau) et `quantum_drive.standard_jump` | ✅ | 2026-11-04 | `drive_speed` 238 314 300, `spool_up_time` 6,9 s, `quantum_range` 587,16 Gm. Vérifié : portée = capacité du réservoir ÷ `quantum_fuel_requirement`. Olisar → ArcCorp : 41,93 Gm en 176 s, identique à `port_olisar_to_arccorp_time`. Test `/api/items?filter[type]=QuantumDrive` non nécessaire pour le MVP. |
| Consommation d'hydrogène par distance | aucune claire | `fuel` (réservoirs, débit des tuyères) | ❓ | 2026-11-04 | Capacités des réservoirs présentes, consommation par distance non trouvée. Le coût carburant du MVP se base sur le quantum. |
| Prix du carburant par terminal | UEX | `fuel_prices` | ✅ | | |
| Terminaux de ravitaillement | UEX | `terminals?type=fuel` | ✅ | | |
| Temps d'atterrissage, décollage, ascenseur | à mesurer en jeu | | Manuel | | |
| Temps de chargement par conteneur | à mesurer en jeu | | Manuel | | |

### 3.5 Coûts

| Donnée | Source | Endpoint ou champ | Statut | Testé le | Résultat réel |
|---|---|---|---|---|---|
| Prix de location par terminal | UEX | `vehicles_rentals_prices` (aussi `uex_prices` dans la réponse wiki) | ✅ | 2026-11-04 | Freelancer MAX : de 80 797 à 85 050 aUEC selon le lieu, durée non indiquée. |
| Prix d'achat du vaisseau | UEX | `vehicles_purchases_prices` | ✅ | | |
| Vaisseau louable ou non | UEX | présence d'un prix de location | ✅ | | |
| Durées de location possibles | aucune | | ❌ | 2026-11-04 | Aucune durée dans les données wiki. À vérifier dans la réponse de `vehicles_rentals_prices` (UEX). |
| Assurance, réparations, frais divers | aucune | | Manuel | | |

### 3.6 Données produites par l'outil

Routes, étapes, durées réelles, prix de vente réellement obtenus, historique des profits : issus des sessions de jeu, aucune source externe à chercher.

---

## 4. Valeurs de référence pour valider les réponses

Relevées sur les pages du wiki (starcitizen.tools). À comparer avec les réponses de `vehicles` (UEX).

| Vaisseau | `scu` attendu | Max conteneur attendu |
|---|---|---|
| Cutlass Black | 46 | 2 |
| Freelancer MAX | 120 | 16 |
| Hull A | 64 | 16 |
| Constellation Taurus | 174 | 16 |
| C2 Hercules | 696 | 32 |
| Caterpillar | 576 | 32 au total, 24 dans les quatre soutes principales, 16 dans la soute avant (**contredit par l'API wiki le 2026-11-04** : 32 dans la soute avant de 60 SCU, 16 dans les grandes soutes de 96 SCU) |

**Grilles du Freelancer MAX (confirmées par l'API wiki le 2026-11-04)** : une grille principale de 11,25 × 5 × 3,75 m (108 SCU, caisse max 16) et deux grilles latérales de 1,25 × 2,5 × 3,75 m (6 SCU chacune, **caisse max 2**). Les latérales n'acceptent donc pas de caisse de 4 SCU ou plus.

**Caterpillar (API wiki)** : 14 grilles, 576 SCU au total.

| Grille | Nombre | SCU | Caisse max |
|---|---|---|---|
| Soute avant | 1 | 60 | 32 |
| Soute avant (petite) | 1 | 20 | 16 |
| Grande soute | 4 | 96 | 16 |
| Grille fine (côté) | 4 | 8 | 2 |
| Grille colonne | 4 | 20 | 2 |

---

## 5. Appels à lancer pour clore M0-4

- [x] **1.** `GET /api/vehicles/{slug}?include=ports,components` (wiki), fait pour le Freelancer MAX et le Caterpillar. Les grilles sont dans `cargo_grids`.
- [~] **2.** `GET /api/items?filter[type]=QuantumDrive` (wiki). Les données quantum sont déjà dans la réponse du vaisseau, test facultatif.
- [x] **3.** `GET /api/locations` (wiki), fait. Pas de coordonnées.
- [x] **4.** `GET {{base_url}}/vehicles` (UEX), fait : 283 vaisseaux. Cutlass Black non retrouvé par son slug, à chercher par son nom.
- [ ] **6.** `GET {{base_url}}/vehicles_rentals_prices?id_vehicle=...` (UEX). Chercher une durée de location.
- [ ] **5.** `GET {{base_url}}/commodities_prices_all` (UEX). Vérifier le format de `container_sizes` côté terminal et noter la taille de la réponse.

---

## 6. Données à saisir à la main

À stocker dans `data/` (versionnées par patch du jeu).

| Donnée | Pourquoi elle manque | Utilisée par | Milestone |
|---|---|---|---|
| Côté d'accès de chaque soute | Absente des deux API | Ordre de chargement | M1 puis M8 |
| Taille max qui passe la porte ou la rampe | Absente des deux API | Moteur cargo | M1 puis M8 |
| Table de correspondance wiki ↔ UEX (par `uuid`) | Slugs différents entre les deux API | Prix de location et d'achat | M1 |
| Grilles non officielles | Savoir de la communauté | Visualiseur 3D | M11 |
| Durées de location possibles | Non fournies | Coûts | M6 |
| Assurance, réparations, frais divers | Non fournis | Profit net | M6 |
| Temps d'atterrissage, décollage, chargement | À mesurer | Estimation du temps | M8, M10 |

---

## 7. Limites et points d'attention

| Point | Détail |
|---|---|
| `container_sizes` d'UEX | Liste globale par vaisseau, absente pour 45 vaisseaux ayant un `scu`, et différente du wiki (Freelancer MAX, Caterpillar). Ne pas s'en servir pour le placement : utiliser `cargo_grids[].max_scu_box`. |
| `max_scu_box` global (`cargo_limits`) | Donne le maximum du vaisseau entier, sans dire dans quelle grille il rentre. Utiliser le maximum par grille. |
| Pas de coordonnées | `/api/locations` n'a pas de positions. Les distances viennent d'UEX. |
| Deux adresses pour UEX | La page d'accueil indique `https://uexcorp.space/api/2.0`, les pages d'endpoints `https://api.uexcorp.uk/2.0`. Garder `base_url` en variable et vérifier laquelle répond. |
| Authentification UEX | La page d'accueil annonce un jeton Bearer. Une seule page d'endpoint le mentionne, les autres affichent « aucune ». Envoyer le jeton partout. |
| `commodities_ranking` | Déprécié. Utiliser `cax_score` de `commodities_averages`. |
| Paramètres « au moins un requis » | Plusieurs endpoints UEX exigent au moins un filtre : un appel sans paramètre échoue. |
| Cache | Prix : 30 minutes. Terminaux, véhicules, historique : 12 heures. Référentiels : 1 jour. Inutile d'interroger plus souvent. |
| Prix du wiki et d'UEX | Les prix de location et d'achat affichés par le wiki viennent d'UEX : ce n'est pas une source indépendante. |
| Champs de l'API du wiki | Noms de champs confirmés sur les réponses réelles du Freelancer MAX et du Caterpillar (2026-11-04). |

---

## 8. Décisions (M0-5)

Décisions prises le 2026-11-04 après les tests 1, 3 et 4. Restent à trancher : prix (test 5, `commodities_prices_all`), durée de location, licence UEX.

| Donnée | Source retenue | Plan B | Décidé le |
|---|---|---|---|
| Prix, stocks, fraîcheur | UEX | Dernier relevé en base, âge affiché | |
| Terminaux et distances | UEX (`terminals_distances`, `orbits_distances`) ; wiki `/locations` pour la hiérarchie seulement | Instantané stocké | 2026-11-04 |
| Capacité totale (SCU) | UEX `vehicles.scu`, recoupée avec le wiki `cargo_capacity` | `data/` | |
| Grilles de soute (dimensions, SCU, caisse max, orientation) | **Wiki API `cargo_grids`** | Instantané versionné dans `data/` | 2026-11-04 |
| Carburant et quantum | Wiki API (`ports` → `QuantumDrive`, champ `quantum`) | Saisie dans `data/` | 2026-11-04 |
| Location et achat de vaisseaux | UEX (lien avec le wiki par `uuid`) | Saisie dans `data/` | 2026-11-04 |
| Côté d'accès des soutes | Saisie manuelle | | 2026-11-04 |

---

## 9. Journal des tests

| Date | Appel | Résultat | Conséquence |
|---|---|---|---|
| 2026-11-04 | wiki `GET /api/vehicles/misc-freelancer-max?include=ports,components` | `cargo_grids` : 3 grilles (108 SCU max 16, 2 × 6 SCU max 2). `quantum` complet, cohérent. Positions des ports à `null`. | Grilles fournies par le wiki. Côté d'accès à saisir à la main. |
| 2026-11-04 | wiki `GET /api/vehicles/drak-caterpillar` | 14 grilles, 576 SCU, maximums de 32, 16 et 2 selon la grille. | Moteur cargo raisonne grille par grille. Réfute la valeur de référence du wiki communautaire. |
| 2026-11-04 | wiki `GET /api/locations` (page 1 sur 68) | Hiérarchie et rayons quantum, pas de coordonnées. | Distances à prendre chez UEX. |
| 2026-11-04 | UEX `GET /vehicles` | 283 vaisseaux, 140 avec `scu`, 95 avec `container_sizes`. Listes globales, différentes du wiki. | UEX non retenu pour le placement. |

---

## Références

- API UEX 2.0 : https://uexcorp.space/api et https://uexcorp.space/api/documentation/
- Guide développeur de l'API du wiki : https://api.star-citizen.wiki/developers
- Wiki Star Citizen : https://starcitizen.tools
