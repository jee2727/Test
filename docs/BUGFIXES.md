# Corrections de Bugs

## 1. Logos Disparaissant lors du Toggle Tournois

### Problème
Lorsqu'on désactivait l'option "Inclure tournois", tous les logos d'équipes disparaissaient de la page des équipes.

### Cause
Dans `generate_dual_stats.py`, on n'appelait jamais `download_team_logos()`. Résultat:
- `teams.json` avait les logos (de runs précédents)
- `teams_season.json` avait `local_logo: null`

### Solution
Ajouté `compiler.download_team_logos()` dans les deux compilations:

```python
# Compilation AVEC tournois
compiler_all.download_team_logos()

# Compilation SANS tournois
compiler_season.download_team_logos()
```

### Résultat
Les deux fichiers ont maintenant les chemins de logos:
```json
{
  "name": "LIONS LAC ST-LOUIS",
  "local_logo": "assets/logos/team_128307.jpg"
}
```

---

## 2. Filtres de Division ne Fonctionnant pas

### Problème
Les filtres de division ne fonctionnaient pas du tout - aucune division n'apparaissait dans le dropdown.

### Causes Multiples

#### Cause 1: Divisions non assignées
Les équipes n'avaient pas de champ `division` assigné dans les fichiers JSON.

**Solution:**
- Modifié `DivisionAssigner.assign_divisions()` pour traiter les deux fichiers:
  - `teams.json`
  - `teams_season.json`
- Ajouté l'appel à `DivisionAssigner` dans `generate_dual_stats.py`

#### Cause 2: Mauvaise source de données
Le code JavaScript `populateDivisionFilter()` utilisait `this.currentData` (données filtrées) au lieu de `dataManager.teams` (toutes les données).

**Solution:**
Modifié `web/assets/js/teams.js`:
```javascript
// Avant (INCORRECT)
this.currentData.forEach(team => {
    if (team.division) {
        divisions.add(team.division);
    }
});

// Après (CORRECT)
dataManager.teams.forEach(team => {
    if (team.division) {
        divisions.add(team.division);
    }
});
```

### Résultat
Les divisions sont maintenant correctement assignées et affichées:

**3 Divisions:**
- Hockey Experts (7 équipes)
- L'Entrepôt du Hockey (8 équipes)
- Sports Rousseau (8 équipes)

Le filtre fonctionne parfaitement et persiste lors du toggle tournois.

---

## Workflow de Génération Mis à Jour

Après avoir scrapé de nouvelles données:

```bash
python generate_dual_stats.py
```

Ce script exécute maintenant automatiquement:
1. ✅ Compilation des stats AVEC tournois
2. ✅ Téléchargement des logos
3. ✅ Compilation des stats SANS tournois
4. ✅ Téléchargement des logos
5. ✅ Assignation des divisions aux deux fichiers

---

## Fichiers Modifiés

### Backend
1. **generate_dual_stats.py**
   - Ajouté `download_team_logos()` pour les deux compilations
   - Ajouté `DivisionAssigner` pour assigner les divisions

2. **lheq_stats.py**
   - Modifié `DivisionAssigner.assign_divisions()` pour traiter les deux fichiers
   - Ajouté `assign_divisions_to_file(filename)` pour flexibilité

### Frontend
3. **web/assets/js/teams.js**
   - Corrigé `populateDivisionFilter()` pour utiliser `dataManager.teams`

---

## Tests de Vérification

### Vérifier les logos
```bash
cat web/data/teams.json | jq '.[0] | {name, local_logo}'
cat web/data/teams_season.json | jq '.[0] | {name, local_logo}'
```

### Vérifier les divisions
```bash
cat web/data/teams.json | jq '.[0:5] | .[] | {name, division}'
cat web/data/teams_season.json | jq '.[0:5] | .[] | {name, division}'
```

### Compter les équipes par division
```bash
cat web/data/teams.json | jq 'group_by(.division) | map({division: .[0].division, count: length})'
```

Résultat attendu:
```json
[
  {"division": "Hockey Experts", "count": 7},
  {"division": "L'Entrepôt du Hockey", "count": 8},
  {"division": "Sports Rousseau", "count": 8}
]
```
