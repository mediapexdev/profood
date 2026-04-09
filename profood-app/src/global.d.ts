import firebaseAuth from 'firebase/auth';

declare global {
    interface Window {
        // recaptchaVerifier: any;
        recaptchaVerifier: firebaseAuth.RecaptchaVerifier;
        confirmationResult: firebaseAuth.ConfirmationResult;
        PayTech: any;
        registration: any;
    }
}
