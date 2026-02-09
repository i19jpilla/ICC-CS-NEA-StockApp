function updateStockInfo(data) {
    document.getElementById('name').innerText = `Name: ${data.name}`;
    document.getElementById('ticker').innerText = `Ticker: ${data.symbol}`;
    document.getElementById('buyPrice').innerText = `Buy Price: $${data.buy_price.toFixed(2)}`;
    document.getElementById('sellPrice').innerText = `Sell Price: $${data.sell_price.toFixed(2)}`;
}

function updateGraph(data) {
    const ctx = document.getElementById('priceChart').getContext('2d');
    if (priceChart) {
        priceChart.destroy();
    }
    
    const prices = data.history ? Object.values(data.history) : [];
    const dates = data.history ? Object.keys(data.history) : [];

    console.log(prices, dates, data.history);
    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Price History',
                data: prices,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false
            }]
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

const btn = document.getElementById('getStock')

let priceChart = null;
let currentTicker = null;
btn.addEventListener('click', async () => {
    const ticker = document.getElementById('tickerInput').value;
    const response = await fetch(`/api/sandbox?symbol=${ticker}&token=${localStorage.getItem('token')}`);
    
    if (!response.ok) {
        alert('Failed to fetch stock data.');
        return;
    }

    const json = await response.json();
    const data = json.data;

    currentTicker = data.symbol;
    updateStockInfo(data);
    updateGraph(data);
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
        document.getElementById('balance').innerText = `Balance: $${data.new_balance.toFixed(2)}`;
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

    const response = await fetch('/api/stocks/buy', {
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
        document.getElementById('balance').innerText = `Balance: $${data.new_balance.toFixed(2)}`;
        document.getElementById('totalQuantity').innerText = `Total Quantity: ${quantity}`;
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

    const response = await fetch('/api/stocks/sell', {
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
        document.getElementById('balance').innerText = `Balance: $${data.new_balance.toFixed(2)}`;
        document.getElementById('totalQuantity').innerText = `Total Quantity: ${quantity}`;
    } else {
        alert(`Failed to sell stock: ${data.detail}`);
    }
});

const refreshButton = document.getElementById('refresh');
refreshButton.addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You must be logged in to refresh your portfolio.');
        window.location.href = '/login';
        return;
    }

    if (!currentTicker) {
        alert('Please fetch a stock first.');
        return;
    }

    const response = await fetch(`/api/sandbox/refresh?symbol=${currentTicker}&token=${token}`);
    const ticker = document.getElementById('tickerInput').value;
    
    if (!response.ok) {
        alert('Failed to fetch stock data.');
        return;
    }
    
    const json = await response.json();
    const data = json.data;
    currentTicker = data.symbol;
    updateStockInfo(data);
    updateGraph(data);
});

