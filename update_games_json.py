#!/usr/bin/env python3
"""
Update games.json file with game_type field from individual game files
"""

import json
import os

def update_games_json():
    """Update the games.json summary file with game_type from individual files"""
    games_dir = "web/data/games"
    games_json_path = "web/data/games.json"

    print("Loading individual game files...")

    # Load all individual game files
    game_types = {}
    for filename in os.listdir(games_dir):
        if not filename.endswith('.json'):
            continue

        file_path = os.path.join(games_dir, filename)
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                game_data = json.load(f)

            game_id = game_data.get('id')
            game_type = game_data.get('game_type', 'season')
            schedule_id = game_data.get('schedule_id')

            if game_id:
                game_types[game_id] = {
                    'game_type': game_type,
                    'schedule_id': schedule_id
                }

        except Exception as e:
            print(f"  Error loading {filename}: {e}")

    print(f"Loaded {len(game_types)} game types")

    # Update games.json
    print("Updating games.json...")

    try:
        with open(games_json_path, 'r', encoding='utf-8') as f:
            games = json.load(f)

        updated_count = 0
        for game in games:
            game_id = game.get('id')
            if game_id in game_types:
                game['game_type'] = game_types[game_id]['game_type']
                if game_types[game_id]['schedule_id']:
                    game['schedule_id'] = game_types[game_id]['schedule_id']
                updated_count += 1

        # Save updated games.json
        with open(games_json_path, 'w', encoding='utf-8') as f:
            json.dump(games, f, indent=2, ensure_ascii=False)

        print(f"Updated {updated_count} games in games.json")

    except Exception as e:
        print(f"Error updating games.json: {e}")

if __name__ == "__main__":
    update_games_json()
