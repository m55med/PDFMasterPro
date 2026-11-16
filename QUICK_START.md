# 🚀 Quick Start Guide - PDF Master Pro

Get up and running in 5 minutes!

---

## 📱 Mobile App Setup

### 1. Install Dependencies
```bash
cd mobile-app
npm install
```

### 2. Start Development Server
```bash
npm start
```

### 3. Run on Device/Emulator

**iOS:**
```bash
npm run ios
# Or press 'i' in the terminal
```

**Android:**
```bash
npm run android
# Or press 'a' in the terminal
```

**Physical Device:**
1. Install **Expo Go** from App Store / Play Store
2. Scan QR code from terminal

---

## ☁️ Backend Setup

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### 2. Create Firebase Project
1. Go to https://console.firebase.google.com
2. Click "Add project"
3. Name it "pdf-master-pro"
4. Enable Google Analytics (optional)

### 3. Initialize Firebase
```bash
cd backend
firebase init

# Select:
# - Functions (JavaScript/TypeScript)
# - Firestore
# - Storage
# - Emulators

# Choose:
# - Existing project: pdf-master-pro
# - Language: TypeScript
# - ESLint: Yes
# - Install dependencies: Yes
```

### 4. Start Emulators (Local Testing)
```bash
cd backend
npm install
npm run serve

# This starts:
# - Functions: http://localhost:5001
# - Firestore: http://localhost:8080
# - Storage: http://localhost:9199
# - UI: http://localhost:4000
```

### 5. Deploy to Production
```bash
firebase deploy
```

---

## 🔧 Configuration

### Mobile App Config

1. **Update app.json**
```json
{
  "expo": {
    "extra": {
      "firebase": {
        "apiKey": "YOUR_API_KEY",
        "authDomain": "YOUR_AUTH_DOMAIN",
        "projectId": "YOUR_PROJECT_ID"
      }
    }
  }
}
```

2. **Add Firebase Config Files**
- iOS: Download `GoogleService-Info.plist` → place in `mobile-app/`
- Android: Download `google-services.json` → place in `mobile-app/`

### Backend Config

1. **Set Environment Variables**
```bash
firebase functions:config:set revenuecat.api_key="YOUR_KEY"
firebase functions:config:set app.url="https://pdfmasterpro.app"
```

2. **Deploy Security Rules**
```bash
firebase deploy --only firestore:rules,storage:rules
```

---

## 🧪 Testing

### Run Mobile App Tests
```bash
cd mobile-app
npm test
```

### Test Firebase Functions Locally
```bash
cd backend
npm run serve

# In another terminal:
curl http://localhost:5001/pdf-master-pro/us-central1/checkUsageLimits
```

---

## 📦 Next Steps

### 1. Implement PDF Processing
Currently using placeholders. Install actual libraries:
```bash
cd mobile-app
npm install react-native-pdf-lib
# or
npm install @react-native-pdf/pdf-lib
```

Then update:
- `/mobile-app/src/services/pdf/merge.ts`
- `/mobile-app/src/services/pdf/split.ts`
- `/mobile-app/src/services/pdf/compress.ts`

### 2. Setup RevenueCat
1. Create account: https://www.revenuecat.com
2. Add your app (iOS & Android)
3. Configure products
4. Install SDK:
```bash
cd mobile-app
npm install react-native-purchases
```

5. Update: `/mobile-app/src/services/subscription/SubscriptionService.ts`

### 3. Add Icons
Replace emoji placeholders:
```bash
cd mobile-app
npm install @expo/vector-icons
```

### 4. Complete Remaining Screens
Use `/mobile-app/src/screens/tools/MergePDFScreen.tsx` as template for:
- JPG to PDF
- PDF to JPG
- Rotate, Organize
- Watermark, etc.

---

## 🐛 Troubleshooting

### Issue: "Metro bundler not starting"
```bash
cd mobile-app
npx expo start --clear
```

### Issue: "Firebase deployment fails"
```bash
firebase login --reauth
firebase use --add
```

### Issue: "Android build fails"
```bash
cd mobile-app/android
./gradlew clean
cd ..
npm run android
```

### Issue: "iOS pods not found"
```bash
cd mobile-app/ios
pod install
cd ..
npm run ios
```

---

## 📚 Useful Commands

### Mobile App
```bash
npm start          # Start dev server
npm run ios        # Run on iOS
npm run android    # Run on Android
npm run web        # Run on web (testing)
npm test           # Run tests
npm run lint       # Run linter
```

### Backend
```bash
npm run build      # Compile TypeScript
npm run serve      # Start emulators
npm run deploy     # Deploy to Firebase
npm run logs       # View function logs
```

---

## 🎯 Development Workflow

1. **Start Backend Emulators**
```bash
cd backend
npm run serve
```

2. **Start Mobile App** (new terminal)
```bash
cd mobile-app
npm start
```

3. **Make Changes**
- Edit files in `mobile-app/src/`
- Changes hot-reload automatically

4. **Test**
- Use Expo Go on physical device
- Or use iOS Simulator / Android Emulator

5. **Commit & Deploy**
```bash
git add .
git commit -m "feat: add new feature"
git push

# Deploy backend
cd backend
firebase deploy
```

---

## 🆘 Need Help?

- 📖 Read [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)
- 📱 Check [mobile-app/README.md](mobile-app/README.md)
- ☁️ Check [backend/README.md](backend/README.md)
- 🔍 Search [Stack Overflow](https://stackoverflow.com)
- 💬 Ask the team

---

## ✅ Pre-Launch Checklist

- [ ] All PDF tools implemented
- [ ] Firebase deployed
- [ ] RevenueCat configured
- [ ] App tested on iOS & Android
- [ ] Security rules reviewed
- [ ] Privacy policy added
- [ ] App store assets prepared
- [ ] Analytics configured
- [ ] Crash reporting enabled
- [ ] Beta testing completed

---

**Happy Coding! 🚀**

Made with ❤️ by PDF Master Pro Team
