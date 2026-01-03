// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi semua fungsi
    initHamburgerMenu();
    initTypewriterEffect(); // Panggil fungsi typewriter
    initHeroCarousel();
    initScrollAnimations();
    initSeasonFilter();
    initProductSearch();
    initProductModal();
    initActiveNavLinks();
    
    // Tambahkan efek hover untuk kartu produk
    initProductCardHover();
    
    // Inisialisasi fitur tambahan
    initSmoothScroll();
    initWhatsAppButton();
});

// Fungsi untuk hamburger menu
function initHamburgerMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Tutup menu ketika klik di luar
        document.addEventListener('click', function(event) {
            if (!hamburger.contains(event.target) && !navMenu.contains(event.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
        
        // Tutup menu ketika klik link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// Fungsi untuk efek typewriter di hero section - VERSI DIPERBAIKI
function initTypewriterEffect() {
    const typedTextElement = document.getElementById('typed-text');
    
    if (!typedTextElement) {
        console.log('Element typed-text tidak ditemukan');
        return;
    }
    
    const texts = [
        "Setiap Jersey",
        "Setiap Detail",
        "Setiap Musim",
        "Setiap Tim"
    ];
    
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    
    function typeWriter() {
        const currentText = texts[textIndex];
        
        if (isDeleting) {
            // Menghapus teks
            typedTextElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50; // Lebih cepat saat menghapus
        } else {
            // Mengetik teks
            typedTextElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100; // Kecepatan normal
        }
        
        // Jika selesai mengetik
        if (!isDeleting && charIndex === currentText.length) {
            // Tunggu sebentar sebelum mulai menghapus
            isDeleting = true;
            typingSpeed = 1500; // Tunggu 1.5 detik
        } 
        // Jika selesai menghapus
        else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            // Pindah ke teks berikutnya
            textIndex = (textIndex + 1) % texts.length;
            typingSpeed = 500; // Tunggu sebentar sebelum mulai mengetik lagi
        }
        
        setTimeout(typeWriter, typingSpeed);
    }
    
    // Mulai efek typewriter setelah delay
    setTimeout(typeWriter, 1000);
}

// Fungsi untuk carousel hero
function initHeroCarousel() {
    const carousel = document.querySelector('.jersey-carousel');
    if (!carousel) return;
    
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    let currentSlide = 0;
    const totalSlides = slides.length;
    let slideInterval;
    
    // Fungsi untuk pindah slide
    function goToSlide(n) {
        // Reset semua slide
        slides.forEach(slide => {
            slide.classList.remove('active', 'prev');
        });
        
        // Reset semua indicators
        indicators.forEach(indicator => {
            indicator.classList.remove('active');
            indicator.setAttribute('aria-current', 'false');
        });
        
        // Atur slide baru
        currentSlide = (n + totalSlides) % totalSlides;
        slides[currentSlide].classList.add('active');
        
        // Atur indicator aktif
        if (indicators[currentSlide]) {
            indicators[currentSlide].classList.add('active');
            indicators[currentSlide].setAttribute('aria-current', 'true');
        }
        
        // Atur slide sebelumnya
        const prevSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        if (slides[prevSlide]) {
            slides[prevSlide].classList.add('prev');
        }
    }
    
    // Fungsi untuk next slide
    function nextSlide() {
        goToSlide(currentSlide + 1);
    }
    
    // Fungsi untuk prev slide
    function prevSlide() {
        goToSlide(currentSlide - 1);
    }
    
    // Event listeners untuk tombol
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            prevSlide();
            resetAutoSlide();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            nextSlide();
            resetAutoSlide();
        });
    }
    
    // Event listeners untuk indicators
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', (e) => {
            e.preventDefault();
            goToSlide(index);
            resetAutoSlide();
        });
    });
    
    // Fungsi untuk reset auto slide
    function resetAutoSlide() {
        clearInterval(slideInterval);
        startAutoSlide();
    }
    
    // Fungsi untuk mulai auto slide
    function startAutoSlide() {
        slideInterval = setInterval(nextSlide, 5000);
    }
    
    // Hentikan auto slide ketika hover
    if (carousel) {
        carousel.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });
        
        // Lanjutkan auto slide ketika mouse keluar
        carousel.addEventListener('mouseleave', () => {
            startAutoSlide();
        });
    }
    
    // Inisialisasi slide pertama
    goToSlide(0);
    
    // Mulai auto slide
    startAutoSlide();
}

