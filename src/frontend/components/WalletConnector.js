import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useWeb3Integration from '../hooks/useWeb3Integration';

const WalletConnector = () => {
  const { t } = useTranslation();
  const { 
    isConnected, 
    account, 
    walletType,
    connectWallet, 
    disconnectWallet, 
    isLoading, 
    error, 
    success,
    showQRCode,
    qrCodeValue,
    mewConnectUrl
  } = useWeb3Integration();
  
  const [showOptions, setShowOptions] = useState(false);
  const [showMobileOptions, setShowMobileOptions] = useState(false);

  // Handle connect wallet button click
  const handleConnectClick = () => {
    if (isConnected) {
      disconnectWallet();
    } else {
      setShowOptions(true);
      setShowMobileOptions(false);
    }
  };

  // Handle wallet selection
  const handleWalletSelect = async (type) => {
    await connectWallet(type);
    setShowOptions(false);
    setShowMobileOptions(false);
  };

  // Handle mobile options toggle
  const handleMobileOptionsToggle = () => {
    setShowMobileOptions(!showMobileOptions);
  };

  // Get wallet icon based on wallet type
  const getWalletIcon = (type) => {
    switch(type) {
      case 'metamask':
        return '/images/metamask-logo.svg';
      case 'metamaskmobile':
        return '/images/metamask-logo.svg';
      case 'mew':
        return '/images/mew-logo.svg';
      case 'mewmobile':
        return '/images/mew-logo.svg';
      default:
        return '/images/wallet-icon.svg';
    }
  };

  // Get wallet name based on wallet type
  const getWalletName = (type) => {
    switch(type) {
      case 'metamask':
        return 'MetaMask';
      case 'metamaskmobile':
        return 'MetaMask Mobile';
      case 'mew':
        return 'MyEtherWallet';
      case 'mewmobile':
        return 'MEW Mobile';
      default:
        return 'Wallet';
    }
  };

  return (
    <div className="wallet-connector">
      {isConnected ? (
        <div className="connected-wallet">
          <div className="wallet-info">
            <div className="wallet-type">
              <img 
                src={getWalletIcon(walletType)} 
                alt={getWalletName(walletType)} 
                className="wallet-icon" 
              />
              <span className="wallet-name">{getWalletName(walletType)}</span>
              <span className="wallet-address">
                {account.substring(0, 6)}...{account.substring(account.length - 4)}
              </span>
            </div>
            <button 
              onClick={handleConnectClick}
              className="disconnect-button"
              disabled={isLoading}
            >
              {t('wallet.disconnect', 'Disconnect')}
            </button>
          </div>
        </div>
      ) : (
        <div className="connect-wallet">
          {showOptions ? (
            <div className="wallet-options">
              <h3>{t('wallet.selectWallet', 'Select Wallet')}</h3>
              
              <div className="wallet-category">
                <h4>{t('wallet.browserWallets', 'Browser Wallets')}</h4>
                <div className="wallet-list">
                  <button 
                    onClick={() => handleWalletSelect('metamask')}
                    className="wallet-option"
                    disabled={isLoading}
                  >
                    <img src="/images/metamask-logo.svg" alt="MetaMask" />
                    <span>MetaMask</span>
                  </button>
                  <button 
                    onClick={() => handleWalletSelect('mew')}
                    className="wallet-option"
                    disabled={isLoading}
                  >
                    <img src="/images/mew-logo.svg" alt="MyEtherWallet" />
                    <span>MyEtherWallet</span>
                  </button>
                </div>
              </div>
              
              <div className="wallet-category">
                <h4>{t('wallet.mobileWallets', 'Mobile Wallets')}</h4>
                <div className="wallet-list">
                  <button 
                    onClick={() => handleWalletSelect('metamaskmobile')}
                    className="wallet-option"
                    disabled={isLoading}
                  >
                    <img src="/images/metamask-logo.svg" alt="MetaMask Mobile" />
                    <span>MetaMask Mobile</span>
                  </button>
                  <button 
                    onClick={() => handleWalletSelect('mewmobile')}
                    className="wallet-option"
                    disabled={isLoading}
                  >
                    <img src="/images/mew-logo.svg" alt="MEW Mobile" />
                    <span>MEW Mobile</span>
                  </button>
                </div>
              </div>
              
              <button 
                onClick={() => setShowOptions(false)}
                className="cancel-button"
              >
                {t('common.cancel', 'Cancel')}
              </button>
            </div>
          ) : showQRCode ? (
            <div className="qr-code-container">
              <h3>{t('wallet.scanQRCode', 'Scan QR Code with your Mobile Wallet')}</h3>
              <div className="qr-code">
                {qrCodeValue && (
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeValue)}`} 
                    alt="QR Code for wallet connection" 
                  />
                )}
              </div>
              <p className="qr-code-instructions">
                {walletType === 'mewmobile' 
                  ? t('wallet.mewMobileInstructions', 'Open your MEW mobile app and scan this QR code to connect')
                  : t('wallet.metamaskMobileInstructions', 'Open your MetaMask mobile app and scan this QR code to connect')}
              </p>
              {mewConnectUrl && walletType === 'mewmobile' && (
                <div className="mew-connect-url">
                  <p>{t('wallet.orUseLink', 'Or use this link:')}</p>
                  <a href={mewConnectUrl} target="_blank" rel="noopener noreferrer">
                    {t('wallet.openMEWMobile', 'Open MEW Mobile App')}
                  </a>
                </div>
              )}
              <button 
                onClick={() => setShowOptions(true)}
                className="back-button"
              >
                {t('common.back', 'Back')}
              </button>
            </div>
          ) : (
            <button 
              onClick={handleConnectClick}
              className="connect-button"
              disabled={isLoading}
            >
              {isLoading ? t('wallet.connecting', 'Connecting...') : t('wallet.connect', 'Connect Wallet')}
            </button>
          )}
        </div>
      )}
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
    </div>
  );
};

export default WalletConnector;
