// Import necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAdNLlFOlIKreOnWjbMmLR-nRmII_LagLU", 
    authDomain: "wirless-sensor-network.firebaseapp.com",
    databaseURL: "https://wirless-sensor-network-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "wirless-sensor-network",
    storageBucket: "wirless-sensor-network.appspot.com",
    messagingSenderId: "186999672140",
    appId: "1:186999672140:web:94af4274408dea2672d3e9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Get references to UI elements
const temperatureEl = document.getElementById("temperature");
const humidityEl = document.getElementById("humidity");

// Chart.js configuration
const ctx = document.getElementById("temperatureChart").getContext("2d");
let labels = [];
let temperatureData = [];
let humidityData = [];

const temperatureChart = new Chart(ctx, {
    type: "line",
    data: {
        labels: labels,
        datasets: [
            {
                label: "Temperature (°C)",
                data: temperatureData,
                borderColor: "rgba(255, 99, 132, 1)",
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                fill: true,
            },
            {
                label: "Humidity (%)",
                data: humidityData,
                borderColor: "rgba(54, 162, 235, 1)",
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                fill: true,
            },
        ],
    },
    options: {
        responsive: true,
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Time",
                },
            },
            y: {
                title: {
                    display: true,
                    text: "Value",
                },
            },
        },
    },
});

// Function to update the chart dynamically
function updateChart(timestamp, temperature, humidity) {
    labels.push(timestamp);
    temperatureData.push(temperature);
    humidityData.push(humidity);

    // Keep only the latest 20 values
    if (labels.length > 20) {
        labels.shift();
        temperatureData.shift();
        humidityData.shift();
    }

    temperatureChart.update();
}

// Firebase Realtime Database listener for changes
const sensorRef = ref(database, "/sensorData");
onValue(sensorRef, (snapshot) => {
    if (snapshot.exists()) {
        const data = snapshot.val();
        const temperature = parseFloat(data.temperature) || 0;
        const humidity = parseFloat(data.humidity) || 0;
        const timestamp = new Date().toLocaleTimeString();

        // Update UI
        temperatureEl.innerText = `${temperature.toFixed(1)}°C`;
        humidityEl.innerText = `${humidity.toFixed(1)}%`;

        // Update the chart
        updateChart(timestamp, temperature, humidity);
    } else {
        console.warn("No data available in Firebase.");
    }
}, (error) => {
    console.error("Firebase read failed:", error);
});
