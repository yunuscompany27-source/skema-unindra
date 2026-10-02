document.addEventListener('DOMContentLoaded', async () => {
    await loadPublicData();
});

async function loadPublicData() {
    const pengurus = await fetchPengurus();
    const agenda = await fetchAgenda();
    const karya = await fetchKarya();

    document.getElementById('stat-pengurus').textContent = pengurus.length;
    document.getElementById('stat-divisi').textContent = [...new Set(pengurus.map(p => p.divisi))].length || 4;
    document.getElementById('stat-kegiatan').textContent = agenda.length;
    document.getElementById('stat-karya').textContent = karya.length;

    renderKaryaChart(karya);

    const pengurusContainer = document.getElementById('pengurus-container');
    if (pengurusContainer) {
        pengurusContainer.innerHTML = pengurus.map(p => `
            <div class="bg-white p-6 rounded-xl shadow-sm border text-center">
                <img src="${p.foto_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'}" class="w-24 h-24 object-cover rounded-full mx-auto mb-4 shadow">
                <h3 class="font-bold text-lg text-slate-900">${p.nama}</h3>
                <p class="text-indigo-600 font-medium text-sm mb-1">${p.jabatan} (${p.divisi})</p>
                <p class="text-xs text-gray-500">${p.prodi} - Angkatan ${p.angkatan}</p>
            </div>
        `).join('') || '<p class="text-gray-500 text-center col-span-full">Belum ada data pengurus.</p>';
    }

    const agendaTable = document.getElementById('agenda-table-body');
    if (agendaTable) {
        agendaTable.innerHTML = agenda.map(a => `
            <tr class="border-b">
                <td class="py-3 px-4 font-medium text-slate-900">${a.kegiatan}</td>
                <td class="py-3 px-4 text-gray-600">${a.waktu}</td>
                <td class="py-3 px-4"><span class="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-semibold">${a.jenis}</span></td>
                <td class="py-3 px-4">
                    ${a.file_pdf ? `<a href="${a.file_pdf}" target="_blank" class="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition inline-block">Buka PDF</a>` : (a.foto_url ? `<img src="${a.foto_url}" class="w-12 h-12 object-cover rounded">` : '-')}
                </td>
            </tr>
        `).join('') || '<tr><td colspan="4" class="text-center py-4 text-gray-500">Belum ada agenda kegiatan.</td></tr>';
    }

    renderKaryaList(karya);
    setupKaryaFilter(karya);
}

function renderKaryaChart(karya) {
    const chartContainer = document.getElementById('karya-chart');
    if (!chartContainer) return;

    const counts = {};
    karya.forEach(k => {
        counts[k.jenis] = (counts[k.jenis] || 0) + 1;
    });

    const total = karya.length || 1;
    chartContainer.innerHTML = Object.keys(counts).map(jenis => {
        const count = counts[jenis];
        const percentage = Math.round((count / total) * 100);
        return `
            <div>
                <div class="flex justify-between text-sm mb-1 font-medium">
                    <span>${jenis}</span>
                    <span>${count} Karya (${percentage}%)</span>
                </div>
                <div class="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                    <div class="bg-indigo-600 h-full rounded-full" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }).join('') || '<p class="text-gray-500 text-sm">Belum ada data grafik karya.</p>';
}

function renderKaryaList(karya, filter = 'Semua') {
    const container = document.getElementById('karya-grid');
    if (!container) return;

    const filtered = filter === 'Semua' ? karya : karya.filter(k => k.jenis === filter);

    container.innerHTML = filtered.map(k => `
        <div class="bg-white p-5 rounded-xl shadow-sm border flex flex-col justify-between">
            <div>
                <span class="text-xs font-bold text-indigo-600 uppercase tracking-wider">${k.jenis}</span>
                <h3 class="font-bold text-slate-900 text-lg mt-1 mb-2">${k.judul}</h3>
                <p class="text-sm text-gray-600 mb-4">Oleh: ${k.penulis} (${k.tahun})</p>
            </div>
            <div>
                ${k.file_pdf ? `<a href="${k.file_pdf}" target="_blank" class="w-full block text-center bg-indigo-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">Buka File PDF</a>` : (k.foto_url ? `<img src="${k.foto_url}" class="w-full h-36 object-cover rounded-lg mt-2">` : '')}
            </div>
        </div>
    `).join('') || '<p class="text-gray-500 text-center col-span-full">Tidak ada karya ditemukan.</p>';
}

function setupKaryaFilter(karya) {
    const filterButtons = document.querySelectorAll('.karya-filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterButtons.forEach(b => b.classList.remove('bg-indigo-600', 'text-white'));
            filterButtons.forEach(b => b.classList.add('bg-gray-100', 'text-gray-700'));
            e.target.classList.remove('bg-gray-100', 'text-gray-700');
            e.target.classList.add('bg-indigo-600', 'text-white');

            const filter = e.target.getAttribute('data-filter');
            renderKaryaList(karya, filter);
        });
    });
}
