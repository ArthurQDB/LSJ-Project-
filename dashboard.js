// dashboard.js — Sidebar interativa + dados do usuário logado

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Elementos ---- */
  const sidebar        = document.getElementById('sidebar');
  const mainContent    = document.getElementById('mainContent');
  const overlay        = document.getElementById('sidebarOverlay');
  const btnOpen        = document.getElementById('btnOpenSidebar');
  const btnLogout      = document.getElementById('btnLogout');
  const sidebarAvatar  = document.getElementById('sidebarAvatar');
  const topbarAvatar   = document.getElementById('topbarAvatar');
  const sidebarUser    = document.getElementById('sidebarUsername');
  const welcomeName    = document.getElementById('welcomeName');

  /* ---- Carregar dados do usuário logado (localStorage) ---- */
  try {
    const loggedUser = localStorage.getItem('logged_user') || 'Usuário';
    const profileRaw = localStorage.getItem('user_profile_data');
    const profile    = profileRaw ? JSON.parse(profileRaw) : {};

    const displayName = profile.name || loggedUser;
    if (sidebarUser)  sidebarUser.textContent  = displayName;
    if (welcomeName)  welcomeName.textContent   = displayName.split(' ')[0]; // primeiro nome

    // Avatar salvo pelo perfil.html (base64) ou imagem padrão
    if (profile.avatar) {
      if (sidebarAvatar) sidebarAvatar.src = profile.avatar;
      if (topbarAvatar)  topbarAvatar.src  = profile.avatar;
    }
  } catch (e) {
    console.warn('Erro ao ler localStorage:', e);
  }

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
      e.preventDefault();
      try {
        localStorage.removeItem('logged_user');
      } catch (_) {}
      window.location.href = 'login.html';
    });
  }

  /* ---- NAVEGAÇÃO ENTRE ABAS ---- */
  const tabPanes = document.querySelectorAll('.tab-pane');
  const sidebarLinks = sidebar.querySelectorAll('.sidebar-link[data-tab]');
  const genericTitle = document.getElementById('genericTabTitle');

  // Elementos da aba de Jogos (Catálogo vs Quiz)
  const gamesCatalogView = document.getElementById('gamesCatalogView');
  const mathQuizGameView  = document.getElementById('mathQuizGameView');
  const btnPlayMath       = document.getElementById('btnPlayMathGame');
  const btnBackGames      = document.getElementById('btnBackToGamesCatalog');

  function openMathQuizView() {
    if (gamesCatalogView) gamesCatalogView.style.display = 'none';
    if (mathQuizGameView)  mathQuizGameView.style.display = 'block';
    startMathQuiz();
  }

  function showGamesCatalogView() {
    if (gamesCatalogView) gamesCatalogView.style.display = 'block';
    if (mathQuizGameView)  mathQuizGameView.style.display = 'none';
  }

  if (btnPlayMath) {
    btnPlayMath.addEventListener('click', openMathQuizView);
  }

  if (btnBackGames) {
    btnBackGames.addEventListener('click', showGamesCatalogView);
  }

  function switchTab(tabId) {
    if (!tabId) tabId = 'dashboard';

    // Suporte caso a URL ainda tenha #matematica
    if (tabId === 'matematica') {
      tabId = 'jogos';
      openMathQuizView();
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
     LÓGICA DO QUIZ DE MATEMÁTICA
     ============================================================ */
  const quizState = {
    active: false,
    currentIndex: 0,
    totalQuestions: 10,
    score: 0,
    streak: 0,
    correctCount: 0,
    canAnswer: true,
    questions: []
  };

  const elScore       = document.getElementById('quizScore');
  const elStreak      = document.getElementById('quizStreak');
  const elCurrentNum  = document.getElementById('currentQuestionNum');
  const elTotalNum    = document.getElementById('totalQuestionsNum');
  const elProgressBar = document.getElementById('quizProgressBar');
  const elExpression  = document.getElementById('quizExpressionText');
  const elOptionsGrid = document.getElementById('quizOptionsGrid');
  const elFeedback    = document.getElementById('quizFeedbackBox');
  const elPlayCard    = document.getElementById('quizPlayCard');
  const elResultCard  = document.getElementById('quizResultCard');
  const btnRestart    = document.getElementById('btnRestartQuiz');

  // Gerador de questões matemáticas aleatórias
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

      // Gerar 3 alternativas falsas plausíveis
      const optionsSet = new Set([answer]);
      const deltas = [-3, -2, -1, 1, 2, 3, 5, 10, -5, -10];

      while (optionsSet.size < 4) {
        const delta = deltas[Math.floor(Math.random() * deltas.length)];
        const distractor = answer + delta;
        if (distractor >= 0 && distractor !== answer) {
          optionsSet.add(distractor);
        } else {
          optionsSet.add(answer + optionsSet.size * 2 + 1);
        }
      }

      // Embaralhar alternativas
      const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

      generated.push({ text, answer, options });
    }

    return generated;
  }

  function startMathQuiz() {
    quizState.active = true;
    quizState.currentIndex = 0;
    quizState.score = 0;
    quizState.streak = 0;
    quizState.correctCount = 0;
    quizState.canAnswer = true;
    quizState.questions = generateMathQuestions(quizState.totalQuestions);

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

    // Exibe a expressão
    if (elExpression) elExpression.textContent = `${current.text} = ?`;

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
      const gainedXP = 15 + (quizState.streak >= 3 ? 5 : 0);
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

    // Avança para a próxima questão após 1s
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

    const elResScore    = document.getElementById('resultTotalScore');
    const elResAccuracy = document.getElementById('resultAccuracy');
    const elResCorrect  = document.getElementById('resultCorrectCount');
    const elResDesc     = document.getElementById('resultDescription');

    if (elResScore)    elResScore.textContent = `+${quizState.score}`;
    if (elResAccuracy) elResAccuracy.textContent = `${accuracy}%`;
    if (elResCorrect)  elResCorrect.textContent = `${quizState.correctCount}/${quizState.totalQuestions}`;

    if (elResDesc) {
      if (accuracy >= 80) {
        elResDesc.textContent = '🌟 Espetacular! Seus reflexos matemáticos estão afiadíssimos!';
      } else if (accuracy >= 50) {
        elResDesc.textContent = '👍 Muito bem! Você teve um bom desempenho, continue praticando!';
      } else {
        elResDesc.textContent = '💪 Bom treino! Jogue novamente para dominar todas as operações!';
      }
    }

    // Salvar o XP no perfil do usuário no localStorage
    try {
      const savedProfile = JSON.parse(localStorage.getItem('user_profile_data')) || {};
      savedProfile.total_xp = (savedProfile.total_xp || 0) + quizState.score;
      localStorage.setItem('user_profile_data', JSON.stringify(savedProfile));
    } catch (e) {
      console.warn('Erro ao salvar XP do quiz:', e);
    }
  }

  if (btnRestart) {
    btnRestart.addEventListener('click', startMathQuiz);
  }

});


