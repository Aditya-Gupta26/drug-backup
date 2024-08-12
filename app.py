from flask import Flask, render_template, request, jsonify
import requests
import random
import json
from bs4 import BeautifulSoup as bs 
import pandas as pd
import psycopg2
import xml.etree.ElementTree as ET

app = Flask(__name__)

conn = psycopg2.connect(
    dbname="my_proteins_db",
    user="postgres",
    password="Trainaccount@26",
    host="localhost"
)
cursor = conn.cursor()
col_names = ['Sequence_Length', 'Molecular_Weight', 'GRAVY', 'Isoelectric_Point', 'Instability_Index', 'Aromaticity', 'Charge_at_7', 'is_druggable', 'is_approved_druggable', 'Amino_Acid_Percent_A', 'Amino_Acid_Percent_C', 'Amino_Acid_Percent_D', 'Amino_Acid_Percent_E', 'Amino_Acid_Percent_F', 'Amino_Acid_Percent_G', 'Amino_Acid_Percent_H', 'Amino_Acid_Percent_I', 'Amino_Acid_Percent_K', 'Amino_Acid_Percent_L', 'Amino_Acid_Percent_M', 'Amino_Acid_Percent_N', 'Amino_Acid_Percent_P', 'Amino_Acid_Percent_Q', 
'Amino_Acid_Percent_R', 'Amino_Acid_Percent_S', 'Amino_Acid_Percent_T', 'Amino_Acid_Percent_V', 'Amino_Acid_Percent_W', 'Amino_Acid_Percent_Y', 'Molar_Extinction_Coefficient_1', 'Molar_Extinction_Coefficient_2', 'Secondary_Structure_helix', 'Secondary_Structure_turn', 'Secondary_Structure_sheet', 'aliphatic_aliphatic', 'aliphatic_positive', 'aliphatic_negative', 'aliphatic_uncharged', 'aliphatic_aromatic', 'positive_aliphatic', 'positive_positive', 'positive_negative', 'positive_uncharged', 'positive_aromatic', 'negative_aliphatic', 'negative_positive', 'negative_negative', 
'negative_uncharged', 'negative_aromatic', 'uncharged_aliphatic', 'uncharged_positive', 'uncharged_negative', 'uncharged_uncharged', 'uncharged_aromatic', 'aromatic_aliphatic', 'aromatic_positive', 'aromatic_negative', 'aromatic_uncharged', 'aromatic_aromatic', 'Glycosylation', 'Cross_link', 'Modified_residue', 'Signal', 'Disulfide_bond', 'O_linked', 'N_linked', 'C_linked', 'N_beta_linked', 'S_linked', 'O_alpha_linked', 'binary_count', 'binary_experimental_count', 'xeno_count', 'xeno_experimental_count', 'degree_binary', 'degree_xeno', 'degree_all', 'avg_degree_nbr_binary', 
'avg_degree_nbr_xeno', 'avg_degree_nbr_all', 'strongly_connected_component_sizes_all', 'cytoplasmic_vesicle', 'nucleus', 'melanosome', 'lateral_cell_membrane', 'secreted', 'vacuole', 'vesicle', 'synapse', 'presynapse', 'cleavage_furrow', 'endomembrane_system', 'late_endosome', 'recycling_endosome', 'midbody', 'cytoplasmic_granule', 'endosome', 'early_endosome', 'perikaryon', 'membrane', 'peroxisome', 'cell_membrane', 'cell_junction', 'postsynapse', 'cytoplasm', 'lipid_droplet', 'rough_endoplasmic_reticulum', 'zymogen_granule', 'smooth_endoplasmic_reticulum_membrane', 'inflammasome', 'target_cell_membrane', 'preautophagosomal_structure', 'cornified_envelope', 'mitochondrion', 'microsome', 'sarcoplasmic_reticulum', 'vacuole_membrane', 'cell_surface', 'dynein_axonemal_particle', 'golgo_apparatus', 'parasitophorous_vacuole', 'extracellular_vessicle', 'cell_projection', 'photoreceptor', 'virion', 'cytolitic_granule', 'golgi_outpost', 'myelin_membrane', 'endoplasmic_reticulum', 'chromosome', 'lysosome', 'rrm', 'acidic_residues', 'ph', 'krab', 'pdz', 'btb', 'nuclear_localization_signal', 'fibronectin_type_iii', 'disordered', 'ig_like_v_type', 'ef_hand', 'sh3', 'ig_like', 'pro_residues', 'protein_kinase', 'ig_like_c2_type', 'basic_and_acidic_residues', 'basic_residues', 'egf_like', 'polar_residues', 'Mean', 'Mode', 'Min', 'Max', 'Variance', 'Median', 'Standard_Deviation', 'Range', 'Min_gap', 'Max_gap', 'Average_gap', 'Min_2_hop_gap', 'Max_2_hop_gap', 'Average_2_hop_gap', 'Latent_Value_1', 'Latent_Value_2', 'Latent_Value_3', 'Latent_Value_4', 'Latent_Value_5', 'Latent_Value_6', 'Latent_Value_7', 'Latent_Value_8', 'Latent_Value_9', 'Latent_Value_10', 'Latent_Value_11', 'Latent_Value_12', 'Latent_Value_13', 'Latent_Value_14', 'Latent_Value_15', 'Latent_Value_16', 'Latent_Value_17', 'Latent_Value_18', 'Latent_Value_19', 'Latent_Value_20']

