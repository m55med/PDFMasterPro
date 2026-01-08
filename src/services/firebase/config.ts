// PDF Master Pro - Firebase Configuration
// NOTE: This file contains placeholder configuration.
// You need to replace these values with your actual Firebase project credentials.

/**
 * Firebase Setup Instructions:
 *
 * 1. Go to https://console.firebase.google.com/
 * 2. Create a new project or select existing one
 * 3. Add iOS and Android apps to your project
 * 4. Download configuration files:
 *    - iOS: GoogleService-Info.plist → place in ios/PDFMasterPro/
 *    - Android: google-services.json → place in android/app/
 * 5. Enable Authentication methods:
 *    - Email/Password
 *    - Google Sign-In (optional)
 *    - Apple Sign-In (optional, iOS only)
 *
 * IMPORTANT: Do NOT enable services you don't need:
 * ❌ Firestore
 * ❌ Realtime Database
 * ❌ Cloud Functions
 * ❌ Anonymous Auth
 *
 * Firebase Auth is used ONLY for user identity.
 * All PDF processing happens locally on device.
 */

export const FIREBASE_CONFIG = {
  // These values are placeholders
  // Real values come from google-services.json and GoogleService-Info.plist
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

// Auth configuration
export const AUTH_CONFIG = {
  // Minimum password length
  minPasswordLength: 8,

  // Require email verification
  requireEmailVerification: true,

  // Enable social sign-in
  enableGoogleSignIn: true,
  enableAppleSignIn: true,

  // Disable anonymous auth for security
  enableAnonymousAuth: false,
};

// Security notes
export const SECURITY_NOTES = `
  Security Best Practices Implemented:

  ✅ No tokens stored manually - Firebase handles sessions
  ✅ No API keys in code - uses native config files
  ✅ Email verification enabled
  ✅ Anonymous auth disabled
  ✅ Strong password requirements (8+ chars)
  ✅ No sensitive data sent to servers
  ✅ All PDF processing is local
  ✅ Minimal permissions requested
`;
