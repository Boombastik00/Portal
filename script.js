document.addEventListener('DOMContentLoaded', () => {

    const header = document.getElementById('header');

    const handleHeaderScroll = () => {
        if (window.scrollY > 60) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    handleHeaderScroll();

    const burger = document.getElementById('burger');
    const nav    = document.getElementById('nav');

    burger.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('open');
        burger.classList.toggle('open');
        burger.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    nav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('open');
            burger.classList.remove('open');
            burger.setAttribute('aria-label', 'Открыть меню');
            document.body.style.overflow = '';
        });
    });

    document.addEventListener('click', (e) => {
        if (nav.classList.contains('open') &&
            !nav.contains(e.target) &&
            !burger.contains(e.target)) {
            nav.classList.remove('open');
            burger.classList.remove('open');
            document.body.style.overflow = '';
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href   = anchor.getAttribute('href');
            const target = document.querySelector(href);
            if (!target || href === '#') return;
            e.preventDefault();

            const headerH = parseInt(
                getComputedStyle(document.documentElement).getPropertyValue('--header-h') || '70',
                10
            );

            window.scrollTo({
                top: target.offsetTop - headerH,
                behavior: 'smooth'
            });
        });
    });

    const directionItems = document.querySelectorAll('.direction-item');

    directionItems.forEach(item => {
        const toggle = item.querySelector('.direction-toggle');

        toggle.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            directionItems.forEach(other => {
                if (other !== item && other.classList.contains('active')) {
                    other.classList.remove('active');
                    other.querySelector('.direction-toggle').setAttribute('aria-expanded', 'false');
                    other.querySelector('.direction-details').setAttribute('aria-hidden', 'true');
                    pauseStyleVideo(other);
                }
            });

            const nowActive = !isActive;
            item.classList.toggle('active', nowActive);
            toggle.setAttribute('aria-expanded', String(nowActive));
            item.querySelector('.direction-details').setAttribute('aria-hidden', String(!nowActive));

            if (!nowActive) pauseStyleVideo(item);
        });
    });

    function pauseStyleVideo(directionItem) {
        const video   = directionItem.querySelector('.style-video');
        const playBtn = directionItem.querySelector('.play-btn');
        if (video) { video.pause(); video.currentTime = 0; }
        if (playBtn) playBtn.classList.remove('playing');
    }

    document.querySelectorAll('.media-video-wrap').forEach(wrap => {
        const video   = wrap.querySelector('.style-video');
        const playBtn = wrap.querySelector('.play-btn');
        if (!video || !playBtn) return;

        playBtn.addEventListener('click', () => {
            video.play().catch(() => {});
            playBtn.classList.add('playing');
        });

        video.addEventListener('click', () => {
            video.pause();
            playBtn.classList.remove('playing');
        });

        video.addEventListener('ended', () => {
            playBtn.classList.remove('playing');
        });
    });

    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels  = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = 'tab-' + btn.dataset.tab;

            tabButtons.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const panel = document.getElementById(targetId);
            if (panel) panel.classList.add('active');
        });
    });

    document.querySelectorAll('.slider-arrow').forEach(arrow => {
        arrow.addEventListener('click', () => {
            const slider = document.getElementById(arrow.dataset.target);
            if (!slider) return;

            const card = slider.querySelector('.event-card');
            if (!card) return;

            const step = card.offsetWidth + 24;

            slider.scrollBy({
                left: arrow.classList.contains('slider-next') ? step : -step,
                behavior: 'smooth'
            });
        });
    });

    const revealSelectors = [
        '.section-header',
        '.direction-item',
        '.event-card',
        '.rental-card',
        '.contacts-info',
        '.contacts-map',
        '.rental-cta',
    ].join(', ');

    if ('IntersectionObserver' in window) {
        const revealEls = document.querySelectorAll(revealSelectors);
        revealEls.forEach(el => el.classList.add('reveal'));

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach(el => observer.observe(el));
    }

    const floatingBtn = document.getElementById('floatingBtn');

    if (floatingBtn) {
        floatingBtn.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

        const toggleFloating = () => {
            const halfScreen = window.innerHeight * 0.5;
            if (window.scrollY < halfScreen) {
                floatingBtn.style.opacity = '0';
                floatingBtn.style.pointerEvents = 'none';
                floatingBtn.style.transform = 'scale(0.8)';
            } else {
                floatingBtn.style.opacity = '1';
                floatingBtn.style.pointerEvents = '';
                floatingBtn.style.transform = '';
            }
        };

        window.addEventListener('scroll', toggleFloating, { passive: true });
        toggleFloating();
    }

}); 