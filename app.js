/* ==========================================================
   LÓGICA DO PERFIL EDITÁVEL
   Permite trocar avatar, banner, nome, bio e dados com salvamento local.
   ========================================================== */

   document.addEventListener('DOMContentLoaded', () => {

    // Elementos de Exibição
    const displayName = document.getElementById('displayName');
    const displayHeadline = document.getElementById('displayHeadline');
    const displayBio = document.getElementById('displayBio');
    const displayLocation = document.getElementById('displayLocation');
    const displayStatus = document.getElementById('displayStatus');
  
    const avatarImg = document.getElementById('avatarImg');
    const bannerImg = document.getElementById('bannerImg');
  
    // Inputs de Arquivo
    const avatarInput = document.getElementById('avatarInput');
    const bannerInput = document.getElementById('bannerInput');
  
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
  
    // 1. CARREGAR DADOS SALVOS NO NAVEGADOR (localStorage)
    function loadSavedProfile() {
      const saved = JSON.parse(localStorage.getItem('user_profile_data'));
  
      if (saved) {
        displayName.textContent = saved.name || displayName.textContent;
        displayHeadline.textContent = saved.headline || displayHeadline.textContent;
        displayBio.textContent = saved.bio || displayBio.textContent;
        displayLocation.textContent = saved.location || displayLocation.textContent;
        displayStatus.textContent = saved.status || displayStatus.textContent;
      }
  
      const savedAvatar = localStorage.getItem('user_avatar_img');
      if (savedAvatar) avatarImg.src = savedAvatar;
  
      const savedBanner = localStorage.getItem('user_banner_img');
      if (savedBanner) bannerImg.src = savedBanner;
    }
  
    loadSavedProfile();
  
    // 2. ALTERAR FOTO DE PERFIL (AVATAR)
    avatarInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          avatarImg.src = event.target.result;
          localStorage.setItem('user_avatar_img', event.target.result);
        };
        reader.readAsDataURL(file);
      }
    });
  
    // 3. ALTERAR FOTO DO BANNER
    bannerInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          bannerImg.src = event.target.result;
          localStorage.setItem('user_banner_img', event.target.result);
        };
        reader.readAsDataURL(file);
      }
    });
  
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
  
      localStorage.setItem('user_profile_data', JSON.stringify(updatedData));
  
      editForm.style.display = 'none';
      viewMode.style.display = 'block';
    });
  
  });
  