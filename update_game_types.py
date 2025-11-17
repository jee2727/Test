#!/usr/bin/env python3
"""
Update existing game files with game_type field based on scheduleId
"""

import json
import os

def update_game_files():
    """Update all game JSON files to include game_type field"""
    games_dir = "web/data/games"

    print("Updating game files with game_type field...")

    updated_count = 0
    skipped_count = 0

    for filename in sorted(os.listdir(games_dir)):
        if not filename.endswith('.json'):
            continue

        file_path = os.path.join(games_dir, filename)

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                game_data = json.load(f)

            # Skip if already has game_type
            if 'game_type' in game_data:
                print(f"  Skipped (already has game_type): {filename}")
                skipped_count += 1
                continue

            # Determine game type from scheduleId
            # First try to get scheduleId from top level
            schedule_id = game_data.get('schedule_id')

            # If not found, try to get from detailed_game_info
            if not schedule_id and 'detailed_game_info' in game_data:
                schedule_id = game_data['detailed_game_info'].get('scheduleId')

            # Determine game type
            if schedule_id == 183835:
                game_type = 'tournament'
            else:
                game_type = 'season'

            # Update game data
            game_data['game_type'] = game_type
            if schedule_id:
                game_data['schedule_id'] = schedule_id

            # Save updated game data
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(game_data, f, indent=2, ensure_ascii=False)

            print(f"  Updated ({game_type}): {filename}")
            updated_count += 1

        except Exception as e:
            print(f"  Error processing {filename}: {e}")

    print(f"\nSummary:")
    print(f"  Updated: {updated_count}")
    print(f"  Skipped: {skipped_count}")
    print(f"  Total: {updated_count + skipped_count}")

if __name__ == "__main__":
    update_game_files()
