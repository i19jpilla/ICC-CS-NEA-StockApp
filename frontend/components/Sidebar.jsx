function Sidebar() {
  const { currentPage, setCurrentPage } = useNav()

  const navItems = [
    { id: "dashboard",         label: "Dashboard" },
    { id: "sandbox",      label: "Sandbox" },
    { id: "portfolio",    label: "My Portfolio" },
    { id: "friends",      label: "My Friends" },
    { id: "group",        label: "Groups" },
    { id: "achievements", label: "Achievements" },
    { id: "leaderboards", label: "Leaderboards" },
  ];

  const bottomItems = [
    { id: "settings", label: "Settings" },
    { id: "logout",   label: "Log Out" },
  ];

  const NavItem = ({ item }) => (
    <button
      onClick={() => setCurrentPage(item.id)}
      style={{
        width: "100%",
        padding: "14px 16px",
        background: currentPage === item.id ? "#2a7ab5" : "transparent",
        color: "white",
        border: "none",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        cursor: "pointer",
        fontSize: "15px",
        textDecoration: currentPage === item.id ? "underline" : "none",
        fontWeight: currentPage === item.id ? "600" : "400",
      }}
    >
      {item.label}
    </button>
  );

  return (
    <div style={{
      width: "200px",
      height: "100vh",
      background: "#1a5f8a",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    }}>
      <div>
        {navItems.map(item => <NavItem key={item.id} item={item} />)}
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)" }}>
        {bottomItems.map(item => <NavItem key={item.id} item={item} />)}
      </div>
    </div>
  );
}
