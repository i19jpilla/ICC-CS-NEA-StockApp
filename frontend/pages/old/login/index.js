const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    console.log("Logging in with", username, password);
    console.log("json", JSON.stringify({ username, password }));
    console.log("json", JSON.stringify({ username: username, password: password }));
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({ 
                username: username,
                password: password
            })
        })
        
        const data = await response.json();
        console.log(data)
        if (response.ok) {
            if (data.status !== "success") {
                alert('Login failed: ' + data.message);
                return;
            } else {
                console.log("Login successful for user:", data.username);
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);

                window.location.href = '/dashboard';
            }
        } else {
            alert('Login failed: ' + data.detail);
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred. Please try again later.');
    }
});