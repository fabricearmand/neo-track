const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());

// Custom Header Middleware
app.use((req, res, next) => {
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    res.header('X-NeoTrack-Version', '1.0.0');

    if (req.method === 'POST' || req.method === 'PUT') {
        console.log('=== REQUEST HEADERS ===');
        console.log('Authorization:', req.headers.authorization ? 'Present' : 'Missing');
        console.log('Content-Type:', req.headers['content-type']);
        console.log('======================');
    }

    next();
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            error: 'Access token required',
            message: 'Please login to access this resource'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({
                error: 'Invalid or expired token',
                message: 'Please login again'
            });
        }
        req.user = user;
        next();
    });
};

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/qr-codes', authenticateToken, require('./routes/qrCodes'));
app.use('/api/items', authenticateToken, require('./routes/items'));
app.use('/api/payments', authenticateToken, require('./routes/payments'));
app.use('/api/notifications', authenticateToken, require('./routes/notifications'));

// Serve static files
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'pages')));

// Handle page routing
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/index.html'));
});

app.get('/buy-qr', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/register-item.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/register.html'));
});

app.get('/public-item.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/public-item.html'));
});

app.get('/success', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/success.html'));
});

app.get('/payment', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/payment.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/dashboard.html'));
});

app.get('/notifications', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/notifications.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        message: 'The requested resource was not found'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 NeoTrack server running on port ${PORT}`);
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`🔧 API: http://localhost:${PORT}/api`);
});
