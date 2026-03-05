// CONTEXTS
const NavContext = React.createContext(null)

function NavProvider({ children }) {
    const [currentPage, setCurrentPage] = React.useState(null)

    React.useEffect(() => {
        console.log("set to login")
        setCurrentPage("login")
    }, [])

    /**React.useEffect(() => {
        // do auth check stuff here
        setCurrentPage("login")
    })**/

    return (
        <NavContext.Provider value={{
            currentPage,
            setCurrentPage
        }}>
            {children}
        </NavContext.Provider>
    )
}

function useNav() {
    const context = React.useContext(NavContext);
    if (!context) throw new Error("useNav must be used inside NavProvider");
    return context;
}