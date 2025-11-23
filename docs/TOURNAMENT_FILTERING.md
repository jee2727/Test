# Tournament vs Season Game Filtering

## Overview

The system now distinguishes between **tournament games** (INQ 183835) and **season games** (INQ 182366), allowing you to include or exclude tournament games from statistics.

## Game Type Identification

- **Season games**: scheduleId = 182366
- **Tournament games**: scheduleId = 183835

All game files now include:
- `game_type`: "season" or "tournament"
- `schedule_id`: The schedule ID from the API

## Command-Line Usage

### Compile stats INCLUDING tournament games (default):
```bash
python lheq_stats.py
```

### Compile stats EXCLUDING tournament games:
```bash
python lheq_stats.py --exclude-tournaments
```

### Stats with tournaments excluded (season only):
```bash
python lheq_stats.py --step stats --exclude-tournaments
```

## Results

With the current data:
- **Total games**: 196 (151 season + 45 tournament)
- **With tournaments included**: 667 players, 196 games
- **Without tournaments (season only)**: 647 players, 151 games

## Scraper Updates

The `lheq_scraper.py` now automatically tags all new games with:
- `game_type`: Determined from scheduleId
- `schedule_id`: The original scheduleId from the API

## Web UI - Live Toggle

The web interface now has **working** "Inclure tournois" toggle switches in:
- `/web/players.html` - Player statistics page (filters affect both skaters and goalies)
- `/web/teams.html` - Team standings page

### How the Toggle Works

1. **ON** (default): Shows statistics including all games (season + tournaments)
   - Loads `teams.json` and `players.json`
   - 667 players, 196 games

2. **OFF**: Shows statistics for season games only (excludes tournaments)
   - Loads `teams_season.json` and `players_season.json`
   - 647 players, 151 games

The toggle updates the statistics **in real-time** without requiring a page reload. Simply click the toggle switch to see the difference!

## Files Modified

### Backend
1. **lheq_scraper.py** - Added game_type and schedule_id to scraped games
2. **lheq_stats.py** - Added --exclude-tournaments flag and suffix support for dual stats generation
3. **generate_dual_stats.py** - NEW: Generates both versions of stats files
4. **update_game_types.py** - Script to update existing game files
5. **update_games_json.py** - Script to update games.json summary

### Frontend
6. **web/players.html** - Added tournament toggle switch UI
7. **web/teams.html** - Added tournament toggle switch UI
8. **web/assets/css/main.css** - Added toggle switch styles
9. **web/assets/js/main.js** - Updated DataManager to support loading different datasets
10. **web/assets/js/players.js** - Added tournament toggle handler and data reloading
11. **web/assets/js/teams.js** - Added tournament toggle handler and data reloading

### Generated Data Files
- **web/data/teams.json** - Team stats with tournaments (23 teams)
- **web/data/teams_season.json** - Team stats without tournaments (23 teams)
- **web/data/players.json** - Player stats with tournaments (667 players)
- **web/data/players_season.json** - Player stats without tournaments (647 players)

## Migration

All existing game files (197 games) have been updated with the `game_type` field:
- 153 season games
- 44 tournament games

## Generating Stats Files

After scraping new games or updating data, regenerate both versions of the stats:

```bash
python generate_dual_stats.py
```

This will create/update:
- `teams.json` and `players.json` (with tournaments)
- `teams_season.json` and `players_season.json` (without tournaments)

The script automatically runs both compilations and saves the results with the appropriate suffixes.

## Workflow

1. **Scrape new games**: `python lheq_scraper.py 2025-11-01 2025-11-30`
2. **Generate dual stats**: `python generate_dual_stats.py`
3. **Open web interface**: `web/index.html` - Toggle works automatically!

## Future Enhancements

- Add tournament indicator to individual game displays
- Show tournament name/location in game details
- Add filter to games page to show/hide tournament games
