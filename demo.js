<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smart City Monitoring System</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="header">
        <h1>SMART CITY MONITORING SYSTEM</h1>
    </div>
    
    <div class="info-container">
        <div class="info-box">
            <h2 id="temperature">--°</h2>
            <p>🌡️ Temperature</p>
        </div>
        <div class="info-box">
            <h2 id="humidity">--%</h2>
            <p>💧 Humidity</p>
        </div>
    </div>
    
    <div class="chart-container">
        <canvas id="temperatureChart"></canvas>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/mqtt/dist/mqtt.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
        // Connect to WebSocket MQTT broker
        const client = mqtt.connect('ws://103.97.166.114:9001');  // Use your WebSocket broker IP

        // Create Chart.js instance
        const ctx = document.getElementById('temperatureChart').getContext('2d');
        const temperatureData = {
            labels: [],
            datasets: [{
                label: 'Temperature (°C)',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                fill: false,
            }]
        };

        const temperatureChart = new Chart(ctx, {
            type: 'line',
            data: temperatureData,
            options: {
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                    },
                },
            }
        });

        // Subscribe to MQTT topics for temperature and humidity
        client.on('connect', function () {
            console.log("Connected to WebSocket MQTT Broker");
            client.subscribe('smart_city/temperature');
            client.subscribe('smart_city/humidity');
        });

        // Handle incoming MQTT messages
        client.on('message', function (topic, message) {
            if (topic === 'smart_city/temperature') {
                const temperature = message.toString();
                document.getElementById('temperature').textContent = `${temperature}°`;
                
                // Update chart data
                const currentTime = Date.now();
                temperatureData.labels.push(currentTime);
                temperatureData.datasets[0].data.push(temperature);
                temperatureChart.update();
            }

            if (topic === 'smart_city/humidity') {
                const humidity = message.toString();
                document.getElementById('humidity').textContent = `${humidity}%`;
            }
        });

        // Handle WebSocket connection errors
        client.on('error', function (err) {
            console.error("Error connecting to MQTT broker:", err);
        });
    </script>
</body>
</html>
