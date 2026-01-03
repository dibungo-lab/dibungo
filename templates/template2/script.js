// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// XSS Sanitization Functions untuk form WhatsApp - DIUBAH untuk mengizinkan spasi, koma, titik
function sanitizeInput(input) {
    if (input === null || input === undefined) return '';
    
    const strInput = String(input);
    
    // Remove HTML tags dan script tags
    const withoutTags = strInput
        .replace(/<[^>]*>?/gm, '') // Remove HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/data:/gi, '') // Remove data: protocol
        .replace(/vbscript:/gi, '') // Remove vbscript: protocol
        .replace(/on\w+\s*=/gi, '') // Remove event handlers seperti onclick=
        .replace(/expression\s*\(/gi, '') // Remove CSS expressions
        .replace(/url\s*\(/gi, ''); // Remove url() functions
    
    // Escape karakter khusus HTML TAPI biarkan teks biasa tetap terbaca
    // Ini penting: kita escape untuk keamanan, tapi nanti decode untuk WhatsApp
    const escaped = withoutTags
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
    
    // Hapus backslashes dan backticks yang berbahaya
    const safe = escaped
        .replace(/\\/g, '')
        .replace(/`/g, '');
    
    // Trim dan batasi panjang untuk keamanan
    return safe.trim();
}

function validateInput(input, type) {
    if (input === null || input === undefined) return false;
    
    const strInput = String(input);
    
    // Sanitize input terlebih dahulu
    const sanitized = sanitizeInput(strInput);
    
    // Jika setelah sanitasi kosong (kecuali untuk pesan opsional)
    if (sanitized.length === 0 && type !== 'optional-message') {
        return false;
    }
    
    switch(type) {
        case 'name':
            // Nama: mengizinkan huruf, angka, spasi, titik, koma, tanda hubung, apostrof, tanda seru, tanda tanya
            // Juga mengizinkan karakter internasional seperti é, ü, ñ, dll.
            // Minimal 2 karakter, maksimal 100 karakter
            const nameRegex = /^[\p{L}\p{M}\s.,'\-!?0-9]+$/u;
            return nameRegex.test(sanitized) && 
                   sanitized.length >= 2 && 
                   sanitized.length <= 100;
        
        case 'phone':
            // Telepon: validasi format nomor telepon internasional
            // Mengizinkan spasi, tanda hubung, tanda plus, tanda kurung
            const phoneRegex = /^[\+\s\-\(\)0-9]{10,20}$/;
            return phoneRegex.test(sanitized);
        
        case 'subject':
            // Subjek: teks biasa dengan karakter yang lebih luas
            // Mengizinkan huruf, angka, spasi, dan sebagian besar tanda baca
            // Minimal 3 karakter, maksimal 200 karakter
            const subjectRegex = /^[\p{L}\p{M}\p{N}\s.,'\-!?"():;]+$/u;
            return subjectRegex.test(sanitized) && 
                   sanitized.length >= 3 && 
                   sanitized.length <= 200;
        
        case 'message':
            // Pesan: teks lebih panjang, boleh mengandung berbagai karakter
            // Mengizinkan hampir semua karakter kecuali yang berbahaya
            // Minimal 10 karakter, maksimal 2000 karakter
            const messageRegex = /^[\p{L}\p{M}\p{N}\s.,'\-!?"():;\n\r]+$/u;
            return messageRegex.test(sanitized) && 
                   sanitized.length >= 10 && 
                   sanitized.length <= 2000;
        
        case 'optional-message':
            // Pesan opsional: boleh kosong, jika ada minimal 1 karakter
            if (sanitized.length === 0) return true;
            const optionalRegex = /^[\p{L}\p{M}\p{N}\s.,'\-!?"():;\n\r]+$/u;
            return optionalRegex.test(sanitized) && sanitized.length <= 2000;
        
        default:
            return true;
    }
}

function validateFormData(name, phone, subject, message) {
    const errors = [];
    
    if (!validateInput(name, 'name')) {
        errors.push('Nama harus terdiri dari 2-100 karakter (boleh menggunakan huruf, angka, spasi, titik, koma, tanda hubung)');
    }
    
    if (!validateInput(phone, 'phone')) {
        errors.push('Nomor telepon harus 10-20 karakter (boleh menggunakan angka, spasi, tanda +, -, (, ))');
    }
    
    if (!validateInput(subject, 'subject')) {
        errors.push('Subjek harus 3-200 karakter (boleh menggunakan huruf, angka, spasi, dan tanda baca umum)');
    }
    
    if (!validateInput(message, 'message')) {
        errors.push('Pesan harus 10-2000 karakter (boleh menggunakan teks panjang dengan paragraf)');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// Fungsi untuk decode HTML entities - agar tampil normal di WhatsApp
function decodeHTMLEntities(text) {
    if (!text) return '';
    
    const entities = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#x27;': "'",
        '&#x2F;': '/',
        '&#96;': '`',
        '&nbsp;': ' ',
        '&copy;': '©',
        '&reg;': '®'
    };
    
    return text.replace(/&[a-z0-9#]+;/gi, match => {
        return entities[match] || match;
    });
}

// Scroll Animation
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animated');
        }
    });
}, observerOptions);

