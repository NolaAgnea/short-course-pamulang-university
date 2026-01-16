"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from "wagmi";
import { injected } from "wagmi/connectors";
import { avalancheFuji } from "wagmi/chains";

// ==============================
// 🔹 CONFIG
// ==============================

// 👉 Contract address dari Day 2
const CONTRACT_ADDRESS = "0x8b427e7f1291dc686bd32315afafe44be50fefce";

// 👉 ABI SIMPLE STORAGE
const SIMPLE_STORAGE_ABI = [
  {
    inputs: [],
    name: "getValue",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_value", type: "uint256" }],
    name: "setValue",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// ==============================
// 🔹 HELPER FUNCTIONS
// ==============================

// Shorten wallet address (Task 4 - UX Improvement)
const shortenAddress = (addr: string | undefined) => {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

export default function Page() {
  // ==============================
  // 🔹 WALLET STATE (Task 1)
  // ==============================
  const { address, isConnected } = useAccount();
  const { connect, isPending: isConnecting, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  // ==============================
  // 🔹 LOCAL STATE
  // ==============================
  const [inputValue, setInputValue] = useState("");
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

  // ==============================
  // 🔹 READ CONTRACT (Task 2)
  // ==============================
  const {
    data: value,
    isLoading: isReading,
    refetch,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SIMPLE_STORAGE_ABI,
    functionName: "getValue",
  });

  // ==============================
  // 🔹 WRITE CONTRACT (Task 3)
  // ==============================
  const { writeContract, isPending: isWriting, error: writeError } = useWriteContract();

  // Wait for transaction receipt (Task 4 - UX Improvement)
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Check if on correct network (Task 5 - Failure Handling)
  const isWrongNetwork = isConnected && chainId !== avalancheFuji.id;

  // ==============================
  // 🔹 HANDLERS
  // ==============================

  const handleSetValue = async () => {
    // Validation (Task 5)
    if (!inputValue) {
      showNotification("error", "Please enter a value");
      return;
    }

    // Check network (Task 5 - Failure Handling)
    if (isWrongNetwork) {
      showNotification("error", "Wrong network! Please switch to Avalanche Fuji");
      return;
    }

    try {
      writeContract(
        {
          address: CONTRACT_ADDRESS,
          abi: SIMPLE_STORAGE_ABI,
          functionName: "setValue",
          args: [BigInt(inputValue)],
        },
        {
          onSuccess: (hash) => {
            setTxHash(hash);
            showNotification("info", `Transaction submitted! Hash: ${hash.slice(0, 10)}...`);
          },
          onError: (error) => {
            // Handle user rejection (Task 5 - Failure Handling)
            if (error.message.includes("User rejected")) {
              showNotification("error", "Transaction rejected by user");
            } else {
              showNotification("error", `Transaction failed: ${error.message.slice(0, 50)}`);
            }
          },
        }
      );
    } catch (error: any) {
      showNotification("error", `Error: ${error.message}`);
    }
  };

  // Show notification (Task 4 - Toast/Alert)
  const showNotification = (type: "success" | "error" | "info", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000); // Auto-hide after 5 seconds
  };

  // ==============================
  // 🔹 EFFECTS
  // ==============================

  // Handle transaction confirmation (Task 4 - Auto-refresh after success)
  useEffect(() => {
    if (isConfirmed && txHash) {
      showNotification("success", "✅ Transaction confirmed! Refreshing value...");
      // Auto-refresh after success (Task 4)
      setTimeout(() => {
        refetch();
        setInputValue("");
        setTxHash(undefined);
      }, 1000);
    }
  }, [isConfirmed, txHash, refetch]);

  // Handle write errors (Task 5 - Failure Handling)
  useEffect(() => {
    if (writeError) {
      if (writeError.message.includes("User rejected")) {
        showNotification("error", "❌ You rejected the transaction");
      } else {
        showNotification("error", `❌ Error: ${writeError.message.slice(0, 80)}`);
      }
    }
  }, [writeError]);

  // Handle connect errors (Task 5 - Failure Handling)
  useEffect(() => {
    if (connectError) {
      showNotification("error", `Connection failed: ${connectError.message}`);
    }
  }, [connectError]);

  // ==============================
  // 🔹 UI
  // ==============================
  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      {/* Notification Toast (Task 4 - Toast/Alert) */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg max-w-md z-50 ${notification.type === "success" ? "bg-green-600" : notification.type === "error" ? "bg-red-600" : "bg-blue-600"}`}>
          <p className="text-sm">{notification.message}</p>
        </div>
      )}

      <div className="w-full max-w-md border border-gray-700 rounded-lg p-6 space-y-6">
        <h1 className="text-xl font-bold">Day 3 – Frontend dApp (Avalanche)</h1>

        {/* ==========================
            WALLET CONNECT (Task 1)
        ========================== */}
        {!isConnected ? (
          <button onClick={() => connect({ connector: injected() })} disabled={isConnecting} className="w-full bg-white text-black py-2 rounded hover:bg-gray-200 disabled:opacity-50">
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-400">Connected Address</p>
            {/* Shortened address (Task 4 - UX Improvement) */}
            <p className="font-mono text-xs break-all" title={address}>
              {shortenAddress(address)}
            </p>
            <p className="text-xs text-gray-500">Full: {address}</p>

            {/* Network Status (Task 1 & Task 5) */}
            <div className="flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full ${isWrongNetwork ? "bg-red-500" : "bg-green-500"}`}></span>
              <span>{isWrongNetwork ? "❌ Wrong Network" : "✅ Avalanche Fuji"}</span>
            </div>

            {/* Switch Network Button (Task 5 - Wrong Network Handling) */}
            {isWrongNetwork && (
              <button onClick={() => switchChain({ chainId: avalancheFuji.id })} className="w-full bg-orange-600 py-2 rounded text-sm hover:bg-orange-700">
                Switch to Avalanche Fuji
              </button>
            )}

            <button onClick={() => disconnect()} className="text-red-400 text-sm underline hover:text-red-300">
              Disconnect
            </button>
          </div>
        )}

        {/* ==========================
            READ CONTRACT (Task 2)
        ========================== */}
        <div className="border-t border-gray-700 pt-4 space-y-2">
          <p className="text-sm text-gray-400">Contract Value (read)</p>

          {isReading ? <p className="text-gray-500">Loading...</p> : <p className="text-2xl font-bold">{value?.toString() || "0"}</p>}

          <button onClick={() => refetch()} className="text-sm underline text-gray-300 hover:text-white" disabled={isReading}>
            {isReading ? "Refreshing..." : "Refresh value"}
          </button>
        </div>

        {/* ==========================
            WRITE CONTRACT (Task 3)
        ========================== */}
        <div className="border-t border-gray-700 pt-4 space-y-3">
          <p className="text-sm text-gray-400">Update Contract Value</p>

          <input
            type="number"
            placeholder="New value"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full p-2 rounded bg-black border border-gray-600 text-white disabled:opacity-50"
            disabled={isWriting || isConfirming}
          />

          {/* Button with proper states (Task 3 & Task 4 - Disable during pending) */}
          <button onClick={handleSetValue} disabled={isWriting || isConfirming || !isConnected || isWrongNetwork} className="w-full bg-blue-600 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
            {isConfirming ? "⏳ Confirming..." : isWriting ? "📝 Updating..." : "Set Value"}
          </button>

          {/* Transaction Status (Task 4 - Transaction hash & status) */}
          {txHash && (
            <div className="text-xs space-y-1">
              <p className="text-gray-400">Transaction Hash:</p>
              <a href={`https://testnet.snowtrace.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="font-mono text-blue-400 hover:text-blue-300 break-all">
                {txHash}
              </a>
              <p className="text-gray-500">{isConfirming ? "⏳ Waiting for confirmation..." : isConfirmed ? "✅ Confirmed!" : ""}</p>
            </div>
          )}
        </div>

        {/* ==========================
            FOOTNOTE
        ========================== */}
        <p className="text-xs text-gray-500 pt-2">Smart contract = single source of truth</p>
      </div>
    </main>
  );
}
