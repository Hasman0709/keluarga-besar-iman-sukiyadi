import { auth } from "./firebase.js";

import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";

const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document
    .getElementById("username")
    .value.trim();

  const password = document
    .getElementById("password")
    .value;

  if (username !== "admin") {
    alert("Nama pengguna salah!");
    return;
  }

  try {
    await signInWithEmailAndPassword(
      auth,
      "admin@keluarga-besar-iman-suki-91989.firebaseapp.com",
      password
    );

    alert("Login berhasil!");

    window.location.href = "admin.html";

  } catch (error) {
    alert("Login gagal! Periksa password Anda.");
  }
});
