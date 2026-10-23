# MiniLedger – Mobile App

A clean, modern mobile ledger built with **React Native** and **Expo (SDK 57)** for tracking money lent to friends, managing repayments, viewing debt summaries, and attaching payment receipt photos.

---

## Features

- **Passwordless OTP Login:** Simple phone number authentication using mock OTP.
- **Financial Summary Cards:** Real-time visibility into Total Lent, Total Repaid, Pending / Outstanding, and Overdue amounts.
- **Loan Tracking:** List loans with overdue status indicators and due date formatting.
- **Add Loan Modal:** Easily input friend's name, loan amount, and choose a due date with a native datepicker.
- **Repayment Action:** Mark loans as repaid with atomic updates.
- **Receipt Attachment:** Take or select a receipt photo using the camera or gallery, uploaded as multipart/form-data.
- **Secure Token Storage:** JWT tokens are persisted safely across app restarts via `expo-secure-store`.

---

## Prerequisites

- **Node.js** (v18 or later recommended)
- **npm** (comes with Node.js)
- **Expo Go** app installed on your physical Android or iOS device:
  - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
  - [Apple App Store](https://apps.apple.com/app/expo-go/id982107779)
  - *OR* an **Android Emulator** (via Android Studio) / **iOS Simulator** (macOS only via Xcode).

---

## Setup & Local Installation

### 1. Install Dependencies

From the `app` directory:

```bash
cd app
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `app/` directory by copying the example:

```bash
cp .env.example .env
```

Set `EXPO_PUBLIC_API_URL` according to how you plan to run the app:

| Target Environment | `EXPO_PUBLIC_API_URL` Value | Notes |
|---|---|---|
| **Physical Phone (Expo Go)** | `http://<YOUR_LOCAL_IP>:3000` *(e.g. `http://192.168.1.9:3000`)* | Your phone and computer **must** be on the same Wi-Fi network. Do not use `localhost`. |
| **Android Emulator** | `http://10.0.2.2:3000` | `10.0.2.2` is Android's special alias to host loopback. |
| **iOS Simulator** | `http://localhost:3000` | macOS shares localhost with the simulator. |
| **Web Browser** | `http://localhost:3000` | Direct browser localhost connection. |

> **How to find your local IP address:**
> - **Windows:** Run `ipconfig` in Command Prompt / PowerShell, find IPv4 Address under your active Wi-Fi adapter.
> - **macOS / Linux:** Run `ifconfig` or `ip a` (look for `en0` or `wlan0` IP).

---

## Running the App

Start the Expo development server:

```bash
npm start
```
*(or `npx expo start`)*

### Opening on your device / emulator:

- **Physical Phone (Expo Go):** Scan the QR code shown in the terminal using the **Expo Go** app (Android) or the default **Camera app** (iOS).
- **Android Emulator:** Press <kbd>a</kbd> in the terminal or run `npm run android`.
- **iOS Simulator:** Press <kbd>i</kbd> in the terminal or run `npm run ios` (macOS only).
- **Web Browser:** Press <kbd>w</kbd> in the terminal or run `npm run web`.

---

## App Scripts

| Command | Action |
|---|---|
| `npm start` | Starts the Expo dev server and QR code |
| `npm run android` | Starts dev server and opens Android emulator |
| `npm run ios` | Starts dev server and opens iOS simulator |
| `npm run web` | Starts dev server in the web browser |
| `npx expo start -c` | Starts dev server with cleared bundler cache |

---

## Project Structure

```
app/
├── assets/                  # App icons and splash images
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── LoanItem.tsx     # Single loan list item with actions & receipt upload
│   │   ├── Screen.tsx       # Safe area wrapper component
│   │   └── SummaryCard.tsx  # Metric card component (Lent, Repaid, Overdue)
│   ├── screens/             # Primary screens
│   │   ├── AddLoanScreen.tsx# Modal for adding new loan with date picker
│   │   ├── HomeScreen.tsx   # Dashboard with metrics, filter tabs, & loan list
│   │   └── LoginScreen.tsx  # Phone OTP login flow
│   ├── api.ts               # Backend API client, token handling, receipt upload
│   ├── config.ts            # API_URL environment configuration
│   ├── format.ts            # Date and currency formatting utilities
│   └── types.ts             # TypeScript interfaces for Loan, Summary, etc.
├── App.tsx                  # Root app component with auth state & routing
├── app.json                 # Expo configuration & plugins
├── package.json             # Dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

---

## Troubleshooting

- **"Cannot reach the server at http://..."**
  - Verify that the backend is running (`curl http://localhost:3000/health`).
  - If using a physical phone with Expo Go, ensure both your phone and laptop are on the same Wi-Fi network.
  - Verify your computer's local IP address and make sure it is updated in `app/.env`.
  - Check your computer's firewall settings to ensure incoming connections on port 3000 are not blocked.
- **Expo bundler caching old code / env variables:**
  - Stop the server (<kbd>Ctrl</kbd> + <kbd>C</kbd>) and run `npx expo start -c` to clear the cache.
