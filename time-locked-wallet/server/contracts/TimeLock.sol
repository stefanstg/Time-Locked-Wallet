//SPDX-License-Identifier:UNLICENSED

pragma solidity ^0.8.0;

error NotOwnerError();
error AlreadyQueuedError(bytes32 txId);
error TestError(bytes32 txId);
error NotQueuedError(bytes32 txId);
error TimestampNotPassedError(uint blockTimestmap, uint timestamp);
error TxFailedError();
error NoValidAddress(address _target);

contract TimeL {
    

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

    event Cancel( 
        bytes32 indexed txId,
        address indexed target,
        uint value,
        uint timestamp,
        uint start_timestamp);

    uint public MIN_COMMISION_RATE = 20; 
   
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

        emit Queue(txId, msg.sender, _value, _timestamp, start_timestamp);
    }

    function transferFunds(
        address _target,
        uint _value
    ) public payable {

        if(_target == address(0)){
            revert("Adresa aceasta nu exista!!!");
        }

        payable(_target).transfer(_value);

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
            revert("Perioada de timp nu a expirat inca! Mai trebuie sa asteptati!");
        }

        queued[txId] = false;
        //Eliberam memoria pentru a nu creste costul executiei unei functii

        //payable(msg.sender).transfer(_value);
        transferFunds(msg.sender, _value);

        emit Execute(txId, msg.sender, _value, _timestamp, start_timestamp);

    }

    function cancel(
        uint _value,
        uint _timestamp,
        uint start_timestamp,
        string memory _passCode
    ) external payable {
        bytes32 txId = getTxId(msg.sender, _value, _timestamp, _passCode, start_timestamp);

        if (!queued[txId]) {
            revert("Acesta nu este un lock valid! Adresa sau parola de deblocare nu sunt corecte!");
        }
        emit Cancel(txId, msg.sender, _value, _timestamp, start_timestamp);
        //Calculam cat la suta din timpul total reprezinta timpul scurs pana la operatia de cancel
        uint x = ((block.timestamp - start_timestamp) / (_timestamp - start_timestamp)) * 100;
        //Valoare minima a comisionului
        uint commision = MIN_COMMISION_RATE;
        
        //Daca nu a trecut nici macar 1% din timpul stabilit se ia comisionul maxim adica 50%
        if(x <= 1){
            commision = 50;
        }

        //Comision inmtre 1% si 91% variaza liniar
        if(x > 1 && x < 91){
            commision = (1-x + 150) /3; 
        }

        uint commision_val = (_value * commision) / 100;

        //O parte din valoarea blocata revine owner-ului contractului
        transferFunds(owner, commision_val);
        //payable(owner).transfer(commision_val);

        //Ce ramane i se restituie celui care a facut lock-ul
        transferFunds(msg.sender, _value - commision_val);
        //payable(msg.sender).transfer(_value - commision_val);
        

        queued[txId] = false;

        //delete queued[txId];
        
        emit Cancel(txId, msg.sender, _value, _timestamp, start_timestamp);
    }

    function getTimestamp() external view returns (uint){
        
        return block.timestamp;

    }
}

