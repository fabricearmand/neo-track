# NeoTrack - Lost Item Recovery System

NeoTrack is a comprehensive lost item recovery system that uses QR codes to help reunite lost items with their owners.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Set Up Database
```bash
npm run init-db
```

### 3. Start the Server
```bash
npm start
# or for development
npm run dev
```

### 4. Access the Application
- **Frontend:** http://localhost:3000
- **API:** http://localhost:3000/api

## 📋 Features

### ✅ Core Features
- **User Authentication** - Login/Register system
- **QR Code Generation** - Create unique QR codes for items
- **Dashboard** - Manage your QR codes and view statistics
- **Public Scanning** - Anyone can scan QR codes to contact owners
- **Notifications** - Get notified when items are scanned
- **Item Registration** - Register valuable items with rewards

### ✅ Navigation Flow
1. **Home** (`/`) - Landing page with feature overview
2. **Login** (`/login`) - User authentication
3. **Register** (`/register`) - Create new account
4. **Dashboard** (`/dashboard`) - Main user interface
5. **Register Item** (`/register`) - Create QR codes for items
6. **Public Scan** (`/public-item.html?id=QR_CODE_ID`) - When QR is scanned

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### QR Codes
- `GET /api/qr-codes/user/:userId` - Get user's QR codes
- `GET /api/qr-codes/:qrCodeId` - Get specific QR code
- `POST /api/qr-codes` - Create new QR code
- `PUT /api/qr-codes/:qrCodeId` - Update QR code
- `DELETE /api/qr-codes/:qrCodeId` - Delete QR code
- `POST /api/qr-codes/:qrCodeId/scan` - Record QR code scan

### Notifications
- `GET /api/notifications/user/:userId` - Get user notifications
- `PUT /api/notifications/:notificationId/read` - Mark as read
- `PUT /api/notifications/user/:userId/read-all` - Mark all as read

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### QR Codes Table
```sql
CREATE TABLE qr_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    qr_code_id VARCHAR(255) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    item_description TEXT,
    reward_amount DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 🔑 Test Credentials

**Default Test User:**
- **Email:** `test@example.com`
- **Password:** `password123`

## 📱 How It Works

### For Item Owners:
1. **Register/Login** to your account
2. **Create QR Code** for your valuable item
3. **Print & Attach** the QR code to your item
4. **Get Notified** when someone scans your QR code
5. **Reunite** with your lost item

### For Finders:
1. **Scan QR Code** on found item
2. **View Owner Info** and contact details
3. **Contact Owner** via email, phone, or WhatsApp
4. **Return Item** and collect reward if offered

## 🛠️ Development

### Project Structure
```
backend/
├── pages/           # HTML pages
├── assets/          # CSS, JS, images
├── routes/          # API route handlers
├── config/          # Database configuration
├── init-db.js       # Database initialization
├── server.js        # Main server file
└── package.json     # Dependencies
```

### Key Files
- **server.js** - Express server setup and routing
- **init-db.js** - Database schema and test data
- **routes/auth.js** - Authentication endpoints
- **routes/qrCodes.js** - QR code management
- **assets/js/dashboard.js** - Dashboard functionality
- **assets/js/login.js** - Login form handling

## 🔧 Configuration

### Environment Variables
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=neotrack_db
JWT_SECRET=your-secret-key
PORT=3000
```

## 🚀 Deployment

1. **Set up MySQL database**
2. **Configure environment variables**
3. **Run database initialization:** `npm run init-db`
4. **Start server:** `npm start`

## 📝 License

MIT License - feel free to use this project for your own purposes.

---

**NeoTrack** - Making lost item recovery simple and secure! 🏷️
