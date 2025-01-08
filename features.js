// Özellikler sınıfı
class Features {
    constructor() {
        this.db = firebase.firestore();
        this.auth = firebase.auth();
        this.currentChapter = window.location.pathname.split('/').pop().replace('.html', '');
        
        this.setupEventListeners();
        this.initializeFeatures();
    }

    setupEventListeners() {
        // Oturum durumu değişikliğini dinle
        this.auth.onAuthStateChanged((user) => {
            this.updateUI(user);
            if (user) {
                this.loadUserData();
            }
        });
    }

    async initializeFeatures() {
        // Okuma süresi hesaplama
        this.calculateReadingTime();
        
        // Okuma listesi kontrolü
        if (this.auth.currentUser) {
            await this.checkReadingList();
        }
    }

    calculateReadingTime() {
        const chapterText = document.querySelector('.chapter-text');
        if (chapterText) {
            const words = chapterText.textContent.trim().split(/\s+/).length;
            const minutes = Math.ceil(words / 200); // Ortalama okuma hızı: dakikada 200 kelime
            
            const readingTime = document.querySelector('.reading-time');
            if (readingTime) {
                readingTime.textContent = `Okuma Süresi: ${minutes} dakika`;
            }
        }
    }

    async checkReadingList() {
        if (!this.auth.currentUser) return;

        try {
            const userRef = this.db.collection('users').doc(this.auth.currentUser.uid);
            const doc = await userRef.get();
            
            if (doc.exists) {
                const readingList = doc.data().readingList || [];
                if (readingList.includes(this.currentChapter)) {
                    // Bölüm okunmuş olarak işaretlendi
                    this.markAsRead();
                }
            }
        } catch (error) {
            console.error('Okuma listesi kontrolü hatası:', error);
        }
    }

    async markAsRead() {
        if (!this.auth.currentUser) return;

        try {
            const userRef = this.db.collection('users').doc(this.auth.currentUser.uid);
            await userRef.update({
                readingList: firebase.firestore.FieldValue.arrayUnion(this.currentChapter)
            });

            // UI güncelleme
            const readButton = document.querySelector('.mark-as-read');
            if (readButton) {
                readButton.classList.add('read');
                readButton.innerHTML = '<i class="fas fa-check"></i> Okundu';
            }
        } catch (error) {
            console.error('Okundu işaretleme hatası:', error);
        }
    }

    updateUI(user) {
        const profileLink = document.getElementById('profile-link');
        if (profileLink) {
            profileLink.style.display = user ? 'block' : 'none';
        }

        // Diğer UI güncellemeleri
        this.updateReadingProgress(user);
    }

    async updateReadingProgress(user) {
        if (!user) return;

        try {
            const userRef = this.db.collection('users').doc(user.uid);
            const doc = await userRef.get();
            
            if (doc.exists) {
                const readingList = doc.data().readingList || [];
                const totalChapters = 5; // Toplam bölüm sayısı
                const progress = (readingList.length / totalChapters) * 100;

                // İlerleme çubuğunu güncelle
                const progressBar = document.querySelector('.reading-progress');
                if (progressBar) {
                    progressBar.style.width = `${progress}%`;
                    progressBar.setAttribute('aria-valuenow', progress);
                }
            }
        } catch (error) {
            console.error('İlerleme güncelleme hatası:', error);
        }
    }

    async loadUserData() {
        if (!this.auth.currentUser) return;

        try {
            const userRef = this.db.collection('users').doc(this.auth.currentUser.uid);
            const doc = await userRef.get();
            
            if (doc.exists) {
                const userData = doc.data();
                this.updateUserProfile(userData);
            }
        } catch (error) {
            console.error('Kullanıcı verisi yükleme hatası:', error);
        }
    }

    updateUserProfile(userData) {
        const profileName = document.querySelector('.profile-name');
        const profileImage = document.querySelector('.profile-image');
        
        if (profileName) {
            profileName.textContent = userData.displayName;
        }
        
        if (profileImage) {
            profileImage.src = userData.photoURL || 'images/default-avatar.jpg';
        }
    }
}

// Sayfa yüklendiğinde özellikleri başlat
document.addEventListener('DOMContentLoaded', () => {
    new Features();
}); 