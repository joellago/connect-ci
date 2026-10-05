# Connect CI

Connect CI est une application de rencontre mobile orientée Côte d’Ivoire : profils, swipe, match mutuel et chat, avec un design premium et moderne.

## Fonctionnalités
- Inscription avec âge, ville, quartier, numéro +225
- Vérification OTP Firebase (avec fallback démo pour prototypage)
- Swipe des profils
- Match mutuel avant accès au chat
- Design mobile PWA sur max-width 420px
- Palette orange / blanc / vert ivoirien
- Copie légère en français avec vocabulaire nouchi

## Stack
- Vite + React
- Firebase Auth (OTP)
- CSS natif pour le design mobile

## Lancement local

1. Clone le projet
2. Installe les dépendances :
   npm install
3. Crée un fichier `.env` à partir de `.env.example` et ajoute tes clés Firebase.
4. Lance le projet :
   npm run dev

## Production

npm run build

## Firebase

Pour une vraie vérification OTP, configure un projet Firebase et renseigne les variables suivantes dans `.env` :

- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID

Le projet est prêt pour un prototype fonctionnel et un développement rapide en production.
