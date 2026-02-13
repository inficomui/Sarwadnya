# Shree Sarwadnya - Release Assets

This folder contains all the necessary assets for publishing the application to the Google Play Store.

## Structure:
- **credentials/**: Contains the `release.keystore` (JKS file) and `CREDENTIALS.txt` (Keystore passwords).
- **icons/**: Contains the App Icon and Splash Logo.
- **screenshots/**: (Placeholder) Place your 4+ application screenshots here.
- **banner/**: (Placeholder) Place your 1024x500 Feature Graphic (Banner) here.
- **play_store_description.txt**: The full description for the Play Store listing.
- **app-release.aab**: (Pending) This will be located in `android/app/build/outputs/bundle/release/` once the build process completes.

## Security Restrictions:
- **Screenshot & Screen Recording Protection**: Implemented globally using `expo-screen-capture`. Users will not be able to take screenshots or record the screen while using the app.
