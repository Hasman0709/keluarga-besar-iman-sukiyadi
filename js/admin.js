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

const judulForm = document.getElementById("judulForm");
const simpanBtn = document.getElementById("simpanBtn");
const batalBtn = document.getElementById("batalBtn");
const jumlahAnggota = document.getElementById("jumlahAnggota");

let dataAnggota = [];
let editId = null;

const anggotaRef = collection(db, "anggota");

// PEMERIKSAAN LOGIN ADMIN
onAuthStateChanged(auth, async (user) => {
if (!user || user.uid !== ADMIN_UID) {
alert("Silakan login sebagai admin!");
window.location.href = "login.html";
return;
}

await muatAnggota();
});

// MEMUAT DATA ANGGOTA
async function muatAnggota() {
try {
jumlahAnggota.textContent = "Memuat data...";

const hasil = await getDocs(anggotaRef);

dataAnggota = hasil.docs.map(item => ({
  ...item.data(),
  id: item.id
}));

dataAnggota.sort((a, b) =>
  (a.nama || "").localeCompare(b.nama || "", "id")
);

tampilkanAnggota();
isiPilihanOrang();

} catch (error) {
console.error(error);
jumlahAnggota.textContent = "Gagal memuat data anggota.";
alert("Gagal mengambil data: " + error.message);
}
}

// PILIHAN AYAH DAN IBU
function isiPilihanOrang() {
[ayahId, ibuId].forEach(pilihan => {
const nilaiLama = pilihan.value;

pilihan.replaceChildren();

const kosong = document.createElement("option");
kosong.value = "";
kosong.textContent = "Belum diketahui / tidak ada";
pilihan.appendChild(kosong);

dataAnggota.forEach(orang => {
  if (orang.id === editId) return;

  const opsi = document.createElement("option");
  opsi.value = orang.id;
  opsi.textContent = orang.nama || "Tanpa nama";

  pilihan.appendChild(opsi);
});

pilihan.value = nilaiLama;

});
}

// MENAMPILKAN DAFTAR ANGGOTA
function tampilkanAnggota() {
daftar.replaceChildren();

jumlahAnggota.textContent =
"Jumlah anggota: " + dataAnggota.length;

if (dataAnggota.length === 0) {
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

// MEMERIKSA HUBUNGAN SILSILAH
function adaHubunganBerputar(parentId, targetId) {
if (!parentId || !targetId) return false;

const diperiksa = new Set();

function telusuri(id) {
if (id === targetId) return true;
if (!id || diperiksa.has(id)) return false;

diperiksa.add(id);

const orang = dataAnggota.find(item => item.id === id);
if (!orang) return false;

return (
  telusuri(orang.ayahId) ||
  telusuri(orang.ibuId)
);

}

return telusuri(parentId);
}

// MENYIMPAN ATAU MEMPERBARUI ANGGOTA
form.addEventListener("submit", async (e) => {
e.preventDefault();

const data = {
nama: nama.value.trim(),
jenisKelamin: jenisKelamin.value,
tanggalLahir: tanggalLahir.value,
ayahId: ayahId.value,
ibuId: ibuId.value
};

if (!data.nama) {
alert("Nama harus diisi!");
return;
}

if (data.ayahId && data.ayahId === data.ibuId) {
alert("Ayah dan ibu tidak boleh sama.");
return;
}

const ayah = dataAnggota.find(item => item.id === data.ayahId);
const ibu = dataAnggota.find(item => item.id === data.ibuId);

if (ayah && ayah.jenisKelamin &&
ayah.jenisKelamin !== "Laki-laki") {
alert("Ayah harus dipilih dari anggota laki-laki.");
return;
}

if (ibu && ibu.jenisKelamin &&
ibu.jenisKelamin !== "Perempuan") {
alert("Ibu harus dipilih dari anggota perempuan.");
return;
}

if (editId) {
if (
adaHubunganBerputar(data.ayahId, editId) ||
adaHubunganBerputar(data.ibuId, editId)
) {
alert("Hubungan ini akan membuat silsilah berputar. Periksa kembali ayah dan ibu.");
return;
}
}

simpanBtn.disabled = true;
simpanBtn.textContent = "Menyimpan...";

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
console.error(error);
alert("Gagal menyimpan: " + error.message);

} finally {
simpanBtn.disabled = false;
simpanBtn.textContent = editId
? "Perbarui Data"
: "💾 Simpan Anggota";
}
});

// MEMULAI EDIT
function mulaiEdit(orang) {
editId = orang.id;

isiPilihanOrang();

nama.value = orang.nama || "";
jenisKelamin.value = orang.jenisKelamin || "";
tanggalLahir.value = orang.tanggalLahir || "";
ayahId.value = orang.ayahId || "";
ibuId.value = orang.ibuId || "";

judulForm.textContent = "Edit Anggota Keluarga";
simpanBtn.textContent = "Perbarui Data";
batalBtn.hidden = false;

window.scrollTo({
top: 0,
behavior: "smooth"
});
}

// MENGHAPUS ANGGOTA
async function hapusAnggota(orang) {
const dipakai = dataAnggota.some(item =>
item.ayahId === orang.id ||
item.ibuId === orang.id
);

if (dipakai) {
alert(
"Anggota ini masih menjadi ayah atau ibu anggota lain. " +
"Perbarui hubungan anaknya terlebih dahulu."
);
return;
}

const yakin = confirm(
"Apakah Anda yakin ingin menghapus " +
orang.nama + "?"
);

if (!yakin) return;

try {
await deleteDoc(doc(db, "anggota", orang.id));

alert("Anggota berhasil dihapus!");

resetForm();
await muatAnggota();

} catch (error) {
console.error(error);
alert("Gagal menghapus: " + error.message);
}
}

// RESET FORM
function resetForm() {
form.reset();
editId = null;

judulForm.textContent = "Tambah Anggota Keluarga";
simpanBtn.textContent = "💾 Simpan Anggota";
batalBtn.hidden = true;

isiPilihanOrang();
}

// TOMBOL BATAL EDIT
batalBtn.onclick = resetForm;

// KELUAR DARI ADMIN
document.getElementById("logoutBtn").onclick = async () => {
try {
await signOut(auth);
window.location.href = "login.html";
} catch (error) {
alert("Gagal keluar: " + error.message);
}
};
