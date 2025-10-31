document.addEventListener('DOMContentLoaded', function() {
    const userEmail = document.getElementById('userEmail');
    const signOutBtn = document.getElementById('signOut');
    const downloadBtn = document.getElementById('downloadBtn');
    const verificationStatus = document.getElementById('verificationStatus');

    // Check auth state
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            userEmail.textContent = user.email;
            
            // Check email verification
            if (user.emailVerified) {
                verificationStatus.textContent = '✓ Email verified';
                verificationStatus.className = 'verification-info verified';
                downloadBtn.disabled = false;
            } else {
                verificationStatus.textContent = '✗ Please verify your email to download';
                verificationStatus.className = 'verification-info not-verified';
                downloadBtn.disabled = true;
                
                // Reload user to get latest verification status
                await user.reload();
            }
        } else {
            window.location.href = '/login';
        }
    });

    // Sign out
    signOutBtn.addEventListener('click', () => {
        auth.signOut().then(() => {
            window.location.href = '/';
        });
    });

    // Download button
    downloadBtn.addEventListener('click', () => {
        // Здесь должна быть ссылка на скачивание
        const downloadUrl = 'opensource.zip'; // Замените на реальную ссылку
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = 'Monteria-v0.1.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert('Download started! Check your downloads folder.');
    });
});