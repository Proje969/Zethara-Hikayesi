// Yorum sistemi fonksiyonları
const auth = firebase.auth();
const db = firebase.firestore();

// Google ile giriş yapma
function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            console.log('Giriş başarılı');
            document.getElementById('comment-form').style.display = 'block';
            document.getElementById('signin-button').style.display = 'none';
            document.getElementById('user-info').textContent = `${result.user.displayName} olarak giriş yapıldı`;
        })
        .catch((error) => {
            console.error('Giriş hatası:', error);
        });
}

// Yorum ekleme
async function addComment(chapterId) {
    const commentText = document.getElementById('comment-text').value;
    if (!commentText.trim()) return;

    const user = auth.currentUser;
    if (!user) {
        alert('Yorum yapmak için giriş yapmalısınız.');
        return;
    }

    try {
        await db.collection('comments').add({
            chapterId: chapterId,
            text: commentText,
            userId: user.uid,
            userName: user.displayName,
            userPhoto: user.photoURL,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        document.getElementById('comment-text').value = '';
        loadComments(chapterId);
    } catch (error) {
        console.error('Yorum ekleme hatası:', error);
    }
}

// Yorumları yükleme
async function loadComments(chapterId) {
    const commentsDiv = document.getElementById('comments-list');
    commentsDiv.innerHTML = '';

    try {
        const snapshot = await db.collection('comments')
            .where('chapterId', '==', chapterId)
            .orderBy('timestamp', 'desc')
            .get();

        snapshot.forEach((doc) => {
            const comment = doc.data();
            const commentElement = document.createElement('div');
            commentElement.className = 'comment';
            commentElement.innerHTML = `
                <div class="comment-header">
                    <img src="${comment.userPhoto}" alt="${comment.userName}" class="comment-avatar">
                    <span class="comment-author">${comment.userName}</span>
                    <span class="comment-date">${comment.timestamp ? new Date(comment.timestamp.toDate()).toLocaleString() : 'Şimdi'}</span>
                </div>
                <div class="comment-text">${comment.text}</div>
            `;
            commentsDiv.appendChild(commentElement);
        });
    } catch (error) {
        console.error('Yorumları yükleme hatası:', error);
    }
}

// Kullanıcı durumu değişikliğini izleme
auth.onAuthStateChanged((user) => {
    const commentForm = document.getElementById('comment-form');
    const signinButton = document.getElementById('signin-button');
    const userInfo = document.getElementById('user-info');

    if (user) {
        commentForm.style.display = 'block';
        signinButton.style.display = 'none';
        userInfo.textContent = `${user.displayName} olarak giriş yapıldı`;
    } else {
        commentForm.style.display = 'none';
        signinButton.style.display = 'block';
        userInfo.textContent = '';
    }
}); 