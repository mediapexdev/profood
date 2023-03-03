// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyD1olKL99I_mV7pbmldR2nF4k8WkD_v8XU",
  authDomain: "yonima-8b9af.firebaseapp.com",
  projectId: "yonima-8b9af",
  storageBucket: "yonima-8b9af.appspot.com",
  messagingSenderId: "468307143948",
  appId: "1:468307143948:web:5ef3b0a309fe123b2c2d29",
  measurementId: "G-2JHG0FQ79X"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// export const analytics = getAnalytics(firebase);