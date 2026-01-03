// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavbar();
    initTheme();
    initScrollAnimations();
    initFAQ();
    initContactForm();
    initCounters();
    setCurrentYear();
    initFormValidation();
});

// Navigation Toggle
function initNavbar() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// Theme Toggle
function initTheme() {
    const themeSwitch = document.getElementById('theme-switch');
    const htmlElement = document.documentElement;
    
    // Check for saved theme or prefer-color-scheme
    const savedTheme = localStorage.getItem('theme') || 
                      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    // Apply saved theme
    htmlElement.setAttribute('data-theme', savedTheme);
    if (themeSwitch) {
        themeSwitch.checked = savedTheme === 'light';
    }
    
    // Toggle theme on switch change
    if (themeSwitch) {
        themeSwitch.addEventListener('change', function() {
            const newTheme = this.checked ? 'light' : 'dark';
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Add transition class for smooth change
            htmlElement.classList.add('theme-transition');
            setTimeout(() => {
                htmlElement.classList.remove('theme-transition');
            }, 300);
        });
    }
    
    // Add CSS for theme transition
    const style = document.createElement('style');
    style.textContent = `
        .theme-transition * {
            transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
        }
    `;
    document.head.appendChild(style);
}

// Scroll Animations
function initScrollAnimations() {
    const animateElements = document.querySelectorAll('.scroll-animate');
    
    // Add scroll-animate class to elements that should animate
    document.querySelectorAll('section').forEach(section => {
        const children = section.children;
        for (let i = 0; i < children.length; i++) {
            if (!children[i].classList.contains('scroll-animate') && 
                !children[i].classList.contains('container')) {
                children[i].classList.add('scroll-animate');
            }
        }
    });
    
    // Check if element is in viewport
    function checkScroll() {
        animateElements.forEach(element => {
            const elementPosition = element.getBoundingClientRect();
            const screenPosition = window.innerHeight / 1.2;
            
            if (elementPosition.top < screenPosition) {
                element.classList.add('visible');
            }
        });
    }
    
    // Initial check
    checkScroll();
    
    // Check on scroll
    window.addEventListener('scroll', checkScroll);
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Hero scroll indicator
    const scrollIndicator = document.querySelector('.hero-scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            const aboutSection = document.querySelector('#about');
            if (aboutSection) {
                window.scrollTo({
                    top: aboutSection.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    }
}

// FAQ Accordion
function initFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const isActive = faqItem.classList.contains('active');
            
            // Close all FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });
}

// Contact Form - WhatsApp Integration
function initContactForm() {
    const contactForm = document.getElementById('whatsapp-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const service = document.getElementById('service').value;
            const message = document.getElementById('message').value;
            
            // Sanitize inputs untuk keamanan XSS
            const sanitizedName = sanitizeInput(name);
            const sanitizedEmail = sanitizeInput(email);
            const sanitizedPhone = sanitizeInput(phone);
            const sanitizedService = sanitizeInput(service);
            
            // Untuk message, kita lakukan sanitasi khusus yang tidak menghapus spasi
            const sanitizedMessage = sanitizeMessage(message);
            
            // Validate inputs
            if (!validateForm(sanitizedName, sanitizedEmail, sanitizedPhone, sanitizedService, sanitizedMessage)) {
                showAlert('error', 'Harap isi semua field dengan benar!');
                return;
            }
            
            // Format WhatsApp message (URL encoded)
            const whatsappMessage = encodeURIComponent(
                `Halo DI Bungo! Saya ${sanitizedName} ingin berkonsultasi mengenai layanan ${sanitizedService}.\n\n` +
                `Detail:\n- Nama: ${sanitizedName}\n- Email: ${sanitizedEmail}\n- WhatsApp: ${sanitizedPhone}\n` +
                `- Layanan: ${sanitizedService}\n- Pesan: ${sanitizedMessage}`
            );
            
            // Redirect to WhatsApp
            const whatsappUrl = `https://wa.me/6283161593659?text=${whatsappMessage}`;
            window.open(whatsappUrl, '_blank');
            
            // Reset form
            contactForm.reset();
            
            // Show success message
            showAlert('success', 'Terima kasih! Anda akan diarahkan ke WhatsApp untuk melanjutkan.');
        });
    }
    
    // Newsletter form
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (!validateEmail(email)) {
                showAlert('error', 'Harap masukkan email yang valid!');
                return;
            }
            
            // Simulate submission
            showAlert('success', 'Terima kasih telah berlangganan newsletter kami!');
            emailInput.value = '';
        });
    }
}

