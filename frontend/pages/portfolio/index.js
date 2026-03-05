const dashboardBtn = document.getElementById("dashboardBtn")
dashboardBtn.addEventListener("click", (ev) => {
    window.location.href = "/dashboard"
})

const canvas = document.getElementById("pieChart")

let pieChart = null
let pieChartData = {}
let pricesData = {}
function updatePieChart() {
    console.log(data)
    let totalPrice = 0
    let priceShareData = {}
    for (const [ticker, holdings] of Object.entries(pieChartData)) {
        const tickerPrice = pricesData[ticker] * (isNaN(holdings) ? 0 : holdings)
        totalPrice += tickerPrice
        priceShareData[ticker] = tickerPrice
    }

    if (pieChart) { pieChart.destroy() }

    function getRandomColor() {
        const r = Math.floor(Math.random() * 256)
        const g = Math.floor(Math.random() * 256)
        const b = Math.floor(Math.random() * 256)

        return `rgb(${r},${g},${b})`
    }

    let colors = {}
    pieChart = new Chart(canvas, {
        type: "doughnut",
        data: {
            labels: Object.keys(priceShareData),
            datasets: [{
                data: Object.values(priceShareData),
                backgroundColor: Object.keys(priceShareData).map(x => {
                    let color = colors[x]
                    if (!color) {
                        color = getRandomColor()
                        colors[x] = color
                    }
                    return color
                })
            }]
        }
    })
}

let socket = null;
async function connectWebSocket() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You must be logged in to connect to the WebSocket.');
        window.location.href = '/login';
        return;
    }

    socket = new WebSocket(`ws://localhost:8000/ws/portfolio?token=${token}`);
    socket.onopen = () => {
        console.log('WebSocket connection established');
    };

    socket.onmessage = (event) => {
        const payload = JSON.parse(event.data);
        console.log(payload.data, Object.keys(payload.data));
        const data = payload.data;
        handlePayload(data)
    };

    socket.onclose = () => {
        console.log('WebSocket connection closed');
    };

    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
}

function handlePayload(payload) {
    switch (payload.type) {
        case 'portfolio_update':
            pieChartData = payload.data
            updatePieChart();
            break;
        case 'price_update':
            pricesData = payload.data
            updatePieChart()
        default:
            console.warn('Unknown message type:', payload.type);
    }
    console.log('Received WebSocket message:', payload);
}

document.addEventListener('DOMContentLoaded', async () => {
    await connectWebSocket();
});

window.addEventListener('beforeunload', () => {
    if (socket) {
        socket.close();
    }
});