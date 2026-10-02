document.addEventListener('DOMContentLoaded', async () => {
    const session = await checkSession();
    if (session) {
        showDashboard();
    } else {
        showLogin();
    }

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('admin-email').value;
        const password = document.getElementById('admin-password').value;
        const errorEl = document.getElementById('login-error');

        try {
            await loginAdmin(email, password);
            showDashboard();
        } catch (err) {
            errorEl.textContent = 'Login gagal: ' + err.message;
            errorEl.classList.remove('hidden');
        }
    });

    document.getElementById('logout-btn').addEventListener('click', async () => {
        await logoutAdmin();
        showLogin();
    });

    document.getElementById('crud-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleFormSubmit(e);
    });
});

function showLogin() {
    document.getElementById('login-container').classList.remove('hidden');
    document.getElementById('dashboard-container').classList.add('hidden');
}

async function showDashboard() {
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('dashboard-container').classList.remove('hidden');
    await loadAllAdminData();
}

async function loadAllAdminData() {
    await loadAdminPengurus();
    await loadAdminAgenda();
    await loadAdminKarya();
}

async function loadAdminPengurus() {
    const data = await fetchPengurus();
    const tbody = document.getElementById('table-pengurus');
    tbody.innerHTML = data.map(item => `
        <tr>
            <td class="p-3 font-medium">${item.nama}</td>
            <td class="p-3">${item.jabatan}</td>
            <td class="p-3">${item.divisi}</td>
            <td class="p-3">${item.prodi}</td>
            <td class="p-3">${item.angkatan}</td>
            <td class="p-3 text-center space-x-2">
                <button onclick='editData("pengurus", ${JSON.stringify(item)})' class="text-indigo-600 hover:underline">Edit</button>
                <button onclick='deleteData("pengurus", "${item.id}")' class="text-red-600 hover:underline">Hapus</button>
            </td>
        </tr>
    `).join('');
}

async function loadAdminAgenda() {
    const data = await fetchAgenda();
    const tbody = document.getElementById('table-agenda');
    tbody.innerHTML = data.map(item => `
        <tr>
            <td class="p-3 font-medium">${item.kegiatan}</td>
            <td class="p-3">${item.waktu}</td>
            <td class="p-3">${item.jenis}</td>
            <td class="p-3">${item.file_pdf ? `<a href="${item.file_pdf}" target="_blank" class="text-indigo-600 underline">Buka PDF</a>` : (item.foto_url ? '<img src="'+item.foto_url+'" class="w-10 h-10 object-cover rounded">' : '-')}</td>
            <td class="p-3 text-center space-x-2">
                <button onclick='editData("agenda", ${JSON.stringify(item)})' class="text-indigo-600 hover:underline">Edit</button>
                <button onclick='deleteData("agenda", "${item.id}")' class="text-red-600 hover:underline">Hapus</button>
            </td>
        </tr>
    `).join('');
}

async function loadAdminKarya() {
    const data = await fetchKarya();
    const tbody = document.getElementById('table-karya');
    tbody.innerHTML = data.map(item => `
        <tr>
            <td class="p-3 font-medium">${item.judul}</td>
            <td class="p-3">${item.jenis}</td>
            <td class="p-3">${item.penulis}</td>
            <td class="p-3">${item.tahun}</td>
            <td class="p-3">${item.file_pdf ? `<a href="${item.file_pdf}" target="_blank" class="text-indigo-600 underline">Buka PDF</a>` : (item.foto_url ? '<img src="'+item.foto_url+'" class="w-10 h-10 object-cover rounded">' : '-')}</td>
            <td class="p-3 text-center space-x-2">
                <button onclick='editData("karya", ${JSON.stringify(item)})' class="text-indigo-600 hover:underline">Edit</button>
                <button onclick='deleteData("karya", "${item.id}")' class="text-red-600 hover:underline">Hapus</button>
            </td>
        </tr>
    `).join('');
}

