import { ethers } from "hardhat"; // Импортируем библиотеку ethers для взаимодействия с Ethereum.
import { expect } from "chai"; // Импортируем библиотеку chai для написания утверждений в тестах.
import { Contract, Signer } from "ethers"; // Импортируем типы Contract и Signer из ethers.

describe("AaveFlashLoan", function () {

  //  набор тестов для контракта AaveFlashLoan.

  let AaveFlashLoan: Contract; // Объявляет переменную для экземпляра контракта AaveFlashLoan.
  let MockERC20: Contract; // Объявляет переменную для экземпляра фиктивного ERC20 токена.
  let deployer: Signer; // Объявляет переменную для учетной записи развертывающего контракта
  let user: Signer; // Объявляет переменную для учетной записи пользователя.
  let pool: Signer; // Объявляет переменную для учетной записи пула ликвидности Aave.
  let deployerAddress: string; // Объявляет переменную для адреса развертывающего контракт.
  let userAddress: string; // Объявляет переменную для адреса пользователя.
  let poolAddress: string; // Объявляет переменную для адреса пула Aave.

  const LOAN_AMOUNT = 1000; // Определяет константу для суммы займа.
  const INITIAL_SUPPLY = 10000; // Определяет константу для начального количества токенов MockERC20.
  const PREMIUM_PERCENTAGE = 9; // Определяет константу для процентной  премии 

  beforeEach(async function () {

    //  функция, которая будет выполняться перед каждым тестом.

    [deployer, user, pool] = await ethers.getSigners(); // Получает список учетных записей из Hardhat.
    deployerAddress = await deployer.getAddress(); // Получает адрес учетной записи развертывающего контракта
    userAddress = await user.getAddress(); // Получает адрес учетной записи пользователя.
    poolAddress = await pool.getAddress(); // Получает адрес учетной записи пула.

    
    const MockERC20Factory = await ethers.getContractFactory("MockERC20"); // Получает фабрику контрактов для MockERC20.
    MockERC20 = await MockERC20Factory.deploy("Test Token", "TST", INITIAL_SUPPLY); // Развертывает контракт MockERC20.
    await MockERC20.deployed(); // Ожидает завершения развертывания контракта.

 
    const AaveFlashLoanFactory = await ethers.getContractFactory("AaveFlashLoan"); // Получает фабрику контрактов для AaveFlashLoan.

    
    AaveFlashLoan = await AaveFlashLoanFactory.deploy(poolAddress, MockERC20.address); // Развертывает контракт AaveFlashLoan, передавая адрес пула и адрес токена.
    await AaveFlashLoan.deployed(); // Ожидает завершения развертывания контракта.
  });

  it("Should request a flash loan and repay successfully", async function () {

    // Определяет тест, который проверяет успешный запрос и возврат FlashLoan.

    
    const fundAmount = LOAN_AMOUNT * 2; // Определяет сумму, которой нужно пополнить контракт, чтобы хватило на займ и премию.
    await MockERC20.transfer(AaveFlashLoan.address, fundAmount); // Переводит токены на адрес контракта AaveFlashLoan.
    expect(await MockERC20.balanceOf(AaveFlashLoan.address)).to.equal(fundAmount); // Проверяет, что баланс контракта AaveFlashLoan равен fundAmount.

   
    await MockERC20.transfer(AaveFlashLoan.address, LOAN_AMOUNT); // Имитирует получение займа, переводя LOAN_AMOUNT токенов на контракт.

    
    const premium = (LOAN_AMOUNT * PREMIUM_PERCENTAGE) / 10000; // Вычисляет сумму премии, которую нужно вернуть.
    const initialBalance = await MockERC20.balanceOf(AaveFlashLoan.address); // Получает начальный баланс контракта AaveFlashLoan.


    await AaveFlashLoan.requestFlashLoan(); // Вызывает функцию requestFlashLoan для запроса FlashLoan.

   
    const expectedBalance = initialBalance.sub(premium); // Вычисляет ожидаемый баланс после возврата займа с премией.
    const finalBalance = await MockERC20.balanceOf(AaveFlashLoan.address); // Получает финальный баланс контракта AaveFlashLoan.
    expect(finalBalance).to.equal(expectedBalance); // Проверяет, что финальный баланс равен ожидаемому.
  });

  it("Should revert executeOperation if not enough balance to repay", async function () {

    //  executeOperation возвращает ошибку, если недостаточно средств для возврата займа.

    const premium = 10; // Устанавливает произвольную сумму премии.
    await expect(
      AaveFlashLoan.executeOperation(
        MockERC20.address, // Адрес токена MockERC20.
        LOAN_AMOUNT, // Сумма займа.
        premium, // Премия.
        AaveFlashLoan.address, // Адрес инициатора.
        "0x" // Пустые параметры.
      )
    ).to.be.revertedWith("Not enough balance to repay"); // Проверяет, что вызов executeOperation возвращает ошибку "Not enough balance to repay".
  });
});
