/* ============================================
   E|Q>CE — JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // --- Navigation scroll effect ---
    const nav = document.getElementById('main-nav');
    const hero = document.getElementById('hero');

    const handleNavScroll = () => {
        if (window.scrollY > 60) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();

    // --- Mobile nav toggle ---
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
        });

        // Close menu on link click
        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
            });
        });
    }

    // --- Scroll reveal ---
    const revealElements = document.querySelectorAll(
        '.stat-card, .bureau-card, .pole-card, .about-text, .about-stats, .qubit-explanation, .qubit-interactive-wrapper, .footer-top'
    );

    revealElements.forEach(el => el.classList.add('reveal'));

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // --- Qubit Interactive ---
    const qubitSphere = document.getElementById('qubit-sphere');
    const qubitSuperposition = document.getElementById('qubit-superposition');
    const qubitMeasured = document.getElementById('qubit-measured');
    const measuredKet = document.getElementById('measured-ket');
    const probBar0 = document.getElementById('prob-bar-0');
    const probBar1 = document.getElementById('prob-bar-1');
    const prob0Text = document.getElementById('prob-0');
    const prob1Text = document.getElementById('prob-1');
    const qubitLabel = qubitSphere.querySelector('.qubit-label');

    let isMeasured = false;
    let resetTimeout;
    let fluctuateInterval;

    // Probability for |0⟩ (random between 20% and 80%)
    let prob0 = Math.random() * 0.6 + 0.2;

    function updateProbDisplay(p0) {
        const pct0 = Math.round(p0 * 100);
        const pct1 = 100 - pct0;
        probBar0.style.width = pct0 + '%';
        probBar1.style.width = pct1 + '%';
        prob0Text.textContent = pct0 + '%';
        prob1Text.textContent = pct1 + '%';
    }

    // Initial display
    updateProbDisplay(prob0);

    // Gentle probability fluctuation in superposition
    function startFluctuation() {
        fluctuateInterval = setInterval(() => {
            if (!isMeasured) {
                prob0 += (Math.random() - 0.5) * 0.03;
                prob0 = Math.max(0.15, Math.min(0.85, prob0));
                updateProbDisplay(prob0);
            }
        }, 200);
    }
    startFluctuation();

    function doMeasure() {
        if (isMeasured) return;
        isMeasured = true;

        clearInterval(fluctuateInterval);

        // Flash effect
        qubitSphere.classList.add('measuring');

        // Collapse after brief flash
        setTimeout(() => {
            // On utilise la probabilité exacte affichée à l'écran
            const displayedProb = parseInt(document.getElementById('prob-0').textContent) / 100;
            const result = Math.random() < displayedProb ? 0 : 1;

            qubitSuperposition.classList.add('hidden');
            qubitMeasured.classList.add('visible');
            measuredKet.textContent = `|${result}⟩`;
            qubitLabel.textContent = (typeof currentLang !== 'undefined' && translations && translations[currentLang]) ? translations[currentLang]['qubit_measured'] : 'Mesuré !';

            // Add pulse effect to sphere
            qubitSphere.style.borderColor = 'rgba(255,255,255,0.6)';
            qubitSphere.style.background = 'rgba(255,255,255,0.08)';
            qubitSphere.classList.remove('measuring');
        }, 150);
    }

    function doReset() {
        if (!isMeasured) return;

        isMeasured = false;

        // New random probabilities
        prob0 = Math.random() * 0.6 + 0.2;
        updateProbDisplay(prob0);

        qubitSuperposition.classList.remove('hidden');
        qubitMeasured.classList.remove('visible');
        qubitLabel.textContent = (typeof currentLang !== 'undefined' && translations && translations[currentLang]) ? translations[currentLang]['qubit_label'] : 'Survolez pour mesurer';

        qubitSphere.style.borderColor = '';
        qubitSphere.style.background = '';

        startFluctuation();
    }

    // Measure on hover
    qubitSphere.addEventListener('mouseenter', doMeasure);
    qubitSphere.addEventListener('mouseleave', doReset);

    // Also support click for mobile
    qubitSphere.addEventListener('click', () => {
        if (isMeasured) {
            doReset();
        } else {
            doMeasure();
        }
    });

    // --- Quantum Canvas Background ---
    const canvas = document.getElementById('quantum-canvas');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle system — subtle dots and connections
    const particles = [];
    const PARTICLE_COUNT = window.innerWidth <= 768 ? 30 : 150;
    const CONNECTION_DIST = 150;
    const SPEED_MULTIPLIER = 0.5
    const MIN_RADIUS = 1;
    const MAX_RADIUS = 3;

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * SPEED_MULTIPLIER;
            this.vy = (Math.random() - 0.5) * SPEED_MULTIPLIER;
            this.radius = Math.random() * (MAX_RADIUS - MIN_RADIUS) + MIN_RADIUS;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#000';
            ctx.fill();
        }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONNECTION_DIST) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 0, 0, ${1 - dist / CONNECTION_DIST})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        // Update and draw particles
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        requestAnimationFrame(animateParticles);
    }

    animateParticles();

    // --- Smooth scroll for nav links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // --- Modal Logic for Pôles ---
    const poleCards = document.querySelectorAll('.pole-card');
    const modalOverlay = document.getElementById('pole-modal');
    const modalClose = document.getElementById('modal-close');
    const modalTitle = document.getElementById('modal-title');
    const modalTag = document.getElementById('modal-tag');
    const modalText = document.getElementById('modal-text');

    const poleDetails = {
        'pole-quantum': "Notre pôle de formation quantique propose un cursus complet allant des concepts de base aux algorithmes avancés. Nous couvrons la notation de Dirac, l'intrication, les portes logiques quantiques et la programmation pratique sur des simulateurs. Des séances pratiques régulières sont organisées pour vous permettre de manipuler de vrais qubits en cloud.",
        'pole-maths': "Le pôle mathématiques s'attache à construire les fondations théoriques indispensables à la compréhension de la mécanique quantique. Au programme : espaces de Hilbert, algèbre linéaire avancée, probabilités quantiques et théorie des groupes. Ces sessions sont pensées pour être accessibles tout en conservant la rigueur mathématique nécessaire.",
        'pole-events': "Le pôle événementiel est le cœur battant de l'association. Il organise des conférences avec des experts du domaine, des visites de laboratoires de recherche et notre hackathon quantique annuel. Nous participons également à des événements nationaux pour représenter l'ECE Lyon et tisser des liens avec l'écosystème quantique français.",
        'pole-com': "Le pôle communication vulgarise les concepts complexes pour les rendre accessibles à tous. Il gère nos réseaux sociaux, rédige des articles, crée des infographies et assure le rayonnement de nos événements. C'est le pôle idéal pour ceux qui aiment croiser la science, le design et le journalisme scientifique."
    };

    poleCards.forEach(card => {
        card.addEventListener('click', () => {
            const cardId = card.id;
            const number = card.querySelector('.pole-number').textContent;
            const dict = (typeof currentLang !== 'undefined' && translations && translations[currentLang]) ? translations[currentLang] : null;

            const titleKey = cardId.replace('pole-', 'pole_') + '_title';
            modalTitle.textContent = (dict && dict[titleKey]) ? dict[titleKey] : card.querySelector('.pole-title').textContent;
            modalTag.textContent = number;

            const detailKey = poleDetailKeys ? poleDetailKeys[cardId] : null;
            const detail = (dict && detailKey && dict[detailKey]) ? dict[detailKey] : (poleDetails[cardId] || "Plus d'informations à venir.");
            modalText.innerHTML = `<p>${detail}</p>`;

            modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    const closeModal = () => {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    if (modalClose) modalClose.addEventListener('click', closeModal);

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });


    // --- Language Switcher (i18n) ---
    const translations = {
        en: {
            // Page meta
            page_title: 'E|Q>CE — Mathematics & Quantum Association | ECE Lyon',
            meta_description: 'E|Q>CE is the Mathematics and Quantum association of ECE Lyon. Learn. Experiment. Entangle.',

            // Navigation
            nav_about: 'About',
            nav_experience: 'Experience',
            nav_bureau: 'Board',
            nav_poles: 'Divisions',
            nav_contact: 'Contact',

            // Hero
            hero_subtitle: 'Mathematics & Quantum Association — ECE Lyon',
            slogan_1: 'Learn.',
            slogan_2: 'Experiment.',
            slogan_3: 'Entangle.',

            // About
            about_tag: '01 — About',
            about_title: 'Who we are',
            about_lead: '<strong>E|Q&gt;CE</strong> is the association dedicated to <strong>mathematics</strong> and <strong>quantum computing</strong> at ECE Lyon.',
            about_text: 'Our mission is to make these fascinating disciplines accessible within our school, by offering beginner-friendly courses, hands-on workshops, and stimulating events. Whether you are a curious beginner or an experienced enthusiast, E|Q&gt;CE provides a framework for exploring these fields.',

            // Stats
            stat_1_label: 'Areas of expertise',
            stat_1_detail: 'Mathematics & Quantum',
            stat_2_label: 'Active divisions',
            stat_2_detail: 'Training (Quantum & Mathematics), Events, Communication',
            stat_3_label: 'Board members',
            stat_3_detail: 'President, Vice-President (Quantum & Mathematics), Treasurer, Secretary',

            // Qubit
            qubit_tag: '02 — Quantum experience',
            qubit_title: 'Measure a qubit',
            qubit_text_1: 'In quantum mechanics, a <strong>qubit</strong> can exist in a superposition of states |0⟩ and |1⟩ simultaneously. It is only at the moment of <strong>measurement</strong> that the qubit "chooses" a definite state.',
            qubit_text_2: 'Hover over the qubit to perform a measurement and observe the wave function collapse.',
            qubit_label: 'Hover to measure',
            qubit_measured: 'Measured!',

            // Bureau
            bureau_tag: '03 — Board',
            bureau_title: 'Our team',
            role_president: 'President',
            role_vp_quantum: 'Vice-President Quantum',
            role_vp_maths: 'Vice-President Mathematics',
            role_treasurer: 'Treasurer',
            role_secretary: 'Secretary',

            // Poles
            poles_tag: '04 — Divisions',
            poles_title: 'Our activities',
            pole_quantum_title: 'Quantum Training',
            pole_quantum_desc: 'Get introduced to quantum computing: qubits, logic gates, Grover and Shor algorithms, and programming on quantum simulators.',
            pole_maths_title: 'Mathematics Training',
            pole_maths_desc: 'Explore the mathematical foundations: linear algebra, group theory, topology, and their applications to modern physics.',
            pole_events_title: 'Events',
            pole_events_desc: 'Conferences, quantum hackathons, lab visits, and meetings with researchers and professionals in the field.',
            pole_com_title: 'Communication',
            pole_com_desc: 'Science communication, social media management, content creation, and promoting the association within the school.',
            pole_badge: 'Head TBD',

            // Footer
            footer_nav: 'Navigation',
            footer_tagline: 'Learn. Experiment. Entangle.',
            footer_copyright: '© 2026 E|Q>CE — ECE Lyon. All rights reserved.',

            // Modal pole details
            pole_detail_quantum: 'Our quantum training division offers a comprehensive curriculum ranging from basic concepts to advanced algorithms. We cover Dirac notation, entanglement, quantum logic gates, and hands-on programming on simulators. Regular practical sessions are organized to let you manipulate real cloud-based qubits.',
            pole_detail_maths: 'The mathematics division builds the essential theoretical foundations for understanding quantum mechanics. Topics include: Hilbert spaces, advanced linear algebra, quantum probabilities, and group theory. These sessions are designed to be accessible while maintaining the necessary mathematical rigor.',
            pole_detail_events: 'The events division is the beating heart of the association. It organizes conferences with domain experts, research lab visits, and our annual quantum hackathon. We also participate in national events to represent ECE Lyon and build connections within the French quantum ecosystem.',
            pole_detail_com: 'The communication division simplifies complex concepts to make them accessible to everyone. It manages our social media, writes articles, creates infographics, and ensures the visibility of our events. It\'s the ideal division for those who enjoy blending science, design, and science journalism.',
        },
        fr: {
            // Page meta
            page_title: 'E|Q>CE — Association Mathématiques & Quantique | ECE Lyon',
            meta_description: 'E|Q>CE est l\'association Mathématiques et Quantique de l\'ECE Lyon. Apprendre. Expérimenter. Intriquer.',

            // Navigation
            nav_about: 'À propos',
            nav_experience: 'Expérience',
            nav_bureau: 'Bureau',
            nav_poles: 'Pôles',
            nav_contact: 'Contact',

            // Hero
            hero_subtitle: 'Association Mathématiques & Quantique — ECE Lyon',
            slogan_1: 'Apprendre.',
            slogan_2: 'Expérimenter.',
            slogan_3: 'Intriquer.',

            // About
            about_tag: '01 — À propos',
            about_title: 'Qui sommes-nous',
            about_lead: '<strong>E|Q&gt;CE</strong> est l\'association dédiée aux <strong>mathématiques</strong> et à l\'<strong>informatique quantique</strong> de l\'ECE Lyon.',
            about_text: 'Notre mission est de démocratiser ces disciplines fascinantes au sein de notre école, en proposant des formations accessibles, des ateliers pratiques et des événements stimulants. Que vous soyez curieux débutant ou passionné confirmé, E|Q&gt;CE vous offre un cadre pour explorer ces domaines.',

            // Stats
            stat_1_label: 'Domaines d\'expertise',
            stat_1_detail: 'Mathématiques & Quantique',
            stat_2_label: 'Pôles actifs',
            stat_2_detail: 'Formation (Quantique & Mathématiques), Événements, Communication',
            stat_3_label: 'Membres du bureau',
            stat_3_detail: 'Président, Vice-président (Quantique & Mathématiques), Trésorier, Secrétaire',

            // Qubit
            qubit_tag: '02 — Expérience quantique',
            qubit_title: 'Mesurez un qubit',
            qubit_text_1: 'En mécanique quantique, un <strong>qubit</strong> peut exister dans une superposition des états |0⟩ et |1⟩ simultanément. Ce n\'est qu\'au moment de la <strong>mesure</strong> que le qubit « choisit » un état définitif.',
            qubit_text_2: 'Survolez le qubit ci-contre pour effectuer une mesure et observer l\'effondrement de la fonction d\'onde.',
            qubit_label: 'Survolez pour mesurer',
            qubit_measured: 'Mesuré !',

            // Bureau
            bureau_tag: '03 — Bureau',
            bureau_title: 'Notre équipe',
            role_president: 'Président',
            role_vp_quantum: 'Vice-Président Quantique',
            role_vp_maths: 'Vice-Président Mathématiques',
            role_treasurer: 'Trésorier',
            role_secretary: 'Secrétaire',

            // Poles
            poles_tag: '04 — Pôles',
            poles_title: 'Nos activités',
            pole_quantum_title: 'Formation Quantique',
            pole_quantum_desc: 'Initiez-vous à l\'informatique quantique : qubits, portes logiques, algorithmes de Grover et Shor, et programmation sur simulateurs quantiques.',
            pole_maths_title: 'Formation Mathématiques',
            pole_maths_desc: 'Explorez les fondements mathématiques : algèbre linéaire, théorie des groupes, topologie et leurs applications à la physique moderne.',
            pole_events_title: 'Événements',
            pole_events_desc: 'Conférences, hackathons quantiques, visites de laboratoires et rencontres avec des chercheurs et professionnels du domaine.',
            pole_com_title: 'Communication',
            pole_com_desc: 'Vulgarisation scientifique, gestion des réseaux sociaux, création de contenu et rayonnement de l\'association au sein de l\'école.',
            pole_badge: 'Responsable à venir',

            // Footer
            footer_nav: 'Navigation',
            footer_tagline: 'Apprendre. Expérimenter. Intriquer.',
            footer_copyright: '© 2026 E|Q>CE — ECE Lyon. Tous droits réservés.',

            // Modal pole details
            pole_detail_quantum: "Notre pôle de formation quantique propose un cursus complet allant des concepts de base aux algorithmes avancés. Nous couvrons la notation de Dirac, l'intrication, les portes logiques quantiques et la programmation pratique sur des simulateurs. Des séances pratiques régulières sont organisées pour vous permettre de manipuler de vrais qubits en cloud.",
            pole_detail_maths: "Le pôle mathématiques s'attache à construire les fondations théoriques indispensables à la compréhension de la mécanique quantique. Au programme : espaces de Hilbert, algèbre linéaire avancée, probabilités quantiques et théorie des groupes. Ces sessions sont pensées pour être accessibles tout en conservant la rigueur mathématique nécessaire.",
            pole_detail_events: "Le pôle événementiel est le cœur battant de l'association. Il organise des conférences avec des experts du domaine, des visites de laboratoires de recherche et notre hackathon quantique annuel. Nous participons également à des événements nationaux pour représenter l'ECE Lyon et tisser des liens avec l'écosystème quantique français.",
            pole_detail_com: "Le pôle communication vulgarise les concepts complexes pour les rendre accessibles à tous. Il gère nos réseaux sociaux, rédige des articles, crée des infographies et assure le rayonnement de nos événements. C'est le pôle idéal pour ceux qui aiment croiser la science, le design et le journalisme scientifique.",
        }
    };

    // Map pole IDs to translation keys for modal details
    const poleDetailKeys = {
        'pole-quantum': 'pole_detail_quantum',
        'pole-maths': 'pole_detail_maths',
        'pole-events': 'pole_detail_events',
        'pole-com': 'pole_detail_com',
    };

    let currentLang = 'fr';

    function applyLanguage(lang) {
        currentLang = lang;
        const dict = translations[lang];
        if (!dict) return;

        // Update html lang attribute
        document.documentElement.lang = lang;

        // Update all elements with data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (!dict[key]) return;

            // Check if this element uses an attribute instead of textContent
            const attr = el.getAttribute('data-i18n-attr');
            if (attr) {
                el.setAttribute(attr, dict[key]);
                return;
            }

            // Check if this element uses innerHTML
            const useHtml = el.getAttribute('data-i18n-html');
            if (useHtml === 'true') {
                el.innerHTML = dict[key];
            } else {
                el.textContent = dict[key];
            }
        });

        // Update the qubit label dynamically (for measured/unmeasured states)
        if (!isMeasured) {
            qubitLabel.textContent = dict['qubit_label'];
        } else {
            qubitLabel.textContent = dict['qubit_measured'];
        }

        // Update the main toggle button text
        langToggle.textContent = lang.toUpperCase();
    }

    // Language switcher UI logic
    const langSwitcher = document.getElementById('lang-switcher');
    const langToggle = document.getElementById('lang-toggle');
    const langRibbon = document.getElementById('lang-ribbon');
    const langOptions = document.querySelectorAll('.lang-option');

    langToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        langSwitcher.classList.toggle('open');
    });

    langOptions.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const lang = btn.getAttribute('data-lang');

            // Update active state
            langOptions.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Apply language
            applyLanguage(lang);

            // Close ribbon
            langSwitcher.classList.remove('open');
        });
    });

    // Close ribbon when clicking outside
    document.addEventListener('click', (e) => {
        if (!langSwitcher.contains(e.target)) {
            langSwitcher.classList.remove('open');
        }
    });

    // --- Dynamic Members Count ---
    const membresGrid = document.getElementById("membres-grid");
    const membresTitle = document.getElementById("membres-title");
    if (membresGrid && membresTitle) {
        const count = membresGrid.querySelectorAll(".membre-card").length;
        membresTitle.textContent = `${count} Membres`;
    }

    const membresHonneurGrid = document.getElementById("membres-honneur-grid");
    const membresHonneurTitle = document.getElementById("membres-honneur-title");
    if (membresHonneurGrid && membresHonneurTitle) {
        const count = membresHonneurGrid.querySelectorAll(".membre-card").length;
        membresHonneurTitle.textContent = `${count} Membres d'honneur`;
    }

});
