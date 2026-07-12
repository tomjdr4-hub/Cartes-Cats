# Cartes & Chats - Distribution

Module Foundry VTT (v13/v14) qui ajoute un espace MJ pour mélanger un paquet de cartes et le distribuer aux joueurs présents, avec sélection des participants par glisser-déposer.

Le paquet, la pioche, le mélange et les mains des joueurs sont gérés **entièrement par le module** (via ses propres réglages de monde) : aucune dépendance au système "Cards" natif de Foundry.

## Fonctionnalités

- Fenêtre "Distribution de cartes" réservée au MJ (bouton dans l'onglet Cartes, ou raccourci `Ctrl+Shift+C`).
- Glisser-déposer des joueurs entre "Joueurs disponibles" et "Participants" (double-clic possible en alternative).
- Réglage du nombre de cartes à distribuer par joueur.
- Animation de mélange à l'écran (avec le vrai visuel du verso) avant la distribution réelle.
- Compteur de cartes restantes dans la pioche + bouton pour réinitialiser/remélanger le paquet complet.
- Récapitulatif (nombre de cartes reçues par participant) visible dans la fenêtre du MJ.
- Popup "Ma main" (bouton dans l'onglet Cartes, ou raccourci `Ctrl+Shift+M`) que chaque joueur ouvre lui-même : fenêtre persistante, propre au module, qui affiche l'état actuel de sa main (cumul des distributions successives).
- Dernière configuration (participants, nombre de cartes) sauvegardée par monde.

## Le paquet de cartes

Le contenu du paquet est défini dans [scripts/deck-data.js](scripts/deck-data.js) : chaque carte a un identifiant, un nom, une image et un nombre d'exemplaires dans le paquet. Actuellement :

- Verso : `assets/cards/back.png`
- **Coup d'bol** (`assets/cards/coupdbol.png`) — 3 exemplaires

Pour ajouter de nouvelles cartes, il suffit de déposer les visuels dans `assets/cards/` et d'ajouter une entrée dans `CARD_DEFINITIONS`.

## Installation

Dans Foundry VTT, onglet **Modules complémentaires** > **Installer un module**, coller l'URL de manifeste suivante :

```
https://github.com/tomjdr4-hub/Cartes-Cats/releases/latest/download/module.json
```

## Utilisation

1. Ouvrez la fenêtre de distribution (bouton dans l'onglet Cartes, ou `Ctrl+Shift+C`).
2. Glissez les joueurs présents dans "Participants", réglez le nombre de cartes.
3. Cliquez sur **Mélanger** puis sur **Distribuer**.
4. Chaque joueur ouvre sa popup "Ma main" (bouton ou `Ctrl+Shift+M`) pour voir ses cartes reçues.

## Versions

Une nouvelle version (numéro de patch incrémenté) et une release GitHub (avec `module.zip` et `module.json`) sont générées automatiquement à chaque modification poussée sur `main`.

## Statut

Mécanique indépendante fonctionnelle (pioche, mélange, distribution, récapitulatif MJ, main persistante par joueur) avec un premier vrai visuel ("Coup d'bol" + verso). D'autres cartes pourront être ajoutées au fur et à mesure des visuels fournis.
