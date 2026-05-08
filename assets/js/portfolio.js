document.addEventListener('DOMContentLoaded', function() {

    // FILTERING
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            portfolioItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category').includes(filter)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // MODAL
    function initModals() {
        document.querySelectorAll('.portfolio-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();

                if (document.querySelector('.portfolio-modal')) return;

                const card = this.closest('.portfolio-card');
                if (!card) return;

                const title = card.querySelector('.portfolio-title').textContent.trim();
                const desc = card.querySelector('.portfolio-desc').textContent.trim();
                const imgSrc = card.querySelector('img').src;
                const linkHref = this.getAttribute('href');

                let techHTML = '';
                card.querySelectorAll('.tech-tag').forEach(tag => {
                    techHTML += `<span class="tech-tag">${tag.textContent.trim()}</span>`;
                });

                let metaHTML = '';
                card.querySelectorAll('.portfolio-meta span').forEach(s => {
                    metaHTML += s.outerHTML;
                });

                const modalHTML = `
                    <div class="portfolio-modal">
                        <div class="modal-overlay"></div>
                        <div class="modal-content">
                            <button class="modal-close">×</button>
                            <div class="modal-header"><h2>${title}</h2></div>
                            <div class="modal-body">
                                <div class="modal-image">
                                    <img src="${imgSrc}" alt="${title}" loading="lazy">
                                </div>
                                <div class="modal-details">
                                    <h3>Deskripsi Proyek</h3>
                                    <p>${desc}</p>
                                    <h3>Teknologi</h3>
                                    <div class="modal-tech">${techHTML}</div>
                                    <h3>Detail Proyek</h3>
                                    <div class="modal-meta">${metaHTML}</div>
                                    <div class="modal-actions">
                                        <a href="${linkHref}" target="_blank" class="btn btn-primary">
                                            <i class="fas fa-external-link-alt"></i> Kunjungi Website
                                        </a>
                                        <button class="btn btn-outline modal-close-btn">Tutup</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                const modal = document.createElement('div');
                modal.innerHTML = modalHTML;
                document.body.appendChild(modal.firstElementChild);

                document.body.style.overflow = 'hidden';

                const closeModal = () => {
                    document.body.style.overflow = '';
                    const m = document.querySelector('.portfolio-modal');
                    if (m) m.remove();
                };

                document.querySelectorAll('.modal-close, .modal-close-btn, .modal-overlay').forEach(el => {
                    el.addEventListener('click', closeModal);
                });

                document.addEventListener('keydown', function esc(e) {
                    if (e.key === "Escape") {
                        closeModal();
                        document.removeEventListener('keydown', esc);
                    }
                });
            });
        });
    }

    setTimeout(initModals, 200);

    // CSS Portfolio (Full)
    if (!document.getElementById('portfolio-styles')) {
        const css = document.createElement('style');
        css.id = 'portfolio-styles';
        css.textContent = `
            .portfolio-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 30px; }
            .portfolio-card { height: 100%; transition: all 0.4s ease; }
            .portfolio-card:hover { transform: translateY(-12px); }
            .portfolio-image { height: 210px; }
            .portfolio-image img { transition: transform 0.5s; }
            .portfolio-card:hover .portfolio-image img { transform: scale(1.08); }
            .portfolio-overlay { opacity: 0; transition: 0.3s; }
            .portfolio-card:hover .portfolio-overlay { opacity: 1; }

            .portfolio-modal {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 9999;
                display: flex; align-items: center; justify-content: center;
            }
            .modal-overlay {
                position: absolute; inset: 0; background: rgba(0,0,0,0.9); backdrop-filter: blur(8px);
            }
            .modal-content {
                position: relative; background: var(--card-color); max-width: 1000px; width: 92%;
                border-radius: 16px; overflow: hidden; z-index: 1; max-height: 92vh; overflow-y: auto;
                border: 1px solid var(--border-color);
            }
            .modal-close { position: absolute; top: 15px; right: 20px; font-size: 2.2rem; background: none; border: none; color: white; cursor: pointer; z-index: 10; }
            .modal-body { padding: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
            @media (max-width: 768px) {
                .modal-body { grid-template-columns: 1fr; }
                .portfolio-grid { grid-template-columns: 1fr; }
            }
        `;
        document.head.appendChild(css);
    }
});
