import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

const ADMIN_UID = "9h5mI5smFLXFYs6pK7wlTrsUJV83";

const form = document.getElementById("anggotaForm");
const daftar = document.getElementById("daftarAnggota");

const nama = document.getElementById("nama");
const jenisKelamin = document.getElementById("jenisKelamin");
const tanggalLahir = document.getElementById("tanggalLahir");
const ayahId = document.getElementById("ayahId");
const ibuId = document.getElementById("ibuId");

let dataAnggota = [];
let editId = null;

const anggotaRef = collection(db, "anggota");

onAuthStateChanged(auth, async (user) => {
  if (!user || user.uid !== ADMIN_UID) {
    alert("Silakan login sebagai admin!");
    window.location.href = "login.html";
    return;
  }

  await muatAnggota();
});

async function muatAnggota() {
  try {
    const hasil = await getDocs(anggotaRef);

    dataAnggota = hasil.docs.map(item => ({
      id: item.id,
      ...item.data()
    }));

    tampilkanAnggota();
    isiPilihanOrang();

  } catch (error) {
    alert("Gagal mengambil data: " + error.message);
  }
}

function isiPilihanOrang() {
  [ayahId, ibuId].forEach(pilihan => {
    pilihan.replaceChildren();

    const kosong = document.createElement("option");
    kosong.value = "";
    kosong.textContent = "Belum diketahui / tidak ada";
    pilihan.appendChild(kosong);

    dataAnggota.forEach(orang => {
      const opsi = document.createElement("option");
      opsi.value = orang.id;
      opsi.textContent = orang.nama;
      pilihan.appendChild(opsi);
    });
  });
}

function tampilkanAnggota() {
  daftar.replaceChildren();

  document.getElementById("jumlahAnggota").textContent =
    "Jumlah anggota: " + dataAnggota.length;

  if (!dataAnggota.length) {
    daftar.textContent = "Belum ada anggota keluarga.";
    return;
  }

  dataAnggota.forEach(orang => {
    const kotak = document.createElement("div");
    kotak.className = "anggota";

    const judul = document.createElement("strong");
    judul.textContent = orang.nama || "Tanpa nama";

    const info = document.createElement("p");
    info.textContent =
      (orang.jenisKelamin || "-") + " | " +
      (orang.tanggalLahir || "Tanggal lahir belum diisi");

    const edit = document.createElement("button");
    edit.className = "edit";
    edit.textContent = "Edit";
    edit.onclick = () => mulaiEdit(orang);

    const hapus = document.createElement("button");
    hapus.className = "hapus";
    hapus.textContent = "Hapus";
    hapus.onclick = () => hapusAnggota(orang);

    kotak.append(judul, info, edit, hapus);
    daftar.appendChild(kotak);
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    nama: nama.value.trim(),
    jenisKelamin: jenisKelamin.value,
    tanggalLahir: tanggalLahir.value,
    ayahId: ayahId.value,
    ibuId: ibuId.value
  };

  if (!data.nama) return alert("Nama harus diisi!");

  if (data.ayahId && data.ayahId === data.ibuId) {
    return alert("Ayah dan ibu tidak boleh sama.");
  }

  try {
    if (editId) {
      await updateDoc(doc(db, "anggota", editId), data);
      alert("Data berhasil diperbarui!");
    } else {
      await addDoc(anggotaRef, data);
      alert("Anggota berhasil ditambahkan!");
    }

    resetForm();
    await muatAnggota();

  } catch (error) {
    alert("Gagal menyimpan: " + error.message);
  }
});

function mulaiEdit(orang) {
  editId = orang.id;
  nama.value = orang.nama || "";
  jenisKelamin.value = orang.jenisKelamin || "";
  tanggalLahir.value = orang.tanggalLahir || "";
  ayahId.value = orang.ayahId || "";
  ibuId.value = orang.ibuId || "";

  document.getElementById("judulForm").textContent = "Edit Anggota Keluarga";
  document.getElementById("simpanBtn").textContent = "Perbarui Data";
  document.getElementById("batalBtn").hidden = false;

  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function hapusAnggota(orang) {
  const dipakai = dataAnggota.some(item =>
    item.ayahId === orang.id || item.ibuId === orang.id
  );

  if (dipakai) {
    alert("Perbarui hubungan anaknya terlebih dahulu.");
    return;
  }

  if (!confirm("Hapus anggota " + orang.nama + "?")) return;

  try {
    await deleteDoc(doc(db, "anggota", orang.id));
    alert("Anggota berhasil dihapus!");
    await muatAnggota();
  } catch (error) {
    alert("Gagal menghapus: " + error.message);
  }
}

function resetForm() {
  form.reset();
  editId = null;
  document.getElementById("judulForm").textContent = "Tambah Anggota Keluarga";
  document.getElementById("simpanBtn").textContent = "Simpan Anggota";
  document.getElementById("batalBtn").hidden = true;
}

document.getElementById("batalBtn").onclick = resetForm;

document.getElementById("logoutBtn").onclick = async () => {
  await signOut(auth);
  window.location.href = "login.html";
};
