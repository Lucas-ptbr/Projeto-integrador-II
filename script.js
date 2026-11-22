const SUPABASE_URL = 'https://jhfimjnshedtusmckyyr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Capr8UU6DwPd7MvOKKQfeQ_kk-7W7fX';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const XP_PER_LEVEL = 1000;
let loggedUserEmail = null;

lucide.createIcons();

window.onload = function () {
    const session = sessionStorage.getItem('active_session');
    if (session) {
        loggedUserEmail = session;
        toggleScreens(true);
        updateUI();
        loadLeaderboard();
    }
};

function toggleScreens(isLoggedIn) {
    document.getElementById('auth-screen').classList.toggle('hidden', isLoggedIn);
    document.getElementById('app-screen').classList.toggle('hidden', !isLoggedIn);
}

async function updateUI() {
    const { data: user, error } = await db
        .from('usuarios')
        .select('*')
        .eq('email', loggedUserEmail)
        .single();

    if (error || !user) return;

    document.getElementById('display-xp').innerHTML = `${user.xp} <span class="text-lg text-slate-500">XP</span>`;
    document.getElementById('display-streak').innerText = user.streak;
    document.getElementById('nav-level').innerText = user.level;

    const currentLevelXP = user.xp % XP_PER_LEVEL;
    document.getElementById('xp-bar').style.width = `${(currentLevelXP / XP_PER_LEVEL) * 100}%`;
    document.getElementById('xp-remaining').innerText = `Faltam ${XP_PER_LEVEL - currentLevelXP} XP para o Nível ${user.level + 1}`;
}

async function loadLeaderboard() {
    const tbody = document.getElementById('leaderboard-body');
    tbody.innerHTML = '';

    const { data: sortedUsers, error } = await db
        .from('usuarios')
        .select('email, xp, level')
        .order('xp', { ascending: false })
        .limit(20);

    if (error || !sortedUsers) return;

    sortedUsers.forEach((user, index) => {
        const isMe = user.email === loggedUserEmail;
        const row = document.createElement('tr');
        row.className = isMe ? 'bg-indigo-500/10 border-l-4 border-indigo-500' : 'border-b border-slate-800/50';

        row.innerHTML = `
            <td class="p-6 font-bold text-slate-500">${index + 1}º</td>
            <td class="p-6 flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs border border-slate-700">${user.email.charAt(0).toUpperCase()}</div>
                <span class="${isMe ? 'font-bold text-white' : 'text-slate-300'}">${user.email.split('@')[0]} ${isMe ? '(Você)' : ''}</span>
            </td>
            <td class="p-6"><span class="px-2 py-1 bg-slate-800 rounded text-xs font-bold">LVL ${user.level}</span></td>
            <td class="p-6 text-right font-mono font-bold text-indigo-400">${user.xp.toLocaleString()}</td>
        `;
        tbody.appendChild(row);
    });
}

window.login = async () => {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('auth-error');

    const { data: user, error } = await db
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

    if (user && !error) {
        loggedUserEmail = email;
        sessionStorage.setItem('active_session', email);
        errorEl.classList.add('hidden');
        toggleScreens(true);
        updateUI();
        loadLeaderboard();
    } else {
        errorEl.innerText = "Erro ao entrar: Usuário não encontrado ou senha incorreta.";
        errorEl.classList.remove('hidden');
    }
};

window.register = async () => {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('auth-error');

    if (!email || password.length < 3) {
        errorEl.innerText = "Digite um e-mail válido e uma senha com mais de 3 dígitos.";
        errorEl.classList.remove('hidden');
        return;
    }

    const { error } = await db
        .from('usuarios')
        .insert([{ email, password }]);

    if (error) {
        console.error(error);
        errorEl.innerText = error.code === '23505'
            ? "Este e-mail já está cadastrado. Clique em Entrar."
            : "Erro do Supabase: " + error.message;
        errorEl.classList.remove('hidden');
    } else {
        loggedUserEmail = email;
        sessionStorage.setItem('active_session', email);
        errorEl.classList.add('hidden');
        toggleScreens(true);
        updateUI();
        loadLeaderboard();
    }
};

window.logout = () => {
    loggedUserEmail = null;
    sessionStorage.removeItem('active_session');
    toggleScreens(false);
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
};
