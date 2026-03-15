function RegisterPage() {
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const { setCurrentPage } = useNav();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value;

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email })
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        alert('Registration successful! Please log in.');
        setCurrentPage('login');
      } else {
        alert('Register failed: ' + data.detail);
      }
    } catch (error) {
      console.error('Error during register:', error);
      alert('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="auth-page" id="register-page">
      <div className="auth-card">
        <h2 className="auth-heading">Create Account</h2>
        <form id="register-form" className="auth-form" onSubmit={handleSubmit}>
          <InputField id="username" label="Username" required />
          <InputField id="email" label="Email" type="email" required />
          <InputField id="password" label="Password" type="password" required />
          <SubmitButton loading={loading} label="Register" loadingLabel="Creating account..." />
        </form>
        <p className="auth-footer-text">
          Already have an account?{" "}
          <a href="/pages/login" className="auth-link">Login here</a>
        </p>
      </div>
    </div>
  );
}