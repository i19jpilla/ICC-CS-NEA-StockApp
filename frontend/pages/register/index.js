const registerForm = document.getElementById('register-form');
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    try {
        const response = await fetch('/api/auth/register', {
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

        if (response.ok && data.status === "success") {
            alert('Registration successful! Please log in.');
            window.location.href = '/login';
        } else {
            alert('Register failed: ' + data.detail);
        }
    } catch (error) {
        console.error('Error during register:', error);
        alert('An error occurred. Please try again later.');
    }
});