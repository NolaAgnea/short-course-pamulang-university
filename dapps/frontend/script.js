// DOM Elements
const connectBtn = document.getElementById("connectBtn");
const statusEl = document.getElementById("status");
const addressEl = document.getElementById("address");
const addressFullEl = document.getElementById("addressFull");
const networkEl = document.getElementById("network");
const balanceEl = document.getElementById("balance");
const balanceLabelEl = document.getElementById("balanceLabel");
const errorBox = document.getElementById("errorBox");
const errorMessage = document.getElementById("errorMessage");

// State Management
const state = {
  connected: false,
  address: null,
  chainId: null,
  balance: null,
};

// Constants
const AVALANCHE_FUJI_CHAIN_ID = "0xa869"; // 43113 in decimal
const NETWORK_CONFIG = {
  "0xa869": {
    name: "Avalanche Fuji Testnet",
    symbol: "AVAX",
    valid: true,
  },
};

// Utility Functions
function shortenAddress(address) {
  if (!address) return "-";
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

function formatAvaxBalance(balanceWei) {
  const balance = parseInt(balanceWei, 16);
  return (balance / 1e18).toFixed(4);
}

function showError(message) {
  errorMessage.textContent = message;
  errorBox.style.display = "block";
  setTimeout(() => {
    errorBox.style.display = "none";
  }, 5000);
}

function hideError() {
  errorBox.style.display = "none";
}

// Update UI based on state
function updateUI() {
  if (state.connected) {
    // Update status
    statusEl.textContent = "Connected";
    statusEl.className = "status-badge connected";

    // Update address
    addressEl.textContent = shortenAddress(state.address);
    addressEl.title = state.address; // Show full address on hover
    addressFullEl.textContent = state.address;

    // Update network
    const networkConfig = NETWORK_CONFIG[state.chainId];
    if (networkConfig && networkConfig.valid) {
      networkEl.textContent = `✅ ${networkConfig.name}`;
      networkEl.className = "network-valid";
      balanceLabelEl.textContent = networkConfig.symbol;
    } else {
      networkEl.textContent = "❌ Wrong Network";
      networkEl.className = "network-invalid";
      balanceLabelEl.textContent = "";
    }

    // Update balance
    if (state.balance) {
      balanceEl.textContent = state.balance;
    }

    // Disable connect button
    connectBtn.textContent = "Connected";
    connectBtn.disabled = true;
    connectBtn.style.opacity = "0.6";
    connectBtn.style.cursor = "not-allowed";
  } else {
    // Reset UI
    statusEl.textContent = "Not Connected";
    statusEl.className = "status-badge";
    addressEl.textContent = "-";
    addressFullEl.textContent = "-";
    networkEl.textContent = "-";
    networkEl.className = "";
    balanceEl.textContent = "-";
    balanceLabelEl.textContent = "";
    connectBtn.textContent = "Connect Wallet";
    connectBtn.disabled = false;
    connectBtn.style.opacity = "1";
    connectBtn.style.cursor = "pointer";
  }
}

// Fetch and update balance
async function updateBalance(address) {
  try {
    const balanceWei = await window.ethereum.request({
      method: "eth_getBalance",
      params: [address, "latest"],
    });
    state.balance = formatAvaxBalance(balanceWei);
    updateUI();
  } catch (error) {
    console.error("Error fetching balance:", error);
    showError("Failed to fetch balance");
  }
}

// Validate and update network
async function validateNetwork() {
  try {
    const chainId = await window.ethereum.request({
      method: "eth_chainId",
    });
    state.chainId = chainId;

    const networkConfig = NETWORK_CONFIG[chainId];
    if (!networkConfig || !networkConfig.valid) {
      showError("Please switch to Avalanche Fuji Testnet");
    } else {
      hideError();
      // Update balance when on correct network
      if (state.address) {
        await updateBalance(state.address);
      }
    }
    updateUI();
  } catch (error) {
    console.error("Error validating network:", error);
    showError("Failed to validate network");
  }
}

// Main connect wallet function
async function connectWallet() {
  // Check if MetaMask/Core Wallet is installed
  if (typeof window.ethereum === "undefined") {
    showError("Core Wallet tidak terdeteksi. Silakan install Core Wallet.");
    return;
  }

  try {
    hideError();
    statusEl.textContent = "Connecting...";
    statusEl.className = "status-badge connecting";

    // Request wallet permission and get accounts
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (accounts.length === 0) {
      showError("No accounts found. Please unlock your wallet.");
      return;
    }

    // Save wallet address to state
    state.address = accounts[0];
    state.connected = true;

    console.log("Connected to wallet:", state.address);

    // Validate network and update UI
    await validateNetwork();
  } catch (error) {
    console.error("Connection error:", error);

    if (error.code === 4001) {
      showError("Connection rejected by user");
    } else if (error.code === -32002) {
      showError("Connection request pending. Please check your wallet.");
    } else {
      showError(`Connection failed: ${error.message || "Unknown error"}`);
    }

    state.connected = false;
    updateUI();
  }
}

// Event Listeners

// Listen for account changes
if (window.ethereum) {
  window.ethereum.on("accountsChanged", async (accounts) => {
    console.log("Accounts changed:", accounts);

    if (accounts.length === 0) {
      // User disconnected wallet
      state.connected = false;
      state.address = null;
      state.balance = null;
      showError("Wallet disconnected");
    } else {
      // User switched account
      state.address = accounts[0];
      showError(`Switched to account: ${shortenAddress(accounts[0])}`);
      await validateNetwork();
    }

    updateUI();
  });

  // Listen for chain/network changes
  window.ethereum.on("chainChanged", async (chainId) => {
    console.log("Chain changed:", chainId);
    state.chainId = chainId;

    const networkConfig = NETWORK_CONFIG[chainId];
    if (networkConfig && networkConfig.valid) {
      showError(`Switched to ${networkConfig.name}`);
    } else {
      showError("Switched to unsupported network. Please use Avalanche Fuji.");
    }

    await validateNetwork();
  });
}

// Connect button click event
connectBtn.addEventListener("click", connectWallet);

// Initialize UI
updateUI();
