# PDF Master Pro - Mobile App

Complete PDF toolkit for Android & iOS built with React Native.

## Features

- **12 PDF Tools**
  - Merge PDF - Combine multiple PDFs into one
  - Split PDF - Split PDF into separate files
  - Compress - Reduce PDF file size
  - Rotate - Rotate PDF pages
  - Protect - Add password protection
  - Unlock - Remove password protection
  - Watermark - Add text watermark
  - Page Numbers - Add page numbers
  - OCR - Extract text from images
  - Organize - Reorder and delete pages
  - JPG to PDF - Convert images to PDF
  - PDF to JPG - Convert PDF to images

- **100% Local Processing** - Your files never leave your device
- **Multi-language Support** - English, Arabic (RTL), French
- **Dark Mode** - Beautiful dark theme
- **Firebase Auth** - Secure authentication

## Tech Stack

- React Native 0.83
- TypeScript
- React Navigation 6
- Firebase Authentication
- AsyncStorage

## Project Structure

```
src/
├── screens/           # All app screens
│   ├── auth/         # Welcome, Login, SignUp
│   ├── main/         # Home, Tools, Settings
│   ├── tools/        # PDF tool screens
│   └── pages/        # Documents, Favorites
├── components/       # Reusable components
│   └── common/       # Button, Input, Card, etc.
├── navigation/       # App navigation setup
├── context/          # Auth, Theme, Language contexts
├── services/         # Firebase, PDF processing
├── constants/        # Colors, theme, tools config
├── i18n/             # Translations
└── types/            # TypeScript types
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Xcode 15+ (for iOS)
- Android Studio (for Android)
- CocoaPods (for iOS)

### Installation

```bash
# Clone the repository
git clone https://github.com/m55med/PDFMasterPro.git
cd PDFMasterPro
git checkout app

# Install dependencies
npm install

# Install iOS pods
cd ios && bundle exec pod install && cd ..
```

### Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com/
2. Add iOS and Android apps
3. Download config files:
   - iOS: `GoogleService-Info.plist` → `ios/PDFMasterPro/`
   - Android: `google-services.json` → `android/app/`
4. Enable Authentication methods:
   - Email/Password
   - Google Sign-In (optional)
   - Apple Sign-In (optional)

### Running the App

```bash
# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Security

- Firebase Auth only (no Firestore, no Cloud Functions)
- All PDF processing is local
- No data sent to servers
- Minimal permissions
- No API keys in code

## Scripts

```bash
npm start          # Start Metro bundler
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run lint       # Run ESLint
npm run test       # Run tests
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

---

Made with ❤️ for PDF lovers
