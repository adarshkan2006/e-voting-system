// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Voting {
    // Struct to represent a candidate
    struct Candidate {
        uint256 id;
        string name;
        string party;
        uint256 voteCount;
    }

    // Struct to represent an election
    struct Election {
        uint256 id;
        string name;
        string description;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        uint256 candidateCount;
    }

    // Owner of the contract (admin)
    address public owner;
    
    // Election counter
    uint256 public electionCount;
    
    // Mapping of election ID to Election
    mapping(uint256 => Election) public elections;
    
    // Mapping of election ID to candidate ID to Candidate
    mapping(uint256 => mapping(uint256 => Candidate)) public candidates;
    
    // Mapping to track if a voter has voted in an election
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    
    // Mapping to store registered voters
    mapping(address => bool) public registeredVoters;
    
    // Mapping to store voter details
    mapping(address => string) public voterIds;

    // Events
    event ElectionCreated(uint256 indexed electionId, string name, uint256 startTime, uint256 endTime);
    event CandidateAdded(uint256 indexed electionId, uint256 indexed candidateId, string name, string party);
    event VoteCast(uint256 indexed electionId, uint256 indexed candidateId, address indexed voter);
    event VoterRegistered(address indexed voter, string oderId);
    event ElectionStatusChanged(uint256 indexed electionId, bool isActive);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyRegisteredVoter() {
        require(registeredVoters[msg.sender], "You must be a registered voter");
        _;
    }

    modifier electionExists(uint256 _electionId) {
        require(_electionId > 0 && _electionId <= electionCount, "Election does not exist");
        _;
    }

    modifier electionActive(uint256 _electionId) {
        require(elections[_electionId].isActive, "Election is not active");
        require(block.timestamp >= elections[_electionId].startTime, "Election has not started yet");
        require(block.timestamp <= elections[_electionId].endTime, "Election has ended");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Register a voter with their official ID
    function registerVoter(address _voter, string memory _oderId) public onlyOwner {
        require(!registeredVoters[_voter], "Voter already registered");
        require(bytes(_oderId).length > 0, "Voter ID cannot be empty");
        
        registeredVoters[_voter] = true;
        voterIds[_voter] = _oderId;
        
        emit VoterRegistered(_voter, _oderId);
    }

    // Create a new election
    function createElection(
        string memory _name,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime
    ) public onlyOwner returns (uint256) {
        require(_startTime < _endTime, "Start time must be before end time");
        require(_endTime > block.timestamp, "End time must be in the future");
        
        electionCount++;
        
        elections[electionCount] = Election({
            id: electionCount,
            name: _name,
            description: _description,
            startTime: _startTime,
            endTime: _endTime,
            isActive: true,
            candidateCount: 0
        });
        
        emit ElectionCreated(electionCount, _name, _startTime, _endTime);
        
        return electionCount;
    }

    // Add a candidate to an election
    function addCandidate(
        uint256 _electionId,
        string memory _name,
        string memory _party
    ) public onlyOwner electionExists(_electionId) returns (uint256) {
        require(block.timestamp < elections[_electionId].startTime, "Cannot add candidates after election starts");
        
        elections[_electionId].candidateCount++;
        uint256 candidateId = elections[_electionId].candidateCount;
        
        candidates[_electionId][candidateId] = Candidate({
            id: candidateId,
            name: _name,
            party: _party,
            voteCount: 0
        });
        
        emit CandidateAdded(_electionId, candidateId, _name, _party);
        
        return candidateId;
    }

    // Cast a vote
    function vote(uint256 _electionId, uint256 _candidateId) 
        public 
        onlyRegisteredVoter 
        electionExists(_electionId) 
        electionActive(_electionId) 
    {
        require(!hasVoted[_electionId][msg.sender], "You have already voted in this election");
        require(_candidateId > 0 && _candidateId <= elections[_electionId].candidateCount, "Invalid candidate");
        
        hasVoted[_electionId][msg.sender] = true;
        candidates[_electionId][_candidateId].voteCount++;
        
        emit VoteCast(_electionId, _candidateId, msg.sender);
    }

    // Toggle election status
    function toggleElectionStatus(uint256 _electionId) public onlyOwner electionExists(_electionId) {
        elections[_electionId].isActive = !elections[_electionId].isActive;
        emit ElectionStatusChanged(_electionId, elections[_electionId].isActive);
    }

    // Get election details
    function getElection(uint256 _electionId) public view electionExists(_electionId) returns (
        uint256 id,
        string memory name,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        bool isActive,
        uint256 candidateCount
    ) {
        Election memory election = elections[_electionId];
        return (
            election.id,
            election.name,
            election.description,
            election.startTime,
            election.endTime,
            election.isActive,
            election.candidateCount
        );
    }

    // Get candidate details
    function getCandidate(uint256 _electionId, uint256 _candidateId) 
        public 
        view 
        electionExists(_electionId) 
        returns (uint256 id, string memory name, string memory party, uint256 voteCount) 
    {
        require(_candidateId > 0 && _candidateId <= elections[_electionId].candidateCount, "Invalid candidate");
        Candidate memory candidate = candidates[_electionId][_candidateId];
        return (candidate.id, candidate.name, candidate.party, candidate.voteCount);
    }

    // Get all candidates for an election
    function getAllCandidates(uint256 _electionId) 
        public 
        view 
        electionExists(_electionId) 
        returns (Candidate[] memory) 
    {
        uint256 count = elections[_electionId].candidateCount;
        Candidate[] memory allCandidates = new Candidate[](count);
        
        for (uint256 i = 1; i <= count; i++) {
            allCandidates[i - 1] = candidates[_electionId][i];
        }
        
        return allCandidates;
    }

    // Check if voter has voted in an election
    function hasVoterVoted(uint256 _electionId, address _voter) public view returns (bool) {
        return hasVoted[_electionId][_voter];
    }

    // Get total votes in an election
    function getTotalVotes(uint256 _electionId) public view electionExists(_electionId) returns (uint256) {
        uint256 totalVotes = 0;
        for (uint256 i = 1; i <= elections[_electionId].candidateCount; i++) {
            totalVotes += candidates[_electionId][i].voteCount;
        }
        return totalVotes;
    }

    // Get winner of an election (only after election ends)
    function getWinner(uint256 _electionId) 
        public 
        view 
        electionExists(_electionId) 
        returns (uint256 winnerId, string memory winnerName, uint256 winnerVotes) 
    {
        require(block.timestamp > elections[_electionId].endTime, "Election has not ended yet");
        
        uint256 maxVotes = 0;
        uint256 winningCandidateId = 0;
        
        for (uint256 i = 1; i <= elections[_electionId].candidateCount; i++) {
            if (candidates[_electionId][i].voteCount > maxVotes) {
                maxVotes = candidates[_electionId][i].voteCount;
                winningCandidateId = i;
            }
        }
        
        if (winningCandidateId > 0) {
            return (
                winningCandidateId,
                candidates[_electionId][winningCandidateId].name,
                maxVotes
            );
        }
        
        return (0, "", 0);
    }

    // Transfer ownership
    function transferOwnership(address _newOwner) public onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }
}
