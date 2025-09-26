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

function startCamera() {
    showMessage('Camera functionality coming soon!', 'info');
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
