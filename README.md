# E-Voting System Using Blockchain

A secure, transparent, and tamper-proof voting system built with React, Python Flask, and Solidity smart contracts.

## 📋 Project Overview

This e-voting system leverages blockchain technology to ensure:
- **Security**: Votes are encrypted and stored immutably on the blockchain
- **Transparency**: All transactions are publicly verifiable
- **Anonymity**: Voter identity is protected while maintaining vote integrity
- **Accessibility**: Vote from anywhere with internet access

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Tailwind CSS, Vite |
| Backend | Python Flask, SQLAlchemy |
| Blockchain | Solidity, Web3.py |
| Database | SQLite (dev) / MySQL (prod) |
| Authentication | JWT (JSON Web Tokens) |

## 📁 Project Structure

```
e-voting-system/
├── contracts/
│   └── Voting.sol          # Solidity smart contract
├── backend/
│   ├── app.py              # Flask application
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment variables template
└── frontend/
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── pages/          # Page components
    │   └── utils/          # API and context utilities
    ├── package.json
    └── vite.config.js
```

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file and configure
cp .env.example .env

# Run the server
python app.py
```

The backend will start at `http://localhost:5000`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start at `http://localhost:3000`

## 🔐 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@evoting.com | admin123 |

**⚠️ Change these credentials in production!**

## 📱 Features

### For Voters
- ✅ User registration with ID verification
- ✅ Secure login with JWT authentication
- ✅ View active elections
- ✅ Cast votes securely
- ✅ View election results after voting ends
- ✅ Profile management

### For Administrators
- ✅ Create and manage elections
- ✅ Add candidates to elections
- ✅ Verify voter identities
- ✅ Activate/deactivate elections
- ✅ View all users and their status

## 🗳️ How Voting Works

1. **Register**: Create an account with your official ID
2. **Get Verified**: Admin verifies your identity
3. **Vote**: Select your candidate during active election
4. **Confirm**: Your vote is recorded on the blockchain
5. **Results**: View results after election ends

## 🔗 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/update-profile` | Update profile |

### Elections
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/elections` | Get all elections |
| GET | `/api/elections/:id` | Get election by ID |
| POST | `/api/elections` | Create election (admin) |
| POST | `/api/elections/:id/vote` | Cast vote |
| GET | `/api/elections/:id/results` | Get results |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | Get all users |
| POST | `/api/admin/verify-voter/:id` | Verify voter |

## 🔧 Smart Contract

The Voting.sol smart contract includes:

- Election creation and management
- Candidate registration
- Vote casting with one-vote-per-person enforcement
- Real-time vote counting
- Winner determination after election ends

### Deploy Contract (Using Hardhat)

```bash
# Install Hardhat
npm install --save-dev hardhat

# Compile contract
npx hardhat compile

# Deploy to local network
npx hardhat run scripts/deploy.js --network localhost
```

## 🛡️ Security Features

1. **Password Hashing**: bcrypt for secure password storage
2. **JWT Tokens**: Secure session management
3. **Role-Based Access**: Admin and voter role separation
4. **Vote Encryption**: Votes are encrypted on blockchain
5. **One Vote Per Person**: Smart contract enforces single vote
6. **Audit Trail**: All votes are permanently recorded

## 🎨 Screenshots

### Home Page
- Modern landing page with feature highlights
- How it works section
- Call-to-action buttons

### Elections Page
- Grid view of all elections
- Status badges (Active, Upcoming, Ended)
- Vote and view details buttons

### Voting Page
- Candidate selection with radio buttons
- Confirmation modal before voting
- Success feedback after voting

### Admin Panel
- Elections management
- User verification
- Candidate management

## 🔄 Future Enhancements

- [ ] Aadhar/ID API integration for verification
- [ ] Mobile application (React Native)
- [ ] Multi-language support
- [ ] Real blockchain deployment (Ethereum/Polygon)
- [ ] Biometric authentication
- [ ] Email notifications

## 📄 License

This project is created for educational purposes.

---

**Project By**: Atharva Rajesh Nandvidkar  
**Institution**: Nirmala Memorial Foundation College  
**Academic Year**: 2024-2025