UNIPROT_API_URL = "https://www.ebi.ac.uk/proteins/api/proteins/"
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_pmid', methods=['POST'])
def get_protein_info():

    data = request.get_json()
    uniprot_id = data.get('uniprot_id')
    source = data.get('source')


    if source == "pubmed":
        # Fetching XML data from the URL
        url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmax=30&term={uniprot_id}"
        response = requests.get(url)
        xml_data = response.text

        # Parsing the XML data
        root = ET.fromstring(xml_data)

        # Find and Extract content within <IdList> tag 
        pubmed_ids = []
        for idlist in root.findall(".//IdList"):
            for id in idlist.findall(".//Id"):
                pubmed_ids.append(id.text)
        
        return jsonify({'pmids': pubmed_ids})
        
    else:
        return jsonify({'error': f"Source '{source}' is not supported."}), 400

@app.route('/get_mean_probability', methods=['POST'])
def get_mean_probability():
    protein_id = request.json['protein_id']
    print(protein_id)
    query = """
        SELECT mean_probability FROM protein_prob
        WHERE protein_id = %s
    """
    cursor = conn.cursor()
    cursor.execute(query, (protein_id,))
    result = cursor.fetchone()

    if result:
        mean_probability = result[0]
    else:
        mean_probability = "The drug is already approved druggable"

    return jsonify({'mean_probability': mean_probability})

@app.route('/get_mean_probability_2', methods=['POST'])
def get_mean_probability_2():
    protein_id = request.json['protein_id']
    print(protein_id)
    query = """
        SELECT mean_probability FROM protein_prob_rf
        WHERE protein_id = %s
    """
    cursor = conn.cursor()
    cursor.execute(query, (protein_id,))
    result = cursor.fetchone()

    if result:
        mean_probability = result[0]
    else:
        mean_probability = "The drug is already approved druggable"

    return jsonify({'mean_probability': mean_probability})


@app.route('/api/drugs/<uniprot_id>', methods=['GET'])
def get_drugbank_info(uniprot_id):
    url = f'https://go.drugbank.com/unearth/q?searcher=bio_entities&query={uniprot_id}'
    print(url)
    page = requests.get(url)
    soup = bs(page.text, 'html.parser')

    links = soup.find_all('h2', class_='hit-link')
    print("Number of hit-links: ", len(links))
    drugs = {}
    for link_ in links:
        link = link_.find('a')
        link = link.get('href')
        new_url = 'https://go.drugbank.com' + link
        print(new_url)
        
        page2 = requests.get(new_url)
        
        soup2 = bs(page2.text, 'html.parser')
        table = soup2.find('table', id='target-relations')
        table = table.find('tbody')
        rows = table.find_all('tr')
        drugs_ = {}
        for row in rows:
            cols = row.find_all('td')
            cols = [ele.text.strip() for ele in cols[:-1]]
            drugs_[cols[0]] = [ele for ele in cols[1:] if ele]
        drugs[link] = drugs_
    
    return {'drugs': drugs, 'has_drugs': len(links)>0}