// Observe all elements with animate-on-scroll class
document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));

// WhatsApp Form Handler dengan mitigasi XSS
document.addEventListener('DOMContentLoaded', function() {
    const whatsappBtn = document.getElementById('whatsappBtn');
    
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('waName').value || '';
            const phone = document.getElementById('waPhone').value || '';
            const subject = document.getElementById('waSubject').value || '';
            const message = document.getElementById('waMessage').value || '';
            
            // Sanitize input terlebih dahulu
            const sanitizedName = sanitizeInput(name);
            const sanitizedPhone = sanitizeInput(phone);
            const sanitizedSubject = sanitizeInput(subject);
            const sanitizedMessage = sanitizeInput(message);
            
            console.log('Sanitized inputs:', {
                name: sanitizedName,
                phone: sanitizedPhone,
                subject: sanitizedSubject,
                message: sanitizedMessage
            });
            
            // Validation
            const validation = validateFormData(sanitizedName, sanitizedPhone, sanitizedSubject, sanitizedMessage);
            
            if (!validation.isValid) {
                showAlert('Harap perbaiki kesalahan berikut:\n\n' + validation.errors.join('\n• '), 'error');
                highlightFormErrors(validation.errors);
                return;
            }
            
            // Format phone number
            let formattedPhone = sanitizedPhone.replace(/\D/g, '');
            
            // Validasi format nomor lebih spesifik
            const phoneRegexStrict = /^(?:\+?62|0)[0-9]{9,13}$/;
            
            // Coba beberapa format
            if (formattedPhone.startsWith('0')) {
                formattedPhone = '62' + formattedPhone.substring(1);
            } else if (formattedPhone.startsWith('+62')) {
                formattedPhone = formattedPhone.substring(1);
            } else if (!formattedPhone.startsWith('62')) {
                formattedPhone = '62' + formattedPhone;
            }
            
            // Final validation
            if (!phoneRegexStrict.test(formattedPhone)) {
                showAlert('Format nomor WhatsApp tidak valid! Contoh format yang benar:\n081234567890\n+6281234567890\n6281234567890', 'error');
                return;
            }
            
            // Decode HTML entities untuk pesan WhatsApp (agar tampil normal)
            const displayName = decodeHTMLEntities(sanitizedName);
            const displaySubject = decodeHTMLEntities(sanitizedSubject);
            const displayMessage = decodeHTMLEntities(sanitizedMessage);
            
            // Create WhatsApp message
            const whatsappMessage = `Halo UMKM Jajanan,\n\nSaya ${displayName} ingin menghubungi Anda.\n\n**Subjek:** ${displaySubject}\n**Pesan:**\n${displayMessage}\n\nSilakan hubungi saya kembali di nomor ini: ${sanitizedPhone}\n\nTerima kasih.`;
            
            console.log('WhatsApp message:', whatsappMessage);
            
            // Encode message for URL
            const encodedMessage = encodeURIComponent(whatsappMessage);
            
            // Create WhatsApp URL
            const whatsappURL = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
            
            // Validasi URL untuk mencegah XSS
            if (!whatsappURL.startsWith('https://wa.me/')) {
                showAlert('Error: URL WhatsApp tidak valid.', 'error');
                return;
            }
            
            // Show success message
            showAlert('Membuka WhatsApp... Silakan tunggu sebentar.', 'success');
            
            // Disable button sementara
            const originalText = whatsappBtn.innerHTML;
            whatsappBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Membuka...';
            whatsappBtn.disabled = true;
            
            // Open WhatsApp in new tab after a short delay
            setTimeout(() => {
                const newWindow = window.open(whatsappURL, '_blank', 'noopener,noreferrer');
                
                // Reset button
                setTimeout(() => {
                    whatsappBtn.innerHTML = originalText;
                    whatsappBtn.disabled = false;
                }, 2000);
                
                // Security: Jika popup diblokir, berikan alternatif
                if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
                    showAlert('Popup diblokir. Anda dapat menyalin link berikut:\nhttps://wa.me/' + formattedPhone, 'error');
                    
                    // Alternatif: tampilkan QR code atau link manual
                    const manualLink = document.createElement('div');
                    manualLink.innerHTML = `
                        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.3); z-index: 9999;">
                            <h3>Popup WhatsApp diblokir</h3>
                            <p>Klik link berikut secara manual:</p>
                            <a href="${whatsappURL}" target="_blank" style="color: #25D366; word-break: break-all;">${whatsappURL.substring(0, 50)}...</a>
                            <br><br>
                            <button onclick="this.parentElement.remove()" style="padding: 10px 20px; background: #ff4081; color: white; border: none; border-radius: 5px; cursor: pointer;">Tutup</button>
                        </div>
                    `;
                    document.body.appendChild(manualLink);
                } else {
                    // Clear form setelah sukses dengan delay
                    setTimeout(() => {
                        const form = document.getElementById('whatsappForm');
                        if (form) {
                            form.reset();
                            resetFormHighlights();
                        }
                    }, 1000);
                }
            }, 1500);
        });
    }
    
    // Function untuk highlight form errors
    function highlightFormErrors(errors) {
        // Reset semua highlight terlebih dahulu
        resetFormHighlights();
        
        const errorMap = {
            'Nama': 'waName',
            'Nomor telepon': 'waPhone',
            'Subjek': 'waSubject',
            'Pesan': 'waMessage'
        };
        
        errors.forEach(error => {
            Object.keys(errorMap).forEach(key => {
                if (error.includes(key)) {
                    const fieldId = errorMap[key];
                    const field = document.getElementById(fieldId);
                    if (field) {
                        field.style.borderColor = '#ff4081';
                        field.style.boxShadow = '0 0 0 2px rgba(255, 64, 129, 0.2)';
                        field.style.transition = 'border-color 0.3s, box-shadow 0.3s';
                        
                        // Tambahkan tooltip error
                        const tooltip = document.createElement('div');
                        tooltip.className = 'field-error-tooltip';
                        tooltip.textContent = error;
                        tooltip.style.cssText = `
                            position: absolute;
                            background: #ff4081;
                            color: white;
                            padding: 8px 12px;
                            border-radius: 6px;
                            font-size: 13px;
                            margin-top: 5px;
                            z-index: 1000;
                            max-width: 300px;
                            white-space: pre-wrap;
                            box-shadow: 0 4px 12px rgba(255, 64, 129, 0.3);
                            animation: fadeIn 0.3s ease;
                        `;
                        
                        field.parentNode.style.position = 'relative';
                        const existingTooltip = field.parentNode.querySelector('.field-error-tooltip');
                        if (!existingTooltip) {
                            field.parentNode.appendChild(tooltip);
                        }
                        
                        // Scroll ke field yang error dengan smooth
                        field.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center' 
                        });
                    }
                }
            });
        });
    }
    
    // Function untuk reset form highlights
    function resetFormHighlights() {
        const fields = ['waName', 'waPhone', 'waSubject', 'waMessage'];
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.style.borderColor = '';
                field.style.boxShadow = '';
                
                // Hapus tooltip error
                const tooltip = field.parentNode.querySelector('.field-error-tooltip');
                if (tooltip) {
                    tooltip.remove();
                }
            }
        });
    }
    
    // Function to show alert/notification
    function showAlert(message, type) {
        // Remove any existing alert
        const existingAlert = document.querySelector('.whatsapp-alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        // Create alert element dengan sanitasi pesan
        const alertDiv = document.createElement('div');
        alertDiv.className = 'whatsapp-alert';
        
        // Sanitasi pesan alert untuk mencegah XSS
        const safeMessage = sanitizeInput(message);
        
        // Set alert content based on type
        if (type === 'success') {
            alertDiv.style.backgroundColor = '#25d366';
            alertDiv.innerHTML = `<i class="fas fa-check-circle"></i> <span>${safeMessage}</span>`;
        } else {
            alertDiv.style.backgroundColor = '#ff4081';
            alertDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> <span>${safeMessage}</span>`;
        }
        
        // Tambahkan styling untuk alert
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            max-width: 400px;
            word-wrap: break-word;
            white-space: pre-wrap;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        
        // Add to body
        document.body.appendChild(alertDiv);
        
        // Remove alert after animation completes
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (alertDiv.parentNode) {
                        alertDiv.remove();
                    }
                }, 300);
            }
        }, 3000);
    }
    
    // Real-time input validation dengan regex yang lebih longgar
    const formInputs = ['waName', 'waPhone', 'waSubject', 'waMessage'];
    formInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            // Sanitize input real-time (ringan, tidak mengganggu user)
            input.addEventListener('input', function(e) {
                const original = this.value;
                
                // Hanya lakukan sanitasi dasar untuk karakter yang sangat berbahaya
                const dangerousPatterns = /<[^>]*>|javascript:|data:|on\w+=/gi;
                if (dangerousPatterns.test(original)) {
                    this.value = original.replace(dangerousPatterns, '');
                }
                
                // Hapus highlight error saat user mulai mengetik
                this.style.borderColor = '';
                this.style.boxShadow = '';
                
                // Hapus tooltip error
                const tooltip = this.parentNode.querySelector('.field-error-tooltip');
                if (tooltip) {
                    tooltip.remove();
                }
            });
            
            // Validasi saat kehilangan fokus
            input.addEventListener('blur', function() {
                const value = this.value.trim();
                if (value) {
                    let isValid = false;
                    
                    if (this.id === 'waName') {
                        isValid = validateInput(value, 'name');
                    } else if (this.id === 'waPhone') {
                        isValid = validateInput(value, 'phone');
                    } else if (this.id === 'waSubject') {
                        isValid = validateInput(value, 'subject');
                    } else if (this.id === 'waMessage') {
                        isValid = validateInput(value, 'message');
                    }
                    
                    if (!isValid) {
                        this.style.borderColor = '#ff4081';
                        this.style.boxShadow = '0 0 0 2px rgba(255, 64, 129, 0.1)';
                    } else {
                        this.style.borderColor = '#25d366';
                        this.style.boxShadow = '0 0 0 2px rgba(37, 211, 102, 0.1)';
                    }
                }
            });
            
            // Reset warna saat focus
            input.addEventListener('focus', function() {
                this.style.borderColor = '';
                this.style.boxShadow = '';
                const tooltip = this.parentNode.querySelector('.field-error-tooltip');
                if (tooltip) {
                    tooltip.remove();
                }
            });
        }
    });
    
    // Menu Filtering for Menu Page
    const filterButtons = document.querySelectorAll('.filter-btn');
    const menuItems = document.querySelectorAll('.menu-item');
    
    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Sanitize data-filter attribute
                const filterValue = sanitizeInput(button.getAttribute('data-filter'));
                
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                button.classList.add('active');
                
                menuItems.forEach(item => {
                    // Sanitize data-category attribute
                    const itemCategory = sanitizeInput(item.getAttribute('data-category'));
                    
                    if (filterValue === 'all' || itemCategory === filterValue) {
                        item.style.display = 'block';
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'scale(1)';
                        }, 10);
                    } else {
                        item.style.opacity = '0';
                        item.style.transform = 'scale(0.8)';
                        setTimeout(() => {
                            item.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 15px rgba(0, 0, 0, 0.1)';
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        // Sanitize target ID
        const sanitizedTarget = sanitizeInput(targetId);
        if (sanitizedTarget !== targetId) {
            console.warn('Potensi XSS terdeteksi pada anchor link');
            return;
        }
        
        const targetElement = document.querySelector(sanitizedTarget);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Initialize animations on page load
document.addEventListener('DOMContentLoaded', () => {
    // Animate elements that are already in view on page load
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        const rect = el.getBoundingClientRect();
        const isInViewport = (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom >= 0
        );
        
        if (isInViewport) {
            el.classList.add('animated');
        }
    });
    
    // Add hover effect to product cards dengan sanitasi event handlers
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        // Pastikan tidak ada event handlers berbahaya
        card.removeAttribute('onclick');
        card.removeAttribute('onmouseover');
        card.removeAttribute('onload');
        
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
            card.style.transition = 'transform 0.3s ease';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
});

// Add active class to current page in navigation
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkPage = sanitizeInput(link.getAttribute('href'));
        if (linkPage === currentPage || 
            (currentPage === '' && linkPage === 'index.html') ||
            (currentPage === 'index.html' && linkPage === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});

// Auto-format phone number input dengan sanitasi - DIUBAH lebih fleksibel
const phoneInput = document.getElementById('waPhone');
if (phoneInput) {
    // Hapus event handlers berbahaya
    phoneInput.removeAttribute('oninput');
    phoneInput.removeAttribute('onchange');
    
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value;
        
        // Biarkan user mengetik dengan bebas (spasi, tanda hubung, dll)
        // Hanya hapus karakter yang benar-benar berbahaya
        const dangerousChars = /[<>'"`\\]/g;
        if (dangerousChars.test(value)) {
            value = value.replace(dangerousChars, '');
        }
        
        // Format opsional: tambahkan otomatis +62 jika user mulai dengan 0
        if (value.replace(/\D/g, '').length === 1 && value.startsWith('0')) {
            // Biarkan user mengetik sendiri
        }
        
        e.target.value = value;
    });
}

