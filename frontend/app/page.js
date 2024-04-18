'use client'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { abi, contractAddress } from '@/constants';

import { useAccount } from 'wagmi'
import { readContract, prepareWriteContract, writeContract } from '@wagmi/core'

import { useState } from 'react';

export default function Home() {

  // The State that will get the number on the blockchain (get method)
  const [getVotingPhase, setVotingPhase] = useState('');
  const [setAddress, setSetAddress] = useState();


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
        args: [setAddress],
      });
      const { hash } = await writeContract(request);
      console.log('Transaction hash:', hash);
      // Optionally, you can update the UI or display a success message
  };


  return (
    <>
      <ConnectButton />
      {isConnected ? (
        <div>
          <p><button onClick={fetchVotingPhase}>Fetch Voting Phase</button> : {getVotingPhase}</p>
          <p><input type="string" onChange={(e) => setSetAddress(e.target.value)} /> <button onClick={registerVoter}>Insert an address</button></p>
        </div>
      ) : (
        <p>Please connect your Wallet to our DApp.</p>
      )}
    </>
  )
}
