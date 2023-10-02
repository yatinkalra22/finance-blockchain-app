import { useEffect, useState } from "react";
import { ethers } from "ethers";
import LendingPoolABI from "./LendingPoolABI.json";
import { useSpring, animated } from "react-spring";
import { getMachineId } from "./utils/deviceInfo";
import MobileScreen from "./components/MobileScreen";

function App() {
  const [amount, setAmount] = useState("");
  const [loanAmount, setLoanAmount] = useState("0");
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const fadeIn = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    delay: 500,
  });

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
      const userLoanWei = await contract.loans(signerAddress); // Assuming your contract has a public loans mapping
      const interestWei = await contract.calculateInterest(userLoanWei);
      const totalOwedWei = userLoanWei.add(interestWei);

      setLoanAmount(ethers.utils.formatEther(totalOwedWei));
    } catch (error) {
      console.error("Failed to fetch loan amount:", error);
    }
  }

  // Automatically fetch the loan amount when the component mounts
  useEffect(() => {
    fetchLoanAmount();
    getMachineId();
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
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        LendingPoolABI,
        signer
      );

      const interest = await contract.calculateInterest(
        ethers.utils.parseEther(amount)
      );
      const totalOwedWei = interest.add(ethers.utils.parseEther(amount));
      const totalOwed = ethers.utils.formatEther(totalOwedWei);

      const confirmation = window.confirm(
        `You will borrow ${amount} ETH and will owe ${totalOwed} ETH including 6% interest. Do you agree?`
      );
      if (!confirmation) return;

      await contract.borrow(ethers.utils.parseEther(amount));
    } catch (error) {
      console.error("Failed to borrow:", error);
      alert(error.message);
    }
  }

  async function handleRepay() {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        LendingPoolABI,
        signer
      );

      const principal = await contract.loans(signer.getAddress());
      const interest = await contract.calculateInterest(principal);
      const totalOwed = principal.add(interest);

      await contract.repay({ value: totalOwed });
    } catch (error) {
      console.error("Failed to repay:", error);
      alert(error.message);
    }
  }

  return (
    <div style={styles.mainContainer}>
      <MobileScreen />
      <div style={styles.container}>
        <input
          style={styles.input}
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount in ETH"
        />
        <div style={styles.buttonContainer}>
          <button style={styles.button} onClick={handleDeposit}>
            Deposit
          </button>
          <button style={styles.button} onClick={handleBorrow}>
            Borrow
          </button>
          <button style={styles.button} onClick={handleRepay}>
            Repay
          </button>
        </div>
        <animated.div style={{ ...fadeIn, ...styles.loanInfo }}>
          <strong>Your Current Loan Amount:</strong> {loanAmount} ETH
        </animated.div>
      </div>
    </div>
  );
}

const styles = {
  mainContainer: {
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "column",
    height: "500px",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    margin: "20px 0",
  },
  buttonContainer: {
    display: "flex",
    gap: "10px",
  },
  button: {
    padding: "10px 15px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "transform 0.2s ease-in-out",
    "&:hover": {
      transform: "scale(1.05)",
    },
  },
  loanInfo: {
    marginTop: "20px",
  },
};

export default App;
