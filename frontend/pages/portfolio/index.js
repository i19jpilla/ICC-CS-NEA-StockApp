const dashboardBtn = document.getElementById("dashboardBtn")
dashboardBtn.addEventListener("click", (ev) => {
    window.location.href = "/dashboard"
})

const canvas = document.getElementById("pieChart")

let pieChart = null
let pieChartData = {}
let pricesData = {}
let colors = {}

let currPriceShareData = {}
function updatePieChart() {
    console.log(pieChartData, pricesData)
    let totalPrice = 0
    let hasChanged = false
    for (const [ticker, holdings] of Object.entries(pieChartData)) {
        const tickerPrice = pricesData[ticker] * (isNaN(holdings) ? 0 : holdings)
        totalPrice += tickerPrice
        if (currPriceShareData[ticker] !== tickerPrice) {
            hasChanged = true
            currPriceShareData[ticker] = tickerPrice
        }
    }

    // prevents re-rendering of chart
    console.log(hasChanged)
    if (!hasChanged) return
    if (pieChart) pieChart.destroy()

    function getRandomColor() {
        return `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`
    }

    pieChart = new Chart(canvas, {
        type: "doughnut",
        data: {
            labels: Object.keys(currPriceShareData),
            datasets: [{
                data: Object.values(currPriceShareData),
                backgroundColor: Object.keys(currPriceShareData).map(x => {
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
        handlePayload(payload.data)
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