@app.route('/fetch_features', methods=['POST'])
def fetch_features():
    protein_id = request.json['protein_id']
    
    page = int(request.json['page'])
    per_page = 9 # Number of features per page
    
    offset = (page - 1) * per_page
    end = min(offset+per_page, 184)
    selected_columns = col_names[offset:end]
    query = f"""
    SELECT protein_id, {', '.join(selected_columns)} FROM pro_data 
    WHERE protein_id = %s
    """

    cursor = conn.cursor()
    cursor.execute(query, (protein_id,))
    results = cursor.fetchone()

    if results:
        feature_names = [desc[0] for desc in cursor.description][1:]  # Skipping protein_id
        feature_values = results[1:]  # Skipping the protein_id value
        
        data = dict(zip(feature_names, feature_values))
        total_pages = (185 + per_page - 1) // per_page  # Calculate total pages
    else:
        data = {}
        total_pages = 0
    print(data, total_pages)
    return jsonify({'data': data, 'total_pages': total_pages})


@app.route('/api/pie-chart-data_2', methods=['GET'])
def get_pie_chart_data_2():
    # conn = psycopg2.connect(
    # dbname="my_proteins_db",
    # user="postgres",
    # password="Trainaccount@26",
    # host="localhost"
    # )
    # cursor = conn.cursor()
    top_count = int(request.args.get('top', 20))  # Default to 20 if not specified
    # Connect to PostgreSQL and fetch data
    cur = cursor
    print(top_count)
    cursor.execute("SELECT feature_name, partition_average FROM protein_features_rf ORDER BY partition_average DESC LIMIT %s", (top_count,))
    top_features = cursor.fetchall()
    
    # Get the remaining features as "Others"
    #cursor.execute("SELECT SUM(partition_average) FROM protein_features ORDER BY partition_average DESC OFFSET 20")
    cursor.execute("""
            SELECT SUM(partition_average) 
            FROM protein_features_rf 
            WHERE feature_name NOT IN (
                SELECT feature_name 
                FROM protein_features 
                ORDER BY partition_average DESC 
                LIMIT %s
            )
        """,(top_count,))
    others_score = cursor.fetchone()[0]
    
    # cursor.close()
    # conn.close()
    
    return jsonify({
        'topFeatures': [{'name': feature[0], 'score': feature[1]} for feature in top_features],
        'others': {'score': others_score}
    })


@app.route('/api/pie-chart-data', methods=['GET'])
def get_pie_chart_data():
    # conn = psycopg2.connect(
    # dbname="my_proteins_db",
    # user="postgres",
    # password="Trainaccount@26",
    # host="localhost"
    # )
    # cursor = conn.cursor()
    top_count = int(request.args.get('top', 20))  # Default to 20 if not specified
    # Connect to PostgreSQL and fetch data
    cur = cursor
    print(top_count)
    cursor.execute("SELECT feature_name, partition_average FROM protein_features ORDER BY partition_average DESC LIMIT %s", (top_count,))
    top_features = cursor.fetchall()
    
    # Get the remaining features as "Others"
    #cursor.execute("SELECT SUM(partition_average) FROM protein_features ORDER BY partition_average DESC OFFSET 20")
    cursor.execute("""
            SELECT SUM(partition_average) 
            FROM protein_features 
            WHERE feature_name NOT IN (
                SELECT feature_name 
                FROM protein_features 
                ORDER BY partition_average DESC 
                LIMIT %s
            )
        """,(top_count,))
    others_score = cursor.fetchone()[0]
    
    # cursor.close()
    # conn.close()
    
    return jsonify({
        'topFeatures': [{'name': feature[0], 'score': feature[1]} for feature in top_features],
        'others': {'score': others_score}
    })