// Security: Mutation Observer untuk mencegah DOM injection
document.addEventListener('DOMContentLoaded', function() {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        // Cek dan hapus script tags inline
                        if (node.tagName === 'SCRIPT' && !node.src) {
                            console.warn('Inline script removed for security');
                            node.remove();
                        }
                        
                        // Cek dan hapus event handlers berbahaya
                        const dangerousAttrs = ['onclick', 'onload', 'onerror', 'onmouseover', 'onkeydown', 'onfocus'];
                        dangerousAttrs.forEach(attr => {
                            if (node.hasAttribute && node.hasAttribute(attr)) {
                                node.removeAttribute(attr);
                            }
                        });
                        
                        // Cek untuk iframe berbahaya
                        if (node.tagName === 'IFRAME') {
                            const src = node.getAttribute('src');
                            if (src && !src.startsWith('https://') && !src.startsWith('http://')) {
                                node.remove();
                            }
                        }
                    }
                });
            }
        });
    });
    
    // Mulai observasi
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['onclick', 'onload', 'onerror', 'onmouseover', 'onkeydown']
    });
});

// Tambahkan CSS untuk animasi alert dan tooltip
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .whatsapp-alert {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        max-width: 400px;
        word-wrap: break-word;
        white-space: pre-wrap;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .whatsapp-alert i {
        font-size: 20px;
    }
    
    .field-error-tooltip {
        position: absolute;
        background: #ff4081;
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 13px;
        margin-top: 5px;
        z-index: 1000;
        max-width: 300px;
        white-space: pre-wrap;
        box-shadow: 0 4px 12px rgba(255, 64, 129, 0.3);
        animation: fadeIn 0.3s ease;
    }
    
    /* Style untuk form input yang valid */
    input:valid, textarea:valid {
        border-color: #25d366 !important;
    }
    
    /* Style untuk form input saat fokus */
    input:focus, textarea:focus, select:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.1) !important;
        border-color: #25d366 !important;
    }
