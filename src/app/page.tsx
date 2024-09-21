"use client"
import Link from "next/link";

import { LatestPost } from "~/app/_components/post";
import { getServerAuthSession } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
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
import Modal from './_components/Modal'
import { connect } from "http2";
export default function Home() {
  // const hello = await api.post.hello({ text: "from tRPC" });
  // const session = await getServerAuthSession();

  // void api.post.getLatest.prefetch();
  // Connector data states
  const [projectId, setProjectId] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [icons, setIcons] = useState('')

  // Session management states
  const [dAppConnector, setDAppConnector] = useState<DAppConnector | null>(null)
  const [sessions, setSessions] = useState<SessionTypes.Struct[]>([])
  const [signers, setSigners] = useState<DAppSigner[]>([])
  const [selectedSigner, setSelectedSigner] = useState<DAppSigner | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Extension Wallet Buttons
  const [extensions, setExtensions] = useState<ExtensionData[]>([])

  // Form data states
  const [signerAccount, setSignerAccount] = useState('')
  const [receiver, setReceiver] = useState('')
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
      setProjectId(state['projectId'])
      setName(state['name'])
      setDescription(state['description'])
      setUrl(state['url'])
      setIcons(state['icons'])
      setMessage(state['message'])
      setPublicKey(state['publicKey'])
      setAmount(state['amount'])
      setReceiver(state['receiver'])
    }
  }, [])

  useEffect(() => {
    if (projectId && name && description && url && icons) {
      handleInitConnector()
    }
  }, [projectId])

  useEffect(() => {
    if (dAppConnector) {
      setSigners(dAppConnector.signers)
    }
  }, [sessions])

  const saveData = () => {
    localStorage.setItem(
      'hedera-wc-demos-saved-state',
      JSON.stringify({
        projectId,
        name,
        description,
        url,
        icons,
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

    /**
   * WalletConnect methods
   */

  // 1. hedera_getNodeAddresses
  const handleGetNodeAddresses = async () => {
    modalWrapper(async () => {
      const nodeAddresses = await dAppConnector!.getNodeAddresses()
      console.log('NodeAddresses: ', nodeAddresses)
      return nodeAddresses
    })
  }

  // 2. hedera_executeTransaction
  const handleExecuteTransaction = async () => {
    if (!signerPrivateKey) throw new Error('Signer private key is required')
    const client = Client.forTestnet()
    client.setOperator(signerAccount, signerPrivateKey)

    const hbarAmount = new Hbar(Number(amount))
    const transaction = new TransferTransaction()
      .setTransactionId(TransactionId.generate(signerAccount))
      .addHbarTransfer(signerAccount, hbarAmount.negated())
      .addHbarTransfer(receiver, hbarAmount)
      .freezeWith(client)

    const signedTransaction = await transaction.signWithOperator(client)
    const transactionList = transactionToBase64String(signedTransaction)

    const params: ExecuteTransactionParams = { transactionList }

    return await dAppConnector!.executeTransaction(params)
  }

  // 3. hedera_signMessage
  const handleSignMessage = async () => {
    modalWrapper(async () => {
      if (!selectedSigner) throw new Error('Selected signer is required')
      const params: SignMessageParams = {
        signerAccountId: 'hedera:testnet:' + selectedSigner.getAccountId().toString(),
        message,
      }

      const { signatureMap } = await dAppConnector!.signMessage(params)
      const accountPublicKey = PublicKey.fromString(publicKey)
      const verified = verifyMessageSignature(message, signatureMap, accountPublicKey)
      console.log('SignatureMap: ', signatureMap)
      console.log('Verified: ', verified)
      return {
        signatureMap,
        verified,
      }
    })
  }

  // 4. hedera_signAndExecuteQuery
  const handleExecuteQuery = () => {
    modalWrapper(async () => {
      if (!selectedSigner) throw new Error('Selected signer is required')
      const accountId = selectedSigner.getAccountId()
      const query = new AccountInfoQuery().setAccountId(accountId)

      const params: SignAndExecuteQueryParams = {
        signerAccountId: 'hedera:testnet:' + accountId.toString(),
        query: queryToBase64String(query),
      }

      const { response } = await dAppConnector!.signAndExecuteQuery(params)
      const bytes = Buffer.from(response, 'base64')
      const accountInfo = AccountInfo.fromBytes(bytes)
      console.log('AccountInfo: ', accountInfo)
      return accountInfo
    })
  }

  // 5. hedera_signAndExecuteTransaction
  const handleHederaSignAndExecuteTransaction = async () => {
    const accountId = selectedSigner!.getAccountId()
    const hbarAmount = new Hbar(Number(amount))

    const transaction = new TransferTransaction()
      .setTransactionId(TransactionId.generate(accountId!))
      .addHbarTransfer(accountId, hbarAmount.negated())
      .addHbarTransfer(receiver, hbarAmount)

    const params: SignAndExecuteTransactionParams = {
      transactionList: transactionToBase64String(transaction),
      signerAccountId: 'hedera:testnet:' + accountId.toString(),
    }

    const result = await dAppConnector!.signAndExecuteTransaction(params)

    console.log('JSONResponse: ', result)
    return result
  }

  // 6. hedera_signTransaction
  const handleHederaSignTransaction = async () => {
    const accountId = selectedSigner!.getAccountId()
    const hbarAmount = new Hbar(Number(amount))
    const transaction = new TransferTransaction()
      .setTransactionId(TransactionId.generate(accountId!))
      .addHbarTransfer(accountId.toString()!, hbarAmount.negated())
      .addHbarTransfer(receiver, hbarAmount)

    const transactionSigned = await selectedSigner!.signTransaction(transaction)

    console.log('Signed transaction: ', transactionSigned)
    return { transaction: transactionSigned }
  }

  /**
   * Session management methods
   */

  const handleInitConnector = async () => {
    const metadata: SignClientTypes.Metadata = {
      name,
      description,
      url,
      icons: icons.split(','),
    }

    const _dAppConnector = new DAppConnector(
      metadata,
      LedgerId.TESTNET,
      projectId,
      Object.values(HederaJsonRpcMethod),
      [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
      [HederaChainId.Testnet],
    )
    await _dAppConnector.init({ logger: 'error' })

    _dAppConnector.onSessionIframeCreated = (session) => {
      setNewSession(session)
    }

    _dAppConnector?.extensions?.forEach((extension) => {
      console.log('extension: ', extension)
    })

    if (_dAppConnector) {
      const extensionData = _dAppConnector.extensions?.filter(
        (extension) => extension.available,
      )
      if (extensionData) setExtensions(extensionData)

      setDAppConnector(_dAppConnector)
      setSigners(_dAppConnector.signers)
      setSelectedSigner(_dAppConnector.signers[0])
      const _sessions = _dAppConnector.walletConnectClient?.session.getAll()
      if (_sessions && _sessions?.length > 0) {
        setSessions(_sessions)
      }
    }
    saveData()
  }

  const handleConnect = async (extensionId?: string) => {
    try {
      if (!dAppConnector) throw new Error('DAppConnector is required')
      let session: SessionTypes.Struct
      setIsLoading(true)
      if (extensionId) session = await dAppConnector.connectExtension(extensionId)
      else session = await dAppConnector.openModal()

      setNewSession(session)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnectSessions = async () => {
    modalWrapper(async () => {
      await dAppConnector!.disconnectAll()
      setSessions([])
      setSigners([])
      setSelectedSigner(null)
      setModalData({ status: 'Success', message: 'Session disconnected' })
    })
  }

  const setNewSession = (session: SessionTypes.Struct) => {
    setSessions((prev) => [...prev, session])
    const sessionAccount = session.namespaces?.hedera?.accounts?.[0]
    const accountId = sessionAccount?.split(':').pop()
    if (!accountId) console.error('No account id found in the session')
    else setSelectedSigner(dAppConnector?.getSigner(AccountId.fromString(accountId))!)
    console.log('New connected session: ', session)
    console.log('New connected accounts: ', session.namespaces?.hedera?.accounts)
  }

  const handleClearData = () => {
    localStorage.removeItem('hedera-wc-demos-saved-state')
    setProjectId('')
    setName('')
    setDescription('')
    setUrl('')
    setIcons('')
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
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Create <span className="text-[hsl(280,100%,70%)]">T3</span> App
          </h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
          <section>
          <div>
            <fieldset>
              <legend>Step 1: Initialize WalletConnect</legend>
              <label>
                Project Id:
                <input
                  type="text"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  required
                />
              </label>
              <label>
                Name:
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>
              <label>
                Description:
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </label>
              <label>
                Url:
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </label>
              <label>
                Icons:
                <input
                  type="text"
                  value={icons}
                  onChange={(e) => setIcons(e.target.value)}
                  required
                />
              </label>
            </fieldset>
            <button
              disabled={!projectId || !name || !description || !url || !icons}
              onClick={handleInitConnector}
            >
              Initialize WalletConnect
            </button>
          </div>
        </section>
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="https://create.t3.gg/en/usage/first-steps"
              target="_blank"
            >
              <h3 className="text-2xl font-bold">First Steps →</h3>
              <div className="text-lg">
                Just the basics - Everything you need to know to set up your
                database and authentication.
              </div>
            </Link>
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="https://create.t3.gg/en/introduction"
              target="_blank"
            >
              <h3 className="text-2xl font-bold">Documentation →</h3>
              <div className="text-lg">
                Learn more about Create T3 App, the libraries it uses, and how
                to deploy it.
              </div>
            </Link>
          </div>
          {/* <div className="flex flex-col items-center gap-2"> */}
            {/* <p className="text-2xl text-white">
              {hello ? hello.greeting : "Loading tRPC query..."}
            </p>

            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-center text-2xl text-white">
                {session && <span>Logged in as {session.user?.name}</span>}
              </p>
              <Link
                href={session ? "/api/auth/signout" : "/api/auth/signin"}
                className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
              >
                {session ? "Sign out" : "Sign in"}
              </Link>
            </div>
          </div>

          {session?.user && <LatestPost />} */}
          <button onClick = {()=>handleConnect()}>handle connect</button>
          <button onClick = {()=>handleDisconnectSessions()}>handle Disconnect session</button>
          <button onClick={()=>handleGetNodeAddresses()}>get node address</button>
          <button onClick = {()=>handleClearData()}>handle clear data</button>
        </div>
      </main>
  );
}
