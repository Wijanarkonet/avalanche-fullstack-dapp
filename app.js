let provider = null;
let currentAccount = null;

//DOM
const connectBtn = document.getElementById("connectBtn");
const disconnectBtn = document.getElementById("disconnectBtn");
const statusEl = document.getElementById("status");
const addressEl = document.getElementById("wallet");
const networkEl = document.getElementById("network");
const balanceEl = document.getElementById("balance");

//EVENTS
connectBtn.addEventListener("click", connectWallet);
disconnectBtn.addEventListener("click", disconnectWallet);

//WALLET DETECTION
function detectWallet() {
    if (window.ethereum) {
        provider = window.ethereum;
        console.log("Ethereum-compatible wallet detected");
        return true;
    }

    alert("Wallet EVM (Core / MetaMask) belum terinstal atau belum unlock");
    return false;
}

//UTIL
function shortenAddress(address) {
    return address.slice(0, 6) + "..." + address.slice(-4);
}

//CONNECT
async function connectWallet() {
    if (!detectWallet()) return;

    try {
        console.log("Requesting wallet access...");

        const accounts = await provider.request({
            method: "eth_requestAccounts",
        });

        if (!accounts || accounts.length === 0) {
            alert("Tidak ada akun wallet");
            return;
        }

        currentAccount = accounts[0];

        statusEl.innerText = "Connected";
        statusEl.className = "badge connected";

        addressEl.innerText =
            shortenAddress(currentAccount) +
            " - DANANG WIJANARKO | 231011403460";

        connectBtn.disabled = true;
        disconnectBtn.disabled = false;

        await checkNetwork();
        await getBalance();

        // Listen changes (SETELAH CONNECT)
        provider.on("accountsChanged", handleAccountsChanged);
        provider.on("chainChanged", handleChainChanged);

        console.log("Connected:", currentAccount);

    } catch (err) {
        console.error("CONNECT ERROR:", err);

        if (err.code === 4001) {
            alert("User menolak koneksi wallet");
        } else {
            alert("Gagal connect wallet, cek console");
        }
    }
}

//DISCONNECT
function disconnectWallet() {
    currentAccount = null;

    statusEl.innerText = "Not Connected";
    statusEl.className = "badge";

    addressEl.innerText = "-";
    networkEl.innerText = "-";
    balanceEl.innerText = "-";

    connectBtn.disabled = false;
    disconnectBtn.disabled = true;

    console.log("Wallet disconnected");
}

//EVENTS HANDLER
function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        disconnectWallet();
    } else {
        currentAccount = accounts[0];
        addressEl.innerText = shortenAddress(currentAccount);
        getBalance();
    }
}

function handleChainChanged() {
    checkNetwork();
    getBalance();
}


async function checkNetwork() {
    try {
        const chainId = await provider.request({
            method: "eth_chainId"
        });

        let networkName = "Unknown";

        if (chainId === "0xa869") {
            networkName = "Avalanche Fuji Testnet";
        } else if (chainId === "0xa86a") {
            networkName = "Avalanche Mainnet";
        }

        networkEl.innerText = networkName;
        console.log("Chain ID:", chainId);

    } catch (err) {
        console.error("NETWORK ERROR:", err);
        networkEl.innerText = "Error";
    }
}


async function getBalance() {
    try {
        const balanceWei = await provider.request({
            method: "eth_getBalance",
            params: [currentAccount, "latest"]
        });

        const balanceAvax = (parseInt(balanceWei, 16) / 1e18).toFixed(4);
        balanceEl.innerText = balanceAvax + " AVAX";

        console.log("Balance:", balanceAvax);

    } catch (err) {
        console.error("BALANCE ERROR:", err);
        balanceEl.innerText = "Error";
    }
}
