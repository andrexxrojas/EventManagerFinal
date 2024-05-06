const token = localStorage.getItem("authToken");

const tests = {}
tests['guest'] = 4;
tests['admin'] = 5;
tests['member'] = 6;

const currentPage = window.location.pathname; // Get current page path
const isLoginPage = currentPage.endsWith("/index.html"); // Check if login page

if (!token || token.length !== tests[`${document.querySelector('body').dataset.roleK}`] && !isLoginPage) {
  window.location.href = "/index.html";
}