document.addEventListener('DOMContentLoaded', () => {
    const chaptersGrid = document.querySelector('.chapters-grid');
    
    // Bölümleri dinamik olarak oluştur
    chapters.forEach(chapter => {
        const articleElement = document.createElement('article');
        articleElement.className = 'chapter-card';
        
        articleElement.innerHTML = `
            <h3>${chapter.title}</h3>
            <p>${chapter.preview}</p>
            <span class="status">${chapter.status}</span>
        `;
        
        chaptersGrid.appendChild(articleElement);
    });

    // Scroll animasyonu
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.style.background = 'rgba(44, 24, 16, 0.95)';
        } else {
            nav.style.background = 'transparent';
        }
    });
});

// Character modal functionality
function openCharacterModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    }
}

function closeCharacterModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('character-modal')) {
        event.target.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modals = document.getElementsByClassName('character-modal');
        for (let modal of modals) {
            if (modal.style.display === 'block') {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        }
    }
}); 