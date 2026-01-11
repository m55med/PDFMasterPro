import { i18n } from '../../utils/i18n.js';

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
        const existingOptions = this.optionsContainer?.querySelectorAll('.lang-option');
        if (existingOptions && existingOptions.length > 0) {
            return;
        }

        if (!this.optionsContainer) {
            return;
        }

        this.optionsContainer.innerHTML = '';

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
    }

    bindElements() {
        this.selectBtn = document.getElementById('languageSelect');
        this.optionsContainer = document.getElementById('languageOptions');
        this.currentFlag = document.getElementById('currentLangFlag');
        this.currentText = document.getElementById('currentLangText');
        this.arrow = document.querySelector('.lang-select-arrow');
    }

    setupEventListeners() {
        const isMobile = window.innerWidth <= 768;
        this.isMobile = isMobile;
        this.clickHandled = false;

        this.selectBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            this.clickHandled = true;
            this.toggleDropdown();
            setTimeout(() => {
                this.clickHandled = false;
            }, 300);
        }, true);

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

        document.addEventListener('click', (e) => {
            if (this.clickHandled) {
                return;
            }

            const clickedOnButton = this.selectBtn?.contains(e.target);
            const clickedOnDropdown = this.optionsContainer?.contains(e.target);
            const isOutside = !clickedOnButton && !clickedOnDropdown;

            if (isOutside && this.isOpen) {
                this.closeDropdown();
            }
        }, false);

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

        this.optionsContainer?.addEventListener('click', (e) => {
            const option = e.target.closest('.lang-option');
            if (option) {
                const langCode = option.dataset.lang;
                this.selectLanguage(langCode);
                this.closeDropdown();
            }
        });

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

        this.selectBtn?.addEventListener('touchstart', (e) => {
            if (!this.isOpen) {
                e.preventDefault();
                this.openDropdown();
            }
        }, { passive: false });
    }

    toggleDropdown() {
        if (this.isOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }

    openDropdown() {
        if (this.isOpen) return;

        this.isOpen = true;
        this.selectBtn?.setAttribute('aria-expanded', 'true');
        this.optionsContainer?.classList.add('open');
        this.selectBtn?.classList.add('active');

        const firstOption = this.optionsContainer?.querySelector('.lang-option');
        if (firstOption) {
            setTimeout(() => firstOption.focus(), 150);
        }
    }

    closeDropdown() {
        if (!this.isOpen) return;

        this.isOpen = false;
        this.selectBtn?.setAttribute('aria-expanded', 'false');
        this.optionsContainer?.classList.remove('open');
        this.selectBtn?.classList.remove('active');
    }

    selectLanguage(langCode) {
        if (!this.langs[langCode]) return;

        if (i18n && i18n.setLanguage) {
            i18n.setLanguage(langCode);
        } else {
            console.error('i18n not available');
        }
    }

    updateCurrentLanguage() {
        this.currentLang = localStorage.getItem('language') || 'en';

        const langData = this.langs[this.currentLang];
        if (langData && this.currentFlag && this.currentText) {
            this.currentFlag.src = langData.flag;
            this.currentFlag.alt = langData.name;
            this.currentText.textContent = langData.native;
        }

        const options = this.optionsContainer?.querySelectorAll('.lang-option');
        options?.forEach(option => {
            const isSelected = option.dataset.lang === this.currentLang;
            option.setAttribute('aria-selected', isSelected);
            option.classList.toggle('selected', isSelected);
        });
    }

    refresh() {
        this.updateCurrentLanguage();
    }
}
