import firebase from 'firebase/app';
import 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyA6hDWlTJKJ1Sw6F6MrGz_Y3L5wvqbY7Qs",
    authDomain: "caravanclub-d1408.firebaseapp.com",
    projectId: "caravanclub-d1408",
    storageBucket: "caravanclub-d1408.appspot.com",
    messagingSenderId: "382752732874",
    appId: "1:382752732874:web:a2440bff0c12039f2be633"
};


firebase.initializeApp(firebaseConfig);

export default firebase;
