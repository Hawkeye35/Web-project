// SET DEFAULT DATES (start of month → today)
const today = new Date();
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

// format to YYYY-MM-DD
const formatDate = (date) => date.toISOString().split("T")[0];

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("startDate").value = formatDate(firstDay);
    document.getElementById("endDate").value = formatDate(today);
});

var map = L.map('map').setView([39.5, -98.35], 4);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const stateNames = {
    "Alabama": "AL",
    "Alaska": "AK",
    "Arizona": "AZ",
    "Arkansas": "AR",
    "California": "CA",
    "Colorado": "CO",
    "Connecticut": "CT",
    "Delaware": "DE",
    "Florida": "FL",
    "Georgia": "GA",
    "Hawaii": "HI",
    "Idaho": "ID",
    "Illinois": "IL",
    "Indiana": "IN",
    "Iowa": "IA",
    "Kansas": "KS",
    "Kentucky": "KY",
    "Louisiana": "LA",
    "Maine": "ME",
    "Maryland": "MD",
    "Massachusetts": "MA",
    "Michigan": "MI",
    "Minnesota": "MN",
    "Mississippi": "MS",
    "Missouri": "MO",
    "Montana": "MT",
    "Nebraska": "NE",
    "Nevada": "NV",
    "New Hampshire": "NH",
    "New Jersey": "NJ",
    "New Mexico": "NM",
    "New York": "NY",
    "North Carolina": "NC",
    "North Dakota": "ND",
    "Ohio": "OH",
    "Oklahoma": "OK",
    "Oregon": "OR",
    "Pennsylvania": "PA",
    "Rhode Island": "RI",
    "South Carolina": "SC",
    "South Dakota": "SD",
    "Tennessee": "TN",
    "Texas": "TX",
    "Utah": "UT",
    "Vermont": "VT",
    "Virginia": "VA",
    "Washington": "WA",
    "West Virginia": "WV",
    "Wisconsin": "WI",
    "Wyoming": "WY"
};

function getColor(value) {
    return value > 50 ? '#800026' :
           value > 30 ? '#BD0026' :
           value > 20 ? '#E31A1C' :
           value > 10 ? '#FC4E2A' :
           value > 5  ? '#FD8D3C' :
           value > 0  ? '#FEB24C' :
                        '#FFFFFF';
}

Promise.all([
    fetch("/state-totals").then(res => res.json()),
    fetch("https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json").then(res => res.json())
])
.then(([visitorData, statesData]) => {
    L.geoJson(statesData, {
        style: function(feature) {
            const stateName = feature.properties.name;
            const stateCode = stateNames[stateName];
            const value = visitorData[stateCode] || 0;

            return {
                fillColor: getColor(value),
                weight: 1,
                color: "black",
                fillOpacity: 0.7
            };
        },

        onEachFeature: function(feature, layer) {
            const stateName = feature.properties.name;
            const stateCode = stateNames[stateName];
            const value = visitorData[stateCode] || 0;

            layer.bindPopup(stateName + ": " + value + " visitors");
        }
    }).addTo(map);
});