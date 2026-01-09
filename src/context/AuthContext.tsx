// PDF Master Pro - Auth Context
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { User, AuthContextType, LoginCredentials, SignUpCredentials } from '../types/auth';
import {
  createUserProfile,
  userProfileExists,
  updateLastLogin,
} from '../services/firebase/firestore';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Map Firebase user to our User type
const mapFirebaseUser = (firebaseUser: FirebaseAuthTypes.User): User => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  displayName: firebaseUser.displayName,
  photoURL: firebaseUser.photoURL,
  emailVerified: firebaseUser.emailVerified,
  metadata: {
    creationTime: firebaseUser.metadata?.creationTime,
    lastSignInTime: firebaseUser.metadata?.lastSignInTime,
  },
});

// Get user-friendly error messages
const getAuthErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already registered',
    'auth/invalid-email': 'Invalid email address',
    'auth/weak-password': 'Password is too weak (minimum 8 characters)',
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/too-many-requests': 'Too many attempts. Please try again later',
    'auth/network-request-failed': 'Network error. Check your connection',
    'auth/user-disabled': 'This account has been disabled',
    'auth/invalid-credential': 'Invalid email or password',
  };
  return errorMessages[errorCode] || 'An error occurred. Please try again';
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = user !== null && user.emailVerified;

  // Configure Google Sign-In
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '347162556268-0s59fr7u0802n58d0o4rk059fnigqt2k.apps.googleusercontent.com',
    });
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser(mapFirebaseUser(firebaseUser));
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await auth().signInWithEmailAndPassword(
        credentials.email,
        credentials.password
      );

      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        // Send verification email again
        await userCredential.user.sendEmailVerification();
        throw new Error('Please verify your email first. We sent a new verification link.');
      }

      // Update last login time in Firestore
      await updateLastLogin(userCredential.user.uid);

      setUser(mapFirebaseUser(userCredential.user));
    } catch (err: any) {
      const message = err.code ? getAuthErrorMessage(err.code) : err.message;
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (credentials: SignUpCredentials): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(
        credentials.email,
        credentials.password
      );

      // Update display name if provided
      if (credentials.displayName) {
        await userCredential.user.updateProfile({
          displayName: credentials.displayName,
        });
      }

      // Create user profile in Firestore
      await createUserProfile(
        userCredential.user.uid,
        credentials.displayName || '',
        credentials.email
      );

      // Send verification email
      await userCredential.user.sendEmailVerification();

      // Sign out until email is verified
      await auth().signOut();

    } catch (err: any) {
      const message = err.code ? getAuthErrorMessage(err.code) : err.message;
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await auth().signOut();
      setUser(null);
    } catch (err: any) {
      const message = err.code ? getAuthErrorMessage(err.code) : err.message;
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await auth().sendPasswordResetEmail(email);
    } catch (err: any) {
      const message = err.code ? getAuthErrorMessage(err.code) : err.message;
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // These are kept for backward compatibility but now just call resetPassword
  const sendOTP = async (email: string): Promise<void> => {
    await resetPassword(email);
  };

  const verifyOTP = async (_email: string, _otp: string): Promise<void> => {
    // Not used with email link verification
    return Promise.resolve();
  };

  const confirmPasswordReset = async (_email: string, _otp: string, _newPassword: string): Promise<void> => {
    // Password reset is handled via email link
    return Promise.resolve();
  };

  const googleSignIn = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      // Check if Google Play Services are available
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Get the user's ID token
      const signInResult = await GoogleSignin.signIn();

      // Get idToken from the response
      const idToken = signInResult.data?.idToken;

      if (!idToken) {
        throw new Error('No ID token found');
      }

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign in to Firebase with the Google credential
      const userCredential = await auth().signInWithCredential(googleCredential);

      // Check if user profile exists, create if not (new Google user)
      const profileExists = await userProfileExists(userCredential.user.uid);
      if (!profileExists) {
        await createUserProfile(
          userCredential.user.uid,
          userCredential.user.displayName || '',
          userCredential.user.email || ''
        );
      } else {
        // Update last login for existing users
        await updateLastLogin(userCredential.user.uid);
      }

      setUser(mapFirebaseUser(userCredential.user));
    } catch (err: any) {
      let message = 'Google sign in failed';

      if (err.code === 'SIGN_IN_CANCELLED') {
        message = 'Sign in was cancelled';
      } else if (err.code === 'IN_PROGRESS') {
        message = 'Sign in is already in progress';
      } else if (err.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        message = 'Google Play Services not available';
      } else if (err.message) {
        message = err.message;
      }

      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const appleSignIn = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      // Apple Sign-In implementation for iOS
      // This requires @invertase/react-native-apple-authentication package
      throw new Error('Apple Sign-In not yet configured');
    } catch (err: any) {
      setError(err.message || 'Apple sign in failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const refreshUser = async (): Promise<void> => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      await currentUser.reload();
      setUser(mapFirebaseUser(currentUser));
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    signUp,
    logout,
    resetPassword,
    sendOTP,
    verifyOTP,
    confirmPasswordReset,
    googleSignIn,
    appleSignIn,
    clearError,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
