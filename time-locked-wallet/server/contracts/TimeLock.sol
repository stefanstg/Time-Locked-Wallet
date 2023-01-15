//SPDX-License-Identifier:UNLICENSED

pragma solidity ^0.8.0;

error NotOwnerError();
error AlreadyQueuedError(bytes32 txId);
error TestError(bytes32 txId);
error TimestampNotInRangeError(uint blockTimestamp, uint timestamp);
error NotQueuedError(bytes32 txId);
error TimestampNotPassedError(uint blockTimestmap, uint timestamp);
error TimestampExpiredError(uint blockTimestamp, uint expiresAt);
error TxFailedError();
error NoValidAddress(address _target);

contract TimeLock {
    

    event Queue(
        bytes32 indexed txId,
        address indexed target,
        uint value,
        uint timestamp,
        uint start_timestamp
        
    );
    event Execute(
        bytes32 indexed txId,
        address indexed target,
        uint value,
        uint timestamp,
        uint start_timestamp
    );

    event Value(
        uint256 val
    );

    event Cancel(bytes32 indexed txId);

    uint public constant COMMISION_RATE = 10; // seconds
   

    struct locked{
            uint256 expire;
            uint256 amount;
        }

    mapping(address => locked) users;

    address public owner;
    // tx id => queued
    mapping(bytes32 => bool) public queued;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert NotOwnerError();
        }
        _;
    }

    receive() external payable {}

    function getTxId(
        address _target,
        uint _value,
        uint _timestamp,
        string memory _passCode,
        uint start_timestamp
    ) public pure returns (bytes32) {
        return keccak256(abi.encode(_target, _value, _timestamp, _passCode, start_timestamp));
    }

    /**
     * @param _value Amount of ETH to send
     * @param  _passCode Safety passCode to be able to unlock the funds
     * @param _timestamp The timestamp moment after which the transaction can be executed.
     * @param start_timestamp The moment of the lock
     * @param _passCode A password for enhancing the security of the lock and that allows to unlock the money sooner

     */
    function queue(
        uint _value,
        uint _timestamp,
        uint start_timestamp,
        string memory _passCode
    ) external payable  returns (bytes32 txId) {

        txId = getTxId(msg.sender, _value, _timestamp, _passCode, start_timestamp);
        if (queued[txId]) {
            revert("Acest lock exista deja!!");
        }

        queued[txId] = true;

        locked storage userInfo = users[msg.sender];
        //GRESIT DE CORECTAT!!!!
        userInfo.expire = block.timestamp + _timestamp;
        userInfo.amount = msg.value;

        emit Queue(txId, msg.sender, _value, _timestamp, start_timestamp);
    }

    function transferFunds(
        address _target
    ) public payable returns(bool) {
        //revert NoValidAddress(_target);

        if(_target == address(0)){
            revert NoValidAddress(_target);
        }

        payable(_target).transfer(msg.value);

        return true;
    }

    function execute(
        uint _value,
        uint _timestamp,
        uint start_timestamp,
        string memory _passCode
    ) external payable  {
        bytes32 txId = getTxId(msg.sender, _value, _timestamp, _passCode, start_timestamp);


        if (!queued[txId]) {
            revert("Acesta nu este un lock valid! Adresa sau parola de deblocare nu sunt corecte!");
        }

        if(block.timestamp <= _timestamp){
            revert(string(bytes.concat(bytes("Perioada de timp nu a expirat inca! Mai trebuie sa asteptati!"), "-", bytes(string(abi.encode(block.timestamp - _timestamp))))) );
        }

        locked storage userInfo = users[msg.sender];
        uint256 value = userInfo.amount;

        userInfo.expire = 0;
        userInfo.amount = 0;
        queued[txId] = false;

        payable(msg.sender).transfer(value);

        emit Execute(txId, msg.sender, _value, _timestamp, start_timestamp);

    }

    function cancel(bytes32 _txId) external  {
        if (!queued[_txId]) {
            revert NotQueuedError(_txId);
        }

        queued[_txId] = false;

        emit Cancel(_txId);
    }

    function getTimestamp() external view returns (uint){
        
        //emit Value(block.timestamp);
        return block.timestamp;

    }
}

//  Fie t = 100 ( in cazu de mai sus)
//  Fie x intervalu ales dupa cat timp vrea sa scoata
//  x = 10
//  => p ( procentul ) = (t-x)/100
//  si bagam un if else
//  if p>=90 eth=50
//  elif p>=70 eth=40
//  elif op>=50 eth=30
//  elif p>=30 eth=20
//  elif p < 10 eth 10
//  Ne auzim?