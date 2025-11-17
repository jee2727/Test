# Mise à Jour de la Page d'Accueil (Dashboard)

## Changements Implémentés

La page d'accueil affiche maintenant les mêmes statistiques que la page équipes, organisées par division, avec le toggle pour les tournois.

### 1. Toggle Tournois

**Ajout du toggle sur la page d'accueil:**
- Même fonctionnalité que sur les pages équipes et joueurs
- Position: En haut de la page, avant les tableaux de divisions
- Par défaut: **ON** (tournois inclus)

```html
<div class="tournament-toggle-container">
    <span class="tournament-toggle-label">Inclure tournois</span>
    <label class="toggle-switch">
        <input type="checkbox" id="include-tournaments" checked>
        <span class="toggle-slider"></span>
    </label>
</div>
```

### 2. Colonnes Mises à Jour

**Avant:**
```
Pos | Team | GP | W | L | T | Pts | POC | GF | GA | Diff
```

**Maintenant:**
```
Pos | Team | GP | W | L | OTL | T | Pts | FJ | Pts+ | ~POC | GF | GA | Diff
```

**Nouvelles colonnes:**
- **OTL** - Défaites en prolongation (1 point)
- **FJ** - Points franc jeux (sportsmanship)
- **Pts+** - Points totaux (Pts + FJ)
- **~POC** - Power of Choice rating (renommé de POC)

### 3. Tri par Défaut

**Avant:** Tri par Points (Pts)

**Maintenant:** Tri par ~POC
- Ordre: POC → Pts+ → Diff → Nom
- Identique à la page équipes

### 4. Organisation par Division

**3 Divisions affichées:**
1. **Division L'Entrepôt du Hockey** (8 équipes)
2. **Division Hockey Experts** (7 équipes)
3. **Division Sports Rousseau** (8 équipes)

Chaque division a son propre tableau avec:
- Classement interne (Pos 1, 2, 3, etc.)
- Tri par ~POC
- Toutes les colonnes de stats

### 5. Comportement du Toggle

**Quand ON (avec tournois):**
- Charge `teams.json`
- Affiche stats de 196 matchs (151 saison + 45 tournois)
- Exemple: LIONS LAC ST-LOUIS
  - GP: 20
  - ~POC: 1205.0
  - Pts+: 57

**Quand OFF (sans tournois):**
- Charge `teams_season.json`
- Affiche stats de 151 matchs (saison seulement)
- Exemple: LIONS LAC ST-LOUIS
  - GP: 14
  - ~POC: 1128.9
  - Pts+: 39

**Mise à jour en temps réel:**
- Les tableaux se rechargent instantanément
- Pas besoin de rafraîchir la page
- Les divisions restent séparées

## Code JavaScript Modifié

### Nouvelles Fonctions

**`setupEventListeners()`**
- Gère le toggle tournois
- Recharge les données quand le toggle change

**`handleTournamentToggle(includeTournaments)`**
- Recharge les données appropriées
- Détruit et recrée les DataTables
- Re-rend les tableaux de divisions

### Tri Mis à Jour

**`renderDivisionStandings()`**
```javascript
.sort((a, b) => {
    // Sort by POC descending, then total points, then goal differential
    const pocA = a.poc_adjusted || a.poc_rating || 1000;
    const pocB = b.poc_adjusted || b.poc_rating || 1000;

    if (pocB !== pocA) return pocB - pocA;
    if (b.total_points !== a.total_points) return b.total_points - a.total_points;
    return b.goal_differential - a.goal_differential;
});
```

### DataTables Configuration

**`initDataTables()`**
```javascript
columnDefs: [
    { orderable: false, targets: [0, 1] }, // Position and Team columns
    { type: 'num', targets: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] }, // Numeric columns
    { orderData: [10], targets: [10] } // ~POC column
],
order: [[10, 'desc']] // Sort by ~POC column descending by default
```

## Fichiers Modifiés

### Frontend
1. **web/index.html**
   - Ajout du toggle tournois
   - Mise à jour des colonnes des 3 tableaux de divisions

2. **web/assets/js/dashboard.js**
   - Ajout de `setupEventListeners()`
   - Ajout de `handleTournamentToggle()`
   - Mise à jour de `renderDivisionStandings()` (nouvelles colonnes + tri POC)
   - Mise à jour de `initDataTables()` (14 colonnes au lieu de 11)

## Comparaison Page d'Accueil vs Page Équipes

| Caractéristique | Page d'Accueil | Page Équipes |
|-----------------|----------------|--------------|
| **Colonnes** | Identiques | Identiques |
| **Toggle Tournois** | ✅ Oui | ✅ Oui |
| **Tri par défaut** | ~POC | ~POC |
| **Organisation** | Par division (3 tableaux) | Une seule liste + filtre division |
| **Filtres** | Toggle tournois seulement | Toggle tournois + Filtre division |
| **Données** | Même source (teams.json / teams_season.json) | Même source |

## Avantages

1. **Cohérence**: Même stats partout dans l'application
2. **Divisions visibles**: Organisation claire dès la page d'accueil
3. **Flexibilité**: Toggle tournois sur toutes les pages principales
4. **Performance**: Les 3 divisions se mettent à jour ensemble

## Utilisation

1. Ouvrir `web/index.html`
2. Les 3 divisions s'affichent avec tous les matchs (tournois inclus)
3. Cliquer sur le toggle "Inclure tournois" pour basculer
4. Les 3 tableaux se mettent à jour instantanément

## Notes

- La page d'accueil utilise la même logique que teams.js et players.js
- Les logos sont préservés lors du toggle
- Les divisions sont toujours présentes (même si une équipe n'a joué que des matchs de tournois)
- Le tri par ~POC assure une vue cohérente du classement réel
