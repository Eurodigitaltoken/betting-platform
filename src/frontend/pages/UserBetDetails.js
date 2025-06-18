import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Divider, 
  Chip,
  Box
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { fetchBetDetails } from '../services/ApiService';
import PaymentStatusCard from '../components/PaymentStatusCard';
import EventDetails from '../components/EventDetails';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  title: {
    marginBottom: theme.spacing(2)
  },
  section: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  chip: {
    margin: theme.spacing(0.5)
  },
  pending: {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText
  },
  settled: {
    backgroundColor: theme.palette.info.main,
    color: theme.palette.info.contrastText
  },
  partiallyPaid: {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.contrastText
  },
  fullyPaid: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText
  },
  cancelled: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText
  }
}));

const UserBetDetails = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { betId } = useParams();
  
  const [bet, setBet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const getBetDetails = async () => {
      try {
        setLoading(true);
        const data = await fetchBetDetails(betId);
        setBet(data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch bet details');
      } finally {
        setLoading(false);
      }
    };
    
    getBetDetails();
  }, [betId]);
  
  const getStatusChipClass = (status) => {
    switch (status) {
      case 'Pending':
        return classes.pending;
      case 'Settled':
        return classes.settled;
      case 'PartiallyPaid':
        return classes.partiallyPaid;
      case 'FullyPaid':
        return classes.fullyPaid;
      case 'Cancelled':
        return classes.cancelled;
      default:
        return '';
    }
  };
  
  if (loading) {
    return <LoadingIndicator />;
  }
  
  if (error) {
    return <ErrorMessage message={error} />;
  }
  
  if (!bet) {
    return <Typography>{t('bet.notFound', 'Bet not found')}</Typography>;
  }
  
  return (
    <Container maxWidth="md">
      <Typography variant="h4" className={classes.title}>
        {t('bet.details', 'Bet Details')}
      </Typography>
      
      <Paper className={classes.root}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6">
              {t('bet.id', 'Bet ID')}: {bet.id}
            </Typography>
            <Box mt={1}>
              <Chip 
                label={t(`bet.status.${bet.status.toLowerCase()}`, bet.status)}
                className={`${classes.chip} ${getStatusChipClass(bet.status)}`}
              />
              {bet.won && (
                <Chip 
                  label={t('bet.won', 'Won')}
                  className={classes.chip}
                  color="secondary"
                />
              )}
              {!bet.won && bet.status !== 'Pending' && (
                <Chip 
                  label={t('bet.lost', 'Lost')}
                  className={classes.chip}
                  color="default"
                />
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Divider />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1">
              {t('bet.amount', 'Bet Amount')}
            </Typography>
            <Typography variant="body1">
              {bet.amount} USDT
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1">
              {t('bet.potentialWin', 'Potential Win')}
            </Typography>
            <Typography variant="body1">
              {bet.potentialWin} USDT
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1">
              {t('bet.fee', 'Fee')}
            </Typography>
            <Typography variant="body1">
              {bet.fee} USDT ({bet.feePercentage}%)
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1">
              {t('bet.createdAt', 'Created At')}
            </Typography>
            <Typography variant="body1">
              {new Date(bet.createdAt).toLocaleString()}
            </Typography>
          </Grid>
          
          {bet.settledAt && (
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">
                {t('bet.settledAt', 'Settled At')}
              </Typography>
              <Typography variant="body1">
                {new Date(bet.settledAt).toLocaleString()}
              </Typography>
            </Grid>
          )}
          
          <Grid item xs={12}>
            <Divider />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="h6" className={classes.section}>
              {t('event.details', 'Event Details')}
            </Typography>
            <EventDetails eventId={bet.eventId} outcomeId={bet.outcomeId} />
          </Grid>
          
          {(bet.status === 'PartiallyPaid' || bet.status === 'FullyPaid') && (
            <>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" className={classes.section}>
                  {t('payment.status', 'Payment Status')}
                </Typography>
                <PaymentStatusCard betId={bet.id} />
              </Grid>
            </>
          )}
        </Grid>
      </Paper>
    </Container>
  );
};

export default UserBetDetails;
