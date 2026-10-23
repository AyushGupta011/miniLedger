#  MiniLedger

A full-stack personal finance application to track money lent to friends, monitor overdue balances, record repayments, and attach receipt photos.

Built with a **Node.js + Express + Prisma + PostgreSQL** backend and a cross-platform **React Native (Expo)** mobile application.

---

##  Architecture Overview

The repository is organized as a clean monorepo with two main packages:

```
miniledger/
├── backend/               # REST API & Database
│   ├── prisma/            # Prisma schema, migrations, and seeds
│   ├── src/               # Express app, routes, middleware, and validation
│   ├── tests/             # Unit tests (Jest + ts-jest)
│   ├── docker-compose.yml # PostgreSQL database container
│   └── uploads/           # Stored receipt photos
└── app/                   # React Native Mobile App
    ├── assets/            # App icons, splash screens
    ├── src/
    │   ├── components/    # Reusable UI elements (cards, list items, screens)
    │   ├── screens/       # Login, Home (Ledger Dashboard), and Add Loan Modal
    │   └── api.ts         # Secure HTTP client & multipart uploads
    └── App.tsx            # Main application entry point & authentication gate
```

### Tech Stack

- **Backend:** Node.js (v18+), TypeScript, Express, Prisma ORM, PostgreSQL (Docker), JWT, Zod, Multer, Jest.
- **Frontend:** React Native, Expo (SDK 57), TypeScript, Expo SecureStore, Expo ImagePicker, React Native Safe Area Context.

---

##  Prerequisites

Before running the application locally, ensure you have the following installed:

