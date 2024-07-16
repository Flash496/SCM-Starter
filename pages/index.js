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
  const [interestRate, setInterestRate] = useState("");
  const [interestTime, setInterestTime] = useState("");
  const [savingsGoal, setSavingsGoal] = useState("");
  const [progress, setProgress] = useState(null);
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

  const calculateAndApplyInterest = async () => {
    if (atm && interestRate > 0 && interestTime > 0) {
      try {
        let tx = await atm.calculateAndApplySimpleInterest(interestRate, interestTime);
        await tx.wait();
        getBalance();
      } catch (error) {
        setErrorMessage("Interest calculation failed: " + error.message);
      }
    }
  };

  const setSavingsGoalFunc = async () => {
    if (atm && savingsGoal > 0) {
      try {
        let tx = await atm.setSavingsGoal(savingsGoal);
        await tx.wait();
        checkProgress();
      } catch (error) {
        setErrorMessage("Setting savings goal failed: " + error.message);
      }
    }
  };

  const checkProgress = async () => {
    if (atm) {
      try {
        const [progressPercentage, remaining] = await atm.checkProgress();
        setProgress({ percentage: progressPercentage.toNumber(), remaining: remaining.toNumber() });
      } catch (error) {
        setErrorMessage("Checking progress failed: " + error.message);
      }
    }
  };

  useEffect(() => {
    getWallet();
  }, []);

  useEffect(() => {
    if (atm) {
      getBalance();
    }
  }, [atm]);

  return (
    <main className="container">
      <header><h1>Welcome to the Metacrafters ATM!</h1></header>
      {!account ? (
        <button onClick={connectAccount}>Connect MetaMask Wallet</button>
      ) : (
        <div>
          <p>Your Account: {account}</p>
          <p>Your Balance: {balance}</p>
          <div>
            <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="Deposit Amount" />
            <button onClick={deposit}>Deposit</button>
          </div>
          <div>
            <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="Withdraw Amount" />
            <button onClick={withdraw}>Withdraw</button>
          </div>
          <div>
            <input type="number" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} placeholder="Annual Interest Rate (%)" />
            <input type="number" value={interestTime} onChange={(e) => setInterestTime(e.target.value)} placeholder="Time (Months)" />
            <button onClick={calculateAndApplyInterest}>Calculate and Apply Interest</button>
          </div>
          <div>
            <input type="number" value={savingsGoal} onChange={(e) => setSavingsGoal(e.target.value)} placeholder="Savings Goal" />
            <button onClick={setSavingsGoalFunc}>Set Savings Goal</button>
          </div>
          <button onClick={checkProgress}>Check Progress</button>
          {progress && (
            <div>
              <p>Progress: {progress.percentage}%</p>
              <p>Remaining to goal: {progress.remaining}</p>
            </div>
          )}
          {errorMessage && <p style={{color: 'red'}}>{errorMessage}</p>}
        </div>
      )}
    </main>
  );
}