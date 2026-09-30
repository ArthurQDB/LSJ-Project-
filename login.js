// login.js - Validações e efeitos dinâmicos na interface de login
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.login-form') || document.querySelector('form');
    const submitBtn = document.querySelector('.btn-submit') || document.querySelector('button[type="submit"]');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorBox = document.getElementById('error-message');

    if (!form || !submitBtn || !usernameInput || !passwordInput) {
        return;
    }

    function showError(message, inputElement) {
        if (errorBox) {
            errorBox.textContent = message;
            errorBox.style.display = 'block';
        } else {
            alert(message);
        }

        if (inputElement) {
            inputElement.classList.add('input-error');
            inputElement.focus();
        }
    }

    function clearErrors() {
        if (errorBox) {
            errorBox.textContent = '';
            errorBox.style.display = 'none';
        }
        usernameInput.classList.remove('input-error');
        passwordInput.classList.remove('input-error');
    }

    // Limpa os alertas visuais quando o usuário começar a digitar novamente
    usernameInput.addEventListener('input', () => {
        usernameInput.classList.remove('input-error');
        if (!passwordInput.classList.contains('input-error') && errorBox) {
            errorBox.style.display = 'none';
        }
    });

    passwordInput.addEventListener('input', () => {
        passwordInput.classList.remove('input-error');
        if (!usernameInput.classList.contains('input-error') && errorBox) {
            errorBox.style.display = 'none';
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        clearErrors();

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        // 1. Validação do nome de usuário
        if (!username) {
            showError('Por favor, preencha o nome de usuário.', usernameInput);
            return;
        }

        if (username.length < 3) {
            showError('O nome de usuário deve conter pelo menos 3 caracteres.', usernameInput);
            return;
        }

        // 2. Validação da senha
        if (!password) {
            showError('Por favor, digite sua senha.', passwordInput);
            return;
        }

        if (password.length < 4) {
            showError('A senha deve conter pelo menos 4 caracteres.', passwordInput);
            return;
        }

        // 3. Salvar nome do usuário para exibição no perfil
        try {
            const savedProfile = JSON.parse(localStorage.getItem('user_profile_data')) || {};
            savedProfile.name = username;
            localStorage.setItem('user_profile_data', JSON.stringify(savedProfile));
            localStorage.setItem('logged_user', username);
        } catch (err) {
            console.error('Erro ao acessar localStorage:', err);
        }

        // 4. Feedback no botão para evitar cliques duplicados
        submitBtn.innerText = "Entrando...";
        submitBtn.style.opacity = "0.7";
        submitBtn.style.pointerEvents = "none";

        // 5. Redirecionar para perfil.html apenas quando preenchido corretamente
        setTimeout(() => {
            window.location.href = "perfil.html";
        }, 300);
    });
});
