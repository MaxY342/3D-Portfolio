const contactForm = document.getElementById('contact-form');
contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    let response;
    try {
        response = await fetch('http://localhost:3000/contact', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error("Error submitting form:", error);
        response = { text: async () => "Error submitting form." };
    }
    const result = await response.text();
    document.getElementById('response-message-container').style.display = 'flex';
    document.getElementById('response-message').textContent = result;
});

const closeButton = document.getElementById('close-button');
closeButton.addEventListener('click', () => {
    document.getElementById('response-message-container').style.display = 'none';
    contactForm.reset();
});