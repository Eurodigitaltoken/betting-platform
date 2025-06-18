import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const UserAccount = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Mock user data for demonstration
  const [userData, setUserData] = useState({
    username: 'user123',
    email: 'user@example.com',
    balance: 500.25,
    ethereumAddress: '0x1234567890abcdef1234567890abcdef12345678',
    bets: [
      {
        id: 'bet1',
        date: '2025-05-20',
        event: 'Arsenal vs Chelsea',
        selection: 'home',
        odds: 2.1,
        stake: 50,
        status: 'won',
        payout: 105
      },
      {
        id: 'bet2',
        date: '2025-05-18',
        event: 'Lakers vs Celtics',
        selection: 'away',
        odds: 1.8,
        stake: 30,
        status: 'lost',
        payout: 0
      }
    ],
    transactions: [
      {
        id: 'tx1',
        date: '2025-05-15',
        type: 'deposit',
        amount: 200,
        status: 'completed',
        txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
      },
      {
        id: 'tx2',
        date: '2025-05-10',
        type: 'withdraw',
        amount: 100,
        status: 'completed',
        txHash: '0x0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba'
      }
    ]
  });

  const renderProfileTab = () => (
    <div className="profile-tab">
      <h3>{t('account.profile')}</h3>
      <div className="profile-info">
        <div className="info-row">
          <label>{t('account.username')}:</label>
          <span>{userData.username}</span>
        </div>
        <div className="info-row">
          <label>{t('account.email')}:</label>
          <span>{userData.email}</span>
        </div>
        <div className="info-row">
          <label>{t('wallet.address')}:</label>
          <span className="ethereum-address">{userData.ethereumAddress}</span>
        </div>
        <div className="info-row">
          <label>{t('account.balance')}:</label>
          <span className="balance">{userData.balance} USDT</span>
        </div>
      </div>
      <div className="profile-actions">
        <button className="edit-profile-button">{t('common.edit')}</button>
      </div>
    </div>
  );

  const renderBetsTab = () => (
    <div className="bets-tab">
      <h3>{t('navigation.bets')}</h3>
      <div className="bets-history">
        <table className="bets-table">
          <thead>
            <tr>
              <th>{t('wallet.date')}</th>
              <th>Event</th>
              <th>Selection</th>
              <th>{t('betting.odds')}</th>
              <th>{t('betting.stake')}</th>
              <th>{t('wallet.status')}</th>
              <th>Payout</th>
            </tr>
          </thead>
          <tbody>
            {userData.bets.map(bet => (
              <tr key={bet.id} className={`bet-row ${bet.status}`}>
                <td>{bet.date}</td>
                <td>{bet.event}</td>
                <td>{bet.selection === 'home' ? t('betting.homeWin') : 
                     bet.selection === 'draw' ? t('betting.draw') : 
                     t('betting.awayWin')}</td>
                <td>{bet.odds}</td>
                <td>{bet.stake} USDT</td>
                <td>{bet.status === 'won' ? 'Won' : 'Lost'}</td>
                <td>{bet.payout} USDT</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderWalletTab = () => (
    <div className="wallet-tab">
      <h3>{t('navigation.wallet')}</h3>
      <div className="wallet-balance">
        <h4>{t('wallet.balance')}</h4>
        <div className="balance-amount">{userData.balance} USDT</div>
      </div>
      <div className="wallet-actions">
        <button className="deposit-button">{t('account.deposit')}</button>
        <button className="withdraw-button">{t('account.withdraw')}</button>
      </div>
      <div className="transaction-history">
        <h4>{t('wallet.transactionHistory')}</h4>
        <table className="transactions-table">
          <thead>
            <tr>
              <th>{t('wallet.date')}</th>
              <th>{t('wallet.type')}</th>
              <th>{t('wallet.amount')}</th>
              <th>{t('wallet.status')}</th>
              <th>{t('wallet.txHash')}</th>
            </tr>
          </thead>
          <tbody>
            {userData.transactions.map(tx => (
              <tr key={tx.id} className={`transaction-row ${tx.type}`}>
                <td>{tx.date}</td>
                <td>{tx.type === 'deposit' ? t('account.deposit') : t('account.withdraw')}</td>
                <td>{tx.amount} USDT</td>
                <td>{tx.status === 'completed' ? t('wallet.completed') : 
                     tx.status === 'pending' ? t('wallet.pending') : 
                     t('wallet.failed')}</td>
                <td>
                  <a 
                    href={`https://etherscan.io/tx/${tx.txHash}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="tx-hash"
                  >
                    {tx.txHash.substring(0, 10)}...
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="user-account">
      <h2>{t('account.account')}</h2>
      <div className="account-tabs">
        <button 
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          {t('account.profile')}
        </button>
        <button 
          className={`tab-button ${activeTab === 'bets' ? 'active' : ''}`}
          onClick={() => setActiveTab('bets')}
        >
          {t('navigation.bets')}
        </button>
        <button 
          className={`tab-button ${activeTab === 'wallet' ? 'active' : ''}`}
          onClick={() => setActiveTab('wallet')}
        >
          {t('navigation.wallet')}
        </button>
      </div>
      <div className="tab-content">
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'bets' && renderBetsTab()}
        {activeTab === 'wallet' && renderWalletTab()}
      </div>
    </div>
  );
};

export default UserAccount;
