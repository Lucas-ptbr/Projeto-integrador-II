// TODO: No futuro, trocar isso aqui por uma API de verdade e banco de dados 
const XP_POR_NIVEL = 1000;
let usuarioLogado = null; // Armazena o email de quem logou improviso total 


lucide.createIcons();

// Criando uns usuarios de teste no localStorage pro ranking nao ficar vazio
if (!localStorage.getItem('local_users')) {
    const usuariosPreCadastrados = {
        "pedro@alpha.com": { email: "pedro@alpha.com", password: "123", xp: 3250, level: 4, streak: 5, lastDate: null },
        "mariana@alpha.com": { email: "mariana@alpha.com", password: "123", xp: 2100, level: 3, streak: 3, lastDate: null },
        "igor@alpha.com": { email: "igor@alpha.com", password: "123", xp: 1850, level: 2, streak: 2, lastDate: null }
    };
    localStorage.setItem('local_users', JSON.stringify(usuariosPreCadastrados));
}

// Gambiarra para manter o usuario logado se ele der F5 na pagina
window.onload = function() {
    const safeSession = sessionStorage.getItem('active_session');
    if (safeSession) {
        usuarioLogado = safeSession;
        trocarTela(true);
        atualizarDadosTela();
        carregarRanking();
    }
};

// Controla o que aparece na tela (Login ou Dashboard)
function trocarTela(logado) {
    if (logado) {
        document.getElementById('auth-screen').classList.add('hidden');
        document.getElementById('app-screen').classList.remove('hidden');
    } else {
        document.getElementById('auth-screen').classList.remove('hidden');
        document.getElementById('app-screen').classList.add('hidden');
    }
}

function pegarBancoUsuarios() {
    return JSON.parse(localStorage.getItem('local_users')) || {};
}

function salvarBancoUsuarios(dados) {
    localStorage.setItem('local_users', JSON.stringify(dados));
}

// Atualiza os textos, nivel e barra de progresso do usuario por enquanto
function atualizarDadosTela() {
    const banco = pegarBancoUsuarios();
    const dadosUser = banco[usuarioLogado];
    
    if (!dadosUser) return;

    // Atualiza os cards de XP e Ofensiva
    document.getElementById('display-xp').innerHTML = dadosUser.xp + ' <span class="text-lg text-slate-500">XP</span>';
    document.getElementById('display-streak').innerText = dadosUser.streak;
    document.getElementById('nav-level').innerText = dadosUser.level;
    
    // Calculo da barra de progresso
    let xpAtualDoNivel = dadosUser.xp % XP_POR_NIVEL;
    let porcentagemBarra = (xpAtualDoNivel / XP_POR_NIVEL) * 100;
    
    document.getElementById('xp-bar').style.width = porcentagemBarra + '%';
    document.getElementById('xp-remaining').innerText = 'Faltam ' + (XP_POR_NIVEL - xpAtualDoNivel) + ' XP para o Nível ' + (dadosUser.level + 1);
}

// Renderiza a tabela de ranking dos usuarios
function carregarRanking() {
    const tabelaBody = document.getElementById('leaderboard-body');
    tabelaBody.innerHTML = '';
    
    const banco = pegarBancoUsuarios();
    // Converte objeto para array e ordena do maior XP pro menor
    const listaOrdenada = Object.values(banco).sort(function(a, b) {
        return b.xp - a.xp;
    });
    
    for (let i = 0; i < listaOrdenada.length; i++) {
        const u = listaOrdenada[i];
        const ehMeusDados = u.email === usuarioLogado;
        const linha = document.createElement('tr');
        
        if (ehMeusDados) {
            linha.className = 'bg-indigo-500/10 border-l-4 border-indigo-500';
        } else {
            linha.className = 'border-b border-slate-800/50';
        }
        
        linha.innerHTML = `
            <td class="p-6 font-bold text-slate-500">${i + 1}º</td>
            <td class="p-6 flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs border border-slate-700">${u.email.charAt(0).toUpperCase()}</div>
                <span class="${ehMeusDados ? 'font-bold text-white' : 'text-slate-300'}">${u.email.split('@')[0]} ${ehMeusDados ? '(Você)' : ''}</span>
            </td>
            <td class="p-6"><span class="px-2 py-1 bg-slate-800 rounded text-xs font-bold">LVL ${u.level}</span></td>
            <td class="p-6 text-right font-mono font-bold text-indigo-400">${u.xp.toLocaleString()}</td>
        `;
        tabelaBody.appendChild(linha);
    }
}

