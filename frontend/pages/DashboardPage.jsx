const AddCashButton = ({ setStockInfo }) => {
  const addCash = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to add cash.');
      setCurrentPage("login")
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
        setStockInfo(data)
    } else {
      alert(`Failed to add cash: ${data.detail}`);
    }
  }
  return <button id="addCash" onSubmit={addCash}>Add Cash</button>
}

function DashboardPage({ navigate }) {
  const [currTicker, setCurrTicker] = React.useState(null);
  const [stockHistory, setStockHistory] = React.useState(null);
  const [stockInfo, setStockInfo] = React.useState(null);
  const [holdingsInfo, setHoldingsInfo] = React.useState(null);

  const { currentPage, setCurrentPage } = useNav();

  const handleSubmit = async (e) => {
    const ticker = document.getElementById('tickerInput').value;
    const response = await fetch(`/api/stocks?symbol=${ticker}`);
    
    const data = await response.json();
    setStockInfo({
      name: data.name,
      symbol: data.symbol,
      buy_price: data.buy_price,
      sell_price: data.sell_price
    })
    setStockHistory(data.history)
    setCurrTicker(data.symbol)
  }

  const buyStock = async (e) => {
    if (!currTicker) {
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
            symbol: currTicker,
            quantity: quantity,
            token: token
        })
    });

    const data = await response.json();
    if (response.ok) {
        alert(`Successfully bought ${quantity} share(s) of ${currentTicker}`);
        setHoldingsInfo(data)
    } else {
        alert(`Failed to buy stock: ${data.detail}`);
    }
  }

  const sellStock = async (e) => {
    if (!currTicker) {
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
            symbol: currTicker,
            quantity: quantity,
            token: token
        })
    });

    const data = await response.json();
    if (response.ok) {
        alert(`Successfully sold ${quantity} share(s) of ${currTicker}`);
        setHoldingsInfo(data)
    } else {
        alert(`Failed to sell stock: ${data.detail}`);
    }
  }

  return (
    <div className="dashboard-page">
      <input 
        type="text" 
        id="tickerInput" 
        placeholder="Enter Stock Ticker" 
        onChange={e => setTicker(e)}
        onSubmit={handleSubmit}
      />
      <button id="getStock">Enter</button>

      <div id="stockInfo" className="hidden">
        <StockInfo data={stockInfo}></StockInfo>
        <HoldingsInfo data={holdingsInfo}></HoldingsInfo>

        <StockChart stockData={stockHistory} />

        <PriceButton 
          price={stockInfo ? stockInfo.buy_price : 0}
          action={"BUY"}
          onClick={buyStock}
        />

        <PriceButton 
          price={stockInfo ? stockInfo.sell_price : 0}
          action={"SELL"}
          onClick={sellStock}
        />

        <AddCashButton setStockInfo={setStockInfo}/>
      </div>

    </div>
  );
}
