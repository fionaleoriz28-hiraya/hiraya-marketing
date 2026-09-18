# Hiraya Marketing Android App

Android WebView wrapper for the Python/Flask Hiraya Marketing application.

Architecture: Android APK -> WebView -> deployed Flask backend -> Supabase/OpenAI.

The APK does not bundle the Flask server. Deploy the Flask backend to a public HTTPS URL first, then replace BACKEND_URL in app/build.gradle.kts.

Build with: ./gradlew :app:assembleDebug

Output: app/build/outputs/apk/debug/app-debug.apk

For production, use an HTTPS backend and build a signed release APK/AAB.
