# PDF Master Pro Mobile App

A comprehensive React Native mobile application for professional PDF processing with beautiful UI/UX, inspired by ilovepdf.

## 🎯 Features

### Core PDF Tools (Offline)
- ✅ **Merge PDF** - Combine multiple PDFs into one
- ✅ **Split PDF** - Extract pages or split into multiple files
- ✅ **Compress PDF** - Reduce file size
- ✅ **JPG to PDF** - Convert images to PDF
- ✅ **PDF to JPG** - Extract pages as images
- ✅ **Rotate Pages** - Rotate pages in any direction
- ✅ **Organize Pages** - Reorder, remove, or duplicate pages
- ✅ **Page Numbers** - Add custom page numbers
- ✅ **Protect PDF** - Add password protection
- ✅ **Unlock PDF** - Remove password protection
- ✅ **Watermark** - Add text or image watermarks

### Premium Features (Cloud)
- ⚡ **OCR Text** - Extract text from scanned documents
- ⚡ **Advanced Compression** - Server-side heavy compression
- ☁️ **Cloud Sync** - Sync files across devices (up to 20GB)

### Other Features
- 📱 100% Offline processing for core features
- 🎨 Beautiful, modern UI with dark mode support
- 🔒 Privacy-first: Files never leave your device (offline mode)
- 📊 File management with search and filters
- 🌍 Multi-language support
- 💎 Freemium model with in-app subscriptions

## 🏗️ Tech Stack

- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **State Management**: Zustand
- **Navigation**: React Navigation v6
- **PDF Processing**: react-native-pdf-lib, expo-file-system
- **Authentication**: Firebase Auth
- **Backend**: Firebase (Functions, Firestore, Storage)
- **Payments**: RevenueCat
- **UI**: Custom components with modern design system

## 📁 Project Structure

```
mobile-app/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── common/       # Button, Card, Input
│   │   ├── pdf/          # PDF-specific components
│   │   ├── tools/        # Tool cards and UI
│   │   └── subscription/ # Paywall, plans
│   ├── navigation/       # Navigation setup
│   ├── screens/          # All app screens
│   │   ├── home/         # Home screen
│   │   ├── tools/        # Tool screens
│   │   ├── files/        # File management
│   │   ├── settings/     # Settings
│   │   └── premium/      # Subscription
│   ├── services/         # Business logic
│   │   ├── pdf/          # PDF operations
│   │   ├── storage/      # File management
│   │   ├── subscription/ # Payment handling
│   │   └── analytics/    # Analytics
│   ├── store/            # State management
│   ├── theme/            # Design system
│   ├── utils/            # Helpers
│   └── types/            # TypeScript types
├── App.tsx
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (macOS) or Android Emulator

### Installation

```bash
# Install dependencies
cd mobile-app
npm install

# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web (for testing)
npm run web
```

## 📱 Running on Device

### iOS
1. Install Expo Go from App Store
2. Scan QR code from terminal

### Android
1. Install Expo Go from Play Store
2. Scan QR code from terminal

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project at https://console.firebase.google.com
2. Add iOS and Android apps
3. Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
4. Place them in the appropriate directories
5. Update `app.json` with Firebase config

### RevenueCat Setup
1. Create account at https://www.revenuecat.com
2. Set up products in App Store Connect / Google Play Console
3. Configure products in RevenueCat dashboard
4. Add API keys to app config

## 💰 Subscription Plans

### Free Plan
- Basic PDF tools
- 5 files per day
- Max 10MB per file
- Ads supported

### Pro Monthly ($4.99/month)
- All PDF tools
- Unlimited files
- Max 100MB per file
- No ads
- Cloud sync (5GB)
- OCR & Advanced tools

### Pro Yearly ($39.99/year)
- All Pro features
- Save 33%
- Cloud sync (20GB)
- Priority support

## 🧪 Testing

```bash
# Run tests
npm test

# Run linter
npm run lint

# Type check
npm run type-check
```

## 📦 Building for Production

### iOS
```bash
# Build for App Store
expo build:ios

# Or using EAS
eas build --platform ios
```

### Android
```bash
# Build APK/AAB
expo build:android

# Or using EAS
eas build --platform android
```

## 🔐 Privacy & Security

- ✅ 100% offline processing (no file uploads for core features)
- ✅ Optional cloud sync (user controlled)
- ✅ Encrypted local storage
- ✅ GDPR & CCPA compliant
- ✅ Clear privacy policy

## 📊 Analytics

The app tracks the following events:
- Tool usage
- Subscription conversions
- User engagement
- Crash reports

## 🤝 Contributing

This is a private project. For issues or feature requests, please contact the team.

## 📄 License

Proprietary - All rights reserved

## 📞 Support

- Email: support@pdfmasterpro.app
- Website: https://pdfmasterpro.app

---

Made with ❤️ by PDF Master Pro Team