// Animated Counters
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    if (counters.length === 0) return;
    
    // Check if counter is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    // Animate counter
    function animateCounter(counter) {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = 2000; // 2 seconds
        const step = target / (duration / 16); // 60fps
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            counter.textContent = Math.floor(current);
        }, 16);
    }
    
    // Check on scroll
    let animated = false;
    
    function checkCounters() {
        if (animated) return;
        
        counters.forEach(counter => {
            if (isInViewport(counter) && !counter.classList.contains('animated')) {
                animateCounter(counter);
                counter.classList.add('animated');
                
                // Check if all counters are animated
                const allAnimated = Array.from(counters).every(c => c.classList.contains('animated'));
                if (allAnimated) animated = true;
            }
        });
    }
    
    // Initial check
    checkCounters();
    
    // Check on scroll
    window.addEventListener('scroll', checkCounters);
}

// Set current year in footer
function setCurrentYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// =============== SECURITY HELPER FUNCTIONS ===============

// Sanitize input untuk mencegah XSS (untuk input biasa)
function sanitizeInput(input) {
    if (!input) return '';
    return String(input)
        .trim()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .replace(/\\/g, '&#x5C;')
        .replace(/`/g, '&#96;');
}

// Sanitize message khusus - menjaga spasi dan karakter normal
function sanitizeMessage(input) {
    if (!input) return '';
    
    // Biarkan spasi, baris baru, dan karakter normal
    // Hanya escape karakter berbahaya untuk XSS
    return String(input)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .replace(/\\/g, '&#x5C;')
        .replace(/`/g, '&#96;');
}

