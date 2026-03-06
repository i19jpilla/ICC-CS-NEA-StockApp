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

const StockInfo = ({ data }) => (
  <div id="stockInfo">
    <p id="name">Name: {data?.name || "???"}</p>
    <p id="ticker">Ticker: {data?.symbol || "???"}</p>
    <p id="buyPrice">Buy Price: ${data?.buy_price.toFixed(2) || 0}</p>
    <p id="sellPrice">Sell Price: ${data?.sell_price.toFixed(2) || 0}</p>  
  </div>
)

const HoldingsInfo = ({ data, quantity }) => (
  <div id="stockInfo">
    <p id="balance">Balance: ${data?.new_balance.toFixed(2) || 0}</p>
    <p id="totalQuantity">Total Quantity: {data?.quantity || 0}</p>  
  </div>
)

const StockChart = ({ stockData }) => {
    const canvasRef = React.useRef(null)
    const chartRef = React.useRef(null)

    // Handles rendering of stock chart when a. DOM content loads and b. when the stockData parameter updates.
    React.useEffect(() => {
        if (!stockData || !canvasRef.current) return;

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        let dates = [];
        const allPrices = {};

        for (const ticker in data) {
            const tickerData = data[ticker];
            if (dates.length === 0) {
                dates = tickerData.history ? Object.keys(tickerData.history) : [];
            }
            allPrices[ticker] = tickerData.history ? Object.values(tickerData.history) : [];
        }

        const ctx = canvasRef.current.getContext("2d");
        chartRef.current = new Chart(ctx, {
            type: "line",
            data: {
                labels: dates,
                datasets: Object.keys(allPrices).map((ticker) => ({
                label: ticker,
                data: allPrices[ticker],
                borderColor: getStockColor(ticker),
                borderWidth: 2,
                fill: false,
                })),
            },
            options: {
                scales: {
                x: { title: { display: true, text: "Time" } },
                y: { title: { display: true, text: "Price ($)" } },
                },
            },
        });

        return () => {
            chartRef.current?.destroy();
        };
    }, [stockData]);

    return (
        <div className="stockChart">
            <canvas className="stockGraph"></canvas>
        </div>
    )
}

const PriceButton = ({ price, action, onClick }) => (
    <button onClick={onClick}>
        {action}: ${price}
    </button>
)