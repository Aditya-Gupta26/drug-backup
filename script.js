let pieChartInstance = null;
async function searchProtein() {
    const uniprotId = document.getElementById('search-bar').value;
    const response = await fetch(`/api/protein/${uniprotId}`);
    const drugy = await fetch(`/api/drugs/${uniprotId}`);
    
    const proteinData = await response.json();
    const drugydata = await drugy.json();

    if (proteinData.error) {
        alert(proteinData.error);
    } else {
        // document.getElementById('first-section').classList.add('slide-up');
        // setTimeout(() => {
        //     displayProteinDetails(proteinData);
        // }, 500); // Match the delay with the slide-up animation duration
        displayProteinDetails(proteinData,drugydata)
        
    }
}

function displayProteinDetails(data,drugyData) {
    const thirdSection = document.getElementById('third-section');
    if (thirdSection) {
        thirdSection.remove(); // This will remove the element from the DOM
    }
    const header = document.getElementById('first-section');
    const detailsDiv = document.getElementById('second-section');
    
    // Trigger the slide-up animation
    header.classList.add('active');
    
    // Populate the protein details after the slide-up animation
    setTimeout(() => {
        let buttonHTML = '';
        if (drugyData.has_drugs){
            buttonHTML = `<button id = "view-drug-info-btn" class = "button" onclick="showDrugPopup()">View Drug Information</button>`;
        }
        piebutton = `<button id = "view-pie-info-btn" class = "button" onclick="showPiePopup()">View Pie Chart</button>`;
        featbutton = `<button id="features-btn" class = "button" onclick="details()" >View Protein Features</button>`;
        dibutton = `<button id="show-third-section" class = "button" onclick="di()">Show Druggability Index</button>`;
        pmidbutton = `<button id="pmid" class = "button" onclick="pmid_show()">Show PMIDs</button>`;
        const drugTable = createDrugTable(drugyData);
        detailsDiv.innerHTML = `
            <div class="card">
                <h3>3D Structure</h3>
                
                <!-- Structure rendering will be handled later -->
                <div id="msp-container" style="width: 100%; height: 400px;"></div>
            </div>
            <div class="card">
                <h3>Protein: ${data.name}</h3>
                
                ${buttonHTML}
                ${piebutton}
                ${featbutton}
                ${dibutton}
                ${pmidbutton}
            </div>
            <div class="card">
                <h4>Function</h3>
                <p>${data.function || "Function not available"}</p>
            </div>
        `;
        
        
        // Make sure the cards are in their final position before fading in
        detailsDiv.style.opacity = 0;
        detailsDiv.classList.add('active');
        setTimeout(() => {
            detailsDiv.style.opacity = 1;
        }, 10); // Slight delay to trigger CSS transition
        if (data.pdb_url) {
            
            initializeMolstarViewer(data.pdb_url)
        }
    }, 1000); // Match the delay with the slide-up animation duration
}

