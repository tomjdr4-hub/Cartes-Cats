# Cartes & Chats - Distribution

Module Foundry VTT (v13/v14) qui ajoute un espace MJ pour mélanger un paquet de cartes et le distribuer aux joueurs présents, avec sélection des participants par glisser-déposer.

## Fonctionnalités

- Fenêtre "Distribution de cartes" réservée au MJ (bouton dans l'onglet Cartes, ou raccourci `Ctrl+Shift+C`).
- Choix du paquet (parmi les Cards de type "deck" du monde).
- Glisser-déposer des joueurs entre "Joueurs disponibles" et "Participants" (double-clic possible en alternative).
- Réglage du nombre de cartes à distribuer par joueur.
- Animation de mélange à l'écran avant la distribution réelle.
- Distribution qui crée/alimente automatiquement la main de chaque joueur sélectionné.
- Récapitulatif (nombre de cartes reçues par participant) visible dans la fenêtre du MJ.
- Popup "Ma main" (bouton dans l'onglet Cartes, ou raccourci `Ctrl+Shift+M`) que chaque joueur ouvre lui-même : fenêtre persistante, propre au module, qui affiche l'état actuel de sa main (cumul des distributions successives) sans passer par la fiche native de Foundry.
- Dernière configuration (paquet, participants, nombre de cartes) sauvegardée par monde.

## Installation

Dans Foundry VTT, onglet **Modules complémentaires** > **Installer un module**, coller l'URL de manifeste suivante :

```
https://github.com/tomjdr4-hub/Cartes-Cats/releases/latest/download/module.json
```

## Utilisation

1. Créez (ou dupliquez) un paquet de cartes dans l'onglet **Cartes** du monde.
2. Ouvrez la fenêtre de distribution (bouton dans l'onglet Cartes, ou `Ctrl+Shift+C`).
3. Choisissez le paquet, glissez les joueurs présents dans "Participants", réglez le nombre de cartes.
4. Cliquez sur **Mélanger** puis sur **Distribuer**.
5. Chaque joueur ouvre sa popup "Ma main" (bouton ou `Ctrl+Shift+M`) pour voir ses cartes reçues.

## Versions

Une nouvelle version (numéro de patch incrémenté) et une release GitHub (avec `module.zip` et `module.json`) sont générées automatiquement à chaque modification poussée sur `main`.

## Statut

Version initiale : la mécanique (mélange, distribution, sélection des participants) est fonctionnelle avec des visuels de secours (cartes génériques). Les visuels définitifs des cartes viendront remplacer les paquets créés manuellement dans Foundry.
