# Points, Fair Play et Défaites en Prolongation

## Changements Implémentés

### 1. Défaites en Prolongation (OTL)
Les défaites en prolongation ou en tirs de barrage comptent maintenant **1 point** au lieu de 0.

**Comment ça fonctionne:**
- Le système vérifie `winLossType` dans les stats détaillées du jeu
- Si `winLossType = 'overtime'` ou `'shootout'`, l'équipe perdante reçoit 1 point
- Les défaites OT sont comptées séparément dans la colonne **OTL**

**Exemple:**
- AS QUÉBEC: 10V-3L-1OTL-4N = (10×2) + (1×1) + (4×1) = **25 points**

### 2. Points Franc Jeux (FJ)
Les points franc jeux (sportsmanship) sont extraits de l'API et affichés dans une colonne dédiée.

**Source des données:**
- Champ `sportsmanship` dans `detailed_game_info.teamStats`
- Accumulé sur tous les matchs de la saison

**Exemple:**
- LIONS LAC ST-LOUIS: **19 points FJ** sur 20 matchs

### 3. Points Totaux (Pts+)
Nouvelle colonne qui combine les points réguliers et les points franc jeux.

**Calcul:**
```
Pts+ = Pts + FJ
```

**Exemple:**
- LIONS LAC ST-LOUIS: 38 pts + 19 FJ = **57 Pts+**

### 4. Tri par Défaut: ~POC
Le tableau des équipes est maintenant trié par **~POC** (Power of Choice) au lieu des points.

**Ordre de tri:**
1. ~POC (descendant - plus élevé est meilleur)
2. Pts+ (descendant)
3. Différentiel de buts (descendant)
4. Nom (alphabétique)

## Nouvelles Colonnes dans le Tableau

| Colonne | Description | Exemple |
|---------|-------------|---------|
| **OTL** | Défaites en prolongation/tirs au but | 1 |
| **FJ** | Points franc jeux (sportsmanship) | 19 |
| **Pts+** | Points totaux (Pts + FJ) | 57 |
| **~POC** | Power of Choice rating | 1205.0 |

## Structure Complète du Tableau

```
Pos | Team | GP | W | L | OTL | T | Pts | FJ | Pts+ | ~POC | GF | GA | Diff | PIM | Home/Away
```

## Calcul des Points

### Points Réguliers (Pts)
- Victoire: **2 points**
- Nulle: **1 point**
- Défaite OT: **1 point**
- Défaite régulière: **0 point**

### Points Franc Jeux (FJ)
Basés sur le comportement sportif (extrait de l'API Spordle)

### Points Totaux (Pts+)
```
Pts+ = (V × 2) + (N × 1) + (OTL × 1) + FJ
```

## Exemples Concrets

### LIONS LAC ST-LOUIS (1er rang)
```
GP: 20 | W: 19 | L: 1 | OTL: 0 | T: 0
Pts = (19 × 2) + (0 × 1) + (0 × 1) = 38
FJ = 19
Pts+ = 38 + 19 = 57
~POC = 1205.0
```

### AS QUÉBEC
```
GP: 18 | W: 10 | L: 3 | OTL: 1 | T: 4
Pts = (10 × 2) + (4 × 1) + (1 × 1) = 25
FJ = 18
Pts+ = 25 + 18 = 43
~POC = 1070.8
```

## Fichiers Modifiés

### Backend
- `lheq_stats.py` - Ajout calcul OTL, FJ et Pts+
- `generate_dual_stats.py` - Génère les deux versions de stats

### Frontend
- `web/teams.html` - Nouvelles colonnes OTL, FJ, Pts+, ~POC
- `web/assets/js/teams.js` - Affichage et tri par ~POC

### Données Générées
- `web/data/teams.json` - Stats avec tournois
- `web/data/teams_season.json` - Stats saison seulement

## Utilisation

Après avoir scrapé de nouvelles données, régénérez les stats:

```bash
python generate_dual_stats.py
```

Les statistiques seront automatiquement triées par ~POC et incluront toutes les nouvelles colonnes.
