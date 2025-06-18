// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title USDTBetting
 * @dev Smart contract for betting with USDT on Ethereum blockchain
 */
contract USDTBetting {
    // USDT token interface
    IERC20 public usdtToken;
    
    // Owner of the contract
    address public owner;
    
    // Fee percentage (2%)
    uint256 public constant FEE_PERCENTAGE = 2;
    
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
    
    // Events
    event BetPlaced(uint256 indexed betId, address indexed bettor, uint256 amount, string eventId, string outcomeId);
    event BetSettled(uint256 indexed betId, address indexed bettor, bool won, uint256 payout);
    event BetCancelled(uint256 indexed betId, address indexed bettor);
    
    /**
     * @dev Constructor
     * @param _usdtToken Address of the USDT token contract
     */
    constructor(address _usdtToken) {
        usdtToken = IERC20(_usdtToken);
        owner = msg.sender;
    }
    
    /**
     * @dev Place a bet
     * @param _amount Amount to bet in USDT (with 6 decimals)
     * @param _eventId ID of the event
     * @param _outcomeId ID of the outcome
     * @param _potentialWin Potential win amount
     */
    function placeBet(uint256 _amount, string memory _eventId, string memory _outcomeId, uint256 _potentialWin) external {
        require(_amount > 0, "Bet amount must be greater than 0");
        require(_amount <= MAX_BET_AMOUNT, "Bet amount exceeds maximum limit");
        
        // Calculate fee
        uint256 fee = (_amount * FEE_PERCENTAGE) / 100;
        
        // Transfer USDT from bettor to contract
        require(usdtToken.transferFrom(msg.sender, address(this), _amount), "USDT transfer failed");
        
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
        
        emit BetPlaced(betId, msg.sender, _amount, _eventId, _outcomeId);
    }
    
    /**
     * @dev Settle a bet (only owner)
     * @param _betId ID of the bet
     * @param _won Whether the bet was won
     */
    function settleBet(uint256 _betId, bool _won) external {
        require(msg.sender == owner, "Only owner can settle bets");
        
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
    function cancelBet(uint256 _betId) external {
        require(msg.sender == owner, "Only owner can cancel bets");
        
        Bet storage bet = bets[_betId];
        require(bet.status == BetStatus.Pending, "Bet is not pending");
        
        bet.status = BetStatus.Cancelled;
        
        // Return bet amount to bettor
        require(usdtToken.transfer(bet.bettor, bet.amount), "USDT transfer failed");
        
        emit BetCancelled(_betId, bet.bettor);
    }
    
    /**
     * @dev Withdraw fees (only owner)
     * @param _amount Amount to withdraw
     */
    function withdrawFees(uint256 _amount) external {
        require(msg.sender == owner, "Only owner can withdraw fees");
        require(usdtToken.transfer(owner, _amount), "USDT transfer failed");
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
    function getBet(uint256 _betId) external view returns (Bet memory) {
        return bets[_betId];
    }
}

/**
 * @title IERC20
 * @dev Interface for the ERC20 standard token.
 */
interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
}