// Fungsi untuk animasi pada scroll
function initScrollAnimations() {
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    const productItems = document.querySelectorAll('.produk-item');
    
    // Fungsi untuk mengecek elemen yang terlihat di viewport
    function checkScroll() {
        animateElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 100;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('visible');
            }
        });
        
        // Animasi untuk produk items
        productItems.forEach(item => {
            const itemTop = item.getBoundingClientRect().top;
            const itemVisible = 150;
            
            if (itemTop < window.innerHeight - itemVisible && !item.classList.contains('visible')) {
                item.classList.add('visible');
            }
        });
    }
    
    // Panggil saat load dan scroll
    window.addEventListener('load', checkScroll);
    window.addEventListener('scroll', checkScroll);
    
    // Panggil sekali saat load untuk elemen yang sudah terlihat
    checkScroll();
}

// Fungsi untuk filter berdasarkan musim
function initSeasonFilter() {
    const seasonButtons = document.querySelectorAll('.season-btn');
    const productItems = document.querySelectorAll('.produk-item');
    
    if (seasonButtons.length > 0 && productItems.length > 0) {
        seasonButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Hapus active dari semua button
                seasonButtons.forEach(btn => btn.classList.remove('active'));
                // Tambah active ke button yang diklik
                this.classList.add('active');
                
                const seasonValue = this.getAttribute('data-season');
                
                // Filter produk
                productItems.forEach(item => {
                    if (seasonValue === 'all' || item.getAttribute('data-season') === seasonValue) {
                        item.style.display = 'block';
                        // Tambah animasi
                        setTimeout(() => {
                            item.classList.add('visible');
                        }, 100);
                    } else if (seasonValue === 'classic') {
                        // Filter untuk musim klasik (2011 kebawah)
                        const itemSeason = parseInt(item.getAttribute('data-season'));
                        if (itemSeason < 2012 || isNaN(itemSeason)) {
                            item.style.display = 'block';
                            setTimeout(() => {
                                item.classList.add('visible');
                            }, 100);
                        } else {
                            item.style.display = 'none';
                            item.classList.remove('visible');
                        }
                    } else {
                        item.style.display = 'none';
                        item.classList.remove('visible');
                    }
                });
            });
        });
    }
}

// Fungsi untuk pencarian produk
function initProductSearch() {
    const searchInput = document.getElementById('produk-search');
    const searchButton = document.getElementById('search-btn');
    
    if (searchInput && searchButton) {
        // Pencarian saat tombol diklik
        searchButton.addEventListener('click', performSearch);
        
        // Pencarian saat tekan Enter
        searchInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                performSearch();
            }
        });
        
        function performSearch() {
            const searchTerm = searchInput.value.toLowerCase().trim();
            const productItems = document.querySelectorAll('.produk-item');
            
            if (searchTerm === '') {
                // Jika kosong, tampilkan semua
                productItems.forEach(item => {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.classList.add('visible');
                    }, 100);
                });
                return;
            }
            
            productItems.forEach(item => {
                const productCard = item.querySelector('.produk-card');
                const productTitle = productCard.querySelector('h3').textContent.toLowerCase();
                const productDescription = productCard.querySelector('p').textContent.toLowerCase();
                const productSeason = productCard.querySelector('.produk-season').textContent.toLowerCase();
                
                if (productTitle.includes(searchTerm) || 
                    productDescription.includes(searchTerm) || 
                    productSeason.includes(searchTerm)) {
                    item.style.display = 'block';
                    // Tambah animasi
                    setTimeout(() => {
                        item.classList.add('visible');
                    }, 100);
                } else {
                    item.style.display = 'none';
                    item.classList.remove('visible');
                }
            });
        }
    }
}