function generateRandomColor() {
    // Generate a random color in hex format
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgba(${r}, ${g}, ${b}, 0.2)`;
}

function easeOutQuad(t) {
    return t * (2 - t);
}

function animatePercentage(element, targetValue, duration) {
    let startValue = 0;
    const startTime = performance.now();
    targetValue = parseFloat(targetValue); // Ensure targetValue is a number

    function update() {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1); // Normalize progress to [0, 1]
        const easedProgress = easeOutQuad(progress); // Apply easing function
        const currentValue = (easedProgress * targetValue).toFixed(2); // Use toFixed to ensure 2 decimal places

        element.textContent = currentValue + '%';

        if (progress < 1) {
            requestAnimationFrame(update); // Continue the animation
        }
    }

    update(); // Start the animation
}

function pmid_show(){
    const uniprotId = document.getElementById('search-bar').value;

    


    fetch('/get_pmid', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uniprot_id: uniprotId , source: "pubmed"})
    })
    .then(response => response.json())
    .then(data => {


        const popup = document.createElement('div');
        popup.id = 'pie-chart-popup';
        popup.innerHTML = `
            <div id="pmid-modal" class="modal">
                <div class="modal-content">
                    <span class="close-button" onclick="closeModal()">&times;</span>
                    <h2>PubMed IDs</h2>
                    <table id="pmid-table" border="1">
                    <thead>
                        <tr>
                            <th></th>
                            <th>PubMed ID</th>
                        </tr>
                    </thead>
                    <tbody id="pmid-table-body">
                    </tbody>
                    </table>
                </div>
            </div>
        `;
        document.body.appendChild(popup);
        const pmidTableBody = document.getElementById('pmid-table-body');
        pmidTableBody.innerHTML = ''; // Clear any previous PMIDs

        // Display PMIDs in the list
        if (data.pmids && data.pmids.length > 0) {
            // Populate the table with PubMed IDs
            data.pmids.forEach((pmid, index) => {
                const row = document.createElement('tr');
                const cellIndex = document.createElement('td');
                const cellPmid = document.createElement('td');

                cellIndex.textContent = index + 1;
                cellPmid.textContent = pmid;

                row.appendChild(cellIndex);
                row.appendChild(cellPmid);
                pmidTableBody.appendChild(row);
            });

            // Show the modal
            document.getElementById('pmid-modal').style.display = 'block';
        } else {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 2;
            cell.textContent = 'No PMIDs found.';
            row.appendChild(cell);
            pmidTableBody.appendChild(row);
        }
    
        // Show the modal
        document.getElementById('pmid-modal').style.display = 'block';
    })
    .catch(error => {
        console.error('Error:', error);
    });


}

function closeModal() {
    const modal = document.getElementById('pie-chart-popup');
    if (modal) {
        modal.parentNode.removeChild(modal);
    }
}
function di() {
    const thirdSection2 = document.getElementById('third-section');
    if (thirdSection2) {
        thirdSection2.remove(); // This will remove the element from the DOM
    }
    const uniprotId = document.getElementById('search-bar').value;
    console.log("Yo");
    const thirdSection = document.createElement('div');
    thirdSection.id = 'third-section';
    thirdSection.innerHTML = ` <div id="left-third-section">
            <h3>Druggability Index</h3>
            <p id="druggability-index"></p>
            <h6>The XGB model predicts the protein to be approved-druggable by this percentage.</h6>
        </div>
        <div id="vertical-line"></div> <!-- Add this line -->
        <div id="right-third-section">
            <p id="di-description">
                The Druggability-Index displays the probability of the selected protein being approved-druggable. Our models are trained on a total of 183 features for over 20,000 proteins.
            </p>
            <p id="model-description">
                We have trained multiple models on the protein dataset. Here, we display results obtained from training on XG-Boost and Random-Forest algorithms. You can choose to view the DI-scores for either model.
            </p>
            <div id="button-container">
                <button id="xgb-button" class = "button" onclick="di()" >DI USING XGB</button>
                <button id="rf-button" class = "button" onclick = "dirf()" >DI USING RF</button>
            </div>
        </div>`;

    
    fetch('/get_mean_probability', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ protein_id: uniprotId })
    })
    .then(response => response.json())
    .then(data => {

        const targetValue = (data.mean_probability*100).toFixed(2);
        animatePercentage(document.getElementById('druggability-index'), targetValue, 1000);
        // document.getElementById('druggability-index').textContent = (data.mean_probability*100).toFixed(2) + '%';
        
        document.getElementById('third-section').style.display = 'flex';
        document.getElementById('third-section').scrollIntoView({
            behavior: 'smooth'
        });

    })
    .catch(error => {
        console.error('Error:', error);
    });
    document.body.appendChild(thirdSection)
};

function dirf() {
    const thirdSection2 = document.getElementById('third-section');
    if (thirdSection2) {
        thirdSection2.remove(); // This will remove the element from the DOM
    }
    const uniprotId = document.getElementById('search-bar').value;
    console.log("Yo");
    const thirdSection = document.createElement('div');
    thirdSection.id = 'third-section';
    thirdSection.innerHTML = ` <div id="left-third-section">
            <h3>Druggability Index</h3>
            <p id="druggability-index"></p>
            <h6>The RF model predicts the protein to be approved-druggable by this percentage.</h6>
        </div>
        <div id="vertical-line"></div> <!-- Add this line -->
        <div id="right-third-section">
            <p id="di-description">
                The Druggability-Index displays the probability of the selected protein being approved-druggable. Our models are trained on a total of 183 features for over 20,000 proteins.
            </p>
            <p id="model-description">
                We have trained multiple models on the protein dataset. Here, we display results obtained from training on XG-Boost and Random-Forest algorithms. You can choose to view the DI-scores for either model.
            </p>
            <div id="button-container">
                <button id="xgb-button" class = "button" onclick="di()" >DI USING XGB</button>
                <button id="rf-button" class = "button" onclick = "dirf()">DI USING RF</button>
            </div>
        </div>`;

    
    fetch('/get_mean_probability_2', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ protein_id: uniprotId })
    })
    .then(response => response.json())
    .then(data => {

        const targetValue = (data.mean_probability*100).toFixed(2);
        var value = document.getElementById('druggability-index');
        animatePercentage(value, targetValue, 1000);
        // document.getElementById('druggability-index').textContent = (data.mean_probability*100).toFixed(2) + '%';
        
        document.getElementById('third-section').style.display = 'flex';
        document.getElementById('third-section').scrollIntoView({
            behavior: 'smooth'
        });

    })
    .catch(error => {
        console.error('Error:', error);
    });
    document.body.appendChild(thirdSection)
};



function showPiePopup() {
    // Create and display the full-screen pop-up
    const popup = document.createElement('div');
    popup.id = 'pie-chart-popup';
    popup.innerHTML = `
        <div class="popup-content2">
            <button class="close" onclick="closePieChartPopup()">&times;</button>
            <h3 class = "prot_feat" >Protein Features Pie Chart</h3>
            <div class = "chart-container">
                <canvas id="pie-chart"></canvas>
                <div class="chart-legend"></div> 
            </div>
            <div class="bottom-section">
                <div class="label-container">
                    <label for="top-features-select">Number of Top Features:</label>
                    <select id="top-features-select" onchange="updatePieChart()">
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="15">15</option>
                        <option value="20" selected>20</option>
                        <option value="25">25</option>
                        <option value="30">30</option>
                        <option value="35">35</option>
                        <option value="40">40</option>
                        <option value="45">45</option>
                        <option value="50">50</option>
                        <option value="55">55</option>
                        <option value="60">60</option>
                    </select>

                    <select id="top-features-select2" onchange="updatePieChart2()" style="display:none;">
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="15">15</option>
                        <option value="20" selected>20</option>
                        <option value="25">25</option>
                        <option value="30">30</option>
                        <option value="35">35</option>
                        <option value="40">40</option>
                        <option value="45">45</option>
                        <option value="50">50</option>
                        <option value="55">55</option>
                        <option value="60">60</option>
                    </select>
                </div>

                <div class="button-container">
                    <button id="xgb_pie" class="button" onClick="renderPieChart(20)">XGB</button>
                    <button id="rf_pie" class="button" onClick="renderPieChart2(20)">RF</button>
                </div>
            </div>
            
        </div>
    `;
    document.body.appendChild(popup);
    
    setTimeout(() => {
        popup.querySelector('.popup-content2').classList.add('active');
    }, 10);

    // Render the pie chart
    renderPieChart(20);
}

function showPiePopup2() {
    // Create and display the full-screen pop-up
    const popup = document.createElement('div');
    popup.id = 'pie-chart-popup';
    popup.innerHTML = `
        <div class="popup-content2">
            <button class="close" onclick="closePieChartPopup()">&times;</button>
            <h3>Protein Features Pie Chart</h3>
            <button id="xgb_pie" class = "button" onClick="renderPieChart()">XGB</button>
            <button id = "rf_pie" class = "button">RF</button>
            <div class = "label-container"
                <label for="top-features-select2">Number of Top Features:</label>
                <select id="top-features-select2" onchange="updatePieChart2()">
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="15">15</option>
                    <option value="20" selected>20</option>
                    <option value="25">25</option>
                    <option value="30">30</option>
                    <option value="35">35</option>
                    <option value="40">40</option>
                    <option value="45">45</option>
                    <option value="50">50</option>
                    <option value="55">55</option>
                    <option value="60">60</option>
            </select>
            </div>
            <canvas id="pie-chart"></canvas>
            <div class="chart-legend"></div> 
        </div>
    `;
    document.body.appendChild(popup);
    
    setTimeout(() => {
        popup.querySelector('.popup-content2').classList.add('active');
    }, 10);

    // Render the pie chart
    renderPieChart2(20);
}

function closePieChartPopup() {
    const popup = document.getElementById('pie-chart-popup');
    if (popup) {
        document.body.removeChild(popup);
    }
    // const popupContent = document.getElementById('.popup-content2');
    // if (popupContent) {
    //     popupContent.classList.add('closing');
    //     setTimeout(() => {
    //         const popup = document.getElementById('.pie-chart-popup');
    //         if (popup) {
    //             document.body.removeChild(popup);
    //         }
    //     }, 500); // Match the delay with the CSS transition duration
    //     document.body.removeChild(popup);
    // }
}

function updatePieChart() {
    const topFeaturesCount = document.getElementById('top-features-select').value;
    renderPieChart(parseInt(topFeaturesCount));
}

function updatePieChart2() {
    const topFeaturesCount = document.getElementById('top-features-select2').value;
    renderPieChart2(parseInt(topFeaturesCount));
}


function renderPieChart(topFeaturesCount) {
    var section = document.getElementById('top-features-select');
    if (section.style.display === 'none') {
        section.style.display = 'block';
    } else {
        section.style.display = 'block';
    }
    var section = document.getElementById('top-features-select2');
    if (section.style.display === 'none') {
        section.style.display = 'none';
    } else {
        section.style.display = 'none';
    }

    fetch(`/api/pie-chart-data?top=${topFeaturesCount}`) // API endpoint to fetch data
        .then(response => response.json())
        .then(data => {
            const ctx = document.getElementById('pie-chart').getContext('2d');
            
            if (pieChartInstance) {
                pieChartInstance.destroy();
            }

            // Top 20 features and "Others"
            const topFeatures = data.topFeatures;
            const others = data.others;
            const featureColors = [...topFeatures.map(() => generateRandomColor()), generateRandomColor()];
            const chartData = {
                labels: [...topFeatures.map(feature => feature.name), 'Others'],
                datasets: [{
                    data: [...topFeatures.map(feature => feature.score), others.score],
                    backgroundColor: featureColors,
                    borderColor: featureColors.map(color => color.replace('0.2', '1')), // Make borders darker
                    borderWidth: 1
                    // backgroundColor: [...topFeatures.map(() => 'rgba(75, 192, 192, 0.2)'), 'rgba(153, 102, 255, 0.2)']
                }]
            };
            
          
            pieChartInstance = new Chart(ctx, {
                type: 'pie',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.label || '';
                                    if (context.parsed) {
                                        // label += ': ' + context.parsed + '%';
                                        label += ': ' + context.raw.toFixed(2) + '%'; // Adjusted for percentage
                                    }
                                    return label;
                                }
                            }
                        }
                    }
                }
            });
        });
}

function renderPieChart2(topFeaturesCount) {

    var section = document.getElementById('top-features-select');
    if (section.style.display === 'none') {
        section.style.display = 'none';
    } else {
        section.style.display = 'none';
    }
    var section = document.getElementById('top-features-select2');
    if (section.style.display === 'none') {
        section.style.display = 'block';
    } else {
        section.style.display = 'block';
    }
    fetch(`/api/pie-chart-data_2?top=${topFeaturesCount}`) // API endpoint to fetch data
        .then(response => response.json())
        .then(data => {
            const ctx = document.getElementById('pie-chart').getContext('2d');
            
            if (pieChartInstance) {
                pieChartInstance.destroy();
            }

            // Top 20 features and "Others"
            const topFeatures = data.topFeatures;
            const others = data.others;
            const featureColors = [...topFeatures.map(() => generateRandomColor()), generateRandomColor()];
            const chartData = {
                labels: [...topFeatures.map(feature => feature.name), 'Others'],
                datasets: [{
                    data: [...topFeatures.map(feature => feature.score), others.score],
                    backgroundColor: featureColors,
                    borderColor: featureColors.map(color => color.replace('0.2', '1')), // Make borders darker
                    borderWidth: 1
                    // backgroundColor: [...topFeatures.map(() => 'rgba(75, 192, 192, 0.2)'), 'rgba(153, 102, 255, 0.2)']
                }]
            };
            
          
            pieChartInstance = new Chart(ctx, {
                type: 'pie',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.label || '';
                                    if (context.parsed) {
                                        // label += ': ' + context.parsed + '%';
                                        label += ': ' + context.raw.toFixed(2) + '%'; // Adjusted for percentage
                                    }
                                    return label;
                                }
                            }
                        }
                    }
                }
            });
        });
}




function showDrugPopup() {
    const drugyResponse = fetch(`/api/drugs/${document.getElementById('search-bar').value}`)
        .then(response => response.json())
        .then(drugyData => {
            const drugTable = createDrugTable(drugyData.drugs);
            const popup = document.createElement('div');
            popup.classList.add('popup');
            popup.innerHTML = `
                <div class="popup-content">
                    <span class="close" onclick="closeDrugPopup()">&times;</span>
                    <div class="popup-header"><h3>Drug Information</h3></div>
                    <div class="popup-body">${drugTable}</div>
                    
                </div>
            `;
            document.body.appendChild(popup);

            setTimeout(() => {
                popup.querySelector('.popup-content').classList.add('active');
            }, 10);
        });
}

function closeDrugPopup() {
    const popupContent = document.querySelector('.popup-content');
    if (popupContent) {
        popupContent.classList.add('closing');
        setTimeout(() => {
            const popup = popupContent.closest('.popup');
            if (popup) {
                document.body.removeChild(popup);
            }
        }, 500); // Match the delay with the CSS transition duration

        document.body.removeChild(popup);
    }
}



function createDrugTable(drugyData) {
    let tableHTML = '<table><tr><th>Drug ID</th><th>Drug Name</th><th>Status</th><th>Target</th></tr>';
    
    for (const [entity, drugs] of Object.entries(drugyData)) {
        for (const [drugID, drugDetails] of Object.entries(drugs)) {
            tableHTML += `<tr>
                            <td>${drugID}</td>
                            <td>${drugDetails[0]}</td>
                            <td>${drugDetails[1]}</td>
                            <td>${drugDetails[2]}</td>
                          </tr>`;
        }
    }
    
    tableHTML += '</table>';
    return tableHTML;
}

function displayModelSelection(models) {
    const modelSelectionDiv = document.getElementById('model-selection');
    modelSelectionDiv.innerHTML = `
        <h3>Select a Model to Get Score</h3>
        <select id="model-select">
            ${models.map(model => `<option value="${model}">${model}</option>`).join('')}
        </select>
        <button onclick="getScore()">Get Score</button>
    `;
}

async function getScore() {
    const selectedModel = document.getElementById('model-select').value;
    const uniprotId = document.getElementById('search-bar').value;
    const response = await fetch(`/api/score/${uniprotId}?model=${selectedModel}`);
    const scoreData = await response.json();
    alert(`The score for ${selectedModel} is ${scoreData.score}`);
}

async function fetchAlphaFoldData(pdb_url) {
    render3DStructure(pdb_url);
    
    // const response = await fetch(`/api/alphafold/${pdbId}`);
    // const data = await response.json();
    
    // if (data.pdb_url) {
    //     render3DStructure(data.pdb_url);
    // } else {
    //     document.getElementById('msp-container').innerHTML = "<p>3D structure not available.</p>";
    // }
}

async function fetchSuggestions(query) {
    const response = await fetch(`/api/search?query=${query}`);
    const suggestions = await response.json();
    return suggestions;
}

document.getElementById('search-bar').addEventListener('input', async function() {
    const query = this.value;
    const suggestions = await fetchSuggestions(query);
    const suggestionsBox = document.getElementById('suggestions-box');
    suggestionsBox.innerHTML = ''; // Clear previous suggestions

    suggestions.forEach(suggestion => {
        const div = document.createElement('div');
        div.textContent = suggestion;
        div.classList.add('suggestion-item');
        div.onclick = function() {
            document.getElementById('search-bar').value = suggestion;
            suggestionsBox.innerHTML = '';
        };
        suggestionsBox.appendChild(div);
    });
    //console.log(suggestions);  // You can display these suggestions in a dropdown below the search bar
});


function render3DStructure(pdbUrl) {
    const viewer = $3Dmol.createViewer("msp-container", {
        defaultcolors: $3Dmol.rasmolElementColors
    });

    viewer.addModelFromURI(pdbUrl, "pdb", function() {
        viewer.setStyle({}, {cartoon: {color: 'spectrum'}});
        viewer.zoomTo();
        viewer.render();
    });
}

function initializeMolstarViewer(pdbUrl) {
    const viewerDiv = document.getElementById('viewer');
    const viewer = new Molstar.Viewer(viewerDiv);
    
    viewer.loadStructure({
        url: pdbUrl,
        format: 'pdb',
    }).then(() => {
        viewer.setView('full');
    }).catch(error => {
        console.error('Error loading structure:', error);
    });
}

function details() {
    /*let proteinID = /* Get the UniProt ID entered by the user */
    const uniprotId = document.getElementById('search-bar').value;
    let proteinID = uniprotId;
    let currentPage = 1;
    let searchFeature = "";

    function loadFeatures(page) {
        fetch('/fetch_features', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ protein_id: proteinID, page: page })
        })
        .then(response => response.json())
        .then(data => {

            

            
            const featuresContent = document.getElementById('features-content');
            featuresContent.innerHTML = '';  // Clear previous content
            
            for (const [feature, value] of Object.entries(data.data)) {
                
                
                let featureItem = document.createElement('div');
                featureItem.className = 'feature-item';
                let formattedFeature = feature.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());

                featureItem.innerHTML = `
                    <div class="feature-name" style="font-weight: bold; text-align: center; margin-bottom: 10px;">
                        ${formattedFeature}:
                    </div>
                    
                    <div class="feature-value" style="text-align: center;">
                        ${value}
                    </div>
                `;

                // Append the feature item to the content area
                featuresContent.appendChild(featureItem);
            }

            document.getElementById('page-info').textContent = `Page ${page} of ${data.total_pages}`;
            currentPage = page;

            document.getElementById('prev-page').disabled = page <= 1;
            document.getElementById('next-page').disabled = page >= data.total_pages;
        });
    }

    const popup = document.createElement('div');
    popup.id = 'pie-chart-popup';
    popup.innerHTML = `
        <div id="features-popup" class="popup-overlay">
            <div class="popup-content3">
                <button id="close-features-popup" onClick = endit() class="close">&times;</button>
                <input type="text" id="search-feature" placeholder="Search for a feature">
                <button id="search-button" class = "button">Search</button>
                <div id="features-content" class = "grid-container">
                    <!-- Dynamic content will be loaded here -->
                </div>
                <div id="pagination">
                    <button id="prev-page">Previous</button>
                    <span id="page-info"></span>
                    <button id="next-page">Next</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(popup);

    // function searchy() {
    //     console.log("Yo");
    //     col_names = ['Sequence_Length', 'Molecular_Weight', 'GRAVY', 'Isoelectric_Point', 'Instability_Index', 'Aromaticity', 'Charge_at_7', 'is_druggable', 'is_approved_druggable', 'Amino_Acid_Percent_A', 'Amino_Acid_Percent_C', 'Amino_Acid_Percent_D', 'Amino_Acid_Percent_E', 'Amino_Acid_Percent_F', 'Amino_Acid_Percent_G', 'Amino_Acid_Percent_H', 'Amino_Acid_Percent_I', 'Amino_Acid_Percent_K', 'Amino_Acid_Percent_L', 'Amino_Acid_Percent_M', 'Amino_Acid_Percent_N', 'Amino_Acid_Percent_P', 'Amino_Acid_Percent_Q', 
    //         'Amino_Acid_Percent_R', 'Amino_Acid_Percent_S', 'Amino_Acid_Percent_T', 'Amino_Acid_Percent_V', 'Amino_Acid_Percent_W', 'Amino_Acid_Percent_Y', 'Molar_Extinction_Coefficient_1', 'Molar_Extinction_Coefficient_2', 'Secondary_Structure_helix', 'Secondary_Structure_turn', 'Secondary_Structure_sheet', 'aliphatic_aliphatic', 'aliphatic_positive', 'aliphatic_negative', 'aliphatic_uncharged', 'aliphatic_aromatic', 'positive_aliphatic', 'positive_positive', 'positive_negative', 'positive_uncharged', 'positive_aromatic', 'negative_aliphatic', 'negative_positive', 'negative_negative', 
    //         'negative_uncharged', 'negative_aromatic', 'uncharged_aliphatic', 'uncharged_positive', 'uncharged_negative', 'uncharged_uncharged', 'uncharged_aromatic', 'aromatic_aliphatic', 'aromatic_positive', 'aromatic_negative', 'aromatic_uncharged', 'aromatic_aromatic', 'Glycosylation', 'Cross_link', 'Modified_residue', 'Signal', 'Disulfide_bond', 'O_linked', 'N_linked', 'C_linked', 'N_beta_linked', 'S_linked', 'O_alpha_linked', 'binary_count', 'binary_experimental_count', 'xeno_count', 'xeno_experimental_count', 'degree_binary', 'degree_xeno', 'degree_all', 'avg_degree_nbr_binary', 
    //         'avg_degree_nbr_xeno', 'avg_degree_nbr_all', 'strongly_connected_component_sizes_all', 'cytoplasmic_vesicle', 'nucleus', 'melanosome', 'lateral_cell_membrane', 'secreted', 'vacuole', 'vesicle', 'synapse', 'presynapse', 'cleavage_furrow', 'endomembrane_system', 'late_endosome', 'recycling_endosome', 'midbody', 'cytoplasmic_granule', 'endosome', 'early_endosome', 'perikaryon', 'membrane', 'peroxisome', 'cell_membrane', 'cell_junction', 'postsynapse', 'cytoplasm', 'lipid_droplet', 'rough_endoplasmic_reticulum', 'zymogen_granule', 'smooth_endoplasmic_reticulum_membrane', 'inflammasome', 'target_cell_membrane', 'preautophagosomal_structure', 'cornified_envelope', 'mitochondrion', 'microsome', 'sarcoplasmic_reticulum', 'vacuole_membrane', 'cell_surface', 'dynein_axonemal_particle', 'golgo_apparatus', 'parasitophorous_vacuole', 'extracellular_vessicle', 'cell_projection', 'photoreceptor', 'virion', 'cytolitic_granule', 'golgi_outpost', 'myelin_membrane', 'endoplasmic_reticulum', 'chromosome', 'lysosome', 'rrm', 'acidic_residues', 'ph', 'krab', 'pdz', 'btb', 'nuclear_localization_signal', 'fibronectin_type_iii', 'disordered', 'ig_like_v_type', 'ef_hand', 'sh3', 'ig_like', 'pro_residues', 'protein_kinase', 'ig_like_c2_type', 'basic_and_acidic_residues', 'basic_residues', 'egf_like', 'polar_residues', 'Mean', 'Mode', 'Min', 'Max', 'Variance', 'Median', 'Standard_Deviation', 'Range', 'Min_gap', 'Max_gap', 'Average_gap', 'Min_2_hop_gap', 'Max_2_hop_gap', 'Average_2_hop_gap', 'Latent_Value_1', 'Latent_Value_2', 'Latent_Value_3', 'Latent_Value_4', 'Latent_Value_5', 'Latent_Value_6', 'Latent_Value_7', 'Latent_Value_8', 'Latent_Value_9', 'Latent_Value_10', 'Latent_Value_11', 'Latent_Value_12', 'Latent_Value_13', 'Latent_Value_14', 'Latent_Value_15', 'Latent_Value_16', 'Latent_Value_17', 'Latent_Value_18', 'Latent_Value_19', 'Latent_Value_20'];
    //     searchFeature = document.getElementById('search-feature').value.toUpperCase().replace(/\s+/g, '_');
    //     const featureIndex = col_names.findIndex(name => name.toUpperCase() === searchFeature);
    //     if (featureIndex !== -1) {
    //         const targetPage = Math.floor((featureIndex - 1) / 9) + 1;
    //         loadFeatures(targetPage);
    //     } else {
    //         alert("Feature not found!");
    //     }
    // };
    col_names = ['Sequence_Length', 'Molecular_Weight', 'GRAVY', 'Isoelectric_Point', 'Instability_Index', 'Aromaticity', 'Charge_at_7', 'is_druggable', 'is_approved_druggable', 'Amino_Acid_Percent_A', 'Amino_Acid_Percent_C', 'Amino_Acid_Percent_D', 'Amino_Acid_Percent_E', 'Amino_Acid_Percent_F', 'Amino_Acid_Percent_G', 'Amino_Acid_Percent_H', 'Amino_Acid_Percent_I', 'Amino_Acid_Percent_K', 'Amino_Acid_Percent_L', 'Amino_Acid_Percent_M', 'Amino_Acid_Percent_N', 'Amino_Acid_Percent_P', 'Amino_Acid_Percent_Q', 
                 'Amino_Acid_Percent_R', 'Amino_Acid_Percent_S', 'Amino_Acid_Percent_T', 'Amino_Acid_Percent_V', 'Amino_Acid_Percent_W', 'Amino_Acid_Percent_Y', 'Molar_Extinction_Coefficient_1', 'Molar_Extinction_Coefficient_2', 'Secondary_Structure_helix', 'Secondary_Structure_turn', 'Secondary_Structure_sheet', 'aliphatic_aliphatic', 'aliphatic_positive', 'aliphatic_negative', 'aliphatic_uncharged', 'aliphatic_aromatic', 'positive_aliphatic', 'positive_positive', 'positive_negative', 'positive_uncharged', 'positive_aromatic', 'negative_aliphatic', 'negative_positive', 'negative_negative', 
                 'negative_uncharged', 'negative_aromatic', 'uncharged_aliphatic', 'uncharged_positive', 'uncharged_negative', 'uncharged_uncharged', 'uncharged_aromatic', 'aromatic_aliphatic', 'aromatic_positive', 'aromatic_negative', 'aromatic_uncharged', 'aromatic_aromatic', 'Glycosylation', 'Cross_link', 'Modified_residue', 'Signal', 'Disulfide_bond', 'O_linked', 'N_linked', 'C_linked', 'N_beta_linked', 'S_linked', 'O_alpha_linked', 'binary_count', 'binary_experimental_count', 'xeno_count', 'xeno_experimental_count', 'degree_binary', 'degree_xeno', 'degree_all', 'avg_degree_nbr_binary', 
                'avg_degree_nbr_xeno', 'avg_degree_nbr_all', 'strongly_connected_component_sizes_all', 'cytoplasmic_vesicle', 'nucleus', 'melanosome', 'lateral_cell_membrane', 'secreted', 'vacuole', 'vesicle', 'synapse', 'presynapse', 'cleavage_furrow', 'endomembrane_system', 'late_endosome', 'recycling_endosome', 'midbody', 'cytoplasmic_granule', 'endosome', 'early_endosome', 'perikaryon', 'membrane', 'peroxisome', 'cell_membrane', 'cell_junction', 'postsynapse', 'cytoplasm', 'lipid_droplet', 'rough_endoplasmic_reticulum', 'zymogen_granule', 'smooth_endoplasmic_reticulum_membrane', 'inflammasome', 'target_cell_membrane', 'preautophagosomal_structure', 'cornified_envelope', 'mitochondrion', 'microsome', 'sarcoplasmic_reticulum', 'vacuole_membrane', 'cell_surface', 'dynein_axonemal_particle', 'golgo_apparatus', 'parasitophorous_vacuole', 'extracellular_vessicle', 'cell_projection', 'photoreceptor', 'virion', 'cytolitic_granule', 'golgi_outpost', 'myelin_membrane', 'endoplasmic_reticulum', 'chromosome', 'lysosome', 'rrm', 'acidic_residues', 'ph', 'krab', 'pdz', 'btb', 'nuclear_localization_signal', 'fibronectin_type_iii', 'disordered', 'ig_like_v_type', 'ef_hand', 'sh3', 'ig_like', 'pro_residues', 'protein_kinase', 'ig_like_c2_type', 'basic_and_acidic_residues', 'basic_residues', 'egf_like', 'polar_residues', 'Mean', 'Mode', 'Min', 'Max', 'Variance', 'Median', 'Standard_Deviation', 'Range', 'Min_gap', 'Max_gap', 'Average_gap', 'Min_2_hop_gap', 'Max_2_hop_gap', 'Average_2_hop_gap', 'Latent_Value_1', 'Latent_Value_2', 'Latent_Value_3', 'Latent_Value_4', 'Latent_Value_5', 'Latent_Value_6', 'Latent_Value_7', 'Latent_Value_8', 'Latent_Value_9', 'Latent_Value_10', 'Latent_Value_11', 'Latent_Value_12', 'Latent_Value_13', 'Latent_Value_14', 'Latent_Value_15', 'Latent_Value_16', 'Latent_Value_17', 'Latent_Value_18', 'Latent_Value_19', 'Latent_Value_20'];
    
    document.body.addEventListener('click', function(e) {
        console.log("Yo");
        if (e.target && e.target.id === 'search-button') {
            searchFeature = document.getElementById('search-feature').value.toUpperCase().replace(/\s+/g, '_');
            const featureIndex = col_names.findIndex(name => name.toUpperCase() === searchFeature);
            if (featureIndex !== -1) {
                const targetPage = Math.floor((featureIndex) / 9) + 1;
                loadFeatures(targetPage);
            } else {
                console.log("Nahi mila");
                alert("Feature not found!");
            }
        }
    });


    // Load the first page
    loadFeatures(currentPage);

    // Show the pop-up
    document.getElementById('features-popup').classList.add('active');

    // Handle pagination
    document.getElementById('prev-page').addEventListener('click', function() {
        if (currentPage > 1) {
            loadFeatures(currentPage - 1);
        }
    });

    document.getElementById('next-page').addEventListener('click', function() {
        if (currentPage < 19) {
            loadFeatures(currentPage + 1);
        }
    });
};




function endit(){
    const popup = document.getElementById('pie-chart-popup');
    if (popup) {
        document.body.removeChild(popup);
    }
    
};

