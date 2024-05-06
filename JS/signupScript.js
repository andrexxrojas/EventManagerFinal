// Import the functions you need from the SDKs you need
import { manageUser, pushWithCustomId } from "/JS/fireScript.js";

let Username = document.getElementById('username');
let Email = document.getElementById('email');
let Password = document.getElementById('password');
let User_type = document.getElementById('user_type');
let SignupForm = document.getElementById('signupForm');
let RegisterUser = evt => {
    evt.preventDefault();
    manageUser('SIGNUP', Email.value, Password.value)
        .then((credentials) => {
            const resource = {
                username: Username.value,
                email: Email.value,
                password: Password.value,
                user_type: User_type.value,
            }
            pushWithCustomId('UsersAuthList/' + credentials.user.uid, resource)
            window.alert("Sign up successful!");

        })
        .catch((error) => {
            alert(error.message);
            //console.log(error.code);
            console.error(error.message);
        })

}

SignupForm.addEventListener('submit', RegisterUser);
