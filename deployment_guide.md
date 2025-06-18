# Deployment Guide for Betting Platform

This guide provides instructions for deploying the betting platform to test and production environments.

## Prerequisites

- Heroku account for backend deployment
- Vercel account for frontend deployment
- MongoDB Atlas account for database
- Infura account for Ethereum network access
- Sepolia testnet ETH for contract deployment

## Backend Deployment to Heroku

1. Install Heroku CLI:
```bash
npm install -g heroku
```

2. Login to Heroku:
```bash
heroku login
```

3. Create a new Heroku app:
```bash
heroku create betting-platform-backend
```

4. Set environment variables:
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_production_jwt_secret_key
heroku config:set INFURA_API_KEY=your_infura_api_key
heroku config:set DB_URI=mongodb+srv://username:password@cluster0.mongodb.net/betting_platform
heroku config:set PLATFORM_WALLET=0x3AbA3Eb93572e77fD9bAABAD2EA26123750fECf3
heroku config:set ADMIN_FEE_WALLET=0xE4A87598050D7877a79E2BEff12A25Be636c557e
heroku config:set USDT_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
heroku config:set BETTING_CONTRACT_ADDRESS=0x0987654321098765432109876543210987654321
heroku config:set ODDS_API_KEY=your_odds_api_key
heroku config:set CORS_ORIGIN=https://betting-platform-frontend.vercel.app
```

5. Deploy to Heroku:
```bash
git push heroku main
```

6. Ensure at least one instance is running:
```bash
heroku ps:scale web=1
```

7. Open the app:
```bash
heroku open
```

## Frontend Deployment to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Navigate to frontend directory:
```bash
cd src/frontend
```

4. Create a `vercel.json` file:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "build" }
    }
  ],
  "routes": [
    { "src": "/static/(.*)", "dest": "/static/$1" },
    { "src": "/favicon.ico", "dest": "/favicon.ico" },
    { "src": "/manifest.json", "dest": "/manifest.json" },
    { "src": "/asset-manifest.json", "dest": "/asset-manifest.json" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

5. Set environment variables in Vercel:
```bash
vercel env add REACT_APP_API_URL
vercel env add REACT_APP_WS_URL
vercel env add REACT_APP_NETWORK_ID
vercel env add REACT_APP_INFURA_ID
vercel env add REACT_APP_USDT_CONTRACT_ADDRESS
vercel env add REACT_APP_BETTING_CONTRACT_ADDRESS
vercel env add REACT_APP_PLATFORM_WALLET
vercel env add REACT_APP_ADMIN_FEE_WALLET
```

6. Deploy to Vercel:
```bash
vercel --prod
```

## Smart Contract Deployment to Sepolia Testnet

1. Configure Hardhat for Sepolia:
```javascript
// hardhat.config.js
module.exports = {
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

2. Deploy the contract:
```bash
npx hardhat run src/blockchain/scripts/deploy_partial_payouts.js --network sepolia
```

3. Update contract address in both backend and frontend environments.

## Domain and SSL Configuration

### Custom Domain (Optional)

1. Purchase a domain from a domain registrar
2. Configure DNS settings to point to Heroku and Vercel

### SSL Configuration

1. Heroku automatically provides SSL for all apps
2. Vercel automatically provides SSL for all deployments

## Testing the Deployment

1. Verify backend API is accessible:
```
curl https://betting-platform-backend.herokuapp.com/api/health
```

2. Verify frontend is accessible:
```
curl https://betting-platform-frontend.vercel.app
```

3. Test WebSocket connection
4. Test blockchain interaction

## Troubleshooting

### Backend Issues

- Check Heroku logs:
```bash
heroku logs --tail
```

### Frontend Issues

- Check Vercel deployment logs in the Vercel dashboard
- Verify environment variables are correctly set

### Contract Issues

- Verify contract deployment on Sepolia Etherscan
- Check contract ABI matches the deployed contract

## Maintenance

### Updating the Backend

```bash
git push heroku main
```

### Updating the Frontend

```bash
vercel --prod
```

### Monitoring

- Set up Heroku metrics dashboard
- Configure Vercel analytics
- Monitor contract events on Etherscan
