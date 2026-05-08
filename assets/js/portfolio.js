// Portfolio Filtering and Interactions
document.addEventListener('DOMContentLoaded', function() {
    // Portfolio Filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const filter = this.getAttribute('data-filter');
                
                portfolioItems.forEach(item => {
                    if (filter === 'all' || item.getAttribute('data-category').includes(filter)) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }
    
    // Portfolio Modal - Versi lebih stabil & aman
    function initPortfolioModal() {
        const portfolioLinks = document.querySelectorAll('.portfolio-link');
        
        portfolioLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Cegah multiple modal
                if (document.querySelector('.portfolio-modal')) {
                    return;
                }
                
                const card = this.closest('.portfolio-card');
                if (!card) return;
                
                const title = card.querySelector('.portfolio-title')?.textContent || 'Proyek';
                const desc = card.querySelector('.portfolio-desc')?.textContent || '';
                const imgSrc = card.querySelector('img')?.src || '';
                const linkHref = this.getAttribute('href') || '#';
                
                // Tech tags
                const techTags = card.querySelectorAll('.tech-tag');
                let techHTML = '';
                techTags.forEach(tag => {
                    const text = tag.textContent?.trim() || '';
                    if (text) techHTML += `<span class="tech-tag">${escapeHTML(text)}</span>`;
                });
                
                // Meta
                const metaElements = card.querySelectorAll('.portfolio-meta span');
                let metaHTML = '';
                metaElements.forEach(span => {
                    const clone = span.cloneNode(true);
                    metaHTML += clone.outerHTML;
                });
                
                // Create modal
                const modal = document.createElement('div');
                modal.className = 'portfolio-modal';
                modal.innerHTML = `
                    <div class="modal-overlay"></div>
                    <div class="modal-content">
                        <button class="modal-close">&times;</button>
                        <div class="modal-header">
                            <h2>${escapeHTML(title)}</h2>
                        </div>
                        <div class="modal-body">
                            <div class="modal-image">
                                <img src="${escapeHTML(imgSrc)}" alt="${escapeHTML(title)}" loading="lazy">
                            </div>
                            <div class="modal-details">
                                <h3>Deskripsi Proyek</h3>
                                <p>${escapeHTML(desc)}</p>
                                
                                <h3>Teknologi yang Digunakan</h3>
                                <div class="modal-tech">${techHTML}</div>
                                
                                <h3>Detail Proyek</h3>
                                <div class="modal-meta">${metaHTML}</div>
                                
                                <div class="modal-actions">
                                    <a href="${escapeHTML(linkHref)}" target="_blank" class="btn btn-primary">
                                        <i class="fas fa-external-link-alt"></i> Kunjungi Website
                                    </a>
                                    <button class="btn btn-outline modal-close-btn">Tutup</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(modal);
                document.body.style.overflow = 'hidden';
                
                // Close handlers
                const closeModal = () => {
                    document.body.style.overflow = '';
                    if (modal && modal.parentNode) modal.parentNode.removeChild(modal);
                    document.removeEventListener('keydown', handleEscape);
                };
                
                const handleEscape = (e) => {
                    if (e.key === 'Escape') closeModal();
                };
                
                modal.querySelector('.modal-close').addEventListener('click', closeModal);
                modal.querySelector('.modal-close-btn').addEventListener('click', closeModal);
                modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
                document.addEventListener('keydown', handleEscape);
            });
        });
    }
    
    // Jalankan modal setelah sedikit delay agar DOM stabil
    setTimeout(initPortfolioModal, 100);
    
    // Add CSS sekali saja
    if (!document.getElementById('portfolio-page-styles')) {
        const portfolioStyles = document.createElement('style');
        portfolioStyles.id = 'portfolio-page-styles';
        portfolioStyles.textContent = `... (CSS kamu yang lama tetap sama, saya tidak ubah) ...`;
        document.head.appendChild(portfolioStyles);
    }
});

// Helper escapeHTML
if (typeof window.escapeHTML === 'undefined') {
    window.escapeHTML = function(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };
}
