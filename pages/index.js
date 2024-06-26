import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [time, setTime] = useState("");
  const [simpleInterest, setSimpleInterest] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts.length > 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
      getATMContract();
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      const balance = await atm.getBalance();
      setBalance(balance.toNumber());
    }
  };

  const deposit = async () => {
    if (atm && depositAmount > 0) {
      try {
        let tx = await atm.deposit(depositAmount);
        await tx.wait();
        getBalance();
      } catch (error) {
        setErrorMessage("Deposit failed: " + error.message);
      }
    }
  };

  const withdraw = async () => {
    if (atm && withdrawAmount > 0) {
      try {
        let tx = await atm.withdraw(withdrawAmount);
        await tx.wait();
        getBalance();
      } catch (error) {
        setErrorMessage("Withdrawal failed: " + error.message);
      }
    }
  };

  const calculateSimpleInterest = async () => {
    if (atm && principal > 0 && rate > 0 && time > 0) {
      const interest = await atm.calculateSimpleInterest(principal, rate, time);
      setSimpleInterest(interest.toNumber());
    }
  };

  useEffect(() => {
    getWallet();
  }, [ethWallet]);

  useEffect(() => {
    if (atm) getBalance();
  }, [atm]);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      <div>
        {!ethWallet && <p>Please install MetaMask to use this ATM.</p>}
        {!account && ethWallet && (
          <button onClick={connectAccount}>Connect MetaMask Wallet</button>
        )}
        {account && (
          <div>
            <p>Your Account: {account}</p>
            <p>Your Balance: {balance}</p>
            <div className="input-group">
              <input
                type="number"
                placeholder="Deposit Amount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
              <button onClick={deposit}>Deposit</button>
            </div>
            <div className="input-group">
              <input
                type="number"
                placeholder="Withdraw Amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
              <button onClick={withdraw}>Withdraw</button>
            </div>
            <div className="input-group">
              <input
                type="number"
                placeholder="Principal"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
              />
              <input
                type="number"
                placeholder="Annual Interest Rate (%)"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
              <input
                type="number"
                placeholder="Time (Months)"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
              <button onClick={calculateSimpleInterest}>
                Calculate Amount to be repaid
              </button>
            </div>
            {simpleInterest !== null && (
              <p>Repayment Amount: {simpleInterest}</p>
            )}
            {errorMessage && <p className="error">{errorMessage}</p>}
          </div>
        )}
      </div>
      <style jsx>{`
        .container {
          text-align: center;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        header h1 {
          margin-bottom: 20px;
        }
        .input-group {
          margin: 10px 0;
        }
        .input-group input {
          padding: 10px;
          margin-right: 10px;
          width: calc(100% - 110px);
        }
        .input-group button {
          padding: 10px;
          width: 100px;
        }
        .error {
          color: red;
        }
      `}</style>
    </main>
  );
}
