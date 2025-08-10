const contactForm = document.getElementById('contact-form');
contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    const response = await fetch('http://localhost:3000/contact', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const result = await response.text();
    document.getElementById('response-message-container').hidden = false;
    document.getElementById('response-message').textContent = result;
});

const closeButton = document.getElementById('close-button');
closeButton.addEventListener('click', () => {
    document.getElementById('response-message-container').hidden = true;
    contactForm.reset();
});