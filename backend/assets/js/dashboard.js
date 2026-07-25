// Utility: Get data from API
async function getQRCodes() {
    try {
        const token = localStorage.getItem('token');
        const userData = JSON.parse(localStorage.getItem('userData'));

        console.log('🔍 Checking authentication...');
        console.log('Token:', token ? 'Present' : 'Missing');
        console.log('UserData:', userData ? 'Present' : 'Missing');

        if (!token || !userData) {
            console.log('❌ No authentication found, redirecting to login');
            window.location.href = '/login';
            return [];
        }

        if (!userData.id) {
            console.error('❌ Invalid user data: missing user ID');
            return [];
        }

        console.log('🌐 Fetching QR codes for user:', userData.id);
        const response = await fetch(`http://localhost:3000/api/qr-codes/user/${userData.id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('📡 Response status:', response.status);

        if (response.ok) {
            const qrCodes = await response.json();
            console.log('✅ QR codes fetched successfully:', qrCodes.length);
            return Array.isArray(qrCodes) ? qrCodes : [];
        } else {
            console.error('❌ Failed to fetch QR codes, status:', response.status);
            const errorText = await response.text();
            console.error('Error response:', errorText);
            return [];
        }
    } catch (error) {
        console.error('❌ Error fetching QR codes:', error);
        return [];
    }
}

async function getNotifications() {
    try {
        const token = localStorage.getItem('token');
        const userData = JSON.parse(localStorage.getItem('userData'));

        if (!token || !userData) {
            console.log('🔔 No authentication for notifications');
            return [];
        }

        if (!userData.id) {
            console.error('❌ Invalid user data: missing user ID');
            return [];
        }

        console.log('📬 Fetching notifications for user:', userData.id);
        const response = await fetch(`http://localhost:3000/api/notifications/user/${userData.id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('📬 Notifications response status:', response.status);

        if (response.ok) {
            const notifications = await response.json();
            console.log('✅ Notifications fetched successfully:', notifications.length);
            return Array.isArray(notifications) ? notifications : [];
        } else {
            console.error('❌ Failed to fetch notifications, status:', response.status);
            return [];
        }
    } catch (error) {
        console.error('❌ Error fetching notifications:', error);
        return [];
    }
}

// Stats
async function updateStats() {
    try {
        console.log('🔄 Updating stats...');
        const qrCodes = await getQRCodes();
        const notifications = await getNotifications();

        console.log('📊 QR Codes count:', qrCodes.length);
        console.log('🔔 Notifications count:', notifications.length);

        document.getElementById('statTotalQRCodes').textContent = qrCodes.length;
        document.getElementById('statNewNotifications').textContent = notifications.filter(n => !n.is_read).length;
        document.getElementById('notifBadge').textContent = notifications.filter(n => !n.is_read).length;
        document.getElementById('statTotalScans').textContent = qrCodes.reduce((sum, qr) => sum + (qr.scans || 0), 0);
        document.getElementById('statItemsRecovered').textContent = qrCodes.filter(qr => qr.status === 'recovered').length;

        console.log('✅ Stats updated successfully');
    } catch (error) {
        console.error('❌ Error updating stats:', error);
        // Set default values if API fails
        document.getElementById('statTotalQRCodes').textContent = '0';
        document.getElementById('statNewNotifications').textContent = '0';
        document.getElementById('notifBadge').textContent = '0';
        document.getElementById('statTotalScans').textContent = '0';
        document.getElementById('statItemsRecovered').textContent = '0';
    }
}

// Recent Activity
async function loadRecentActivity() {
    const activityList = document.getElementById('activityList');
    activityList.innerHTML = '';
    const qrCodes = await getQRCodes();

    qrCodes.slice(-5).reverse().forEach(qr => {
        const div = document.createElement('div');
        div.className = 'activity-item';
        div.innerHTML = `
            <div class="activity-icon"><i class="fas fa-qrcode"></i></div>
            <div class="activity-content">
                <p>QR Code <b>${qr.item_name}</b> created</p>
                <span class="activity-time">${new Date(qr.created_at).toLocaleString()}</span>
            </div>
        `;
        activityList.appendChild(div);
    });
}

// QR Codes List
async function loadQRCodes() {
    const qrCodesGrid = document.getElementById('qrCodesGrid');
    qrCodesGrid.innerHTML = '';
    const qrCodes = await getQRCodes();

    if (qrCodes.length === 0) {
            qrCodesGrid.innerHTML = '<p>No QR codes yet. <a href="/buy-qr">Buy one now!</a></p>';
        return;
    }

    qrCodes.forEach(qr => {
        const card = document.createElement('div');
        card.className = 'qr-code-card';
        card.innerHTML = `
            <div class="qr-code-header">
                <div class="qr-code-name">${qr.item_name}</div>
                <div class="qr-code-status ${qr.status === 'recovered' ? 'safe' : 'lost'}">${qr.status === 'recovered' ? 'Safe' : 'Active'}</div>
            </div>
            <div class="qr-code-info">
                <p><strong>QR Code:</strong> ${qr.qr_code_id}</p>
                <p><strong>Reward:</strong> $${qr.reward_amount}</p>
                <p><strong>Created:</strong> ${new Date(qr.created_at).toLocaleDateString()}</p>
            </div>
            <div class="qr-code-actions">
                <button class="btn-manage" onclick="manageQRCode('${qr.qr_code_id}')">
                    <i class="fas fa-cog"></i> Manage
                </button>
                <button class="btn-print" onclick="printQRCode('${qr.qr_code_id}')">
                    <i class="fas fa-print"></i> Print
                </button>
                <button class="btn-delete" onclick="deleteQRCode('${qr.qr_code_id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        qrCodesGrid.appendChild(card);
    });
}

// Notifications List
async function loadNotifications() {
    const notificationsList = document.getElementById('notificationsList');
    notificationsList.innerHTML = '';
    const notifications = await getNotifications();

    if (notifications.length === 0) {
        notificationsList.innerHTML = '<p>No notifications yet.</p>';
        return;
    }

    notifications.slice(-10).reverse().forEach(n => {
        const div = document.createElement('div');
        div.className = `notification-item${n.is_read ? '' : ' unread'}`;
        div.innerHTML = `
            <div class="notification-header">
                <div class="notification-title">${n.title}</div>
                <div class="notification-time">${new Date(n.created_at).toLocaleString()}</div>
            </div>
            <div class="notification-content">${n.message}</div>
        `;
        div.onclick = () => markNotificationAsRead(n.id);
        notificationsList.appendChild(div);
    });
}

// Mark all notifications as read
async function markAllRead() {
    try {
        const token = localStorage.getItem('token');
        const userData = JSON.parse(localStorage.getItem('userData'));

        if (!token || !userData || !userData.id) {
            console.error('❌ Missing authentication or user data');
            return;
        }

        const response = await fetch(`http://localhost:3000/api/notifications/user/${userData.id}/read-all`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            loadNotifications();
            updateStats();
        } else {
            console.error('❌ Failed to mark all as read, status:', response.status);
        }
    } catch (error) {
        console.error('❌ Error marking all as read:', error);
    }
}

// Manage QR Code Modal
async function manageQRCode(qrCodeId) {
    if (!qrCodeId) {
        console.error('❌ No QR code ID provided');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('❌ No authentication token found');
            return;
        }

        const response = await fetch(`http://localhost:3000/api/qr-codes/${qrCodeId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const qr = await response.json();
            if (qr && qr.item_description !== undefined && qr.reward_amount !== undefined) {
                document.getElementById('qrText').value = qr.item_description || '';
                document.getElementById('qrReward').value = qr.reward_amount;
                sessionStorage.setItem('currentQRCode', qrCodeId);
                document.getElementById('qrManagementModal').style.display = 'block';
                document.getElementById('qrManagementModal').setAttribute('aria-hidden', 'false');
            }
        } else {
            console.error('❌ Failed to fetch QR code, status:', response.status);
        }
    } catch (error) {
        console.error('❌ Error fetching QR code:', error);
    }
}

// Print QR Code
async function printQRCode(qrCodeId) {
    if (!qrCodeId) {
        console.error('❌ No QR code ID provided');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('❌ No authentication token found');
            return;
        }

        const imageResponse = await fetch(`http://localhost:3000/api/qr-images/${qrCodeId}`);
        if (!imageResponse.ok) {
            console.error('❌ Failed to fetch QR code image');
            return;
        }

        const imageData = await imageResponse.json();

        const qrResponse = await fetch(`http://localhost:3000/api/qr-codes/${qrCodeId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (qrResponse.ok) {
            const qr = await qrResponse.json();
            if (!qr || !qr.item_name) {
                console.error('❌ Invalid QR code data');
                return;
            }

            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                console.error('❌ Failed to open print window (popup blocked?)');
                return;
            }

            printWindow.document.write(`
                <html>
                    <head>
                        <title>QR Code - ${qr.item_name}</title>
                        <style>
                            body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
                            .qr-container { margin: 20px; }
                            .qr-code img { width: 200px; height: 200px; margin: 20px auto; display: block; }
                            .item-info { margin: 20px; }
                        </style>
                    </head>
                    <body>
                        <h1>NeoTrack QR Code</h1>
                        <div class="qr-container">
                            <div class="qr-code"><img src="${imageData.qr_code_data_url}" alt="QR Code"/></div>
                            <div class="item-info">
                                <h3>${qr.item_name}</h3>
                                <p>QR Code: ${qr.qr_code_id}</p>
                                <p>Reward: $${qr.reward_amount}</p>
                            </div>
                        </div>
                    </body>
                </html>
            `);
        } else {
            console.error('❌ Failed to fetch QR code for printing');
        }
    } catch (error) {
        console.error('❌ Error printing QR code:', error);
    }
}

// Delete QR Code
async function deleteQRCode(qrCodeId) {
    if (!qrCodeId) {
        console.error('❌ No QR code ID provided');
        return;
    }

    if (!confirm('Are you sure you want to delete this QR code?')) return;

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('❌ No authentication token found');
            return;
        }

        const response = await fetch(`http://localhost:3000/api/qr-codes/${qrCodeId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            loadQRCodes();
            updateStats();
        } else {
            console.error('❌ Failed to delete QR code, status:', response.status);
        }
    } catch (error) {
        console.error('❌ Error deleting QR code:', error);
    }
}

// Save QR Code changes
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('qrManagementForm');
    if (form) {
        form.onsubmit = async function(e) {
            e.preventDefault();
            const qrCodeId = sessionStorage.getItem('currentQRCode');
            if (!qrCodeId) {
                console.error('❌ No current QR code ID found');
                return;
            }

            const qrText = document.getElementById('qrText').value;
            const qrReward = document.getElementById('qrReward').value;

            if (!qrText || !qrReward) {
                console.error('❌ Invalid form data');
                return;
            }

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('❌ No authentication token found');
                    return;
                }

                const response = await fetch(`http://localhost:3000/api/qr-codes/${qrCodeId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        item_description: qrText,
                        reward_amount: qrReward
                    })
                });

                if (response.ok) {
                    closeModal('qrManagementModal');
                    loadQRCodes();
                    updateStats();
                } else {
                    console.error('❌ Failed to update QR code, status:', response.status);
                }
            } catch (error) {
                console.error('❌ Error updating QR code:', error);
            }
        };
    }
});

// Modal close
function closeModal(modalId) {
    try {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        }
    } catch (error) {
        console.error('❌ Error closing modal:', error);
    }
}
window.onclick = function(event) {
    try {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
                modal.setAttribute('aria-hidden', 'true');
            }
        });
    } catch (error) {
        console.error('❌ Error handling window click:', error);
    }
};

// Navigation between dashboard sections
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Dashboard loaded, initializing...');

    // Wait a bit for localStorage to be set, then check authentication
    setTimeout(() => {
        loadUserData();
        updateStats();
        loadRecentActivity();
        loadQRCodes();
        loadNotifications();
    }, 100);

    console.log('✅ Dashboard initialization complete');

    // Sidebar navigation
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.dashboard-section');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            this.classList.add('active');
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) targetSection.classList.add('active');
        });
    });
});

// Quick actions
async function showQRManagement() {
    const qrCodes = await getQRCodes();
    if (qrCodes.length > 0) {
        manageQRCode(qrCodes[0].qr_code_id);
    } else {
        alert('No QR codes to manage!');
    }
}
function showNotifications() {
    document.querySelectorAll('.dashboard-section').forEach(s => s.classList.remove('active'));
    document.getElementById('notifications').classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector('.nav-item[href="#notifications"]').classList.add('active');
}

// Mark notification as read
async function markNotificationAsRead(notificationId) {
    if (!notificationId) {
        console.error('❌ No notification ID provided');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('❌ No authentication token found');
            return;
        }

        const response = await fetch(`http://localhost:3000/api/notifications/${notificationId}/read`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            loadNotifications();
            updateStats();
        } else {
            console.error('❌ Failed to mark notification as read, status:', response.status);
        }
    } catch (error) {
        console.error('❌ Error marking notification as read:', error);
    }
}

// Load user data into navbar
async function loadUserData() {
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (userData && userData.name && userData.email) {
            document.getElementById('userName').textContent = userData.name;
            document.getElementById('userEmail').textContent = userData.email;
        } else {
            console.warn('⚠️ Incomplete user data in localStorage');
        }
    } catch (error) {
        console.error('❌ Error loading user data:', error);
    }
}

// Logout
function logout() {
    sessionStorage.clear();
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    window.location.href = '/login';
}
