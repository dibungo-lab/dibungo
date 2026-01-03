// DOM Elements
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const currentPage = window.location.pathname.split('/').pop() || 'index.html';

// WhatsApp Business Number - Ganti dengan nomor pemilik les privat
const whatsappNumber = "6281234567890"; // Format: 628xxxxxxxxxx (tanpa +)

// XSS Sanitization Functions - Diperbaiki untuk mengizinkan spasi, koma, titik
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    
    // Remove HTML tags secara aman
    const withoutTags = input.replace(/<[^>]*>?/gm, '');
    
    // Escape karakter khusus HTML tetapi pertahankan spasi, koma, titik
    const escaped = withoutTags
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    
    // Hapus karakter berbahaya tetapi pertahankan spasi, koma, titik, dan karakter normal
    const safe = escaped
        .replace(/javascript:/gi, '')
        .replace(/data:/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/on\w+\s*=/gi, '')  // Hapus event handlers
        .replace(/\\(.?)/g, '')       // Hapus backslashes
        .replace(/`/g, '');           // Hapus backticks
    
    // Batasi panjang untuk keamanan
    return safe.substring(0, 1000);
}

function validateInput(input, type) {
    if (input === null || input === undefined) return false;
    
    const strInput = String(input);
    const sanitized = sanitizeInput(strInput);
    
    // Jika setelah sanitasi kosong (kecuali untuk pesan opsional)
    if (sanitized.trim().length === 0 && type !== 'optional-text') {
        return false;
    }
    
    switch(type) {
        case 'name':
            // Nama: huruf, spasi, titik, koma, tanda hubung, apostrof
            // Minimal 2 karakter, maksimal 100 karakter
            const nameRegex = /^[a-zA-Z\s.,'-]+$/;
            return nameRegex.test(sanitized.trim()) && 
                   sanitized.trim().length >= 2 && 
                   sanitized.trim().length <= 100;
        
        case 'email':
            // Email: format email standar
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            return emailRegex.test(sanitized.trim());
        
        case 'phone':
            // Telepon: hanya angka, 10-13 digit, boleh ada spasi atau tanda hubung
            const digitsOnly = sanitized.replace(/[^0-9]/g, '');
            return digitsOnly.length >= 10 && digitsOnly.length <= 13;
        
        case 'age':
            // Usia: angka 3-6 (untuk TK)
            const ageNum = parseInt(sanitized);
            return !isNaN(ageNum) && ageNum >= 3 && ageNum <= 6;
        
        case 'text':
            // Teks biasa: boleh mengandung spasi, koma, titik, dll
            return sanitized.trim().length >= 1 && sanitized.length <= 500;
        
        case 'optional-text':
            // Teks opsional: boleh kosong atau mengandung teks biasa
            return sanitized.length <= 1000;
        
        case 'selection':
            // Untuk dropdown/select: tidak boleh kosong
            return sanitized.trim().length > 0;
        
        default:
            return true;
    }
}

function validateFormData(formData) {
    const errors = [];
    
    // Validasi Nama Anak
    if (!validateInput(formData.nama_anak, 'name')) {
        errors.push('Nama Anak harus terdiri dari huruf (boleh menggunakan spasi, koma, titik)');
    }
    
    // Validasi Usia Anak
    if (!validateInput(formData.usia, 'age')) {
        errors.push('Usia Anak harus antara 3-6 tahun');
    }
    
    // Validasi Nama Orang Tua
    if (!validateInput(formData.nama_ortu, 'name')) {
        errors.push('Nama Orang Tua harus terdiri dari huruf (boleh menggunakan spasi, koma, titik)');
    }
    
    // Validasi Email
    if (!validateInput(formData.email, 'email')) {
        errors.push('Format email tidak valid');
    }
    
    // Validasi Telepon
    if (!validateInput(formData.telepon, 'phone')) {
        errors.push('Nomor telepon harus 10-13 digit angka');
    }
    
    // Validasi pilihan dropdown/select
    const requiredSelections = [
        { field: 'area', label: 'Area' },
        { field: 'fokus', label: 'Fokus Pembelajaran' },
        { field: 'waktu', label: 'Waktu Belajar' }
    ];
    
    requiredSelections.forEach(item => {
        if (!validateInput(formData[item.field], 'selection')) {
            errors.push(`Silakan pilih ${item.label}`);
        }
    });
    
    // Validasi pesan tambahan (optional)
    if (formData.pesan && !validateInput(formData.pesan, 'optional-text')) {
        errors.push('Pesan tambahan terlalu panjang (maksimal 1000 karakter)');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// Set active navigation link based on current page
function setActiveNavLink() {
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Create floating bubbles
function createBubbles() {
    const bubblesContainer = document.createElement('div');
    bubblesContainer.className = 'bubbles';
    
    for (let i = 0; i < 5; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubblesContainer.appendChild(bubble);
    }
    
    document.body.appendChild(bubblesContainer);
}

// Toggle mobile menu
function toggleMobileMenu() {
    hamburger.classList.toggle('open');
    navMenu.classList.toggle('active');
    
    // Toggle body scroll when menu is open
    if (navMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
}

// Close mobile menu when clicking on a link
function closeMobileMenu() {
    hamburger.classList.remove('open');
    navMenu.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Navbar scroll effect
function handleScroll() {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    // Animate elements on scroll
    animateOnScroll();
}

// Initialize animations on scroll
function animateOnScroll() {
    const animatedElements = document.querySelectorAll('.feature-card, .material-category, .gallery-item');
    
    animatedElements.forEach(el => {
        const elementPosition = el.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.2;
        
        if (elementPosition < screenPosition) {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }
    });
}

// Helper untuk decode entities sebelum ditampilkan di WhatsApp
function decodeHTMLEntities(text) {
    const entities = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#x27;': "'",
        '&#x2F;': '/'
    };
    
    return text.replace(/&amp;|&lt;|&gt;|&quot;|&#x27;|&#x2F;/g, match => entities[match]);
}

// Handle form submission for registration dengan mitigasi XSS
function handleFormSubmission(event) {
    event.preventDefault();
    
    // Get form data
    const form = event.target;
    const formData = new FormData(form);
    const rawData = Object.fromEntries(formData);
    
    // Sanitize semua input
    const sanitizedData = {};
    Object.keys(rawData).forEach(key => {
        sanitizedData[key] = sanitizeInput(String(rawData[key] || '')).trim();
    });
    
    // Validasi data
    const validation = validateFormData(sanitizedData);
    
    if (!validation.isValid) {
        // Tampilkan error dengan format yang lebih baik
        const errorMessage = 'Perbaiki kesalahan berikut:\n\n' + validation.errors.join('\n• ');
        alert(errorMessage);
        
        // Highlight field yang error
        highlightErrorFields(form, validation.errors);
        return;
    }
    
    // Decode HTML entities untuk WhatsApp message (agar tampil normal di WhatsApp)
    const displayData = {};
    Object.keys(sanitizedData).forEach(key => {
        displayData[key] = decodeHTMLEntities(sanitizedData[key]);
    });
    
    // Create WhatsApp message dengan data yang sudah di-decode
    let message = `Halo, saya ingin mendaftarkan anak saya untuk Les Privat TK.\n\n`;
    message += `*Data Pendaftaran:*\n`;
    message += `Nama Anak: ${displayData.nama_anak}\n`;
    message += `Usia Anak: ${displayData.usia} tahun\n`;
    message += `Nama Orang Tua: ${displayData.nama_ortu}\n`;
    message += `Email: ${displayData.email}\n`;
    message += `Telepon: ${displayData.telepon}\n`;
    message += `Area: ${displayData.area}\n`;
    message += `Fokus Pembelajaran: ${displayData.fokus}\n`;
    message += `Waktu Belajar: ${displayData.waktu}\n`;
    
    if (displayData.pesan && displayData.pesan.trim() !== '') {
        message += `Pesan Tambahan: ${displayData.pesan}\n`;
    }
    
    // Tambahkan timestamp
    const now = new Date();
    message += `\n*Waktu Pendaftaran:* ${now.toLocaleString('id-ID')}`;
    
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Validasi nomor WhatsApp sebelum membuat URL
    if (!whatsappNumber.match(/^62[0-9]{9,12}$/)) {
        alert('Error: Nomor WhatsApp tidak valid. Silakan hubungi administrator.');
        return;
    }
    
    // Create WhatsApp URL
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    // Open WhatsApp in a new tab
    const newWindow = window.open(whatsappURL, '_blank');
    
    // Fallback jika popup diblokir
    if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
        alert('Popup diblokir. Silakan izinkan popup untuk website ini atau klik link WhatsApp secara manual.');
    }
    
    // Show success message with animation
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    const originalHTML = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<i class="fas fa-check"></i> Terkirim!';
    submitBtn.style.background = 'linear-gradient(135deg, var(--accent-green), var(--secondary-color))';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        submitBtn.innerHTML = originalHTML;
        submitBtn.style.background = '';
        submitBtn.disabled = false;
    }, 3000);
    
    // Reset form setelah delay
    setTimeout(() => {
        form.reset();
        // Reset error highlights
        resetErrorFields(form);
    }, 1000);
}

// Highlight field yang error
function highlightErrorFields(form, errors) {
    // Reset semua field terlebih dahulu
    resetErrorFields(form);
    
    // Map error ke field yang sesuai
    const fieldMap = {
        'Nama Anak': 'nama_anak',
        'Usia Anak': 'usia',
        'Nama Orang Tua': 'nama_ortu',
        'Email': 'email',
        'Nomor telepon': 'telepon',
        'Area': 'area',
        'Fokus Pembelajaran': 'fokus',
        'Waktu Belajar': 'waktu',
        'Pesan tambahan': 'pesan'
    };
    
    errors.forEach(error => {
        Object.keys(fieldMap).forEach(key => {
            if (error.includes(key)) {
                const fieldName = fieldMap[key];
                const field = form.querySelector(`[name="${fieldName}"]`);
                if (field) {
                    field.style.borderColor = '#ff4757';
                    field.style.boxShadow = '0 0 0 2px rgba(255, 71, 87, 0.1)';
                    
                    // Scroll ke field yang error
                    field.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    });
}

// Reset error highlights
function resetErrorFields(form) {
    const fields = form.querySelectorAll('input, select, textarea');
    fields.forEach(field => {
        field.style.borderColor = '';
        field.style.boxShadow = '';
    });
}

// Initialize event listeners
function initEventListeners() {
    // Hamburger menu toggle
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }
    
    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    // Navbar scroll effect
    window.addEventListener('scroll', handleScroll);
    
    // Form submission
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', handleFormSubmission);
        
        // Real-time input sanitization untuk mencegah XSS
        const textInputs = registrationForm.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="number"], textarea');
        textInputs.forEach(input => {
            // Sanitize on input (hanya untuk keamanan, tanpa mengubah tampilan)
            input.addEventListener('input', function(e) {
                const original = this.value;
                const sanitized = sanitizeInput(original);
                
                // Simpan cursor position
                const cursorPos = this.selectionStart;
                
                if (original !== sanitized) {
                    this.value = sanitized;
                    // Kembalikan cursor position
                    this.setSelectionRange(cursorPos, cursorPos);
                }
            });
            
            // Validasi on blur dengan feedback visual
            input.addEventListener('blur', function() {
                const value = this.value.trim();
                if (value) {
                    let isValid = true;
                    let errorMessage = '';
                    
                    if (this.name === 'nama_anak' || this.name === 'nama_ortu') {
                        isValid = validateInput(value, 'name');
                        if (!isValid) {
                            errorMessage = 'Gunakan hanya huruf, spasi, koma, titik';
                        }
                    } else if (this.name === 'email') {
                        isValid = validateInput(value, 'email');
                        if (!isValid) {
                            errorMessage = 'Format email tidak valid';
                        }
                    } else if (this.name === 'telepon') {
                        isValid = validateInput(value, 'phone');
                        if (!isValid) {
                            errorMessage = '10-13 digit angka';
                        }
                    } else if (this.name === 'usia') {
                        isValid = validateInput(value, 'age');
                        if (!isValid) {
                            errorMessage = 'Usia 3-6 tahun';
                        }
                    } else if (this.name === 'pesan') {
                        isValid = validateInput(value, 'optional-text');
                        if (!isValid) {
                            errorMessage = 'Maksimal 1000 karakter';
                        }
                    }
                    
                    // Tampilkan/hapus tooltip error
                    const existingTooltip = this.parentNode.querySelector('.input-error-tooltip');
                    if (existingTooltip) {
                        existingTooltip.remove();
                    }
                    
                    if (!isValid) {
                        this.style.borderColor = '#ff4757';
                        
                        // Tambahkan tooltip error
                        const tooltip = document.createElement('div');
                        tooltip.className = 'input-error-tooltip';
                        tooltip.textContent = errorMessage;
                        tooltip.style.cssText = `
                            position: absolute;
                            background: #ff4757;
                            color: white;
                            padding: 5px 10px;
                            border-radius: 4px;
                            font-size: 12px;
                            margin-top: 5px;
                            z-index: 1000;
                            max-width: 200px;
                        `;
                        
                        this.parentNode.style.position = 'relative';
                        this.parentNode.appendChild(tooltip);
                    } else {
                        this.style.borderColor = '';
                    }
                }
            });
            
            // Hapus tooltip saat focus
            input.addEventListener('focus', function() {
                const tooltip = this.parentNode.querySelector('.input-error-tooltip');
                if (tooltip) {
                    tooltip.remove();
                }
                this.style.borderColor = '';
            });
        });
        
        // Validasi untuk select elements
        const selectElements = registrationForm.querySelectorAll('select');
        selectElements.forEach(select => {
            select.addEventListener('change', function() {
                if (this.value && this.value.trim() !== '') {
                    this.style.borderColor = '';
                }
            });
        });
    }
    
    // WhatsApp floating button
    const whatsappFloat = document.querySelector('.whatsapp-float');
    if (whatsappFloat) {
        whatsappFloat.addEventListener('click', function() {
            const defaultMessage = encodeURIComponent('Halo, saya tertarik dengan Les Privat TK untuk anak saya. Boleh minta informasinya?');
            const whatsappURL = `https://wa.me/${whatsappNumber}?text=${defaultMessage}`;
            window.open(whatsappURL, '_blank');
        });
    }
    
    // Add hover effects to feature cards
    const featureCards = document.querySelectorAll('.feature-card, .material-category');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) scale(1.03)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Gallery modal functionality
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const imgSrc = this.querySelector('img').src;
            openImageModal(imgSrc);
        });
    });
}

