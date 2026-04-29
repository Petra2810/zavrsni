import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { getDatabase, ref, set, push, onValue } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyCO7QLZsCxQeY6uHYbtaByg2exqtfCM0G0",
    authDomain: "zavrsnipetradaniela.firebaseapp.com",
    databaseURL: "https://zavrsnipetradaniela-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "zavrsnipetradaniela",
    storageBucket: "zavrsnipetradaniela.firebasestorage.app",
    messagingSenderId: "1016932466553",
    appId: "1:1016932466553:web:994b6d55d4d04efa8939a8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// DOM
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const addBookPanel = document.getElementById('addBookPanel');
const submitBookBtn = document.getElementById('submitBookBtn');
const booksGrid = document.getElementById('booksGrid');
const userInfo = document.getElementById('userInfo');

let currentUser = null;

// AUTH STATE
onAuthStateChanged(auth, (user) => {
    currentUser = user;

    if(user){
        userInfo.innerHTML = `👋 ${user.email}`;
        loginBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        addBookPanel.classList.remove('hidden');
    } else {
        userInfo.innerHTML = '👤 Gost';
        loginBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
        addBookPanel.classList.add('hidden');
    }
});

// LOGIN
loginBtn.onclick = async () => {
    const email = prompt("Email:");
    const pass = prompt("Password:");
    if(email && pass){
        try {
            await signInWithEmailAndPassword(auth, email, pass);
        } catch(e){
            alert("Greška: " + e.message);
        }
    }
};

// LOGOUT
logoutBtn.onclick = () => signOut(auth);

// ADD BOOK
submitBookBtn.onclick = async () => {
    const title = document.getElementById('bookTitle').value;
    const author = document.getElementById('bookAuthor').value;
    const price = document.getElementById('bookPrice').value;

    if(!title || !author || !price){
        alert("Popuni sva polja!");
        return;
    }

    const newRef = push(ref(db, 'books'));
    await set(newRef, {
        title,
        author,
        price,
        user: currentUser.email
    });

    alert("Dodano!");
};

// LOAD BOOKS
function loadBooks(){
    onValue(ref(db, 'books'), (snap)=>{
        const data = snap.val();

        if(!data){
            booksGrid.innerHTML = "Nema knjiga";
            return;
        }

        booksGrid.innerHTML = Object.values(data).map(b => `
            <div class="bg-white p-3 mb-2 rounded shadow">
                <b>${b.title}</b><br>
                ${b.author}<br>
                💰 ${b.price} €<br>
                <small>${b.user}</small>
            </div>
        `).join('');
    });
}

loadBooks();