@app.route('/api/protein/<uniprot_id>', methods=['GET'])
def get_protein(uniprot_id):
    response = requests.get(f"{UNIPROT_API_URL}{uniprot_id}")


# Extract pdbUrl from the first item in the list
    
    if response.status_code == 200:
        data = response.json()
        
        # Save data to a file
        with open(f"{uniprot_id}.json", "w") as f:
            json.dump(data, f, indent=4)
        
        # Fetch the function from the API response
        function = ""
        if "comments" in data:
            for comment in data["comments"]:
                if comment["type"] == "FUNCTION":
                    function = comment["text"][0]["value"]
                    break
        
        alphafold_url = f"https://alphafold.ebi.ac.uk/api/prediction/{uniprot_id}"
        alphafold_response = requests.get(alphafold_url)
        if alphafold_response.status_code == 200:
            alphafold_data = alphafold_response.json()
            with open("dekho.json", "w") as f:
                json.dump(alphafold_data, f, indent=4)
            pdb_url = alphafold_data[0].get('pdbUrl', None)
            print(pdb_url)
        else:
            pdb_url = None
        

        protein = {
            "name": data["protein"]["recommendedName"]["fullName"]["value"],
            "type": "Unknown",  # This would be determined based on your data
            "medicines": [],  # Medicines can be added based on your data
            "di": 0.5,  # This should be determined based on your data
            "models": ["Model1", "Model2", "Model3"],  # List of models you have
            "function": function,
            "pdb_url": pdb_url
        }
        return jsonify(protein)
    else:
        return jsonify({"error": "Protein not found"}), 404


@app.route('/api/search', methods=['GET'])
def search_protein():
    query = request.args.get('query', '')
    cursor.execute("SELECT uniprot_id FROM proteins WHERE uniprot_id ILIKE %s LIMIT 10", (f'{query}%',))
    results = cursor.fetchall()
    return jsonify([row[0] for row in results])


@app.route('/api/score/<uniprot_id>', methods=['GET'])
def get_score(uniprot_id):
    model = request.args.get('model')
    # Mock score calculation
    score = random.uniform(0, 1)
    return jsonify({"score": score})

if __name__ == '__main__':
    app.run(debug=True)


from flask import Flask, render_template, request, jsonify
import requests
import random
import json
from bs4 import BeautifulSoup as bs 
import pandas as pd
import psycopg2


app = Flask(__name__)

