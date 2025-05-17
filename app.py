from flask import Flask, render_template, jsonify
import csv
import os # Import os to construct path relative to script

app = Flask(__name__)

# Path to your CSV file - ensure it's relative to app.py
# Vercel will place your files in a specific directory structure.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
VOLCANO_DATA_FILE = os.path.join(BASE_DIR, 'volcanoes.csv')

def get_volcano_data():
    """Reads volcano data from the CSV file."""
    volcanoes = []
    try:
        with open(VOLCANO_DATA_FILE, mode='r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                try:
                    volcanoes.append({
                        'name': row['Name'],
                        'lat': float(row['Latitude']),
                        'lon': float(row['Longitude']),
                        'type': row['Type'],
                        'last_eruption': row['LastKnownEruption']
                    })
                except ValueError:
                    print(f"Skipping row due to data conversion error: {row}")
                except KeyError as e:
                    print(f"Skipping row due to missing key {e}: {row}")
    except FileNotFoundError:
        print(f"Error: {VOLCANO_DATA_FILE} not found. Looked in {os.path.abspath(VOLCANO_DATA_FILE)}")
    except Exception as e:
        print(f"An unexpected error occurred while reading CSV: {e}")
    return volcanoes

@app.route('/')
def index():
    """Serves the main HTML page."""
    return render_template('index.html')

@app.route('/api/volcanoes')
def api_volcanoes():
    """Provides volcano data as JSON."""
    data = get_volcano_data()
    if not data: # If data is empty, it might indicate a problem reading the file
        print(f"API: No volcano data found. Check CSV path and content. Path: {VOLCANO_DATA_FILE}")
    return jsonify(data)

# For local development:
# if __name__ == '__main__':
#     app.run(debug=True)

# For Vercel, it will import the `app` object. The above `if __name__` block is fine to keep.