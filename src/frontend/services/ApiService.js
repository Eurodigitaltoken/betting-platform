import axios from 'axios';
import { API_BASE_URL } from '../config';

// Existing API service functions...

/**
 * Fetch payment status for a specific bet
 * @param {string} betId - ID of the bet
 * @returns {Promise<Object>} - Payment status details
 */
export const fetchPaymentStatus = async (betId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/payment-status/${betId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment status:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch payment status');
  }
};

/**
 * Fetch all partial payments for a user
 * @param {string} userAddress - Ethereum address of the user
 * @returns {Promise<Array>} - List of partial payments
 */
export const fetchPartialPayments = async (userAddress) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/partial-payments/${userAddress}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching partial payments:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch partial payments');
  }
};

/**
 * Get payment queue position for a bet
 * @param {string} betId - ID of the bet
 * @returns {Promise<Object>} - Queue position details
 */
export const getPaymentQueuePosition = async (betId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/payment-queue-position/${betId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching queue position:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch queue position');
  }
};
