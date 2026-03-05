function TopBar({ props }) {
  const { currentPage, setCurrentPage } = useNav() 

  return (
    <header className="topbar">
      <div className="topbar-brand">
        <span className="topbar-logo">⬡</span>
        <span className="topbar-title">MyApp</span>
      </div>

      <nav className="topbar-nav">
        {[
          { id: "dashboard",    label: "Dashboard" },
          { id: "sandbox",      label: "Sandbox" },
          { id: "portfolio",    label: "Portfolio" },
        ].map(({ id, label }) => (
          <button
            key={id}
            className={`topbar-link ${currentPage === id ? "active" : ""}`}
            onClick={() => setCurrentPage(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="topbar-actions">
        <span className="topbar-status">● Connected</span>
      </div>
    </header>
  );
}
