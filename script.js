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