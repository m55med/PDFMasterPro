// PDF Master Pro - Firebase Configuration
// Configuration is loaded from google-services.json (Android) and GoogleService-Info.plist (iOS)

/**
 * Firebase Project: master-pdf
 * Project ID: master-pdf
 *
 * Enabled Services:
 * ✅ Authentication (Email/Password, Google Sign-In)
 *
 * Not Used:
 * ❌ Firestore
 * ❌ Realtime Database
 * ❌ Cloud Functions
 * ❌ Anonymous Auth
 */

export const FIREBASE_CONFIG = {
  // These values are for reference only
  // React Native Firebase loads from native config files
  projectId: 'master-pdf',
  storageBucket: 'master-pdf.firebasestorage.app',
  messagingSenderId: '347162556268',
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
