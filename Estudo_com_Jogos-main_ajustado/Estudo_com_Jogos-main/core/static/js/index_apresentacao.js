/**
 * index_apresentacao.js — Animações de Scroll Reveal e interatividade da página inicial
 * ======================================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    const reveals = document.querySelectorAll(".scroll-reveal");

    if (!reveals.length) return;

    // Função de revelação baseada na posição do scroll
    const checkScroll = () => {
        const triggerBottom = window.innerHeight * 0.9;

        reveals.forEach((element) => {
            const boxTop = element.getBoundingClientRect().top;

            if (boxTop < triggerBottom) {
                element.classList.add("visible");
            }
        });
    };

    // Uso de IntersectionObserver moderno e performático
    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        obs.unobserve(entry.target); // Anima uma única vez
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: "0px 0px -40px 0px"
            }
        );

        reveals.forEach((element) => {
            observer.observe(element);
        });
    } else {
        // Fallback para navegadores sem suporte a IntersectionObserver
        window.addEventListener("scroll", checkScroll, { passive: true });
    }

    // Disparo imediato para exibir elementos que já estão no viewport inicial (como o cabeçalho)
    checkScroll();
    setTimeout(checkScroll, 150);
});
