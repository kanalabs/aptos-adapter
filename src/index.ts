/* eslint-disable import/no-extraneous-dependencies */
import {
  AccountKeys,
  BaseWalletAdapter,
  NetworkInfo,
  SignMessagePayload,
  SignMessageResponse,
  WalletAccountChangeError,
  WalletAdapterNetwork,
  WalletDisconnectionError,
  WalletGetNetworkError,
  WalletName,
  WalletNetworkChangeError,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletReadyState,
  WalletSignAndSubmitMessageError,
  WalletSignMessageError,
  WalletSignTransactionError,
  scopePollingDetectionStrategy
} from '@manahippo/aptos-wallet-adapter';
import { Types } from 'aptos';

interface IApotsErrorResult {
  code: number;
  name: string;
  message: string;
}

type AddressInfo = { address: string; publicKey: string; authKey?: string };

interface IKanaWallet {
  connect: () => Promise<AddressInfo>;
  account: () => Promise<AddressInfo>;
  isConnected: () => Promise<boolean>;
  signAndSubmitTransaction(
    transaction: any,
    options?: any
  ): Promise<{ hash: Types.HexEncodedBytes } | IApotsErrorResult>;
  signTransaction(transaction: any, options?: any): Promise<Uint8Array | IApotsErrorResult>;
  signMessage(message: SignMessagePayload): Promise<SignMessageResponse>;
  disconnect(): Promise<void>;
  network(): Promise<WalletAdapterNetwork>;
  requestId: Promise<number>;
  onAccountChange: (listener: (newAddress: AddressInfo) => void) => void;
  onNetworkChange: (listener: (network: { networkName: string }) => void) => void;
}

interface KanaWindow extends Window {
  kana?: {
    aptos: IKanaWallet;
  };
}

declare const window: KanaWindow;

export const KanaWalletName = 'Kana' as WalletName<'Kana'>;

export interface KanaWalletAdapterConfig {
  provider?: IKanaWallet;
  // network?: WalletAdapterNetwork;
  timeout?: number;
}

export class KanaWalletAdapter extends BaseWalletAdapter {
  readonly name = KanaWalletName;

  readonly url =
    'https://chrome.google.com/webstore/detail/kanalabs-wallet/kfchidjnejibmhiplmgfmpiifenoanih';

  readonly icon =
    'data:image/png;base64,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';

  protected _provider: IKanaWallet | undefined;

  protected _network: WalletAdapterNetwork | undefined;

  protected _chainId: string | undefined;

  protected _api: string | undefined;

  protected _timeout: number;

  protected _readyState: WalletReadyState =
    typeof window === 'undefined' || typeof document === 'undefined'
      ? WalletReadyState.Unsupported
      : WalletReadyState.NotDetected;

  protected _connecting: boolean;

  protected _wallet: any | null;

  constructor({
    // provider,
    // network = WalletAdapterNetwork.Testnet,
    timeout = 10000
  }: KanaWalletAdapterConfig = {}) {
    super();

    this._provider = typeof window !== 'undefined' ? window.kana?.aptos : undefined;
    this._network = undefined;
    this._timeout = timeout;
    this._connecting = false;
    this._wallet = null;

    if (typeof window !== 'undefined' && this._readyState !== WalletReadyState.Unsupported) {
      scopePollingDetectionStrategy(() => {
        if (window.kana?.aptos) {
          this._readyState = WalletReadyState.Installed;
          this.emit('readyStateChange', this._readyState);
          return true;
        }
        return false;
      });
    }
  }

  get publicAccount(): AccountKeys {
    return {
      publicKey: this._wallet?.publicKey || null,
      address: this._wallet?.address || null,
      authKey: this._wallet?.authKey || null
    };
  }

  get network(): NetworkInfo {
    return {
      name: this._network,
      api: this._api,
      chainId: this._chainId
    };
  }

  get connecting(): boolean {
    return this._connecting;
  }

  get connected(): boolean {
    return !!this._wallet?.isConnected;
  }

  get readyState(): WalletReadyState {
    return this._readyState;
  }

