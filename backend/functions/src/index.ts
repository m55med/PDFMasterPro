/**
 * Firebase Cloud Functions
 * Main entry point for all cloud functions
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Export all functions
export { onUserCreate, onUserDelete } from './user/userManagement';
export { onFileCreate, dailyCleanup } from './files/fileManagement';
export { processOCR, compressPDF } from './processing/pdfProcessing';
export { revenueCatWebhook, checkUsageLimits } from './subscription/subscriptionManagement';
export { aggregateDailyAnalytics } from './analytics/analyticsAggregation';
