class DownloadManager {
    constructor() {
        this.downloadStats = JSON.parse(localStorage.getItem('monteria_downloads') || '[]');
    }

    async downloadClient() {
        const downloadBtn = document.getElementById('downloadBtn');
        const originalText = downloadBtn.textContent;
        
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('User not authenticated');
            if (!user.emailVerified) throw new Error('Email not verified');

            downloadBtn.textContent = 'Preparing Download...';
            downloadBtn.disabled = true;
            downloadBtn.classList.add('loading');

            // Прямая ссылка на ZIP файл в папке public/downloads
            const downloadUrl = 'https://drive.google.com/file/d/1pfbSfInh66yR5omVcpPK3kZ6hSaVNkUR/view?usp=drive_link';
            
            // Проверяем доступность файла
            const response = await fetch(downloadUrl, { method: 'HEAD' });
            if (!response.ok) {
                throw new Error('Download file not found');
            }

            // Записываем в историю
            this.recordDownload(user);
            
            showMessage('Starting download...', 'success');
            
            // Создаем скрытую ссылку для скачивания
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = 'Monteria-v0.1.zip';
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Возвращаем текст кнопки
            setTimeout(() => {
                downloadBtn.textContent = 'Download Client';
                downloadBtn.disabled = false;
                downloadBtn.classList.remove('loading');
            }, 3000);
            
        } catch (error) {
            showMessage('Download error: ' + error.message, 'error');
            downloadBtn.textContent = originalText;
            downloadBtn.disabled = false;
            downloadBtn.classList.remove('loading');
        }
    }

    recordDownload(user) {
        const downloadRecord = {
            userId: user.uid,
            email: user.email,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleString(),
            file: 'Monteria-v0.1.zip'
        };
        
        this.downloadStats.unshift(downloadRecord);
        // Сохраняем только последние 10 записей
        this.downloadStats = this.downloadStats.slice(0, 10);
        localStorage.setItem('monteria_downloads', JSON.stringify(this.downloadStats));
        
        this.displayStats();
    }

    displayStats() {
        const statsContainer = document.getElementById('downloadStats');
        if (!statsContainer) return;

        if (this.downloadStats.length === 0) {
            statsContainer.innerHTML = '<div class="stats-item">No download history yet</div>';
            return;
        }

        const userDownloads = this.downloadStats.filter(download => 
            download.userId === (auth.currentUser?.uid)
        );

        if (userDownloads.length === 0) {
            statsContainer.innerHTML = '<div class="stats-item">No download history yet</div>';
            return;
        }

        const html = `
            <h3 style="color: #667eea; margin-bottom: 1rem;">Download History</h3>
            ${userDownloads.map((download, index) => `
                <div class="stats-item" style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 10px; margin-bottom: 0.5rem; border: 1px solid rgba(255,255,255,0.1);">
                    <strong>Download #${userDownloads.length - index}</strong><br>
                    <strong>Date:</strong> ${download.date}<br>
                    <strong>File:</strong> ${download.file}<br>
                    <strong>Status:</strong> <span style="color: #4caf50">Downloaded</span>
                </div>
            `).join('')}
        `;
        
        statsContainer.innerHTML = html;
    }

    // Инициализация при загрузке страницы
    init() {
        this.displayStats();
    }
}

const downloadManager = new DownloadManager();

// Функция для скачивания
function downloadClient() {
    downloadManager.downloadClient();

}
