// Portfolio Filtering and Interactions - VERSI STABIL
document.addEventListener('DOMContentLoaded', function() {
    
    // === FILTERING ===
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

    // === MODAL PORTFOLIO (Stabil & Aman) ===
    function initPortfolioModals() {
        const portfolioLinks = document.querySelectorAll('.portfolio-link');
        
        portfolioLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                if (document.querySelector('.portfolio-modal')) return;
                
                const card = this.closest('.portfolio-card');
                if (!card) return;

                const title = card.querySelector('.portfolio-title')?.textContent?.trim() || 'Proyek';
                const desc = card.querySelector('.portfolio-desc')?.textContent?.trim() || '';
                const imgSrc = card.querySelector('img')?.src || '';
                const linkHref = this.getAttribute('href') || '#';

                let techHTML = '';
                card.querySelectorAll('.tech-tag').forEach(tag => {
                    const text = tag.textContent?.trim();
                    if (text) techHTML += `<span class="tech-tag">${escapeHTML(text)}</span>`;
                });

                let metaHTML = '';
                card.querySelectorAll('.portfolio-meta span').forEach(span => {
                    metaHTML += span.outerHTML;
                });

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

                const closeModal = () => {
                    document.body.style.overflow = '';
                    modal.remove();
                    document.removeEventListener('keydown', handleEscape);
                };

                const handleEscape = (e) => {
                    if (e.key === 'Escape') closeModal();
                };

                modal.querySelector('.modal-close').onclick = closeModal;
                modal.querySelector('.modal-close-btn').onclick = closeModal;
                modal.querySelector('.modal-overlay').onclick = closeModal;
                document.addEventListener('keydown', handleEscape);
            });
        });
    }

    // Jalankan modal setelah DOM stabil
    setTimeout(initPortfolioModals, 150);

    // === CSS PORTFOLIO (Full & Aman) ===
    if (!document.getElementById('portfolio-page-styles')) {
        const style = document.createElement('style');
        style.id = 'portfolio-page-styles';
        style.textContent = `
            .portfolio-filters { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px; justify-content: center; }
            .filter-btn {
                padding: 8px 20px; background: var(--card-color); border: 1px solid var(--border-color);
                border-radius: 30px; color: var(--text-color); cursor: pointer; transition: all 0.3s;
                font-family: 'JetBrains Mono', monospace;
            }
            .filter-btn.active, .filter-btn:hover {
                background: var(--primary-color); color: #000; border-color: var(--primary-color);
            }
            .portfolio-grid {
                display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 30px;
            }
            .portfolio-card {
                background: var(--card-color); border-radius: var(--border-radius); overflow: hidden;
                border: 1px solid var(--border-color); transition: all 0.4s; height: 100%;
            }
            .portfolio-card:hover {
                transform: translateY(-10px); box-shadow: var(--box-shadow-hover); border-color: var(--primary-color);
            }
            .portfolio-image { position: relative; height: 200px; overflow: hidden; }
            .portfolio-image img {
                width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;
            }
            .portfolio-card:hover .portfolio-image img { transform: scale(1.05); }
            .portfolio-overlay {
                position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center;
                opacity: 0; transition: 0.3s;
            }
            .portfolio-card:hover .portfolio-overlay { opacity: 1; }
            .portfolio-link {
                width: 50px; height: 50px; background: var(--primary-color); color: #000;
                border-radius: 50%; display: flex; align-items: center; justify-content: center;
                font-size: 1.3rem; text-decoration: none;
            }
            .portfolio-badge {
                position: absolute; top: 15px; right: 15px; background: var(--primary-color);
                color: #000; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 500;
            }
            .portfolio-content { padding: 25px; }
            .portfolio-title { font-size: 1.3rem; margin-bottom: 10px; color: var(--primary-color); }
            .portfolio-desc { color: var(--text-secondary); margin-bottom: 15px; line-height: 1.5; }
            .portfolio-tech { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 15px; }
            .tech-tag {
                background: rgba(0, 255, 136, 0.1); color: var(--primary-color);
                padding: 4px 10px; border-radius: 15px; font-size: 0.8rem;
            }
            .portfolio-meta {
                display: flex; justify-content: space-between; color: var(--text-secondary);
                font-size: 0.9rem; border-top: 1px solid var(--border-color); padding-top: 15px;
            }
            .portfolio-meta span { display: flex; align-items: center; gap: 5px; }

            /* Modal Styles */
            .portfolio-modal {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 2000;
                display: flex; align-items: center; justify-content: center; opacity: 0;
                animation: modalFadeIn 0.3s forwards;
            }
            .modal-overlay {
                position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.85); backdrop-filter: blur(5px);
            }
            .modal-content {
                position: relative; background: var(--card-color); border-radius: var(--border-radius);
                width: 90%; max-width: 1000px; max-height: 90vh; overflow-y: auto; z-index: 2001;
                border: 1px solid var(--border-color); animation: modalSlideIn 0.3s forwards;
            }
            @keyframes modalFadeIn { to { opacity: 1; } }
            @keyframes modalSlideIn { to { transform: translateY(0); } }

            .modal-close {
                position: absolute; top: 15px; right: 15px; background: none; border: none;
                color: var(--text-color); font-size: 2rem; cursor: pointer; z-index: 2002;
            }
            .modal-header { padding: 30px 30px 20px; border-bottom: 1px solid var(--border-color); }
            .modal-header h2 { color: var(--primary-color); margin: 0; }
            .modal-body {
                padding: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 30px;
            }
            .modal-image img { width: 100%; border-radius: var(--border-radius); }
            .modal-details h3 { color: var(--primary-color); margin: 20px 0 10px; }
            .modal-tech { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }
            .modal-actions { display: flex; gap: 15px; margin-top: 30px; }

            @media (max-width: 768px) {
                .portfolio-grid { grid-template-columns: 1fr; }
                .modal-body { grid-template-columns: 1fr; gap: 20px; }
                .modal-actions { flex-direction: column; }
            }
        `;
        document.head.appendChild(style);
    }
});

// Escape HTML Helper
if (typeof window.escapeHTML === 'undefined') {
    window.escapeHTML = function(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };
}
