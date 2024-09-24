import { create } from "zustand";
import { Buffer } from "buffer";
import {
  AccountId,
  AccountInfo,
  AccountInfoQuery,
  Client,
  Hbar,
  LedgerId,
  type PrivateKey,
  PublicKey,
  TransactionId,
  TransferTransaction,
} from "@hashgraph/sdk";
import { type SessionTypes, type SignClientTypes } from "@walletconnect/types";
import {
  HederaSessionEvent,
  HederaJsonRpcMethod,
  queryToBase64String,
  DAppConnector,
  HederaChainId,
  verifyMessageSignature,
  type ExtensionData,
  type DAppSigner,
  type SignMessageParams,
  type SignAndExecuteTransactionParams,
  transactionToBase64String,
  SignAndExecuteQueryParams,
  type ExecuteTransactionParams,
  type GetNodeAddressesResult,
  type ExecuteTransactionResult,
  type SignAndExecuteTransactionResult,
} from "@hashgraph/hedera-wallet-connect";
import { stat } from "fs";

interface HederaTransactions {
  dAppConnector: DAppConnector | null;
  sessions: SessionTypes.Struct[];
  signers: DAppSigner[];
  selectedSigner: DAppSigner | null;
  extensions: ExtensionData[];
  handleGetNodeAddresses: () => Promise<GetNodeAddressesResult>;
  handleExecuteTransaction: (
    signerPrivateKey: string | PrivateKey,
    signerAccount: AccountId,
    receiver: AccountId,
    amount: number,
  ) => Promise<ExecuteTransactionResult>;
  handleSignMessage: (
    message: string,
    publicKey: string,
  ) => Promise<{ signatureMap: string; verified: boolean }>;
  handleExecuteQuery: () => Promise<AccountInfo>;
  handleHederaSignAndExecuteTransaction: (
    receiver: AccountId,
    amount: number,
  ) => Promise<SignAndExecuteTransactionResult>;
  handleHederaSignTransaction: (
    receiver: AccountId,
    amount: number,
  ) => Promise<{
    transaction: TransferTransaction;
  }>;
  setNewSession: (session: SessionTypes.Struct) => void;
  handleConnect: (extensionId?: string) => Promise<void>;
  handleInitConnector: () => Promise<void>;
  handleDisconnectSessions: () => Promise<void>;
}

