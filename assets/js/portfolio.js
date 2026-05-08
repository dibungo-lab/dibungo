// assets/js/portfolio.js - VERSI PERBAIKAN MINIMAL
document.addEventListener('DOMContentLoaded', function() {
    
    try {
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
                    
                    const filter = this.dataset.filter;
                    
                    portfolioItems.forEach(item => {
                        const cat = item.dataset.category || '';
                        item.style.display = (filter === 'all' || cat.includes(filter)) ? '' : 'none';
                    });
                });
            });
        }
        
        // =====================
        // COUNTER ANIMATION
        // =====================
        const statNumbers = document.querySelectorAll('.stat-number');
        
        if (statNumbers.length) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        const target = parseInt(el.dataset.count) || 0;
                        
                        if (!el.classList.contains('counted')) {
                            el.classList.add('counted');
                            animateValue(el, 0, target, 2000);
                        }
                        
                        observer.unobserve(el);
                    }
                });
            }, { threshold: 0.3 });
            
            statNumbers.forEach(el => observer.observe(el));
        }
        
        function animateValue(el, start, end, duration) {
            if (start === end) return;
            const range = end - start;
            const increment = end > start ? 1 : -1;
            const stepTime = Math.abs(Math.floor(duration / range));
            let current = start;
            
            const timer = setInterval(() => {
                current += increment;
                el.textContent = current;
                if (current === end) clearInterval(timer);
            }, stepTime);
        }
        
    } catch (e) {
        console.error('Portfolio JS Error:', e.message);
    }
    
});
