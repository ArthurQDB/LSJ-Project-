// dashboard.js — Sidebar interativa + dados do usuário logado

document.addEventListener('DOMContentLoaded', () => {

    /* ---- Elementos ---- */
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const overlay = document.getElementById('sidebarOverlay');
    const btnOpen = document.getElementById('btnOpenSidebar');
    const btnLogout = document.getElementById('btnLogout');
    const sidebarAvatar = document.getElementById('sidebarAvatar');
    const topbarAvatar = document.getElementById('topbarAvatar');
    const sidebarUser = document.getElementById('sidebarUsername');
    const welcomeName = document.getElementById('welcomeName');

    // Identificador único da conta logada para isolamento dos dados locais
    function getCurrentUser() {
        const fromBody = document.body ? document.body.getAttribute('data-username') : null;
        if (fromBody && fromBody.trim()) return fromBody.trim();
        const fromSidebar = document.getElementById('sidebar')?.getAttribute('data-username');
        if (fromSidebar && fromSidebar.trim()) return fromSidebar.trim();
        const elSideUser = document.getElementById('sidebarUsername');
        if (elSideUser && elSideUser.textContent.trim() && elSideUser.textContent.trim() !== 'Usuário') {
            return elSideUser.textContent.trim();
        }
        return 'anon';
    }

    function getUserStorageKey(baseKey) {
        return `${baseKey}_${getCurrentUser()}`;
    }

    const DEFAULT_SIDEBAR_AVATAR = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80";

    /* ---- Carregar dados do usuário logado (localStorage isolado por conta) ---- */
    try {
        const profileRaw = localStorage.getItem(getUserStorageKey('user_profile_data'));
        const profile = profileRaw ? JSON.parse(profileRaw) : null;

        // Se o usuário personalizou o nome pelo Perfil, reflete na sidebar e no welcome
        if (profile && profile.name) {
            if (sidebarUser) sidebarUser.textContent = profile.name;
            if (welcomeName) welcomeName.textContent = profile.name.split(' ')[0];
        }

        // Avatar salvo pelo perfil.html específico para ESTE usuário
        const savedAvatar = localStorage.getItem(getUserStorageKey('user_avatar_img')) || (profile && profile.avatar);
        if (savedAvatar) {
            if (sidebarAvatar) sidebarAvatar.src = savedAvatar;
            if (topbarAvatar) topbarAvatar.src = savedAvatar;
        } else {
            if (sidebarAvatar) sidebarAvatar.src = DEFAULT_SIDEBAR_AVATAR;
            if (topbarAvatar) topbarAvatar.src = DEFAULT_SIDEBAR_AVATAR;
        }
    } catch (e) {
        console.warn('Erro ao ler localStorage do usuário:', e);
    }

    /* ============================================================
       PAINEL DE EVOLUÇÃO E DESEMPENHO DO ESTUDANTE
       ============================================================ */
    function renderDashboardEvolution() {
        try {
            const profileRaw = localStorage.getItem(getUserStorageKey('user_profile_data'));
            const profile = profileRaw ? JSON.parse(profileRaw) : {};
            const statsRaw = localStorage.getItem(getUserStorageKey('user_game_stats'));
            const stats = statsRaw ? JSON.parse(statsRaw) : {};

            const totalXp = (stats.total_xp !== undefined) ? stats.total_xp : (profile.total_xp || 0);
            const gamesPlayed = stats.games_played || 0;
            const totalQuestions = stats.total_questions || (gamesPlayed * 10);
            const correctAnswers = stats.correct_answers || 0;
            const bestStreak = stats.best_streak || 0;
            const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

            // Níveis:
            // Nível 1: 0 - 99 XP (Estudante Iniciante)
            // Nível 2: 100 - 249 XP (Raciocínio Ágil)
            // Nível 3: 250 - 499 XP (Explorador Matemático)
            // Nível 4: 500 - 999 XP (Estrategista dos Números)
            // Nível 5+: 1000+ XP (Mestre Lendário)
            let level = 1;
            let levelTitle = 'Estudante Iniciante';
            let currentLevelBase = 0;
            let nextLevelXp = 100;

            if (totalXp >= 1000) {
                level = 5;
                levelTitle = 'Mestre Lendário';
                currentLevelBase = 1000;
                nextLevelXp = 2000;
            } else if (totalXp >= 500) {
                level = 4;
                levelTitle = 'Estrategista dos Números';
                currentLevelBase = 500;
                nextLevelXp = 1000;
            } else if (totalXp >= 250) {
                level = 3;
                levelTitle = 'Explorador Matemático';
                currentLevelBase = 250;
                nextLevelXp = 500;
            } else if (totalXp >= 100) {
                level = 2;
                levelTitle = 'Raciocínio Ágil';
                currentLevelBase = 100;
                nextLevelXp = 250;
            }

            const levelProgress = Math.min(100, Math.max(0, Math.round(((totalXp - currentLevelBase) / (nextLevelXp - currentLevelBase)) * 100)));

            // 1. Nível & XP no Banner
            const elLvlBadge = document.getElementById('studentLevelBadge');
            const elLvlTitle = document.getElementById('studentLevelTitle');
            const elCurXp = document.getElementById('studentCurrentXp');
            const elNxtXp = document.getElementById('studentNextLevelXp');
            const elLvlBar = document.getElementById('studentLevelProgressFill');

            if (elLvlBadge) elLvlBadge.innerHTML = `<i class="bi bi-award-fill"></i> Nível ${level}`;
            if (elLvlTitle) elLvlTitle.textContent = levelTitle;
            if (elCurXp) elCurXp.textContent = `${totalXp} XP`;
            if (elNxtXp) elNxtXp.textContent = `/ ${nextLevelXp} XP`;
            if (elLvlBar) elLvlBar.style.width = `${levelProgress}%`;

            // 2. Cards de Estatísticas
            const elDashXp = document.getElementById('dashTotalXp');
            const elDashGames = document.getElementById('dashTotalGames');
            const elDashAccuracy = document.getElementById('dashAccuracy');
            const elDashStreak = document.getElementById('dashBestStreak');
            const elDashXpTrend = document.getElementById('dashXpTrend');
            const elDashGamesTrend = document.getElementById('dashGamesTrend');
            const elDashAccuracyTrend = document.getElementById('dashAccuracyTrend');

            if (elDashXp) elDashXp.textContent = totalXp;
            if (elDashGames) elDashGames.textContent = gamesPlayed;
            if (elDashAccuracy) elDashAccuracy.textContent = `${accuracy}%`;
            if (elDashStreak) elDashStreak.textContent = bestStreak;
            if (elDashXpTrend) elDashXpTrend.innerHTML = `<i class="bi bi-arrow-up-short"></i> Nível ${level}`;
            if (elDashGamesTrend) elDashGamesTrend.textContent = `${gamesPlayed} ${gamesPlayed === 1 ? 'partida' : 'partidas'}`;
            if (elDashAccuracyTrend) elDashAccuracyTrend.textContent = `${correctAnswers}/${totalQuestions} certas`;

            // 3. Barras de Habilidades
            const mathSkill = Math.min(100, Math.round((accuracy * 0.6) + Math.min(gamesPlayed * 8, 40)));
            const streakSkill = Math.min(100, Math.round((bestStreak / 8) * 100));
            const consistencySkill = Math.min(100, Math.round(Math.min(gamesPlayed, 10) * 10));

            const setBar = (pctId, barId, val) => {
                const elPct = document.getElementById(pctId);
                const elBar = document.getElementById(barId);
                if (elPct) elPct.textContent = `${val}%`;
                if (elBar) elBar.style.width = `${val}%`;
            };

            setBar('skillMathPct', 'skillMathBar', mathSkill);
            setBar('skillAccuracyPct', 'skillAccuracyBar', accuracy);
            setBar('skillStreakPct', 'skillStreakBar', streakSkill);
            setBar('skillConsistencyPct', 'skillConsistencyBar', consistencySkill);

            // 4. Conquistas
            let unlockedCount = 0;
            const unlockBadge = (badgeId, isUnlocked) => {
                const el = document.getElementById(badgeId);
                if (!el) return;
                const icon = el.querySelector('.achievement-icon-wrap');
                if (isUnlocked) {
                    unlockedCount++;
                    el.classList.add('unlocked-card');
                    if (icon) {
                        icon.classList.remove('locked');
                        icon.classList.add('unlocked');
                    }
                } else {
                    el.classList.remove('unlocked-card');
                    if (icon) {
                        icon.classList.add('locked');
                        icon.classList.remove('unlocked');
                    }
                }
            };

            unlockBadge('badgeFirstGame', gamesPlayed >= 1);
            unlockBadge('badgeCombo', bestStreak >= 3);
            unlockBadge('badgeAccuracy', accuracy >= 80 && gamesPlayed >= 1);
            unlockBadge('badgeCentury', totalXp >= 100);

            const elAchCount = document.getElementById('achievementsUnlockedCount');
            if (elAchCount) elAchCount.textContent = `${unlockedCount} / 4 liberados`;

            // 5. Histórico Recente
            const historyList = document.getElementById('dashboardActivityList');
            if (historyList) {
                const history = stats.history || [];
                if (history.length > 0) {
                    historyList.innerHTML = '';
                    history.forEach(item => {
                        const li = document.createElement('li');
                        li.className = 'activity-item';
                        const isHighAcc = item.accuracy >= 70;
                        li.innerHTML = `
                            <div class="activity-icon" style="background: ${isHighAcc ? 'rgba(52, 211, 153, 0.15)' : 'rgba(56, 189, 248, 0.15)'}; color: ${isHighAcc ? '#34d399' : '#38bdf8'};">
                                <i class="bi ${isHighAcc ? 'bi-check-circle-fill' : 'bi-controller'}"></i>
                            </div>
                            <div class="activity-info">
                                <span class="activity-title">${item.game || 'Quiz de Matemática'}</span>
                                <span class="activity-sub">${item.correctCount || 0}/${item.totalQuestions || 10} acertos • +${item.score || 0} XP (${item.accuracy || 0}% precisão)</span>
                            </div>
                            <span class="activity-time">${item.timestamp || 'Recente'}</span>
                        `;
                        historyList.appendChild(li);
                    });
                }
            }
        } catch (e) {
            console.warn('Erro ao renderizar evolução:', e);
        }
    }

    // Renderiza inicialmente as métricas do painel de evolução
    renderDashboardEvolution();

    /* ---- Desktop: colapsar sidebar ao tirar o mouse ---- */
    const isDesktop = () => window.innerWidth > 768;

    sidebar.addEventListener('mouseenter', () => {
        if (!isDesktop()) return;
        sidebar.classList.remove('collapsed');
        mainContent.classList.remove('sidebar-collapsed-state');
    });

    sidebar.addEventListener('mouseleave', () => {
        if (!isDesktop()) return;
        sidebar.classList.add('collapsed');
        mainContent.classList.add('sidebar-collapsed-state');
    });

    // Começa colapsado no desktop
    if (isDesktop()) {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('sidebar-collapsed-state');
    }

    /* ---- Mobile: abrir/fechar sidebar ---- */
    function openSidebar() {
        sidebar.classList.add('mobile-open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (btnOpen) btnOpen.addEventListener('click', openSidebar);
    overlay.addEventListener('click', closeSidebar);

    // Fechar ao clicar em um link no mobile
    sidebar.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', () => {
            if (!isDesktop()) closeSidebar();
        });
    });

    /* ---- Redimensionamento: resetar estado ---- */
    window.addEventListener('resize', () => {
        if (isDesktop()) {
            closeSidebar();
            sidebar.classList.add('collapsed');
            mainContent.classList.add('sidebar-collapsed-state');
            document.body.style.overflow = '';
        }
    });

    /* ---- Logout ---- */
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            try {
                localStorage.removeItem('logged_user');
            } catch (_) { }
            const target = btnLogout.getAttribute('href');
            if (target) {
                window.location.href = target;
            }
        });
    }

    /* ---- NAVEGAÇÃO ENTRE ABAS ---- */
    const tabPanes = document.querySelectorAll('.tab-pane');
    const sidebarLinks = sidebar.querySelectorAll('.sidebar-link[data-tab]');
    const genericTitle = document.getElementById('genericTabTitle');

    // Elementos da aba de Jogos (Catálogo vs Quiz)
    const gamesCatalogView = document.getElementById('gamesCatalogView');
    const mathQuizGameView = document.getElementById('mathQuizGameView');
    const btnPlayMath = document.getElementById('btnPlayMathGame');
    const btnPlayArithmetic = document.getElementById('btnPlayArithmeticGame');
    const btnPlayStats = document.getElementById('btnPlayStatsGame');
    const btnBackGames = document.getElementById('btnBackToGamesCatalog');

    function openQuizView(type = 'math') {
        if (gamesCatalogView) gamesCatalogView.style.display = 'none';
        if (mathQuizGameView) mathQuizGameView.style.display = 'block';
        startQuiz(type);
    }

    function showGamesCatalogView() {
        if (gamesCatalogView) gamesCatalogView.style.display = 'block';
        if (mathQuizGameView) mathQuizGameView.style.display = 'none';
    }

    if (btnPlayMath) {
        btnPlayMath.addEventListener('click', () => openQuizView('math'));
    }
    if (btnPlayArithmetic) {
        btnPlayArithmetic.addEventListener('click', () => openQuizView('arithmetic'));
    }
    if (btnPlayStats) {
        btnPlayStats.addEventListener('click', () => openQuizView('stats'));
    }

    // Suporte genérico a botões de quiz
    document.querySelectorAll('.btn-play-quiz').forEach(btn => {
        btn.addEventListener('click', () => {
            const quizType = btn.getAttribute('data-quiz') || 'math';
            openQuizView(quizType);
        });
    });

    if (btnBackGames) {
        btnBackGames.addEventListener('click', showGamesCatalogView);
    }

    function switchTab(tabId) {
        if (!tabId) tabId = 'dashboard';

        // Suporte caso a URL ainda tenha #matematica
        if (tabId === 'matematica') {
            tabId = 'jogos';
            openQuizView('math');
        }

        // Remove classe ativa de todos os links da sidebar
        sidebar.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));

        // Oculta todas as abas
        tabPanes.forEach(pane => pane.classList.remove('active'));

        // Procura o link correspondente
        const targetLink = sidebar.querySelector(`.sidebar-link[data-tab="${tabId}"]`);
        if (targetLink) {
            targetLink.classList.add('active');
        }

        // Procura o painel alvo
        const targetPane = document.getElementById(`tab-${tabId}`);
        if (targetPane) {
            targetPane.classList.add('active');
            if (tabId === 'jogos' && window.location.hash !== '#matematica') {
                showGamesCatalogView();
            }
        } else {
            // Se não houver painel específico, usa o genérico
            const genericPane = document.getElementById('tab-generic');
            if (genericPane) {
                genericPane.classList.add('active');
                if (genericTitle && targetLink) {
                    const label = targetLink.getAttribute('data-label') || 'Seção';
                    genericTitle.textContent = `${label} em Construção`;
                }
            }
        }
    }

    // Interceptar cliques nos links de aba
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const tab = link.getAttribute('data-tab');
            if (tab) {
                e.preventDefault();
                window.location.hash = tab;
                switchTab(tab);
            }
        });
    });

    // Botão de acesso rápido no dashboard
    const btnQuickStartJogos = document.getElementById('btnQuickStartJogos');
    if (btnQuickStartJogos) {
        btnQuickStartJogos.addEventListener('click', () => {
            window.location.hash = 'jogos';
            switchTab('jogos');
        });
    }

    // Monitorar mudança na URL (#jogos, #dashboard, etc.)
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#', '') || 'dashboard';
        switchTab(hash);
    });

    // Ativar aba inicial baseada na URL
    const initialTab = window.location.hash.replace('#', '') || 'dashboard';
    switchTab(initialTab);

    /* ============================================================
       SISTEMA MULTI-QUIZ (MATEMÁTICA, ARITMÉTICA E ESTATÍSTICA)
       ============================================================ */
    const quizState = {
        active: false,
        currentType: 'math', // 'math' | 'arithmetic' | 'stats'
        title: 'Quiz de Matemática',
        currentIndex: 0,
        totalQuestions: 10,
        score: 0,
        streak: 0,
        correctCount: 0,
        canAnswer: true,
        questions: []
    };

    const elScore = document.getElementById('quizScore');
    const elStreak = document.getElementById('quizStreak');
    const elCurrentNum = document.getElementById('currentQuestionNum');
    const elTotalNum = document.getElementById('totalQuestionsNum');
    const elProgressBar = document.getElementById('quizProgressBar');
    const elExpression = document.getElementById('quizExpressionText');
    const elPrompt = document.getElementById('quizExpressionPrompt');
    const elOptionsGrid = document.getElementById('quizOptionsGrid');
    const elFeedback = document.getElementById('quizFeedbackBox');
    const elPlayCard = document.getElementById('quizPlayCard');
    const elResultCard = document.getElementById('quizResultCard');
    const btnRestart = document.getElementById('btnRestartQuiz');

    // 1. Gerador do Quiz de Matemática Básica (Adição, Subtração, Multiplicação, Divisão)
    function generateMathQuestions(count = 10) {
        const operators = ['+', '-', '×', '÷'];
        const generated = [];

        for (let i = 0; i < count; i++) {
            const op = operators[Math.floor(Math.random() * operators.length)];
            let a, b, answer, text;

            if (op === '+') {
                a = Math.floor(Math.random() * 45) + 5;
                b = Math.floor(Math.random() * 45) + 5;
                answer = a + b;
                text = `${a} + ${b}`;
            } else if (op === '-') {
                a = Math.floor(Math.random() * 60) + 20;
                b = Math.floor(Math.random() * (a - 5)) + 3;
                answer = a - b;
                text = `${a} - ${b}`;
            } else if (op === '×') {
                a = Math.floor(Math.random() * 11) + 2;
                b = Math.floor(Math.random() * 10) + 2;
                answer = a * b;
                text = `${a} × ${b}`;
            } else { // '÷'
                const divisor = Math.floor(Math.random() * 9) + 2;
                answer = Math.floor(Math.random() * 11) + 2;
                a = divisor * answer;
                b = divisor;
                text = `${a} ÷ ${b}`;
            }

            const optionsSet = new Set([answer]);
            const deltas = [-4, -3, -2, -1, 1, 2, 3, 4, 5, 10, -10];

            while (optionsSet.size < 4) {
                const delta = deltas[Math.floor(Math.random() * deltas.length)];
                const distractor = answer + delta;
                if (distractor >= 0 && distractor !== answer) {
                    optionsSet.add(distractor);
                } else {
                    optionsSet.add(answer + optionsSet.size * 2 + 1);
                }
            }

            const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);
            generated.push({ prompt: 'Quanto é:', text, answer, options });
        }

        return generated;
    }

    // 2. Gerador do Quiz de Aritmética e Expressões Numéricas
    function generateArithmeticQuestions(count = 10) {
        const generated = [];

        for (let i = 0; i < count; i++) {
            const type = Math.floor(Math.random() * 6);
            let text = '';
            let answer = 0;
            let optionsSet = new Set();

            if (type === 0) {
                // (a + b) × c
                const a = Math.floor(Math.random() * 8) + 2;
                const b = Math.floor(Math.random() * 8) + 2;
                const c = Math.floor(Math.random() * 5) + 2;
                text = `(${a} + ${b}) × ${c}`;
                answer = (a + b) * c;
                optionsSet.add(answer);
                optionsSet.add(a + (b * c)); // armadilha comum
            } else if (type === 1) {
                // a + b × c (ordem de precedência)
                const a = Math.floor(Math.random() * 15) + 3;
                const b = Math.floor(Math.random() * 8) + 2;
                const c = Math.floor(Math.random() * 6) + 2;
                text = `${a} + ${b} × ${c}`;
                answer = a + (b * c);
                optionsSet.add(answer);
                optionsSet.add((a + b) * c); // erro comum: somar antes
            } else if (type === 2) {
                // a × b - c
                const a = Math.floor(Math.random() * 9) + 3;
                const b = Math.floor(Math.random() * 7) + 2;
                const c = Math.floor(Math.random() * 15) + 2;
                text = `${a} × ${b} - ${c}`;
                answer = (a * b) - c;
                optionsSet.add(answer);
                optionsSet.add(a * Math.max(1, b - c));
            } else if (type === 3) {
                // Potência simples: a² + b
                const a = Math.floor(Math.random() * 7) + 2; // 2..8
                const b = Math.floor(Math.random() * 20) + 1;
                text = `${a}² + ${b}`;
                answer = (a * a) + b;
                optionsSet.add(answer);
                optionsSet.add((a * 2) + b); // erro comum: a * 2 em vez de a²
            } else if (type === 4) {
                // Potência simples: a² - b
                const a = Math.floor(Math.random() * 7) + 3; // 3..9
                const b = Math.floor(Math.random() * 12) + 1;
                text = `${a}² - ${b}`;
                answer = (a * a) - b;
                optionsSet.add(answer);
                optionsSet.add((a * 2) - b);
            } else {
                // (a - b) × c
                const a = Math.floor(Math.random() * 15) + 10;
                const b = Math.floor(Math.random() * 8) + 1;
                const c = Math.floor(Math.random() * 5) + 2;
                text = `(${a} - ${b}) × ${c}`;
                answer = (a - b) * c;
                optionsSet.add(answer);
                optionsSet.add(a - (b * c));
            }

            const deltas = [-6, -4, -2, -1, 1, 2, 3, 5, 8, 10];
            while (optionsSet.size < 4) {
                const delta = deltas[Math.floor(Math.random() * deltas.length)];
                const distractor = answer + delta;
                if (distractor >= 0 && distractor !== answer) {
                    optionsSet.add(distractor);
                } else {
                    optionsSet.add(answer + optionsSet.size * 3 + 1);
                }
            }

            const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);
            generated.push({ prompt: 'Resolva a expressão:', text, answer, options });
        }

        return generated;
    }

    // 3. Gerador do Quiz de Estatística (Porcentagem, Média, Mediana e Moda)
    function generateStatsQuestions(count = 10) {
        const generated = [];

        for (let i = 0; i < count; i++) {
            const subType = i % 4; // Distribui equilibradamente: 0=Porcentagem, 1=Média, 2=Mediana, 3=Moda
            let prompt = '';
            let text = '';
            let answer = 0;
            let optionsSet = new Set();

            if (subType === 0) {
                // PORCENTAGEM
                const pList = [10, 20, 25, 30, 40, 50, 75];
                const p = pList[Math.floor(Math.random() * pList.length)];
                const baseList = [20, 40, 60, 80, 100, 120, 160, 200, 240, 300, 400];
                const base = baseList[Math.floor(Math.random() * baseList.length)];
                answer = Math.round((p * base) / 100);
                prompt = 'Cálculo de Porcentagem:';
                text = `Quanto é ${p}% de ${base}?`;

                optionsSet.add(answer);
                optionsSet.add(Math.round(answer * 1.5));
                optionsSet.add(Math.max(1, Math.round(answer * 0.5)));
                optionsSet.add(answer + 5);
            } else if (subType === 1) {
                // MÉDIA ARITMÉTICA (3 valores inteiros)
                const M = Math.floor(Math.random() * 15) + 6; // 6..20
                const d1 = Math.floor(Math.random() * 5) - 2;
                const d2 = Math.floor(Math.random() * 5) - 2;
                const d3 = -(d1 + d2);
                const nums = [M + d1, M + d2, M + d3].sort(() => Math.random() - 0.5);
                answer = M;
                prompt = 'Média Aritmética:';
                text = `Qual a MÉDIA dos números [${nums.join(', ')}]?`;

                optionsSet.add(answer);
                optionsSet.add(M + 1);
                optionsSet.add(M - 1);
                optionsSet.add(M + 2);
            } else if (subType === 2) {
                // MEDIANA (5 valores)
                const baseVal = Math.floor(Math.random() * 15) + 4;
                const step1 = Math.floor(Math.random() * 3) + 1;
                const step2 = Math.floor(Math.random() * 4) + 1;
                const step3 = Math.floor(Math.random() * 4) + 1;
                const step4 = Math.floor(Math.random() * 4) + 1;

                const sorted = [
                    baseVal,
                    baseVal + step1,
                    baseVal + step1 + step2,
                    baseVal + step1 + step2 + step3,
                    baseVal + step1 + step2 + step3 + step4
                ];
                answer = sorted[2]; // elemento central (mediana)

                const shuffled = [...sorted].sort(() => Math.random() - 0.5);
                prompt = 'Mediana (valor central):';
                text = `Qual a MEDIANA do conjunto [${shuffled.join(', ')}]?`;

                optionsSet.add(answer);
                optionsSet.add(sorted[1]);
                optionsSet.add(sorted[3]);
                optionsSet.add(sorted[0]);
            } else {
                // MODA (valor que mais se repete)
                const modeVal = Math.floor(Math.random() * 18) + 2;
                let other1 = modeVal + 2;
                let other2 = Math.max(1, modeVal - 3);
                let other3 = modeVal + 5;

                const list = [modeVal, modeVal, modeVal, other1, other2, other3].sort(() => Math.random() - 0.5);
                answer = modeVal;
                prompt = 'Moda (mais frequente):';
                text = `Qual a MODA do conjunto [${list.join(', ')}]?`;

                optionsSet.add(answer);
                optionsSet.add(other1);
                optionsSet.add(other2);
                optionsSet.add(other3);
            }

            const deltas = [-3, -2, -1, 1, 2, 3, 5, 10];
            while (optionsSet.size < 4) {
                const delta = deltas[Math.floor(Math.random() * deltas.length)];
                const distractor = answer + delta;
                if (distractor >= 0 && distractor !== answer) {
                    optionsSet.add(distractor);
                } else {
                    optionsSet.add(answer + optionsSet.size * 2 + 1);
                }
            }

            const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);
            generated.push({ prompt, text, answer, options });
        }

        return generated;
    }

    // Inicialização do Quiz de acordo com a categoria
    function startQuiz(type = 'math') {
        quizState.active = true;
        quizState.currentType = type;
        quizState.currentIndex = 0;
        quizState.score = 0;
        quizState.streak = 0;
        quizState.correctCount = 0;
        quizState.canAnswer = true;

        const elQuizTag = document.getElementById('activeQuizTag');
        const elQuizTitle = document.getElementById('activeQuizTitle');
        const elQuizSubtitle = document.getElementById('activeQuizSubtitle');

        if (type === 'arithmetic') {
            quizState.title = 'Quiz de Aritmética';
            if (elQuizTag) elQuizTag.innerHTML = '<i class="bi bi-sort-numeric-up-alt"></i> Aritmética &amp; Expressões';
            if (elQuizTitle) elQuizTitle.textContent = 'Quiz de Aritmética';
            if (elQuizSubtitle) elQuizSubtitle.textContent = 'Resolva expressões numéricas, potências e ordem das operações!';
            quizState.questions = generateArithmeticQuestions(quizState.totalQuestions);
        } else if (type === 'stats') {
            quizState.title = 'Porcentagem, Média, Mediana e Moda';
            if (elQuizTag) elQuizTag.innerHTML = '<i class="bi bi-pie-chart-fill"></i> Estatística &amp; Porcentagem';
            if (elQuizTitle) elQuizTitle.textContent = 'Porcentagem, Média, Mediana e Moda';
            if (elQuizSubtitle) elQuizSubtitle.textContent = 'Calcule porcentagens rápidas e encontre a média, mediana e moda dos dados!';
            quizState.questions = generateStatsQuestions(quizState.totalQuestions);
        } else {
            quizState.title = 'Quiz de Matemática';
            if (elQuizTag) elQuizTag.innerHTML = '<i class="bi bi-calculator-fill"></i> Matemática Básica';
            if (elQuizTitle) elQuizTitle.textContent = 'Quiz de Matemática';
            if (elQuizSubtitle) elQuizSubtitle.textContent = 'Resolva as operações básicas rapidamente para ganhar XP e combo!';
            quizState.questions = generateMathQuestions(quizState.totalQuestions);
        }

        if (elScore) elScore.textContent = '0';
        if (elStreak) elStreak.textContent = '0';
        if (elTotalNum) elTotalNum.textContent = quizState.totalQuestions;

        if (elPlayCard) elPlayCard.style.display = 'flex';
        if (elResultCard) elResultCard.style.display = 'none';

        renderCurrentQuestion();
    }

    function renderCurrentQuestion() {
        if (!quizState.questions || quizState.currentIndex >= quizState.questions.length) {
            finishQuiz();
            return;
        }

        const current = quizState.questions[quizState.currentIndex];
        quizState.canAnswer = true;

        // Atualiza contadores e barra de progresso
        const currentNum = quizState.currentIndex + 1;
        if (elCurrentNum) elCurrentNum.textContent = currentNum;
        if (elProgressBar) {
            const pct = (currentNum / quizState.totalQuestions) * 100;
            elProgressBar.style.width = `${pct}%`;
        }

        // Exibe o prompt e a pergunta
        if (elPrompt) {
            elPrompt.textContent = current.prompt || 'Quanto é:';
        }
        if (elExpression) {
            elExpression.textContent = current.text.includes('?') ? current.text : `${current.text} = ?`;
        }

        // Limpa feedback
        if (elFeedback) {
            elFeedback.textContent = '';
            elFeedback.className = 'quiz-feedback-box';
        }

        // Renderiza botões de alternativas
        if (elOptionsGrid) {
            elOptionsGrid.innerHTML = '';
            current.options.forEach(opt => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'quiz-opt-btn';
                btn.textContent = opt;
                btn.addEventListener('click', () => handleOptionSelection(opt, btn, current.answer));
                elOptionsGrid.appendChild(btn);
            });
        }
    }

    function handleOptionSelection(selected, selectedBtn, correctAnswer) {
        if (!quizState.canAnswer) return;
        quizState.canAnswer = false;

        // Desabilita todos os botões para evitar múltiplos cliques
        const allBtns = elOptionsGrid.querySelectorAll('.quiz-opt-btn');
        allBtns.forEach(btn => btn.disabled = true);

        const isCorrect = selected === correctAnswer;

        if (isCorrect) {
            selectedBtn.classList.add('correct');
            quizState.streak += 1;
            quizState.correctCount += 1;

            // Cálculo de XP com bônus de combo
            const basePoints = (quizState.currentType === 'stats') ? 20 : 15;
            const gainedXP = basePoints + (quizState.streak >= 3 ? 5 : 0);
            quizState.score += gainedXP;

            if (elFeedback) {
                elFeedback.className = 'quiz-feedback-box correct-text';
                elFeedback.innerHTML = `<i class="bi bi-check-circle-fill"></i> Correto! +${gainedXP} XP ${quizState.streak >= 3 ? '🔥 (Bônus Combo!)' : ''}`;
            }
        } else {
            selectedBtn.classList.add('wrong');
            quizState.streak = 0;

            // Destaca a resposta correta para aprendizado
            allBtns.forEach(btn => {
                if (Number(btn.textContent) === correctAnswer) {
                    btn.classList.add('correct');
                }
            });

            if (elFeedback) {
                elFeedback.className = 'quiz-feedback-box wrong-text';
                elFeedback.innerHTML = `<i class="bi bi-x-circle-fill"></i> Incorreto! A resposta certa era ${correctAnswer}.`;
            }
        }

        // Atualiza status cards
        if (elScore) elScore.textContent = quizState.score;
        if (elStreak) elStreak.textContent = quizState.streak;

        // Avança para a próxima questão após 1.1s
        setTimeout(() => {
            quizState.currentIndex++;
            renderCurrentQuestion();
        }, 1100);
    }

    function finishQuiz() {
        quizState.active = false;
        if (elPlayCard) elPlayCard.style.display = 'none';
        if (elResultCard) elResultCard.style.display = 'flex';

        const accuracy = Math.round((quizState.correctCount / quizState.totalQuestions) * 100);

        const elResScore = document.getElementById('resultTotalScore');
        const elResAccuracy = document.getElementById('resultAccuracy');
        const elResCorrect = document.getElementById('resultCorrectCount');
        const elResDesc = document.getElementById('resultDescription');

        if (elResScore) elResScore.textContent = `+${quizState.score}`;
        if (elResAccuracy) elResAccuracy.textContent = `${accuracy}%`;
        if (elResCorrect) elResCorrect.textContent = `${quizState.correctCount}/${quizState.totalQuestions}`;

        if (elResDesc) {
            if (accuracy >= 80) {
                elResDesc.textContent = '🌟 Espetacular! Seus reflexos e raciocínio estão afiadíssimos!';
            } else if (accuracy >= 50) {
                elResDesc.textContent = '👍 Muito bem! Você teve um bom desempenho, continue praticando!';
            } else {
                elResDesc.textContent = '💪 Bom treino! Jogue novamente para dominar todos os desafios!';
            }
        }

        // Salvar estatísticas e evolução detalhada no localStorage isolado para este usuário
        try {
            const profileKey = getUserStorageKey('user_profile_data');
            const statsKey = getUserStorageKey('user_game_stats');

            const savedProfile = JSON.parse(localStorage.getItem(profileKey)) || {};
            const stats = JSON.parse(localStorage.getItem(statsKey)) || {
                total_xp: 0,
                games_played: 0,
                correct_answers: 0,
                total_questions: 0,
                best_streak: 0,
                history: []
            };

            // Atualiza estatísticas globais
            stats.total_xp = (stats.total_xp || 0) + quizState.score;
            stats.games_played = (stats.games_played || 0) + 1;
            stats.correct_answers = (stats.correct_answers || 0) + quizState.correctCount;
            stats.total_questions = (stats.total_questions || 0) + quizState.totalQuestions;
            stats.best_streak = Math.max(stats.best_streak || 0, quizState.streak);

            // Adiciona nova partida no histórico (mantém as últimas 6)
            if (!stats.history) stats.history = [];
            stats.history.unshift({
                game: quizState.title || 'Quiz de Matemática',
                score: quizState.score,
                correctCount: quizState.correctCount,
                totalQuestions: quizState.totalQuestions,
                accuracy: accuracy,
                timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            });
            if (stats.history.length > 6) stats.history.pop();

            localStorage.setItem(statsKey, JSON.stringify(stats));

            // Sincroniza XP com perfil
            savedProfile.total_xp = stats.total_xp;
            localStorage.setItem(profileKey, JSON.stringify(savedProfile));

            // Atualiza o painel na tela
            renderDashboardEvolution();
        } catch (e) {
            console.warn('Erro ao salvar estatísticas do quiz:', e);
        }
    }

    if (btnRestart) {
        btnRestart.addEventListener('click', () => startQuiz(quizState.currentType));
    }

});