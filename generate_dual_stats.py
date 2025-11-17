#!/usr/bin/env python3
"""
Generate both versions of statistics (with and without tournaments)
This creates:
- teams.json, players.json (all games including tournaments)
- teams_season.json, players_season.json (season games only)
"""

import sys
import os

# Import from lheq_stats
sys.path.insert(0, os.path.dirname(__file__))
from lheq_stats import HockeyStatsCompiler, DivisionAssigner

def main():
    games_dir = "web/data/games"
    web_dir = "web"

    print("=" * 70)
    print("GENERATING DUAL STATISTICS FILES")
    print("=" * 70)
    print()

    # Generate stats WITH tournaments
    print("=" * 70)
    print("1. GENERATING STATS WITH TOURNAMENTS")
    print("=" * 70)
    compiler_all = HockeyStatsCompiler(games_dir, web_dir, include_tournaments=True)
    compiler_all.load_games()
    compiler_all.process_games()
    compiler_all.calculate_poc_ratings()
    compiler_all.download_team_logos()
    compiler_all.save_data(suffix='')  # Save as teams.json, players.json
    print()

    # Generate stats WITHOUT tournaments (season only)
    print("=" * 70)
    print("2. GENERATING STATS WITHOUT TOURNAMENTS (SEASON ONLY)")
    print("=" * 70)
    compiler_season = HockeyStatsCompiler(games_dir, web_dir, include_tournaments=False)
    compiler_season.load_games()
    compiler_season.process_games()
    compiler_season.calculate_poc_ratings()
    compiler_season.download_team_logos()
    compiler_season.save_data(suffix='_season')  # Save as teams_season.json, players_season.json
    print()

    # Step 3: Assign divisions to both files
    print("=" * 70)
    print("3. ASSIGNING DIVISIONS TO TEAMS")
    print("=" * 70)
    assigner = DivisionAssigner(web_dir)
    assigner.assign_divisions()
    print()

    print("=" * 70)
    print("DUAL STATISTICS GENERATION COMPLETE!")
    print("=" * 70)
    print()
    print("Generated files:")
    print("  - teams.json / players.json (with tournaments)")
    print("  - teams_season.json / players_season.json (season only)")
    print("  - Divisions assigned to all teams")
    print()

if __name__ == "__main__":
    main()
