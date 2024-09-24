"use client"
import { Buffer } from 'buffer'
import {
  AccountId,
  AccountInfo,
  AccountInfoQuery,
  Client,
  Hbar,
  LedgerId,
  PublicKey,
  TransactionId,
  TransferTransaction,
} from '@hashgraph/sdk'
import { SessionTypes, SignClientTypes } from '@walletconnect/types'

import {
  HederaSessionEvent,
  HederaJsonRpcMethod,
  queryToBase64String,
  DAppConnector,
  HederaChainId,
  verifyMessageSignature,
  ExtensionData,
  DAppSigner,
  SignMessageParams,
  SignAndExecuteTransactionParams,
  transactionToBase64String,
  SignAndExecuteQueryParams,
  ExecuteTransactionParams,
} from '@hashgraph/hedera-wallet-connect'
import React, { useEffect, useMemo, useState } from 'react'
import Modal from '../_components/Modal'
import  useHederaTransactions  from '../../hooks/useTransactions'
import { connect } from "http2";
interface AccountSelectorProps {
  accounts: AccountId[]
  selectedAccount: AccountId | null
  onSelect: (accountId: AccountId) => void
}

const AccountSelector = ({ accounts, selectedAccount, onSelect }: AccountSelectorProps) => {
  return (
    <label>
      Signer Account:
      <select
      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200  sm:text-sm text-black"
        value={selectedAccount?.toString()}
        onChange={(e) => onSelect(AccountId.fromString(e.target.value))}
      >
        {accounts?.map((accountId, index) => {
          return (
            <option key={index} value={accountId?.toString()}>
              {accountId?.toString()}
            </option>
          );
        })}
      </select>
    </label>
  )
}
export default function Hederatransactions() {


  const [selectedSigner, setSelectedSigner] = useState<DAppSigner | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)



  // Form data states
  const [signerAccount, setSignerAccount] = useState<AccountId | null >(null)
  const [receiver, setReceiver] = useState<AccountId | null >(null)
  const [signerPrivateKey, setSignerPrivateKey] = useState('')
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [publicKey, setPublicKey] = useState('')
  const [selectedTransactionMethod, setSelectedTransactionMethod] = useState(
    'hedera_executeTransaction',
  )

  // Modal states
  const [isModalOpen, setModalOpen] = useState<boolean>(false)
  const [isModalLoading, setIsModalLoading] = useState<boolean>(false)
  const [modalData, setModalData] = useState<any>(null)

  useEffect(() => {
    const state = JSON.parse(localStorage.getItem('hedera-wc-demos-saved-state') || '{}')
    if (state) {
      setMessage(state['message'])
      setPublicKey(state['publicKey'])
      setAmount(state['amount'])
      setReceiver(state['receiver'])
    }
  }, [])

  const saveData = () => {
    localStorage.setItem(
      'hedera-wc-demos-saved-state',
      JSON.stringify({
        message,
        publicKey,
        amount,
        receiver,
      }),
    )
  }

  const modalWrapper = async (fn: () => Promise<any>) => {
    try {
      saveData()
      setModalOpen(true)
      setIsModalLoading(true)
      const result = await fn()
      setModalData({
        status: 'Success',
        message: 'The request has been executed successfully',
        result,
      })
    } catch (error) {
      console.error('Error signing message: ', error)
      setModalData({ status: 'Error', message: error.message })
    } finally {
      setIsModalLoading(false)
    }
  }
