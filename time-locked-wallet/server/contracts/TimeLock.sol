//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

contract TimeLock{
    address public owner; // owner of the contract

    mapping(bytes32 => bool) public txQueued;

    uint public constant MIN_DELAY = 10; // 10 sec usually 1 day - 2 weeks
    uint public constant MAX_DELAY = 1000; // usually 30 days
    uint public constant GRACE_PERIOD = 1000; 

    event Queue(
        bytes32 indexed txId,
        address indexed target, // address of contract
        uint value,   // amount to send
        string func, // function
        bytes data, // param of function
        uint timestamp   // time when transaction can be executed
    );

     event Execute(
        bytes32 indexed txId,
        address indexed target, // address of contract
        uint value,   // amount to send
        string func, // function
        bytes data, // param of function
        uint timestamp   // time when transaction can be executed
    );

    event Cancel(bytes32 indexed txId);

    error AlreadyQueuedError(bytes32 txId);
    error NotOwnerError(); 
    error TimestampNotInRangeError(uint blockTimestamp, uint timestamp); 
    error NotQueuedError(bytes32 txId);
    error TimestampNotPassedError(uint blockTimestamp, uint timestamp);
    error TimestampExpiredError(uint blockTimestamp, uint expiresAt);
    error TxFailedError();

    constructor(){
        owner = msg.sender;
    }

    receive() external payable {} // set up for contract to receive ETH

    modifier onlyOwner(){
        if(msg.sender != owner){
            revert NotOwnerError();
        }
        _; // execute the rest of the code
    }

   function getTxId( // compute the transaction id
        address _target, // address of contract
        uint _value,   // amount to send
        string calldata _func, // function
        bytes calldata _data, // param of function
        uint _timestamp   // time when transaction can be executed
   ) public pure returns (bytes32 txId){
        return keccak256( // calculate hash of param
            abi.encode(
                _target, _value, _func, _data, _timestamp
            )
        );
   }

    function queue(  // queue a transaction
        address _target, // address of contract
        uint _value,   // amount to send
        string calldata _func, // function
        bytes calldata _data, // param of function
        uint _timestamp   // time when transaction can be executed
    ) external onlyOwner{

        bytes32 txId = getTxId(_target, _value, _func, _data, _timestamp); // transaction id

        // check if transaction is queued
        if(txQueued[txId]){
            revert AlreadyQueuedError(txId);
        }

        // check timestamp
        // ---|------------------|---------------|--------
        //   block         block + min     block + max
        if(_timestamp < block.timestamp + MIN_DELAY || 
           _timestamp > block.timestamp + MAX_DELAY 
        ){
            revert TimestampNotInRangeError(block.timestamp, _timestamp);
        }

        // queue tx 
        txQueued[txId] = true;

        // emit the event
        emit Queue(txId, _target, _value, _func, _data, _timestamp);
        
    }    

    function execute(
        address _target, // address of contract
        uint _value,   // amount to send
        string calldata _func, // function
        bytes calldata _data, // param of function
        uint _timestamp   // time when transaction can be executed
    ) external payable onlyOwner returns (bytes memory){ // execute transaction after time passed
        
        bytes32 txId = getTxId(_target, _value, _func, _data, _timestamp); // transaction id
        
        // check tx is queued
        if(!txQueued[txId]){
            revert NotQueuedError(txId);
        }

        // check block.timestamp > _timestamp
        if(block.timestamp < _timestamp){
            revert TimestampNotPassedError(block.timestamp, _timestamp);
        }

        // check if transaction is not "expired"
        // ---|-----------------------|------------------------
        //   timestamp      timestamp + grace period    
        if(block.timestamp > _timestamp + GRACE_PERIOD){
            revert TimestampExpiredError(block.timestamp, _timestamp + GRACE_PERIOD);
        }

        // delete tx from queue
        txQueued[txId] = false;

        bytes memory data;

        if(bytes(_func).length > 0){
            data = abi.encodePacked(
                bytes4(keccak256(bytes(_func))), _data // hash(4 bytes of function and append data)
            );
        } else{
            data = _data;
        }

        // excute the tx
        (bool sent, bytes memory response) = _target.call{value: _value}(data);
        if(!sent){
            revert TxFailedError();
        }

        emit Execute(txId, _target, _value, _func, _data, _timestamp);

        return response;

    }

    function cancel(bytes32 _txId) external onlyOwner {
        if(!txQueued[_txId]){
            revert NotQueuedError(_txId);
        }

        txQueued[_txId] = false;

        emit Cancel(_txId);

    }  
}

contract TestTimeLock{
    address public timeLock;

    constructor(address _timeLock){
        timeLock = _timeLock;
    }

    function test() external {
        require(msg.sender == timeLock, "not timelock"); //called only by the TimeLock contract
        // more code such as
        // - upgrade contract
        // - transfer funds
        
    }

    function getTimestamp() external view returns (uint){
        return block.timestamp + 100;
    }
}

