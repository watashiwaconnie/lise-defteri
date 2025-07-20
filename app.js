// Supabase istemcisini başlat
const supabaseUrl = 'https://owwucdnfvzrwrqxseuyg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93d3VjZG5mdnpyd3JxeHNldXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTc0ODEsImV4cCI6MjA2ODUzMzQ4MX0.ro_9mRz3QbSFOQc5Fse-qeuuFkHjWXJyaBbcFE47eI4';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// DOM yüklendiğinde çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', function() {
    // Kullanıcı oturum durumunu kontrol et
    checkUserSession();
    
    // Sayfa içeriğini yükle
    loadPageContent();
});

// Kullanıcı oturum durumunu kontrol et
async function checkUserSession() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('Oturum kontrolü hatası:', error.message);
            return;
        }
        
        updateNavigation(session);
    } catch (error) {
        console.error('Oturum kontrolü hatası:', error.message);
    }
}

// Navigasyon menüsünü kullanıcı durumuna göre güncelle
function updateNavigation(session) {
    const navList = document.querySelector('.main-nav ul');
    
    // Eğer navList yoksa (örneğin, bu sayfa navigasyon içermiyorsa) işlemi atla
    if (!navList) return;
    
    // Mevcut kimlik doğrulama bağlantılarını temizle
    const authLinks = navList.querySelectorAll('.auth-link');
    authLinks.forEach(link => link.remove());
    
    // Kullanıcı oturum durumuna göre bağlantıları ekle
    if (session && session.user) {
        // Kullanıcı giriş yapmış
        const profileLi = document.createElement('li');
        profileLi.classList.add('auth-link');
        profileLi.innerHTML = `<a href="profil.html">Profilim</a>`;
        navList.appendChild(profileLi);
        
        const logoutLi = document.createElement('li');
        logoutLi.classList.add('auth-link');
        const logoutLink = document.createElement('a');
        logoutLink.href = '#';
        logoutLink.textContent = 'Çıkış Yap';
        logoutLink.addEventListener('click', handleLogout);
        logoutLi.appendChild(logoutLink);
        navList.appendChild(logoutLi);
    } else {
        // Kullanıcı giriş yapmamış
        const loginLi = document.createElement('li');
        loginLi.classList.add('auth-link');
        loginLi.innerHTML = `<a href="giris.html">Giriş Yap</a>`;
        navList.appendChild(loginLi);
        
        const registerLi = document.createElement('li');
        registerLi.classList.add('auth-link');
        registerLi.innerHTML = `<a href="kayit.html">Kayıt Ol</a>`;
        navList.appendChild(registerLi);
    }
}

// Çıkış işlemi
async function handleLogout(e) {
    e.preventDefault();
    
    try {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            console.error('Çıkış hatası:', error.message);
            return;
        }
        
        // Ana sayfaya yönlendir
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Çıkış hatası:', error.message);
    }
}

// Sayfa içeriğini yükle (sayfa türüne göre)
function loadPageContent() {
    // Mevcut sayfanın URL'sini al
    const currentPage = window.location.pathname.split('/').pop();
    
    // Sayfa türüne göre içerik yükleme fonksiyonlarını çağır
    switch (currentPage) {
        case 'forum.html':
            loadForumCategories();
            break;
        case 'profil.html':
            loadUserProfile();
            break;
        // Diğer sayfalar için gerekirse buraya eklenebilir
    }
}

// Forum kategorilerini yükle
async function loadForumCategories() {
    const categoriesContainer = document.querySelector('.forum-categories');
    
    // Eğer forum sayfasında değilsek işlemi atla
    if (!categoriesContainer) return;
    
    try {
        const { data: categories, error } = await supabase
            .from('forum_categories')
            .select('*')
            .order('name');
        
        if (error) {
            console.error('Kategori yükleme hatası:', error.message);
            categoriesContainer.innerHTML = '<p>Kategoriler yüklenirken bir hata oluştu.</p>';
            return;
        }
        
        if (categories.length === 0) {
            categoriesContainer.innerHTML = '<p>Henüz kategori bulunmuyor.</p>';
            return;
        }
        
        // Kategorileri görüntüle
        categoriesContainer.innerHTML = '';
        categories.forEach(category => {
            const categoryCard = document.createElement('div');
            categoryCard.classList.add('category-card');
            categoryCard.innerHTML = `
                <h3>${category.name}</h3>
                <p>${category.description || 'Açıklama yok'}</p>
                <a href="forum-kategori.html?id=${category.id}" class="btn btn-primary">Konuları Görüntüle</a>
            `;
            categoriesContainer.appendChild(categoryCard);
        });
    } catch (error) {
        console.error('Kategori yükleme hatası:', error.message);
        categoriesContainer.innerHTML = '<p>Kategoriler yüklenirken bir hata oluştu.</p>';
    }
}

