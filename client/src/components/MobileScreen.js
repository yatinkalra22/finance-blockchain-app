import { Box } from "@mui/material";
import ChatUI from "./Chat";
import MobileImage from "../assets/mobile-screen.png";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import LendingPoolABI from "../LendingPoolABI.json";

export default function MobileScreen() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState();
  const [provider, setProvider] = useState();

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const loadProvider = async () => {
      try {
        if (provider) {
          window.ethereum.on("chainChanged", () => {
            window.location.reload();
          });

          window.ethereum.on("accountsChanged", () => {
            window.location.reload();
          });
          await provider.send("eth_requestAccounts", []);
          const signer = provider.getSigner();
          const address = await signer.getAddress();
          console.log(address);
          setAccount(address);
          let contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

          const contract = new ethers.Contract(
            contractAddress,
            LendingPoolABI,
            signer
          );
          setContract(contract);
          setProvider(provider);
        } else {
          console.error("Metamask is not installed");
        }
      } catch (error) {
        console.log("error: ", error);
      }
    };
    provider && loadProvider();
  }, []);

  return (
    <Box className="container">
      <Box
        className="mobile"
        sx={{
          position: "absolute",
          height: "88%",
        }}
      >
        <Box
          className="actions"
          sx={{
            position: "absolute",
            zIndex: "100",
            left: "25px",
            height: "100%",
            top: "45px",
            right: "25px",
          }}
        >
          <ChatUI contract={contract} />
        </Box>
        <img src={MobileImage} alt="text" height="100%" />
      </Box>
    </Box>
  );
}
