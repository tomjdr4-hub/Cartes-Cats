# Cartes & Chats - Distribution

Module Foundry VTT (v13/v14) qui ajoute un espace MJ pour mélanger un paquet de cartes et le distribuer aux joueurs présents, avec sélection des participants par glisser-déposer.

Le paquet et la pioche sont gérés **entièrement par le module** (réglage de monde) et la main de chaque joueur est stockée comme un flag sur son propre compte utilisateur (chacun a le droit d'écrire le sien, aucun relais MJ n'est nécessaire) : aucune dépendance au système "Cards" natif de Foundry.

## Fonctionnalités

- Fenêtre "Distribution de cartes" réservée au MJ (bouton dans l'onglet Cartes, ou raccourci `Ctrl+Shift+C`).
- Glisser-déposer des joueurs entre "Joueurs disponibles" et "Participants" (double-clic possible en alternative) — affichés par **nom de personnage assigné (+ réputation entre parenthèses)** plutôt que par nom de compte joueur, avec repli sur le nom du joueur si aucun personnage n'est assigné.
- Nombre de cartes à distribuer réglable **individuellement pour chaque participant**.
- Animation de mélange à l'écran (avec le vrai visuel du verso) avant la distribution réelle.
- Compteur de cartes restantes dans la pioche + bouton pour réinitialiser/remélanger le paquet complet.
- Récapitulatif visible dans la fenêtre du MJ : nombre de cartes reçues par participant, et **le nom de chaque carte en sa possession** juste sous son nom.
- Popup "Ma main" ouverte par le joueur via un mini-visuel de carte flottant, ancré au-dessus de la liste des joueurs (badge du nombre de cartes en main) — pas de dépendance à un onglet de la sidebar. Raccourci `Ctrl+Shift+M` disponible aussi.
- Bouton **Utiliser** sur chaque carte de la main : défausse la carte et annonce son usage dans le chat.
- Dernière configuration (participants, nombre de cartes par joueur) sauvegardée par monde.

## Le paquet de cartes

Le contenu du paquet est défini dans [scripts/deck-data.js](scripts/deck-data.js) : chaque carte a un identifiant, un nom, une image et un nombre d'exemplaires dans le paquet. Actuellement :

- Verso : `assets/cards/back.png`
- **Coup d'bol** — 3 exemplaires
- **Pas d'bol** — 3 exemplaires
- **Megamind** — 1 exemplaire
- **Trop mignon !** — 2 exemplaires
- **Prends ça !** — 1 exemplaire
- **Ravitaillement** — 2 exemplaires (ne se défausse pas à l'usage : effet différent lié à la défausse)
- **@#\*%& de chat !** — 2 exemplaires
- **Esclave à disposition** — 1 exemplaire
- **Même pas mal !** — 2 exemplaires
- **C'est pas moi, c'est lui !** — 1 exemplaire
- **Retournement de situation** — 1 exemplaire
- **Faveur due** — 2 exemplaires
- **Moi d'abord !** — 1 exemplaire
- **Chat ninja** — 2 exemplaires
- **Yogi félin** — 1 exemplaire
- **Matou des rues** — 2 exemplaires
- **Essaye encore !** — 2 exemplaires
- **Amore, amore...** — 1 exemplaire
- **Trop simple !** — 2 exemplaires
- **Aubaine** — 2 exemplaires (ne se défausse pas à l'usage)
- **Handicap** — 2 exemplaires (ne se défausse pas à l'usage)

Pour ajouter de nouvelles cartes, il suffit de déposer les visuels dans `assets/cards/` et d'ajouter une entrée dans `CARD_DEFINITIONS`.

## Installation

Dans Foundry VTT, onglet **Modules complémentaires** > **Installer un module**, coller l'URL de manifeste suivante :

```
https://github.com/tomjdr4-hub/Cartes-Cats/releases/latest/download/module.json
```

## Utilisation

1. Ouvrez la fenêtre de distribution (bouton dans l'onglet Cartes, ou `Ctrl+Shift+C`).
2. Glissez les joueurs présents dans "Participants", réglez le nombre de cartes pour chacun.
3. Cliquez sur **Mélanger** puis sur **Distribuer** (bloqué avec un avertissement si le total demandé dépasse le nombre de cartes restantes dans la pioche).
4. Chaque joueur clique sur le mini-visuel de carte flottant (au-dessus de la liste des joueurs) pour voir ses cartes reçues, et clique sur **Utiliser** pour défausser une carte après l'avoir jouée (uniquement si la carte l'exige).

## Versions

Une nouvelle version (numéro de patch incrémenté) et une release GitHub (avec `module.zip` et `module.json`) sont générées automatiquement à chaque modification poussée sur `main`.

## Statut

Mécanique indépendante fonctionnelle (pioche, mélange, distribution par joueur, récapitulatif MJ, main persistante par joueur, défausse à l'usage) avec 21 cartes réelles + verso. D'autres cartes pourront être ajoutées au fur et à mesure des visuels fournis.
