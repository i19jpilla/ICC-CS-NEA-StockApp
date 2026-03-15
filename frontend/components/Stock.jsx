const StockInfo = ({ data }) => data ? (
  <div id="stockInfo" style={{
    lineHeight: "1.2px"
  }}>
    <p id="name">Name: {data.name || "???"}</p>
    <p id="ticker">Ticker: {data.symbol || "???"}</p>
    <p id="buyPrice">Buy Price: ${data.buy_price?.toFixed(2) || 0}</p>
    <p id="sellPrice">Sell Price: ${data.sell_price?.toFixed(2) || 0}</p>  
  </div>
) : null

const HoldingsInfo = ({ data }) => data ? (
  <div id="holdingsInfo" style={{
    lineHeight: "1.2px"
  }}>
    <p id="balance">Balance: ${data.balance?.toFixed(2) || 0}</p>
    <p id="totalQuantity">Total Quantity: {data.total_stock || 0}</p>  
  </div>
) : null

/*
    Assumes stockData = {[symbol]: StockData}, e.g: a map of tickers to data.
    This means to render a single stock, it must first be put into this form.
    Take a stock data object, and map the stockData.symbol to the stockData itself:

    const stockData = fetch(...)
    let map = {}
    map[stockData.symbol] = stockData
    => StockChart(map)
 */ 
const StockChart = ({ stockData }) => {
    const canvasRef = React.useRef(null)
    const chartRef = React.useRef(null)

    const stockColors = React.useRef({})

    console.log(stockData)
    if (!stockData) return null
    // Handles rendering of stock chart when a. DOM content loads and b. when the stockData parameter updates.
    React.useEffect(() => {
        if (!stockData || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext("2d")

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        let dates = [];
        let allPrices = {};
        for (const ticker in stockData) {
            const tickerData = stockData[ticker];
            if (dates.length === 0) {
                dates = tickerData.history ? Object.keys(tickerData.history) : [];
            }
            
            const prices = tickerData.history ? Object.values(tickerData.history) : [];
            allPrices[ticker] = prices;

            if (!stockColors.current[ticker]) {
                stockColors.current[ticker] = `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;
            }
        }

        console.log(allPrices, dates, stockData.history);
        chartRef.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: Object.keys(allPrices).map(ticker => ({
                    label: ticker,
                    data: allPrices[ticker],
                    borderColor: stockColors.current[ticker] || `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
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

        return () => {
            chartRef.current?.destroy();
        };
    }, [stockData]);

    return (
        <div className="stockChart">
            <canvas ref={canvasRef} className="stockGraph" style={{
                width: "80vw"
            }}></canvas>
        </div>
    )
}

const PriceButton = ({ price, action, onClick }) => (
    <button onClick={onClick}>
        {action}: {price ? `$${price.toFixed(2)}` : "???"}
    </button>
)

const AddCashButton = ({ setHoldingsInfo, setStatus }) => {
  const addCash = async (e) => {
    console.log("submit")
    e.preventDefault()

    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to add cash.');
      setCurrentPage("login")
      return;
    }

    console.log("submit")
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

    const sendStatusMessage = (msg, type) => {
      if (setStatus) {
        setStatus({ type: "success", message: msg })
      } else {
        alert(message);
      }
    }

    const data = await response.json();
    if (response.ok) {
      console.log(data, data.balance)
      setHoldingsInfo(prev => ({...prev, balance: data.balance}))
      sendStatusMessage(
        `Successfully added cash. New balance: $${data.balance.toFixed(2)}`,
        "success"
      )
    } else {
      sendStatusMessage(
        `Failed to add cash: ${data.detail}`,
        "error"
      )
    }
  }

  return <button id="addCash" onClick={addCash}>Add Cash</button>
}

function StatusMessage({ status }) {
  const [visible, setVisible] = React.useState(false)

  // automatically disappears after 3 seconds
  React.useEffect(() => {
    if (!status) return
    setVisible(true)

    const timer = setTimeout(() => setVisible(false), 3000)
    return () => clearTimeout(timer)
  }, [status])

  if (!visible) return null

  const colors = { success: 'green', error: 'red', status: 'gray' }

  return (
    <div style={{ color: colors[status.type] }}>
      {status.message}
    </div>
  )
}