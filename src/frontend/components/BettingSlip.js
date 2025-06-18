import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const BettingSlip = ({ selectedBets, odds, onPlaceBet, onRemoveBet }) => {
  const { t } = useTranslation();
  const [betAmount, setBetAmount] = useState('');
  const [potentialWin, setPotentialWin] = useState(0);
  const [fee, setFee] = useState(0);
  const [totalOdds, setTotalOdds] = useState(1);
  const [error, setError] = useState('');

  // Calculate total odds whenever selected bets change
  useEffect(() => {
    if (selectedBets.length === 0) {
      setTotalOdds(1);
      return;
    }

    let newTotalOdds = 1;
    selectedBets.forEach(bet => {
      const betOdds = odds[bet.eventId]?.[bet.selection] || 1;
      newTotalOdds *= betOdds;
    });

    setTotalOdds(newTotalOdds);
  }, [selectedBets, odds]);

  // Calculate potential win and fee whenever bet amount or total odds change
  useEffect(() => {
    if (!betAmount || isNaN(betAmount) || parseFloat(betAmount) <= 0) {
      setPotentialWin(0);
      setFee(0);
      return;
    }

    const amount = parseFloat(betAmount);
    
    // Calculate fee (5% of bet amount)
    const calculatedFee = amount * 0.05;
    setFee(calculatedFee);

    // Calculate potential win (amount * total odds)
    const calculatedWin = amount * totalOdds;
    setPotentialWin(calculatedWin);
  }, [betAmount, totalOdds]);

  // Handle bet amount change
  const handleBetAmountChange = (e) => {
    const value = e.target.value;
    setBetAmount(value);

    // Validate maximum bet amount
    if (parseFloat(value) > 9999) {
      setError(t('betting.maxBetError', 'Maximum bet amount is 9999 USDT'));
    } else {
      setError('');
    }
  };

  // Handle place bet button click
  const handlePlaceBet = () => {
    if (!betAmount || isNaN(betAmount) || parseFloat(betAmount) <= 0) {
      setError(t('betting.invalidAmountError', 'Please enter a valid amount'));
      return;
    }

    if (parseFloat(betAmount) > 9999) {
      setError(t('betting.maxBetError', 'Maximum bet amount is 9999 USDT'));
      return;
    }

    if (selectedBets.length === 0) {
      setError(t('betting.noBetsError', 'Please select at least one bet'));
      return;
    }

    // Call the onPlaceBet function passed from parent component
    onPlaceBet(selectedBets, parseFloat(betAmount), totalOdds);
    
    // Reset form
    setBetAmount('');
  };

  return (
    <div className="betting-slip bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold mb-4">{t('betting.bettingSlip', 'Betting Slip')}</h2>
      
      {selectedBets.length === 0 ? (
        <p className="text-gray-500">{t('betting.emptySlip', 'Your betting slip is empty')}</p>
      ) : (
        <>
          <div className="selected-bets mb-4">
            {selectedBets.map((bet, index) => (
              <div key={index} className="selected-bet p-2 mb-2 bg-gray-100 rounded flex justify-between items-center">
                <div>
                  <p className="font-medium">{bet.eventName}</p>
                  <p className="text-sm text-gray-600">{bet.selectionName} @ {odds[bet.eventId]?.[bet.selection].toFixed(2)}</p>
                </div>
                <button 
                  onClick={() => onRemoveBet(bet)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          
          <div className="bet-details mb-4">
            <div className="flex justify-between mb-2">
              <span>{t('betting.totalOdds', 'Total Odds')}:</span>
              <span className="font-bold">{totalOdds.toFixed(2)}</span>
            </div>
            
            <div className="mb-4">
              <label htmlFor="betAmount" className="block mb-1">{t('betting.betAmount', 'Bet Amount')} (USDT):</label>
              <input
                type="number"
                id="betAmount"
                value={betAmount}
                onChange={handleBetAmountChange}
                className="w-full p-2 border rounded"
                placeholder="Enter amount"
                min="0.1"
                max="9999"
                step="0.1"
              />
            </div>
            
            <div className="flex justify-between mb-2">
              <span>{t('betting.fee', 'Fee')} (5%):</span>
              <span>{fee.toFixed(2)} USDT</span>
            </div>
            
            <div className="flex justify-between mb-2">
              <span>{t('betting.potentialWin', 'Potential Win')}:</span>
              <span className="font-bold text-green-600">{potentialWin.toFixed(2)} USDT</span>
            </div>
          </div>
          
          {error && (
            <div className="error-message text-red-500 mb-4">
              {error}
            </div>
          )}
          
          <button
            onClick={handlePlaceBet}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {t('betting.placeBet', 'Place Bet')}
          </button>
        </>
      )}
    </div>
  );
};

export default BettingSlip;
