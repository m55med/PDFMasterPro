// PDF Master Pro - Firestore Service
import { UserProfile, Subscription, PlanType } from '../../types/subscription';

// Lazy-load firestore to avoid NativeEventEmitter error during module initialization
// The import is deferred until the first function call
let _firestore: typeof import('@react-native-firebase/firestore').default | null = null;

const getFirestore = () => {
  if (!_firestore) {
    _firestore = require('@react-native-firebase/firestore').default;
  }
  return _firestore!;
};

const getUsersCollection = () => getFirestore()().collection('users');
const getSubscriptionsCollection = () => getFirestore()().collection('subscriptions');
const serverTimestamp = () => getFirestore().FieldValue.serverTimestamp();

// Helper to check if document exists (handles different Firebase versions)
const docExists = (doc: any): boolean => {
  return typeof doc.exists === 'function' ? doc.exists() : Boolean(doc.exists);
};

// ============ User Profile Operations ============

export const createUserProfile = async (
  uid: string,
  name: string,
  email: string
): Promise<void> => {
  const now = serverTimestamp();

  await getUsersCollection().doc(uid).set({
    name,
    email,
    createdAt: now,
    lastLoginAt: now,
  });

  // Create default free subscription
  await getSubscriptionsCollection().doc(uid).set({
    plan: 'free',
    billingCycle: null,
    startedAt: null,
    expiresAt: null,
    provider: null,
    transactionId: null,
  });
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const doc = await getUsersCollection().doc(uid).get();
    if (!docExists(doc)) {
      return null;
    }

    const data = doc.data();
    return {
      uid,
      name: data?.name || '',
      email: data?.email || '',
      createdAt: data?.createdAt?.toDate() || new Date(),
      lastLoginAt: data?.lastLoginAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (
  uid: string,
  updates: Partial<Pick<UserProfile, 'name'>>
): Promise<void> => {
  await getUsersCollection().doc(uid).update(updates);
};

export const updateLastLogin = async (uid: string): Promise<void> => {
  await getUsersCollection().doc(uid).update({
    lastLoginAt: serverTimestamp(),
  });
};

// ============ Subscription Operations ============

export const getSubscription = async (uid: string): Promise<Subscription | null> => {
  try {
    const doc = await getSubscriptionsCollection().doc(uid).get();
    if (!docExists(doc)) {
      return null;
    }

    const data = doc.data();
    return {
      plan: (data?.plan as PlanType) || 'free',
      billingCycle: data?.billingCycle || null,
      startedAt: data?.startedAt?.toDate() || null,
      expiresAt: data?.expiresAt?.toDate() || null,
      provider: data?.provider || null,
      transactionId: data?.transactionId || null,
    };
  } catch (error) {
    console.error('Error getting subscription:', error);
    return null;
  }
};

export const isSubscriptionActive = (subscription: Subscription | null): boolean => {
  if (!subscription) return false;
  if (subscription.plan === 'free') return false;
  if (!subscription.expiresAt) return false;

  return subscription.expiresAt > new Date();
};

// ============ Real-time Listeners ============

export const subscribeToUserProfile = (
  uid: string,
  onUpdate: (profile: UserProfile | null) => void
): (() => void) => {
  return getUsersCollection().doc(uid).onSnapshot(
    (doc) => {
      if (!docExists(doc)) {
        onUpdate(null);
        return;
      }

      const data = doc.data();
      onUpdate({
        uid,
        name: data?.name || '',
        email: data?.email || '',
        createdAt: data?.createdAt?.toDate() || new Date(),
        lastLoginAt: data?.lastLoginAt?.toDate() || new Date(),
      });
    },
    (error) => {
      console.error('Error subscribing to user profile:', error);
      onUpdate(null);
    }
  );
};

export const subscribeToSubscription = (
  uid: string,
  onUpdate: (subscription: Subscription | null) => void
): (() => void) => {
  return getSubscriptionsCollection().doc(uid).onSnapshot(
    (doc) => {
      if (!docExists(doc)) {
        onUpdate(null);
        return;
      }

      const data = doc.data();
      onUpdate({
        plan: (data?.plan as PlanType) || 'free',
        billingCycle: data?.billingCycle || null,
        startedAt: data?.startedAt?.toDate() || null,
        expiresAt: data?.expiresAt?.toDate() || null,
        provider: data?.provider || null,
        transactionId: data?.transactionId || null,
      });
    },
    (error) => {
      console.error('Error subscribing to subscription:', error);
      onUpdate(null);
    }
  );
};

// ============ Check if user exists ============

export const userProfileExists = async (uid: string): Promise<boolean> => {
  try {
    const doc = await getUsersCollection().doc(uid).get();
    return docExists(doc);
  } catch (error) {
    console.error('Error checking user profile:', error);
    return false;
  }
};
