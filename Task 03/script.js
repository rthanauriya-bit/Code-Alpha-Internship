const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if(menuToggle) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

const darkToggle = document.getElementById('darkModeToggle');
darkToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const icon = darkToggle.querySelector('i');
    if(document.body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
});

let words = ['developer', 'designer', 'problem solver', 'coffee drinker', 'coder'];
let wordIndex = 0;
let letterIndex = 0;
let isTypingForward = true;
let typingTimeout;

function typeEffect() {
    let currentWord = words[wordIndex];
    let typedTextElement = document.querySelector('.typed-text');
    
    if(!typedTextElement) {
        let heroText = document.querySelector('.hero-content .tagline');
        if(heroText) {
            let newSpan = document.createElement('span');
            newSpan.className = 'typed-text';
            newSpan.style.color = '#3b82f6';
            newSpan.style.fontWeight = '600';
            heroText.parentNode.insertBefore(newSpan, heroText.nextSibling);
            heroText.style.marginBottom = '5px';
            typedTextElement = newSpan;
        }
    }
    
    if(typedTextElement) {
        if(isTypingForward) {
            typedTextElement.textContent = currentWord.substring(0, letterIndex + 1);
            letterIndex++;
            
            if(letterIndex === currentWord.length) {
                isTypingForward = false;
                typingTimeout = setTimeout(typeEffect, 2000);
                return;
            }
        } else {
            typedTextElement.textContent = currentWord.substring(0, letterIndex - 1);
            letterIndex--;
            
            if(letterIndex === 0) {
                isTypingForward = true;
                wordIndex = (wordIndex + 1) % words.length;
                typingTimeout = setTimeout(typeEffect, 500);
                return;
            }
        }
        
        let speed = isTypingForward ? 100 : 50;
        typingTimeout = setTimeout(typeEffect, speed);
    }
}

setTimeout(() => {
    let tagline = document.querySelector('.hero-content .tagline');
    if(tagline && !document.querySelector('.typed-text')) {
        tagline.innerHTML = 'Aspiring Software Developer | ';
        let span = document.createElement('span');
        span.className = 'typed-text';
        span.style.color = '#3b82f6';
        span.style.fontWeight = '600';
        tagline.appendChild(span);
    }
    typeEffect();
}, 500);

let contactForm = document.getElementById('contactForm');
let formStatus = document.getElementById('formStatus');

function validateEmail(email) {
    let atSymbol = email.indexOf('@');
    let dotSymbol = email.lastIndexOf('.');
    return atSymbol > 0 && dotSymbol > atSymbol + 1 && dotSymbol < email.length - 1;
}

function showMessage(msg, type) {
    if(formStatus) {
        formStatus.innerHTML = msg;
        formStatus.className = 'form-status ' + type;
        setTimeout(() => {
            if(formStatus) {
                formStatus.innerHTML = '';
                formStatus.className = 'form-status';
            }
        }, 5000);
    }
}

if(contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        let name = document.getElementById('name').value.trim();
        let email = document.getElementById('email').value.trim();
        let message = document.getElementById('message').value.trim();
        
        if(name === '') {
            showMessage('✗ Please tell me your name', 'error');
            return;
        }
        
        if(email === '') {
            showMessage('✗ Email address is required', 'error');
            return;
        }
        
        if(!validateEmail(email)) {
            showMessage('✗ Hmm, that email doesn\'t look right', 'error');
            return;
        }
        
        if(message === '') {
            showMessage('✗ Don\'t forget to write your message', 'error');
            return;
        }
        
        showMessage('Sending your message...', 'loading');
        
        let myData = {
            name: name,
            email: email,
            message: message,
            _subject: `New message from ${name}`,
            _replyto: email
        };
        
        try {
            let response = await fetch('https://formspree.io/f/xgvazkqr', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(myData)
            });
            
            let result = await response.json();
            
            if(response.ok) {
                showMessage('✓ Woohoo! Message sent. I\'ll reply soon!', 'success');
                contactForm.reset();
            } else {
                if(result.error && result.error.includes('confirm')) {
                    showMessage('⚠️ One sec! Check your email to confirm the form', 'error');
                } else {
                    showMessage('✗ Something went wrong. Mind trying again?', 'error');
                }
            }
        } catch(err) {
            console.log('oops', err);
            showMessage('✗ Network issue. Please check your connection', 'error');
        }
    });
}

let scrollTopBtn = document.getElementById('scrollTop');
window.addEventListener('scroll', function() {
    if(window.scrollY > 300) {
        scrollTopBtn.classList.add('show');
    } else {
        scrollTopBtn.classList.remove('show');
    }
});

let allSkillBars = document.querySelectorAll('.skill-percent');
let barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting) {
            let targetWidth = entry.target.style.width;
            entry.target.style.width = '0%';
            setTimeout(() => {
                entry.target.style.width = targetWidth;
            }, 150);
            barObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

allSkillBars.forEach(bar => barObserver.observe(bar));

let allCards = document.querySelectorAll('.project-card, .edu-card, .skill-item');
let cardWatcher = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0px)';
        }
    });
}, { threshold: 0.1 });

allCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    cardWatcher.observe(card);
});

let yearSpan = document.querySelector('.footer .container p');
if(yearSpan) {
    let currentYear = new Date().getFullYear();
    yearSpan.innerHTML = yearSpan.innerHTML.replace('2024', currentYear);
}

console.log('hey there! thanks for checking out my portfolio 👋');