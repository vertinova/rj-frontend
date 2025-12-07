// assets/js/admin.js

// Get the modal elements once
const detailModal = document.getElementById('detailModal');
const closeButton = document.querySelector('.close-button');
const viewDocsButtons = document.querySelectorAll('.view-docs-btn');

// Get the elements where details will be displayed
const modalId = document.getElementById('modal-id');
const modalNamaLengkap = document.getElementById('modal-nama_lengkap');
const modalEmail = document.getElementById('modal-email');
const modalWhatsapp = document.getElementById('modal-whatsapp');
const modalTempatTanggalLahir = document.getElementById('modal-tempat_tanggal_lahir');
const modalAlamat = document.getElementById('modal-alamat');
const modalNamaOrangtua = document.getElementById('modal-nama_orangtua');
const modalPendidikanTerakhir = document.getElementById('modal-pendidikan_terakhir');
const modalTinggiBadan = document.getElementById('modal-tinggi_badan');
const modalBeratBadan = document.getElementById('modal-berat_badan');
const modalPilihanKampus = document.getElementById('modal-pilihan_kampus');
const modalAlasan = document.getElementById('modal-alasan');

const modalFotoDiriPreview = document.getElementById('modal-foto_diri_preview');
const modalFotoDiriLink = document.getElementById('modal-foto_diri_link');
const modalSuratIzinLink = document.getElementById('modal-surat_izin_link');
const modalSuratKeteranganSehatLink = document.getElementById('modal-surat_keterangan_sehat_link');

// Define the base path for uploads relative to your domain root
// Ini harus menjadi path absolut dari root domain Anda ke folder 'uploads'
const UPLOADS_BASE_PATH = '/rajawali/user/uploads/'; 

viewDocsButtons.forEach(button => {
    button.addEventListener('click', function() {
        // Populate modal with general info
        modalId.textContent = this.dataset.id;
        modalNamaLengkap.textContent = this.dataset.nama;
        modalEmail.textContent = this.dataset.email;
        modalWhatsapp.textContent = this.dataset.whatsapp;
        modalTempatTanggalLahir.textContent = `${this.dataset.lahirTempat}, ${this.dataset.lahirTanggal}`;
        modalAlamat.textContent = this.dataset.alamat;
        modalNamaOrangtua.textContent = this.dataset.orangtua;
        modalPendidikanTerakhir.textContent = this.dataset.pendidikan;
        modalTinggiBadan.textContent = this.dataset.tinggi;
        modalBeratBadan.textContent = this.dataset.berat;
        modalPilihanKampus.textContent = this.dataset.kampus;
        modalAlasan.textContent = this.dataset.alasan;

        // Construct full paths for documents using the base path
        const fotoDiri = this.dataset.foto;
        const suratIzin = this.dataset.izin;
        const suratSehat = this.dataset.sehat;

        // Foto Diri
        if (fotoDiri) {
            const fotoUrl = UPLOADS_BASE_PATH + fotoDiri;
            modalFotoDiriPreview.src = fotoUrl;
            modalFotoDiriLink.href = fotoUrl;
            modalFotoDiriPreview.style.display = 'block';
            modalFotoDiriLink.style.display = 'inline-flex';
        } else {
            modalFotoDiriPreview.style.display = 'none';
            modalFotoDiriLink.style.display = 'none';
        }

        // Surat Izin Orang Tua
        if (suratIzin) {
            modalSuratIzinLink.href = UPLOADS_BASE_PATH + suratIzin;
            modalSuratIzinLink.style.display = 'inline-flex';
        } else {
            modalSuratIzinLink.style.display = 'none';
        }

        // Surat Keterangan Sehat
        if (suratSehat) {
            modalSuratKeteranganSehatLink.href = UPLOADS_BASE_PATH + suratSehat;
            modalSuratKeteranganSehatLink.style.display = 'inline-flex';
        } else {
            modalSuratKeteranganSehatLink.style.display = 'none';
        }

        detailModal.style.display = 'block';
    });
});

closeButton.addEventListener('click', function() {
    detailModal.style.display = 'none';
});

window.addEventListener('click', function(event) {
    if (event.target == detailModal) {
        detailModal.style.display = 'none';
    }
});