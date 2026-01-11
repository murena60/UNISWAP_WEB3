// Подключение к провайдеру Ethereum 
const provider = new ethers.providers.Web3Provider(window.ethereum);

// Запрос доступа к аккаунту 
await provider.send("eth_requestAccounts", []);

// Получение signer-аккаунта, который будет подписывать транзакции)
const signer = provider.getSigner();

// Заменяем эти значения на  данные вашего контракта
const contractAddress = "YOUR_CONTRACT_ADDRESS"; //  Адрес развернутого контракта AaveFlashLoan
const contractABI = [
  //  ABI контракта AaveFlashLoan 
  {
    "inputs": [
      {
        "internalType": "contract IPoolAddressesProvider",
        "name": "_provider",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_tokenAddress",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "LOAN_AMOUNT",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "asset",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "premium",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "initiator",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "params",
        "type": "bytes"
      }
    ],
    "name": "executeOperation",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "getTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "requestFlashLoan",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "tokenAddress",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]; 

// Создайте экземпляр контракта
const contract = new ethers.Contract(contractAddress, contractABI, signer);

// Функция для запроса Flash Loan
async function requestFlashLoan() {
  try {
    const transaction = await contract.requestFlashLoan();
    console.log("Транзакция отправлена:", transaction.hash);

    //  подтверждения транзакции
    await transaction.wait();
    console.log("Транзакция подтверждена!");
  } catch (error) {
    console.error("Ошибка при запросе Flash Loan:", error);
  }
}

// Функция для получения токенов (для тестирования)
async function getTokens(amount) {
  try {
    const transaction = await contract.getTokens(amount);
    console.log("Транзакция отправлена:", transaction.hash);

    // подтверждения транзакции
    await transaction.wait();
    console.log("Токены получены!");
  } catch (error) {
    console.error("Ошибка при получении токенов:", error);
  }
}




