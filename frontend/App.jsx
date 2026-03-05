// COMPONENTS

// PAGES

// MAIN APP
function AppContainer() {
  React.useEffect(() => {
    console.log("jfowqopfwqjfowjqf")
  }, [])

  const { currentPage, setCurrentPage } = useNav();

  console.log("current page", currentPage)

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":     return <DashboardPage />;
      case "login":    return <LoginPage />
      default:         return <DashboardPage />;
    }
  };

  return (
    <div className="app-container">
      <p>test</p>
      <TopBar />
      <div className="app-body">
        <Sidebar />
        <main className="app-content">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

function App() {
  React.useEffect(() => {
    console.log("2fjwqpfwqfwqfwqg")
  }, [])

  return (
    <NavProvider>
      <p>TEST123</p>
      <AppContainer />
    </NavProvider>
  )
}

console.log("wfwqfhwqoif")

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
