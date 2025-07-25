window.addEventListener('scroll', function() {
    let header = document.querySelector('h1');
    let scrollPosition = window.pageYOffset;
    header.style.opacity = 1 - scrollPosition / 450; // Adjust the divisor for speed of fade
});

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        }
    });
});

const hiddenElements = document.querySelectorAll('.hidden');
hiddenElements.forEach((el) => {
    observer.observe(el);
});