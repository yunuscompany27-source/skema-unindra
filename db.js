const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fetchPengurus() {
    const { data, error } = await supabase.from('pengurus').select('*');
    if (error) { console.error(error); return []; }
    return data;
}

async function fetchAgenda() {
    const { data, error } = await supabase.from('agenda').select('*');
    if (error) { console.error(error); return []; }
    return data;
}

async function fetchKarya() {
    const { data, error } = await supabase.from('karya').select('*');
    if (error) { console.error(error); return []; }
    return data;
}

async function loginAdmin(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
}

async function logoutAdmin() {
    await supabase.auth.signOut();
}

async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

async function insertRecord(table, payload) {
    const { data, error } = await supabase.from(table).insert([payload]);
    if (error) throw error;
    return data;
}

async function updateRecord(table, id, payload) {
    const { data, error } = await supabase.from(table).update(payload).eq('id', id);
    if (error) throw error;
    return data;
}

async function deleteRecord(table, id) {
    const { data, error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
    return data;
}
