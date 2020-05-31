import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

var firebaseConfig = {
  apiKey: "AIzaSyCOze1CG2imEPg7TmokpGZ96L76uYHQs00",
  authDomain: "screamchat-8d882.firebaseapp.com",
  databaseURL: "https://screamchat-8d882.firebaseio.com",
  projectId: "screamchat-8d882",
  storageBucket: "screamchat-8d882.appspot.com",
  messagingSenderId: "1078746383436",
  appId: "1:1078746383436:web:20dcaf5b5c50aa7237e0e9",
  measurementId: "G-MMY2L11C5N",
};

firebase.initializeApp(firebaseConfig);

export default firebase;
