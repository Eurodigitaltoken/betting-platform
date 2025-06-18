// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title USDTBettingPlatform
 * @dev Smart contract for betting with USDT on Ethereum blockchain with partial payout support
 */
contract USDTBettingPlatformWithPartialPayouts is Ownable, ReentrancyGuard {
    // Platform wallet address for receiving and paying out bets
    address public constant PLATFORM_WALLET = 0x3AbA3Eb93572e77fD9bAABAD2EA26123750fECf3;
    
    // Admin wallet address for receiving fees
    address public constant ADMIN_FEE_WALLET = 0xE4A87598050D7877a79E2BEff12A25Be636c557e;
    
    // USDT token interface
    IERC20 public usdtToken;
    
    // Fee percentage (5%)
    uint256 public constant FEE_PERCENTAGE = 5;
    
    // Maximum bet amount (9999 USDT)
    uint256 public constant MAX_BET_AMOUNT = 9999 * 10**6; // USDT has 6 decimals
    
    // Bet status enum (extended with partial payment statuses)
    enum BetStatus { Pending, Settled, PartiallyPaid, FullyPaid, Cancelled }
    
    // Bet struct (extended with payment tracking fields)
    struct Bet {
        uint256 id;
        address bettor;
        uint256 amount;
        uint256 potentialWin;
        uint256 fee;
        string eventId;
        string outcomeId;
        BetStatus status;
        bool won;
        uint256 createdAt;
        uint256 settledAt;
        
        // Payment tracking fields
        uint256 paidAmount;         // Amount already paid
        uint256 remainingAmount;    // Remaining amount to be paid
        uint256 lastPaymentTime;    // Time of last payment
        uint256 paymentPercentage;  // Percentage of paid amount (0-100)
    }
    
    // Mapping from bet ID to Bet
    mapping(uint256 => Bet) public bets;
    
    // Mapping from user address to their bet IDs
    mapping(address => uint256[]) public userBets;
    
    // Total number of bets
    uint256 public totalBets;
    
    // Total fees collected
    uint256 public totalFees;
    
    // Payment queue for partial payouts
    uint256[] public paymentQueue;
    
    // Mapping for quick access to position in payment queue
    mapping(uint256 => uint256) public paymentQueuePositions;
    
    // Events
    event BetPlaced(uint256 indexed betId, address indexed bettor, uint256 amount, string eventId, string outcomeId, uint256 potentialWin);
    event BetSettled(uint256 indexed betId, address indexed bettor, bool won, uint256 payout);
    event BetCancelled(uint256 indexed betId, address indexed bettor, uint256 refundAmount);
    event FeesWithdrawn(address indexed owner, uint256 amount);
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    
    // New events for partial payments
    event BetPartiallyPaid(uint256 indexed betId, address indexed bettor, uint256 paidAmount, uint256 remainingAmount, uint256 paymentPercentage);
    event BetFullyPaid(uint256 indexed betId, address indexed bettor, uint256 totalAmount);
    event BetAddedToPaymentQueue(uint256 indexed betId, address indexed bettor, uint256 pendingAmount);
    
    /**
     * @dev Constructor
     * @param _usdtToken Address of the USDT token contract
     */
    constructor(address _usdtToken) {
        usdtToken = IERC20(_usdtToken);
    }
    
    /**
     * @dev Place a bet
     * @param _amount Amount to bet in USDT (with 6 decimals)
     * @param _eventId ID of the event
     * @param _outcomeId ID of the outcome
     * @param _potentialWin Potential win amount
     */
    function placeBet(uint256 _amount, string memory _eventId, string memory _outcomeId, uint256 _potentialWin) external nonReentrant {
        require(_amount > 0, "Bet amount must be greater than 0");
        require(_amount <= MAX_BET_AMOUNT, "Bet amount exceeds maximum limit");
        
        // Calculate fee
        uint256 fee = (_amount * FEE_PERCENTAGE) / 100;
        uint256 totalAmount = _amount;
        
        // Transfer USDT from bettor to contract
        require(usdtToken.transferFrom(msg.sender, address(this), totalAmount), "USDT transfer failed");
        
        // Update total fees
        totalFees += fee;
        
        // Create new bet
        uint256 betId = totalBets++;
        Bet storage bet = bets[betId];
        bet.id = betId;
        bet.bettor = msg.sender;
        bet.amount = _amount;
        bet.potentialWin = _potentialWin;
        bet.fee = fee;
        bet.eventId = _eventId;
        bet.outcomeId = _outcomeId;
        bet.status = BetStatus.Pending;
        bet.createdAt = block.timestamp;
        
        // Initialize payment tracking fields
        bet.paidAmount = 0;
        bet.remainingAmount = 0;
        bet.lastPaymentTime = 0;
        bet.paymentPercentage = 0;
        
        // Add bet to user's bets
        userBets[msg.sender].push(betId);
        
        emit BetPlaced(betId, msg.sender, _amount, _eventId, _outcomeId, _potentialWin);
        
        // Process payment queue if there are pending payments
        if (paymentQueue.length > 0) {
            processPaymentQueue();
        }
    }
    
    /**
     * @dev Settle a bet with partial payment support
     * @param _betId ID of the bet
     * @param _won Whether the bet was won
     */
    function settleBet(uint256 _betId, bool _won) external onlyOwner nonReentrant {
        Bet storage bet = bets[_betId];
        require(bet.status == BetStatus.Pending, "Bet is not pending");
        
        bet.won = _won;
        bet.settledAt = block.timestamp;
        
        if (_won) {
            // Check available funds
            uint256 contractBalance = usdtToken.balanceOf(address(this)) - totalFees;
            
            if (contractBalance >= bet.potentialWin) {
                // Full payment
                require(usdtToken.transfer(bet.bettor, bet.potentialWin), "USDT transfer failed");
                bet.status = BetStatus.FullyPaid;
                bet.paidAmount = bet.potentialWin;
                bet.remainingAmount = 0;
                bet.paymentPercentage = 100;
                bet.lastPaymentTime = block.timestamp;
                
                emit BetFullyPaid(_betId, bet.bettor, bet.potentialWin);
            } else if (contractBalance > 0) {
                // Partial payment
                require(usdtToken.transfer(bet.bettor, contractBalance), "USDT transfer failed");
                bet.status = BetStatus.PartiallyPaid;
                bet.paidAmount = contractBalance;
                bet.remainingAmount = bet.potentialWin - contractBalance;
                bet.paymentPercentage = (contractBalance * 100) / bet.potentialWin;
                bet.lastPaymentTime = block.timestamp;
                
                // Add to payment queue
                addToPaymentQueue(_betId);
                
                emit BetPartiallyPaid(_betId, bet.bettor, contractBalance, bet.remainingAmount, bet.paymentPercentage);
            } else {
                // No funds available, just add to payment queue
                bet.status = BetStatus.PartiallyPaid;
                bet.paidAmount = 0;
                bet.remainingAmount = bet.potentialWin;
                bet.paymentPercentage = 0;
                bet.lastPaymentTime = block.timestamp;
                
                // Add to payment queue
                addToPaymentQueue(_betId);
                
                emit BetAddedToPaymentQueue(_betId, bet.bettor, bet.potentialWin);
            }
        } else {
            // Bet is lost
            bet.status = BetStatus.Settled;
            emit BetSettled(_betId, bet.bettor, false, 0);
        }
    }
    
    /**
     * @dev Add bet to payment queue
     * @param _betId ID of the bet
     */
    function addToPaymentQueue(uint256 _betId) private {
        paymentQueue.push(_betId);
        paymentQueuePositions[_betId] = paymentQueue.length - 1;
    }
    
    /**
     * @dev Process pending payments when new funds are available
     */
    function processPaymentQueue() public nonReentrant {
        require(paymentQueue.length > 0, "Payment queue is empty");
        
        uint256 contractBalance = usdtToken.balanceOf(address(this)) - totalFees;
        require(contractBalance > 0, "No funds available for payments");
        
        uint256 processedCount = 0;
        uint256 maxProcessCount = 10; // Limit for gas optimization
        
        while (paymentQueue.length > 0 && processedCount < maxProcessCount && contractBalance > 0) {
            uint256 betId = paymentQueue[0];
            Bet storage bet = bets[betId];
            
            if (bet.status != BetStatus.PartiallyPaid || bet.remainingAmount == 0) {
                // Remove from queue if already paid or not in correct status
                removeFromPaymentQueue(0);
                continue;
            }
            
            uint256 paymentAmount;
            
            if (contractBalance >= bet.remainingAmount) {
                // We can pay the full remaining amount
                paymentAmount = bet.remainingAmount;
                bet.status = BetStatus.FullyPaid;
                
                // Remove from payment queue
                removeFromPaymentQueue(0);
            } else {
                // Partial payment
                paymentAmount = contractBalance;
            }
            
            // Execute payment
            require(usdtToken.transfer(bet.bettor, paymentAmount), "USDT transfer failed");
            
            // Update bet state
            bet.paidAmount += paymentAmount;
            bet.remainingAmount = bet.potentialWin - bet.paidAmount;
            bet.paymentPercentage = (bet.paidAmount * 100) / bet.potentialWin;
            bet.lastPaymentTime = block.timestamp;
            
            // Update available funds
            contractBalance -= paymentAmount;
            
            // Emit event
            if (bet.status == BetStatus.FullyPaid) {
                emit BetFullyPaid(betId, bet.bettor, bet.potentialWin);
            } else {
                emit BetPartiallyPaid(betId, bet.bettor, paymentAmount, bet.remainingAmount, bet.paymentPercentage);
            }
            
            processedCount++;
        }
    }
    
    /**
     * @dev Remove bet from payment queue
     * @param _index Index in the payment queue
     */
    function removeFromPaymentQueue(uint256 _index) private {
        require(_index < paymentQueue.length, "Invalid index");
        
        uint256 betId = paymentQueue[_index];
        
        // Move last element to the position being deleted
        if (_index < paymentQueue.length - 1) {
            uint256 lastBetId = paymentQueue[paymentQueue.length - 1];
            paymentQueue[_index] = lastBetId;
            paymentQueuePositions[lastBetId] = _index;
        }
        
        // Remove last element
        paymentQueue.pop();
        
        // Clear position mapping
        delete paymentQueuePositions[betId];
    }
    
    /**
     * @dev Cancel a bet (only owner)
     * @param _betId ID of the bet
     */
    function cancelBet(uint256 _betId) external onlyOwner nonReentrant {
        Bet storage bet = bets[_betId];
        require(bet.status == BetStatus.Pending, "Bet is not pending");
        
        bet.status = BetStatus.Cancelled;
        
        // Return bet amount to bettor (including fee)
        uint256 refundAmount = bet.amount + bet.fee;
        require(usdtToken.transfer(bet.bettor, refundAmount), "USDT transfer failed");
        
        // Update total fees
        totalFees -= bet.fee;
        
        emit BetCancelled(_betId, bet.bettor, refundAmount);
    }
    
    /**
     * @dev Withdraw fees (only owner)
     * @param _amount Amount to withdraw
     */
    function withdrawFees(uint256 _amount) external onlyOwner nonReentrant {
        require(_amount <= totalFees, "Amount exceeds available fees");
        
        totalFees -= _amount;
        require(usdtToken.transfer(ADMIN_FEE_WALLET, _amount), "USDT transfer failed");
        
        emit FeesWithdrawn(ADMIN_FEE_WALLET, _amount);
    }
    
    /**
     * @dev Deposit USDT to the contract
     * @param _amount Amount to deposit
     */
    function deposit(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(usdtToken.transferFrom(msg.sender, address(this), _amount), "USDT transfer failed");
        
        emit Deposit(msg.sender, _amount);
        
        // Process payment queue if there are pending payments
        if (paymentQueue.length > 0) {
            processPaymentQueue();
        }
    }
    
    /**
     * @dev Withdraw USDT from the contract (only owner)
     * @param _to Address to withdraw to
     * @param _amount Amount to withdraw
     */
    function withdraw(address _to, uint256 _amount) external onlyOwner nonReentrant {
        require(_to == PLATFORM_WALLET, "Can only withdraw to platform wallet");
        require(_amount > 0, "Amount must be greater than 0");
        
        uint256 contractBalance = usdtToken.balanceOf(address(this));
        uint256 availableBalance = contractBalance - totalFees;
        
        // Check if there are pending payments
        if (paymentQueue.length > 0) {
            uint256 totalPendingPayments = 0;
            for (uint256 i = 0; i < paymentQueue.length; i++) {
                Bet storage bet = bets[paymentQueue[i]];
                if (bet.status == BetStatus.PartiallyPaid) {
                    totalPendingPayments += bet.remainingAmount;
                }
            }
            
            // Ensure we leave enough for pending payments
            require(_amount <= availableBalance - totalPendingPayments, "Amount exceeds available balance after pending payments");
        } else {
            require(_amount <= availableBalance, "Amount exceeds available balance");
        }
        
        require(usdtToken.transfer(_to, _amount), "USDT transfer failed");
        
        emit Withdrawal(_to, _amount);
    }
    
    /**
     * @dev Get user's bets
     * @param _user Address of the user
     * @return Array of bet IDs
     */
    function getUserBets(address _user) external view returns (uint256[] memory) {
        return userBets[_user];
    }
    
    /**
     * @dev Get bet details
     * @param _betId ID of the bet
     * @return Bet details
     */
    function getBet(uint256 _betId) external view returns (
        uint256 id,
        address bettor,
        uint256 amount,
        uint256 potentialWin,
        uint256 fee,
        string memory eventId,
        string memory outcomeId,
        BetStatus status,
        bool won,
        uint256 createdAt,
        uint256 settledAt,
        uint256 paidAmount,
        uint256 remainingAmount,
        uint256 lastPaymentTime,
        uint256 paymentPercentage
    ) {
        Bet storage bet = bets[_betId];
        return (
            bet.id,
            bet.bettor,
            bet.amount,
            bet.potentialWin,
            bet.fee,
            bet.eventId,
            bet.outcomeId,
            bet.status,
            bet.won,
            bet.createdAt,
            bet.settledAt,
            bet.paidAmount,
            bet.remainingAmount,
            bet.lastPaymentTime,
            bet.paymentPercentage
        );
    }
    
    /**
     * @dev Get payment queue length
     * @return Length of payment queue
     */
    function getPaymentQueueLength() external view returns (uint256) {
        return paymentQueue.length;
    }
    
    /**
     * @dev Get payment queue position for a bet
     * @param _betId ID of the bet
     * @return Position in payment queue (0-based), returns type(uint256).max if not in queue
     */
    function getPaymentQueuePosition(uint256 _betId) external view returns (uint256) {
        if (paymentQueuePositions[_betId] == 0 && (paymentQueue.length == 0 || paymentQueue[0] != _betId)) {
            return type(uint256).max; // Not in queue
        }
        return paymentQueuePositions[_betId];
    }
    
    /**
     * @dev Get total pending payments
     * @return Total amount of pending payments
     */
    function getTotalPendingPayments() external view returns (uint256) {
        uint256 totalPending = 0;
        for (uint256 i = 0; i < paymentQueue.length; i++) {
            Bet storage bet = bets[paymentQueue[i]];
            if (bet.status == BetStatus.PartiallyPaid) {
                totalPending += bet.remainingAmount;
            }
        }
        return totalPending;
    }
    
    /**
     * @dev Get contract balance
     * @return USDT balance of the contract
     */
    function getContractBalance() external view returns (uint256) {
        return usdtToken.balanceOf(address(this));
    }
    
    /**
     * @dev Get available balance for payouts (excluding fees)
     * @return Available USDT balance for payouts
     */
    function getAvailableBalance() external view returns (uint256) {
        return usdtToken.balanceOf(address(this)) - totalFees;
    }
}
