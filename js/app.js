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
          aspectRatio: targetType === 'avatar' ? 1 : 680 / 200, // 1:1 para avatar, proporção do banner
          viewMode: 1,
          autoCropArea: 1,
        });
      };
      reader.readAsDataURL(file);
    }
    
    // 2. ALTERAR FOTO DE PERFIL (AVATAR)
    avatarInput.addEventListener('change', (e) => {
      openCropModal(e.target.files[0], 'avatar');
      e.target.value = ''; // Reset para permitir selecionar a mesma imagem
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
        width: currentCropTarget === 'avatar' ? 300 : 1200, // Resolução max para salvar
      });
      
      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      
      if (currentCropTarget === 'avatar') {
        avatarImg.src = croppedDataUrl;
        localStorage.setItem('user_avatar_img', croppedDataUrl);
      } else {
        bannerImg.src = croppedDataUrl;
        localStorage.setItem('user_banner_img', croppedDataUrl);
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
  
      localStorage.setItem('user_profile_data', JSON.stringify(updatedData));
  
      editForm.style.display = 'none';
      viewMode.style.display = 'block';
    });
  
  });
  