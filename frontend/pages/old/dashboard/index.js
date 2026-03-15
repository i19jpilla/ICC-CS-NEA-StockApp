const btn = document.getElementById('getStock')

let priceChart = null;
let currentTicker = null;
btn.addEventListener('click', async () => {
    const ticker = document.getElementById('tickerInput').value;
    const response = await fetch(`/api/stocks?symbol=${ticker}`);
    
    const data = await response.json();
    console.log(data.history);
    document.getElementById('name').innerText = `Name: ${data.name}`;
    document.getElementById('ticker').innerText = `Ticker: ${data.symbol}`;
    document.getElementById('buyPrice').innerText = `Buy Price: $${data.buy_price.toFixed(2)}`;
    document.getElementById('sellPrice').innerText = `Sell Price: $${data.sell_price.toFixed(2)}`;
    currentTicker = data.symbol;

    const ctx = document.getElementById('priceChart').getContext('2d');
    if (priceChart) {
        priceChart.destroy();
    }

    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.dates,
            datasets: [{
                label: 'Price History',
                data: data.prices,
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
            amount: 10000
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

    const quantityInput = document.getElementById("quantityInput")
    let quantity = quantityInput.value ? parseInt(quantityInput.value) : 1

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

const sandboxButton = document.getElementById('sandbox');
sandboxButton.addEventListener('click', async () => {
    window.location.href = '/sandbox';
});

const portfolioButton = document.getElementById('portfolioBtn');
portfolioButton.addEventListener('click', async () => {
    window.location.href = '/portfolio';
});