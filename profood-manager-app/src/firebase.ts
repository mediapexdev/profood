// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import i18n from "./i18n";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
    apiKey: "AIzaSyBvLbU64X0sV4VLRmAAPMCsXoK_R6i_6aI",
    authDomain: "profood-manager.firebaseapp.com",
    projectId: "profood-manager",
    storageBucket: "profood-manager.appspot.com",
    messagingSenderId: "861872064618",
    appId: "1:861872064618:web:d91a6f6f65e4ec22556213",
    measurementId: "G-09YYCCW3L9"
};
// Initialize Firebase

const app = initializeApp(firebaseConfig);

const firebaseAuth = getAuth(app);
firebaseAuth.languageCode = i18n.language;

// const analytics = getAnalytics(app);

export { app, firebaseAuth };