// Escape HTML untuk output yang aman
function escapeHTML(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Validasi email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validasi form lengkap
function validateForm(name, email, phone, service, message) {
    if (!name || name.length < 2) return false;
    if (!validateEmail(email)) return false;
    if (!phone || phone.length < 10 || !/^[0-9+\-\s()]+$/.test(phone)) return false;
    if (!service) return false;
    if (!message || message.trim().length < 10) return false;
    return true;
}

// Tampilkan alert dengan aman
function showAlert(type, message) {
    // Remove existing alerts
    const existingAlert = document.querySelector('.custom-alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Escape message untuk keamanan
    const safeMessage = escapeHTML(message);
    
    const alert = document.createElement('div');
    alert.className = `custom-alert alert-${type}`;
    alert.innerHTML = `
        <div class="alert-content">
            <span class="alert-message">${safeMessage}</span>
            <button class="alert-close">&times;</button>
        </div>
    `;
    
    document.body.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
    
    // Close button
    alert.querySelector('.alert-close').addEventListener('click', () => {
        alert.remove();
    });
    
    // Add CSS for alerts jika belum ada
    if (!document.querySelector('#alert-styles')) {
        const style = document.createElement('style');
        style.id = 'alert-styles';
        style.textContent = `
            .custom-alert {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                min-width: 300px;
                max-width: 500px;
                animation: slideInRight 0.3s ease;
            }
            
            .alert-content {
                padding: 15px 20px;
                border-radius: var(--border-radius);
                display: flex;
                justify-content: space-between;
                align-items: center;
                box-shadow: var(--box-shadow);
                font-family: 'JetBrains Mono', monospace;
            }
            
            .alert-success .alert-content {
                background: #00ff88;
                color: #000;
                border-left: 4px solid #00cc6a;
            }
            
            .alert-error .alert-content {
                background: #ff4444;
                color: #fff;
                border-left: 4px solid #cc0000;
            }
            
            .alert-close {
                background: none;
                border: none;
                color: inherit;
                font-size: 1.5rem;
                cursor: pointer;
                margin-left: 15px;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: var(--transition);
            }
            
            .alert-close:hover {
                background: rgba(0, 0, 0, 0.1);
            }
            
            .alert-error .alert-close:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @media (max-width: 768px) {
                .custom-alert {
                    left: 20px;
                    right: 20px;
                    min-width: auto;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Validasi input real-time untuk form
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Validasi real-time untuk email
            if (input.type === 'email') {
                input.addEventListener('blur', function() {
                    const email = this.value.trim();
                    if (email && !validateEmail(email)) {
                        this.style.borderColor = '#ff4444';
                        showAlert('error', 'Format email tidak valid');
                    } else {
                        this.style.borderColor = '';
                    }
                });
            }
            
            // Validasi real-time untuk telepon
            if (input.type === 'tel' || input.id === 'phone') {
                input.addEventListener('input', function() {
                    // Allow only numbers, plus, minus, parentheses and spaces
                    this.value = this.value.replace(/[^0-9+\-\s()]/g, '');
                });
                
                input.addEventListener('blur', function() {
                    const phone = this.value.trim();
                    if (phone && (phone.length < 10 || !/^[0-9+\-\s()]+$/.test(phone))) {
                        this.style.borderColor = '#ff4444';
                        showAlert('error', 'Format nomor telepon tidak valid');
                    } else {
                        this.style.borderColor = '';
                    }
                });
            }
            
            // Handle nama input
            if (input.id === 'name') {
                input.addEventListener('blur', function() {
                    const name = this.value.trim();
                    if (name && name.length < 2) {
                        this.style.borderColor = '#ff4444';
                        showAlert('error', 'Nama minimal 2 karakter');
                    } else {
                        this.style.borderColor = '';
                    }
                });
            }
            
            // Handle message textarea secara khusus - TIDAK menghapus spasi
            if (input.id === 'message') {
                // Biarkan user mengetik apa saja termasuk spasi
                input.addEventListener('input', function() {
                    // Hapus hanya karakter yang benar-benar berbahaya
                    const value = this.value;
                    const cleanedValue = value
                        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                        .replace(/javascript:/gi, '')
                        .replace(/onclick|onload|onerror|onmouseover|onmouseout|onkeydown|onkeypress|onkeyup/gi, '');
                    
                    if (value !== cleanedValue) {
                        const start = this.selectionStart;
                        const end = this.selectionEnd;
                        this.value = cleanedValue;
                        this.setSelectionRange(start, end);
                    }
                });
                
                input.addEventListener('blur', function() {
                    const message = this.value.trim();
                    if (message && message.length < 10) {
                        this.style.borderColor = '#ff4444';
                        showAlert('error', 'Pesan minimal 10 karakter');
                    } else {
                        this.style.borderColor = '';
                    }
                });
            }
            
            // Untuk input lainnya, sanitasi normal
            if (input.id !== 'message' && input.type !== 'email' && input.type !== 'tel' && input.id !== 'name') {
                input.addEventListener('blur', function() {
                    const value = this.value.trim();
                    if (value && value.length === 0) {
                        this.style.borderColor = '#ff4444';
                    } else {
                        this.style.borderColor = '';
                    }
                });
            }
        });
        
        // Handle select dropdown
        const serviceSelect = form.querySelector('#service');
        if (serviceSelect) {
            serviceSelect.addEventListener('change', function() {
                if (this.value) {
                    this.style.borderColor = '';
                } else {
                    this.style.borderColor = '#ff4444';
                }
            });
            
            serviceSelect.addEventListener('blur', function() {
                if (!this.value) {
                    this.style.borderColor = '#ff4444';
                    showAlert('error', 'Silakan pilih layanan');
                }
            });
        }
    });
}
