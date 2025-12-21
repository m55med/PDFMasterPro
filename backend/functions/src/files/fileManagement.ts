/**
 * File Management Functions
 * Handles file operations and cleanup
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Trigger: onCreate file
 * Generate thumbnail when a file is created
 */
export const onFileCreate = functions.firestore
  .document('files/{fileId}')
  .onCreate(async (snap, context) => {
    const file = snap.data();
    
    if (file.type === 'application/pdf') {
      try {
        // TODO: Generate PDF thumbnail
        // This would use a library like pdf-thumbnail or similar
        
        await snap.ref.update({
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        console.log(`File created: ${context.params.fileId}`);
      } catch (error) {
        console.error('Failed to generate thumbnail:', error);
      }
    }
  });

/**
 * Scheduled function: Daily cleanup
 * Delete expired files every day at 2 AM UTC
 */
export const dailyCleanup = functions.pubsub
  .schedule('0 2 * * *')
  .timeZone('UTC')
  .onRun(async (context) => {
    try {
      const now = admin.firestore.Timestamp.now();
      
      const expiredFiles = await admin.firestore()
        .collection('files')
        .where('expiresAt', '<=', now)
        .get();
      
      const batch = admin.firestore().batch();
      const bucket = admin.storage().bucket();
      
      for (const doc of expiredFiles.docs) {
        const fileData = doc.data();
        
        // Delete from storage
        try {
          await bucket.file(fileData.path).delete();
          if (fileData.thumbnail) {
            await bucket.file(fileData.thumbnail).delete();
          }
        } catch (error) {
          console.error(`Failed to delete file: ${fileData.path}`, error);
        }
        
        // Delete from Firestore
        batch.delete(doc.ref);
      }
      
      await batch.commit();
      
      console.log(`Deleted ${expiredFiles.size} expired files`);
    } catch (error) {
      console.error('Daily cleanup error:', error);
    }
  });
