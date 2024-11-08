// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./StorageToken.sol";

contract StorageContract {
    IERC20 public storageToken;
    uint256 public listingIdCounter;
    uint256 public requestIdCounter;
    address public owner;

    mapping(address => bool) public hasReceivedTokens;
    uint256 public constant INITIAL_TOKEN_AMOUNT = 10000 * 10**18;

    struct Listing {
        address provider;
        address purchasedBy;
        uint256 storageSize;
        uint256 pricePerDay;
        bool available;
    }

    struct ConsumerRequest {
        address consumer;
        uint256 duration;
        bool accepted;
        bool completed;
        uint256 startTime;
        uint256 price;
    }

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => mapping(uint256 => ConsumerRequest)) public requests;
    mapping(address => uint256[]) public providerListings;
    mapping(address => uint256[]) public consumerRequests;

    event StorageListed(uint256 indexed listingId, address indexed provider, uint256 storageSize, uint256 pricePerDay);
    event RequestCreated(uint256 indexed listingId, uint256 indexed requestId, address indexed consumer, uint256 duration);
    event RequestAccepted(uint256 indexed listingId, uint256 indexed requestId, address indexed provider);
    event RequestCompleted(uint256 indexed listingId, uint256 indexed requestId, address indexed provider);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    constructor(IERC20 _storageToken) {
        storageToken = _storageToken;
        owner = msg.sender;
    }

    function grantInitialTokens(address user) external {
        require(!hasReceivedTokens[user], "User has already received initial tokens");
        hasReceivedTokens[user] = true;
        StorageToken(address(storageToken)).mintTokens(user, INITIAL_TOKEN_AMOUNT);
    }

    function listStorage(uint256 storageSize, uint256 pricePerDay) external {
        listingIdCounter++;
        listings[listingIdCounter] = Listing({
            provider: msg.sender,
            purchasedBy: address(0),
            storageSize: storageSize,
            pricePerDay: pricePerDay,
            available: true
        });

        providerListings[msg.sender].push(listingIdCounter);
        emit StorageListed(listingIdCounter, msg.sender, storageSize, pricePerDay);
    }

    function createRequest(uint256 listingId, uint256 duration) external {
        Listing storage listing = listings[listingId];
        require(listing.available, "Storage not available");

        uint256 price = listing.pricePerDay * duration;
        require(storageToken.transferFrom(msg.sender, address(this), price), "Token transfer failed");

        requestIdCounter++;
        requests[listingId][requestIdCounter] = ConsumerRequest({
            consumer: msg.sender,
            duration: duration,
            accepted: false,
            completed: false,
            startTime: 0,
            price: price
        });

        consumerRequests[msg.sender].push(requestIdCounter);

        emit RequestCreated(listingId, requestIdCounter, msg.sender, duration);
    }

    function acceptRequest(uint256 listingId, uint256 requestId) external {
        Listing storage listing = listings[listingId];
        ConsumerRequest storage request = requests[listingId][requestId];

        require(listing.provider == msg.sender, "Only provider can accept request");
        require(!request.accepted, "Request already accepted");

        request.accepted = true;
        request.startTime = block.timestamp;
        listing.available = false;
        listing.purchasedBy = request.consumer;

        emit RequestAccepted(listingId, requestId, msg.sender);
    }

    function completeRequest(uint256 listingId, uint256 requestId) external {
        ConsumerRequest storage request = requests[listingId][requestId];

        require(request.consumer == msg.sender, "Only consumer can complete request");
        require(request.accepted, "Request not accepted yet");
        require(block.timestamp >= request.startTime + (request.duration * 1 days), "Request duration not yet completed");

        request.completed = true;
        require(storageToken.transfer(listings[listingId].provider, request.price), "Payment transfer failed");

        emit RequestCompleted(listingId, requestId, listings[listingId].provider);
    }

    function getProviderListings(address provider) external view returns (uint256[] memory) {
        return providerListings[provider];
    }

    function getConsumerRequests(address consumer) external view returns (uint256[] memory) {
        return consumerRequests[consumer];
    }
}
