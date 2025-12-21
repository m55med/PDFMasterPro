# PDF Master Pro Backend

Firebase Cloud Functions backend for PDF Master Pro mobile app.

## 🎯 Overview

This backend provides:
- User authentication and management
- Cloud file storage
- Premium PDF processing (OCR, heavy compression)
- Subscription management (RevenueCat webhooks)
- Analytics aggregation
- Usage limits enforcement

## 🏗️ Tech Stack

- **Platform**: Firebase
- **Language**: TypeScript
- **Services**:
  - Firebase Auth
  - Cloud Firestore
  - Cloud Storage
  - Cloud Functions
  - Cloud Scheduler (for cron jobs)

## 📁 Project Structure

```
backend/
├── functions/
│   └── src/
│       ├── user/           # User management
│       ├── files/          # File operations
│       ├── processing/     # PDF processing
│       ├── subscription/   # Payment webhooks
│       ├── analytics/      # Analytics
│       └── index.ts        # Main entry
├── firestore.rules         # Firestore security rules
├── storage.rules           # Storage security rules
├── firestore.indexes.json  # Database indexes
└── firebase.json           # Firebase config
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Firebase CLI: `npm install -g firebase-tools`
- Firebase project

### Installation

```bash
cd backend
npm install
```

### Configuration

1. **Login to Firebase**
```bash
firebase login
```

2. **Initialize Firebase** (if not done)
```bash
firebase init
```
Select:
- Functions
- Firestore
- Storage

3. **Set environment variables**
```bash
firebase functions:config:set revenuecat.api_key="YOUR_KEY"
```

## 🛠️ Development

### Local Development

```bash
# Start emulators
npm run serve

# This will start:
# - Functions emulator (port 5001)
# - Firestore emulator (port 8080)
# - Storage emulator (port 9199)
# - Auth emulator (port 9099)
# - Emulator UI (port 4000)
```

### Build

```bash
npm run build
```

## 🚀 Deployment

### Deploy Functions Only
```bash
npm run deploy
```

### Deploy Everything
```bash
firebase deploy
```

### Deploy Specific Function
```bash
firebase deploy --only functions:onUserCreate
```

## 📊 Cloud Functions

### User Management

#### `onUserCreate`
- **Trigger**: Auth onCreate
- **Purpose**: Create user document in Firestore
- **Actions**: Initialize user profile with default settings

#### `onUserDelete`
- **Trigger**: Auth onDelete
- **Purpose**: Cleanup user data
- **Actions**: Delete Firestore docs and Storage files

### File Management

#### `onFileCreate`
- **Trigger**: Firestore onCreate (files/{fileId})
- **Purpose**: Process new files
- **Actions**: Generate thumbnails, update metadata

#### `dailyCleanup`
- **Trigger**: Scheduled (daily at 2 AM UTC)
- **Purpose**: Delete expired files
- **Actions**: Remove old files from Firestore and Storage

### PDF Processing

#### `processOCR`
- **Type**: Callable HTTPS
- **Auth**: Required
- **Access**: Premium only
- **Purpose**: Extract text from scanned PDFs
- **Implementation**: Uses Tesseract or Google Vision API

#### `compressPDF`
- **Type**: Callable HTTPS
- **Auth**: Required
- **Purpose**: Heavy compression using server resources
- **Implementation**: Uses Ghostscript or similar

### Subscription

#### `revenueCatWebhook`
- **Type**: HTTPS POST
- **Auth**: None (verified via RevenueCat)
- **Purpose**: Handle subscription events
- **Events**: INITIAL_PURCHASE, RENEWAL, CANCELLATION, EXPIRATION

#### `checkUsageLimits`
- **Type**: Callable HTTPS
- **Auth**: Required
- **Purpose**: Verify user can perform action
- **Returns**: Usage limits and current status

### Analytics

#### `aggregateDailyAnalytics`
- **Trigger**: Scheduled (daily at 3 AM UTC)
- **Purpose**: Aggregate daily metrics
- **Actions**: Process events, calculate stats, store in analytics_daily

## 🔐 Security Rules

### Firestore Rules

Users can:
- ✅ Read/write their own user document
- ✅ Read/write/delete their own files
- ✅ Create analytics events
- ✅ Submit feedback
- ❌ Modify subscription data (server only)
- ❌ Access other users' data

### Storage Rules

Users can:
- ✅ Upload files to their own folder (with size limits)
- ✅ Read their own files
- ✅ Delete their own files
- ❌ Access other users' files
- ❌ Write to thumbnails (server only)

## 💰 Cost Estimation

Monthly costs for 10,000 active users:

```
Firebase Auth:           FREE
Firestore:
  - Reads:   10M × $0.06/100k  = $6.00
  - Writes:   2M × $0.18/100k  = $3.60
Storage:
  - 500GB stored           = $13.00
  - 1TB download           = $122.88
Functions:
  - 2M invocations         = $0.80
  - Compute time           = ~$20.00

Total:                     ~$166/month
```

With 5% conversion to $4.99/month:
- Revenue: $2,495/month
- Net profit: ~$2,329/month 💰

## 📈 Monitoring

### View Logs
```bash
npm run logs
```

### Metrics to Monitor
- Error rate (target: <1%)
- Function duration (target: <60s)
- Storage usage (alert at 80%)
- Daily active users
- Conversion rate
- Crash-free rate (target: 99.9%)

## 🔧 Troubleshooting

### Function Timeout
- Increase timeout in function config
- Optimize code
- Use batch operations

### High Costs
- Review usage patterns
- Optimize database queries
- Use indexes
- Implement caching

### Security Rule Errors
- Test rules in Firebase console
- Check authentication state
- Verify field paths

## 📚 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Cloud Functions Guide](https://firebase.google.com/docs/functions)
- [RevenueCat Webhooks](https://docs.revenuecat.com/docs/webhooks)

## 🤝 Support

For backend issues, contact the development team.

---

Made with ❤️ by PDF Master Pro Team
