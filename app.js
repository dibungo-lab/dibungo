// DI BUNGO - Template Preview System v2.0
// MULTI-PAGE SPA VERSION with Enhanced Routing
(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        mainDomain: 'dibungo.netlify.app',
        templatesBasePath: '/templates/',
        cacheDuration: 5 * 60 * 1000, // 5 minutes
        loadingTimeout: 10000,
        debug: true // Set to false for production
    };
    
    // Template configurations - MATCH dengan subdomain di _redirects
    const TEMPLATE_CONFIGS = {
        'template1': {
            displayName: 'Les Privat TK',
            folder: 'template1',
            cssFiles: ['style.css'],
            jsFiles: ['script.js'],
            defaultPage: 'index.html'
        },
        'template2': {
            displayName: 'UMKM Jajanan', 
            folder: 'template2',
            cssFiles: ['style.css'],
            jsFiles: ['script.js'],
            defaultPage: 'index.html'
        },
        'template3': {
            displayName: 'Toko Jersey',
            folder: 'template3',
            cssFiles: ['style.css'],
            jsFiles: ['script.js'],
            defaultPage: 'index.html'
        }
    };
    
    // State management
    const state = {
        cache: new Map(),
        loadedAssets: new Set(),
        currentTemplate: null,
        currentPage: 'index.html',
        isTemplateMode: false,
        navigationHistory: []
    };
    
    // ==================== INITIALIZATION ====================
    function init() {
        const currentHost = window.location.hostname;
        
        // DEBUG LOG
        if (CONFIG.debug) {
            console.log('🔄 App.js Initializing...');
            console.log('📍 Current Host:', currentHost);
            console.log('📍 Main Domain:', CONFIG.mainDomain);
            console.log('📍 Path:', window.location.pathname);
            console.log('📍 Hash:', window.location.hash);
        }
        
        // Jika di main domain (bukan template preview), EXIT
        if (currentHost === CONFIG.mainDomain || currentHost === 'localhost') {
            if (CONFIG.debug) console.log('✅ Main domain detected, template preview disabled');
            return; // Biarkan website utama berjalan normal
        }
        
        // Jika di subdomain template
        if (currentHost.endsWith(CONFIG.mainDomain)) {
            const subdomain = currentHost.split('.')[0];
            
            if (CONFIG.debug) console.log('🎯 Template subdomain detected:', subdomain);
            
            if (TEMPLATE_CONFIGS[subdomain]) {
                state.isTemplateMode = true;
                setupTemplatePreview(subdomain);
            } else {
                showInvalidTemplate(subdomain);
            }
        }
    }
    
    // ==================== TEMPLATE PREVIEW SETUP ====================
    function setupTemplatePreview(subdomain) {
        const template = TEMPLATE_CONFIGS[subdomain];
        state.currentTemplate = template;
        
        // Setup sebelum load
        setupGlobalHandlers();
        
        // Handle initial routing berdasarkan URL
        const initialPage = getInitialPageFromURL();
        
        if (CONFIG.debug) {
            console.log('📄 Initial page to load:', initialPage);
        }
        
        // Load template dengan page yang benar
        loadTemplateWithRouting(subdomain, initialPage);
    }
    
    // ==================== URL ROUTING HELPERS ====================
    function getInitialPageFromURL() {
        const path = window.location.pathname;
        const hash = window.location.hash.substring(1);
        
        // Priority 1: Hash routing (/#profil)
        if (hash) {
            const pageFromHash = hash === 'index' ? 'index.html' : `${hash}.html`;
            if (CONFIG.debug) console.log('🔗 Hash routing detected:', pageFromHash);
            return pageFromHash;
        }
        
        // Priority 2: Path routing (/profil.html)
        if (path && path !== '/' && path.endsWith('.html')) {
            const pageName = path.split('/').pop();
            if (CONFIG.debug) console.log('🛣️ Path routing detected:', pageName);
            return pageName;
        }
        
        // Default
        return 'index.html';
    }
    
    function updateURLForPage(pageName) {
        if (!state.isTemplateMode) return;
        
        const pageId = pageName.replace('.html', '');
        const newHash = pageId === 'index' ? '' : `#${pageId}`;
        
        // Update URL tanpa reload page
        if (window.location.hash !== newHash) {
            window.history.pushState({ page: pageName }, '', newHash);
            if (CONFIG.debug) console.log('🔗 URL updated to:', newHash);
        }
    }
    
    // ==================== GLOBAL EVENT HANDLERS ====================
    function setupGlobalHandlers() {
        // Handle browser back/forward
        window.addEventListener('popstate', handlePopState);
        
        // Handle template navigation clicks
        document.addEventListener('click', handleTemplateNavigation);
        
        // Handle hash changes
        window.addEventListener('hashchange', handleHashChange);
        
        if (CONFIG.debug) console.log('🎮 Global event handlers setup complete');
    }
    
    function handlePopState(event) {
        if (!state.isTemplateMode || !event.state) return;
        
        const pageName = event.state.page || getPageFromHash();
        if (pageName && pageName !== state.currentPage) {
            loadTemplatePage(state.currentTemplate, pageName, true);
        }
    }
    
    function handleTemplateNavigation(e) {
        if (!state.isTemplateMode) return;
        
        const link = e.target.closest('a');
        if (!link) return;
        
        // Check if it's a template internal link
        const href = link.getAttribute('href');
        if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
            return; // External link, let browser handle
        }
        
        // Check if it's a .html link within template
        if (href && href.endsWith('.html') && !href.includes(CONFIG.templatesBasePath)) {
            e.preventDefault();
            e.stopPropagation();
            
            const pageName = href.split('/').pop();
            if (CONFIG.debug) console.log('🔗 Template navigation clicked:', pageName);
            
            loadTemplatePage(state.currentTemplate, pageName);
            return false;
        }
    }
    
    function handleHashChange() {
        if (!state.isTemplateMode) return;
        
        const pageName = getPageFromHash();
        if (pageName && pageName !== state.currentPage) {
            loadTemplatePage(state.currentTemplate, pageName, true);
        }
    }
    
    function getPageFromHash() {
        const hash = window.location.hash.substring(1);
        if (!hash || hash === 'index') return 'index.html';
        return `${hash}.html`;
    }
    
    // ==================== TEMPLATE LOADING ====================
    async function loadTemplateWithRouting(subdomain, initialPage = 'index.html') {
        const template = TEMPLATE_CONFIGS[subdomain];
        
        try {
            showLoading(`Memuat ${template.displayName}...`);
            
            // Load template index.html pertama
            const html = await fetchTemplateFile(template.folder, 'index.html');
            
            // Cache the HTML
            const cacheKey = `${subdomain}:index.html`;
            state.cache.set(cacheKey, {
                html: html,
                timestamp: Date.now()
            });
            
            // Render template structure
            await renderTemplateStructure(html, template);
            
            // Load initial page
            if (initialPage !== 'index.html') {
                await loadTemplatePage(template, initialPage, false);
            } else {
                updateActiveNavigation('index.html');
            }
            
            // Update URL untuk initial page
            updateURLForPage(initialPage);
            
            if (CONFIG.debug) console.log('✅ Template loaded successfully');
            
        } catch (error) {
            console.error('❌ Error loading template:', error);
            showError(`Gagal memuat template: ${template.displayName}`, error.message);
        } finally {
            hideLoading();
        }
    }
    
    async function loadTemplatePage(template, pageName, isNavigation = true) {
        if (state.currentPage === pageName) return;
        
        try {
            showLoading(`Memuat halaman ${pageName.replace('.html', '')}...`);
            
            const cacheKey = `${template.folder}:${pageName}`;
            const cached = state.cache.get(cacheKey);
            
            let htmlContent;
            if (cached && (Date.now() - cached.timestamp < CONFIG.cacheDuration)) {
                htmlContent = cached.html;
                if (CONFIG.debug) console.log('💾 From cache:', pageName);
            } else {
                htmlContent = await fetchTemplateFile(template.folder, pageName);
                
                // Cache the result
                state.cache.set(cacheKey, {
                    html: htmlContent,
                    timestamp: Date.now()
                });
                if (CONFIG.debug) console.log('🌐 From server:', pageName);
            }
            
            // Render the page content
            await renderTemplatePage(htmlContent, template, pageName);
            
            // Update state
            state.currentPage = pageName;
            state.navigationHistory.push(pageName);
            
            // Update UI
            updateActiveNavigation(pageName);
            
            // Update URL
            if (isNavigation) {
                updateURLForPage(pageName);
            }
            
            // Scroll to top
            window.scrollTo(0, 0);
            
        } catch (error) {
            console.error(`❌ Error loading page ${pageName}:`, error);
            
            if (error.message.includes('404') || error.message.includes('not found')) {
                showPageNotFoundError(pageName);
            } else {
                showError(`Gagal memuat halaman: ${pageName}`, error.message);
            }
        } finally {
            hideLoading();
        }
    }
    
    // ==================== TEMPLATE RENDERING ====================
    async function renderTemplateStructure(html, template) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Clear existing content
        document.head.innerHTML = '';
        document.body.innerHTML = '';
        
        // Copy head elements (except title and external resources)
        Array.from(doc.head.children).forEach(element => {
            if (element.tagName === 'TITLE' || 
                (element.tagName === 'LINK' && element.rel === 'stylesheet') ||
                element.tagName === 'SCRIPT') {
                return; // Skip, we'll handle separately
            }
            document.head.appendChild(document.importNode(element, true));
        });
        
        // Add our template title
        const title = document.createElement('title');
        title.textContent = `${template.displayName} - Template Preview`;
        document.head.appendChild(title);
        
        // Copy body elements
        const templateContainer = document.createElement('div');
        templateContainer.id = 'template-container';
        templateContainer.dataset.template = template.folder;
        templateContainer.dataset.templateName = template.displayName;
        
        Array.from(doc.body.children).forEach(child => {
            templateContainer.appendChild(document.importNode(child, true));
        });
        
        document.body.appendChild(templateContainer);
        
        // Fix all internal links in the template
        fixAllInternalLinks(template.folder);
        
        // Load external resources
        await Promise.allSettled([
            loadCSSFiles(template),
            loadJSFiles(template)
        ]);
        
        // Add template indicator (optional, bisa dihapus)
        addTemplateIndicator(template);
    }
    
    async function renderTemplatePage(html, template, pageName) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Find main content area
        const newMainContent = doc.querySelector('main') || doc.body;
        
        // Find existing main content area
        const currentMain = document.querySelector('main') || document.querySelector('#template-container');
        
        if (currentMain && newMainContent) {
            // Replace content
            currentMain.innerHTML = '';
            Array.from(newMainContent.children).forEach(child => {
                currentMain.appendChild(document.importNode(child, true));
            });
            
            // Re-fix links in new content
            fixAllInternalLinks(template.folder);
            
            // Update title jika ada di page
            const docTitle = doc.querySelector('title');
            if (docTitle) {
                document.title = `${docTitle.textContent} - Template Preview`;
            }
            
            if (CONFIG.debug) console.log(`✅ Page ${pageName} rendered`);
        }
    }
    
    // ==================== UTILITY FUNCTIONS ====================
    async function fetchTemplateFile(folderName, fileName) {
        const templatePath = `${CONFIG.templatesBasePath}${folderName}/${fileName}`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.loadingTimeout);
        
        try {
            const response = await fetch(templatePath, {
                signal: controller.signal,
                headers: { 'Accept': 'text/html' }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.text();
            
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Request timeout - template took too long to load');
            }
            throw error;
        }
    }
    
    function fixAllInternalLinks(templateFolder) {
        const links = document.querySelectorAll('a[href]');
        links.forEach(link => {
            const href = link.getAttribute('href');
            
            // Only fix internal .html links
            if (href && href.endsWith('.html') && !href.includes('://') && !href.includes(CONFIG.templatesBasePath)) {
                // Keep original href for styling/SEO but override click
                link.dataset.originalHref = href;
                link.addEventListener('click', function(e) {
                    if (state.isTemplateMode) {
                        e.preventDefault();
                        const pageName = href.split('/').pop();
                        loadTemplatePage(state.currentTemplate, pageName);
                    }
                });
            }
        });
    }
    
    async function loadCSSFiles(template) {
        if (!template.cssFiles || template.cssFiles.length === 0) return;
        
        const cssPromises = template.cssFiles.map(cssFile => {
            return new Promise((resolve, reject) => {
                const cssPath = `${CONFIG.templatesBasePath}${template.folder}/${cssFile}`;
                const assetKey = `css:${cssPath}`;
                
                if (state.loadedAssets.has(assetKey)) {
                    resolve();
                    return;
                }
                
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = cssPath;
                link.onload = () => {
                    state.loadedAssets.add(assetKey);
                    resolve();
                };
                link.onerror = () => {
                    console.warn(`⚠️ Failed to load CSS: ${cssFile}`);
                    resolve(); // Resolve anyway to continue
                };
                
                document.head.appendChild(link);
            });
        });
        
        await Promise.allSettled(cssPromises);
    }
    
    async function loadJSFiles(template) {
        if (!template.jsFiles || template.jsFiles.length === 0) return;
        
        const jsPromises = template.jsFiles.map(jsFile => {
            return new Promise((resolve, reject) => {
                const jsPath = `${CONFIG.templatesBasePath}${template.folder}/${jsFile}`;
                const assetKey = `js:${jsPath}`;
                
                if (state.loadedAssets.has(assetKey)) {
                    resolve();
                    return;
                }
                
                const script = document.createElement('script');
                script.src = jsPath;
                script.defer = true;
                script.onload = () => {
                    state.loadedAssets.add(assetKey);
                    resolve();
                };
                script.onerror = () => {
                    console.warn(`⚠️ Failed to load JS: ${jsFile}`);
                    resolve(); // Resolve anyway to continue
                };
                
                document.body.appendChild(script);
            });
        });
        
        await Promise.allSettled(jsPromises);
    }
    
    function updateActiveNavigation(activePage) {
        const links = document.querySelectorAll('a[href]');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.endsWith('.html')) {
                const linkPage = href.split('/').pop();
                
                if (linkPage === activePage) {
                    link.classList.add('active');
                    link.setAttribute('aria-current', 'page');
                } else {
                    link.classList.remove('active');
                    link.removeAttribute('aria-current');
                }
            }
        });
    }
    
    function addTemplateIndicator(template) {
        const indicator = document.createElement('div');
        indicator.id = 'template-preview-indicator';
        indicator.innerHTML = `
            <style>
                #template-preview-indicator {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: rgba(0, 255, 136, 0.2);
                    border: 1px solid #00ff88;
                    color: #00ff88;
                    padding: 10px 15px;
                    border-radius: 8px;
                    font-size: 12px;
                    font-family: 'JetBrains Mono', monospace;
                    z-index: 10000;
                    backdrop-filter: blur(10px);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                #template-preview-indicator .template-name {
                    font-weight: bold;
                }
                #template-preview-indicator .close-btn {
                    background: none;
                    border: none;
                    color: #888;
                    cursor: pointer;
                    font-size: 14px;
                    padding: 2px 6px;
                    border-radius: 4px;
                }
                #template-preview-indicator .close-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                }
            </style>
            <span>🎯 Template Preview:</span>
            <span class="template-name">${template.displayName}</span>
            <button class="close-btn" title="Kembali ke situs utama" onclick="window.location.href='https://dibungo.netlify.app'">
                ×
            </button>
        `;
        document.body.appendChild(indicator);
    }
    
    // ==================== UI COMPONENTS ====================
    function showLoading(message) {
        if (document.getElementById('template-loader')) return;
        
        const loader = document.createElement('div');
        loader.id = 'template-loader';
        loader.innerHTML = `
            <style>
                #template-loader {
                    position: fixed;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    background: rgba(10, 10, 15, 0.95);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                    color: #00ff88;
                    font-family: 'JetBrains Mono', monospace;
                }
                .spinner {
                    width: 50px;
                    height: 50px;
                    border: 3px solid rgba(0, 255, 136, 0.3);
                    border-radius: 50%;
                    border-top-color: #00ff88;
                    animation: spin 1s linear infinite;
                }
                .loading-text {
                    margin-top: 20px;
                    font-size: 1rem;
                    text-align: center;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>
            <div class="spinner"></div>
            <div class="loading-text">${message}</div>
        `;
        document.body.appendChild(loader);
    }
    
    function hideLoading() {
        const loader = document.getElementById('template-loader');
        if (loader) {
            loader.style.opacity = '0';
            loader.style.transition = 'opacity 0.3s';
            setTimeout(() => loader.remove(), 300);
        }
    }
    
    function showPageNotFoundError(pageName) {
        const mainContent = document.querySelector('main') || document.querySelector('#template-container');
        
        if (mainContent) {
            mainContent.innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <h1 style="color: #ff5555; margin-bottom: 20px;">Halaman Tidak Ditemukan</h1>
                    <p style="margin-bottom: 30px; color: #888;">
                        Halaman "${pageName.replace('.html', '')}" tidak ditemukan di template ini.
                    </p>
                    <button onclick="window.templatePreview.navigateToPage('index.html')" 
                            style="padding: 12px 24px; background: #00ff88; color: #000; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
                        Kembali ke Halaman Utama
                    </button>
                </div>
            `;
            
            document.title = `Halaman Tidak Ditemukan - Template Preview`;
        }
    }
    
    function showError(message, details = '') {
        document.body.innerHTML = '';
        
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #0a0a0f;
            color: #ff5555;
            font-family: -apple-system, sans-serif;
            padding: 20px;
            text-align: center;
        `;
        
        errorDiv.innerHTML = `
            <div style="max-width: 600px;">
                <h1 style="font-size: 2rem; margin-bottom: 20px;">Error Memuat Template</h1>
                <p style="margin-bottom: 20px; font-size: 1.1rem;">${message}</p>
                ${details ? `<p style="color: #ff8888; background: rgba(255, 0, 0, 0.1); padding: 10px; border-radius: 5px; margin-bottom: 20px; font-family: monospace; font-size: 0.9rem;">${details}</p>` : ''}
                <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                    <a href="https://dibungo.netlify.app" style="
                        display: inline-block;
                        padding: 14px 32px;
                        background: #ff5555;
                        color: white;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: 600;">
                        Kembali ke Situs Utama
                    </a>
                    <button onclick="location.reload()" style="
                        display: inline-block;
                        padding: 14px 32px;
                        background: rgba(255, 255, 255, 0.1);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;">
                        Coba Lagi
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
    }
    
    function showInvalidTemplate(subdomain) {
        document.body.innerHTML = '';
        
        const container = document.createElement('div');
        container.style.cssText = `
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
            color: #ffaa00;
            font-family: -apple-system, sans-serif;
            padding: 20px;
            text-align: center;
        `;
        
        const validTemplates = Object.keys(TEMPLATE_CONFIGS).map(t => 
            `<code style="background: rgba(255, 255, 255, 0.1); padding: 8px 16px; border-radius: 6px; color: #00ff88; margin: 5px; display: inline-block;">${t}</code>`
        ).join('');
        
        container.innerHTML = `
            <div style="max-width: 600px; width: 100%; background: rgba(255, 170, 0, 0.1); backdrop-filter: blur(10px); border-radius: 16px; padding: 40px; border: 1px solid rgba(255, 170, 0, 0.3);">
                <h1 style="font-size: 2.5rem; margin-bottom: 20px; color: #ffaa00;">Template Tidak Valid</h1>
                <p style="margin-bottom: 20px; font-size: 1.1rem;">
                    Subdomain "<strong style="color: #ffffff;">${subdomain}</strong>" tidak dikonfigurasi sebagai template.
                </p>
                <div style="margin-bottom: 30px;">
                    <p style="margin-bottom: 10px;">Template yang tersedia:</p>
                    <div style="margin-top: 15px;">
                        ${validTemplates}
                    </div>
                </div>
                <a href="https://dibungo.netlify.app" style="
                    display: inline-block;
                    padding: 14px 32px;
                    background: #ffaa00;
                    color: #000;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: 600;
                    transition: all 0.2s;">
                    Kembali ke Situs Utama
                </a>
            </div>
        `;
        
        document.body.appendChild(container);
    }
    
    // ==================== GLOBAL API ====================
    window.templatePreview = {
        reload: () => {
            if (state.currentTemplate) {
                state.loadedAssets.clear();
                state.cache.clear();
                const subdomain = state.currentTemplate.folder;
                loadTemplateWithRouting(subdomain, state.currentPage);
            }
        },
        clearCache: () => {
            state.cache.clear();
            console.log('✅ Template cache cleared');
        },
        getCurrentTemplate: () => state.currentTemplate,
        getCurrentPage: () => state.currentPage,
        navigateToPage: (pageName) => {
            if (state.currentTemplate) {
                loadTemplatePage(state.currentTemplate, pageName);
            }
        },
        getState: () => ({ ...state }),
        isTemplateMode: () => state.isTemplateMode
    };
    
    // ==================== INITIALIZE ====================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100); // Delay sedikit untuk pastikan semua ready
    }
    
})();