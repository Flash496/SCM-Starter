// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint public balance;
    uint public savingsGoal;

    event Deposit(uint amount);
    event Withdraw(uint amount);
    event InterestApplied(uint interestAmount);
    event SavingsGoalSet(uint goalAmount);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns(uint) {
        return balance;
    }

    function deposit(uint _amount) public payable {
        uint previousBal = balance;
        require(msg.sender == owner, "You are not the owner of this account");
        balance += _amount;
        assert(balance == previousBal + _amount);
        emit Deposit(_amount);
    }

    error InsufficientBalance(uint balance, uint withdrawAmount);

    function withdraw(uint _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint previousBal = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }
        balance -= _withdrawAmount;
        assert(balance == (previousBal - _withdrawAmount));
        emit Withdraw(_withdrawAmount);
    }

    function calculateAndApplySimpleInterest(uint annualRate, uint timeInMonths) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint principal = balance;
        uint timeInYears = timeInMonths / 12;
        uint interest = (principal * annualRate * timeInYears) / 100;
        balance += interest;
        emit InterestApplied(interest);
    }

    function setSavingsGoal(uint _goal) public {
        require(msg.sender == owner, "You are not the owner of this account");
        require(_goal > balance, "Savings goal must be greater than current balance");
        savingsGoal = _goal;
        emit SavingsGoalSet(_goal);
    }

    function checkProgress() public view returns (uint, uint) {
        uint progress = (balance * 100) / savingsGoal;
        uint remaining = savingsGoal > balance ? savingsGoal - balance : 0;
        return (progress, remaining);
    }
}