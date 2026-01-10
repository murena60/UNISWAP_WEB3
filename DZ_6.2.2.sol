
// SPDX-License-Identifier: MIT
pragma solidity 0.8.31;

import "./FlashLoanSimpleReceiverBase.sol";
import "./interfaces/IPoolAddressesProvider.sol";

interface IERC20 {
    function approve(address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract AaveFlashLoan is FlashLoanSimpleReceiverBase {

    address public immutable tokenAddress; // Адрес токена для флэш-займа чтобы контракт точно знал какой токен ожидать при выполнении флеш-займа
    uint256 public constant LOAN_AMOUNT = 1000;    //сумма займа


    constructor(IPoolAddressesProvider _provider,address _tokenAddress) FlashLoanSimpleReceiverBase(_provider) {
        tokenAddress = _tokenAddress;
    }

    function requestFlashLoan() external {
        // Запрашиваем флэш-заем
        POOL.flashLoanSimple(address(this), tokenAddress, LOAN_AMOUNT, bytes(""), 0);
    }

   function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        require(asset == tokenAddress, "Wrong asset");
        require(amount == LOAN_AMOUNT, "Wrong amount");
        require(initiator == address(this), "Wrong initiator");

        uint256 totalAmount = amount + premium;

     
        IERC20 token = IERC20(asset);

        // нужно убедиться что есть достаточно средств для возврата займа
        require(token.balanceOf(address(this)) >= totalAmount, "Not enough balance to repay");

        // Возвращаем средства Aave
        bool success = token.approve(address(POOL), totalAmount);
        require(success, "Approval failed");
        return true;
    }

    // Функция для получения токенов 
    function getTokens(uint256 amount) external {
      
        IERC20(tokenAddress).transfer(address(this), amount);
    }
}
