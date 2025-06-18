import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Snackbar, 
  IconButton, 
  Typography,
  Box
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import CloseIcon from '@material-ui/icons/Close';
import { useSocket } from '../hooks/useSocket';

const PaymentNotifications = () => {
  const { t } = useTranslation();
  const socket = useSocket();
  
  const [notification, setNotification] = useState(null);
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
    if (!socket) return;
    
    const handlePaymentUpdate = (update) => {
      setNotification(update);
      setOpen(true);
    };
    
    socket.on('paymentUpdate', handlePaymentUpdate);
    
    return () => {
      socket.off('paymentUpdate', handlePaymentUpdate);
    };
  }, [socket]);
  
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };
  
  const getNotificationContent = () => {
    if (!notification) return null;
    
    switch (notification.type) {
      case 'partialPayment':
        return (
          <Box>
            <Typography variant="subtitle1">
              {t('notification.partialPayment.title', 'Partial Payment Received')}
            </Typography>
            <Typography variant="body2">
              {t('notification.partialPayment.message', 'You received {{amount}} USDT ({{percentage}}% of your winnings)', {
                amount: notification.paidAmount,
                percentage: notification.paymentPercentage
              })}
            </Typography>
          </Box>
        );
      
      case 'fullPayment':
        return (
          <Box>
            <Typography variant="subtitle1">
              {t('notification.fullPayment.title', 'Full Payment Received')}
            </Typography>
            <Typography variant="body2">
              {t('notification.fullPayment.message', 'You received your full winnings of {{amount}} USDT', {
                amount: notification.totalAmount
              })}
            </Typography>
          </Box>
        );
      
      case 'addedToQueue':
        return (
          <Box>
            <Typography variant="subtitle1">
              {t('notification.addedToQueue.title', 'Payment Queued')}
            </Typography>
            <Typography variant="body2">
              {t('notification.addedToQueue.message', 'Your payment of {{amount}} USDT has been queued and will be processed as funds become available', {
                amount: notification.pendingAmount
              })}
            </Typography>
          </Box>
        );
      
      default:
        return null;
    }
  };
  
  const getSeverity = () => {
    if (!notification) return 'info';
    
    switch (notification.type) {
      case 'fullPayment':
        return 'success';
      case 'partialPayment':
        return 'info';
      case 'addedToQueue':
        return 'warning';
      default:
        return 'info';
    }
  };
  
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert 
        onClose={handleClose} 
        severity={getSeverity()}
        action={
          <IconButton size="small" color="inherit" onClick={handleClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        {getNotificationContent()}
      </Alert>
    </Snackbar>
  );
};

export default PaymentNotifications;
