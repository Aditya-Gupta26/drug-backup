from flask import Flask, render_template, jsonify, request
import requests
import random

app = Flask(__name__)

UNIPROT_API_URL = "https://www.ebi.ac.uk/proteins/api/proteins/"

@app.route('/')
def home():
    return render_template('./index.html')

@app.route('/api/protein/<uniprot_id>', methods=['GET'])
def get_protein(uniprot_id):
    response = requests.get(f"{UNIPROT_API_URL}{uniprot_id}")
    if response.status_code == 200:
        data = response.json()
        protein = {
            "name": data["protein"]["recommendedName"]["fullName"]["value"],
            "type": "Unknown",  # This would be determined based on your data
            "medicines": [],  # Medicines can be added based on your data
            "di": 0.5,  # This should be determined based on your data
            "models": ["Model1", "Model2", "Model3"]  # List of models you have
        }
        return jsonify(protein)
    else:
        return jsonify({"error": "Protein not found"}), 404

@app.route('/api/score/<uniprot_id>', methods=['GET'])
def get_score(uniprot_id):
    model = request.args.get('model')
    # Mock score calculation
    score = random.uniform(0, 1)
    return jsonify({"score": score})

if __name__ == '__main__':
    app.run(debug=True)
