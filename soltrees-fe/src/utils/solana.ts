import { Connection, PublicKey, LAMPORTS_PER_SOL, Transaction, SystemProgram, Commitment, VersionedTransaction } from '@solana/web3.js';
const RPC_CONFIG = {
  wsEndpoint: 'https://blissful-burned-firefly.solana-mainnet.quiknode.pro/c12294c79fe9c4671d8ba3f8a1c899e3abdc1d9f/',
  httpEndpoint: 'https://blissful-burned-firefly.solana-mainnet.quiknode.pro/c12294c79fe9c4671d8ba3f8a1c899e3abdc1d9f/',
  commitment: 'confirmed' as Commitment
  // confirmTransactionInitialTimeout: 60000
};

const WALLET = "EL6ZEi3VYZPoH2B91op1cuvs6Tf4tqoHHQxbM9qMbHv2";

// Create a single connection with proper configuration
const connection = new Connection(RPC_CONFIG.httpEndpoint, {
  commitment: RPC_CONFIG.commitment,
  wsEndpoint: RPC_CONFIG.wsEndpoint,
  // confirmTransactionInitialTimeout: RPC_CONFIG.confirmTransactionInitialTimeout
});


export const getSolPrice = async (): Promise<number> => {
  try {
    const DEFAULT_SOL_PRICE = 20;
    return DEFAULT_SOL_PRICE; // Use default price for now due to API issues
  } catch (error) {
    console.error('Error fetching SOL price:', error);
    return 20;
  }
};

export const convertUSDToSOL = (usdAmount: number, solPrice: number): number => {
  return solPrice > 0 ? Number((usdAmount / solPrice).toFixed(2)) : 0;
};

const getLatestBlockhash = async () => {
  try {
    const {
      blockhash,
      lastValidBlockHeight
    } = await connection.getLatestBlockhash();
    return {
      blockhash,
      lastValidBlockHeight
    };
  } catch (error) {
    console.error('Error getting blockhash:', error);
    throw new Error('Failed to get blockhash. Please try again.');
  }
};
export const sendSolanaTransaction = async (amount: number, fromWallet: any): Promise<string> => {
  try {
    if (amount <= 0) {
      throw new Error('Invalid amount: Must be greater than 0 SOL');
    }
    console.log('Starting transaction...');
    console.log('Amount:', amount, 'SOL');
    console.log('From wallet:', fromWallet.publicKey.toString());
    // Get latest blockhash first
    const {
      blockhash,
      lastValidBlockHeight
    } = await getLatestBlockhash();
    // Create transaction
    const transaction = new Transaction({
      feePayer: fromWallet.publicKey,
      recentBlockhash: blockhash
    });
    // Add transfer instruction
    transaction.add(SystemProgram.transfer({
      fromPubkey: fromWallet.publicKey,
      toPubkey: new PublicKey(WALLET),
      lamports: Math.floor(amount * LAMPORTS_PER_SOL)
    }));
    // Sign transaction
    console.log('Requesting signature...');
    const signed = await fromWallet.signTransaction(transaction);
    // Send and confirm transaction
    console.log('Sending transaction...');
    const signature = await connection.sendRawTransaction(signed.serialize());
    // Wait for confirmation with timeout
    console.log('Confirming transaction...');
    const confirmation = await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight
    });
    if (confirmation.value.err) {
      throw new Error('Transaction failed: ' + confirmation.value.err.toString());
    }
    console.log('Transaction successful!');
    return signature;
  } catch (error) {
    console.error('Transaction error:', error);
    if (error instanceof Error) {
      if (error.message.includes('insufficient')) {
        throw new Error('Not enough SOL in wallet. Get some devnet SOL at https://solfaucet.com');
      }
      if (error.message.includes('blockhash') || error.message.includes('failed to get recent blockhash')) {
        throw new Error('The Solana network is busy. Please wait a moment and try again.');
      }
      throw error;
    }
    throw new Error('Transaction failed. Please try again.');
  }
};