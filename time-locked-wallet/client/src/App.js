import logo from './logo.svg';
import './App.css';
import React from 'react';
import Web3 from 'web3'
import ToptalTokens from "./static/contract/ToptalToken.json"

function App() {

  const [data, setData] = React.useState(null);

  React.useEffect( () => {
      async function testBlockChain() {
        const w3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));

        console.log(await w3.eth.getAccounts());
    
        const myContract = await new w3.eth.Contract(ToptalTokens.abi, ToptalTokens.networks[5777].address);
    
        console.log(await myContract.methods.balanceOf("0x1F5De050D6a32b19926B111B4c28aA01CAF1Ec31").call());
      } 
    
      testBlockChain();

  }, []);


  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Address "0x1deA0E3fcB1fD738404B017B3B794d0a797Fa283" has {data} ToptalTokens
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
