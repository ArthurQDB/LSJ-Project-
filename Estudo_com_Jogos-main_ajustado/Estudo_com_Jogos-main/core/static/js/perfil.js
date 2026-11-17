/* ==========================================================
   LÓGICA DO PERFIL EDITÁVEL + SIDEBAR
   Permite trocar avatar, banner, nome, bio e dados com salvamento local.
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // Elementos da Sidebar
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const overlay = document.getElementById('sidebarOverlay');
    const btnOpen = document.getElementById('btnOpenSidebar');
    const btnLogout = document.getElementById('btnLogout');
    const sidebarAvatar = document.getElementById('sidebarAvatar');
    const topbarAvatar = document.getElementById('topbarAvatar');
    const sidebarUser = document.getElementById('sidebarUsername');

    // Elementos de Exibição
    const displayName = document.getElementById('displayName');
    const displayHeadline = document.getElementById('displayHeadline');
    const displayBio = document.getElementById('displayBio');
    const displayLocation = document.getElementById('displayLocation');
    const displayStatus = document.getElementById('displayStatus');

    const avatarImg = document.getElementById('avatarImg');
    const bannerImg = document.getElementById('bannerImg');

    const avatarInput = document.getElementById('avatarInput');
    const bannerInput = document.getElementById('bannerInput');
    const avatarWrapper = document.querySelector('.avatar-wrapper');

    // Elementos do Cropper
    const cropModal = document.getElementById('cropModal');
    const cropImage = document.getElementById('cropImage');
    const btnCancelCrop = document.getElementById('btnCancelCrop');
    const btnApplyCrop = document.getElementById('btnApplyCrop');
    let cropper = null;
    let currentCropTarget = null; // 'avatar' ou 'banner'

    // Controle de Modo (Visualizar / Editar)
    const viewMode = document.getElementById('viewMode');
    const editForm = document.getElementById('editForm');
    const btnEdit = document.getElementById('btnEdit');
    const btnCancel = document.getElementById('btnCancel');

    // Campos do Formulário
    const inputName = document.getElementById('inputName');
    const inputHeadline = document.getElementById('inputHeadline');
    const inputBio = document.getElementById('inputBio');
    const inputLocation = document.getElementById('inputLocation');
    const inputStatus = document.getElementById('inputStatus');

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

    // Imagens padrão caso o usuário atual não tenha enviado as suas
    const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80";
    const DEFAULT_SIDEBAR_AVATAR = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80";
    const DEFAULT_BANNER = "https://images.unsplash.com/photo-1707343843437-caacff5cfa74?w=1200&auto=format&fit=crop&q=80";

    // Atualiza nome e avatar na sidebar
    function updateSidebarInfo(name, avatar) {
        if (sidebarUser && name) sidebarUser.textContent = name;
        if (sidebarAvatar && avatar) sidebarAvatar.src = avatar;
        if (topbarAvatar && avatar) topbarAvatar.src = avatar;
    }

    // 1. CARREGAR DADOS SALVOS NO NAVEGADOR (localStorage específico deste usuário)
    function loadSavedProfile() {
        const savedRaw = localStorage.getItem(getUserStorageKey('user_profile_data'));
        const saved = savedRaw ? JSON.parse(savedRaw) : null;

        if (saved) {
            displayName.textContent = saved.name || displayName.textContent;
            displayHeadline.textContent = saved.headline || 'Qual sua profissão?';
            displayBio.textContent = saved.bio || 'Adicione uma breve descrição sobre você';
            displayLocation.textContent = saved.location || '📍 Adicione sua cidade';
            displayStatus.textContent = saved.status || '💬 Adicione seu status';
        } else {
            // Conta nova ou sem alterações: valores padrão limpos
            displayHeadline.textContent = 'Qual sua profissão?';
            displayBio.textContent = 'Adicione uma breve descrição sobre você';
            displayLocation.textContent = '📍 Adicione sua cidade';
            displayStatus.textContent = '💬 Adicione seu status';
        }

        const savedAvatar = localStorage.getItem(getUserStorageKey('user_avatar_img'));
        avatarImg.src = savedAvatar || DEFAULT_AVATAR;

        const savedBanner = localStorage.getItem(getUserStorageKey('user_banner_img'));
        bannerImg.src = savedBanner || DEFAULT_BANNER;

        updateSidebarInfo(displayName.textContent, savedAvatar || DEFAULT_SIDEBAR_AVATAR);
    }

    loadSavedProfile();

    // FUNÇÃO PARA ABRIR O MODAL DE CORTE
    function openCropModal(file, targetType) {
        if (!file) return;
        currentCropTarget = targetType;

        const reader = new FileReader();
        reader.onload = (event) => {
            cropImage.src = event.target.result;
            cropModal.style.display = 'flex';

            // Destruir cropper anterior se existir
            if (cropper) cropper.destroy();

            // Inicializar novo cropper
            cropper = new Cropper(cropImage, {
                aspectRatio: targetType === 'avatar' ? 1 : 680 / 200,
                viewMode: 1,
                autoCropArea: 1,
            });
        };
        reader.readAsDataURL(file);
    }

    // 2. ALTERAR FOTO DE PERFIL (AVATAR)
    avatarInput.addEventListener('change', (e) => {
        openCropModal(e.target.files[0], 'avatar');
        e.target.value = '';
    });

    // 3. ALTERAR FOTO DO BANNER
    bannerInput.addEventListener('change', (e) => {
        openCropModal(e.target.files[0], 'banner');
        e.target.value = '';
    });

    // APLICAR CORTE
    btnApplyCrop.addEventListener('click', () => {
        if (!cropper) return;

        const canvas = cropper.getCroppedCanvas({
            width: currentCropTarget === 'avatar' ? 300 : 1200,
        });

        const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.8);

        if (currentCropTarget === 'avatar') {
            avatarImg.src = croppedDataUrl;
            localStorage.setItem(getUserStorageKey('user_avatar_img'), croppedDataUrl);
            updateSidebarInfo(displayName.textContent, croppedDataUrl);
        } else {
            bannerImg.src = croppedDataUrl;
            localStorage.setItem(getUserStorageKey('user_banner_img'), croppedDataUrl);
        }

        closeCropModal();
    });

    // CANCELAR CORTE
    btnCancelCrop.addEventListener('click', closeCropModal);

    function closeCropModal() {
        cropModal.style.display = 'none';
        if (cropper) cropper.destroy();
        cropper = null;
        cropImage.src = '';
    }

    // 4. ABRIR MODO DE EDIÇÃO
    btnEdit.addEventListener('click', () => {
        inputName.value = displayName.textContent;
        inputHeadline.value = displayHeadline.textContent;
        inputBio.value = displayBio.textContent;
        inputLocation.value = displayLocation.textContent;
        inputStatus.value = displayStatus.textContent;

        viewMode.style.display = 'none';
        editForm.style.display = 'flex';
    });

    // 5. CANCELAR EDIÇÃO
    btnCancel.addEventListener('click', () => {
        editForm.style.display = 'none';
        viewMode.style.display = 'block';
    });

    // 6. SALVAR ALTERAÇÕES
    editForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const updatedData = {
            name: inputName.value.trim(),
            headline: inputHeadline.value.trim(),
            bio: inputBio.value.trim(),
            location: inputLocation.value.trim(),
            status: inputStatus.value.trim()
        };

        displayName.textContent = updatedData.name;
        displayHeadline.textContent = updatedData.headline;
        displayBio.textContent = updatedData.bio;
        displayLocation.textContent = updatedData.location;
        displayStatus.textContent = updatedData.status;

        localStorage.setItem(getUserStorageKey('user_profile_data'), JSON.stringify(updatedData));
        updateSidebarInfo(updatedData.name, avatarImg.src);

        editForm.style.display = 'none';
        viewMode.style.display = 'block';
    });

    /* ---- Desktop: colapsar sidebar ao tirar o mouse ---- */
    const isDesktop = () => window.innerWidth > 768;

    if (sidebar && mainContent) {
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

        if (isDesktop()) {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('sidebar-collapsed-state');
        }
    }

    /* ---- Mobile: abrir/fechar sidebar ---- */
    function openSidebar() {
        if (sidebar && overlay) {
            sidebar.classList.add('mobile-open');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeSidebar() {
        if (sidebar && overlay) {
            sidebar.classList.remove('mobile-open');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    if (btnOpen) btnOpen.addEventListener('click', openSidebar);
    if (overlay) overlay.addEventListener('click', closeSidebar);

    window.addEventListener('resize', () => {
        if (isDesktop() && sidebar && mainContent) {
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

});
