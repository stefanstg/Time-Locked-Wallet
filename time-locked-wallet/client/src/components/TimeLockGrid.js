import React from "react";
import Web3 from 'web3'
import Button
from "react-bootstrap/esm/Button";
const TimeLockGrid = (props) => {

    const [transactions, setTransactions] = React.useState([]);
    
    React.useEffect(
        function()  {
            setTransactions(props.transactions);
        },
        [props.transactions]
    );

    return(
        <>
            <table className="table table-sm table-dark w-65 mt-5">
            <thead>
                <tr>
                    <th scope="col">#</th>
                    <th scope="col">Account</th>
                    <th scope="col">Value</th>
                    <th scope="col">End Timestamp</th>
                    <th scope="col">Start Timestamp</th>
                    <th scope="col">Actions</th>
                </tr>
            </thead>
            {transactions.map((tx, index) =>{
                <tbody>
                {transactions.forEach((tx,index) => {
                    <tr>
                        <th scope="row">{index}</th>
                        <td>{tx.account}</td>
                        <td>{tx.value}</td>
                        <td>{tx.end_timestamp}</td>
                        <td>{tx.start_timestamp}</td>
                        <td>{Web3.utils.toHex(Web3.utils.toWei(tx.value, 'ether'))}</td>
                        <td>
                            <Button variant="success" onClick={() => props.onWithdraw(tx)}>Withdraw</Button>
                            <Button variant="warning" onClick={() => props.onCancel(tx)}>Cancel</Button>
                        </td>
                    </tr>
                })}
            </tbody>
            })}
            
            </table>
        </>
    )
}

export default TimeLockGrid;