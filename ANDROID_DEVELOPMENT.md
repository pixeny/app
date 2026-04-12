# Android Development with Capacitor

This project is now configured for Android development using Capacitor with Hot Reload/Live Reload functionality.

## Prerequisites

1. **Android Studio** - Download and install from [developer.android.com](https://developer.android.com/studio)
2. **Android SDK** - Install via Android Studio
3. **Java JDK** (version 17 or later)
4. **Physical Android device** or **Android Emulator**
5. **Node.js** (already installed)

## Development Workflow

### 1. Start Development with Live Reload

```bash
npm run android:dev
```

This command will:
- Automatically detect your local IP address
- Update Capacitor configuration for Live Reload
- Start the Vite development server
- Run the app on your connected Android device with Live Reload enabled

### 2. Open in Android Studio

```bash
npm run android:studio
```

This will:
- Build the project
- Sync with Android
- Open the Android project in Android Studio

### 3. Manual Development Steps

If you prefer more control:

```bash
# Setup Live Reload IP
npm run setup:livereload

# Start development server
npm run dev

# In another terminal, run on Android
npx cap run android --livereload --external
```

## Available Scripts

- `npm run android:dev` - Start development with Live Reload
- `npm run android:studio` - Build and open in Android Studio
- `npm run android:build` - Build for production and sync
- `npm run setup:livereload` - Setup IP for Live Reload
- `npm run cap:sync` - Sync web assets with Android
- `npm run cap:open` - Open Android project in Android Studio

## Device Setup

### For Physical Device:

1. Enable **Developer Options** on your Android device:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Developer options will be enabled

2. Enable **USB Debugging**:
   - Go to Settings → Developer Options
   - Enable "USB Debugging"
   - Enable "USB Debugging (Security settings)"

3. Connect your device via USB and allow debugging when prompted

### For Android Emulator:

1. Open Android Studio
2. Go to Tools → Device Manager
3. Create a new virtual device or use an existing one
4. Start the emulator

## Live Reload Features

- **Hot Reload**: Changes to your React components will automatically refresh
- **Style Updates**: CSS/Tailwind changes update instantly
- **Console Logs**: View browser console logs in Android Studio Logcat
- **Network Inspection**: Use Chrome DevTools for network debugging

## Troubleshooting

### Live Reload Not Working:

1. Make sure your device and computer are on the same WiFi network
2. Check that port 3000 is not blocked by firewall
3. Run `npm run setup:livereload` to update IP address

### Build Issues:

1. Make sure Android SDK is properly installed
2. Check that ANDROID_HOME environment variable is set
3. Run `npx cap doctor` to diagnose issues

### Device Not Detected:

1. Check USB cable connection
2. Verify USB Debugging is enabled
3. Run `adb devices` to list connected devices

## Production Build

To create a production APK:

```bash
npm run build
npx cap sync android
npx cap open android
```

Then in Android Studio:
1. Build → Build Bundle(s) / APK(s) → Build APK(s)
2. Choose release build
3. APK will be generated in `android/app/build/outputs/apk/release/`

## Project Structure

```
├── src/                 # React source code
├── android/             # Android native project
├── capacitor.config.ts  # Capacitor configuration
├── scripts/             # Build and setup scripts
└── dist/               # Built web assets
```

Happy coding! 🚀
