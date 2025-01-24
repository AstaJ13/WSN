// Replace 'BROKER_IP' with your MQTT broker's IP address
const brokerIP = "BROKER_IP"; 
const client = new Paho.MQTT.Client(brokerIP, 1883, "clientID");

// Real-time data
let temperature = [];
let humidity = [];
let labels = [];

// Chart.js configuration
const ctx = document.getElementById("sensorGraph").getContext("2d");
const chart = new Chart(ctx, {
    type: "line",
    data: {
        labels: labels,
        datasets: [
            {
                label: "Temperature (°C)",
                data: temperature,
                borderColor: "rgba(255, 99, 132, 1)",
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                borderWidth: 1,
            },
            {
                label: "Humidity (%)",
                data: humidity,
                borderColor: "rgba(54, 162, 235, 1)",
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                borderWidth: 1,
            },
        ],
    },
    options: {
        responsive: true,
        scales: {
            x: { title: { display: true, text: "Time" } },
            y: { title: { display: true, text: "Value" } },
        },
    },
});

// MQTT: Log connection status
client.onConnectionLost = function (response) {
    console.error("Connection lost:", response.errorMessage);
};

// MQTT: Handle incoming messages
client.onMessageArrived = function (message) {
    console.log("Message received:", message.payloadString);

    // Parse incoming JSON data
    const data = JSON.parse(message.payloadString);
    const temp = data.temperature;
    const hum = data.humidity;

    // Update the real-time display
    document.getElementById("temperature").innerText = temp;
    document.getElementById("humidity").innerText = hum;

    // Update the image based on temperature
    const img = document.getElementById("sensor-image");
    if (temp > 30) {
        img.src = "hot.png"; // Replace with an image for high temperature
        img.alt = "Hot Condition";
    } else if (temp < 15) {
        img.src = "cold.png"; // Replace with an image for low temperature
        img.alt = "Cold Condition";
    } else {
        img.src = "normal.png"; // Replace with an image for normal condition
        img.alt = "Normal Condition";
    }

    // Update graph data
    const timestamp = new Date().toLocaleTimeString();
    labels.push(timestamp);
    temperature.push(temp);
    humidity.push(hum);

    // Maintain the graph's length
    if (labels.length > 20) {
        labels.shift();
        temperature.shift();
        humidity.shift();
    }

    chart.update();
};

// MQTT: Connect to broker
client.connect({
    onSuccess: function () {
        console.log("Connected to broker");
        // Subscribe to the topic
        client.subscribe("sensor/temperature_humidity");
    },
    onFailure: function (error) {
        console.error("Connection failed:", error);
    },
});
