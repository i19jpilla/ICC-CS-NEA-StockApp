function PortfolioPage() {
  const [pieChartData, setPieChartData] = React.useState({})
  const [pricesData, setPricesData] = React.useState({})

  const socketRef = React.useRef(null)
  const canvasRef = React.useRef(null)
  const pieChartRef = React.useRef(null)
  const colorsRef = React.useRef({})
  const currPriceShareDataRef = React.useRef({})

  const { setCurrentPage } = useNav()

  const updatePieChart = (pieChartData, pricesData) => {
    let totalPrice = 0
    let hasChanged = false

    for (const [ticker, holdings] of Object.entries(pieChartData)) {
      const tickerPrice = pricesData[ticker] * (isNaN(holdings) ? 0 : holdings)
      totalPrice += tickerPrice
      if (currPriceShareDataRef.current[ticker] !== tickerPrice) {
        hasChanged = true
        currPriceShareDataRef.current[ticker] = tickerPrice
      }
    }

    if (!hasChanged) return
    if (pieChartRef.current) pieChartRef.current.destroy()

    const getRandomColor = () => `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`

    pieChartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels: Object.keys(currPriceShareDataRef.current),
        datasets: [{
          data: Object.values(currPriceShareDataRef.current),
          backgroundColor: Object.keys(currPriceShareDataRef.current).map(ticker => {
            if (!colorsRef.current[ticker]) {
              colorsRef.current[ticker] = getRandomColor()
            }
            return colorsRef.current[ticker]
          })
        }]
      }
    })
  }

  // runs once on mount, same as DOMContentLoaded
  React.useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('You must be logged in.')
      setCurrentPage('login')
      return
    }

    const socket = new WebSocket(`ws://localhost:8000/ws/portfolio?token=${token}`)
    socketRef.current = socket

    socket.onopen = () => console.log('WebSocket connection established')

    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data)
      const data = payload.data
      console.log(data)

      switch (data.type) {
        case 'portfolio_update':
          setPieChartData(data.data)
          break
        case 'price_update':
          setPricesData(data.data)
          break
        default:
          console.warn('Unknown message type:', data.type)
      }
    }

    socket.onclose = () => console.log('WebSocket connection closed')
    socket.onerror = (error) => console.error('WebSocket error:', error)

    return () => socket.close()
  }, [])

  // runs whenever pieChartData or pricesData updates
  React.useEffect(() => {
    if (!canvasRef.current) return
    updatePieChart(pieChartData, pricesData)
  }, [pieChartData, pricesData])

  return (
    <div className="portfolio-page">
      <button onClick={() => setCurrentPage('dashboard')}>Back to Dashboard</button>
      {pieChartData ? <canvas ref={canvasRef} /> : <p>Connecting...</p>} 
    </div>
  )
}