// Open image modal
function openImageModal(imgSrc) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
        cursor: pointer;
    `;
    
    const img = document.createElement('img');
    img.src = imgSrc;
    img.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        border-radius: 10px;
        box-shadow: 0 0 30px rgba(0,0,0,0.5);
    `;
    
    modal.appendChild(img);
    document.body.appendChild(modal);
    
    modal.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create floating bubbles
    createBubbles();
    
    // Set active navigation
    setActiveNavLink();
    
    // Initialize event listeners
    initEventListeners();
    
    // Apply scroll effect on initial load
    handleScroll();
    
    // Add loading animation to page
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    // Set initial styles for animated elements
    const animatedElements = document.querySelectorAll('.feature-card, .material-category, .gallery-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
    
    setTimeout(() => {
        document.body.style.opacity = '1';
        // Trigger initial animation
        animateOnScroll();
    }, 100);
});

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

// Add keyboard shortcut for WhatsApp (Alt + W)
document.addEventListener('keydown', function(e) {
    if (e.altKey && e.key === 'w') {
        const whatsappFloat = document.querySelector('.whatsapp-float');
        if (whatsappFloat) {
            whatsappFloat.click();
        }
    }
});

// Security enhancement: Prevent inline script injection
document.addEventListener('DOMContentLoaded', function() {
    // Monitor untuk perubahan DOM yang mencurigakan
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        // Cek untuk tag script yang diinjeksi
                        if (node.tagName === 'SCRIPT' && !node.src) {
                            node.remove();
                        }
                        
                        // Cek untuk event handlers yang mencurigakan
                        const dangerousAttrs = ['onclick', 'onload', 'onerror', 'onmouseover', 'onkeydown'];
                        dangerousAttrs.forEach(attr => {
                            if (node.hasAttribute && node.hasAttribute(attr)) {
                                node.removeAttribute(attr);
                            }
                        });
                    }
                });
            }
        });
    });
    
    // Mulai observasi
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});