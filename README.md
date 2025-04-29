# TravelLog

## Firebase Configuration Setup

To set up Firebase in this project:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Add an app to your Firebase project
3. Download the configuration files:
   - For Android: Download `google-services.json` and place it in the `android/app` directory
   - For iOS: Download `GoogleService-Info.plist` and place it in the `ios/[YourAppName]` directory
4. Create a `.env` file in the root directory with the following variables:
   ```
   FIREBASE_API_KEY=your_api_key_here
   FIREBASE_AUTH_DOMAIN=your_auth_domain_here
   FIREBASE_PROJECT_ID=your_project_id_here
   FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
   FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
   FIREBASE_APP_ID=your_app_id_here
   FIREBASE_MEASUREMENT_ID=your_measurement_id_here
   ```
   Replace the placeholder values with your actual Firebase configuration.

⚠️ **Important: Never commit your actual Firebase configuration files or .env files to version control!** 