import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const Web3Integration = () => {
  const { t } = useTranslation();
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState(0);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window.ethereum !== 'undefined';
  };

  // Connect to MetaMask
  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      setError('MetaMask is not installed. Please install MetaMask to use this feature.');
      return;
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      setIsConnected(true);
      
      // Get USDT balance (mock implementation)
      setBalance(500.25); // In a real implementation, this would call a contract method
      
      setSuccess('Wallet connected successfully!');
      setError('');
    } catch (error) {
      setError('Failed to connect wallet: ' + error.message);
    }
  };

  // Handle deposit
  const handleDeposit = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(depositAmount) > 9999) {
      setError('Maximum deposit amount is 9999 USDT');
      return;
    }

    try {
      // In a real implementation, this would call a contract method to transfer USDT
      setSuccess(`Deposited ${depositAmount} USDT successfully!`);
      setBalance(prevBalance => prevBalance + parseFloat(depositAmount));
      setDepositAmount('');
      setError('');
    } catch (error) {
      setError('Deposit failed: ' + error.message);
    }
  };

  // Handle withdraw
  const handleWithdraw = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(withdrawAmount) > balance) {
      setError('Insufficient balance');
      return;
    }

    try {
      // In a real implementation, this would call a contract method to transfer USDT
      setSuccess(`Withdrawn ${withdrawAmount} USDT successfully!`);
      setBalance(prevBalance => prevBalance - parseFloat(withdrawAmount));
      setWithdrawAmount('');
      setError('');
    } catch (error) {
      setError('Withdrawal failed: ' + error.message);
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (isMetaMaskInstalled()) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount('');
          setIsConnected(false);
        }
      });
    }

    return () => {
      if (isMetaMaskInstalled()) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  return (
    <div className="web3-integration">
      <h2>{t('wallet.address')}</h2>
      
      {!isConnected ? (
        <div className="connect-wallet">
          <button className="connect-button" onClick={connectWallet}>
            Connect MetaMask
          </button>
          <p className="wallet-info">
            Connect your Ethereum wallet to deposit and withdraw USDT
          </p>
        </div>
      ) : (
        <div className="wallet-connected">
          <div className="account-info">
            <p className="account-address">
              <strong>{t('wallet.address')}:</strong> {account}
            </p>
            <p className="account-balance">
              <strong>{t('wallet.balance')}:</strong> {balance} USDT
            </p>
          </div>
          
          <div className="wallet-actions">
            <div className="deposit-section">
              <h3>{t('account.deposit')}</h3>
              <div className="amount-input">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Amount in USDT"
                  min="1"
                  max="9999"
                />
                <button onClick={handleDeposit}>{t('account.deposit')}</button>
              </div>
              <p className="deposit-info">
                {t('betting.maxBet')}
              </p>
            </div>
            
            <div className="withdraw-section">
              <h3>{t('account.withdraw')}</h3>
              <div className="amount-input">
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Amount in USDT"
                  min="1"
                  max={balance}
                />
                <button onClick={handleWithdraw}>{t('account.withdraw')}</button>
              </div>
              <p className="withdraw-info">
                Available balance: {balance} USDT
              </p>
            </div>
          </div>
          
          <div className="transaction-info">
            <p>
              All transactions are processed on the Ethereum blockchain using USDT (ERC-20).
              A 2% fee is applied to all bets.
            </p>
          </div>
        </div>
      )}
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
    </div>
  );
};

export default Web3Integration;
