import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-switcher">
      <button 
        className={i18n.language === 'en' ? 'active' : ''} 
        onClick={() => changeLanguage('en')}
      >
        English
      </button>
      <button 
        className={i18n.language === 'fr' ? 'active' : ''} 
        onClick={() => changeLanguage('fr')}
      >
        Français
      </button>
      <button 
        className={i18n.language === 'es' ? 'active' : ''} 
        onClick={() => changeLanguage('es')}
      >
        Español
      </button>
    </div>
  );
};

export default LanguageSwitcher;
