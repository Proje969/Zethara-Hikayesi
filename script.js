document.addEventListener('DOMContentLoaded', () => {
    // Örnek hikaye bölümleri
    const chapters = [
        {
            title: 'Bölüm 1: Küllerden Doğuş',
            preview: 'Zethara\'nın hikayesi başlıyor...',
            status: 'yakında'
        },
        {
            title: 'Bölüm 2: Alev Muhafızları',
            preview: 'İsyanın tohumları ekiliyor...',
            status: 'yakında'
        },
        {
            title: 'Bölüm 3: Kristal Efsun',
            preview: 'Kadim sırlar açığa çıkıyor...',
            status: 'yakında'
        }
    ];

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