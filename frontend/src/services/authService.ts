import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  AuthError,
  Unsubscribe,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/config/firebase';

/**
 * Maps Firebase Auth error codes to user-friendly clinical messages.
 */
export const mapAuthError = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const authError = error as AuthError;
    switch (authError.code) {
      case 'auth/invalid-email':
        return 'Invalid physician email format. Please check your email address.';
      case 'auth/user-not-found':
        return 'No physician account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please verify your credentials.';
      case 'auth/invalid-credential':
        return 'Invalid physician email or password. Please verify your credentials.';
      case 'auth/user-disabled':
        return 'This physician account has been deactivated. Contact the administrator.';
      case 'auth/too-many-requests':
        return 'Too many failed login attempts. Access temporarily restricted. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network connection error. Please check your internet connectivity.';
      case 'auth/operation-not-allowed':
        return 'Email/password sign-in is disabled in Firebase Console.';
      default:
        return authError.message || 'An unexpected authentication error occurred.';
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected authentication error occurred. Please try again.';
};

/**
 * Authenticates the physician with email and password.
 */
export const loginDoctor = async (email: string, password: string): Promise<User> => {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase configuration is incomplete. Please check your frontend/.env.local file.');
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    return userCredential.user;
  } catch (error) {
    throw new Error(mapAuthError(error));
  }
};

/**
 * Terminates the active physician authentication session.
 */
export const logoutDoctor = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    throw new Error(mapAuthError(error));
  }
};

/**
 * Observes changes to the physician's authentication state.
 */
export const subscribeToAuthState = (callback: (user: User | null) => void): Unsubscribe => {
  return onAuthStateChanged(auth, callback);
};