1. **[Node.js](https://nodejs.org/)** (v18.0.0 or higher recommended, e.g. Node 18, 20, or 22).
2. **[Docker & Docker Compose](https://www.docker.com/)** (for running the PostgreSQL database container).
3. **[npm](https://www.npmjs.com/)** (packaged automatically with Node.js).
4. **For Mobile Testing (Choose one or more):**
   - **Physical Device:** Install the free **Expo Go** app from [Google Play (Android)](https://play.google.com/store/apps/details?id=host.exp.exponent) or [App Store (iOS)](https://apps.apple.com/app/expo-go/id982107779). *(Must be connected to the same Wi-Fi network as your computer)*.
   - **Android Emulator:** Installed via Android Studio.
   - **iOS Simulator:** Installed via Xcode (macOS only).
   - **Web Browser:** Run directly in Chrome/Edge/Safari.

---

##  Quick Start Guide (TL;DR)

Open two separate terminal windows or tabs:

### Terminal 1: Backend
```bash
cd backend
cp .env.example .env
docker compose up -d
npm install
npx prisma migrate deploy
npm run dev
```
> Backend runs at: `http://localhost:3000`

### Terminal 2: Frontend App
```bash
cd app
cp .env.example .env
npm install
npm start
```
> Scan the displayed QR code with your phone (Expo Go / Camera app) or press <kbd>a</kbd> for Android / <kbd>w</kbd> for Web.

---

## 🛠️ Step-by-Step Local Installation

### Part 1: Setting Up the Backend

#### 1. Navigate to the backend directory
```bash
cd backend
```

#### 2. Create the environment file
Copy `.env.example` to create your local `.env`:
```bash
# On macOS / Linux / Git Bash:
cp .env.example .env

# On Windows PowerShell:
Copy-Item .env.example .env

# On Windows Command Prompt:
copy .env.example .env
```

Your default `.env` will look like this:
```env
PORT=3000
DATABASE_URL=postgres://miniledger:miniledger@localhost:5433/miniledger
JWT_SECRET=change-me-to-a-long-random-string
```
*(Note: `docker-compose.yml` maps container port 5432 to host port **5433** to avoid conflicts with any existing local PostgreSQL installations).*

#### 3. Start the PostgreSQL Database
Launch the PostgreSQL 16 container in the background:
```bash
docker compose up -d
```
To verify the database container is running:
```bash
docker compose ps
```

#### 4. Install Dependencies
```bash
npm install
```
*(This automatically installs all npm packages and triggers `prisma generate` to compile the Prisma Client).*

#### 5. Apply Database Migrations
Deploy the database schema and tables to PostgreSQL:
```bash
npx prisma migrate deploy
```
*(Alternatively, run `npm run migrate`).*

#### 6. Start the Backend Server
Start the development server with live reload:
```bash
npm run dev
```
You should see:
```text
MiniLedger API on http://localhost:3000
```

#### 7. Verify the Backend is Running
Check the health status endpoint in your browser or terminal:
```bash
curl http://localhost:3000/health
# Response: {"ok":true}
```

#### 8. (Optional) Inspect the Database with Prisma Studio
To visually browse users, OTP records, and loans:
```bash
npm run studio
# Opens Prisma Studio at http://localhost:5555
```

#### 9. Run Unit Tests
```bash
npm test
```

---

### Part 2: Setting Up the Frontend Mobile App

#### 1. Navigate to the app directory
In a new terminal window:
```bash
cd app
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Configure the Backend API URL
Create your `.env` file from the provided template:
```bash
# On macOS / Linux / Git Bash:
cp .env.example .env

# On Windows PowerShell:
Copy-Item .env.example .env

# On Windows Command Prompt:
copy .env.example .env
```

Open `app/.env` and configure `EXPO_PUBLIC_API_URL` based on how you are testing the app:

| Testing Method | Value in `app/.env` | Explanation |
|---|---|---|
| **Physical Phone (Expo Go)** | `http://<YOUR_LOCAL_IP>:3000` | E.g. `http://192.168.1.9:3000`. Phone and computer **must be on the same Wi-Fi network**. |
| **Android Emulator** | `http://10.0.2.2:3000` | Android emulators use `10.0.2.2` to refer to the host machine's `localhost`. |
| **iOS Simulator** | `http://localhost:3000` | iOS simulator runs directly on macOS host loopback. |
| **Web Browser** | `http://localhost:3000` | Browser runs locally on host. |

> 💡 **Finding your Computer's Local IP Address:**
> - **Windows:** Run `ipconfig` in Command Prompt / PowerShell. Look for **IPv4 Address** under your active Wi-Fi connection (e.g., `192.168.1.X`).
> - **macOS:** System Settings > Wi-Fi > Details, or run `ipconfig getifaddr en0` in Terminal.
> - **Linux:** Run `hostname -I` or `ip addr show`.

#### 4. Start the Expo Development Server
```bash
npm start
```
*(or `npx expo start`)*

#### 5. Open the App on Your Device

- **Physical Device (Expo Go):**
  - Open **Expo Go** on Android and tap **"Scan QR code"**.
  - On iOS, open the system **Camera app** and point it at the QR code, then tap the Expo notification.
- **Android Emulator:**
  - Press <kbd>a</kbd> in the terminal running Expo (or run `npm run android`).
- **iOS Simulator (macOS only):**
  - Press <kbd>i</kbd> in the terminal running Expo (or run `npm run ios`).
- **Web Browser:**
  - Press <kbd>w</kbd> in the terminal running Expo (or run `npm run web`).

---

## 📱 User Flow & How to Use the App

### 1. Passwordless OTP Login
1. Enter your phone number (e.g. `+919876543210`) on the Login screen and tap **Send OTP**.
2. **Find the Mock OTP:** Since this application uses a simulated SMS service for local testing, look at the **backend terminal window**. You will see a log entry:
   ```text
   [MOCK OTP] Phone: +919876543210, OTP: 123456
   ```
3. Enter the 6-digit OTP into the app and tap **Verify & Continue**.
4. The backend verifies the HMAC hash, generates a JWT token, and the mobile app securely stores it using `expo-secure-store`.

### 2. Dashboard & Summary
- Once logged in, the **Home Screen** shows summary cards:
  - **Total Lent:** Sum of all active and repaid loans.
  - **Total Repaid:** Sum of loans marked as repaid.
  - **Outstanding:** Remaining money owed to you (`Total Lent - Total Repaid`).
  - **Overdue:** Amount where the due date is in the past and the loan remains unpaid.
- Switch between **Pending** and **Repaid** tabs to view corresponding loans.

### 3. Adding a Loan
1. Tap the **+ Add Loan** button on the Home screen.
2. Enter the **Friend's Name** (e.g., *Alex*).
3. Enter the **Amount** (e.g., *250.00*).
4. Select the **Due Date** using the native datepicker modal.
5. Tap **Create Loan**. The dashboard metrics immediately update.

### 4. Marking a Loan as Repaid
- In the **Pending** tab, tap **Mark Repaid** on any loan item.
- The status changes to `REPAID`, and the loan moves to the **Repaid** tab with an atomic database update.

### 5. Attaching a Receipt
- Tap **Attach Receipt** (or **Change Receipt**) on a loan card.
- Choose whether to take a photo with the camera or pick an image from your photo library.
- The image is uploaded as a multipart form to `backend/uploads/` and linked to the loan.
- Tap **View Receipt** to inspect the attached receipt.

---

## 📡 API Reference & cURL Testing

All `/loans*` endpoints require an `Authorization: Bearer <TOKEN>` header.

| Method | Endpoint | Request Body | Description |
|---|---|---|---|
| `GET` | `/health` | *None* | Health check (`{"ok": true}`) |
| `POST` | `/auth/request-otp` | `{"phone": "+919876543210"}` | Generates 6-digit OTP, prints to backend log |
| `POST` | `/auth/verify-otp` | `{"phone": "+919876543210", "otp": "123456"}` | Returns `{ token: "..." }`; creates user on first login |
| `POST` | `/loans` | `{"friendName": "Rahul", "amount": 500, "dueDate": "2026-11-01"}` | Creates a new loan entry |
| `GET` | `/loans` | *None* | Lists all loans for the authenticated user |
| `GET` | `/loans/summary` | *None* | Returns `{ totalLent, totalRepaid, outstanding, overdueAmount }` |
| `PATCH` | `/loans/:id/repay` | *None* | Marks a loan as repaid |
| `POST` | `/loans/:id/receipt` | Multipart field `receipt` (image file) | Uploads and links a receipt photo to the loan |

### Quick cURL Test Script

```bash
# 1. Request OTP
curl -X POST http://localhost:3000/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"+919876543210"}'

# 2. Check backend console for [MOCK OTP], then verify:
curl -X POST http://localhost:3000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"+919876543210","otp":"<OTP_FROM_CONSOLE>"}'

# 3. Save the returned token:
export TOKEN="<PASTE_TOKEN_HERE>"

# 4. Create a loan:
curl -X POST http://localhost:3000/loans \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"friendName":"Rahul","amount":750.50,"dueDate":"2026-11-15"}'

# 5. Fetch financial summary:
curl -X GET http://localhost:3000/loans/summary \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🗄️ Database Schema

The database uses PostgreSQL with Prisma ORM:

```mermaid
erDiagram
    User ||--o{ Loan : owns
    User {
        uuid id PK
        string phone UK
        timestamp created_at
    }
    Otp {
        uuid id PK
        string phone
        string code_hash
        timestamp expires_at
        timestamp used_at
        int attempts
        timestamp created_at
    }
    Loan {
        uuid id PK
        uuid user_id FK
        string friend_name
        decimal amount
        date due_date
        enum status
        timestamp repaid_at
        string receipt_url
        timestamp created_at
    }
```

- **Money Safety:** Stored as `Decimal(12, 2)` to eliminate floating-point rounding errors.
- **OTP Security:** Hashed with HMAC-SHA256, 5-minute expiry, single-use check, and locked after 5 failed attempts.
- **Data Isolation:** User ID is extracted from the verified JWT; all database queries enforce tenant isolation.
- **Concurrency Safety:** Repayments use atomic updates (`where: { id, status: PENDING }`) preventing double repayments.

---

## 🔧 Useful Scripts Reference

### Backend (`cd backend`)
| Script | Command | Description |
|---|---|---|
| Dev Server | `npm run dev` | Runs backend with `ts-node-dev` on port 3000 |
| Build | `npm run build` | Compiles Prisma client and TypeScript to `dist/` |
| Start Prod | `npm start` | Runs compiled JavaScript from `dist/` |
| Deploy Migration | `npm run migrate` | Runs `prisma migrate deploy` |
| Dev Migration | `npm run migrate:dev` | Creates new migration from schema changes |
| Prisma Studio | `npm run studio` | Interactive database GUI at `http://localhost:5555` |
| Unit Tests | `npm test` | Runs Jest unit tests |

### Frontend App (`cd app`)
| Script | Command | Description |
|---|---|---|
| Start Bundler | `npm start` | Starts Metro bundler with interactive CLI |
| Android | `npm run android` | Starts Metro bundler and launches Android emulator |
| iOS | `npm run ios` | Starts Metro bundler and launches iOS simulator |
| Web | `npm run web` | Starts Metro bundler and opens web browser |
| Clear Cache | `npx expo start -c` | Starts bundler after clearing Metro cache |

---

## ❓ Troubleshooting & FAQs

### 1. The mobile app says *"Cannot reach the server at http://..."*
- **Check Backend:** Ensure the backend is running (`curl http://localhost:3000/health`).
- **Physical Device:** If running on a physical phone via Expo Go:
  - Do **NOT** use `localhost` or `127.0.0.1` in `app/.env`. Use your computer's local Wi-Fi IP (e.g. `http://192.168.1.X:3000`).
  - Make sure your phone and computer are on the **exact same Wi-Fi network**.
  - **Firewall:** Windows Defender Firewall or macOS firewall might block inbound port 3000. Temporarily allow Node.js through your firewall or allow port 3000.
- **Android Emulator:** Use `http://10.0.2.2:3000` (Android's internal alias to the host machine).

### 2. Database connection error when running migrations
- Verify Docker is running: `docker compose ps`
- Note the port: Docker Compose maps container port 5432 to host port **5433**. Ensure `DATABASE_URL` in `backend/.env` uses port `5433`:
  ```env
  DATABASE_URL=postgres://miniledger:miniledger@localhost:5433/miniledger
  ```

### 3. Changes to `app/.env` are not taking effect
- Stop Expo in your terminal (<kbd>Ctrl</kbd> + <kbd>C</kbd>).
- Restart with cache cleared:
  ```bash
  npx expo start -c
  ```

### 4. How to stop or restart the database container
```bash
# Stop the database
docker compose down

# Restart the database
docker compose restart

# Stop and delete database volumes (reset data)
docker compose down -v
```

---

## 📄 License

This project is licensed under the [MIT License](app/LICENSE).
