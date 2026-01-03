// Portfolio Filtering and Interactions
document.addEventListener('DOMContentLoaded', function() {
    // Portfolio Filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all buttons
                filterBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');
                
                const filter = this.getAttribute('data-filter');
                
                // Filter portfolio items
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
    
    // Portfolio Modal (for larger previews) - DIPERBAIKI untuk XSS
    const portfolioLinks = document.querySelectorAll('.portfolio-link');
    
    portfolioLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Check if modal already exists
            if (document.querySelector('.portfolio-modal')) {
                return;
            }
            
            // Get project data from card dengan cara yang aman
            const card = this.closest('.portfolio-card');
            const title = card.querySelector('.portfolio-title').textContent;
            const desc = card.querySelector('.portfolio-desc').textContent;
            const imgSrc = this.closest('.portfolio-image').querySelector('img').src;
            const linkHref = this.getAttribute('href');
            
            // Ambil teknologi dengan aman - gunakan textContent, bukan innerHTML
            const techTags = card.querySelectorAll('.tech-tag');
            let techHTML = '';
            techTags.forEach(tag => {
                const tagText = tag.textContent || '';
                techHTML += `<span class="tech-tag">${escapeHTML(tagText)}</span>`;
            });
            
            // Ambil metadata dengan aman
            const metaElements = card.querySelectorAll('.portfolio-meta span');
            let metaHTML = '';
            metaElements.forEach(span => {
                // Clone span untuk mendapatkan konten tanpa mengubah original
                const spanClone = span.cloneNode(true);
                // Hapus semua atribut yang tidak perlu
                Array.from(spanClone.attributes).forEach(attr => {
                    if (attr.name !== 'class') {
                        spanClone.removeAttribute(attr.name);
                    }
                });
                metaHTML += spanClone.outerHTML;
            });
            
            // Create modal dengan konten yang sudah disanitasi
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
                            <img src="${escapeHTML(imgSrc)}" alt="${escapeHTML(title)}">
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
            
            // Disable body scroll
            document.body.style.overflow = 'hidden';
            
            // Add styles for modal dengan ID unik
            if (!document.querySelector('#portfolio-modal-styles')) {
                const styles = document.createElement('style');
                styles.id = 'portfolio-modal-styles';
                styles.textContent = `
                    .portfolio-modal {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        z-index: 2000;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        opacity: 0;
                        animation: modalFadeIn 0.3s ease forwards;
                    }
                    
                    .modal-overlay {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0, 0, 0, 0.8);
                        backdrop-filter: blur(5px);
                    }
                    
                    .modal-content {
                        position: relative;
                        background: var(--card-color);
                        border-radius: var(--border-radius);
                        width: 90%;
                        max-width: 1000px;
                        max-height: 90vh;
                        overflow-y: auto;
                        z-index: 2001;
                        border: 1px solid var(--border-color);
                        transform: translateY(-20px);
                        animation: modalSlideIn 0.3s ease forwards;
                    }
                    
                    @keyframes modalFadeIn {
                        to {
                            opacity: 1;
                        }
                    }
                    
                    @keyframes modalSlideIn {
                        to {
                            transform: translateY(0);
                        }
                    }
                    
                    .modal-close {
                        position: absolute;
                        top: 15px;
                        right: 15px;
                        background: none;
                        border: none;
                        color: var(--text-color);
                        font-size: 2rem;
                        cursor: pointer;
                        z-index: 2002;
                        transition: var(--transition);
                        width: 40px;
                        height: 40px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 50%;
                    }
                    
                    .modal-close:hover {
                        color: var(--primary-color);
                        background: rgba(255, 255, 255, 0.1);
                    }
                    
                    .modal-header {
                        padding: 30px 30px 20px;
                        border-bottom: 1px solid var(--border-color);
                    }
                    
                    .modal-header h2 {
                        color: var(--primary-color);
                        margin: 0;
                        padding-right: 40px;
                    }
                    
                    .modal-body {
                        padding: 30px;
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 30px;
                    }
                    
                    .modal-image img {
                        width: 100%;
                        height: auto;
                        border-radius: var(--border-radius);
                        box-shadow: var(--box-shadow);
                    }
                    
                    .modal-details h3 {
                        color: var(--primary-color);
                        margin: 20px 0 10px;
                        font-size: 1.2rem;
                    }
                    
                    .modal-details h3:first-child {
                        margin-top: 0;
                    }
                    
                    .modal-tech {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 10px;
                        margin-bottom: 20px;
                    }
                    
                    .modal-meta {
                        display: flex;
                        justify-content: space-between;
                        color: var(--text-secondary);
                        font-size: 0.9rem;
                        padding-top: 15px;
                        border-top: 1px solid var(--border-color);
                    }
                    
                    .modal-meta span {
                        display: flex;
                        align-items: center;
                        gap: 5px;
                    }
                    
                    .modal-actions {
                        display: flex;
                        gap: 15px;
                        margin-top: 30px;
                    }
                    
                    @media (max-width: 768px) {
                        .modal-body {
                            grid-template-columns: 1fr;
                            gap: 20px;
                        }
                        
                        .modal-actions {
                            flex-direction: column;
                        }
                        
                        .modal-content {
                            width: 95%;
                            max-height: 85vh;
                        }
                    }
                    
                    @media (max-width: 480px) {
                        .modal-header {
                            padding: 20px 20px 15px;
                        }
                        
                        .modal-body {
                            padding: 20px;
                        }
                        
                        .modal-close {
                            top: 10px;
                            right: 10px;
                            font-size: 1.5rem;
                        }
                    }
                `;
                document.head.appendChild(styles);
            }
            
            // Function to close modal and restore scroll
            const closeModal = () => {
                // Restore body scroll
                document.body.style.overflow = '';
                
                // Remove modal
                if (modal && modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
                
                // Remove escape key listener
                document.removeEventListener('keydown', handleEscape);
            };
            
            // Function to handle escape key
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    closeModal();
                }
            };
            
            // Add event listeners
            modal.querySelector('.modal-close').addEventListener('click', closeModal);
            modal.querySelector('.modal-close-btn').addEventListener('click', closeModal);
            modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
            
            // Add escape key listener
            document.addEventListener('keydown', handleEscape);
            
            // Handle click on modal background (outside content)
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeModal();
                }
            });
        });
    });
    
    // Add CSS for portfolio page
    const portfolioStyles = document.createElement('style');
    portfolioStyles.textContent = `
        .portfolio-filters {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 20px;
        }
        
        .filter-btn {
            padding: 8px 20px;
            background: var(--card-color);
            border: 1px solid var(--border-color);
            border-radius: 30px;
            color: var(--text-color);
            cursor: pointer;
            transition: var(--transition);
            font-family: 'JetBrains Mono', monospace;
        }
        
        .filter-btn.active,
        .filter-btn:hover {
            background: var(--primary-color);
            color: #000;
            border-color: var(--primary-color);
        }
        
        .portfolio-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 30px;
        }
        
        .portfolio-card {
            background: var(--card-color);
            border-radius: var(--border-radius);
            overflow: hidden;
            border: 1px solid var(--border-color);
            transition: var(--transition);
            height: 100%;
        }
        
        .portfolio-card:hover {
            transform: translateY(-10px);
            box-shadow: var(--box-shadow-hover);
            border-color: var(--primary-color);
        }
        
        .portfolio-image {
            position: relative;
            height: 200px;
            overflow: hidden;
        }
        
        .portfolio-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease;
        }
        
        .portfolio-card:hover .portfolio-image img {
            transform: scale(1.05);
        }
        
        .portfolio-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: var(--transition);
        }
        
        .portfolio-card:hover .portfolio-overlay {
            opacity: 1;
        }
        
        .portfolio-link {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 50px;
            height: 50px;
            background: var(--primary-color);
            color: #000;
            border-radius: 50%;
            text-decoration: none;
            font-size: 1.2rem;
            transition: var(--transition);
        }
        
        .portfolio-link:hover {
            background: #00cc77;
            transform: scale(1.1);
        }
        
        .portfolio-badge {
            position: absolute;
            top: 15px;
            right: 15px;
            background: var(--primary-color);
            color: #000;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .portfolio-content {
            padding: 25px;
        }
        
        .portfolio-title {
            font-size: 1.3rem;
            margin-bottom: 10px;
            color: var(--primary-color);
        }
        
        .portfolio-desc {
            color: var(--text-secondary);
            margin-bottom: 15px;
            line-height: 1.5;
        }
        
        .portfolio-tech {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 15px;
        }
        
        .tech-tag {
            background: rgba(0, 255, 136, 0.1);
            color: var(--primary-color);
            padding: 4px 10px;
            border-radius: 15px;
            font-size: 0.8rem;
        }
        
        .portfolio-meta {
            display: flex;
            justify-content: space-between;
            color: var(--text-secondary);
            font-size: 0.9rem;
            border-top: 1px solid var(--border-color);
            padding-top: 15px;
        }
        
        .portfolio-meta span {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .testimonial-card {
            background: var(--bg-color);
            border-radius: var(--border-radius);
            padding: 30px;
            border: 1px solid var(--border-color);
            transition: var(--transition);
        }
        
        .testimonial-card:hover {
            border-color: var(--primary-color);
            transform: translateY(-5px);
        }
        
        .testimonial-content {
            color: var(--text-secondary);
            font-style: italic;
            margin-bottom: 20px;
            line-height: 1.6;
        }
        
        .testimonial-author {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .author-info h4 {
            color: var(--primary-color);
            margin-bottom: 5px;
        }
        
        .author-info p {
            color: var(--text-secondary);
            font-size: 0.9rem;
        }
        
        .author-rating {
            color: #ffcc00;
        }
        
        .stat-box {
            text-align: center;
            padding: 30px;
            background: var(--card-color);
            border-radius: var(--border-radius);
            border: 1px solid var(--border-color);
            transition: var(--transition);
        }
        
        .stat-box:hover {
            border-color: var(--primary-color);
            transform: translateY(-5px);
        }
        
        .stat-box .stat-number {
            font-size: 2.5rem;
            color: var(--primary-color);
            margin-bottom: 10px;
        }
        
        .stat-box .stat-label {
            color: var(--text-secondary);
            font-size: 0.9rem;
        }
        
        @media (max-width: 768px) {
            .portfolio-grid {
                grid-template-columns: 1fr;
            }
            
            .portfolio-filters {
                justify-content: center;
            }
        }
    `;
    document.head.appendChild(portfolioStyles);
});

// Helper function untuk escape HTML (jika belum ada di main.js)
if (typeof escapeHTML === 'undefined') {
    window.escapeHTML = function(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };
}