// PDF Master Pro - Firebase Auth Service
// This file will be fully functional once Firebase is configured

import { AUTH_CONFIG } from './config';

/**
 * Firebase Auth Service
 *
 * This service handles all authentication operations.
 * Firebase SDK manages session persistence automatically.
 *
 * Setup Required:
 * 1. Install: npm install @react-native-firebase/app @react-native-firebase/auth
 * 2. Add GoogleService-Info.plist to iOS project
 * 3. Add google-services.json to Android project
 * 4. For Google Sign-In: npm install @react-native-google-signin/google-signin
 * 5. For Apple Sign-In: npm install @invertase/react-native-apple-authentication
 */

// Types
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export interface AuthError {
  code: string;
  message: string;
}

// Helper to map Firebase user to our User type
export const mapFirebaseUser = (firebaseUser: any): AuthUser | null => {
  if (!firebaseUser) return null;

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
  };
};

// Validate email format
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < AUTH_CONFIG.minPasswordLength) {
    return {
      valid: false,
      message: `Password must be at least ${AUTH_CONFIG.minPasswordLength} characters`,
    };
  }
  return { valid: true };
};

// Error message mapping
export const getAuthErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already registered',
    'auth/invalid-email': 'Invalid email address',
    'auth/operation-not-allowed': 'This sign-in method is not enabled',
    'auth/weak-password': 'Password is too weak',
    'auth/user-disabled': 'This account has been disabled',
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/invalid-credential': 'Invalid credentials',
    'auth/too-many-requests': 'Too many attempts. Please try again later',
    'auth/network-request-failed': 'Network error. Please check your connection',
  };

  return errorMessages[errorCode] || 'An error occurred. Please try again';
};

/**
 * Authentication Functions
 *
 * These are placeholder implementations.
 * Replace with actual Firebase calls when configured.
 */

// Sign up with email and password
export const signUpWithEmail = async (
  email: string,
  password: string
): Promise<AuthUser> => {
  // Validate inputs
  if (!validateEmail(email)) {
    throw new Error('Invalid email address');
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    throw new Error(passwordValidation.message);
  }

  // TODO: Implement with Firebase
  // const userCredential = await auth().createUserWithEmailAndPassword(email, password);
  // await userCredential.user.sendEmailVerification();
  // return mapFirebaseUser(userCredential.user);

  console.log('[Auth] Sign up with:', email);
  throw new Error('Firebase not configured. Please set up Firebase first.');
};

// Sign in with email and password
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<AuthUser> => {
  if (!validateEmail(email)) {
    throw new Error('Invalid email address');
  }

  // TODO: Implement with Firebase
  // const userCredential = await auth().signInWithEmailAndPassword(email, password);
  // return mapFirebaseUser(userCredential.user);

  console.log('[Auth] Sign in with:', email);
  throw new Error('Firebase not configured. Please set up Firebase first.');
};

// Sign out
export const signOut = async (): Promise<void> => {
  // TODO: Implement with Firebase
  // await auth().signOut();

  console.log('[Auth] Sign out');
};

// Send password reset email
export const sendPasswordReset = async (email: string): Promise<void> => {
  if (!validateEmail(email)) {
    throw new Error('Invalid email address');
  }

  // TODO: Implement with Firebase
  // await auth().sendPasswordResetEmail(email);

  console.log('[Auth] Password reset email sent to:', email);
};

// Google Sign-In
export const signInWithGoogle = async (): Promise<AuthUser> => {
  if (!AUTH_CONFIG.enableGoogleSignIn) {
    throw new Error('Google Sign-In is not enabled');
  }

  // TODO: Implement with Firebase + Google Sign-In
  // const { idToken } = await GoogleSignin.signIn();
  // const credential = auth.GoogleAuthProvider.credential(idToken);
  // const userCredential = await auth().signInWithCredential(credential);
  // return mapFirebaseUser(userCredential.user);

  console.log('[Auth] Google Sign-In');
  throw new Error('Google Sign-In not configured');
};

// Apple Sign-In
export const signInWithApple = async (): Promise<AuthUser> => {
  if (!AUTH_CONFIG.enableAppleSignIn) {
    throw new Error('Apple Sign-In is not enabled');
  }

  // TODO: Implement with Firebase + Apple Authentication
  // const appleCredential = await appleAuth.performRequest({...});
  // const credential = auth.AppleAuthProvider.credential(appleCredential);
  // const userCredential = await auth().signInWithCredential(credential);
  // return mapFirebaseUser(userCredential.user);

  console.log('[Auth] Apple Sign-In');
  throw new Error('Apple Sign-In not configured');
};

// Get current user
export const getCurrentUser = (): AuthUser | null => {
  // TODO: Implement with Firebase
  // return mapFirebaseUser(auth().currentUser);

  return null;
};

// Listen to auth state changes
export const onAuthStateChange = (
  callback: (user: AuthUser | null) => void
): (() => void) => {
  // TODO: Implement with Firebase
  // return auth().onAuthStateChanged((user) => {
  //   callback(mapFirebaseUser(user));
  // });

  // Return unsubscribe function
  return () => {};
};

export default {
  signUpWithEmail,
  signInWithEmail,
  signOut,
  sendPasswordReset,
  signInWithGoogle,
  signInWithApple,
  getCurrentUser,
  onAuthStateChange,
  validateEmail,
  validatePassword,
  getAuthErrorMessage,
};
