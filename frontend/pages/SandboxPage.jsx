function SandboxPage({ navigate }) {
  const [currTicker, setCurrTicker] = React.useState(null);
  const [stockHistory, setStockHistory] = React.useState(null);
  const [stockInfo, setStockInfo] = React.useState(null);
  const [holdingsInfo, setHoldingsInfo] = React.useState(null);
  //const [visible, setVisible] = React.useState(false);
  const [status, setStatus] = React.useState(null);

  const socketRef = React.useRef(null);
  const { setCurrentPage } = useNav();

  const sendStatusMessage = (msg, type) => {
    setStatus({ type, message: msg });
  }

  const tickerCheck = () => {
    if (!currTicker) {
      sendStatusMessage('Please enter a stock ticker.', 'error');
      return false;
    }
    return true
  }

  const trackStock = () => {
    if (!tickerCheck()) return
    socketRef.current?.send(JSON.stringify({ type: 'track', symbol: currTicker }));
  }

  const untrackStock = () => {
    if (!tickerCheck()) return
    socketRef.current?.send(JSON.stringify({ type: 'untrack', symbol: currTicker }));
  }

  const trackAllStocks = () => {
    socketRef.current?.send(JSON.stringify({ type: 'all' }));
  }

  // WebSocket connection
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      sendStatusMessage('You must be logged in.', 'error');
      setCurrentPage('login');
      return;
    }

    const socket = new WebSocket(`ws://localhost:8000/ws/sandbox?token=${token}`);
    socketRef.current = socket;

    socket.onopen = () => console.log('WebSocket connection established');

    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      const data = payload.data;

      switch (data.type) {
        case 'market_update':
          setStockHistory({ ...data.data });
          break;
        case 'transaction_update':
          setHoldingsInfo(data.data);
          break;
        case 'ticker_update':
          setCurrTicker(data.data.symbol);
          setStockInfo({
            name: data.data.name,
            symbol: data.data.symbol,
            buy_price: data.data.buy_price,
            sell_price: data.data.sell_price
          });
          //setVisible(true);
          break;
        default:
          console.warn('Unknown message type:', data.type);
      }
    };

    socket.onclose = () => console.log('WebSocket connection closed');
    socket.onerror = (error) => console.error('WebSocket error:', error);

    return () => socket.close();
  }, []);

  const buyStock = async () => {
    if (!currTicker) {
      sendStatusMessage('Please fetch a stock first.', 'error');
      return;
    }

    const token = localStorage.getItem('token');
    const response = await fetch('/api/sandbox/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol: currTicker, quantity: 1, token })
    });

    const data = await response.json();
    if (data && response.ok) {
      if (data.status === 'success') {
        sendStatusMessage(`Successfully bought 1 share of ${currTicker}`, 'success');
        setHoldingsInfo(data.data);
      } else {
        sendStatusMessage(data.message ?? 'Unknown error.', 'error');
      }
    } else {
      sendStatusMessage(`Failed to buy stock: ${data.detail}`, 'error');
    }
  }

  const sellStock = async () => {
    if (!currTicker) {
      sendStatusMessage('Please fetch a stock first.', 'error');
      return;
    }

    const token = localStorage.getItem('token');
    const response = await fetch('/api/sandbox/sell', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol: currTicker, quantity: 1, token })
    });

    const data = await response.json();
    if (data && response.ok) {
      if (data.status === 'success') {
        sendStatusMessage(`Successfully sold 1 share of ${currTicker}`, 'success');
        setHoldingsInfo(data.data);
      } else {
        sendStatusMessage(data.message ?? 'Unknown error.', 'error');
      }
    } else {
      sendStatusMessage(`Failed to sell stock: ${data.detail}`, 'error');
    }
  }

  return (
    <div className="sandbox-page" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <StatusMessage status={status} />

      <div>
        <input
          type="text"
          id="tickerInput"
          placeholder="Enter Stock Ticker"
          onChange={e => setCurrTicker(e.target.value)}
        />
        <button id="track" onClick={() => trackStock()}>Track</button>
        <button id="untrack" onClick={() => untrackStock()}>Untrack</button>
        <button id="trackAll" onClick={() => trackAllStocks()}>Track All</button>
      </div>

      {stockHistory !== null ? (
        <div id="stockInfo" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <StockInfo data={stockInfo} />
          <HoldingsInfo data={holdingsInfo} />
          <StockChart stockData={stockHistory} />

          <div id="buttons">
            <PriceButton
              price={stockInfo ? stockInfo.buy_price : 0}
              action="BUY"
              onClick={buyStock}
            />
            <PriceButton
              price={stockInfo ? stockInfo.sell_price : 0}
              action="SELL"
              onClick={sellStock}
            />
            <AddCashButton
              setHoldingsInfo={setHoldingsInfo}
              setStatus={setStatus}
            />
          </div>
        </div>
      ) : <p>Connecting...</p>}
    </div>
  );
}
