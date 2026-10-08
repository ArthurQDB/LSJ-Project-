document.addEventListener('DOMContentLoaded', () => {
    const elementosAnimados = document.querySelectorAll('.scroll-reveal');
    if (!elementosAnimados.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else if (entry.boundingClientRect.top > window.innerHeight * 0.6) {
                entry.target.classList.remove('visible');
            }
        });
    }, { rootMargin: '0px 0px -50px 0px', threshold: 0.12 });

    elementosAnimados.forEach(el => observer.observe(el));
});
