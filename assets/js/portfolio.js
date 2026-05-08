// assets/js/portfolio.js - DI Bungo Portfolio Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // =====================
    // 1. PORTFOLIO FILTER
    // =====================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    if (filterButtons.length > 0 && portfolioItems.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Hapus class 'active' dari semua tombol
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // Tambahkan class 'active' ke tombol yang diklik
                this.classList.add('active');

                const filterValue = this.getAttribute('data-filter');

                portfolioItems.forEach(item => {
                    // Ambil kategori dari atribut data
                    const categories = item.getAttribute('data-category');

                    if (!categories) {
                        console.warn('Portfolio item tidak memiliki data-category:', item);
                        item.style.display = 'none'; // Sembunyikan item tanpa kategori
                        return;
                    }

                    // Jika filter 'all' atau item memiliki kategori yang sesuai, tampilkan
                    if (filterValue === 'all' || categories.includes(filterValue)) {
                        item.style.display = 'block'; // Atau 'grid', sesuaikan dengan CSS Anda
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
        console.log('Fitur filter portfolio berhasil diinisialisasi.');
    } else {
        console.warn('Elemen filter atau item portfolio tidak ditemukan. Fitur filter tidak dijalankan.');
    }

    // =====================
    // 2. STATISTICS COUNTER ANIMATION
    // =====================
    const statNumbers = document.querySelectorAll('.stat-number');

    if (statNumbers.length > 0) {
        // Cek apakah browser mendukung IntersectionObserver
        if ('IntersectionObserver' in window) {
            const observerOptions = {
                root: null, // viewport
                rootMargin: '0px',
                threshold: 0.1 // Jalankan saat 10% elemen terlihat
            };

            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const statElement = entry.target;
                        // Hanya animasi jika belum dianimasikan (cek atribut)
                        if (!statElement.classList.contains('counted')) {
                            animateCounter(statElement);
                            // Hentikan pengamatan setelah animasi dimulai
                            observer.unobserve(statElement);
                        }
                    }
                });
            }, observerOptions);

            // Amati setiap elemen stat
            statNumbers.forEach(stat => {
                // Reset tampilan awal
                stat.innerText = '0';
                observer.observe(stat);
            });
        } else {
            // Fallback untuk browser yang tidak mendukung IntersectionObserver
            console.warn('IntersectionObserver tidak didukung. Animasi dijalankan langsung.');
            statNumbers.forEach(stat => animateCounter(stat));
        }
    } else {
        console.warn('Elemen .stat-number tidak ditemukan. Animasi tidak dijalankan.');
    }

    /**
     * Fungsi untuk menganimasikan penghitung dari 0 ke nilai target
     * @param {HTMLElement} element - Elemen DOM yang akan dianimasikan
     */
    function animateCounter(element) {
        const target = parseInt(element.getAttribute('data-count'), 10);
        
        // Validasi target
        if (isNaN(target) || target < 0) {
            console.error('Nilai data-count tidak valid untuk elemen:', element);
            element.innerText = '0'; // Tampilkan 0 sebagai fallback
            return;
        }

        const duration = 2000; // Durasi animasi dalam milidetik (2 detik)
        const startTime = performance.now();
        
        function updateCounter(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1); // Nilai antara 0 dan 1
            const currentValue = Math.floor(progress * target);

            element.innerText = currentValue.toLocaleString(); // Format dengan separator ribuan

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.innerText = target.toLocaleString(); // Pastikan nilai akhir
                console.log(`Animasi selesai: ${target} untuk elemen`, element);
            }
        }

        // Mulai animasi dan tandai elemen
        element.classList.add('counted');
        requestAnimationFrame(updateCounter);
        console.log(`Memulai animasi counter: 0 -> ${target}`);
    }

});
