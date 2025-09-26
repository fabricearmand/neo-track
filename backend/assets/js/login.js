document.addEventListener('DOMContentLoaded', function() {
    // Toggle password visibility
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.querySelector('#password');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }

    // Handle login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Get and clean form data
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            // Validate inputs
            if (!email || !password) {
                showMessage('Please enter both email and password', 'error');
                return;
            }

            console.log('Login attempt with email:', email);

            try {
                // Show loading state
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
                submitBtn.disabled = true;

                // Call login API
                console.log('Sending login request...');
                const requestBody = { email, password };
                console.log('Request body:', requestBody);

                const response = await fetch('http://localhost:3000/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody)
                });

                console.log('Response status:', response.status);
                const data = await response.json();
                console.log('Response data:', data);

                if (response.ok) {
                    // Store token and user data
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userData', JSON.stringify(data.user));

                    console.log('✅ Login successful');
                    console.log('Token stored:', data.token.substring(0, 50) + '...');
                    console.log('User data stored:', data.user);

                    // Show success message
                    showMessage('Login successful! Redirecting...', 'success');

                    // Redirect to dashboard
                    setTimeout(() => {
                        console.log('🔄 Redirecting to dashboard...');
                        window.location.href = '/dashboard';
                    }, 1000);
                } else {
                    showMessage(data.error || 'Login failed', 'error');
                }
            } catch (error) {
                console.error('Login error:', error);
                showMessage('Network error. Please try again.', 'error');
            } finally {
                // Reset button
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
                submitBtn.disabled = false;
            }
        });
    }

    // Social login handlers
    const googleBtn = document.querySelector('.social-btn.google');
    const facebookBtn = document.querySelector('.social-btn.facebook');

    if (googleBtn) {
        googleBtn.addEventListener('click', function() {
            console.log('Google login clicked');
            showMessage('Google login will be implemented soon', 'info');
        });
    }

    if (facebookBtn) {
        facebookBtn.addEventListener('click', function() {
            console.log('Facebook login clicked');
            showMessage('Facebook login will be implemented soon', 'info');
        });
    }
});

function showRegister() {
    showMessage('Registration will be implemented soon', 'info');
}

// Utility function to show messages
function showMessage(message, type = 'info') {
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;

    // Add styles
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 300px;
        animation: slideIn 0.3s ease;
    `;

    // Set background color based on type
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#17a2b8',
        warning: '#ffc107'
    };
    messageDiv.style.backgroundColor = colors[type] || colors.info;

    // Add to page
    document.body.appendChild(messageDiv);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentElement) {
            messageDiv.remove();
        }
    }, 5000);
}

// Add CSS for message animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);
