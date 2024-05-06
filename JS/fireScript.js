// Import the functions you need from the SDKs you need
import { getDatabase, set, ref, get, child, push, update, remove, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB0JAbXEgYyHuLsBI1lZ_XCBnlZzfFcU08",
    authDomain: "illuminata-eventmanager.firebaseapp.com",
    databaseURL: "https://illuminata-eventmanager-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "illuminata-eventmanager",
    storageBucket: "illuminata-eventmanager.appspot.com",
    messagingSenderId: "397265559679",
    appId: "1:397265559679:web:93d385aba41cb8e9495f4a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

export function getList(table_name) {
    return get(child(ref(db), `${table_name}`))
}

export function updateData(resource, path) {
    const groupRef = child(ref(db), path);
    update(groupRef, resource)
}

export function pushToList(dbName, resource, needSecondKey) {
    const groupRef = push(ref(db, dbName));
    if (needSecondKey) {
        resource['uniqueId'] = groupRef.key
    }
    set(groupRef, resource);
}

export function pushWithCustomId(dbName, resource) {
    const dataRef = ref(db, dbName);
    set(dataRef, resource);
}

export function deleteData(path) {
    const groupRef = child(ref(db), path);
    remove(groupRef)
}

export function manageUser(op, email, password) {
    switch (op) {
        case 'SIGNUP': {
            return createUserWithEmailAndPassword(auth, email, password)
        }
        case 'LOGIN': {
            return signInWithEmailAndPassword(auth, email, password)
        }
        case 'LOGOUT': {
            return signOut(auth)
        }
    }
}

export function filterbyRequest(dbName, order_at, val){
    console.log(val)
    return get(query(ref(db, dbName), orderByChild(order_at), equalTo(val)))
}