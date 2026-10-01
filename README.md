# 💸 SplitMate - Modern Expense Sharing Application

**SplitMate** is a full-stack, production-ready expense-sharing application inspired by Splitwise UX. It allows friends, roommates, and travel groups to sign in with Google accounts, create groups, add friends, record shared expenses with custom splits, calculate balances dynamically, and settle debts with simplified transaction minimization.

---

## 🌟 Features

- **Real Google OAuth 2.0 Authentication**: Seamless Sign-In with Google account and session JWT verification.
- **Sleek Modern UI/UX**: Inspired by financial mobile applications with rounded cards, emerald primary accents, status indicators (Green = Owed, Red = Owes, Gray = Settled), and responsive desktop sidebar + mobile bottom navigation.
- **Dynamic Debt Settlement Engine**: Implements a greedy minimum-transfers algorithm to simplify group debts into the minimum required transactions.
- **Expense Splitting Modes**: Supports **Equal (=)**, **Exact Amounts (₹)**, and **Percentage (%)** splits with automatic validation.
- **Friends & Request System**: Search friends by Google email, manage pending requests, view 1-on-1 balances, and settle debts.
- **Group Expense Management**: Create groups (Trips, Apartment, Couples), view group balances, individual member shares, and expense history.
- **Settlement Recording**: Settle up debts without deleting expense history — records dedicated settlement entries in MongoDB.
- **Real-Time Activity Feed**: Activity timeline logging expense additions, updates, settlements, and friend requests.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS (Emerald/Brand Theme, soft glassmorphism, responsive grid)
- **Icons**: Lucide React
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios with JWT Request/Response Interceptors
- **Auth**: `@react-oauth/google`

### **Backend**
- **Runtime**: Java 17 / Java 25 LTS
- **Framework**: Spring Boot 3.2
- **Security**: Spring Security 6 (Stateless JWT + OAuth 2.0 Client/Resource verification)
- **Database**: Spring Data MongoDB (MongoDB Atlas ready)
- **Architecture**: Controller-Service-Repository pattern with DTO separation and Global Exception Handling.

---

## 📁 Project Structure

```
splitmate/
├── backend/
│   ├── src/main/java/com/splitmate/
│   │   ├── config/             # Security, CORS, DataInitializer
│   │   ├── controller/         # Auth, Friends, Groups, Expenses, Settlements, Dashboard
│   │   ├── dto/                # UserDto, ExpenseDto, GroupBalanceDto, etc.
│   │   ├── exception/          # GlobalExceptionHandler, ResourceNotFoundException
│   │   ├── model/              # User, Group, Expense, Settlement, FriendRequest, Activity
│   │   ├── repository/         # Spring Data MongoDB Repositories
│   │   ├── security/           # JwtTokenProvider, JwtAuthenticationFilter, GoogleTokenVerifier
│   │   └── service/            # Business Logic & SettlementEngineService (Min-Transfers)
│   ├── src/main/resources/
│   │   └── application.yml     # Application configuration
│   └── pom.xml                 # Maven project configuration
├── frontend/
│   ├── src/
│   │   ├── components/         # Navbar, Sidebar, BottomNavigation, Modals (AddExpense, SettleUp, etc.)
│   │   ├── context/            # AuthContext (Google Auth & Session Management)
│   │   ├── pages/              # Dashboard, Friends, Groups, GroupDetail, Activity, Account, Login
│   │   ├── services/           # Axios API Client
│   │   ├── App.jsx             # React Routes & Navigation layout
│   │   └── main.jsx            # React root entry
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
├── .env.example                # Environment variables template
└── README.md
```

---

## 🚀 Local Development Setup

### **Prerequisites**
- Java 17+ installed (`java -version`)
- Apache Maven installed (`mvn -v`)
- Node.js 18+ & npm installed (`node -v`)
- MongoDB running locally on port `27017` or a MongoDB Atlas Connection String.

### **1. Backend Setup**
```bash
cd backend

# Compile project
mvn clean compile

# Run Spring Boot backend server (runs on http://localhost:8080)
mvn spring-boot:run
```

### **2. Frontend Setup**
```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server (runs on http://localhost:5173)
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## ☁️ Deployment Guide

### **1. Database: MongoDB Atlas**
1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and copy your connection string:
   `mongodb+srv://<user>:<password>@cluster.mongodb.net/splitmate?retryWrites=true&w=majority`

### **2. Backend: Railway / Render**
1. Connect your repository to **Railway** or **Render**.
2. Set Root Directory to `backend/`.
3. Configure Environment Variables:
   - `SPRING_DATA_MONGODB_URI`: Your MongoDB Atlas URI
   - `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
   - `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret
   - `JWT_SECRET`: Random 256-bit secret string
   - `CORS_ALLOWED_ORIGINS`: Your Vercel frontend URL

### **3. Frontend: Vercel**
1. Import repository into **Vercel**.
2. Set Root Directory to `frontend/`.
3. Set Build Command to `npm run build` and Output Directory to `dist`.
4. Configure Environment Variables:
   - `VITE_API_BASE_URL`: Your deployed backend API URL (e.g. `https://splitmate-api.up.railway.app/api`)
   - `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
