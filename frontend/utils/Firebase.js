import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeApp } from "firebase/app";
const firebaseConfig = {
  apiKey: "AIzaSyCJ4n3rvlJlhxjtLP4WB9tcj6qkATK8OCQ",
  authDomain: "chat-9ecdb.firebaseapp.com",
  projectId: "chat-9ecdb",
  storageBucket: "chat-9ecdb.appspot.com",
  messagingSenderId: "689278065883",
  appId: "1:689278065883:web:de1b2245836880e85ec0fe",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { auth, provider };