// Fungsi untuk modal produk
function initProductModal() {
    const modal = document.getElementById('produk-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const closeModalBtn2 = document.querySelector('.close-modal-btn');
    const orderButtons = document.querySelectorAll('.btn-order');
    const sizeOptions = document.querySelectorAll('.size-option');
    
    // Fungsi untuk buka modal
    function openModal(productCard) {
        if (modal) {
            const productTitle = productCard.querySelector('h3').textContent;
            const productSeason = productCard.querySelector('.produk-season').textContent;
            const productPrice = productCard.querySelector('.produk-price').textContent;
            const productDescription = productCard.querySelector('p').textContent;
            const productImage = productCard.querySelector('img').src;
            
            // Set konten modal
            document.getElementById('modal-produk-title').textContent = productTitle;
            document.querySelector('.modal-produk-season').textContent = `Musim: ${productSeason}`;
            document.getElementById('modal-produk-price').textContent = productPrice;
            document.getElementById('modal-produk-description').textContent = productDescription;
            document.getElementById('modal-product-img').src = productImage;
            
            // Tampilkan modal
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Cegah scroll di body
        }
    }
    
    // Fungsi untuk tutup modal
    function closeModal() {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Aktifkan scroll di body
        }
    }
    
    // Event listener untuk tombol order
    if (orderButtons.length > 0) {
        orderButtons.forEach(button => {
            button.addEventListener('click', function(event) {
                event.preventDefault();
                const productCard = this.closest('.produk-card');
                openModal(productCard);
            });
        });
    }
    
    // Event listener untuk tombol close modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    
    if (closeModalBtn2) {
        closeModalBtn2.addEventListener('click', closeModal);
    }
    
    // Tutup modal ketika klik di luar konten modal
    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeModal();
            }
        });
    }
    
    // Event listener untuk pilihan ukuran
    if (sizeOptions.length > 0) {
        sizeOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Hapus active dari semua opsi
                sizeOptions.forEach(opt => opt.classList.remove('active'));
                // Tambah active ke opsi yang diklik
                this.classList.add('active');
            });
        });
    }
}

// Fungsi untuk aktifkan link navbar sesuai halaman
function initActiveNavLinks() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        
        // Hapus active dari semua link
        link.classList.remove('active');
        
        // Cek jika link sesuai dengan halaman saat ini
        if (linkHref === currentPage) {
            link.classList.add('active');
        }
        
        // Untuk index.html (home)
        if (currentPage === '' || currentPage === 'index.html') {
            if (linkHref === 'index.html' || linkHref === '') {
                link.classList.add('active');
            }
        }
    });
}

// Fungsi untuk efek hover pada kartu produk
function initProductCardHover() {
    const productCards = document.querySelectorAll('.produk-card, .trending-card');
    
    productCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Fungsi untuk smooth scroll
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(event) {
            // Lewati jika link bukan anchor
            if (this.getAttribute('href') === '#') return;
            
            event.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Tutup menu hamburger jika terbuka
                const hamburger = document.getElementById('hamburger');
                const navMenu = document.querySelector('.nav-menu');
                if (hamburger && navMenu) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                }
                
                // Scroll ke target
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Fungsi untuk WhatsApp button
function initWhatsAppButton() {
    const whatsappBtn = document.getElementById('whatsapp-btn');
    
    if (whatsappBtn) {
        // Tambah efek klik
        whatsappBtn.addEventListener('click', function() {
            // Tambah animasi klik
            this.style.transform = 'scale(0.9)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 200);
        });
    }
}