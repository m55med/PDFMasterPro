/**
 * User Management Functions
 * Handles user creation, deletion, and management
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Trigger: onCreate user
 * Creates user document in Firestore when a new user is created
 */
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  try {
    await admin.firestore().collection('users').doc(user.uid).set({
      id: user.uid,
      email: user.email,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      subscription: {
        plan: 'free',
        status: 'active',
      },
      usage: {
        filesProcessed: 0,
        lastResetDate: admin.firestore.FieldValue.serverTimestamp(),
        storageUsed: 0,
      },
      preferences: {
        language: 'en',
        theme: 'auto',
        notifications: true,
      },
    });

    console.log(`User created: ${user.uid}`);
  } catch (error) {
    console.error('Error creating user:', error);
  }
});

/**
 * Trigger: onDelete user
 * Cleanup user data when a user is deleted
 */
export const onUserDelete = functions.auth.user().onDelete(async (user) => {
  try {
    const batch = admin.firestore().batch();
    
    // Delete user document
    batch.delete(admin.firestore().collection('users').doc(user.uid));
    
    // Delete user files metadata
    const files = await admin.firestore()
      .collection('files')
      .where('userId', '==', user.uid)
      .get();
    
    files.forEach(doc => batch.delete(doc.ref));
    
    await batch.commit();
    
    // Delete storage files
    const bucket = admin.storage().bucket();
    await bucket.deleteFiles({
      prefix: `users/${user.uid}/`,
    });

    console.log(`User deleted: ${user.uid}`);
  } catch (error) {
    console.error('Error deleting user:', error);
  }
});