conn = psycopg2.connect(
    dbname="my_proteins_db",
    user="postgres",
    password="Trainaccount@26",
    host="localhost"
)
cursor = conn.cursor()
col_names = ['Sequence_Length', 'Molecular_Weight', 'GRAVY', 'Isoelectric_Point', 'Instability_Index', 'Aromaticity', 'Charge_at_7', 'is_druggable', 'is_approved_druggable', 'Amino_Acid_Percent_A', 'Amino_Acid_Percent_C', 'Amino_Acid_Percent_D', 'Amino_Acid_Percent_E', 'Amino_Acid_Percent_F', 'Amino_Acid_Percent_G', 'Amino_Acid_Percent_H', 'Amino_Acid_Percent_I', 'Amino_Acid_Percent_K', 'Amino_Acid_Percent_L', 'Amino_Acid_Percent_M', 'Amino_Acid_Percent_N', 'Amino_Acid_Percent_P', 'Amino_Acid_Percent_Q', 
'Amino_Acid_Percent_R', 'Amino_Acid_Percent_S', 'Amino_Acid_Percent_T', 'Amino_Acid_Percent_V', 'Amino_Acid_Percent_W', 'Amino_Acid_Percent_Y', 'Molar_Extinction_Coefficient_1', 'Molar_Extinction_Coefficient_2', 'Secondary_Structure_helix', 'Secondary_Structure_turn', 'Secondary_Structure_sheet', 'aliphatic_aliphatic', 'aliphatic_positive', 'aliphatic_negative', 'aliphatic_uncharged', 'aliphatic_aromatic', 'positive_aliphatic', 'positive_positive', 'positive_negative', 'positive_uncharged', 'positive_aromatic', 'negative_aliphatic', 'negative_positive', 'negative_negative', 
'negative_uncharged', 'negative_aromatic', 'uncharged_aliphatic', 'uncharged_positive', 'uncharged_negative', 'uncharged_uncharged', 'uncharged_aromatic', 'aromatic_aliphatic', 'aromatic_positive', 'aromatic_negative', 'aromatic_uncharged', 'aromatic_aromatic', 'Glycosylation', 'Cross_link', 'Modified_residue', 'Signal', 'Disulfide_bond', 'O_linked', 'N_linked', 'C_linked', 'N_beta_linked', 'S_linked', 'O_alpha_linked', 'binary_count', 'binary_experimental_count', 'xeno_count', 'xeno_experimental_count', 'degree_binary', 'degree_xeno', 'degree_all', 'avg_degree_nbr_binary', 
'avg_degree_nbr_xeno', 'avg_degree_nbr_all', 'strongly_connected_component_sizes_all', 'cytoplasmic_vesicle', 'nucleus', 'melanosome', 'lateral_cell_membrane', 'secreted', 'vacuole', 'vesicle', 'synapse', 'presynapse', 'cleavage_furrow', 'endomembrane_system', 'late_endosome', 'recycling_endosome', 'midbody', 'cytoplasmic_granule', 'endosome', 'early_endosome', 'perikaryon', 'membrane', 'peroxisome', 'cell_membrane', 'cell_junction', 'postsynapse', 'cytoplasm', 'lipid_droplet', 'rough_endoplasmic_reticulum', 'zymogen_granule', 'smooth_endoplasmic_reticulum_membrane', 'inflammasome', 'target_cell_membrane', 'preautophagosomal_structure', 'cornified_envelope', 'mitochondrion', 'microsome', 'sarcoplasmic_reticulum', 'vacuole_membrane', 'cell_surface', 'dynein_axonemal_particle', 'golgo_apparatus', 'parasitophorous_vacuole', 'extracellular_vessicle', 'cell_projection', 'photoreceptor', 'virion', 'cytolitic_granule', 'golgi_outpost', 'myelin_membrane', 'endoplasmic_reticulum', 'chromosome', 'lysosome', 'rrm', 'acidic_residues', 'ph', 'krab', 'pdz', 'btb', 'nuclear_localization_signal', 'fibronectin_type_iii', 'disordered', 'ig_like_v_type', 'ef_hand', 'sh3', 'ig_like', 'pro_residues', 'protein_kinase', 'ig_like_c2_type', 'basic_and_acidic_residues', 'basic_residues', 'egf_like', 'polar_residues', 'Mean', 'Mode', 'Min', 'Max', 'Variance', 'Median', 'Standard_Deviation', 'Range', 'Min_gap', 'Max_gap', 'Average_gap', 'Min_2_hop_gap', 'Max_2_hop_gap', 'Average_2_hop_gap', 'Latent_Value_1', 'Latent_Value_2', 'Latent_Value_3', 'Latent_Value_4', 'Latent_Value_5', 'Latent_Value_6', 'Latent_Value_7', 'Latent_Value_8', 'Latent_Value_9', 'Latent_Value_10', 'Latent_Value_11', 'Latent_Value_12', 'Latent_Value_13', 'Latent_Value_14', 'Latent_Value_15', 'Latent_Value_16', 'Latent_Value_17', 'Latent_Value_18', 'Latent_Value_19', 'Latent_Value_20']

UNIPROT_API_URL = "https://www.ebi.ac.uk/proteins/api/proteins/"
@app.route('/')
def index():
    return render_template('index.html')


