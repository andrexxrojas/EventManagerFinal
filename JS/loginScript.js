import { manageUser, getList } from "/JS/fireScript.js";

let email = document.getElementById('email');
let password = document.getElementById('password');
let loginForm = document.getElementById('loginForm');

let SignInUser = evt => {
    evt.preventDefault();

    manageUser('LOGIN', email.value, password.value)
        .then((credentials) => {
            getList('UsersAuthList/' + credentials.user.uid)
                .then(async (snapshot) => {
                    if (snapshot.exists) {
                        sessionStorage.setItem("user-info", JSON.stringify({
                            email: snapshot.val().email,
                            user_type: snapshot.val().user_type
                        }))
                        sessionStorage.setItem("user-creds", JSON.stringify(credentials.user));
                        switch (snapshot.val().user_type.toLowerCase()) {
                            case 'guest':
                                window.location.href = 'table-guest.html';
                                localStorage.setItem("authToken", generateToken(4))
                                break;
                            case 'admin':
                                await validateConsent().then(() => {
                                    window.location.href = 'admin-dashboard.html';
                                })
                                localStorage.setItem("authToken", generateToken(5))
                                break;
                            case 'member':
                                await validateConsent().then(() => {
                                    window.location.href = 'hub.html';
                                })
                                localStorage.setItem("authToken", generateToken(6))
                                break;
                            default:
                                console.error('Unknown user type');
                        }
                    }
                })
        })
        .catch((error) => {
            alert(error.message);
            console.log(error.code);
            console.error(error.message);
        })
}

function generateToken(length) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

loginForm.addEventListener('submit', SignInUser)
