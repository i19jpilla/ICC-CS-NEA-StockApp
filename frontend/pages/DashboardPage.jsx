function DashboardPage({ navigate }) {
  return (
    <div className="dashboard-page">
      <input type="text" id="tickerInput" placeholder="Enter Stock Ticker" />
      <button id="getStock">Enter</button>
      <div id="stockData">
        <p id="name"></p>
        <p id="ticker"></p>
        <p id="buyPrice"></p>
        <p id="sellPrice"></p>
        <button id="buyButton">Buy</button>
        <button id="sellButton">Sell</button>
        <button id="addCash">Add Cash</button>
        <button id="sandbox">Sandbox</button>
        <p id="balance"></p>
        <p id="totalQuantity"></p>


        <canvas id="priceChart"></canvas>
      </div>

    </div>
  );
}
