// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title USDTBettingPlatform
 * @dev Smart contract for betting with USDT on Ethereum blockchain
 */
contract USDTBettingPlatform is Ownable, ReentrancyGuard {
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
    
    // Bet status enum
    enum BetStatus { Pending, Settled, Cancelled }
    
    // Bet struct
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
    }
    
    // Mapping from bet ID to Bet
    mapping(uint256 => Bet) public bets;
    
    // Mapping from user address to their bet IDs
    mapping(address => uint256[]) public userBets;
    
    // Total number of bets
    uint256 public totalBets;
    
    // Total fees collected
    uint256 public totalFees;
    
    // Events
    event BetPlaced(uint256 indexed betId, address indexed bettor, uint256 amount, string eventId, string outcomeId, uint256 potentialWin);
    event BetSettled(uint256 indexed betId, address indexed bettor, bool won, uint256 payout);
    event BetCancelled(uint256 indexed betId, address indexed bettor, uint256 refundAmount);
    event FeesWithdrawn(address indexed owner, uint256 amount);
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    
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
        
        // Add bet to user's bets
        userBets[msg.sender].push(betId);
        
        emit BetPlaced(betId, msg.sender, _amount, _eventId, _outcomeId, _potentialWin);
    }
    
    /**
     * @dev Settle a bet (only owner)
     * @param _betId ID of the bet
     * @param _won Whether the bet was won
     */
    function settleBet(uint256 _betId, bool _won) external onlyOwner nonReentrant {
        Bet storage bet = bets[_betId];
        require(bet.status == BetStatus.Pending, "Bet is not pending");
        
        bet.status = BetStatus.Settled;
        bet.won = _won;
        bet.settledAt = block.timestamp;
        
        if (_won) {
            // Transfer winnings to bettor
            require(usdtToken.transfer(bet.bettor, bet.potentialWin), "USDT transfer failed");
            emit BetSettled(_betId, bet.bettor, true, bet.potentialWin);
        } else {
            emit BetSettled(_betId, bet.bettor, false, 0);
        }
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
        require(_amount <= contractBalance - totalFees, "Amount exceeds available balance");
        
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
        uint256 settledAt
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
            bet.settledAt
        );
    }
    
    /**
     * @dev Get contract balance
     * @return USDT balance of the contract
     */
    function getContractBalance() external view returns (uint256) {
        return usdtToken.balanceOf(address(this));
    }
}
