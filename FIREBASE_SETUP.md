# Firebase Setup Guide for PDF Master Pro

## Overview

This guide provides step-by-step instructions for setting up Firebase Authentication with OTP (One-Time Password) email verification for password reset functionality.

---

## Part 1: Firebase Console Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `pdf-master-pro`
4. Enable Google Analytics (optional)
5. Click **"Create project"**

### Step 2: Add iOS App

1. In Firebase Console, click **"Add app"** > **iOS**
2. Enter iOS Bundle ID: `com.pdfmasterpro.app` (from app.json)
3. Download `GoogleService-Info.plist`
4. Place it in: `ios/PDFMasterPro/GoogleService-Info.plist`

### Step 3: Add Android App

1. Click **"Add app"** > **Android**
2. Enter Android Package Name: `com.pdfmasterpro.app`
3. Download `google-services.json`
4. Place it in: `android/app/google-services.json`

### Step 4: Enable Authentication Methods

1. Go to **Authentication** > **Sign-in method**
2. Enable **Email/Password**
3. (Optional) Enable **Google Sign-In**
4. (Optional) Enable **Apple Sign-In** (for iOS)

---

## Part 2: Cloud Functions for OTP

Since Firebase doesn't have built-in OTP for password reset, we need Cloud Functions.

### Step 1: Initialize Cloud Functions

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize functions in your project
cd /path/to/your/project
firebase init functions
```

### Step 2: Install Dependencies

```bash
cd functions
npm install nodemailer
```

### Step 3: Create Cloud Functions

Create `functions/index.js`:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Configure email transporter (use your email service)
const transporter = nodemailer.createTransport({
  service: 'gmail', // or 'sendgrid', 'mailgun', etc.
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.password,
  },
});

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via email
exports.sendOTP = functions.https.onCall(async (data, context) => {
  const { email } = data;

  if (!email) {
    throw new functions.https.HttpsError('invalid-argument', 'Email is required');
  }

  // Check if user exists
  try {
    await admin.auth().getUserByEmail(email);
  } catch (error) {
    throw new functions.https.HttpsError('not-found', 'No user found with this email');
  }

  // Generate OTP
  const otp = generateOTP();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Store OTP in Firestore
  await admin.firestore().collection('otps').doc(email).set({
    otp,
    expiresAt,
    attempts: 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Send email
  const mailOptions = {
    from: 'PDF Master Pro <noreply@pdfmasterpro.com>',
    to: email,
    subject: 'Password Reset Code - PDF Master Pro',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">Password Reset</h2>
        <p>You requested to reset your password. Use the following code:</p>
        <div style="background: #F3F4F6; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="font-size: 32px; letter-spacing: 8px; color: #1F2937;">${otp}</h1>
        </div>
        <p>This code will expire in <strong>10 minutes</strong>.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #E5E7EB;">
        <p style="color: #6B7280; font-size: 12px;">PDF Master Pro Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error('Email error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send email');
  }
});

// Verify OTP
exports.verifyOTP = functions.https.onCall(async (data, context) => {
  const { email, otp } = data;

  if (!email || !otp) {
    throw new functions.https.HttpsError('invalid-argument', 'Email and OTP are required');
  }

  const otpDoc = await admin.firestore().collection('otps').doc(email).get();

  if (!otpDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'No OTP found for this email');
  }

  const otpData = otpDoc.data();

  // Check if OTP is expired
  if (Date.now() > otpData.expiresAt) {
    await admin.firestore().collection('otps').doc(email).delete();
    throw new functions.https.HttpsError('deadline-exceeded', 'OTP has expired');
  }

  // Check attempts
  if (otpData.attempts >= 3) {
    await admin.firestore().collection('otps').doc(email).delete();
    throw new functions.https.HttpsError('permission-denied', 'Too many failed attempts');
  }

  // Verify OTP
  if (otpData.otp !== otp) {
    await admin.firestore().collection('otps').doc(email).update({
      attempts: admin.firestore.FieldValue.increment(1),
    });
    throw new functions.https.HttpsError('unauthenticated', 'Invalid OTP');
  }

  // Mark OTP as verified
  await admin.firestore().collection('otps').doc(email).update({
    verified: true,
  });

  return { success: true, message: 'OTP verified successfully' };
});

// Reset password with OTP
exports.resetPasswordWithOTP = functions.https.onCall(async (data, context) => {
  const { email, otp, newPassword } = data;

  if (!email || !otp || !newPassword) {
    throw new functions.https.HttpsError('invalid-argument', 'All fields are required');
  }

  // Validate password strength
  if (newPassword.length < 8) {
    throw new functions.https.HttpsError('invalid-argument', 'Password must be at least 8 characters');
  }

  // Check if OTP was verified
  const otpDoc = await admin.firestore().collection('otps').doc(email).get();

  if (!otpDoc.exists || !otpDoc.data().verified || otpDoc.data().otp !== otp) {
    throw new functions.https.HttpsError('permission-denied', 'OTP not verified');
  }

  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(email);

    // Update password
    await admin.auth().updateUser(user.uid, {
      password: newPassword,
    });

    // Delete OTP document
    await admin.firestore().collection('otps').doc(email).delete();

    return { success: true, message: 'Password reset successfully' };
  } catch (error) {
    console.error('Password reset error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to reset password');
  }
});
```

