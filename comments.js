// Yorum sistemi fonksiyonları
class CommentSystem {
    constructor() {
        this.db = firebase.firestore();
        this.auth = firebase.auth();
        this.currentChapter = window.location.pathname.split('/').pop().replace('.html', '');
        this.commentForm = document.getElementById('comment-form');
        this.commentsContainer = document.getElementById('comments-container');
        this.signInButton = document.getElementById('signin-button');

        this.setupEventListeners();
        this.loadComments();
    }

    setupEventListeners() {
        // Yorum formu gönderme
        if (this.commentForm) {
            this.commentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitComment();
            });
        }

        // Giriş yapma butonu
        if (this.signInButton) {
            this.signInButton.addEventListener('click', () => {
                this.signInWithGoogle();
            });
        }

        // Oturum durumu değişikliğini dinle
        this.auth.onAuthStateChanged((user) => {
            this.updateUI(user);
        });
    }

    async signInWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            await this.auth.signInWithPopup(provider);
        } catch (error) {
            console.error('Giriş hatası:', error);
            alert('Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
        }
    }

    updateUI(user) {
        if (this.commentForm && this.signInButton) {
            if (user) {
                this.commentForm.style.display = 'block';
                this.signInButton.style.display = 'none';
            } else {
                this.commentForm.style.display = 'none';
                this.signInButton.style.display = 'block';
            }
        }
    }

    async submitComment() {
        if (!this.auth.currentUser) {
            alert('Yorum yapmak için giriş yapmalısınız.');
            return;
        }

        const commentText = document.getElementById('comment-text').value.trim();
        if (!commentText) {
            alert('Lütfen bir yorum yazın.');
            return;
        }

        try {
            await this.db.collection('comments').add({
                userId: this.auth.currentUser.uid,
                userName: this.auth.currentUser.displayName,
                userPhoto: this.auth.currentUser.photoURL,
                chapter: this.currentChapter,
                text: commentText,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                likes: 0
            });

            document.getElementById('comment-text').value = '';
            this.loadComments(); // Yorumları yeniden yükle
        } catch (error) {
            console.error('Yorum gönderme hatası:', error);
            alert('Yorum gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
        }
    }

    async loadComments() {
        if (!this.commentsContainer) return;

        try {
            const snapshot = await this.db.collection('comments')
                .where('chapter', '==', this.currentChapter)
                .orderBy('timestamp', 'desc')
                .get();

            this.commentsContainer.innerHTML = '';
            
            if (snapshot.empty) {
                this.commentsContainer.innerHTML = '<p class="no-comments">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>';
                return;
            }

            snapshot.forEach(doc => {
                const comment = doc.data();
                const commentElement = this.createCommentElement(doc.id, comment);
                this.commentsContainer.appendChild(commentElement);
            });
        } catch (error) {
            console.error('Yorumları yükleme hatası:', error);
            this.commentsContainer.innerHTML = '<p class="error">Yorumlar yüklenirken bir hata oluştu.</p>';
        }
    }

    createCommentElement(commentId, comment) {
        const div = document.createElement('div');
        div.className = 'comment';
        div.innerHTML = `
            <div class="comment-header">
                <img src="${comment.userPhoto || 'images/default-avatar.jpg'}" alt="${comment.userName}" class="user-avatar">
                <div class="comment-info">
                    <h4>${comment.userName}</h4>
                    <span class="comment-date">${this.formatDate(comment.timestamp)}</span>
                </div>
            </div>
            <p class="comment-text">${this.escapeHtml(comment.text)}</p>
            <div class="comment-actions">
                <button class="like-button ${comment.likes > 0 ? 'liked' : ''}" data-comment-id="${commentId}">
                    <i class="fas fa-heart"></i>
                    <span class="like-count">${comment.likes}</span>
                </button>
                ${this.auth.currentUser?.uid === comment.userId ? `
                    <button class="delete-button" data-comment-id="${commentId}">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            </div>
        `;

        // Beğeni butonu olayı
        const likeButton = div.querySelector('.like-button');
        if (likeButton) {
            likeButton.addEventListener('click', () => this.toggleLike(commentId));
        }

        // Silme butonu olayı
        const deleteButton = div.querySelector('.delete-button');
        if (deleteButton) {
            deleteButton.addEventListener('click', () => this.deleteComment(commentId));
        }

        return div;
    }

    async toggleLike(commentId) {
        if (!this.auth.currentUser) {
            alert('Beğenmek için giriş yapmalısınız.');
            return;
        }

        try {
            const commentRef = this.db.collection('comments').doc(commentId);
            const doc = await commentRef.get();
            
            if (doc.exists) {
                const currentLikes = doc.data().likes || 0;
                await commentRef.update({
                    likes: currentLikes + 1
                });
                this.loadComments(); // Yorumları yenile
            }
        } catch (error) {
            console.error('Beğeni hatası:', error);
            alert('Beğeni işlemi sırasında bir hata oluştu.');
        }
    }

    async deleteComment(commentId) {
        if (!this.auth.currentUser) return;

        if (confirm('Bu yorumu silmek istediğinizden emin misiniz?')) {
            try {
                await this.db.collection('comments').doc(commentId).delete();
                this.loadComments(); // Yorumları yenile
            } catch (error) {
                console.error('Yorum silme hatası:', error);
                alert('Yorum silinirken bir hata oluştu.');
            }
        }
    }

    formatDate(timestamp) {
        if (!timestamp) return 'Bilinmeyen tarih';
        
        const date = timestamp.toDate();
        return new Intl.DateTimeFormat('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Sayfa yüklendiğinde yorum sistemini başlat
document.addEventListener('DOMContentLoaded', () => {
    new CommentSystem();
}); 