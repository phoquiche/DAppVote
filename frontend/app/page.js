'use client'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { abi, contractAddress } from '@/constants';

import { useAccount } from 'wagmi'
import { readContract, prepareWriteContract, writeContract } from '@wagmi/core'

import { useState } from 'react';

export default function Home() {

  // The State that will get the number on the blockchain (get method)
  const [votingPhase, setVotingPhase] = useState('');
  const [address, setAddress] = useState('');
  const [voters, setVoters] = useState('');
  const { isConnected } = useAccount();

  const fetchVotingPhase = async () => {
    const data = await readContract({
      address: contractAddress,
      abi: abi,
      functionName: 'getPhase',
    });
    setVotingPhase(data);
  };

  const registerVoter = async () => {
    const { request } = await prepareWriteContract({
      address: contractAddress,
      abi: abi,
      functionName: 'registerVoter',
      args: [address],
    });
    const { hash } = await writeContract(request);
  };

  const fetchVoters = async () => {
    const data = await readContract({
      address: contractAddress,
      abi: abi,
      functionName: 'getVoters',
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
    });
    const { hash } = await writeContract(request);
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
        </div>
      ) : (
        <p>Please connect your Wallet to our DApp 🥰.</p>
      )}
    </>
  );
}