### Step 4: Configure Email Credentials

```bash
firebase functions:config:set email.user="your-email@gmail.com" email.password="your-app-password"
```

**Note**: For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833)

### Step 5: Deploy Cloud Functions

```bash
firebase deploy --only functions
```

---

## Part 3: Firestore Security Rules

Create Firestore rules in Firebase Console > Firestore > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // OTP collection - only accessible by Cloud Functions
    match /otps/{email} {
      allow read, write: if false; // Only Cloud Functions can access
    }

    // Add other rules as needed
  }
}
```

---

## Part 4: Update React Native Code

### Step 1: Install Firebase Functions Package

```bash
npm install @react-native-firebase/functions
```

### Step 2: Update AuthContext.tsx

Replace the TODO implementations with actual Firebase calls:

```typescript
import functions from '@react-native-firebase/functions';

const sendOTP = async (email: string): Promise<void> => {
  setIsLoading(true);
  setError(null);
  try {
    const sendOTPFunction = functions().httpsCallable('sendOTP');
    await sendOTPFunction({ email });
  } catch (err: any) {
    const message = err.message || 'Failed to send OTP';
    setError(message);
    throw new Error(message);
  } finally {
    setIsLoading(false);
  }
};

const verifyOTP = async (email: string, otp: string): Promise<void> => {
  setIsLoading(true);
  setError(null);
  try {
    const verifyOTPFunction = functions().httpsCallable('verifyOTP');
    await verifyOTPFunction({ email, otp });
  } catch (err: any) {
    const message = err.message || 'Invalid OTP';
    setError(message);
    throw new Error(message);
  } finally {
    setIsLoading(false);
  }
};

const confirmPasswordReset = async (
  email: string,
  otp: string,
  newPassword: string
): Promise<void> => {
  setIsLoading(true);
  setError(null);
  try {
    const resetPasswordFunction = functions().httpsCallable('resetPasswordWithOTP');
    await resetPasswordFunction({ email, otp, newPassword });
  } catch (err: any) {
    const message = err.message || 'Password reset failed';
    setError(message);
    throw new Error(message);
  } finally {
    setIsLoading(false);
  }
};
```

---

## Part 5: Update Firebase Config

Update `src/services/firebase/config.ts` with your actual Firebase credentials:

```typescript
export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSy...your-actual-api-key',
  authDomain: 'pdf-master-pro.firebaseapp.com',
  projectId: 'pdf-master-pro',
  storageBucket: 'pdf-master-pro.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:ios:abcd1234',
};
```

---

## Part 6: iOS Setup

### Step 1: Add Firebase to Podfile

```ruby
# ios/Podfile
pod 'Firebase', :modular_headers => true
pod 'FirebaseCoreInternal', :modular_headers => true
pod 'GoogleUtilities', :modular_headers => true
```

### Step 2: Install Pods

```bash
cd ios && pod install && cd ..
```

### Step 3: Configure AppDelegate

In `ios/PDFMasterPro/AppDelegate.mm`:

```objective-c
#import <Firebase.h>

// In didFinishLaunchingWithOptions:
[FIRApp configure];
```

---

## Part 7: Android Setup

### Step 1: Update build.gradle (Project)

```gradle
// android/build.gradle
buildscript {
  dependencies {
    classpath 'com.google.gms:google-services:4.4.0'
  }
}
```

### Step 2: Update build.gradle (App)

```gradle
// android/app/build.gradle
apply plugin: 'com.google.gms.google-services'
```

---

## Part 8: Testing

### Test OTP Flow

1. Run the app: `npx react-native run-ios` or `npx react-native run-android`
2. Navigate to Login > Forgot Password
3. Enter a registered email
4. Check email for OTP code
5. Enter OTP code
6. Set new password
7. Login with new password

### Common Issues

| Issue | Solution |
|-------|----------|
| OTP email not received | Check spam folder, verify email config |
| Function timeout | Check Firebase Functions logs |
| OTP expired | Request new OTP |
| Invalid OTP | Verify correct code entered |

---

## Alternative: Use SendGrid or Mailgun

For production, consider using a dedicated email service:

### SendGrid Setup

```javascript
// functions/index.js
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(functions.config().sendgrid.api_key);

// In sendOTP function:
await sgMail.send({
  to: email,
  from: 'noreply@pdfmasterpro.com',
  subject: 'Password Reset Code',
  html: `<h1>${otp}</h1>`,
});
```

### Set SendGrid Config

```bash
firebase functions:config:set sendgrid.api_key="SG.xxxx"
```

---

## Security Best Practices

1. **Rate Limiting**: Limit OTP requests per email (implemented in Cloud Functions)
2. **OTP Expiry**: 10 minutes (configurable)
3. **Max Attempts**: 3 failed attempts before OTP invalidation
4. **Secure Transport**: Always use HTTPS
5. **No OTP Storage**: OTPs are deleted after use or expiry

---

## Support

For issues, check:
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Native Firebase](https://rnfirebase.io/)
- Project issues on GitHub
