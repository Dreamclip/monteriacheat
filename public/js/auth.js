let authStateChecked = false;

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const googleLoginBtn = document.getElementById('googleLogin');
    const googleRegisterBtn = document.getElementById('googleRegister');
    const logoutBtn = document.getElementById('logoutBtn');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            loginUser(email, password);
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            registerUser(email, password);
        });
    }

    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', signInWithGoogle);
    }

    if (googleRegisterBtn) {
        googleRegisterBtn.addEventListener('click', signInWithGoogle);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutUser);
    }

    // Инициализация менеджера загрузок
    if (typeof downloadManager !== 'undefined') {
        downloadManager.init();
    }

    auth.onAuthStateChanged(user => {
        if (!authStateChecked) {
            authStateChecked = true;
            
            const currentPath = window.location.pathname;
            
            if (user) {
                if (user.emailVerified) {
                    if (currentPath === '/login.html' || currentPath === '/') {
                        window.location.href = '/dashboard.html';
                    }
                } else {
                    if (currentPath === '/dashboard.html') {
                        window.location.href = '/login.html';
                    }
                    showMessage('Please verify your email before accessing dashboard', 'warning');
                }
            } else {
                if (currentPath === '/dashboard.html') {
                    window.location.href = '/login.html';
                }
            }
        }
        
        updateUI(user);
    });
});

// Остальные функции остаются такими же как в предыдущей версии
function updateUI(user) {
    const userInfo = document.getElementById('userInfo');
    if (userInfo && user) {
        userInfo.innerHTML = `
            <strong>Email:</strong> ${user.email}<br>
            <strong>ID:</strong> ${user.uid}<br>
            <strong>Status:</strong> <span class="${user.emailVerified ? 'status-verified' : 'status-pending'}">
                ${user.emailVerified ? 'Verified' : 'Pending Verification'}
            </span>
            ${!user.emailVerified ? `
                <br><button class="resend-verification" onclick="resendVerification()">
                    Resend Verification Email
                </button>
            ` : ''}
        `;
    }

    // Обновляем кнопку скачивания
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        if (user && user.emailVerified) {
            downloadBtn.disabled = false;
            downloadBtn.style.opacity = '1';
            downloadBtn.textContent = 'Download Client';
        } else {
            downloadBtn.disabled = true;
            downloadBtn.style.opacity = '0.6';
            downloadBtn.textContent = 'Verify Email to Download';
        }
    }
}

function loginUser(email, password) {
    const btn = document.querySelector('#loginForm .btn-primary');
    const originalText = btn.textContent;
    
    btn.textContent = 'Signing in...';
    btn.disabled = true;
    btn.classList.add('loading');

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            if (!user.emailVerified) {
                showMessage('Please verify your email before accessing the dashboard', 'warning');
                auth.signOut();
            } else {
                showMessage('Successfully signed in!', 'success');
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 1000);
            }
        })
        .catch((error) => {
            showMessage('Login error: ' + error.message, 'error');
        })
        .finally(() => {
            btn.textContent = originalText;
            btn.disabled = false;
            btn.classList.remove('loading');
        });
}

function registerUser(email, password) {
    const btn = document.querySelector('#registerForm .btn-primary');
    const originalText = btn.textContent;
    
    btn.textContent = 'Registering...';
    btn.disabled = true;
    btn.classList.add('loading');

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            return sendEmailVerification(user);
        })
        .then(() => {
            showMessage('Registration successful! Please check your email for verification.', 'success');
            document.getElementById('registerForm').reset();
        })
        .catch((error) => {
            showMessage('Registration error: ' + error.message, 'error');
        })
        .finally(() => {
            btn.textContent = originalText;
            btn.disabled = false;
            btn.classList.remove('loading');
        });
}

function sendEmailVerification(user) {
    const actionCodeSettings = {
        url: 'https://monteria.netlify.app/dashboard.html',
        handleCodeInApp: true
    };
    
    return user.sendEmailVerification(actionCodeSettings)
        .then(() => {
            console.log('Verification email sent');
            // Сохраняем что email отправлен
            localStorage.setItem('emailVerificationSent', 'true');
        })
        .catch((error) => {
            console.error('Error sending verification:', error);
            throw error;
        });
}

function resendVerification() {
    const user = auth.currentUser;
    if (user) {
        sendEmailVerification(user)
            .then(() => {
                showMessage('Verification email sent!', 'success');
            })
            .catch((error) => {
                showMessage('Error sending verification: ' + error.message, 'error');
            });
    }
}

function signInWithGoogle() {
    const btn = event.target;
    const originalText = btn.textContent;
    
    btn.textContent = 'Connecting...';
    btn.disabled = true;
    btn.classList.add('loading');

    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            showMessage('Successfully signed in with Google!', 'success');
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 1000);
        })
        .catch((error) => {
            showMessage('Google sign-in error: ' + error.message, 'error');
        })
        .finally(() => {
            btn.textContent = originalText;
            btn.disabled = false;
            btn.classList.remove('loading');
        });
}

function logoutUser() {
    auth.signOut().then(() => {
        showMessage('Successfully signed out', 'success');
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 1000);
    });
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }

}
