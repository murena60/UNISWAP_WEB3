// SPDX-License-Identifier: MIT
pragma solidity 0.8.31;


//Импортирует контракт VRFConsumerBaseV2Plus из библиотеки Chainlink, который упрощает интеграцию VRF v2.
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
//Импортирует контракт VRFV2PlusClient из библиотеки Chainlink, который упрощает интеграцию VRF v2
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
//Импортирует интерфейс AggregatorV3Interface, который используется для взаимодействия с Price Feeds от Chainlink.
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";


// Объявляем контракт с именем ChainlinkExample и наследуем функциональность от VRFConsumerBaseV2Plus.
contract ChainlinkExample is VRFConsumerBaseV2Plus {
    
    uint256 public immutable subscriptionId; // ID подписки Chainlink VRF
    bytes32 public immutable keyHash; // Hash ключа, связанный с подпиской
    uint16 public immutable requestConfirmations; // Количество подтверждений, необходимых для запроса VRF
    uint32 public immutable callbackGasLimit; // Лимит газа для колбэка VRF
    uint32 public immutable numWords;
    address public priceFeed;// Адрес контракта Price Feed (данные о ценах)

    uint256 public requestID;
    uint256 public randomNumber;

    // События
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);
    event PriceReturned(int256 price);

    // Конструктор контракта принимает параметры, необходимые для настройки VRF и Price Feed
    constructor(
        uint256 _subscriptionId,
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint16 _requestConfirmations,
        uint32 _callbackGasLimit,
        uint32 _numWords,
        address _priceFeed
    ) VRFConsumerBaseV2Plus(_vrfCoordinator) {
        subscriptionId = _subscriptionId;
        keyHash = _keyHash;
        requestConfirmations = _requestConfirmations;
        callbackGasLimit = _callbackGasLimit;
        numWords = _numWords;
        priceFeed = _priceFeed;
    }

    //Функция для запроса случайного числа 
    //Вызывает функцию requestRandomWords координатора VRF, передавая параметры запроса.
    function requestRandomWords() external {
        requestID = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                subId: subscriptionId,
                keyHash: keyHash,
                numWords: numWords,
                requestConfirmations: requestConfirmations,
                callbackGasLimit: callbackGasLimit,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({
                        nativePayment: false
                    })
                )
            })
        );
    }

    //Функция обратного вызова, вызываемая Chainlink VRF после генерации случайного числа
    //Проверяет, что requestId соответствует ожидаемому
    //Сохраняет полученное случайное число в переменной randomNumber
    //Генерирует событие RequestFulfilled
    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        require(requestID == _requestId, "Wrong Request ID");
        randomNumber = _randomWords[0];
        emit RequestFulfilled(_requestId, _randomWords);
    }

    //Функция для получения последней цены из Price Feed.
    //Создает экземпляр интерфейса AggregatorV3Interface с адресом Price Feed.
    //Вызывает функцию latestRoundData() для получения последних данных.
    //Эмитирует событие PriceReturned с полученной ценой.
    function getLatestPrice() external {
        AggregatorV3Interface priceFeedContract = AggregatorV3Interface(priceFeed);
        (
            uint80 roundID,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        ) = priceFeedContract.latestRoundData();
        emit PriceReturned(answer);
    }
    
    //Функция кидающая случайные значения
    function random() external view returns (uint256) {
        return uint256(blockhash(block.number - 1));
    }
}


