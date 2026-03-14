// Scroll animations
const sections = document.querySelectorAll('.section');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.15 });

sections.forEach(section => {
    observer.observe(section);
});

function formatNumber(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
}

function startStatsCountUp() {
    const stats = document.querySelectorAll('.stat-value');
    stats.forEach(el => {
        if (el.dataset.counted) return;
        el.dataset.counted = 'true';

        const target = parseFloat(el.getAttribute('data-target'));
        const suffix = el.getAttribute('data-suffix') || '';
        const isFloat = el.getAttribute('data-target').includes('.');
        const duration = 2500;
        const start = performance.now();

        requestAnimationFrame(function animate(timestamp) {
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = easeOutQuart(progress);

            if (isFloat) {
                const value = (target * eased).toFixed(1).replace('.', ',');
                el.textContent = value + suffix;
            } else {
                el.textContent = formatNumber(Math.floor(target * eased)) + suffix;
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                el.textContent = isFloat
                    ? target.toFixed(1).replace('.', ',') + suffix
                    : formatNumber(target) + suffix;
            }
        });
    });
}

// Výška hero sekce podle skutečné viditelné plochy (bez taskbaru)
function setHeroHeight() {
    document.getElementById('hero').style.height = window.innerHeight + 'px';
}

setHeroHeight();
window.addEventListener('resize', setHeroHeight);

// Testimonial slider
function initTestimonialSlider() {
    const track = document.querySelector('.testimonial-track');
    const dotsContainer = document.querySelector('.testimonial-dots');
    if (!track) return;

    const cards = track.querySelectorAll('.testimonial-card');
    const total = cards.length;
    let current = 0;
    let timer;

    function getVisible() {
        if (window.innerWidth >= 992) return 3;
        if (window.innerWidth >= 640) return 2;
        return 1;
    }

    function getCardWidth() {
        const visible = getVisible();
        const gap = 24;
        return (track.parentElement.offsetWidth - gap * (visible - 1)) / visible;
    }

    function setCardWidths() {
        const w = getCardWidth();
        cards.forEach(c => c.style.width = w + 'px');
    }

    function maxIndex() {
        return total - getVisible();
    }

    function buildDots() {
        dotsContainer.innerHTML = '';
        const count = maxIndex() + 1;
        for (let i = 0; i < count; i++) {
            const dot = document.createElement('button');
            dot.className = 'testimonial-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', 'Reference ' + (i + 1));
            dot.addEventListener('click', () => { goTo(i); resetTimer(); });
            dotsContainer.appendChild(dot);
        }
    }

    function updateDots() {
        dotsContainer.querySelectorAll('.testimonial-dot').forEach((d, i) => {
            d.classList.toggle('active', i === current);
        });
    }

    function goTo(index) {
        current = Math.max(0, Math.min(index, maxIndex()));
        const offset = current * (getCardWidth() + 24);
        track.style.transform = `translateX(-${offset}px)`;
        updateDots();
    }

    function next() { goTo(current >= maxIndex() ? 0 : current + 1); }
    function prev() { goTo(current <= 0 ? maxIndex() : current - 1); }

    function resetTimer() {
        clearInterval(timer);
        timer = setInterval(next, 7000);
    }

    document.querySelector('.testimonial-arrow.next').addEventListener('click', () => { next(); resetTimer(); });
    document.querySelector('.testimonial-arrow.prev').addEventListener('click', () => { prev(); resetTimer(); });

    track.parentElement.addEventListener('mouseenter', () => clearInterval(timer));
    track.parentElement.addEventListener('mouseleave', resetTimer);

    window.addEventListener('resize', () => {
        setCardWidths();
        buildDots();
        goTo(Math.min(current, maxIndex()));
    });

    setCardWidths();
    buildDots();
    resetTimer();
}

// Accordion
document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
        const item = header.parentElement;
        const isOpen = item.classList.contains('open');

        document.querySelectorAll('.accordion-item.open').forEach(openItem => {
            openItem.classList.remove('open');
            openItem.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
        });

        if (!isOpen) {
            item.classList.add('open');
            header.setAttribute('aria-expanded', 'true');
        }
    });
});

// Cases slider
function initCasesSlider() {
    const track = document.querySelector('.cases-track');
    if (!track) return;

    const slides = track.querySelectorAll('.case-slide');
    const dots = document.querySelectorAll('.case-dot');
    let current = 0;
    let timer;

    // Změř nejvyšší slide a nastav pevnou výšku tracku
    let maxHeight = 0;
    slides.forEach(slide => {
        slide.style.position = 'absolute';
        slide.style.visibility = 'hidden';
        slide.style.opacity = '1';
        maxHeight = Math.max(maxHeight, slide.offsetHeight);
        slide.style.opacity = '';
        slide.style.visibility = '';
    });
    track.style.height = maxHeight + 'px';

    function goTo(index) {
        slides[current].classList.remove('active');
        slides[current].setAttribute('aria-hidden', 'true');
        dots[current].classList.remove('active');
        dots[current].setAttribute('aria-selected', 'false');

        current = index;

        slides[current].classList.add('active');
        slides[current].setAttribute('aria-hidden', 'false');
        dots[current].classList.add('active');
        dots[current].setAttribute('aria-selected', 'true');
    }

    function startTimer() {
        timer = setInterval(() => goTo((current + 1) % slides.length), 5000);
    }

    function stopTimer() {
        clearInterval(timer);
    }

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            stopTimer();
            goTo(i);
            startTimer();
        });
    });

    track.addEventListener('mouseenter', stopTimer);
    track.addEventListener('mouseleave', startTimer);

    startTimer();
}

// Spustit count-up po načtení stránky (s malým zpožděním pro fade-in)
window.addEventListener('load', () => {
    setHeroHeight();
    initCasesSlider();
    initTestimonialSlider();
    setTimeout(startStatsCountUp, 700);
});

// Smooth scrolling for nav links
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        target.scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Form submission placeholder
document.querySelector('#contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Formulář odeslán (placeholder)');
});