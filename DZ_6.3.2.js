
// Подключаемся к провайдеру Ethereum 
const provider = new ethers.providers.Web3Provider(window.ethereum);

// получаем аккаунт, который будет подписывать транзакции
const signer = provider.getSigner();

//запрос цены газа
async function getGasPrice() {
    try {
        const gasPrice = await provider.getGasPrice();
        const gasPriceInGwei = ethers.utils.formatUnits(gasPrice, "gwei");
        return parseFloat(gasPriceInGwei);
    } catch (error) {
        console.error("Ошибка при получении цены газа:", error);
        throw error; 
    }
}

//запрос баланса ETH для заданного адреса
async function getBalance(address) {
    try {
        const balanceInWei = await provider.getBalance(address);//address - Адрес Ethereum
        const balanceInEth = ethers.utils.formatEther(balanceInWei);//Баланс в ETH
        return parseFloat(balanceInEth);
    } catch (error) {
        console.error("Ошибка при получении баланса:", error);
        throw error;
    }
}

// отправка ETH на заданный адрес
async function sendEther(recipientAddress, amountInEth) {
    try {
        const amountInWei = ethers.utils.parseEther(amountInEth.toString());//amountInEth - Количество ETH для отправки

        const transaction = {
            to: recipientAddress,//recipientAddress - Адрес получателя.
            value: amountInWei,
            gasLimit: 21000, // Стандартный лимит газа для простых переводов
        };

        const txResponse = await signer.sendTransaction(transaction);
        console.log("Транзакция отправлена:", txResponse.hash);
        return txResponse.hash;

    } catch (error) {
        console.error("Ошибка при отправке ETH:", error);
        throw error;
    }
}




