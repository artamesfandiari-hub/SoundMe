/* =========================================================
   SOUNDME AUTH SYSTEM
   auth.js
========================================================= */

const AUTH_KEY = "soundme_user";
const USERS_KEY = "soundme_users";


/* =========================================================
   HELPERS
========================================================= */

function getUsers() {
  try {
    return JSON.parse(
      localStorage.getItem(USERS_KEY)
    ) || [];
  } catch (error) {
    return [];
  }
}


function saveUsers(users) {
  localStorage.setItem(
    USERS_KEY,
    JSON.stringify(users)
  );
}


function getCurrentUser() {
  try {
    return JSON.parse(
      localStorage.getItem(AUTH_KEY)
    );
  } catch (error) {
    return null;
  }
}


function isLoggedIn() {
  return !!getCurrentUser();
}


function logout() {
  localStorage.removeItem(AUTH_KEY);

  window.dispatchEvent(
    new Event("soundme-auth-change")
  );

  window.location.href = "index.html";
}


/* =========================================================
   REGISTER
========================================================= */

function registerUser(username, email, password) {

  username = username.trim();
  email = email.trim().toLowerCase();

  if (!username || !email || !password) {
    return {
      success: false,
      message: "Please fill in all fields."
    };
  }

  if (password.length < 6) {
    return {
      success: false,
      message: "Password must be at least 6 characters."
    };
  }

  const users = getUsers();

  const existingUser = users.find(
    user =>
      user.email.toLowerCase() === email
  );

  if (existingUser) {
    return {
      success: false,
      message: "An account with this email already exists."
    };
  }

  const existingUsername = users.find(
    user =>
      user.username.toLowerCase() ===
      username.toLowerCase()
  );

  if (existingUsername) {
    return {
      success: false,
      message: "This username is already taken."
    };
  }

  const user = {
    id:
      "user_" +
      Date.now() +
      "_" +
      Math.random()
        .toString(36)
        .substring(2, 9),

    username,

    email,

    password,

    createdAt:
      new Date().toISOString()
  };

  users.push(user);

  saveUsers(users);

  localStorage.setItem(
    AUTH_KEY,
    JSON.stringify({
      id: user.id,
      username: user.username,
      email: user.email
    })
  );

  window.dispatchEvent(
    new Event("soundme-auth-change")
  );

  return {
    success: true,
    user: getCurrentUser()
  };
}


/* =========================================================
   LOGIN
========================================================= */

function loginUser(email, password) {

  email = email.trim().toLowerCase();

  const users = getUsers();

  const user = users.find(
    item =>
      item.email.toLowerCase() === email &&
      item.password === password
  );

  if (!user) {
    return {
      success: false,
      message: "Invalid email or password."
    };
  }

  const sessionUser = {
    id: user.id,
    username: user.username,
    email: user.email
  };

  localStorage.setItem(
    AUTH_KEY,
    JSON.stringify(sessionUser)
  );

  window.dispatchEvent(
    new Event("soundme-auth-change")
  );

  return {
    success: true,
    user: sessionUser
  };
}


/* =========================================================
   AUTH GUARD
========================================================= */

function requireLogin() {

  if (!isLoggedIn()) {

    window.location.href =
      "login.html";

    return false;
  }

  return true;
}


/* =========================================================
   REDIRECT IF ALREADY LOGGED IN
========================================================= */

function redirectIfLoggedIn() {

  if (isLoggedIn()) {

    window.location.href =
      "index.html";
  }
}


/* =========================================================
   USER UI
========================================================= */

function updateAuthUI() {

  const user =
    getCurrentUser();

  const loginButtons =
    document.querySelectorAll(
      "[data-auth-login]"
    );

  const logoutButtons =
    document.querySelectorAll(
      "[data-auth-logout]"
    );

  const userNames =
    document.querySelectorAll(
      "[data-user-name]"
    );


  if (user) {

    loginButtons.forEach(
      element => {
        element.style.display =
          "none";
      }
    );

    logoutButtons.forEach(
      element => {
        element.style.display =
          "";
      }
    );

    userNames.forEach(
      element => {
        element.textContent =
          user.username;
      }
    );

  } else {

    loginButtons.forEach(
      element => {
        element.style.display =
          "";
      }
    );

    logoutButtons.forEach(
      element => {
        element.style.display =
          "none";
      }
    );

    userNames.forEach(
      element => {
        element.textContent =
          "";
      }
    );

  }

}


/* =========================================================
   LOGIN FORM
========================================================= */

function setupLoginForm() {

  const form =
    document.querySelector(
      "#loginForm"
    );

  if (!form) {
    return;
  }


  form.addEventListener(
    "submit",
    event => {

      event.preventDefault();

      const email =
        form.querySelector(
          '[name="email"]'
        )?.value || "";

      const password =
        form.querySelector(
          '[name="password"]'
        )?.value || "";


      const result =
        loginUser(
          email,
          password
        );


      if (!result.success) {

        showAuthMessage(
          form,
          result.message,
          "error"
        );

        return;
      }


      showAuthMessage(
        form,
        "Login successful.",
        "success"
      );


      setTimeout(
        () => {

          window.location.href =
            "index.html";

        },
        300
      );

    }
  );

}


/* =========================================================
   REGISTER FORM
========================================================= */

function setupRegisterForm() {

  const form =
    document.querySelector(
      "#registerForm"
    );

  if (!form) {
    return;
  }


  form.addEventListener(
    "submit",
    event => {

      event.preventDefault();


      const username =
        form.querySelector(
          '[name="username"]'
        )?.value || "";

      const email =
        form.querySelector(
          '[name="email"]'
        )?.value || "";

      const password =
        form.querySelector(
          '[name="password"]'
        )?.value || "";

      const confirmPassword =
        form.querySelector(
          '[name="confirmPassword"]'
        )?.value || "";


      if (
        password !==
        confirmPassword
      ) {

        showAuthMessage(
          form,
          "Passwords do not match.",
          "error"
        );

        return;
      }


      const result =
        registerUser(
          username,
          email,
          password
        );


      if (!result.success) {

        showAuthMessage(
          form,
          result.message,
          "error"
        );

        return;
      }


      showAuthMessage(
        form,
        "Account created successfully.",
        "success"
      );


      setTimeout(
        () => {

          window.location.href =
            "index.html";

        },
        300
      );

    }
  );

}


/* =========================================================
   AUTH MESSAGE
========================================================= */

function showAuthMessage(
  form,
  message,
  type = "error"
) {

  let messageElement =
    form.querySelector(
      ".auth-message"
    );


  if (!messageElement) {

    messageElement =
      document.createElement(
        "div"
      );

    messageElement.className =
      "auth-message";

    form.prepend(
      messageElement
    );

  }


  messageElement.textContent =
    message;

  messageElement.dataset.type =
    type;

}


/* =========================================================
   LOGOUT BUTTONS
========================================================= */

function setupLogoutButtons() {

  document
    .querySelectorAll(
      "[data-auth-logout]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          event => {

            event.preventDefault();

            logout();

          }
        );

      }
    );

}


/* =========================================================
   INITIALIZE AUTH
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    setupLoginForm();

    setupRegisterForm();

    setupLogoutButtons();

    updateAuthUI();

  }
);


/* =========================================================
   GLOBAL AUTH API
========================================================= */

window.SoundMeAuth = {

  login:
    loginUser,

  register:
    registerUser,

  logout,

  getUser:
    getCurrentUser,

  isLoggedIn,

  requireLogin,

  redirectIfLoggedIn,

  updateUI:
    updateAuthUI

};
