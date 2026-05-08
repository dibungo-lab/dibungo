// assets/js/portfolio.js - DI Bungo
// Fungsi counter animation sudah ditangani oleh main.js (initCounters)
// File ini sengaja dikosongkan untuk menghindari bentrok

document.addEventListener('DOMContentLoaded', function() {
    
    // =====================
    // PORTFOLIO FILTER
    // =====================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    if (filterBtns.length && portfolioItems.length) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const filter = this.getAttribute('data-filter');
                
                portfolioItems.forEach(item => {
                    const cat = item.getAttribute('data-category') || '';
                    if (filter === 'all' || cat.split(' ').includes(filter)) {
                        item.style.display = '';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }
    
});
