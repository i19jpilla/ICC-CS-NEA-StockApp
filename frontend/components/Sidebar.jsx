function Sidebar() {
  const { currentPage, setCurrentPage } = useNav()

  const items = [
    { id: "home",     icon: "⌂", label: "Home" },
    { id: "settings", icon: "⚙", label: "Settings" },
    { id: "about",    icon: "ℹ", label: "About" },
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {items.map(({ id, icon, label }) => (
          <button
            key={id}
            className={`sidebar-item ${currentPage === id ? "active" : ""}`}
            onClick={() => setCurrentPage(id)}
            title={label}
          >
            <span className="sidebar-icon">{icon}</span>
            <span className="sidebar-label">{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