const useHederaTransactions = create<HederaTransactions>((set) => ({
  dAppConnector: null,
  sessions: [],
  signers: [],
  extensions: [],
  handleGetNodeAddresses: async () => {
    const state = useHederaTransactions.getState();
    console.log("state: ", state);
    const nodeAddresses: GetNodeAddressesResult =
      await state.dAppConnector!.getNodeAddresses();
    console.log("NodeAddresses: ", nodeAddresses);
    return nodeAddresses;
  },
  handleExecuteTransaction: async (
    signerPrivateKey: string | PrivateKey,
    signerAccount: AccountId,
    receiver: AccountId,
    amount: number,
  ) => {
    try {
      const state = useHederaTransactions.getState();
      if (!signerPrivateKey) throw new Error("Signer private key is required");
      const client = Client.forTestnet();
      client.setOperator(signerAccount, signerPrivateKey);

      const hbarAmount = new Hbar(Number(amount));
      const transaction = new TransferTransaction()
        .setTransactionId(TransactionId.generate(signerAccount))
        .addHbarTransfer(signerAccount, hbarAmount.negated())
        .addHbarTransfer(receiver, hbarAmount)
        .freezeWith(client);

      const signedTransaction = await transaction.signWithOperator(client);
      const transactionList = transactionToBase64String(signedTransaction);

      const params: ExecuteTransactionParams = { transactionList };
      console.log("params: ", params);
      const result: ExecuteTransactionResult =
        await state.dAppConnector!.executeTransaction(params);
      return result;
    } catch (error) {
      console.error("Error executing transaction: ", error);
    }
  },
  handleSignMessage: async (
    message: string,
    publicKey: string,
  ): Promise<{ signatureMap: any; verified: boolean }> => {
    const state = useHederaTransactions.getState();

    if (!state.selectedSigner) throw new Error("Selected signer is required");
    const params: SignMessageParams = {
      signerAccountId:
        "hedera:testnet:" + state.selectedSigner.getAccountId().toString(),
      message,
    };

    const { signatureMap } = await state.dAppConnector!.signMessage(params);
    const accountPublicKey = PublicKey.fromString(publicKey);
    const verified = verifyMessageSignature(
      message,
      signatureMap,
      accountPublicKey,
    );
    console.log("SignatureMap: ", signatureMap);
    console.log("Verified: ", verified);
    return {
      signatureMap,
      verified,
    };
  },
  handleHederaSignAndExecuteTransaction: async (
    receiver: AccountId,
    amount: number,
  ) => {
    const state = useHederaTransactions.getState();
    const accountId = state.selectedSigner!.getAccountId();
    const hbarAmount = new Hbar(Number(amount));

    const transaction = new TransferTransaction()
      .setTransactionId(TransactionId.generate(accountId))
      .addHbarTransfer(accountId, hbarAmount.negated())
      .addHbarTransfer(receiver, hbarAmount);

    const params: SignAndExecuteTransactionParams = {
      transactionList: transactionToBase64String(transaction),
      signerAccountId: "hedera:testnet:" + accountId.toString(),
    };

    const result = await state.dAppConnector!.signAndExecuteTransaction(params);

    console.log("JSONResponse: ", result);
    return result;
  },
  handleHederaSignTransaction: async (
    receiver: AccountId,
    amount: number,
  ): Promise<{ transaction: TransferTransaction }> => {
    const state = useHederaTransactions.getState();
    const accountId = state.selectedSigner!.getAccountId();
    const hbarAmount = new Hbar(Number(amount));
    const transaction = new TransferTransaction()
      .setTransactionId(TransactionId.generate(accountId))
      .addHbarTransfer(accountId.toString(), hbarAmount.negated())
      .addHbarTransfer(receiver, hbarAmount);

    if (!state.selectedSigner) {
      throw new Error("No selected signer available");
    }
    const transactionSigned =
      await state.selectedSigner.signTransaction(transaction);

    console.log("Signed transaction: ", transactionSigned);
    return { transaction: transactionSigned as TransferTransaction };
  },
  handleInitConnector: async () => {
    const metadata: SignClientTypes.Metadata = {
      name: "KarVaSudhi",
      description: "This is application for global welfare",
      url: "localhost:3000",
      icons: "/public/favicon.ico".split(" "),
    };

    const _dAppConnector = new DAppConnector(
      metadata,
      LedgerId.TESTNET,
      "8ce30539c07c673c582d520d0cc59f45",
      Object.values(HederaJsonRpcMethod),
      [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
      [HederaChainId.Testnet],
    );
    await _dAppConnector.init({ logger: "error" });

    _dAppConnector.onSessionIframeCreated = (session) => {
      set((state) => ({ sessions: [...state.sessions, session] }));
    };

    _dAppConnector?.extensions?.forEach((extension) => {
      console.log("extension: ", extension);
    });

    if (_dAppConnector) {
      const extensionData = _dAppConnector.extensions?.filter(
        (extension) => extension.available,
      );
      if (extensionData)
        set((state) => ({
          extensions: [...state.extensions, ...extensionData],
        }));
      set({ dAppConnector: _dAppConnector });
      set({ signers: _dAppConnector.signers });
      set({ selectedSigner: _dAppConnector.signers[0] });
      const _sessions = _dAppConnector.walletConnectClient?.session.getAll();
      if (_sessions && _sessions?.length > 0) {
        set((state) => ({ sessions: [...state.sessions, ..._sessions] }));
      }
    }
    console.log("dAppConnector: ", _dAppConnector);
    // saveData();
  },
  setNewSession: (session: SessionTypes.Struct) => {
    try {
      const state = useHederaTransactions.getState();
      set((state) => ({ sessions: [...state.sessions, session] }));
      const sessionAccount = session.namespaces?.hedera?.accounts?.[0];
      const accountId = sessionAccount?.split(":").pop();
      if (!accountId) console.error("No account id found in the session");
      else
        set({
          selectedSigner: state.dAppConnector?.getSigner(
            AccountId.fromString(accountId),
          ),
        });
      console.log("New connected session: ", session);
      console.log(
        "New connected accounts: ",
        session.namespaces?.hedera?.accounts,
      );
    } catch (error) {
      console.error("Error setting new session: ", error);
    }
  },
  handleConnect: async (extensionId?: string) => {
    try {
      const state = useHederaTransactions.getState();
      if (!state.dAppConnector) throw new Error("DAppConnector is required");
      let session: SessionTypes.Struct;
      if (extensionId)
        session = await state.dAppConnector.connectExtension(extensionId);
      else session = await state.dAppConnector.openModal();
      console.log("session: ", session);
      useHederaTransactions.getState().setNewSession(session);
    } catch (error) {
      console.error("Error connecting session:", error);
    }
  },
  handleDisconnectSessions: async () => {
    const state = useHederaTransactions.getState();
    await state.dAppConnector!.disconnectAll();
    set({ sessions: [] });
    set({ signers: [] });
    set({ selectedSigner: null });
    // setModalData({ status: 'Success', message: 'Session disconnected' })
  },

  handleClearData: () => {
    // Implementation here
  },
}));
export default useHederaTransactions;
