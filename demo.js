// Include the Paho MQTT client library for real-time data retrieval.
const brokerUrl = "ws://103.97.166.114:9001"; // Replace with your MQTT broker's WebSocket URL.
const topic = "esp32/temperature"; // Replace with the topic for your temperature and humidity data.

// Initialize MQTT client
const client = new Paho.MQTT.Client(brokerUrl, "SmartCityMonitor");

client.onConnectionLost = function (responseObject) {
    console.error("Connection lost:", responseObject.errorMessage);
};

client.onMessageArrived = function (message) {
    console.log("Message arrived:", message.payloadString);

    try {
        const data = JSON.parse(message.payloadString); // Assuming data comes as JSON
        const temperature = data.temperature; // Extract temperature from message
        const humidity = data.humidity; // Extract humidity from message

        // Update values on the UI
        document.getElementById("temperature").innerText = `${temperature.toFixed(1)}°C`;
        document.getElementById("humidity").innerText = `${humidity.toFixed(1)}%`;

        // Update chart
        addDataToChart(temperature, humidity);
    } catch (error) {
        console.error("Error processing MQTT message:", error);
    }
};

client.connect({
    onSuccess: function () {
        console.log("Connected to MQTT broker");
        client.subscribe(topic);
    },
    onFailure: function (error) {
        console.error("Connection failed:", error);
    },
});

// Chart.js configuration
const ctx = document.getElementById("temperatureChart").getContext("2d");
const temperatureChart = new Chart(ctx, {
    type: "line",
    data: {
        labels: [],
        datasets: [
            {
                label: "Temperature (°C)",
                data: [],
                borderColor: "rgba(255, 99, 132, 1)",
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                fill: true,
            },
            {
                label: "Humidity (%)",
                data: [],
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
                    text: "Timestamp",
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

// Function to add data to the chart dynamically
function addDataToChart(temperature, humidity) {
    const now = new Date();
    const timeString = now.toLocaleTimeString();

    // Add new data points
    temperatureChart.data.labels.push(timeString);
    temperatureChart.data.datasets[0].data.push(temperature);
    temperatureChart.data.datasets[1].data.push(humidity);

    // Limit the number of points displayed
    if (temperatureChart.data.labels.length > 20) {
        temperatureChart.data.labels.shift();
        temperatureChart.data.datasets[0].data.shift();
        temperatureChart.data.datasets[1].data.shift();
    }

    temperatureChart.update();
}
