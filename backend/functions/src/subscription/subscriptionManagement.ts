/**
 * Subscription Management Functions
 * Handles RevenueCat webhooks and usage limits
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * HTTP: RevenueCat Webhook
 * Handle subscription events from RevenueCat
 */
export const revenueCatWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }
  
  const event = req.body;
  
  try {
    if (event.type === 'INITIAL_PURCHASE' || event.type === 'RENEWAL') {
      const userId = event.app_user_id;
      const productId = event.product_id;
      
      let plan: 'monthly' | 'yearly' | 'lifetime' = 'monthly';
      if (productId.includes('yearly')) plan = 'yearly';
      if (productId.includes('lifetime')) plan = 'lifetime';
      
      await admin.firestore().collection('users').doc(userId).update({
        'subscription.plan': plan,
        'subscription.status': 'active',
        'subscription.expiresAt': plan === 'lifetime' 
          ? null 
          : admin.firestore.Timestamp.fromMillis(event.expiration_at_ms),
        'subscription.revenueCatId': event.id,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      console.log(`Subscription activated for user: ${userId}`);
    }
    
    if (event.type === 'CANCELLATION' || event.type === 'EXPIRATION') {
      const userId = event.app_user_id;
      
      await admin.firestore().collection('users').doc(userId).update({
        'subscription.status': 'expired',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      console.log(`Subscription expired for user: ${userId}`);
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Internal error');
  }
});

/**
 * HTTP: Check usage limits
 * Check if user can process more files
 */
export const checkUsageLimits = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Auth required');
  }
  
  const userDoc = await admin.firestore()
    .collection('users')
    .doc(context.auth.uid)
    .get();
  
  const user = userDoc.data();
  if (!user) {
    throw new functions.https.HttpsError('not-found', 'User not found');
  }
  
  const isPro = user.subscription.status === 'active' && user.subscription.plan !== 'free';
  const limits = {
    filesPerDay: isPro ? 9999 : 5,
    maxFileSize: isPro ? 100 * 1024 * 1024 : 10 * 1024 * 1024,
    cloudStorage: isPro ? 20 * 1024 * 1024 * 1024 : 0,
  };
  
  // Check if daily limit reset is needed
  const lastReset = user.usage.lastResetDate.toDate();
  const now = new Date();
  
  if (now.getDate() !== lastReset.getDate()) {
    await userDoc.ref.update({
      'usage.filesProcessed': 0,
      'usage.lastResetDate': admin.firestore.FieldValue.serverTimestamp(),
    });
  }
  
  const canProcess = user.usage.filesProcessed < limits.filesPerDay;
  
  return {
    canProcess,
    filesProcessed: user.usage.filesProcessed,
    limits,
    isPro,
  };
});