// Kullanıcı profilini yükle
async function loadUserProfile() {
    const profileContainer = document.querySelector('.profile-container');
    
    // Eğer profil sayfasında değilsek işlemi atla
    if (!profileContainer) return;
    
    try {
        // Mevcut kullanıcıyı kontrol et
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
            // Kullanıcı giriş yapmamışsa giriş sayfasına yönlendir
            window.location.href = 'giris.html';
            return;
        }
        
        // Kullanıcı profilini al
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
        
        if (profileError) {
            console.error('Profil yükleme hatası:', profileError.message);
            profileContainer.innerHTML = '<p>Profil bilgileri yüklenirken bir hata oluştu.</p>';
            return;
        }
        
        // Profil bilgilerini görüntüle
        profileContainer.innerHTML = `
            <div class="profile-header">
                <div class="profile-avatar">
                    <img src="${profile.avatar_url || 'https://via.placeholder.com/150'}" alt="${profile.username}">
                </div>
                <div class="profile-info">
                    <h2>${profile.full_name || 'İsimsiz Kullanıcı'}</h2>
                    <p class="username">@${profile.username}</p>
                </div>
            </div>
            <div class="profile-bio">
                <h3>Hakkımda</h3>
                <p>${profile.bio || 'Henüz bir biyografi eklenmemiş.'}</p>
            </div>
            <div class="profile-actions">
                <button id="edit-profile-btn" class="btn btn-primary">Profili Düzenle</button>
            </div>
        `;
        
        // Profil düzenleme butonuna olay dinleyicisi ekle
        document.getElementById('edit-profile-btn').addEventListener('click', openEditProfileForm);
    } catch (error) {
        console.error('Profil yükleme hatası:', error.message);
        profileContainer.innerHTML = '<p>Profil bilgileri yüklenirken bir hata oluştu.</p>';
    }
}

// Profil düzenleme formunu aç
function openEditProfileForm() {
    // Mevcut profil bilgilerini al
    const fullName = document.querySelector('.profile-info h2').textContent;
    const bio = document.querySelector('.profile-bio p').textContent;
    const avatarUrl = document.querySelector('.profile-avatar img').src;
    
    // Profil düzenleme formunu oluştur
    const formHTML = `
        <div class="edit-profile-form">
            <h3>Profili Düzenle</h3>
            <div class="form-group">
                <label for="edit-full-name">Ad Soyad</label>
                <input type="text" id="edit-full-name" value="${fullName === 'İsimsiz Kullanıcı' ? '' : fullName}">
            </div>
            <div class="form-group">
                <label for="edit-bio">Hakkımda</label>
                <textarea id="edit-bio">${bio === 'Henüz bir biyografi eklenmemiş.' ? '' : bio}</textarea>
            </div>
            <div class="form-group">
                <label for="edit-avatar">Profil Resmi URL</label>
                <input type="text" id="edit-avatar" value="${avatarUrl === 'https://via.placeholder.com/150' ? '' : avatarUrl}">
            </div>
            <div class="form-actions">
                <button id="save-profile-btn" class="btn btn-primary">Kaydet</button>
                <button id="cancel-edit-btn" class="btn btn-secondary">İptal</button>
            </div>
        </div>
    `;
    
    // Formu sayfaya ekle
    const profileContainer = document.querySelector('.profile-container');
    profileContainer.innerHTML = formHTML;
    
    // Form butonlarına olay dinleyicileri ekle
    document.getElementById('save-profile-btn').addEventListener('click', saveProfileChanges);
    document.getElementById('cancel-edit-btn').addEventListener('click', loadUserProfile);
}

// Profil değişikliklerini kaydet
async function saveProfileChanges() {
    const fullName = document.getElementById('edit-full-name').value;
    const bio = document.getElementById('edit-bio').value;
    const avatarUrl = document.getElementById('edit-avatar').value;
    
    try {
        // Mevcut kullanıcıyı kontrol et
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
            console.error('Oturum hatası:', sessionError?.message || 'Kullanıcı oturumu bulunamadı');
            return;
        }
        
        // Profil bilgilerini güncelle
        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                full_name: fullName || null,
                bio: bio || null,
                avatar_url: avatarUrl || null
            })
            .eq('id', session.user.id);
        
        if (updateError) {
            console.error('Profil güncelleme hatası:', updateError.message);
            alert('Profil güncellenirken bir hata oluştu.');
            return;
        }
        
        // Profil sayfasını yeniden yükle
        loadUserProfile();
    } catch (error) {
        console.error('Profil güncelleme hatası:', error.message);
        alert('Profil güncellenirken bir hata oluştu.');
    }
}