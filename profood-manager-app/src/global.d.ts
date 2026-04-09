import firebaseAuth from 'firebase/auth';

declare global {
    interface Window {
        recaptchaVerifier: firebaseAuth.RecaptchaVerifier;
        confirmationResult: firebaseAuth.ConfirmationResult;
    }
}
