const useState = React.useState

const InputField = ({ id, label, type = "text", value, onChange, required }) => (
  <div style={styles.fieldWrapper}>
    <label htmlFor={id} style={styles.label}>{label}</label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      style={styles.input}
      onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
      onBlur={e => Object.assign(e.target.style, styles.input)}
    />
  </div>
);

const SubmitButton = ({ loading }) => (
  <button
    type="submit"
    disabled={loading}
    style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }}
    onMouseEnter={e => !loading && Object.assign(e.target.style, styles.buttonHover)}
    onMouseLeave={e => Object.assign(e.target.style, styles.button)}
  >
    {loading ? "Signing in..." : "Login"}
  </button>
);

const ErrorAlert = ({ message }) =>
  message ? <div style={styles.alert}>{message}</div> : null;


function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { currentPage, setCurrentPage } = useNav();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.status !== "success") {
          setError(data.message || "Login failed.");
        } else {
          console.log("Login successful for user:", data.username);
          localStorage.setItem("token", data.token);
          localStorage.setItem("username", data.username);
          setCurrentPage("dashboard")
        }
      } else {
        setError(data.detail || "Login failed.");
      }
    } catch (err) {
      console.error("Error during login:", err);
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Login</h2>
        <form id="login-form" onSubmit={handleSubmit} style={styles.form}>
          <ErrorAlert message={error} />
          <InputField
            id="username"
            label="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <InputField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <SubmitButton loading={loading} />
        </form>
        <p style={styles.registerText}>
          Don't have an account?{" "}
          <a href="/pages/register/index.html" style={styles.link}>
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f0f2f5",
    fontFamily: "'Segoe UI', sans-serif",
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "40px 36px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  },
  heading: {
    margin: "0 0 24px",
    fontSize: "24px",
    fontWeight: 700,
    color: "#111",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  fieldWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "14px",
    fontWeight: 500,
    color: "#444",
  },
  input: {
    padding: "10px 14px",
    fontSize: "15px",
    border: "1.5px solid #ddd",
    borderRadius: "8px",
    outline: "none",
    transition: "border-color 0.2s",
    color: "#111",
    background: "#fafafa",
  },
  inputFocus: {
    padding: "10px 14px",
    fontSize: "15px",
    border: "1.5px solid #4f46e5",
    borderRadius: "8px",
    outline: "none",
    color: "#111",
    background: "#fff",
  },
  button: {
    marginTop: "8px",
    padding: "12px",
    fontSize: "15px",
    fontWeight: 600,
    color: "#fff",
    background: "#4f46e5",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  buttonHover: {
    marginTop: "8px",
    padding: "12px",
    fontSize: "15px",
    fontWeight: 600,
    color: "#fff",
    background: "#4338ca",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  buttonDisabled: {
    background: "#a5b4fc",
    cursor: "not-allowed",
  },
  alert: {
    padding: "10px 14px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    color: "#dc2626",
    fontSize: "14px",
  },
  registerText: {
    marginTop: "20px",
    fontSize: "14px",
    color: "#666",
    textAlign: "center",
  },
  link: {
    color: "#4f46e5",
    textDecoration: "none",
    fontWeight: 500,
  },
};