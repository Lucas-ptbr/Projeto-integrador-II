const XP_PER_LEVEL = 1000;
const MAX_XP = 150;

const QUESTIONS = [
    {
        q: "Qual técnica de estudo consiste em revisar o conteúdo em intervalos crescentes de tempo?",
        options: ["Pomodoro", "Repetição Espaçada", "Mapa Mental", "Leitura Dinâmica"],
        answer: 1
    },
    {
        q: "A técnica Pomodoro tradicional sugere ciclos de estudo de quantos minutos?",
        options: ["15 minutos", "25 minutos", "45 minutos", "60 minutos"],
        answer: 1
    },
    {
        q: "Qual destas práticas mais melhora a retenção de longo prazo?",
        options: [
            "Reler o material várias vezes",
            "Grifar com marca-texto",
            "Recuperação ativa (tentar lembrar sem olhar)",
            "Ouvir música enquanto estuda"
        ],
        answer: 2
    },
    {
        q: "O que é o efeito \"interleaving\" (intercalação) nos estudos?",
        options: [
            "Estudar um assunto por muitas horas seguidas",
            "Misturar tópicos/disciplinas diferentes na mesma sessão",
            "Estudar apenas de madrugada",
            "Ignorar matérias difíceis"
        ],
        answer: 1
    },
    {
        q: "Qual fator tem maior impacto comprovado no aprendizado e na consolidação da memória?",
        options: ["Cafeína", "Sono de qualidade", "Estudar em silêncio absoluto", "Música clássica"],
        answer: 1
    }
];

let current = 0;
let score = 0;
let answered = false;

const questionEl = document.getElementById('question-text');
const optionsEl = document.getElementById('options');
const nextBtn = document.getElementById('next-btn');
const progressLabel = document.getElementById('progress-label');
const scoreLabel = document.getElementById('score-label');
const quizBar = document.getElementById('quiz-bar');
const quizCard = document.getElementById('quiz-card');
const resultCard = document.getElementById('result-card');

function renderQuestion() {
    answered = false;
    const item = QUESTIONS[current];
    progressLabel.innerText = `Pergunta ${current + 1} de ${QUESTIONS.length}`;
    scoreLabel.innerText = `${score} acerto${score === 1 ? '' : 's'}`;
    quizBar.style.width = `${(current / QUESTIONS.length) * 100}%`;

    questionEl.innerText = item.q;
    optionsEl.innerHTML = '';

    item.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = "w-full text-left bg-slate-950 hover:bg-slate-800 border-2 border-slate-800 hover:border-indigo-500 text-slate-200 font-semibold py-4 px-5 rounded-xl transition-all flex items-center gap-3";
        btn.innerHTML = `
            <span class="w-7 h-7 rounded-full border-2 border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400">${String.fromCharCode(65 + idx)}</span>
            <span>${opt}</span>
        `;
        btn.onclick = () => selectOption(idx, btn);
        optionsEl.appendChild(btn);
    });

    nextBtn.classList.add('hidden');
    lucide.createIcons();
}

function selectOption(idx, btn) {
    if (answered) return;
    answered = true;
    const correct = QUESTIONS[current].answer;
    const buttons = optionsEl.querySelectorAll('button');

    buttons.forEach((b, i) => {
        b.disabled = true;
        if (i === correct) {
            b.className = "w-full text-left bg-emerald-500/10 border-2 border-emerald-500 text-emerald-300 font-semibold py-4 px-5 rounded-xl flex items-center gap-3";
        } else if (i === idx) {
            b.className = "w-full text-left bg-rose-500/10 border-2 border-rose-500 text-rose-300 font-semibold py-4 px-5 rounded-xl flex items-center gap-3";
        } else {
            b.className = "w-full text-left bg-slate-950 border-2 border-slate-800 text-slate-500 font-semibold py-4 px-5 rounded-xl flex items-center gap-3 opacity-60";
        }
    });

    if (idx === correct) score++;
    scoreLabel.innerText = `${score} acerto${score === 1 ? '' : 's'}`;
    nextBtn.classList.remove('hidden');
    nextBtn.innerText = current === QUESTIONS.length - 1 ? 'Ver Resultado' : 'Próxima';
}

nextBtn.onclick = () => {
    current++;
    if (current >= QUESTIONS.length) {
        finishQuiz();
    } else {
        renderQuestion();
    }
};

function finishQuiz() {
    quizCard.classList.add('hidden');
    resultCard.classList.remove('hidden');
    quizBar.style.width = '100%';

    const xpEarned = Math.round((score / QUESTIONS.length) * MAX_XP);
    document.getElementById('final-score').innerText = `${score} de ${QUESTIONS.length}`;
    document.getElementById('xp-earned').innerText = xpEarned;

    applyXP(xpEarned);
    lucide.createIcons();
}

function applyXP(xpEarned) {
    const email = sessionStorage.getItem('active_session');
    if (!email) return;
    const db = JSON.parse(localStorage.getItem('local_users')) || {};
    const user = db[email];
    if (!user) return;

    const now = new Date();
    const today = now.toLocaleDateString();

    if (user.lastDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        if (user.lastDate === yesterday.toLocaleDateString()) {
            user.streak += 1;
        } else {
            user.streak = 1;
        }
        user.lastDate = today;
    }

    user.xp += xpEarned + (user.streak * 10);
    user.level = Math.floor(user.xp / XP_PER_LEVEL) + 1;
    db[email] = user;
    localStorage.setItem('local_users', JSON.stringify(db));
}

lucide.createIcons();
renderQuestion();
