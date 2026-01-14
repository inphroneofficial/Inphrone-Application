# Building Inphrone as an Android App

This guide explains how to build Inphrone as a native Android application using Android Studio and connect it to the backend database and cloud services.

## Prerequisites

Before you begin, ensure you have:
- **Android Studio** (latest version) installed on your computer
- **Node.js** and **npm** installed
- **Git** installed
- Basic understanding of Android development

## Step 1: Export and Set Up the Project

1. **Export the Project from Your Repository**
   - Click "Export to GitHub" button in your development environment
   - Clone the repository to your local machine:
     ```bash
     git clone [your-github-repo-url]
     cd inphrone
     ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build the Web Application**
   ```bash
   npm run build
   ```

## Step 2: Set Up Capacitor for Android

Capacitor is the framework that converts your web app into a native Android app while maintaining full functionality.

1. **Install Capacitor CLI**
   ```bash
   npm install @capacitor/core @capacitor/cli
   npm install @capacitor/android
   ```

2. **Initialize Capacitor**
   ```bash
   npx cap init
   ```
   When prompted:
   - **App name**: Inphrone
   - **App ID**: com.inphrone.app (use your own domain)
   - **Web directory**: dist

3. **Add Android Platform**
   ```bash
   npx cap add android
   ```

## Step 3: Configure Backend Connection

The app's backend connection is already configured in your `.env` file. These environment variables are automatically included when you build:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

**Important**: These variables are embedded during build time, so the Android app will connect to the same backend as your web app automatically.

## Step 4: Build and Open in Android Studio

1. **Sync Capacitor**
   ```bash
   npm run build
   npx cap sync android
   ```

2. **Open in Android Studio**
   ```bash
   npx cap open android
   ```

   This will open the Android project in Android Studio.

## Step 5: Configure Android App Settings

In Android Studio, update the following files:

### `android/app/src/main/AndroidManifest.xml`
Ensure these permissions are included:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### `android/app/src/main/res/values/strings.xml`
Update the app name:
```xml
<resources>
    <string name="app_name">Inphrone</string>
</resources>
```

## Step 6: Build the APK

1. In Android Studio, go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**
2. Wait for the build to complete
3. The APK will be generated in `android/app/build/outputs/apk/debug/app-debug.apk`

## Step 7: Test the App

### Test on Emulator
1. In Android Studio, click the "Run" button (green play icon)
2. Select an emulator or create a new virtual device
3. The app will install and launch on the emulator

### Test on Physical Device
1. Enable Developer Options on your Android device:
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times
2. Enable USB Debugging in Developer Options
3. Connect your device to your computer via USB
4. In Android Studio, select your device and click "Run"

## Step 8: Database and Cloud Services Connection

### How the App Connects to Backend

When users install and use your Android app:

1. **Automatic Backend Connection**
   - The app uses the Supabase URL and keys configured in your `.env` file
   - All API calls, database queries, and authentication work exactly like the web version
   - No additional setup needed - the connection is embedded in the APK

2. **User Data Flow**
   - Users create accounts through the app
   - All data (opinions, profiles, coupons, etc.) is stored in your Supabase database
   - Real-time updates work across all platforms (web, Android, iOS)

3. **Authentication**
   - User login/signup is handled by Supabase Auth
   - Sessions are maintained securely on the device
   - Users can use the same credentials on web and mobile

4. **Edge Functions**
   - Backend functions (like fetching coupons) work automatically
   - The app calls the same cloud functions as the web version

### Important Notes

- **No User Configuration Required**: Users simply install the app - all backend connections are pre-configured
- **Same Database for All Platforms**: Web users and Android users share the same database
- **Automatic Updates**: When you update the database schema, all apps automatically work with the new structure
- **Security**: API keys are embedded in the app but the Supabase project uses Row Level Security (RLS) to protect user data

## Step 9: Prepare for Production (Optional)

### Generate Signed APK for Google Play Store

1. **Create a Keystore**
   ```bash
   keytool -genkey -v -keystore inphrone-release-key.keystore -alias inphrone -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure Signing in Android Studio**
   - Go to Build > Generate Signed Bundle / APK
   - Follow the wizard to sign your APK with your keystore

3. **Build Release APK**
   - Select "APK" in the wizard
   - Choose "release" build variant
   - Select your keystore and enter credentials
   - Build the signed APK

## Troubleshooting

### App Can't Connect to Backend
- Verify `.env` file has correct Supabase credentials
- Run `npm run build` before `npx cap sync`
- Check that your Supabase project is active

### Build Errors in Android Studio
- Make sure you've run `npm run build` first
- Try File > Invalidate Caches / Restart in Android Studio
- Run `npx cap sync android` again

### App Crashes on Launch
- Check the Logcat in Android Studio for error messages
- Verify all required permissions are in AndroidManifest.xml
- Ensure JavaScript bundle built successfully (`npm run build`)

## Summary

Your Android app is now:
- ✅ Connected to the same Supabase database as the web app
- ✅ Using the same authentication system
- ✅ Accessing the same backend cloud functions
- ✅ Storing user data in the cloud automatically
- ✅ Ready for distribution to users

When users install the app, they get the full Inphrone experience with all data synced to your cloud infrastructure - no additional configuration needed!

## Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Studio Guide](https://developer.android.com/studio/intro)
- [Supabase Mobile Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-ionic-react)
- [Google Play Console](https://play.google.com/console) - For publishing your app
