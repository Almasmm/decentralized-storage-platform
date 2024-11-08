let provider, signer, storageToken, storageContract;

const storageTokenAddress = "0xFC23b8188cEeaDa470D6687be8eE62987DF42B80"; // Replace with deployed token address
const storageContractAddress = "0xCB5D7D7693445016B9DcFE82615621a6cd5ca6A2"; // Replace with deployed contract address

// Connect to MetaMask Wallet
async function connectWallet() {
  if (window.ethereum) {
    try {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      signer = provider.getSigner();

      document.getElementById(
        "wallet-address"
      ).innerText = `Wallet: ${await signer.getAddress()}`;

      await initializeContracts();
      displaySections();
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  } else {
    alert("Please install MetaMask!");
  }
}

// Initialize contracts
async function initializeContracts() {
  const [storageTokenABI, storageContractABI] = await Promise.all([
    fetch("/StorageToken.json").then((response) => response.json()),
    fetch("/StorageContract.json").then((response) => response.json()),
  ]);

  storageToken = new ethers.Contract(
    storageTokenAddress,
    storageTokenABI.abi,
    signer
  );
  storageContract = new ethers.Contract(
    storageContractAddress,
    storageContractABI.abi,
    signer
  );

  // Grant initial tokens if the user is new
  await grantInitialTokens();
  loadProviderListings();
  loadAvailableListings();
  loadConsumerRentals();
}

// Grant initial tokens to a new user
async function grantInitialTokens() {
  try {
    const tx = await storageContract.grantInitialTokens(
      await signer.getAddress()
    );
    await tx.wait();
    console.log("Initial tokens granted.");
  } catch (error) {
    console.log("Failed to grant initial tokens:", error.message);
  }
}

// Display sections based on user role
async function displaySections() {
  const isProvider = confirm(
    "Are you a storage provider? Click 'Cancel' if you are a consumer."
  );
  document.getElementById("provider-section").style.display = isProvider
    ? "block"
    : "none";
  document.getElementById("consumer-section").style.display = isProvider
    ? "none"
    : "block";
}

// Provider: Create a new storage listing
async function listStorage() {
  const storageSize = prompt("Enter storage size (MB):");
  const pricePerDay = prompt("Enter price per day (in STK tokens):");
  if (storageSize && pricePerDay) {
    try {
      const tx = await storageContract.listStorage(
        storageSize,
        ethers.utils.parseEther(pricePerDay)
      );
      await tx.wait();
      alert("Storage listed successfully!");
      loadProviderListings();
    } catch (error) {
      console.error("Failed to create storage listing:", error);
    }
  }
}

// Provider: Load existing listings
async function loadProviderListings() {
  try {
    const providerAddress = await signer.getAddress();
    const listings = await storageContract.getProviderListings(providerAddress);

    const listingsContainer = document.getElementById("provider-listings");
    listingsContainer.innerHTML = listings.length
      ? ""
      : "<p>No listings available.</p>";

    for (const id of listings) {
      const listing = await storageContract.listings(id);
      const rentedStatus = listing.available
        ? "Available"
        : `Purchased by: ${listing.purchasedBy}`;
      listingsContainer.innerHTML += `
        <div>
            <p>Listing ID: ${id}</p>
            <p>Storage Size: ${listing.storageSize} MB</p>
            <p>Price per Day: ${ethers.utils.formatEther(
              listing.pricePerDay
            )} STK</p>
            <p>Status: ${rentedStatus}</p>
            ${
              listing.available
                ? ""
                : `<button onclick="loadPendingRequests(${id})">View Requests</button>`
            }
        </div>
      `;
    }
  } catch (error) {
    console.error("Failed to load provider listings:", error);
  }
}

// Provider: Load pending requests
async function loadPendingRequests(listingId) {
  try {
    const pendingRequestsContainer =
      document.getElementById("pending-requests");
    pendingRequestsContainer.innerHTML = "";

    const requests = await storageContract.requests(listingId);
    for (const request of requests) {
      pendingRequestsContainer.innerHTML += `
        <div>
            <p>Request ID: ${request.id}</p>
            <p>Consumer: ${request.consumer}</p>
            <p>Duration: ${request.duration} days</p>
            <button onclick="acceptRequest(${listingId}, ${request.id})">Accept Request</button>
        </div>
      `;
    }
  } catch (error) {
    console.error("Failed to load pending requests:", error);
  }
}

// Consumer: Load available listings for renting
async function loadAvailableListings() {
  try {
    const totalListings = await storageContract.listingIdCounter();
    const listingsContainer = document.getElementById("available-listings");
    listingsContainer.innerHTML = "";

    for (let i = 1; i <= totalListings; i++) {
      const listing = await storageContract.listings(i);
      if (listing.available) {
        listingsContainer.innerHTML += `
          <div>
              <p>Listing ID: ${i}</p>
              <p>Storage Size: ${listing.storageSize} MB</p>
              <p>Price per Day: ${ethers.utils.formatEther(
                listing.pricePerDay
              )} STK</p>
              <button onclick="createRequest(${i})">Request Storage</button>
          </div>
        `;
      }
    }
  } catch (error) {
    console.error("Failed to load available listings:", error);
  }
}

// Consumer: Create a request for storage
async function createRequest(listingId) {
  const duration = prompt("Enter duration (days):");
  if (duration) {
    try {
      const listing = await storageContract.listings(listingId);
      const pricePerDay = listing.pricePerDay;
      const price = pricePerDay.mul(duration);

      await storageToken.approve(storageContractAddress, price);
      const tx = await storageContract.createRequest(listingId, duration);
      await tx.wait();
      alert("Request created successfully!");
      loadConsumerRentals();
    } catch (error) {
      console.error("Failed to create storage request:", error);
    }
  }
}

// Consumer: Load consumer's rentals
async function loadConsumerRentals() {
  try {
    const consumerAddress = await signer.getAddress();
    const rentals = await storageContract.getConsumerRequests(consumerAddress);

    const rentalsContainer = document.getElementById("consumer-rentals");
    rentalsContainer.innerHTML = rentals.length
      ? ""
      : "<p>No active rentals.</p>";

    for (const id of rentals) {
      const request = await storageContract.requests(id, 1);
      const rentalStatus = request.completed ? "Completed" : "Active";

      rentalsContainer.innerHTML += `
        <div>
            <p>Request ID: ${id}</p>
            <p>Duration: ${request.duration} days</p>
            <p>Status: ${rentalStatus}</p>
            ${
              !request.completed
                ? `<button onclick="openUploadModal(${id})">Upload File</button>`
                : ""
            }
        </div>
      `;
    }
  } catch (error) {
    console.error("Failed to load consumer rentals:", error);
  }
}

// Consumer: Open upload modal for uploading files to storage provider
function openUploadModal(requestId) {
  document.getElementById("upload-modal").style.display = "block";
  document.getElementById("file-input").dataset.requestId = requestId;
}

// Consumer: Close upload modal
function closeModal() {
  document.getElementById("upload-modal").style.display = "none";
}

// Consumer: Handle file upload with encryption
async function handleFileUpload() {
  const fileInput = document.getElementById("file-input");
  const requestId = fileInput.dataset.requestId;
  const file = fileInput.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = async function (e) {
      const encryptedFile = encryptFile(e.target.result);
      await sendFileToProvider(encryptedFile, requestId);
      alert("File uploaded!");
      closeModal();
    };
    reader.readAsText(file);
  } else {
    alert("Please select a file to upload.");
  }
}

// Utility: Encrypt file data (simple example, replace with secure encryption)
function encryptFile(data) {
  return data.split("").reverse().join("");
}

// Utility: Send file to provider (implement socket connection here)
async function sendFileToProvider(fileData, requestId) {
  console.log(
    `Sending encrypted file for request ID ${requestId} to provider...`
  );
  // Implement socket connection to send `fileData` to the provider's machine
}

// Provider: Accept request
async function acceptRequest(listingId, requestId) {
  try {
    const tx = await storageContract.acceptRequest(listingId, requestId);
    await tx.wait();
    alert("Request accepted!");
    loadProviderListings();
  } catch (error) {
    console.error("Failed to accept request:", error);
  }
}
