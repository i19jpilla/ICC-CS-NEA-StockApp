function DashboardPage({ navigate }) {
  const [currTicker, setCurrTicker] = React.useState(null);
  const [stockHistory, setStockHistory] = React.useState(null);
  const [stockInfo, setStockInfo] = React.useState(null);
  const [holdingsInfo, setHoldingsInfo] = React.useState(null);

  const [visible, setVisible] = React.useState(false)
  const [status, setStatus] = React.useState(null)

  const { currentPage, setCurrentPage } = useNav();

  const sendStatusMessage = (msg, type) => {
      if (setStatus) {
        setStatus({ type: "success", message: msg })
      } else {
        alert(message);
      }
    }

  const handleSubmit = async (e) => {
    setVisible(false)
    const ticker = document.getElementById('tickerInput').value;
    console.log("submit request", ticker)
    const response = await fetch(`/api/stocks?symbol=${ticker}`);

    const data = await response.json();
    console.log(data)
    setVisible(true)
    setStockInfo({
      name: data.name,
      symbol: data.symbol,
      buy_price: data.buy_price,
      sell_price: data.sell_price
    })

    let map = {}
    map[data.symbol] = data
    setStockHistory(map)

    setCurrTicker(data.symbol)
  }

  const buyStock = async (e) => {
    if (!currTicker) {
        sendStatusMessage('Please fetch a stock first.', "error");
        return;
    }

    const quantity = 1; // For simplicity, buying 1 share
    const token = localStorage.getItem('token');
    if (!token) {
        sendStatusMessage('You must be logged in to buy stocks.', "error")
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
    if (data && response.ok) {
      const msg = data.message ?? "Unknown error."
      console.log(data)
      if (data.status && data.status == "success") {
        sendStatusMessage(`Successfully bought ${quantity} share(s) of ${currTicker}`, "success")
        setHoldingsInfo(data.data)
      } else {
        sendStatusMessage(msg, "error")
      }
    } else {
      sendStatusMessage(`Failed to buy stock: ${data.detail}`, "error")
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
    if (data && response.ok) {
      const msg = data.message ?? "Unknown error."
      console.log(data)
      if (data.status && data.status == "success") {
        sendStatusMessage(`Successfully sold ${quantity} share(s) of ${currTicker}`, "success")
        setHoldingsInfo(data.data)
      } else {
        sendStatusMessage(msg, "error")
      }
    } else {
      sendStatusMessage(`Failed to sell stock: ${data.detail}`, "error")
    }
  }

  return (
    <div className="dashboard-page" style={{
      display: "flex",
      flexDirection: "column",
      gap: 16
    }}>
      <StatusMessage status={status}/>

      <div>
        <input 
        type="text" 
        id="tickerInput" 
        placeholder="Enter Stock Ticker" 
        onSubmit={handleSubmit}
        />
        <button id="getStock" onClick={handleSubmit}>Enter</button>
      </div>

      { visible ?
      <div id="stockInfo" style={{
      display: "flex",
      flexDirection: "column",
      gap: 4
    }}>
        <p>test</p>
        <StockInfo data={stockInfo}></StockInfo>
        <HoldingsInfo data={holdingsInfo}></HoldingsInfo>

        <StockChart stockData={stockHistory} />

        <div id="buttons">
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

          <AddCashButton 
            setHoldingsInfo={setHoldingsInfo}
            setStatus={setStatus}
          />
        </div>
      </div>
      : null}
    </div>
  );
}
