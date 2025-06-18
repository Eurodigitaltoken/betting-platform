import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

const HomePage = () => {
  const { t } = useTranslation();

  return (
    <div className="home-page">
      <header className="header">
        <div className="logo">
          <h1>{t('common.appName')}</h1>
        </div>
        <nav className="main-nav">
          <ul>
            <li><a href="/">{t('navigation.home')}</a></li>
            <li><a href="/sports">{t('navigation.sports')}</a></li>
            <li><a href="/live">{t('navigation.live')}</a></li>
            <li><a href="/account">{t('navigation.account')}</a></li>
            <li><a href="/bets">{t('navigation.bets')}</a></li>
            <li><a href="/wallet">{t('navigation.wallet')}</a></li>
          </ul>
        </nav>
        <div className="user-controls">
          <LanguageSwitcher />
          <button className="login-button">{t('account.login')}</button>
          <button className="register-button">{t('account.register')}</button>
        </div>
      </header>

      <main>
        <section className="sports-navigation">
          <h2>{t('sports.all')}</h2>
          <ul className="sports-list">
            <li><a href="/sports/football">{t('sports.football')}</a></li>
            <li><a href="/sports/basketball">{t('sports.basketball')}</a></li>
            <li><a href="/sports/tennis">{t('sports.tennis')}</a></li>
            <li><a href="/sports/nfl">{t('sports.nfl')}</a></li>
            <li><a href="/sports/hockey">{t('sports.hockey')}</a></li>
          </ul>
        </section>

        <section className="featured-events">
          <h2>Featured Events</h2>
          <div className="events-container">
            {/* Event cards will be dynamically loaded here */}
            <div className="event-placeholder">{t('common.loading')}</div>
          </div>
        </section>

        <section className="live-events">
          <h2>{t('navigation.live')}</h2>
          <div className="events-container">
            {/* Live event cards will be dynamically loaded here */}
            <div className="event-placeholder">{t('common.loading')}</div>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-content">
          <div className="footer-logo">
            <h3>{t('common.appName')}</h3>
          </div>
          <div className="footer-links">
            <ul>
              <li><a href="/about">About Us</a></li>
              <li><a href="/terms">Terms & Conditions</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/responsible-gambling">Responsible Gambling</a></li>
              <li><a href="/contact">Contact Us</a></li>
            </ul>
          </div>
          <div className="footer-disclaimer">
            <p>© 2025 {t('common.appName')}. All rights reserved.</p>
            <p>Gambling can be addictive. Please gamble responsibly.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
