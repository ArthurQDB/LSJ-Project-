/**
 * index.js - Controle de Animações de Scroll (Slide e Fade In)
 * Estudos com Jogos
 */

document.addEventListener('DOMContentLoaded', () => {
    // Seleciona todos os elementos com a classe de animação scroll-reveal
    const elementosAnimados = document.querySelectorAll('.scroll-reveal');

    if (!elementosAnimados.length) return;

    // Configuração do IntersectionObserver
    const opcoesObserver = {
        root: null,
        // Gatilho ligeiramente antes do elemento atingir a margem inferior
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.12
    };

    const animarNoScroll = (entries) => {
        entries.forEach(entry => {
            const rect = entry.boundingClientRect;
            const alturaJanela = window.innerHeight || document.documentElement.clientHeight;

            if (entry.isIntersecting) {
                // Ao rolar e o elemento entrar na tela: aplica slide e fade in
                entry.target.classList.add('visible');
            } else {
                // Se o usuário rolou para cima e o elemento voltou a ficar abaixo da tela visível,
                // removemos a classe para que ele deslize e surja novamente ao descer com o scroll
                if (rect.top > alturaJanela * 0.6) {
                    entry.target.classList.remove('visible');
                }
            }
        });
    };

    // Uso do IntersectionObserver nativo
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(animarNoScroll, opcoesObserver);
        elementosAnimados.forEach(elemento => observer.observe(elemento));
    } else {
        // Fallback em caso de navegadores sem IntersectionObserver
        const verificarVisibilidade = () => {
            const alturaJanela = window.innerHeight || document.documentElement.clientHeight;
            const limiteGatilho = alturaJanela * 0.88;

            elementosAnimados.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < limiteGatilho && rect.bottom > 0) {
                    el.classList.add('visible');
                } else if (rect.top > limiteGatilho) {
                    el.classList.remove('visible');
                }
            });
        };

        window.addEventListener('scroll', verificarVisibilidade, { passive: true });
        verificarVisibilidade();
    }

    // Garante que elementos imediatamente visíveis no carregamento da página apareçam suavemente
    setTimeout(() => {
        const alturaJanela = window.innerHeight || document.documentElement.clientHeight;
        elementosAnimados.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < alturaJanela * 0.85 && rect.bottom > 0) {
                el.classList.add('visible');
            }
        });
    }, 100);
});
