# Politique de sécurité

## Versions concernées

StarNav est en développement précoce (avant 1.0). Seule la branche `main` reçoit des correctifs.

## Signaler une vulnérabilité

Merci de **ne pas ouvrir d'issue publique** pour un problème de sécurité.

Utilisez le signalement privé de GitHub : onglet **Security** du dépôt, puis **Report a vulnerability**. Indiquez ce que vous avez trouvé, comment le reproduire et l'impact que vous imaginez.

Je réponds en général sous quelques jours. Il s'agit d'un projet personnel : je ne propose ni prime ni délai garanti, mais chaque signalement est lu.

## Ce qui est concerné

- le code du dépôt et ses dépendances ;
- toute clé, jeton ou donnée personnelle commités par erreur (signalez-le en privé, même si vous n'êtes pas sûr).

Ne sont pas concernés : les services tiers (API du wiki Star Citizen, UEX Corp), à signaler à leurs responsables.

## Bonnes pratiques du projet

- Aucun secret n'est versionné : les clés API passent par des variables d'environnement, et les fichiers `.env*` sont ignorés par git.
- Les dépendances sont surveillées par Dependabot.
