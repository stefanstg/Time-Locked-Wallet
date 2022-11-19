# Blockchain-Project

Time Locked Wallet

Short description

         The idea behind time-locked wallets is to lock the funds for a set period of time. The amount locked in the wallet can only be withdrawn when the set date is passed and only by the authorized person/beneficiary. 
Technical specification

We will implement a wallet that would keep crypto assets for a certain amount of time as a web app (https://eth-hot-wallet.com/).
     One container will be dealing with keystore operations. The ETH-Lightwallet package provides the keystore. All related operations including keys, seeds, encryption, importing, exporting are done in this section. (it will be adapted along the way depending on the evolution).
     Other container will store the SendToken, a modal that appears while the user selects to send Ether/tokens. The modal includes some basic input verification, like amount and Ethereum address check (it will be adapted along the way depending on the evolution)
     When we are sending a token on Ethereum, we are interacting with a smart contract. To communicate with a smart contract we need Solidity. The Contract Application Binary Interface (ABI) is the standard way to interact with contracts in the Ethereum ecosystem, both from outside the blockchain and for contract-to-contract interaction.
The timelock is based upon a queue that will use a hash of the address, amount and time parameters.
To ensure that the project is working  as expected we will create test to check if the smart contract meets all the time lock requirements: enqueue token minting & cancel a queued mint. 

Technologies
      Etherium, Node.js, Truffle Framework, Solidity, Web3.js
 
Security policies

Attacks on crypto wallets are based on:
•	stealing the locally stored passphrase or private key ⇒ prevention with data at rest encryption
•	overlay attack ⇒ restrict screen sharing
•	MITM attack ⇒ data in transit should be protected with AES-256 encryption, and secure socket layer (SSL) / transport layer security (TLS) must be strictly enforced for all communications.
•	wallet theft ⇒ enforce smart risk control withdraw system & 2FA authentication

Motivation

 Prevention of selling assets when market crashes
People tend to sell their crypto. In this way, people won’t be able to withdraw for a certain amount of time.
 Death of the owner
     If you want to leave your savings to your family, in case something happens to you, then you can create a wallet using cryptocurrency, give it a password and set the system to unblock the account after the death of the owner. So, they will not receive money before the due date, and taking into account the growth of cryptocurrencies, this contribution can be calculated as the best deposit.
 Reaching the age of majority
Many parents want to provide their children with all the best, so they create deposits. If you put a large amount into your account at birth, then a large amount will accumulate by the time kids come of age. An electronic wallet is better than the conditions offered by the bank because it does not take commissions and allows you to make investments in cryptocurrency.
 Pension or trust fund.
Unfortunately, not all countries have a well-established pension system. If you want to secure your future, then the ideal solution is to create a wallet, replenish it regularly, but not be able to receive money until a certain age.
