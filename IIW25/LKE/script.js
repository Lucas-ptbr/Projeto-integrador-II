
// Banco de dados local simulado (armazenado no navegador)
const XP_PER_LEVEL = 1000;
let loggedUserEmail = null;

// Inicializa os ícones do Lucide
lucide.createIcons();

// Cria usuários fictícios para o Ranking caso não existam no localStorage
if (!localStorage.getItem('local_users')) {
    const fakeUsers = {
        "pedro@alpha.com": { email: "pedro@alpha.com", password: "123", xp: 3250, level: 4, streak: 5, lastDate: null },
        "mariana@alpha.com": { email: "mariana@alpha.com", password: "123", xp: 2100, level: 3, streak: 3, lastDate: null },
        "igor@alpha.com": { email: "igor@alpha.com", password: "123", xp: 1850, level: 2, streak: 2, lastDate: null }
    };
    localStorage.setItem('local_users', JSON.stringify(fakeUsers));
}

// Verifica se já existia uma sessão ativa ao recarregar a página
window.onload = function() {
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

function getUsersDB() {
    return JSON.parse(localStorage.getItem('local_users')) || {};
}

function saveUsersDB(db) {
    localStorage.setItem('local_users', JSON.stringify(db));
}

function updateUI() {
    const db = getUsersDB();
    const user = db[loggedUserEmail];
    if (!user) return;

    document.getElementById('display-xp').innerHTML = `${user.xp} <span class="text-lg text-slate-500">XP</span>`;
    document.getElementById('display-streak').innerText = user.streak;
    document.getElementById('nav-level').innerText = user.level;
    
    const currentLevelXP = user.xp % XP_PER_LEVEL;
    document.getElementById('xp-bar').style.width = `${(currentLevelXP / XP_PER_LEVEL) * 100}%`;
    document.getElementById('xp-remaining').innerText = `Faltam ${XP_PER_LEVEL - currentLevelXP} XP para o Nível ${user.level + 1}`;
}

function loadLeaderboard() {
    const tbody = document.getElementById('leaderboard-body');
    tbody.innerHTML = '';
    
    const db = getUsersDB();
    // Transforma o objeto de usuários em uma lista e ordena por quem tem mais XP
    const sortedUsers = Object.values(db).sort((a, b) => b.xp - a.xp);
    
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

// Funções de Autenticação Simulada
window.login = () => {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('auth-error');
    
    const db = getUsersDB();
    
    if (db[email] && db[email].password === password) {
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

window.register = () => {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('auth-error');
    
    if (!email || password.length < 3) {
        errorEl.innerText = "Erro ao criar: Digite um e-mail válido e uma senha com mais de 3 dígitos.";
        errorEl.classList.remove('hidden');
        return;
    }
    
    const db = getUsersDB();
    
    if (db[email]) {
        errorEl.innerText = "Erro ao criar: Este e-mail já está cadastrado.";
        errorEl.classList.remove('hidden');
    } else {
        // Cria estrutura do novo usuário local
        db[email] = {
            email: email,
            password: password,
            xp: 0,
            level: 1,
            streak: 0,
            lastDate: null
        };
        saveUsersDB(db);
        
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

// Atualização de Progresso Local
window.updateProgress = (type) => {
    const db = getUsersDB();
    const user = db[loggedUserEmail];
    if (!user) return;

    const now = new Date();
    const today = now.toLocaleDateString();
    
    if (user.lastDate === today) {
        alert("Ótimo trabalho! Você já garantiu seu foco de hoje. Descanse e volte amanhã!");
        return;
    }

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    
    if (user.lastDate === yesterday.toLocaleDateString()) {
        user.streak += 1;
    } else {
        user.streak = 1;
    }

    const baseXP = type === 'estudo' ? 150 : 120;
    user.xp += (baseXP + (user.streak * 10));
    user.level = Math.floor(user.xp / XP_PER_LEVEL) + 1;
    user.lastDate = today;

    db[loggedUserEmail] = user;
    saveUsersDB(db);
    
    updateUI();
    loadLeaderboard();
};
