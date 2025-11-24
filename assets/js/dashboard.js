document.addEventListener('DOMContentLoaded', () => {

    async function loadUserData() {
        try {
            setTimeout(() => {
                const mockUser = {
                    name: "Carregando...",
                    nickname: "@usuario",
                    email: "usuario@email.com",
                    bio: "Aguardando biografia...",
                    avatar: "../assets/images/icon.png",
                    coverImage: null,
                    stats: {
                        items: 0,
                        sets: 0
                    },
                    isVerified: false,
                    location: "Brasil",
                    website: ""
                };
                renderProfile(mockUser);
            }, 500);

        } catch (error) {
            console.error(error);
            document.getElementById('profile-name').innerText = "Erro ao carregar.";
        }
    }

    function renderProfile(user) {
        document.getElementById('profile-name').innerText = user.name;
        document.getElementById('profile-nickname').innerText = user.nickname;
        document.getElementById('profile-bio').innerText = user.bio || "Sem biografia.";
        
        const locationSpan = document.getElementById('meta-location').querySelector('span');
        if (locationSpan) locationSpan.innerText = user.location || "Brasil";
        
        document.getElementById('stat-items-count').innerText = user.stats.items;
        document.getElementById('stat-collections-count').innerText = user.stats.sets;

        if (user.avatar) {
            document.getElementById('profile-pic-large').src = user.avatar;
            const editAvatar = document.getElementById('edit-avatar-img');
            if (editAvatar) editAvatar.src = user.avatar;
        }
        
        const coverEl = document.getElementById('profile-cover');
        const editCoverEl = document.getElementById('edit-cover-preview');
        
        if (user.coverImage) {
            const url = `url('${user.coverImage}')`;
            coverEl.style.backgroundImage = url;
            if (editCoverEl) editCoverEl.style.backgroundImage = url;
        } else {
            coverEl.style.backgroundColor = '#444';
            if (editCoverEl) editCoverEl.style.backgroundColor = '#333';
        }

        if (user.isVerified) {
            const badge = document.getElementById('verified-badge');
            badge.innerHTML = '<i class="fa-solid fa-star verified-icon"></i>';
        }

        const inputName = document.getElementById('input-full-name');
        const inputNick = document.getElementById('input-nick-name');
        const inputBio = document.getElementById('input-bio');
        const inputLoc = document.getElementById('input-location');
        const inputSite = document.getElementById('input-website');

        if (inputName) inputName.value = user.name || "";
        if (inputNick) inputNick.value = user.nickname || "";
        if (inputBio) inputBio.value = user.bio || "";
        if (inputLoc) inputLoc.value = user.location || "";
        if (inputSite) inputSite.value = user.website || "";
    }

    loadUserData();

    const editProfileBtn = document.getElementById('btn-edit-profile');
    const editProfileModal = document.getElementById('edit-profile-modal');
    const closeModalBtn = document.getElementById('btn-close-modal');
    const editProfileForm = document.getElementById('edit-profile-form');
    
    function openModal() {
        editProfileModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        editProfileModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (editProfileBtn) editProfileBtn.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

    if (editProfileModal) {
        editProfileModal.addEventListener('click', (e) => {
            if (e.target === editProfileModal) closeModal();
        });
    }

    if (editProfileForm) {
        editProfileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const newData = {
                name: document.getElementById('input-full-name').value,
                nickname: document.getElementById('input-nick-name').value,
                bio: document.getElementById('input-bio').value,
                location: document.getElementById('input-location').value
            };

            alert('Perfil atualizado com sucesso!');
            closeModal();
            
            document.getElementById('profile-name').innerText = newData.name;
            document.getElementById('profile-nickname').innerText = newData.nickname;
            document.getElementById('profile-bio').innerText = newData.bio;
            
            const locationSpan = document.getElementById('meta-location').querySelector('span');
            if (locationSpan) locationSpan.innerText = newData.location;
        });
    }

    const coverUpload = document.getElementById('cover-upload');
    const avatarUpload = document.getElementById('avatar-upload');

    function handleImagePreview(input, imgElement, bgElement) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                if(imgElement) imgElement.src = e.target.result;
                if(bgElement) bgElement.style.backgroundImage = `url('${e.target.result}')`;
            }
            reader.readAsDataURL(input.files[0]);
        }
    }

    if (avatarUpload) {
        avatarUpload.addEventListener('change', function() {
            handleImagePreview(this, document.getElementById('edit-avatar-img'), null);
        });
    }

    if (coverUpload) {
        coverUpload.addEventListener('change', function() {
            handleImagePreview(this, null, document.getElementById('edit-cover-preview'));
        });
    }
});