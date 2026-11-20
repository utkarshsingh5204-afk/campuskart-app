# CampusKart

A mobile-friendly campus delivery store for students in Dehradun, built with React, Vite, Tailwind CSS, and Firebase.

## Features

- **Product Catalog**: Search and filter across Snacks, Drinks, Stationery, and Toiletries.
- **Cart & Delivery Fee**: Add/adjust quantities with a sticky bottom cart bar and drawer. Delivery is free above ₹199, otherwise ₹15.
- **Google Authentication**: Sign in with Google via Firebase Authentication and sign out anytime.
- **Order History**: Saves orders to Firestore (`orders` collection) and displays the signed-in user's past orders newest first on **My Orders**.

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- Firebase Authentication & Cloud Firestore

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file from `.env.example` and add your Firebase Web config:

   ```env
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   VITE_FIREBASE_MEASUREMENT_ID=...
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

## Deployment (Vercel)

1. Push the repository to GitHub and import it in Vercel.
2. Set the `VITE_FIREBASE_*` environment variables in Vercel Project Settings.
3. Add your Vercel domain under **Firebase Console → Authentication → Settings → Authorized domains**.
4. Publish the Firestore rules from `firestore.rules` in **Firebase Console → Firestore Database → Rules**.
