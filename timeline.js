document.addEventListener('DOMContentLoaded', () => {
    const timelineItems = document.querySelectorAll('.timeline-item');

    // Her zaman çizelgesi öğesine tıklama olayı ekle
    timelineItems.forEach(item => {
        const content = item.querySelector('.timeline-content');
        const details = item.querySelector('.timeline-details');

        content.addEventListener('click', () => {
            // Diğer tüm detayları kapat
            document.querySelectorAll('.timeline-details.active').forEach(detail => {
                if (detail !== details) {
                    detail.classList.remove('active');
                }
            });

            // Tıklanan öğenin detaylarını aç/kapat
            details.classList.toggle('active');

            // Scroll animasyonu
            if (details.classList.contains('active')) {
                item.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });

    // Sayfa yüklendiğinde animasyon efekti
    const observerOptions = {
        root: null,
        threshold: 0.1,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    timelineItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'all 0.5s ease-out';
        observer.observe(item);
    });

    // Ateş efekti için parçacık sistemi
    const dots = document.querySelectorAll('.timeline-dot');
    dots.forEach(dot => {
        setInterval(() => {
            const particle = document.createElement('div');
            particle.className = 'fire-particle';
            particle.style.left = Math.random() * 20 - 10 + 'px';
            particle.style.animationDuration = Math.random() * 1 + 0.5 + 's';
            dot.appendChild(particle);

            setTimeout(() => {
                particle.remove();
            }, 1500);
        }, 100);
    });
}); 