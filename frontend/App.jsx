// COMPONENTS

// PAGES

// MAIN APP
function AppContainer() {
  React.useEffect(() => {
    console.log("jfowqopfwqjfowjqf")
  }, [])

  const { currentPage, setCurrentPage } = useNav();

  console.log("current page", currentPage)

  const hideSidebar = ["login", "register"].includes(currentPage)
  const pages = {
    dashboard: <DashboardPage />,
    login: <LoginPage />,
    sandbox: <SandboxPage />,
    register: <RegisterPage />,
    portfolio: <PortfolioPage />
  }

  if (hideSidebar) {
    return pages[currentPage]
  } else {
    return (
      <div style={{ display: "flex", height: "100vh" }}>
        <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <main style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          //justifyContent: "center",  // centers page content horizontally
          padding: "32px",
        }}>
          {pages[currentPage]}
        </main>
      </div>
    );
  }
}

function App() {
  React.useEffect(() => {
    console.log("2fjwqpfwqfwqfwqg")
  }, [])

  return (
    <NavProvider>
      <AppContainer />
    </NavProvider>
  )
}

console.log("wfwqfhwqoif")

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