// Aqui é da parte de Entrar
function acaoLogin() {
    const emailInput = document.getElementById('email').value.trim();
    const passInput = document.getElementById('password').value;
    const erroTxt = document.getElementById('auth-error');
    
    const banco = pegarBancoUsuarios();
    
    if (banco[emailInput] && banco[emailInput].password === passInput) {
        usuarioLogado = emailInput;
        sessionStorage.setItem('active_session', emailInput);
        erroTxt.classList.add('hidden');
        trocarTela(true);
        atualizarDadosTela();
        carregarRanking();
    } else {
        erroTxt.innerText = "Usuário não cadastrado ou senha incorreta.";
        erroTxt.classList.remove('hidden');
    }
}

// AQui Criar Conta
function acaoCadastro() {
    const emailInput = document.getElementById('email').value.trim();
    const passInput = document.getElementById('password').value;
    const erroTxt = document.getElementById('auth-error');
    
    if (emailInput === "" || passInput.length < 3) {
        erroTxt.innerText = "Preencha o e-mail e use uma senha com mais de 3 dígitos.";
        erroTxt.classList.remove('hidden');
        return;
    }
    
    const banco = pegarBancoUsuarios();
    
    if (banco[emailInput]) {
        erroTxt.innerText = "Esse e-mail já está sendo usado.";
        erroTxt.classList.remove('hidden');
    } else {
        banco[emailInput] = {
            email: emailInput,
            password: passInput,
            xp: 0,
            level: 1,
            streak: 0,
            lastDate: null
        };
        salvarBancoUsuarios(banco);
        
        usuarioLogado = emailInput;
        sessionStorage.setItem('active_session', emailInput);
        erroTxt.classList.add('hidden');
        trocarTela(true);
        atualizarDadosTela();
        carregarRanking();
    }
}

function acaoLogout() {
    usuarioLogado = null;
    sessionStorage.removeItem('active_session');
    trocarTela(false);
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
}

// Quando clica em Estudo ou Treino (VAMOS TIRAR OS TREINOS)
function registrarProgressoDeFoco(tipoFoco) {
    const banco = pegarBancoUsuarios();
    const user = banco[usuarioLogado];
    if (!user) return;

    const hoje = new Date().toLocaleDateString();
    
    // Bloqueia se ja clicou hoje
    if (user.lastDate === hoje) {
        alert("Você já garantiu seu foco de hoje! Volte amanhã.");
        return;
    }

    // Calcula se manteve a ofensiva (se foi ontem)
    const ontemData = new Date();
    ontemData.setDate(ontemData.getDate() - 1);
    const ontemString = ontemData.toLocaleDateString();
    
    if (user.lastDate === ontemString) {
        user.streak += 1;
    } else {
        user.streak = 1; // Reseta ou comeca com 1
    }

    // Define o XP base dependendo do que ele clicou
    let xpGanho = 0;
    if (tipoFoco === 'estudo') {
        xpGanho = 150;
    } else {
        xpGanho = 120;
    }
    
    // Adiciona o bonus da ofensiva
    user.xp += (xpGanho + (user.streak * 10));
    user.level = Math.floor(user.xp / XP_POR_NIVEL) + 1;
    user.lastDate = hoje;

    banco[usuarioLogado] = user;
    salvarBancoUsuarios(banco);
    
    atualizarDadosTela();
    carregarRanking();
}
