// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAdNLlFOlIKreOnWjbMmLR-nRmII_LagLU",
    authDomain: "wirless-sensor-network.firebaseapp.com",
    databaseURL: "https://wirless-sensor-network-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "wirless-sensor-network",
    storageBucket: "wirless-sensor-network.appspot.com",
    messagingSenderId: "186999672140",
    appId: "1:186999672140:web:94af4274408dea2672d3e9",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const sensorRef = database.ref("sensorData");

document.addEventListener("DOMContentLoaded", function () {
    const tempElement = document.getElementById("temperature");
    const humidityElement = document.getElementById("humidity");
    const airQualityElement = document.getElementById("airQuality");
    const lastUpdatedElement = document.getElementById("lastUpdated");

    // Chart.js Data Arrays
    let labels = [];
    let tempData = [];
    let humidityData = [];
    let airQualityData = [];
    const maxDataPoints = 10;

    // Initialize Charts
    const tempHumidityCtx = document.getElementById("tempHumidityChart").getContext("2d");
    const airQualityCtx = document.getElementById("airQualityChart").getContext("2d");

    const tempHumidityChart = new Chart(tempHumidityCtx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Temperature (°C)",
                    data: tempData,
                    borderColor: "red",
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: "Humidity (%)",
                    data: humidityData,
                    borderColor: "blue",
                    borderWidth: 2,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: "Time" } },
                y: { title: { display: true, text: "Value" } }
            }
        }
    });

    const airQualityChart = new Chart(airQualityCtx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Air Quality (PPM)",
                    data: airQualityData,
                    borderColor: "green",
                    borderWidth: 2,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: "Time" } },
                y: { title: { display: true, text: "PPM" } }
            }
        }
    });

    // Function to update UI and Graphs
    function updateUI(temperature, humidity, airQuality) {
        tempElement.textContent = temperature !== null ? `${temperature} °C` : "-- °C";
        humidityElement.textContent = humidity !== null ? `${humidity} %` : "-- %";
        airQualityElement.textContent = airQuality !== null ? `${airQuality} PPM` : "-- PPM";
        lastUpdatedElement.textContent = `Last Updated: ${new Date().toLocaleTimeString()}`;

        // Update Graph Data
        if (labels.length >= maxDataPoints) {
            labels.shift();
            tempData.shift();
            humidityData.shift();
            airQualityData.shift();
        }

        labels.push(new Date().toLocaleTimeString());
        tempData.push(temperature);
        humidityData.push(humidity);
        airQualityData.push(airQuality);

        tempHumidityChart.update();
        airQualityChart.update();
    }

    // Listen for data updates
    sensorRef.on("value", function (snapshot) {
        if (snapshot.exists()) {
            let data = snapshot.val();
            console.log("📡 Live Data from Firebase:", data);

            let temperature = null, humidity = null, airQuality = null;

            if (typeof data === "number") {
                temperature = data; // Assume it's a temperature reading
            } else if (typeof data === "object") {
                temperature = parseFloat(data.temperature) || null;
                humidity = parseFloat(data.humidity) || null;
                airQuality = parseFloat(data.airQuality) || null;
            } else {
                console.warn("⚠️ Invalid sensor data received. Skipping update.");
                return;
            }

            updateUI(temperature, humidity, airQuality);
        } else {
            console.warn("⚠️ No data found in Firebase.");
        }
    }, function (error) {
        console.error("🔥 Firebase read error:", error);
    });
});
