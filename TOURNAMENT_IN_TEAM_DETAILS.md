# Matchs de Tournois dans les Détails d'Équipe

## Problème
Les derniers matchs affichés dans la page de détail d'une équipe n'incluaient pas les matchs de tournois.

## Cause
Le fichier `games.json` était écrasé lors de la deuxième compilation (stats sans tournois), ne contenant donc que 151 matchs de saison au lieu de tous les 196 matchs.

**Séquence problématique:**
1. Compilation AVEC tournois → `games.json` créé avec 196 matchs
2. Compilation SANS tournois → `games.json` **ÉCRASÉ** avec 151 matchs
3. Page team-detail charge `games.json` → ne voit que les 151 matchs de saison

## Solution

### 1. Modification de `save_data()` dans `lheq_stats.py`
- Le fichier `games.json` est maintenant sauvegardé **SEULEMENT** lors de la première compilation (avec tournois)
- Ajout du champ `game_type` aux matchs dans `games.json`

```python
if suffix == '':  # Only save games.json during the "all games" compilation
    games_summary = []
    for game in self.games:
        games_summary.append({
            'id': game['id'],
            'date': game['date'],
            'home_team': game['home_team'],
            'away_team': game['away_team'],
            'home_score': game.get('home_score', 0),
            'away_score': game.get('away_score', 0),
            'status': game['status'],
            'game_type': game.get('game_type', 'season')  # ← NOUVEAU
        })
```

### 2. Indicateur Visuel dans `team-detail.js`
Ajout d'un badge 🏆 pour identifier visuellement les matchs de tournois dans le tableau.

```javascript
const tournamentBadge = game.game_type === 'tournament'
    ? '<span class="tournament-badge" title="Match de tournoi">🏆</span> '
    : '';
```

### 3. Style CSS
Ajout de style pour le badge tournoi dans `main.css`:
```css
.tournament-badge {
    display: inline-block;
    font-size: 1rem;
    margin-right: 0.25rem;
    vertical-align: middle;
}
```

## Résultat

### Fichier `games.json`
- **196 matchs** au total
- **151 matchs** de saison
- **45 matchs** de tournois
- Champ `game_type` présent sur tous les matchs

### Page Team Detail
- Affiche **TOUS** les matchs (saison + tournois)
- Badge 🏆 visible sur les matchs de tournois
- L'affichage n'est **PAS** affecté par le toggle "Inclure tournois"

## Exemple

**LIONS LAC ST-LOUIS:**
- Total matchs: 20
- Matchs de saison: 14
- Matchs de tournois: 6 (identifiés par 🏆)

## Vérification

### Compter tous les matchs
```bash
cat web/data/games.json | jq 'length'
# Output: 196
```

### Compter les matchs de tournois
```bash
cat web/data/games.json | jq '[.[] | select(.game_type == "tournament")] | length'
# Output: 45
```

### Matchs pour une équipe spécifique
```bash
cat web/data/games.json | jq '[.[] | select(.home_team == "LIONS LAC ST-LOUIS" or .away_team == "LIONS LAC ST-LOUIS")] | length'
# Output: 20 (14 saison + 6 tournois)
```

## Différence avec le Toggle Tournois

| Élément | Comportement |
|---------|-------------|
| **Page Teams** | Affecté par le toggle - stats recalculées |
| **Page Players** | Affecté par le toggle - stats recalculées |
| **Page Team Detail** | **NON affecté** - affiche TOUJOURS tous les matchs |
| **Page Game Detail** | NON affecté - affiche le match demandé |

## Fichiers Modifiés

1. **lheq_stats.py** - Sauvegarde conditionnelle de `games.json`
2. **web/assets/js/team-detail.js** - Badge tournoi
3. **web/assets/css/main.css** - Style du badge

## Notes Importantes

- Le fichier `games.json` contient **toujours** tous les matchs (saison + tournois)
- Les fichiers `teams.json` / `teams_season.json` contiennent les stats filtrées
- Les fichiers `players.json` / `players_season.json` contiennent les stats filtrées
- La page team-detail utilise `games.json` qui n'est jamais filtré
