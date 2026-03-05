function LoginPage() {
    return (
        <div class="login-page">
            <h2>Login</h2>
            <form id="login-form" action="/login" method="post">
                <label htmlFor="username">Username:</label>
                <input type="text" id="username" name="username" required />
                
                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" required />
                
                <button type="submit">Login</button>
            </form>

            <p>Don't have an account? <a href="pages/register/index.html">Register here</a></p>
        </div>
    )
}