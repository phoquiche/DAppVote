//Admin.sol
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract SimpleStorage is Ownable{
     
    WorkflowStatus votingPhase;
    address[] private _listVoters ;
    uint[] listCount;
    Proposal[] listProposal;
    event phaseUpdated(WorkflowStatus _status);
    event hasVoted(address _address);
    
    constructor() Ownable(msg.sender){ 
    votingPhase = WorkflowStatus.RegisteringVoters;
    emit phaseUpdated(WorkflowStatus.RegisteringVoters);
    registerVoter(msg.sender);
    }

    struct Voter{
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    struct Proposal{
        string description;
    }

    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    mapping(address=> Voter) private _voters;
    
    modifier isRegistered{
        require(_voters[msg.sender].isRegistered == true,"you have not been registered by admin");
      _;
    }

    function registerVoter(address _address) public onlyOwner {
        require(_voters[msg.sender].isRegistered == false,"you have already been registered");
        _voters[_address] = Voter(true,false,0);
        _listVoters.push(_address);
    }

    function goNextPhase() public onlyOwner{ 
        if(votingPhase == WorkflowStatus.RegisteringVoters){
            votingPhase = WorkflowStatus.ProposalsRegistrationStarted;
            emit phaseUpdated(WorkflowStatus.ProposalsRegistrationStarted);
        }
        else if(votingPhase == WorkflowStatus.ProposalsRegistrationStarted){
            votingPhase = WorkflowStatus.ProposalsRegistrationEnded;
            emit phaseUpdated(WorkflowStatus.ProposalsRegistrationEnded);
        }
        else if(votingPhase == WorkflowStatus.ProposalsRegistrationEnded){
            votingPhase = WorkflowStatus.VotingSessionStarted;
            emit phaseUpdated(WorkflowStatus.VotingSessionStarted);
        }
        else if(votingPhase == WorkflowStatus.VotingSessionStarted){
            votingPhase = WorkflowStatus.VotingSessionEnded;
            emit phaseUpdated(WorkflowStatus.VotingSessionEnded);
        }
        else if(votingPhase == WorkflowStatus.VotingSessionEnded){
            votingPhase = WorkflowStatus.VotesTallied;
            emit phaseUpdated(WorkflowStatus.VotesTallied);
            countVotes();
        }
    }

    function submitProposal(string calldata _description) public isRegistered{
        require(votingPhase == WorkflowStatus.ProposalsRegistrationStarted,"you can't not submit proposal yet");

        listProposal.push(Proposal(_description));
    }
    
    function getVoters() public view onlyOwner returns(address[] memory){
        return _listVoters;
    }

    function getProposals() public isRegistered view returns (string memory) {
        string memory proposals;
        for (uint i = 0; i < listProposal.length; i++) {
            proposals = string(abi.encodePacked(proposals, Strings.toString(i), " ", listProposal[i].description, "\n"));
        }
        return proposals;
    }

    function getPhase() public isRegistered view returns (string memory){
        if(votingPhase == WorkflowStatus.RegisteringVoters){
            return "RegisteringVoters";
        }
        else if(votingPhase == WorkflowStatus.ProposalsRegistrationStarted){
            return  "ProposalsRegistrationStarted";
        }
        else if(votingPhase == WorkflowStatus.ProposalsRegistrationEnded){
            return  "ProposalsRegistrationEnded";
        }
        else if(votingPhase == WorkflowStatus.VotingSessionStarted){
            return  "VotingSessionStarted";
        }
        else if(votingPhase == WorkflowStatus.VotingSessionEnded){
             return  "VotingSessionEnded";
        }
        else if(votingPhase == WorkflowStatus.VotesTallied){
             return  "VotesTallied";
        }
        return "error";

    }

    function voteProposal(uint proposalId) public isRegistered {
        require(votingPhase == WorkflowStatus.VotingSessionStarted, "you can't vote yet");
        require(_voters[msg.sender].hasVoted == false, "you have already voted");
        _voters[msg.sender].votedProposalId = proposalId;
        _voters[msg.sender].hasVoted = true;
        emit hasVoted(msg.sender);
    }

    function countVotes() private onlyOwner {
        require(votingPhase == WorkflowStatus.VotesTallied, "you can't count vote yet");
        listCount = new uint[](listProposal.length); 
        for (uint i =0; i< _listVoters.length;i++){
            listCount[_voters[_listVoters[i]].votedProposalId] += 1;
        }
    }

    function getVoteDetails() public isRegistered view returns (string memory) {
        require(votingPhase == WorkflowStatus.VotesTallied, "you can't have vote details yet");
        string memory details;
        for (uint i = 0; i < listProposal.length; i++) {
            details = string(abi.encodePacked(details, Strings.toString(listCount[i]), " vote for ", listProposal[i].description, "\n"));
        }
        return details;
    }

    function getWinner() public view returns (string memory){
        require(votingPhase == WorkflowStatus.VotesTallied, "you can't get winnner yet");
        uint max =0;
        uint index = 0;
        for(uint i =0; i< listProposal.length; i++){
            if(listCount[i] > max){
                max = listCount[i];
                index = i;
            }
        }
        return listProposal[index].description;
 
    }

    function reset() public onlyOwner{
        votingPhase = WorkflowStatus.RegisteringVoters;
        emit phaseUpdated(WorkflowStatus.RegisteringVoters);
        for(uint i =0; i< _listVoters.length; i++){
            delete _voters[_listVoters[i]];
        }
        delete _listVoters;
        delete listProposal;
        delete listCount;
    }
     

}