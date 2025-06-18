import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const AuthPage = () => {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = t('errors.required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('errors.invalidEmail');
    }
    
    if (!formData.password) {
      newErrors.password = t('errors.required');
    }
    
    if (!isLogin) {
      if (!formData.username) {
        newErrors.username = t('errors.required');
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = t('errors.required');
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = t('errors.passwordMismatch');
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // In a real implementation, this would call the backend API
      console.log('Form submitted:', formData);
      alert(isLogin ? 'Login successful!' : 'Registration successful!');
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>{isLogin ? t('account.login') : t('account.register')}</h2>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="username">{t('account.username')}</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={errors.username ? 'error' : ''}
              />
              {errors.username && <div className="error-message">{errors.username}</div>}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">{t('account.email')}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">{t('account.password')}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>
          
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">{t('account.confirmPassword')}</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
            </div>
          )}
          
          <button type="submit" className="auth-button">
            {isLogin ? t('account.login') : t('account.register')}
          </button>
        </form>
        
        <div className="auth-toggle">
          <p>
            {isLogin 
              ? "Don't have an account?" 
              : "Already have an account?"}
            <button 
              type="button" 
              className="toggle-button" 
              onClick={toggleAuthMode}
            >
              {isLogin ? t('account.register') : t('account.login')}
            </button>
          </p>
        </div>
        
        <div className="auth-separator">
          <span>OR</span>
        </div>
        
        <div className="ethereum-login">
          <button className="metamask-button">
            Connect with MetaMask
          </button>
          <p className="ethereum-info">
            Connect your Ethereum wallet to easily deposit and withdraw USDT
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
