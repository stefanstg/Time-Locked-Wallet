import logo from './Ethereum_logo_translucent.svg.png';
import './App.css';
import React from 'react';
import Web3 from 'web3'
import AccountInfo from "./static/contract/AccountInfo.json"
import TimeLock from "./static/contract/TimeLock.json"
import TimeLockGrid from './components/TimeLockGrid';
import Navbar from './components/Navbar';
import ErrorModal from './components/MODALS/ErrorModal';

function App() {

  const [data, setData] = React.useState(null);
  const [valueToLock, setValToLock] = React.useState('');
  const [timeToLock, setTimeToLock] = React.useState('');
  const [timeLockRef, setTimeToLockRef] = React.useState(null);
  const [tx, SetTx] = React.useState([]);
  const [blockTimeStamp, setBlockTimeStamp] = React.useState(0);
  const [web3, setW3] = React.useState();
  const [showErrModal, setShowErrModal] = React.useState(false);
  const [errMsg, setErrMsg ] = React.useState(false);
  const [accountFrom, setAccountFrom] = React.useState({privateKey:""})

  React.useEffect( () => {
      async function testBlockChain() {
        const w3 = new Web3(new Web3.providers.HttpProvider("https://goerli.infura.io/v3/b82288efa48c48fc9a4d1d393d08d9eb"));
        w3.eth.handleRevert = true;
        setW3(w3);
        //console.log(await w3.eth.getAccounts());
    
        const myContract = await new w3.eth.Contract(AccountInfo.abi, AccountInfo.networks[5].address);
    
        //console.log(await myContract.methods.getBalanceOf("0xA21c60bB8b4984f484f26E13a6Ac3DA94f3B0aE8").call());

        // await w3.eth.getBalance("0x6eD9a5465927f53D7Df38Fefd0b561183Ce97cf2", (err, balance) => { 
        //   console.log("0x6eD9a5465927f53D7Df38Fefd0b561183Ce97cf2 Balance: ", w3.utils.fromWei(balance)) 
        //   setData(w3.utils.fromWei(balance));
        // });

        const TimeLockContract = await new w3.eth.Contract(TimeLock.abi, TimeLock.networks[5].address);

        setTimeToLockRef(TimeLockContract);

        var timestamp = await TimeLockContract.methods.getTimestamp().call();
        const d = new Date(timestamp * 1000);
        var datestring = d.getDate()  + "-" + (d.getMonth()+1) + "-" + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes() +  ":" + d.getSeconds();
        setBlockTimeStamp(datestring);
      } 
    
      testBlockChain();

  }, []);

  const handleValueToChange = (e) => {
    setValToLock(e.target.value);
  }

  const handleBlockTimeStamp = (e) => {
    setBlockTimeStamp(e.target.value);
  }

  const handleAccountFromChange = (e) =>{
    setAccountFrom({privateKey: e.target.value})
  }
  const handleErros = (err) => {
    
    if(JSON.stringify(err).indexOf("insufficient") != -1){
      setErrMsg("Nu aveti suficiente fonduri pentru a executa aceasta tranzactie!");

    }else{
      if (typeof err === 'string' || err instanceof String) setErrMsg(err);
      else setErrMsg(JSON.stringify(err))

    }

    setShowErrModal(true);
  }
  const lockFunds = async (e) => {
    
    if(valueToLock < 0.01){
      handleErros("Nu puteti bloca mai putin de 0.01 ETH!!");
      return;
    }

    // const accountFrom = {
    //   privateKey: '75e8dd31b55bb5b6dd14d86f5be261ab71301ff43dd7cf061ccb580f59ea9add'
    // }
    
    //console.log(await w3.eth.getAccounts());

    const w3 = web3;


    //window.ethereum.request({method: "eth_requestAccounts"});

    const timestamp = await timeLockRef.methods.getTimestamp().call();

    setTimeToLock(timestamp);

    console.log(timestamp);

    // timeLockRef.methods.queue(TimeLock.networks[5].address, "0" ,"test()", "0x00", timestamp )
    //   .send({
    //     from:"0xa758E8260Fc8fC6e8e8afA9A11645Bb1EA0337Ac",
    //     value:"10000000000000000",
    //     gas: "6721800",
    // },
    // function(err, result){
    //   if(err){
    //     //console.log(JSON.stringify(err.data[0].reason));
    //     for(var key in err.data){
    //       console.log(err.data[key]);
    //     }
    //   }
    //   console.log(result);

    // });

    const incrementTx = timeLockRef.methods.queue(Web3.utils.toHex(Web3.utils.toWei(valueToLock, 'ether')), 1673734626 ,1673734826, "ceva")
    w3.eth.handleRevert = true
    //incrementTx.handleRevert =true;
   
    await w3.eth.accounts.signTransaction(
      {
        to: TimeLock.networks[5].address,
        data: incrementTx.encodeABI(),
        gas: "6721800",
        value: Web3.utils.toHex(Web3.utils.toWei(valueToLock, 'ether')),
        chainId: '5'
      },
      accountFrom.privateKey,
      (err, result) => {
        console.log(result);
        
        if(err){
          handleErros(err);
          return;
        }
      
        w3.eth.sendSignedTransaction(result.rawTransaction)
        .on('transactionHash', function(hash){
            console.log('transactionHash: ' + hash);
        })
        .on('receipt', function(receipt){
            console.log('receipt: ' + receipt);
        })
        .on('error', function(err){
          console.log(err)
          incrementTx.call({'from': "0xa758E8260Fc8fC6e8e8afA9A11645Bb1EA0337Ac"}).then(() => {
            throw Error ('reverted tx')})
            .catch(revertReason => handleErros(revertReason))
        }); // If a out of gas error, the second parameter is the receipt.
        //SetTx(result);
      }
    );

    
    
   //const createReceipt = await w3.eth.sendSignedTransaction(createTransaction.rawTransaction);

    // console.log(createReceipt); 

  }









  const withdraw = async (e) => {

    // const accountFrom = {
    //   privateKey: '75e8dd31b55bb5b6dd14d86f5be261ab71301ff43dd7cf061ccb580f59ea9add'
    // }
    
    //console.log(await w3.eth.getAccounts());
    
    const w3 = web3;

    // console.log("Current timestamp : " + timestamp);
    // console.log("Set timestamp : " + timeToLock);

    //window.ethereum.request({method: "eth_requestAccounts"});
    w3.eth.handleRevert = true

    const incrementTx = timeLockRef.methods.execute(Web3.utils.toHex(Web3.utils.toWei(valueToLock, 'ether')), 1673734626 ,1673734826, "ceva")
    //incrementTx.handleRevert =true;
    // .send({
    //   from:"0xa758E8260Fc8fC6e8e8afA9A11645Bb1EA0337Ac",
    //   gas: "6721800"
    // },
    // function(err, result){
    //   if(err){
    //     //console.log(JSON.stringify(err.data[0].reason));
    //     for(var key in err.data){
    //       console.log(err.data[key]);
    //     }
    //   }
    //   console.log(result);
    // })
    
    
    await w3.eth.accounts.signTransaction(
      {
        to: TimeLock.networks[5].address,
        data: incrementTx.encodeABI(),
        gas: "6721800",
        chainId: '5'

      },
      accountFrom.privateKey,
      (err, result) => {
        console.log(result);
        w3.eth.sendSignedTransaction(result.rawTransaction)
        .on('transactionHash', function(hash){
          console.log('transactionHash: ' + hash);
        })
        .on('receipt', function(receipt){
            console.log('receipt: ' + receipt);
        })
        .on('error', function(err){
          console.log(err)
          incrementTx.call({'from': "0xa758E8260Fc8fC6e8e8afA9A11645Bb1EA0337Ac"}).then(() => {
            throw Error ('reverted tx')})
            .catch(revertReason => console.log({revertReason}))
        }); // If a out of gas 
        // SetTx(result);
      }
    );
    
    

    //console.log(createTransaction);
    
    //const createReceipt = await w3.eth.sendSignedTransaction(createTransaction.rawTransaction);

    // console.log(createReceipt);

  }

  const getTimeStamp = async (e) => {
  
    timeLockRef.methods.getTimestamp()
    .call(
      {},
      function(err, res){
        console.log(res);
        const d = new Date(res * 1000);
        var datestring = d.getDate()  + "-" + (d.getMonth()+1) + "-" + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes() +  ":" + d.getSeconds();
        setBlockTimeStamp(datestring);
      }
    );

  }

  return (
    <div className="App ">
      <nav className="navbar  w-100 navbar-dark bg-dark row m-0 ">
        <a className="navbar-brand  w-15" >Timestamp : {blockTimeStamp}</a>
        <input  className="form-control mr-sm-2  w-15" 
                type="search" 
                placeholder="Enter your account private key"
                value={accountFrom.privateKey} 
                onChange={handleAccountFromChange} />
        <button className="btn btn-outline-primary my-2 my-sm-0 w-15 m-3" onClick={() => getTimeStamp()} >Connect to Account</button> 
      </nav>

      <ErrorModal show={showErrModal} msg={errMsg} onClose={() => { setShowErrModal(false)}}/>

      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Time LOCK ETH
        </p>

        <div className="input-group mb-3 w-15 mt-3">
          <div className=" left-rounded input-group-prepend ">
            <span className="left-rounded input-group-text" id="inputGroup-sizing-default">Value(ETH)</span>
          </div>
          <input  type="number"  
                  step="0.01"
                  min='0'
                  max='20' 
                  className="form-control" 
                  value={valueToLock} 
                  onChange={handleValueToChange} 
                  aria-label="Default" 
                  aria-describedby="inputGroup-sizing-default"
          />
        </div> 

        <div className="input-group mb-3 w-15 mt-3">
          <div className=" left-rounded input-group-prepend ">
            <span className="left-rounded input-group-text" id="inputGroup-sizing-default">Time</span>
          </div>
          <input  type="number" 
                  step="1"
                  min='10'
                  max='100000000000000000000' 
                  className="form-control" 
                  value={blockTimeStamp} 
                  onChange={handleBlockTimeStamp} 
                  aria-label="Time" 
                  aria-describedby="inputGroup-sizing-default"/>
        </div>

        {/* <input type="text" value={valueToLock} onChange={handleValueToChange}/> */}
        {/* <input type="text" value={timeToLock} onChange={handleTimeToLock}/> */}
        <button onClick={lockFunds} className="btn btn-primary mt-4">Lock funds</button>

        <button onClick={withdraw} className="btn btn-primary mt-4">Withdraw funds</button>

        {/* <button onClick={sendTx} className="btn btn-primary mt-4">Send Tx</button> */}
        <TimeLockGrid />
      </header>
      
    </div>
  );
}

export default App;
