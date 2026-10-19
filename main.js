// WhatsApp number that receives call requests (country code, no + or spaces)
const WHATSAPP_NUMBER = '94768088170';

document.documentElement.classList.remove('no-js');
document.getElementById('year').textContent = new Date().getFullYear();

// Nav border once the page scrolls
const nav = document.querySelector('.nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Reveal sections as they scroll into view
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
} else {
    revealEls.forEach((el) => el.classList.add('in'));
}

// Hide the floating "Book a call" button while the contact section is on screen
const fab = document.querySelector('.fab');
const contact = document.getElementById('contact');
if ('IntersectionObserver' in window && fab && contact) {
    new IntersectionObserver(([entry]) => {
        fab.classList.toggle('hidden', entry.isIntersecting);
    }, { threshold: 0.15 }).observe(contact);
}

// Call request form: builds a WhatsApp message with the visitor's details
const form = document.getElementById('callForm');
const errorEl = document.getElementById('formError');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = (data.get('name') || '').trim();
    const phone = (data.get('phone') || '').trim();
    const business = (data.get('business') || '').trim();
    const needs = data.getAll('need');
    const time = data.get('time');
    const message = (data.get('message') || '').trim();

    const nameInput = form.elements.name;
    const phoneInput = form.elements.phone;
    nameInput.classList.toggle('invalid', !name);
    phoneInput.classList.toggle('invalid', phone.replace(/\D/g, '').length < 9);

    if (!name || phone.replace(/\D/g, '').length < 9) {
        errorEl.textContent = !name ? 'Please add your name.' : 'Please add a phone number we can call.';
        (!name ? nameInput : phoneInput).focus();
        return;
    }
    errorEl.textContent = '';

    const lines = [
        'Hi Nico Labs! I’d like to book a call.',
        '',
        `Name: ${name}`,
        `Phone: ${phone}`,
    ];
    if (business) lines.push(`Business: ${business}`);
    if (needs.length) lines.push(`Looking for: ${needs.join(', ')}`);
    lines.push(`Best time to call: ${time}`);
    if (message) lines.push('', message);

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank', 'noopener');
});