  async connect(): Promise<void> {
    try {
      if (this.connected || this.connecting) return;
      if (
        !(
          this._readyState === WalletReadyState.Loadable ||
          this._readyState === WalletReadyState.Installed
        )
      )
        throw new WalletNotReadyError();
      this._connecting = true;

      const provider = this._provider || window.kana?.aptos;
      const response = await provider?.connect();
      this._wallet = {
        address: response?.address,
        publicKey: response?.publicKey,
        isConnected: true
      };

      try {
        const name = await provider?.network();
        const chainId = undefined;
        const api = undefined;

        this._network = name;
        this._chainId = chainId;
        this._api = api;
      } catch (error: any) {
        const errMsg = error.message;
        this.emit('error', new WalletGetNetworkError(errMsg));
        throw error;
      }

      this.emit('connect', this._wallet.publicKey);
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    } finally {
      this._connecting = false;
    }
  }

  async disconnect(): Promise<void> {
    const wallet = this._wallet;
    const provider = this._provider || window.kana?.aptos;
    if (wallet) {
      this._wallet = null;

      try {
        await provider?.disconnect();
      } catch (error: any) {
        this.emit('error', new WalletDisconnectionError(error?.message, error));
      }
    }

    this.emit('disconnect');
  }

  async signTransaction(transaction: Types.TransactionPayload, options?: any): Promise<Uint8Array> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window.kana?.aptos;
      if (!wallet || !provider) throw new WalletNotConnectedError();

      const response = await provider.signTransaction(transaction, options);
      if ((response as IApotsErrorResult).code) {
        throw new Error((response as IApotsErrorResult).message);
      }
      return response as Uint8Array;
    } catch (error: any) {
      const errMsg = error.message;
      this.emit('error', new WalletSignTransactionError(errMsg));
      throw error;
    }
  }

  async signAndSubmitTransaction(
    transaction: Types.TransactionPayload,
    options?: any
  ): Promise<{ hash: Types.HexEncodedBytes }> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window.kana?.aptos;
      if (!wallet || !provider) throw new WalletNotConnectedError();

      const response = await provider.signAndSubmitTransaction(transaction, options);
      if ((response as IApotsErrorResult).code) {
        throw new Error((response as IApotsErrorResult).message);
      }
      return response as { hash: Types.HexEncodedBytes };
    } catch (error: any) {
      const errMsg = error.message;
      this.emit('error', new WalletSignAndSubmitMessageError(errMsg));
      throw error;
    }
  }

  async signMessage(msgPayload: SignMessagePayload): Promise<SignMessageResponse> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window.kana?.aptos;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      if (typeof msgPayload !== 'object' || !msgPayload.nonce) {
        throw new WalletSignMessageError('Invalid signMessage Payload');
      }
      const response = await provider?.signMessage(msgPayload);
      if (response) {
        return response;
      } else {
        throw new Error('Sign Message failed');
      }
    } catch (error: any) {
      const errMsg = error.message;
      this.emit('error', new WalletSignMessageError(errMsg));
      throw error;
    }
  }

  async onAccountChange(): Promise<void> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window.kana?.aptos;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      const handleAccountChange = async (newAccount: AddressInfo) => {
        console.log('account Changed >>>', newAccount);
        // kana extension currently didn't return the new Account
        this._wallet = {
          ...this._wallet,
          publicKey: newAccount.publicKey || this._wallet?.publicKey,
          authKey: newAccount.authKey || this._wallet?.authKey,
          address: newAccount.address || this._wallet?.address
        };
        this.emit('accountChange', newAccount.publicKey);
      };
      await provider?.onAccountChange(handleAccountChange);
    } catch (error: any) {
      const errMsg = error.message;
      this.emit('error', new WalletAccountChangeError(errMsg));
      throw error;
    }
  }

  async onNetworkChange(): Promise<void> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window.kana?.aptos;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      const handleNetworkChange = async (newNetwork: { networkName: WalletAdapterNetwork }) => {
        console.log('network Changed >>>', newNetwork);
        this._network = newNetwork.networkName;
        this.emit('networkChange', this._network);
      };
      await provider?.onNetworkChange(handleNetworkChange as any);
    } catch (error: any) {
      const errMsg = error.message;
      this.emit('error', new WalletNetworkChangeError(errMsg));
      throw error;
    }
  }
}
