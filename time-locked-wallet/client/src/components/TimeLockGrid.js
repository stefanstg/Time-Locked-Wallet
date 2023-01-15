import React from "react";

const TimeLockGrid = () => {

    const [transactions, setTransactions] = React.useState([]);

    return(
        <>
            <table className="table table-sm table-dark w-65 mt-5">
            <thead>
                <tr>
                    <th scope="col">#</th>
                    <th scope="col">Account</th>
                    <th scope="col">End Timestamp</th>
                    <th scope="col">Value</th>
                    <th scope="col">Amount</th>
                </tr>
            </thead>
            <tbody>
                {transactions.forEach((tx,index) => {
                    <tr>
                        <th scope="row">{index}</th>
                        <td>{tx.account}</td>
                        <td>{tx.address}</td>
                        <td>{tx.timestamp}</td>
                    </tr>
                })}
            </tbody>
            </table>
        </>
    )
}

export default TimeLockGrid;