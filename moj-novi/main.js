// Dohvaćanje elementa za prikaz izlaza iz HTML-a
const outputDiv = document.getElementById('output');

/**
 * Prikazuje poruku u divu 'output' i u konzoli preglednika.
 * Ograničava broj poruka u divu da spriječi preopterećenje.
 * @param {string} message Poruka za prikaz.
 */
function logToOutput(message) {
    // Kreira novi <p> element za svaku poruku
    const pElement = document.createElement('p');
    pElement.textContent = message;
    outputDiv.appendChild(pElement);

    // Ograničava broj prikazanih poruka na 10, uklanjajući najstarije
    if (outputDiv && outputDiv.children.length > 10) {
        outputDiv.removeChild(outputDiv.firstElementChild);
    }
    // Automatsko skrolanje na dno div-a za prikaz najnovijih poruka
    outputDiv.scrollTop = outputDiv.scrollHeight;
    console.log(message); // Uvijek logiramo i u konzolu preglednika
}

// Import potrebnih funkcija iz Firebase SDK-a
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import {
    getDatabase,     // Za dohvaćanje instance baze podataka
    ref,             // Za kreiranje referenci na lokacije u bazi
    set,             // Za pisanje/zamjenu podataka
    push,            // Za dodavanje novih podataka s automatskim ID-em
    onValue,         // Za slušanje promjena podataka u realnom vremenu
    update,          // Za djelomično ažuriranje podataka
    remove           // Za brisanje podataka
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-analytics.js"; // Zakomentirano ako se ne koristi

// Tvoja web aplikacija's Firebase konfiguracija (preuzeta direktno iz tvog prijašnjeg upita)
// PROVJERI DA SU OVI PODACI ISPRAVNI ZA TVOJ PROJEKT!
const firebaseConfig = {
    apiKey: "AIzaSyCO7QLZsCxQeY6uHYbtaByg2exqtfCM0G0",
    authDomain: "zavrsnipetradaniela.firebaseapp.com",
    databaseURL: "https://zavrsnipetradaniela-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "zavrsnipetradaniela",
    storageBucket: "zavrsnipetradaniela.firebasestorage.app",
    messagingSenderId: "1016932466553",
    appId: "1:1016932466553:web:994b6d55d4d04efa8939a8",
    measurementId: "G-B7ZB4CZJK4"
};

// Inicijalizacija Firebase aplikacije
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); // Inicijaliziraj ako koristiš Google Analytics

// Dohvaćanje instance Firebase Realtime Database
const database = getDatabase(app);

// --- POMOĆNA KLASA/OBJEKT ZA KORISNIKA ---
class Korisnik {
    constructor(ime, email, dob = null, grad = null) {
        this.ime = ime;
        this.email = email;
        if (dob !== null) this.dob = dob;
        if (grad !== null) this.grad = grad;
    }
}

// -------------------------------------------------------------
// FUNKCIJE ZA CRUD OPERACIJE (Create, Read, Update, Delete)
// -------------------------------------------------------------

/**
 * Dodaje ili ažurira podatke na određenoj putanji u Realtime Databaseu koristeći `set()`.
 * Ako podaci već postoje na toj putanji, bit će zamijenjeni.
 * @param {string} putanja Putanja u bazi podataka (npr. 'korisnici/nekiId').
 * @param {object} podaci Objekt s podacima za spremanje.
 */
function dodajIliAzurirajPodatak(putanja, podaci) {
    const dataRef = ref(database, putanja);
    set(dataRef, podaci)
    .then(() => {
        logToOutput(`[SET] Podatak na "${putanja}" uspješno dodan/ažuriran.`);
    })
    .catch((error) => {
        logToOutput(`[SET GREŠKA] Pri dodavanju/ažuriranju na "${putanja}": ${error.message}`);
        console.error("Firebase SET greška: ", error);
    });
}

/**
 * Dodaje novi podatak u listu s automatski generiranim jedinstvenim ID-em koristeći `push()`.
 * Korisno za liste stavki gdje redoslijed i jedinstveni ID-evi nisu unaprijed poznati.
 * @param {string} putanja Putanja do liste (npr. 'poruke').
 * @param {object} podaci Objekt s podacima za novu stavku.
 */
function dodajNoviPodatakSAutomatskimId(putanja, podaci) {
    const listRef = ref(database, putanja);
    const newRef = push(listRef); // Generira novi jedinstveni ključ
    set(newRef, podaci)
    .then(() => {
        logToOutput(`[PUSH] Novi podatak dodan na "${putanja}" s ID-em: ${newRef.key}`);
    })
    .catch((error) => {
        logToOutput(`[PUSH GREŠKA] Pri dodavanju novog podatka na "${putanja}": ${error.message}`);
        console.error("Firebase PUSH greška: ", error);
    });
}

/**
 * Sluša promjene podataka u realnom vremenu na određenoj putanji koristeći `onValue()`.
 * Funkcija se poziva odmah s početnim podacima, a zatim svaki put kada se podaci promijene.
 * @param {string} putanja Putanja u bazi podataka za slušanje (npr. 'korisnici').
 */
function slusajPromjenePodataka(putanja) {
    const dataRef = ref(database, putanja);
    onValue(dataRef, (snapshot) => {
        const podaci = snapshot.val(); // Dohvaća podatke
        if (podaci) {
            logToOutput(`[ONVALUE] Podaci s putanje "${putanja}" su se promijenili/dohvaćeni: ${JSON.stringify(podaci, null, 2)}`);
        } else {
            logToOutput(`[ONVALUE] Nema podataka na putanji: ${putanja} (ili su obrisani).`);
        }
    }, (error) => { // Greška se obrađuje kao zaseban callback za onValue
        logToOutput(`[ONVALUE GREŠKA] Pri slušanju "${putanja}": ${error.message}`);
        console.error("Firebase ONVALUE greška: ", error);
    });
    logToOutput(`Počelo slušanje promjenaNo response
    na putanji: ${putanja}`);
}
