/**
 * Analytics Aggregation Functions
 * Aggregate and process analytics data
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Scheduled: Aggregate daily analytics
 * Runs every day at 3 AM UTC
 */
export const aggregateDailyAnalytics = functions.pubsub
  .schedule('0 3 * * *')
  .timeZone('UTC')
  .onRun(async (context) => {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      const today = new Date(yesterday);
      today.setDate(today.getDate() + 1);
      
      const events = await admin.firestore()
        .collection('analytics')
        .where('timestamp', '>=', yesterday)
        .where('timestamp', '<', today)
        .get();
      
      // Aggregate metrics
      const metrics = {
        date: yesterday.toISOString().split('T')[0],
        totalEvents: events.size,
        uniqueUsers: new Set(events.docs.map(d => d.data().userId)).size,
        toolUsage: {} as Record<string, number>,
        platforms: { ios: 0, android: 0 },
      };
      
      events.forEach(doc => {
        const data = doc.data();
        if (data.event === 'tool_used') {
          const tool = data.properties.tool_name;
          metrics.toolUsage[tool] = (metrics.toolUsage[tool] || 0) + 1;
        }
        metrics.platforms[data.platform as 'ios' | 'android']++;
      });
      
      // Save aggregated data
      await admin.firestore()
        .collection('analytics_daily')
        .doc(metrics.date)
        .set(metrics);
      
      console.log('Daily analytics aggregated:', metrics);
    } catch (error) {
      console.error('Analytics aggregation error:', error);
    }
  });
