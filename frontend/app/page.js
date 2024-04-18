'use client'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { abi, contractAddress } from '@/constants';

import { useAccount } from 'wagmi'
import { readContract, prepareWriteContract, writeContract } from '@wagmi/core'

import { useState, useEffect } from 'react';

export default function Home() {

  // The State that will get the number on the blockchain (get method)
  const [votingPhase, setVotingPhase] = useState('');
  const [address, setAddress] = useState('');
  const [voters, setVoters] = useState('');
  const { isConnected,  account} = useAccount();
  const [Proposal, setProposal] = useState('');
  const [proposals, setProposals] = useState('');
  const [numProposal, setNumProposal] = useState(0);
  const [voteDetails, setVoteDetails] = useState('');
  const [winner, setWinner] = useState('');

  useEffect(() => {
    console.log('account', account);
  });

  const fetchVotingPhase = async () => {
    const data = await readContract({
      address: contractAddress,
      abi: abi,
      functionName: 'getPhase',
      account: account, 
    });
    setVotingPhase(data);
  };

  const registerVoter = async () => {
    const { request } = await prepareWriteContract({
      address: contractAddress,
      abi: abi,
      functionName: 'registerVoter',
      account: account, 
      args: [address],
    });
    const { hash } = await writeContract(request);
  };

  const fetchVoters = async () => {
    const data = await readContract({
      address: contractAddress,
      abi: abi,
      functionName: 'getVoters',
      account: account, 
    });
    const result = insertNewlineBefore0x(data);
    setVoters(result);
  };

  const insertNewlineBefore0x = (str) => {
    return str.toString().replace(/0x/g, '\n 0x');
  };


  const goNextPhase = async () => {
    const { request } = await prepareWriteContract({
      address: contractAddress,
      abi: abi,
      functionName: 'goNextPhase',
      account: account, 
    });
    const { hash } = await writeContract(request);
  }

  const submitProposal = async () => {
    const { request } = await prepareWriteContract({
      address: contractAddress,
      abi: abi,
      functionName: 'submitProposal',
      args: [Proposal],
      account: account, 

    });
    const { hash } = await writeContract(request);
  }

  const getProposals = async () => {
    const data = await readContract({
      address: contractAddress,
      abi: abi,
      functionName: 'getProposals',
    });
    setProposals(data);

    
  }

  const reset = async () => {
    const { request } = await prepareWriteContract({
      address: contractAddress,
      abi: abi,
      functionName: 'reset',
    });
    const { hash } = await writeContract(request);
  }

  const voteProposal = async () => {
    const { request } = await prepareWriteContract({
      address: contractAddress,
      abi: abi,
      functionName: 'voteProposal',
      args: [numProposal],
      account: account, 
    });
    const { hash } = await writeContract(request);
  }

  const getVoteDetails = async () => {
    const data = await readContract({
      address: contractAddress,
      abi: abi,
      functionName: 'getVoteDetails',
    });
    setVoteDetails(data);
    
  }

  const getWinner = async () => {
    const data = await readContract({
      address: contractAddress,
      abi: abi,
      functionName: 'getWinner',
    });
    setWinner(data);
  }

  return (
    <>
      <ConnectButton />
      {isConnected ? (
        <div>
          <p>
            <button onClick={fetchVotingPhase}>Fetch Voting Phase</button> :{' '}
            {votingPhase}
          </p>
          <p>
            <button onClick={goNextPhase}>Go Next Phase</button>
          </p>
          <p>
          <button onClick={registerVoter}>Insert an address</button>
          &nbsp;
            <input
              type="text"
              onChange={(e) => setAddress(e.target.value)}
            />{' '}
          </p>
          
          <p>
            <button onClick={fetchVoters}>Fetch Voters</button> :{' '}
            <textarea
              value={voters}
              rows={10}
              cols={50}
              readOnly
            ></textarea>
          </p>
          <p>
            <button onClick={submitProposal}>Submit Proposal</button>
            &nbsp;
            <input
              type="text"
              onChange={(e) => setProposal(e.target.value)}
            />{' '}
          </p>
          <p>
            <button onClick={getProposals}>Get Proposals</button> :{' '}
            {proposals}
          </p>
          <p>
            <button onClick={reset}>Reset</button>
          </p>
          <p>
            <button onClick={voteProposal}>Vote Proposal</button>
            &nbsp;
            <input
              type="number"
              onChange={(e) => setNumProposal(e.target.value)}
            />{' '}
          </p>
          <p>
            <button onClick={getWinner}>Get Winner</button> : {' '}
            {winner}
          </p>
          <p>
            <button onClick={getVoteDetails}>Get Vote Details</button> :{' '}
            {voteDetails}
          </p>
        </div>
      ) : (
        <p>Please connect your Wallet to our DApp 🥰.</p>
      )}
    </>
  );
}