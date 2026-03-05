let socket;

let priceChart = null;
let currentTicker = null;

function updateStockInfo(data) {
    document.getElementById('name').innerText = `Name: ${data.name}`;
    document.getElementById('ticker').innerText = `Ticker: ${data.symbol}`;
    document.getElementById('buyPrice').innerText = `Buy Price: $${data.buy_price.toFixed(2)}`;
    document.getElementById('sellPrice').innerText = `Sell Price: $${data.sell_price.toFixed(2)}`;
}

function updateStats(data) {
    const balance = data.new_balance !== undefined ? data.new_balance : 0;
    const totalQuantity = data.total_quantity !== undefined ? data.total_quantity : 0;

    document.getElementById('balance').innerText = `Balance: $${balance.toFixed(2)}`;
    document.getElementById('totalQuantity').innerText = `Total Quantity: ${totalQuantity}`;
}

let stockColors = {};
function updateGraph(data) {
    const ctx = document.getElementById('priceChart').getContext('2d');
    if (priceChart) {
        priceChart.destroy();
    }
    
    console.log("Update graph data", data, Object.keys(data));
    
    let dates = [];
    let prices = [];
    let allPrices = {};
    for (const ticker in data) {
        const tickerData = data[ticker];
        if (dates.length === 0) {
            dates = tickerData.history ? Object.keys(tickerData.history) : [];
        }
        
        const prices = tickerData.history ? Object.values(tickerData.history) : [];
        allPrices[ticker] = prices;

        if (!stockColors[ticker]) {
            stockColors[ticker] = `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;
        }
    }

    console.log(prices, dates, data.history);
    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: Object.keys(allPrices).map(ticker => ({
                label: ticker,
                data: allPrices[ticker],
                borderColor: stockColors[ticker] || `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
                borderWidth: 2,
                fill: false
            })),
        },
        options: {
            scales: {
                x: {
                    title: { display: true, text: 'Time' }
                },
                y: {
                    title: { display: true, text: 'Price ($)' }
                }
            }
        }
    });
}

async function connectWebSocket() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You must be logged in to connect to the WebSocket.');
        window.location.href = '/login';
        return;
    }

    socket = new WebSocket(`ws://localhost:8000/ws/sandbox?token=${token}`);
    socket.onopen = () => {
        console.log('WebSocket connection established');
    };

    socket.onmessage = (event) => {
        const payload = JSON.parse(event.data);
        console.log(payload.data, Object.keys(payload.data));
        const data = payload.data;
        switch (data.type) {
            case 'market_update':
                updateGraph(data.data);
                break;
            case 'transaction_update':
                updateStats(data.data);
                break;
            case 'ticker_update':
                currentTicker = data.data.symbol;
                updateStockInfo(data.data);
                break;
            default:
                console.warn('Unknown message type:', data.type);
        }
        console.log('Received WebSocket message:', payload);
    };

    socket.onclose = () => {
        console.log('WebSocket connection closed');
    };

    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
}

document.addEventListener('DOMContentLoaded', async () => {
    await connectWebSocket();
});

window.addEventListener('beforeunload', () => {
    if (socket) {
        socket.close();
    }
});

async function trackStock(ticker) {
    socket.send(JSON.stringify({
        type: 'track',
        symbol: ticker
    }));
}

function untrackStock(ticker) {
    socket.send(JSON.stringify({
        type: 'untrack',
        symbol: ticker
    }));
}

function trackAllStocks() {
    socket.send(JSON.stringify({
        type: 'all'
    }));
}

const btn = document.getElementById('getStock')
btn.addEventListener('click', async () => {
    const ticker = document.getElementById('tickerInput').value;
    if (!ticker) {
        alert('Please enter a stock ticker.');
        return;
    }

    trackStock(ticker);
});

const untrackBtn = document.getElementById('untrackStock');
untrackBtn.addEventListener('click', async () => {
    const ticker = document.getElementById('tickerInput').value;
    if (ticker) {
        untrackStock(ticker);
    }
});

const showAllBtn = document.getElementById('showAll');
showAllBtn.addEventListener('click', async () => {
    trackAllStocks();
});

const addCashButton = document.getElementById('addCash');
addCashButton.addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You must be logged in to add cash.');
        window.location.href = '/login';
        return;
    }

    const response = await fetch('/test/add_cash', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: token,
            amount: 100
        })
    });

    const data = await response.json();
    if (response.ok) {
        alert(`Successfully added cash. New balance: $${data.new_balance.toFixed(2)}`);
        updateStats(data);
    } else {
        alert(`Failed to add cash: ${data.detail}`);
    }
});

const buyButton = document.getElementById('buyButton');
buyButton.addEventListener('click', async () => {
    if (!currentTicker) {
        alert('Please fetch a stock first.');
        return;
    }

    const quantity = 1; // For simplicity, buying 1 share
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You must be logged in to buy stocks.');
        window.location.href = '/login';
        return;
    }

    const response = await fetch('/api/sandbox/buy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            symbol: currentTicker,
            quantity: quantity,
            token: token
        })
    });

    const data = await response.json();
    if (response.ok) {
        alert(`Successfully bought ${quantity} share(s) of ${currentTicker}`);
        updateStats(data);
    } else {
        alert(`Failed to buy stock: ${data.detail}`);
    }
});

const sellButton = document.getElementById('sellButton');
sellButton.addEventListener('click', async () => {
    if (!currentTicker) {
        alert('Please fetch a stock first.');
        return;
    }

    const quantity = 1; // For simplicity, selling 1 share
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You must be logged in to buy stocks.');
        window.location.href = '/login';
        return;
    }

    const response = await fetch('/api/sandbox/sell', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            symbol: currentTicker,
            quantity: quantity,
            token: token
        })
    });

    const data = await response.json();
    if (response.ok) {
        alert(`Successfully sold ${quantity} share(s) of ${currentTicker}`);
        updateStats(data);
    } else {
        alert(`Failed to sell stock: ${data.detail}`);
    }
});

