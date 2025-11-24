document.addEventListener('DOMContentLoaded', () => {

    async function loadUserData() {
        try {
            setTimeout(() => {
                const mockUser = {
                    name: "Carregando...",
                    nickname: "",
                    email: "usuario@email.com",
                    bio: "Aguardando biografia...",
                    avatar: "../assets/images/icon.png",
                    coverImage: null,
                    stats: {
                        items: 0,
                        sets: 0
                    },
                    isVerified: false,
                    gender: "",
                    country: ""
                };
                renderProfile(mockUser);
            }, 500);

        } catch (error) {
            console.error('Erro:', error);
            document.getElementById('profile-name').innerText = "Erro ao carregar.";
        }
    }

    function renderProfile(user) {
        document.getElementById('profile-name').innerHTML = `
            ${user.name} 
            ${user.isVerified ? '<i class="fa-solid fa-star verified-icon"></i>' : ''}
        `;
        document.getElementById('profile-email').innerText = user.email;
        document.getElementById('profile-bio').innerText = user.bio || "Sem biografia.";
        
        document.getElementById('stat-items-count').innerText = user.stats.items;
        document.getElementById('stat-collections-count').innerText = user.stats.sets;

        if (user.avatar) {
            document.getElementById('profile-pic-large').src = user.avatar;
            document.getElementById('header-profile-pic').src = user.avatar;
        }
        
        const coverEl = document.getElementById('profile-cover');
        if (user.coverImage) {
            coverEl.style.backgroundImage = `url('${user.coverImage}')`;
        } else {
            coverEl.style.backgroundColor = '#444';
        }

        document.getElementById('input-full-name').value = user.name || "";
        document.getElementById('input-nick-name').value = user.nickname || "";
        document.getElementById('input-country').value = user.country || "";
        document.getElementById('input-bio').value = user.bio || "";
        document.getElementById('input-gender').value = user.gender || "";

        const emailContainer = document.getElementById('email-list-container');
        emailContainer.innerHTML = `
            <div class="email-item">
                <span class="email-address">${user.email}</span>
                <span class="email-verified">Principal</span>
            </div>
        `;
    }

    loadUserData();

    const editProfileBtn = document.getElementById('btn-edit-profile');
    const editProfilePicOverlay = document.querySelector('.edit-profile-pic-overlay');
    const editProfileModal = document.getElementById('edit-profile-modal');
    const closeModalBtn = document.getElementById('btn-close-modal');
    const cancelEditBtn = document.getElementById('btn-cancel-edit');
    const editProfileForm = document.getElementById('edit-profile-form');
    
    function openModal() {
        editProfileModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        editProfileModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    editProfileBtn.addEventListener('click', openModal);
    editProfilePicOverlay.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelEditBtn.addEventListener('click', closeModal);

    editProfileModal.addEventListener('click', (e) => {
        if (e.target === editProfileModal) closeModal();
    });

    editProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const newData = {
            name: document.getElementById('input-full-name').value,
            nickname: document.getElementById('input-nick-name').value,
            country: document.getElementById('input-country').value,
            bio: document.getElementById('input-bio').value,
            gender: document.getElementById('input-gender').value
        };

        alert('Perfil atualizado com sucesso!');
        closeModal();
        
        document.getElementById('profile-name').innerText = newData.name;
        document.getElementById('profile-bio').innerText = newData.bio;
    });

    const emailHeaderToggle = document.getElementById('email-header-toggle');
    const emailSection = document.querySelector('.email-section');
    
    emailHeaderToggle.addEventListener('click', () => {
        emailSection.classList.toggle('active');
    });

    const imageUploadArea = document.getElementById('image-upload-area');
    const imageUploadInput = document.getElementById('image-upload-input');
    
    imageUploadArea.addEventListener('click', () => imageUploadInput.click());
    
    imageUploadInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            alert(`Imagem "${e.target.files[0].name}" pronta para envio.`);
        }
    });
});