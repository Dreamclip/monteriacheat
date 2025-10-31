const firebaseConfig = {
    apiKey: "AIzaSyDl6_mIq9Hh6raCcy-ceTuvo2qJpP25PhE",
    authDomain: "monteria-e8cf4.firebaseapp.com",
    projectId: "monteria-e8cf4",
    storageBucket: "monteria-e8cf4.firebasestorage.app",
    messagingSenderId: "992662389797",
    appId: "1:992662389797:web:ce12c5757795489271ebcc"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();