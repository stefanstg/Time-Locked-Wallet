import logo from './Ethereum_logo_translucent.svg.png';
import './App.css';
import React from 'react';
import Web3 from 'web3'
import AccountInfo from "./static/contract/AccountInfo.json"
import TimeLock from "./static/contract/TimeLock.json"
import TimeLockGrid from './components/TimeLockGrid';
import Navbar from './components/Navbar';
import ErrorModal from './components/MODALS/ErrorModal';
import account from './Privatekey'
function App() {

  const [data, setData] = React.useState(null);
  const [valueToLock, setValToLock] = React.useState('');
  const [timeToLock, setTimeToLock] = React.useState('');
  const [passToLock, setPassToLock] = React.useState('');
  const [timeLockRef, setTimeToLockRef] = React.useState(null);
  const [transactions, setTransactions] = React.useState([]);
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

  const handleTimeToLock = (e) => {
    setTimeToLock(e.target.value);
  }


  const handleAccountFromChange = (e) =>{
    setAccountFrom({privateKey: e.target.value, address: account.address})
  }

  const handleErros = (err) => {
    console.log(JSON.stringify(err))
    if(JSON.stringify(err).indexOf("insufficient") != -1){
      setErrMsg("Nu aveti suficiente fonduri pentru a executa aceasta tranzactie!");

    }else{
      if (typeof err === 'string' || err instanceof String) {
        console.log(err)
        
        setErrMsg(err);
      }
      else setErrMsg("Eroare necunoscuta de la Blockchain!")

    }

    setShowErrModal(true);
  }


  //LOCK FUNDS
  const lockFunds = async (e) => {
    
    if(valueToLock < 0.01){
      handleErros("Nu puteti bloca mai putin de 0.01 ETH!!");
      return;
    }


    if(timeToLock < 20){
      handleErros("Trebuie ca timpul ales sa fie mai mare de 20s !");
      return;
    }

    if(passToLock.length < 5 ){
      handleErros("Trebuie ca parola sa fie aiba cel putin 5 caractere");
      return;
    }

    const w3 = web3;

    const timestamp = await timeLockRef.methods.getTimestamp().call();

    //setTimeToLock(timestamp);

    console.log(timestamp);
    const value  = Web3.utils.toHex(Web3.utils.toWei(valueToLock, 'ether'));
    console.log(valueToLock);
    const incrementTx = timeLockRef.methods.queue(value, timestamp + timeToLock, timestamp , passToLock);
    w3.eth.handleRevert = true
   
    await w3.eth.accounts.signTransaction(
      {
        to: TimeLock.networks[5].address,
        data: incrementTx.encodeABI(),
        gas: "5721800",
        value: value,
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
            const reult = transactions.slice();
            result.push({
              account: accountFrom.address,
              value: value,
              end_timestamp: timestamp + timeToLock,
              start_timestamp: timestamp,
              passCode: passToLock
            })
            
            setTransactions(result);
        })
        .on('error', function(err){
          console.log("Aici eroare " , err)
          incrementTx.call({'from': accountFrom.address}).then(() => {
            throw Error ('reverted tx')})
            .catch(revertReason => handleErros(revertReason))
        }); // If a out of gas error, the second parameter is the receipt.
        //SetTx(result);
      }
    );


  }

  //WITHDRAW / UNLOCK

  const withdraw = async (tx) => {
  
    const w3 = web3;

    w3.eth.handleRevert = true

    const incrementTx = timeLockRef.methods.execute(tx.value, tx.end_timestamp,tx.start_timestamp , tx.passCode) 
    
    await w3.eth.accounts.signTransaction(
      {
        to: TimeLock.networks[5].address,
        data: incrementTx.encodeABI(),
        gas: "5721800",
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
            onOperationSuccess(tx);
            console.log('receipt: ' + receipt);
        })
        .on('error', function(err){
          console.log(err)
          incrementTx.call({'from': accountFrom.address}).then(() => {
            throw Error ('reverted tx')})
            .catch(revertReason => console.log({revertReason}))
        }); 
      }
    );
  }

    //CANCEL
  const cancel = async (tx) => {

    const w3 = web3;

    w3.eth.handleRevert = true

    const incrementTx = timeLockRef.methods.cancel(tx.value, tx.end_timestamp, tx.start_timestamp , tx.passCode)
    
    
    await w3.eth.accounts.signTransaction(
      {
        to: TimeLock.networks[5].address,
        data: incrementTx.encodeABI(),
        gas: "5721800",
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
            onOperationSuccess(tx)
            console.log('receipt: ' + receipt);
        })
        .on('error', function(err){
          console.log(err)
          incrementTx.call({'from': accountFrom.address}).then(() => {
            throw Error ('reverted tx')})
            .catch(revertReason => console.log({revertReason}))
        }); 
      }
    );

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

  const onOperationSuccess = (transacion) =>{
    const result = transactions.filter(tx => tx.start_timestamp != transacion.start_timestamp );

    setTransactions(result);
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
                  value={timeToLock} 
                  onChange={handleTimeToLock} 
                  aria-label="Time" 
                  aria-describedby="inputGroup-sizing-default"/>
        </div>

        <div className="input-group mb-3 w-15 mt-3">
          <div className=" left-rounded input-group-prepend ">
            <span className="left-rounded input-group-text" id="inputGroup-sizing-default">PassCode</span>
          </div>
          <input  type="password" 
                  className="form-control" 
                  value={passToLock} 
                  onChange={(e) => setPassToLock(e.target.value)} 
                  aria-label="Time" 
                  aria-describedby="inputGroup-sizing-default"/>
        </div>

        {/* <input type="text" value={valueToLock} onChange={handleValueToChange}/> */}
        {/* <input type="text" value={timeToLock} onChange={handleTimeToLock}/> */}
        <button onClick={lockFunds} className="btn btn-primary mt-4">Lock funds</button>

        <button onClick={withdraw} className="btn btn-primary mt-4">Withdraw funds</button>

        {/* <button onClick={sendTx} className="btn btn-primary mt-4">Send Tx</button> */}
        <TimeLockGrid transactions={transactions} onOperationSuccess={onOperationSuccess}  onWithdraw={withdraw} onCancel={cancel}/>

      </header>
      
    </div>
  );
}

export default App;