function openModal(type, data = null) {
    document.getElementById('crud-modal').classList.remove('hidden');
    document.getElementById('modal-type').value = type;
    document.getElementById('modal-id').value = data ? data.id : '';
    document.getElementById('modal-title').textContent = (data ? 'Edit ' : 'Tambah ') + type.charAt(0).toUpperCase() + type.slice(1);

    const fieldsContainer = document.getElementById('form-fields');
    if (type === 'pengurus') {
        fieldsContainer.innerHTML = `
            <div><label class="block text-xs font-semibold mb-1">Nama</label><input type="text" id="f-nama" value="${data?.nama || ''}" required class="w-full p-2 border rounded"></div>
            <div><label class="block text-xs font-semibold mb-1">Jabatan</label><input type="text" id="f-jabatan" value="${data?.jabatan || ''}" required class="w-full p-2 border rounded"></div>
            <div><label class="block text-xs font-semibold mb-1">Divisi</label><input type="text" id="f-divisi" value="${data?.divisi || ''}" required class="w-full p-2 border rounded"></div>
            <div><label class="block text-xs font-semibold mb-1">Program Studi</label><input type="text" id="f-prodi" value="${data?.prodi || ''}" required class="w-full p-2 border rounded"></div>
            <div><label class="block text-xs font-semibold mb-1">Angkatan</label><input type="text" id="f-angkatan" value="${data?.angkatan || ''}" required class="w-full p-2 border rounded"></div>
            <div><label class="block text-xs font-semibold mb-1">URL Foto (Opsional)</label><input type="text" id="f-foto" value="${data?.foto_url || ''}" class="w-full p-2 border rounded"></div>
        `;
    } else if (type === 'agenda') {
        fieldsContainer.innerHTML = `
            <div><label class="block text-xs font-semibold mb-1">Kegiatan</label><input type="text" id="f-kegiatan" value="${data?.kegiatan || ''}" required class="w-full p-2 border rounded"></div>
            <div><label class="block text-xs font-semibold mb-1">Waktu</label><input type="text" id="f-waktu" value="${data?.waktu || ''}" required class="w-full p-2 border rounded"></div>
            <div><label class="block text-xs font-semibold mb-1">Jenis</label><input type="text" id="f-jenis" value="${data?.jenis || ''}" required class="w-full p-2 border rounded"></div>
            <div><label class="block text-xs font-semibold mb-1">URL Foto</label><input type="text" id="f-foto" value="${data?.foto_url || ''}" class="w-full p-2 border rounded"></div>
            <div><label class="block text-xs font-semibold mb-1">URL File PDF</label><input type="text" id="f-pdf" value="${data?.file_pdf || ''}" class="w-full p-2 border rounded"></div>
        `;
    } else if (type === 'karya') {
        fieldsContainer.innerHTML = `
            <div><label class="block text-xs font-semibold mb-1">Judul</label><input type="text" id="f-judul" value="${data?.judul || ''}" required class="w-full p-2 border rounded"></div>
            <div><label class="block text-xs font-semibold mb-1">Jenis</label><input type="text" id="f-jenis" value="${data?.jenis || ''}" required class="w-full p-2 border rounded"></div>
            <div><label class="block text-xs font-semibold mb-1">Penulis</label><input type="text" id="f-penulis" value="${data?.penulis || ''}" required class="w-full p-2 border rounded"></div>
            <div><label class="block text-xs font-semibold mb-1">Tahun</label><input type="text" id="f-tahun" value="${data?.tahun || ''}" required class="w-full p-2 border rounded"></div>
            <div><label class="block text-xs font-semibold mb-1">URL Foto</label><input type="text" id="f-foto" value="${data?.foto_url || ''}" class="w-full p-2 border rounded"></div>
            <div><label class="block text-xs font-semibold mb-1">URL File PDF</label><input type="text" id="f-pdf" value="${data?.file_pdf || ''}" class="w-full p-2 border rounded"></div>
        `;
    }
}

function closeModal() {
    document.getElementById('crud-modal').classList.add('hidden');
}

async function handleFormSubmit(e) {
    const type = document.getElementById('modal-type').value;
    const id = document.getElementById('modal-id').value;
    let payload = {};

    if (type === 'pengurus') {
        payload = {
            nama: document.getElementById('f-nama').value,
            jabatan: document.getElementById('f-jabatan').value,
            divisi: document.getElementById('f-divisi').value,
            prodi: document.getElementById('f-prodi').value,
            angkatan: document.getElementById('f-angkatan').value,
            foto_url: document.getElementById('f-foto').value || null
        };
    } else if (type === 'agenda') {
        payload = {
            kegiatan: document.getElementById('f-kegiatan').value,
            waktu: document.getElementById('f-waktu').value,
            jenis: document.getElementById('f-jenis').value,
            foto_url: document.getElementById('f-foto').value || null,
            file_pdf: document.getElementById('f-pdf').value || null
        };
    } else if (type === 'karya') {
        payload = {
            judul: document.getElementById('f-judul').value,
            jenis: document.getElementById('f-jenis').value,
            penulis: document.getElementById('f-penulis').value,
            tahun: document.getElementById('f-tahun').value,
            foto_url: document.getElementById('f-foto').value || null,
            file_pdf: document.getElementById('f-pdf').value || null
        };
    }

    try {
        if (id) {
            await updateRecord(type, id, payload);
        } else {
            await insertRecord(type, payload);
        }
        closeModal();
        await loadAllAdminData();
    } catch (err) {
        alert('Gagal menyimpan data: ' + err.message);
    }
}

function editData(type, item) {
    openModal(type, item);
}

async function deleteData(type, id) {
    if (confirm('Yakin ingin menghapus data ini?')) {
        try {
            await deleteRecord(type, id);
            await loadAllAdminData();
        } catch (err) {
            alert('Gagal menghapus: ' + err.message);
        }
    }
}
