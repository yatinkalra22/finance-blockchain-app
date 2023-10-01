import { useEffect, useState } from "react";
import { ethers } from "ethers";
import LendingPoolABI from "./LendingPoolABI.json";

function App() {
  const [amount, setAmount] = useState("");
  const [loanAmount, setLoanAmount] = useState("0");
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  async function fetchLoanAmount() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        LendingPoolABI,
        signer
      );

      const signerAddress = await signer.getAddress();
      const userLoan = await contract.loans(signerAddress); // Assuming your contract has a public loans mapping
      setLoanAmount(ethers.utils.formatEther(userLoan));
    } catch (error) {
      console.error("Failed to fetch loan amount:", error);
    }
  }

  // Automatically fetch the loan amount when the component mounts
  useEffect(() => {
    fetchLoanAmount();
  }, []);

  async function handleDeposit() {
    try {
      // 1. Request MetaMask connection
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // 2. Check the network (assuming you're using localhost in this example)
      const network = await provider.getNetwork();
      if (network.chainId !== 1337) {
        // 1337 is the default chainId for Hardhat's local network
        alert("Please connect to the localhost network on MetaMask.");
        return;
      }

      // 3. Log the signer's address
      const signerAddress = await signer.getAddress();
      console.log("Signer's Address:", signerAddress);

      const contract = new ethers.Contract(
        contractAddress,
        LendingPoolABI,
        signer
      );
      await contract.deposit({ value: ethers.utils.parseEther(amount) });
    } catch (error) {
      console.error("There was an error!", error);
      alert(error.message);
    }
  }

  async function handleBorrow() {
    try {
      // 1. Request MetaMask connection
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        LendingPoolABI,
        signer
      );

      await contract.borrow(ethers.utils.parseEther(amount));
    } catch (error) {
      console.error("Failed to borrow:", error);
      alert(error.message);
    }
  }

  async function handleRepay() {
    try {
      // 1. Request MetaMask connection
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        LendingPoolABI,
        signer
      );

      await contract.repay({ value: ethers.utils.parseEther(amount) });
    } catch (error) {
      console.error("Failed to repay:", error);
      alert(error.message);
    }
  }

  return (
    <div>
      <input
        type="text"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount in ETH"
      />
      <button onClick={handleDeposit}>Deposit</button>
      <button onClick={handleBorrow}>Borrow</button>
      <button onClick={handleRepay}>Repay</button>
      <div>
        <strong>Your Current Loan Amount:</strong> {loanAmount} ETH
      </div>
    </div>
  );
}

export default App;
