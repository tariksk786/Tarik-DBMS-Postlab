/**
 * Scroll Reveal Animations
 */
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // Stop observing once revealed
            // revealObserver.unobserve(entry.target); 
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

window.addEventListener('DOMContentLoaded', () => {
    const revealedElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    revealedElements.forEach(el => revealObserver.observe(el));
});
