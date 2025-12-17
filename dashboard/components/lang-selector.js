import { i18n } from '../../utils/i18n.js';

// #region agent log
fetch('http://127.0.0.1:7242/ingest/51bd386d-7890-48ce-b218-932d7198e6e9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lang-selector.js:2',message:'i18n imported',data:{i18nExists:!!i18n,hasSetLanguage:!!i18n?.setLanguage},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
// #endregion

export class LangSelector {
    constructor() {
        this.isOpen = false;
        this.currentLang = 'en';
        this.langs = {
            en: { name: 'English', flag: 'https://flagcdn.com/w20/gb.png', native: 'English' },
            fr: { name: 'Français', flag: 'https://flagcdn.com/w20/fr.png', native: 'Français' },
            ar: { name: 'العربية', flag: 'https://flagcdn.com/w20/sa.png', native: 'العربية' }
        };

        this.init();
    }

    init() {
        this.bindElements();
        this.createOptionsIfNeeded();
        this.setupEventListeners();
        this.updateCurrentLanguage();
    }

    createOptionsIfNeeded() {
        // Check if options already exist
        const existingOptions = this.optionsContainer?.querySelectorAll('.lang-option');
        if (existingOptions && existingOptions.length > 0) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/51bd386d-7890-48ce-b218-932d7198e6e9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lang-selector.js:25',message:'Options already exist',data:{optionsCount:existingOptions.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
            // #endregion
            return;
        }

        // Create options dynamically
        if (!this.optionsContainer) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/51bd386d-7890-48ce-b218-932d7198e6e9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lang-selector.js:32',message:'Options container not found',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
            // #endregion
            return;
        }

        // Clear container
        this.optionsContainer.innerHTML = '';

        // Create options for each language
        Object.entries(this.langs).forEach(([code, lang]) => {
            const option = document.createElement('div');
            option.className = 'lang-option';
            option.setAttribute('data-lang', code);
            option.setAttribute('role', 'option');
            option.setAttribute('tabindex', '0');

            const flag = document.createElement('img');
            flag.src = lang.flag;
            flag.alt = lang.name;
            flag.className = 'lang-flag';

            const text = document.createElement('span');
            text.textContent = lang.native;

            option.appendChild(flag);
            option.appendChild(text);
            this.optionsContainer.appendChild(option);
        });

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/51bd386d-7890-48ce-b218-932d7198e6e9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lang-selector.js:55',message:'Options created dynamically',data:{optionsCount:this.optionsContainer.children.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
        // #endregion
    }

    bindElements() {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/51bd386d-7890-48ce-b218-932d7198e6e9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lang-selector.js:20',message:'bindElements called',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
        // #endregion
        this.selectBtn = document.getElementById('languageSelect');
        this.optionsContainer = document.getElementById('languageOptions');
        this.currentFlag = document.getElementById('currentLangFlag');
        this.currentText = document.getElementById('currentLangText');
        this.arrow = document.querySelector('.lang-select-arrow');
        
        // Check CSS styles after elements are bound
        if (this.selectBtn) {
            const computed = window.getComputedStyle(this.selectBtn);
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/51bd386d-7890-48ce-b218-932d7198e6e9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lang-selector.js:29',message:'Select button CSS check',data:{display:computed.display,width:computed.width,height:computed.height,padding:computed.padding,backgroundColor:computed.backgroundColor,border:computed.border,borderRadius:computed.borderRadius,boxShadow:computed.boxShadow,className:this.selectBtn.className},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
        }
        
        if (this.optionsContainer) {
            const computed = window.getComputedStyle(this.optionsContainer);
            const options = this.optionsContainer.querySelectorAll('.lang-option');
            const optionsArray = Array.from(options).map(opt => ({
                text: opt.textContent?.trim(),
                visible: opt.offsetParent !== null,
                display: window.getComputedStyle(opt).display,
                opacity: window.getComputedStyle(opt).opacity,
                height: window.getComputedStyle(opt).height
            }));
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/51bd386d-7890-48ce-b218-932d7198e6e9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lang-selector.js:35',message:'Options container CSS check',data:{display:computed.display,position:computed.position,width:computed.width,minWidth:computed.minWidth,backgroundColor:computed.backgroundColor,border:computed.border,borderRadius:computed.borderRadius,boxShadow:computed.boxShadow,padding:computed.padding,overflow:computed.overflow,overflowY:computed.overflowY,className:this.optionsContainer.className,optionsCount:options.length,options:optionsArray},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
        }
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/51bd386d-7890-48ce-b218-932d7198e6e9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lang-selector.js:41',message:'Elements bound',data:{selectBtn:!!this.selectBtn,optionsContainer:!!this.optionsContainer,arrow:!!this.arrow,optionsContainerClasses:this.optionsContainer?.className||'null'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
        // #endregion
    }

    setupEventListeners() {
        const isMobile = window.innerWidth <= 768;
        this.isMobile = isMobile;
        this.clickHandled = false; // Flag to prevent document click from closing immediately
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/51bd386d-7890-48ce-b218-932d7198e6e9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lang-selector.js:28',message:'setupEventListeners called',data:{isMobile,windowWidth:window.innerWidth,selectBtnExists:!!this.selectBtn,optionsContainerExists:!!this.optionsContainer},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion

        // Click/tap interaction for both desktop and mobile
        this.selectBtn?.addEventListener('click', (e) => {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/51bd386d-7890-48ce-b218-932d7198e6e9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lang-selector.js:34',message:'Select button clicked',data:{isMobile,currentIsOpen:this.isOpen,target:e.target?.className},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            this.clickHandled = true;
            this.toggleDropdown();
            // Reset flag after a short delay
            setTimeout(() => {
                this.clickHandled = false;
            }, 300);
        }, true); // Use capture phase to handle before document click

        // Desktop hover behavior - simpler and cleaner
        if (!isMobile) {
            let closeTimeout;

            this.selectBtn?.addEventListener('mouseenter', () => {
                clearTimeout(closeTimeout);
                this.openDropdown();
            });

            this.selectBtn?.addEventListener('mouseleave', () => {
                closeTimeout = setTimeout(() => {
                    if (!this.optionsContainer?.matches(':hover')) {
                        this.closeDropdown();
                    }
                }, 150);
            });

            this.optionsContainer?.addEventListener('mouseenter', () => {
                clearTimeout(closeTimeout);
            });

            this.optionsContainer?.addEventListener('mouseleave', () => {
                closeTimeout = setTimeout(() => {
                    this.closeDropdown();
                }, 150);
            });
        }

        // Close dropdown when clicking outside (use capture: false to run after button click)
        document.addEventListener('click', (e) => {
            // Skip if click was just handled by button (prevents immediate close on mobile)
            if (this.clickHandled) {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/51bd386d-7890-48ce-b218-932d7198e6e9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lang-selector.js:69',message:'Document click handler - skipped (clickHandled)',data:{clickHandled:this.clickHandled,isOpen:this.isOpen},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                // #endregion
                return;
            }
            
            // Don't close if clicking on the button or dropdown itself
            const clickedOnButton = this.selectBtn?.contains(e.target);
            const clickedOnDropdown = this.optionsContainer?.contains(e.target);
            const isOutside = !clickedOnButton && !clickedOnDropdown;
            
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/51bd386d-7890-48ce-b218-932d7198e6e9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lang-selector.js:69',message:'Document click handler',data:{isOutside,isOpen:this.isOpen,targetClassName:e.target?.className,isMobile,clickedOnButton,clickedOnDropdown,clickHandled:this.clickHandled},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            
            // Only close if clicking outside AND dropdown is open
            if (isOutside && this.isOpen) {
                this.closeDropdown();
            }
        }, false); // Use bubble phase (after capture phase)

        // Handle keyboard navigation
        this.selectBtn?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleDropdown();
            } else if (e.key === 'Escape') {
                this.closeDropdown();
            } else if (e.key === 'ArrowDown' && !this.isOpen) {
                e.preventDefault();
                this.openDropdown();
            }
        });

        // Handle option selection
        this.optionsContainer?.addEventListener('click', (e) => {
            const option = e.target.closest('.lang-option');
            if (option) {
                const langCode = option.dataset.lang;
                this.selectLanguage(langCode);
                this.closeDropdown();
            }
        });

        // Handle keyboard navigation in options
        this.optionsContainer?.addEventListener('keydown', (e) => {
            const options = Array.from(this.optionsContainer.querySelectorAll('.lang-option'));
            const currentIndex = options.findIndex(opt => opt === document.activeElement);

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const nextIndex = (currentIndex + 1) % options.length;
                options[nextIndex].focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prevIndex = currentIndex <= 0 ? options.length - 1 : currentIndex - 1;
                options[prevIndex].focus();
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (document.activeElement.classList.contains('lang-option')) {
                    const langCode = document.activeElement.dataset.lang;
                    this.selectLanguage(langCode);
                    this.closeDropdown();
                }
            } else if (e.key === 'Escape') {
                this.closeDropdown();
                this.selectBtn.focus();
            }
        });

        // Handle touch events for mobile
        this.selectBtn?.addEventListener('touchstart', (e) => {
            if (!this.isOpen) {
                e.preventDefault();
                this.openDropdown();
            }
        }, { passive: false });
    }

    toggleDropdown() {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/51bd386d-7890-48ce-b218-932d7198e6e9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lang-selector.js:131',message:'toggleDropdown called',data:{currentIsOpen:this.isOpen,optionsContainerExists:!!this.optionsContainer},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        if (this.isOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }

    openDropdown() {
        if (this.isOpen) return;

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/51bd386d-7890-48ce-b218-932d7198e6e9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lang-selector.js:139',message:'openDropdown called - BEFORE',data:{optionsContainerExists:!!this.optionsContainer,optionsContainerClassesBefore:this.optionsContainer?.className||'null',selectBtnExists:!!this.selectBtn},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion

        this.isOpen = true;
        this.selectBtn?.setAttribute('aria-expanded', 'true');
        this.optionsContainer?.classList.add('open');
        this.selectBtn?.classList.add('active');

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/51bd386d-7890-48ce-b218-932d7198e6e9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lang-selector.js:147',message:'openDropdown called - AFTER',data:{optionsContainerClassesAfter:this.optionsContainer?.className||'null',selectBtnClassesAfter:this.selectBtn?.className||'null',computedDisplay:this.optionsContainer?window.getComputedStyle(this.optionsContainer).display:'null',computedOpacity:this.optionsContainer?window.getComputedStyle(this.optionsContainer).opacity:'null',computedVisibility:this.optionsContainer?window.getComputedStyle(this.optionsContainer).visibility:'null'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B'})}).catch(()=>{});
        // #endregion

        // Check CSS after transition (300ms)
        setTimeout(() => {
            const options = this.optionsContainer?.querySelectorAll('.lang-option');
            const optionsArray = options ? Array.from(options).map(opt => ({
                text: opt.textContent?.trim(),
                visible: opt.offsetParent !== null,
                display: window.getComputedStyle(opt).display,
                opacity: window.getComputedStyle(opt).opacity,
                height: window.getComputedStyle(opt).height,
                computedVisibility: window.getComputedStyle(opt).visibility
            })) : [];
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/51bd386d-7890-48ce-b218-932d7198e6e9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lang-selector.js:157',message:'openDropdown - CSS after transition',data:{computedOpacity:this.optionsContainer?window.getComputedStyle(this.optionsContainer).opacity:'null',computedVisibility:this.optionsContainer?window.getComputedStyle(this.optionsContainer).visibility:'null',hasOpenClass:this.optionsContainer?.classList.contains('open'),optionsCount:options?.length||0,options:optionsArray,containerOverflow:this.optionsContainer?window.getComputedStyle(this.optionsContainer).overflow:'null'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
        }, 300);

        // Focus first option for keyboard navigation
        const firstOption = this.optionsContainer?.querySelector('.lang-option');
        if (firstOption) {
            setTimeout(() => firstOption.focus(), 150);
        }
    }

    closeDropdown() {
        if (!this.isOpen) return;

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/51bd386d-7890-48ce-b218-932d7198e6e9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lang-selector.js:159',message:'closeDropdown called',data:{optionsContainerClassesBefore:this.optionsContainer?.className||'null'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion

        this.isOpen = false;
        this.selectBtn?.setAttribute('aria-expanded', 'false');
        this.optionsContainer?.classList.remove('open');
        this.selectBtn?.classList.remove('active');

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/51bd386d-7890-48ce-b218-932d7198e6e9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lang-selector.js:167',message:'closeDropdown called - AFTER',data:{optionsContainerClassesAfter:this.optionsContainer?.className||'null'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
    }

    selectLanguage(langCode) {
        if (!this.langs[langCode]) return;

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/51bd386d-7890-48ce-b218-932d7198e6e9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lang-selector.js:235',message:'selectLanguage called',data:{langCode,i18nExists:!!i18n,hasSetLanguage:!!i18n?.setLanguage},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion

        // Use i18n directly (imported at top of file)
        if (i18n && i18n.setLanguage) {
            i18n.setLanguage(langCode);
        } else {
            console.error('i18n not available');
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/51bd386d-7890-48ce-b218-932d7198e6e9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lang-selector.js:242',message:'i18n not available error',data:{langCode},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
        }
    }

    updateCurrentLanguage() {
        // Get current language from localStorage or default
        this.currentLang = localStorage.getItem('language') || 'en';

        const langData = this.langs[this.currentLang];
        if (langData && this.currentFlag && this.currentText) {
            this.currentFlag.src = langData.flag;
            this.currentFlag.alt = langData.name;
            this.currentText.textContent = langData.native;
        }

        // Update selected state in dropdown
        const options = this.optionsContainer?.querySelectorAll('.lang-option');
        options?.forEach(option => {
            const isSelected = option.dataset.lang === this.currentLang;
            option.setAttribute('aria-selected', isSelected);
            option.classList.toggle('selected', isSelected);
        });
    }

    // Method to refresh language display (called by i18n)
    refresh() {
        this.updateCurrentLanguage();
    }
}
