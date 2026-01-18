const btn = document.getElementById('getStock')

let priceChart = null;
btn.addEventListener('click', async () => {
    const ticker = document.getElementById('tickerInput').value;
    const response = await fetch(`/api/stocks?symbol=${ticker}`);
    
    const data = await response.json();
    console.log(data.history);
    document.getElementById('name').innerText = `Name: ${data.name}`;
    document.getElementById('ticker').innerText = `Ticker: ${data.symbol}`;
    document.getElementById('buyPrice').innerText = `Buy Price: $${data.buy_price.toFixed(2)}`;
    document.getElementById('sellPrice').innerText = `Sell Price: $${data.sell_price.toFixed(2)}`;


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
})