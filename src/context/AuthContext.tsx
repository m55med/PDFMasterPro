// PDF Master Pro - Auth Context
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, LoginCredentials, SignUpCredentials } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = user !== null;

  useEffect(() => {
    // TODO: Listen to Firebase auth state changes
    // This will be implemented when Firebase is configured
    const checkAuthState = async () => {
      try {
        // Simulate auth check
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
      }
    };

    checkAuthState();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Implement Firebase signInWithEmailAndPassword
      // const userCredential = await auth().signInWithEmailAndPassword(
      //   credentials.email,
      //   credentials.password
      // );
      // setUser(mapFirebaseUser(userCredential.user));
      console.log('Login with:', credentials.email);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (credentials: SignUpCredentials): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Implement Firebase createUserWithEmailAndPassword
      // const userCredential = await auth().createUserWithEmailAndPassword(
      //   credentials.email,
      //   credentials.password
      // );
      // await userCredential.user.sendEmailVerification();
      // setUser(mapFirebaseUser(userCredential.user));
      console.log('Sign up with:', credentials.email);
    } catch (err: any) {
      setError(err.message || 'Sign up failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // TODO: Implement Firebase signOut
      // await auth().signOut();
      setUser(null);
    } catch (err: any) {
      setError(err.message || 'Logout failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Implement Firebase sendPasswordResetEmail
      // await auth().sendPasswordResetEmail(email);
      console.log('Reset password for:', email);
    } catch (err: any) {
      setError(err.message || 'Password reset failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const googleSignIn = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Implement Google Sign In
      // const { idToken } = await GoogleSignin.signIn();
      // const credential = auth.GoogleAuthProvider.credential(idToken);
      // const userCredential = await auth().signInWithCredential(credential);
      // setUser(mapFirebaseUser(userCredential.user));
      console.log('Google Sign In');
    } catch (err: any) {
      setError(err.message || 'Google sign in failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const appleSignIn = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Implement Apple Sign In
      console.log('Apple Sign In');
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

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    signUp,
    logout,
    resetPassword,
    googleSignIn,
    appleSignIn,
    clearError,
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
