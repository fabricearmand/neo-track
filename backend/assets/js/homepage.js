// Homepage JavaScript functionality
function showScanModal() {
    document.getElementById('scanModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function viewNotifications() {
    showMessage('Please login to view notifications', 'info');
    setTimeout(() => {
        window.location.href = '/login';
    }, 1500);
}

function manageQRCode() {
    showMessage('Please login to manage QR codes', 'info');
    setTimeout(() => {
        window.location.href = '/login';
    }, 1500);
}

let currentStream = null;

function startCamera() {
    if (currentStream) {
        stopCamera();
        return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showMessage('Camera is not supported in this browser', 'error');
        return;
    }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
            currentStream = stream;
            const modal = document.getElementById('scanModal');
            const scanArea = modal.querySelector('.scan-area');
            const oldVideo = scanArea.querySelector('video');
            if (oldVideo) oldVideo.remove();
            const oldStartBtn = scanArea.querySelector('.start-camera-btn');
            if (oldStartBtn) oldStartBtn.remove();
            const oldMsg = scanArea.querySelector('.camera-msg');
            if (oldMsg) oldMsg.remove();

            const video = document.createElement('video');
            video.srcObject = stream;
            video.autoplay = true;
            video.playsInline = true;
            video.style.cssText = 'width:100%;max-width:400px;border-radius:10px;margin:0 auto;display:block;background:#000;';
            scanArea.insertBefore(video, scanArea.firstChild);

            const msg = document.createElement('p');
            msg.className = 'camera-msg';
            msg.style.cssText = 'color:#fff;margin-top:10px;';
            msg.textContent = 'Point camera at a NeoTrack QR code';
            scanArea.insertBefore(msg, scanArea.children[1]);

            const stopBtn = document.createElement('button');
            stopBtn.className = 'start-camera-btn';
            stopBtn.style.cssText = 'margin-top:10px;background:#dc3545;';
            stopBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Camera';
            stopBtn.onclick = stopCamera;
            scanArea.appendChild(stopBtn);

            startQRDetection(video);
        })
        .catch(err => {
            console.error('Camera error:', err);
            showMessage('Unable to access camera. Please check permissions.', 'error');
        });
}

function stopCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
    const modal = document.getElementById('scanModal');
    const scanArea = modal.querySelector('.scan-area');
    const video = scanArea.querySelector('video');
    if (video) { video.srcObject = null; video.remove(); }
    const msg = scanArea.querySelector('.camera-msg');
    if (msg) msg.remove();
    const oldBtn = scanArea.querySelector('.start-camera-btn');
    if (oldBtn) oldBtn.remove();
    const startBtn = scanArea.querySelector('button.btn-primary');
    if (startBtn && !startBtn.classList.contains('start-camera-btn')) {
        startBtn.style.display = '';
    }
}

function startQRDetection(video) {
    if (window._qrDetector) clearInterval(window._qrDetector);
    window._qrDetector = setInterval(() => {
        if (!video.srcObject) { clearInterval(window._qrDetector); return; }
    }, 1000);
}

function showScanModal() {
    document.getElementById('scanModal').style.display = 'block';
}

function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;

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

    const colors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#17a2b8',
        warning: '#ffc107'
    };
    messageDiv.style.backgroundColor = colors[type] || colors.info;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        if (messageDiv.parentElement) {
            messageDiv.remove();
        }
    }, 5000);
}

window.onclick = function(event) {
    const modal = document.getElementById('scanModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};
