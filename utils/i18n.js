import { translations } from './translations.js';

export class I18n {
    constructor() {
        this.currentLang = localStorage.getItem('language') || 'en';
        this.translations = translations;
        this.observers = [];
    }

    init() {
        this.loadLanguage(this.currentLang);
        this.bindLanguageSwitcher();
    }

    setLanguage(lang) {
        if (!this.translations[lang]) return;
        this.currentLang = lang;
        localStorage.setItem('language', lang);
        this.loadLanguage(lang);
        this.updateLanguageSelector();
    }

    loadLanguage(lang) {
        // Update DOM elements with data-i18n
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.dataset.i18n;
            if (this.translations[lang][key]) {
                // If it's an input with placeholder
                if (el.tagName === 'INPUT' && el.getAttribute('placeholder')) {
                    el.placeholder = this.translations[lang][key];
                } else {
                    el.textContent = this.translations[lang][key];
                }
            }
        });

        // Set text direction
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;

        // Trigger observers (for dynamic updates)
        this.observers.forEach(cb => cb(lang));
    }

    t(key) {
        return this.translations[this.currentLang][key] || key;
    }

    bindLanguageSwitcher() {
        const switcher = document.getElementById('languageSelect');
        if (switcher) {
            switcher.value = this.currentLang;
            switcher.addEventListener('change', (e) => this.setLanguage(e.target.value));
        }
    }

    onLanguageChange(callback) {
        this.observers.push(callback);
    }

    // Method to update language selector display
    updateLanguageSelector() {
        const selectBtn = document.getElementById('languageSelect');
        const currentFlag = document.getElementById('currentLangFlag');
        const currentText = document.getElementById('currentLangText');

        if (selectBtn && currentFlag && currentText) {
            const langs = {
                en: { name: 'English', flag: 'https://flagcdn.com/w20/gb.png', native: 'English' },
                fr: { name: 'Français', flag: 'https://flagcdn.com/w20/fr.png', native: 'Français' },
                ar: { name: 'العربية', flag: 'https://flagcdn.com/w20/sa.png', native: 'العربية' }
            };

            const langData = langs[this.currentLang];
            if (langData) {
                currentFlag.src = langData.flag;
                currentFlag.alt = langData.name;
                currentText.textContent = langData.native;
            }
        }

        // Update selected state in dropdown options
        const options = document.querySelectorAll('.lang-option');
        options.forEach(option => {
            const isSelected = option.dataset.lang === this.currentLang;
            option.setAttribute('aria-selected', isSelected);
            option.classList.toggle('selected', isSelected);
        });
    }
}

export const i18n = new I18n();