`;
document.head.appendChild(style);

// Fungsi tambahan untuk mencegah XSS pada semua input
function setupGlobalInputProtection() {
    // Proteksi semua input dan textarea di halaman
    document.querySelectorAll('input, textarea').forEach(element => {
        // Hapus event handlers berbahaya
        element.removeAttribute('onfocus');
        element.removeAttribute('onblur');
        element.removeAttribute('onchange');
        
        // Tambahkan sanitasi dasar
        element.addEventListener('input', function(e) {
            const dangerous = /<[^>]*>|javascript:|data:|on\w+=/gi;
            if (dangerous.test(this.value)) {
                this.value = this.value.replace(dangerous, '');
            }
        });
    });
}

// Jalankan setup protection
document.addEventListener('DOMContentLoaded', setupGlobalInputProtection);

// Logging untuk debugging (opsional)
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
});

// Test function untuk memverifikasi sanitasi bekerja
function testSanitization() {
    const testCases = [
        { input: 'John Doe', expected: 'John Doe' },
        { input: 'Dr. Smith, Jr.', expected: 'Dr. Smith, Jr.' },
        { input: 'Jl. Merdeka No. 123', expected: 'Jl. Merdeka No. 123' },
        { input: '<script>alert("xss")</script>', expected: '' },
        { input: 'Test dengan "quotes"', expected: 'Test dengan &quot;quotes&quot;' }
    ];
    
    testCases.forEach(test => {
        const result = sanitizeInput(test.input);
        console.log(`Test: "${test.input}" -> "${result}" (expected: "${test.expected}")`);
    });
}

// Uncomment untuk testing
// testSanitization();

// Helper untuk mendapatkan parameter URL dengan aman
function getSafeURLParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    const value = urlParams.get(param);
    return value ? sanitizeInput(value) : '';
}

// Proteksi terhadap paste berbahaya
document.addEventListener('paste', function(e) {
    const target = e.target;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        setTimeout(() => {
            const dangerous = /<[^>]*>|javascript:|data:|on\w+=/gi;
            if (dangerous.test(target.value)) {
                target.value = target.value.replace(dangerous, '');
                showAlert('Konten berbahaya telah dihapus dari input.', 'error');
            }
        }, 10);
    }
});

// Last security check sebelum page unload
window.addEventListener('beforeunload', function() {
    // Clear sensitive data jika perlu
    const form = document.getElementById('whatsappForm');
    if (form) {
        // Tidak perlu clear, biarkan user experience baik
    }
});