const {handleGetNodeAddresses,handleInitConnector,handleConnect,handleExecuteTransaction,handleDisconnectSessions,handleHederaSignTransaction,signers,dAppConnector,handleSignMessage,handleExecuteQuery,handleHederaSignAndExecuteTransaction} = useHederaTransactions();

  const handleClearData = () => {
    localStorage.removeItem('hedera-wc-demos-saved-state')
    setMessage('')
    setPublicKey('')
    setAmount('')
    setReceiver('')
  }

  const disableButtons = useMemo(
    () => !dAppConnector || !selectedSigner,
    [dAppConnector, selectedSigner],
  )

  return (

<main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
  <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
      <section className="bg-[#2a1a4d] p-6 rounded-lg shadow-lg">
        <button onClick={handleInitConnector} className="w-full p-2 bg-[#4c2e8a] rounded hover:bg-[#5e4f99] transition">
          Initialize WalletConnect
        </button>
      </section>

      <section className="bg-[#2a1a4d] p-6 rounded-lg shadow-lg">
        <fieldset>
          <legend className="font-bold">Connected Wallets</legend>
          <ul className="list-disc pl-5">
            {/* {sessions.map((session, index) => (
              <li key={index}>
                <p>Session ID: {session.topic}</p>
                <p>Wallet Name: {session.peer.metadata.name}</p>
                <p>Account IDs: {session.namespaces?.hedera?.accounts?.join(' | ')}</p>
              </li>
            ))} */}
          </ul>
          <button onClick={() => handleConnect()} className="mt-4 w-full p-2 bg-[#4c2e8a] rounded hover:bg-[#5e4f99] transition">
            Open WalletConnect Modal
          </button>
        </fieldset>
      </section>
    </div>

    <section className="bg-[#2a1a4d] p-6 rounded-lg shadow-lg">
      <fieldset>
        <legend className="font-bold">1. hedera_getNodeAddresses</legend>
        <button onClick={() => modalWrapper(async () => handleGetNodeAddresses())} className="w-full p-2 bg-[#4c2e8a] rounded hover:bg-[#5e4f99] transition">
          hedera_getNodeAddresses
        </button>
      </fieldset>
    </section>

    <section className="bg-[#2a1a4d] p-6 rounded-lg shadow-lg">
      <h2 className="font-bold">Transaction methods:</h2>
      <label className="block">
        Select a transaction method:
        <select
          value={selectedTransactionMethod}
          onChange={(e) => setSelectedTransactionMethod(e.target.value)}
          className="mt-2 p-2 rounded bg-[#4c2e8a] text-white"
        >
          <option value={'hedera_executeTransaction'}>2. hedera_executeTransaction</option>
          <option value={'hedera_signAndExecuteTransaction'}>5. hedera_signAndExecuteTransaction</option>
          <option value={'hedera_signTransaction'}>6. hedera_signTransaction</option>
        </select>
      </label>
      
      <div className="mt-4">
        <fieldset className="bg-[#3a2b55] p-4 rounded">
          <label className="block">
            Transaction type:
            <select className="mt-2 p-2 rounded bg-[#4c2e8a] text-white">
              <option value="hbar-transfer">Hbar Transfer</option>
            </select>
          </label>

          {selectedTransactionMethod === 'hedera_executeTransaction' ? (
            <>
              <label className="block">
                Signer AccountId:
                <input
                  value={signerAccount}
                  onChange={(e) => setSignerAccount(e.target.value)}
                  required
                  className="mt-2 p-2 rounded bg-[#4c2e8a] text-white"
                />
              </label>
              <label className="block">
                Signer Private Key:
                <input
                  value={signerPrivateKey}
                  onChange={(e) => setSignerPrivateKey(e.target.value)}
                  required
                  className="mt-2 p-2 rounded bg-[#4c2e8a] text-white"
                />
              </label>
            </>
          ) : (
            <AccountSelector
              accounts={signers.map((signer) => signer.getAccountId())}
              selectedAccount={selectedSigner?.getAccountId() || null}
              onSelect={(accountId) => setSelectedSigner(dAppConnector?.getSigner(accountId)!)}
            />
          )}
          
          <label className="block">
            Send to address:
            <input
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              required
              className="mt-2 p-2 rounded bg-[#4c2e8a] text-white"
            />
          </label>
          <label className="block">
            Amount in Hbar:
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="mt-2 p-2 rounded bg-[#4c2e8a] text-white"
            />
          </label>
        </fieldset>

        <button
          onClick={() => {
            modalWrapper(async () => {
              switch (selectedTransactionMethod) {
                case 'hedera_executeTransaction':
                  if (signerAccount && receiver) {
                    return handleExecuteTransaction(signerPrivateKey, signerAccount, receiver, Number(amount));
                  }
                case 'hedera_signAndExecuteTransaction':
                  return handleHederaSignAndExecuteTransaction(receiver, Number(amount));
                case 'hedera_signTransaction':
                  if (receiver && amount) {
                    return handleHederaSignTransaction(receiver, Number(amount));
                  }
              }
            });
          }}
          className="mt-4 w-full p-2 bg-[#4c2e8a] rounded hover:bg-[#5e4f99] transition"
        >
          Submit to wallet
        </button>
      </div>
    </section>
    <section className="bg-[#2a1a4d] p-6 rounded-lg shadow-lg">
  <fieldset>
    <legend className="font-bold">3. hedera_signMessage</legend>
    <AccountSelector
      accounts={signers.map((signer) => signer.getAccountId())}
      selectedAccount={selectedSigner?.getAccountId() || null}
      onSelect={(accountId) => setSelectedSigner(dAppConnector?.getSigner(accountId)!)}
    />
    
    <label className="block">
      Message:
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        className="mt-2 p-2 rounded bg-[#4c2e8a] text-white"
      />
    </label>
    
    <label className="block">
      Hedera Testnet Public Key:
      <input
        value={publicKey}
        onChange={(e) => setPublicKey(e.target.value)}
        required
        className="mt-2 p-2 rounded bg-[#4c2e8a] text-white"
      />
    </label>
    
    <p className="mt-2 text-sm">The public key for the account is used to verify the signed message</p>
  </fieldset>
  
  <button
    onClick={() => modalWrapper(async () => { handleSignMessage(message, publicKey); })}
    className="mt-4 w-full p-2 bg-[#4c2e8a] rounded hover:bg-[#5e4f99] transition"
  >
    Submit to wallet
  </button>
</section>

    {/* Additional sections go here, styled similarly... */}

    <Modal title="Send Request" isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
      {isModalLoading ? (
        <div className="loading">
          <p>Approve request on wallet</p>
          <span className="loader"></span>
        </div>
      ) : (
        <div>
          <h3>{modalData?.status}</h3>
          <p>{modalData?.message}</p>
          <pre>{JSON.stringify(modalData?.result, null, 2)}</pre>
        </div>
      )}
    </Modal>
  </div>
</main>




  );
}
