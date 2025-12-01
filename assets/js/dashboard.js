document.addEventListener('DOMContentLoaded', () => {

    async function loadUserData() {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                window.location.href = '/pages/userLogin/login.html';
                return;
            }

            const apiUrl = window.API_BASE_URL || 'http://localhost:3000';
            const response = await fetch(`${apiUrl}/api/profile/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/pages/userLogin/login.html';
                    return;
                }
                throw new Error('Erro ao carregar perfil');
            }

            const user = await response.json();
            renderProfile(user);

        } catch (error) {
            console.error(error);
            document.getElementById('profile-name').innerText = "Erro ao carregar.";
        }
    }

    function renderProfile(user) {
        document.getElementById('profile-name').innerText = user.username || user.name || "Usuário";
        document.getElementById('profile-nickname').innerText = user.nickname || `@${user.username}`;
        document.getElementById('profile-bio').innerText = user.bio || "Sem biografia.";
        
        const locationSpan = document.getElementById('meta-location').querySelector('span');
        if (locationSpan) locationSpan.innerText = user.location || "Brasil";
        
        if (user.stats) {
            document.getElementById('stat-items-count').innerText = user.stats.items || 0;
            document.getElementById('stat-collections-count').innerText = user.stats.sets || 0;
        }

        if (user.avatarUrl) {
            document.getElementById('profile-pic-large').src = user.avatarUrl;
            const editAvatar = document.getElementById('edit-avatar-img');
            if (editAvatar) editAvatar.src = user.avatarUrl;
        }
        
        const coverEl = document.getElementById('profile-cover');
        const editCoverEl = document.getElementById('edit-cover-preview');
        
        if (user.coverUrl) {
            const url = `url('${user.coverUrl}')`;
            coverEl.style.backgroundImage = url;
            if (editCoverEl) editCoverEl.style.backgroundImage = url;
        } else {
            coverEl.style.backgroundColor = '#444';
            if (editCoverEl) editCoverEl.style.backgroundColor = '#333';
        }

        const inputName = document.getElementById('input-full-name');
        const inputNick = document.getElementById('input-nick-name');
        const inputBio = document.getElementById('input-bio');
        const inputLoc = document.getElementById('input-location');

        if (inputName) inputName.value = user.username || "";
        if (inputNick) inputNick.value = user.nickname || "";
        if (inputBio) inputBio.value = user.bio || "";
        if (inputLoc) inputLoc.value = user.location || "";
    }

    loadUserData();

    async function resizeImage(file, maxWidth, maxHeight) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    const aspectRatio = width / height;
                    const targetRatio = maxWidth / maxHeight;

                    if (maxWidth === 1500) {
                        if (aspectRatio > targetRatio) {
                            width = height * targetRatio;
                        } else {
                            height = width / targetRatio;
                        }
                        canvas.width = maxWidth;
                        canvas.height = maxHeight;
                        
                        const ctx = canvas.getContext('2d');
                        const scale = Math.max(maxWidth / width, maxHeight / height);
                        const scaledWidth = width * scale;
                        const scaledHeight = height * scale;
                        const x = (maxWidth - scaledWidth) / 2;
                        const y = (maxHeight - scaledHeight) / 2;
                        
                        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
                    } else {
                        if (aspectRatio > targetRatio) {
                            width = maxWidth;
                            height = maxWidth / aspectRatio;
                        } else {
                            height = maxHeight;
                            width = maxHeight * aspectRatio;
                        }
                        
                        canvas.width = maxWidth;
                        canvas.height = maxHeight;
                        
                        const ctx = canvas.getContext('2d');
                        const x = (maxWidth - width) / 2;
                        const y = (maxHeight - height) / 2;
                        ctx.fillStyle = '#000';
                        ctx.fillRect(0, 0, maxWidth, maxHeight);
                        ctx.drawImage(img, x, y, width, height);
                    }

                    resolve(canvas.toDataURL('image/jpeg', 0.9));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

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
            
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Sessão expirada. Faça login novamente.');
                window.location.href = '/pages/userLogin/login.html';
                return;
            }

            const submitBtn = document.querySelector('.btn-save-mini');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Salvando...';
            }

            try {
                const apiUrl = window.API_BASE_URL || 'http://localhost:3000';
                
                let avatarUrl = null;
                const avatarInput = document.getElementById('avatar-upload');
                if (avatarInput.files && avatarInput.files[0]) {
                    const resizedAvatar = await resizeImage(avatarInput.files[0], 400, 400);
                    const uploadResponse = await fetch(`${apiUrl}/api/profile/upload-image`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ image: resizedAvatar, type: 'avatar' })
                    });

                    if (uploadResponse.ok) {
                        const uploadData = await uploadResponse.json();
                        avatarUrl = uploadData.url;
                    }
                }

                let coverUrl = null;
                const coverInput = document.getElementById('cover-upload');
                if (coverInput.files && coverInput.files[0]) {
                    const resizedCover = await resizeImage(coverInput.files[0], 1500, 500);
                    const uploadResponse = await fetch(`${apiUrl}/api/profile/upload-image`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ image: resizedCover, type: 'cover' })
                    });

                    if (uploadResponse.ok) {
                        const uploadData = await uploadResponse.json();
                        coverUrl = uploadData.url;
                    }
                }

                const profileData = {
                    nickname: document.getElementById('input-nick-name').value,
                    bio: document.getElementById('input-bio').value,
                    location: document.getElementById('input-location').value
                };

                if (avatarUrl) profileData.avatarUrl = avatarUrl;
                if (coverUrl) profileData.coverUrl = coverUrl;

                const response = await fetch(`${apiUrl}/api/profile/me`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(profileData)
                });

                if (response.ok) {
                    alert('Perfil atualizado com sucesso!');
                    closeModal();
                    loadUserData();
                } else {
                    const error = await response.json();
                    alert(error.error || 'Erro ao atualizar perfil');
                }
            } catch (error) {
                console.error(error);
                alert('Erro ao salvar perfil. Tente novamente.');
            } finally {
                const submitBtn = document.querySelector('.btn-save-mini');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Salvar';
                }
            }
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