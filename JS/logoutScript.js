import { manageUser } from "/JS/fireScript.js";

const signoutButton = document.getElementById('signoutbutton');
signoutButton.addEventListener('click', () => {
    manageUser('LOGOUT').then(() => {
        localStorage.removeItem("authToken");
        setCookie('TOKEN_RESPONSE', getCookie("TOKEN_RESPONSE"), 11)
        setCookie('EXPIRY_MILLI', 11, '')
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error(error);
    });
});