@app.route('/get_mean_probability', methods=['POST'])
def get_mean_probability():
    protein_id = request.json['protein_id']
    print(protein_id)
    query = """
        SELECT mean_probability FROM protein_prob
        WHERE protein_id = %s
    """
    cursor = conn.cursor()
    cursor.execute(query, (protein_id,))
    result = cursor.fetchone()

    if result:
        mean_probability = result[0]
    else:
        mean_probability = "The drug is already approved druggable"

    return jsonify({'mean_probability': mean_probability})

@app.route('/get_mean_probability_2', methods=['POST'])
def get_mean_probability_2():
    protein_id = request.json['protein_id']
    print(protein_id)
    query = """
        SELECT mean_probability FROM protein_prob_rf
        WHERE protein_id = %s
    """
    cursor = conn.cursor()
    cursor.execute(query, (protein_id,))
    result = cursor.fetchone()

    if result:
        mean_probability = result[0]
    else:
        mean_probability = "The drug is already approved druggable"

    return jsonify({'mean_probability': mean_probability})


@app.route('/api/drugs/<uniprot_id>', methods=['GET'])
def get_drugbank_info(uniprot_id):
    url = f'https://go.drugbank.com/unearth/q?searcher=bio_entities&query={uniprot_id}'
    print(url)
    page = requests.get(url)
    soup = bs(page.text, 'html.parser')

    links = soup.find_all('h2', class_='hit-link')
    print("Number of hit-links: ", len(links))
    drugs = {}
    for link_ in links:
        link = link_.find('a')
        link = link.get('href')
        new_url = 'https://go.drugbank.com' + link
        print(new_url)
        
        page2 = requests.get(new_url)
        
        soup2 = bs(page2.text, 'html.parser')
        table = soup2.find('table', id='target-relations')
        table = table.find('tbody')
        rows = table.find_all('tr')
        drugs_ = {}
        for row in rows:
            cols = row.find_all('td')
            cols = [ele.text.strip() for ele in cols[:-1]]
            drugs_[cols[0]] = [ele for ele in cols[1:] if ele]
        drugs[link] = drugs_
    
    return {'drugs': drugs, 'has_drugs': len(links)>0}

@app.route('/fetch_features', methods=['POST'])
def fetch_features():
    protein_id = request.json['protein_id']
    
    page = int(request.json['page'])
    per_page = 9 # Number of features per page
    
    offset = (page - 1) * per_page
    end = min(offset+per_page, 184)
    selected_columns = col_names[offset:end]
    query = f"""
    SELECT protein_id, {', '.join(selected_columns)} FROM pro_data 
    WHERE protein_id = %s
    """

    cursor = conn.cursor()
    cursor.execute(query, (protein_id,))
    results = cursor.fetchone()

    if results:
        feature_names = [desc[0] for desc in cursor.description][1:]  # Skipping protein_id
        feature_values = results[1:]  # Skipping the protein_id value
        
        data = dict(zip(feature_names, feature_values))
        total_pages = (185 + per_page - 1) // per_page  # Calculate total pages
    else:
        data = {}
        total_pages = 0
    print(data, total_pages)
    return jsonify({'data': data, 'total_pages': total_pages})


@app.route('/api/pie-chart-data_2', methods=['GET'])
def get_pie_chart_data_2():
    # conn = psycopg2.connect(
    # dbname="my_proteins_db",
    # user="postgres",
    # password="Trainaccount@26",
    # host="localhost"
    # )
    # cursor = conn.cursor()
    top_count = int(request.args.get('top', 20))  # Default to 20 if not specified
    # Connect to PostgreSQL and fetch data
    cur = cursor
    print(top_count)
    cursor.execute("SELECT feature_name, partition_average FROM protein_features_rf ORDER BY partition_average DESC LIMIT %s", (top_count,))
    top_features = cursor.fetchall()
    
    # Get the remaining features as "Others"
    #cursor.execute("SELECT SUM(partition_average) FROM protein_features ORDER BY partition_average DESC OFFSET 20")
    cursor.execute("""
            SELECT SUM(partition_average) 
            FROM protein_features_rf 
            WHERE feature_name NOT IN (
                SELECT feature_name 
                FROM protein_features 
                ORDER BY partition_average DESC 
                LIMIT %s
            )
        """,(top_count,))
    others_score = cursor.fetchone()[0]
    
    # cursor.close()
    # conn.close()
    
    return jsonify({
        'topFeatures': [{'name': feature[0], 'score': feature[1]} for feature in top_features],
        'others': {'score': others_score}
    })


