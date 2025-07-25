window.addEventListener('scroll', function() {
    let header = document.querySelector('h1');
    let scrollPosition = window.pageYOffset;
    header.style.opacity = 1 - scrollPosition / 450; // Adjust the divisor for speed of fade
});