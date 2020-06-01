const admin = require("firebase-admin");
const serviceAccount = require("../screamchat-8d882-firebase-adminsdk-si7ml-38600ef942.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://screamchat-8d882.firebaseio.com",
  storageBucket: "screamchat-8d882.appspot.com",
});

const db = admin.firestore();

module.exports = { admin, db, serviceAccount };