@app.route('/api/pie-chart-data', methods=['GET'])
def get_pie_chart_data():
    # conn = psycopg2.connect(
    # dbname="my_proteins_db",
    # user="postgres",
    # password="Trainaccount@26",
    # host="localhost"
    # )
    # cursor = conn.cursor()
    top_count = int(request.args.get('top', 20))  # Default to 20 if not specified
    # Connect to PostgreSQL and fetch data
    cur = cursor
    print(top_count)
    cursor.execute("SELECT feature_name, partition_average FROM protein_features ORDER BY partition_average DESC LIMIT %s", (top_count,))
    top_features = cursor.fetchall()
    
    # Get the remaining features as "Others"
    #cursor.execute("SELECT SUM(partition_average) FROM protein_features ORDER BY partition_average DESC OFFSET 20")
    cursor.execute("""
            SELECT SUM(partition_average) 
            FROM protein_features 
            WHERE feature_name NOT IN (
                SELECT feature_name 
                FROM protein_features 
                ORDER BY partition_average DESC 
                LIMIT %s
            )
        """,(top_count,))
    others_score = cursor.fetchone()[0]
    
    # cursor.close()
    # conn.close()
    
    return jsonify({
        'topFeatures': [{'name': feature[0], 'score': feature[1]} for feature in top_features],
        'others': {'score': others_score}
    })



@app.route('/api/protein/<uniprot_id>', methods=['GET'])
def get_protein(uniprot_id):
    response = requests.get(f"{UNIPROT_API_URL}{uniprot_id}")


# Extract pdbUrl from the first item in the list
    
    if response.status_code == 200:
        data = response.json()
        
        # Save data to a file
        with open(f"{uniprot_id}.json", "w") as f:
            json.dump(data, f, indent=4)
        
        # Fetch the function from the API response
        function = ""
        if "comments" in data:
            for comment in data["comments"]:
                if comment["type"] == "FUNCTION":
                    function = comment["text"][0]["value"]
                    break
        
        alphafold_url = f"https://alphafold.ebi.ac.uk/api/prediction/{uniprot_id}"
        alphafold_response = requests.get(alphafold_url)
        if alphafold_response.status_code == 200:
            alphafold_data = alphafold_response.json()
            with open("dekho.json", "w") as f:
                json.dump(alphafold_data, f, indent=4)
            pdb_url = alphafold_data[0].get('pdbUrl', None)
            print(pdb_url)
        else:
            pdb_url = None
        

        protein = {
            "name": data["protein"]["recommendedName"]["fullName"]["value"],
            "type": "Unknown",  # This would be determined based on your data
            "medicines": [],  # Medicines can be added based on your data
            "di": 0.5,  # This should be determined based on your data
            "models": ["Model1", "Model2", "Model3"],  # List of models you have
            "function": function,
            "pdb_url": pdb_url
        }
        return jsonify(protein)
    else:
        return jsonify({"error": "Protein not found"}), 404


@app.route('/api/search', methods=['GET'])
def search_protein():
    query = request.args.get('query', '')
    cursor.execute("SELECT uniprot_id FROM proteins WHERE uniprot_id ILIKE %s LIMIT 10", (f'{query}%',))
    results = cursor.fetchall()
    return jsonify([row[0] for row in results])


@app.route('/api/score/<uniprot_id>', methods=['GET'])
def get_score(uniprot_id):
    model = request.args.get('model')
    # Mock score calculation
    score = random.uniform(0, 1)
    return jsonify({"score": score})

if __name__ == '__main__':
    app.run(debug=True)

