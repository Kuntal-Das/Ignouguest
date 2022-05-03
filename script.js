import { initializeApp } from "https://www.gstatic.com/firebasejs/9.7.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.7.0/firebase-analytics.js";
// import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.7.0/firebase-lite.js';// 'firebase/firestore/lite';
import { getFirestore, doc, setDoc, getDocs } from 'https://www.gstatic.com/firebasejs/9.7.0/firebase-firestore.js';// 'firebase/firestore/';

import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.7.0/firebase-auth.js";

let user = null, error = null;

const firebaseConfig = {
    apiKey: "AIzaSyC1te_Se5d23huf2YMpI8E3JP2IIYlL8XA",
    authDomain: "ignouguest.firebaseapp.com",
    projectId: "ignouguest",
    storageBucket: "ignouguest.appspot.com",
    messagingSenderId: "617933977684",
    appId: "1:617933977684:web:813f6c9ef6eab654ec15c1",
    measurementId: "G-8K8RY1XG2B"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// async function getGuestsData(db) {
//     const GuestsDataCol = collection(db, 'GuestsData');
//     const GuestsDataSnapshot = await getDocs(citiesCol);
//     const GuestsDataList = citySnapshot.docs.map(doc => doc.data());
//     return GuestsDataList;
// }

async function SaveToDbAsync(formData) {
    try {
        if (user === null) user = auth().currentUser;
        await setDoc(doc(db, "GuestsData", `${uniqueId()}`), formData)
        alert("saved to database");
    }
    catch (er) {
        alert(`Error: ${er.message}`);
    }
}

function GoogleSignIn() {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();

    try {
        const result = await signInWithPopup(auth, provider)
        user = auth().currentUser;
    }
    catch (err) {
        console.log(err.message);
        error = {
            errorCode: err.code,
            errorMessage: err.message,
            email: err.email,
            credential: GoogleAuthProvider.credentialFromError(err),
        };
    }

}

document.addEventListener("DOMContentLoaded", (event) => {

    const fromElmt = document.getElementById("guestForm");
    fromElmt.onsubmit = Submit;

    const firstNameElmt = fromElmt.elements["FirstName"];
    const lastNameElmt = fromElmt.elements["LastName"];
    const emailElmt = fromElmt.elements["Email"];
    const GovtIDElmt = fromElmt.elements["GovtId"];
    const dateOfAElmt = fromElmt.elements["DtOfArrival"];
    const dateOfDElmt = fromElmt.elements["DtOfDeparture"];
    const countryElmt = fromElmt.elements["Country"];
    const noOfPersonsElmt = fromElmt.elements["NoOfPersons"];
    const paymentInfoElmt = fromElmt.elements["PaymentMethod"];

    const idNoElmt = fromElmt.elements["IDno"];
    const idNoLbl = document.getElementById("lblIDno");

    GovtIDElmt.onchange = (e) => {
        if (GovtIDElmt.value === "") {
            idNoElmt.hidden = true;
            idNoLbl.hidden = true;
        } else {
            idNoLbl.innerText = `${GovtIDElmt.value} :`;
            idNoElmt.hidden = false;
            idNoLbl.hidden = false;
            idNoElmt.focus();
        }
    };

    async function Submit(event) {
        event.preventDefault();
        let msg = validateForm();
        if (msg !== "") {
            alert(msg)
            return false;
        }
        if (currentUser === null) GoogleSignIn();

        const formData = {
            Name: `${firstNameElmt.value} ${lastNameElmt.value}`,
            Email: emailElmt.value,
            GovtIDType: GovtIDElmt.value,
            GovtIDNo: idNoElmt.value,
            DateofA: dateOfAElmt.value,
            dateOfD: dateOfDElmt.value,
            Country: countryElmt.value,
            noOfPersons: noOfPersonsElmt.value,
            SpecialReq: fromElmt.elements["AnySpecialReq"].value,
            PaymentType: paymentInfoElmt.value,
        }

        await SaveToDbAsync(formData);
        fromElmt.reset();
        return true;
    }

    function validateForm() {
        let emailvalid = String(emailElmt.value).match("^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$");

        if (firstNameElmt.value.length <= 2) {
            firstNameElmt.focus();
            return "First Name not valid";
        } else if (lastNameElmt.value.length <= 1) {
            lastNameElmt.focus();
            return "Last Name not valid";
        } else if (emailvalid.length === 0) {
            emailElmt.focus();
            return "Email address not valid";
        } else if (GovtIDElmt.value === "") {
            GovtIDElmt.focus();
            return "Select Govt. Issued ID correctly";
        } else if (idNoElmt.value.length <= 3) {
            idNoElmt.focus();
            return `Input ${GovtIDElmt.value} details correctly`;
        } else if (isDatesInvalid(dateOfAElmt.value, dateOfDElmt.value)) {
            dateOfAElmt.focus();
            return "Input vaild arrival departure date";
        } else if (noOfPersonsElmt.value < 0 || noOfPersonsElmt.value > 100) {
            noOfPersonsElmt.focus();
            return "No of persons shold be between 1 to 100";
        } else if (countryElmt.value === "") {
            countryElmt.focus();
            return "Select Country correctly";
        } else if (paymentInfoElmt.value === "") {
            return "Select correct payment method";
        } else return "";
    }
});

function isDatesInvalid(aDate, dDate) {
    try {
        let adt = new Date(aDate);
        let ddt = new Date(dDate);
        if (adt > ddt) {
            return true;
        }
    } catch (ex) {
        return true
    }
    return false;
}

const uniqueId = (length = 16) => {
    return parseInt(Math.ceil(Math.random() * Date.now()).toPrecision(length).toString().replace(".", ""))
}