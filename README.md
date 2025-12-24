# Classroom 27 Mobile App

A clean, modern React Native (Expo) implementation for Classroom 27 with iOS-first UI and real authentication flows.

## Requirements

- Node.js 18+
- npm 9+
- Expo CLI (`npm install -g expo-cli`)

## Install

```bash
npm install
```

If your environment blocks registry downloads, ensure your npm registry access is enabled before installing.

## Run (iOS)

```bash
npm run ios
```

## Run (Dev Server)

```bash
npm run start
```

## API Base URL

The app is configured to use the production API by default:

```
https://classroom27-server-production.up.railway.app/api
```

To change the base URL, update `API_BASE_URL` in `src/services/api.ts`.

## Auth Flows Implemented

- Login + Register
- Logout + token refresh
- Request verification + verify email
- Request password reset + reset password
- Fetch/update profile + change password

## Structure

```
src/
  app/                # Expo Router routes
  components/
    ui/
    auth/
  features/
    auth/
  services/
  store/
  theme/
  utils/
```

## Notes

- Tokens are stored securely with `expo-secure-store` (web fallback uses `localStorage`).
- The authentication UI is presented as a modal sheet.
- Guest mode is supported: close the auth modal to continue as guest.
