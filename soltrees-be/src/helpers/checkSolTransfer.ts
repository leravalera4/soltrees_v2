import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { connection, mainWalletPublicKey, USERS } from "../constants";

const recipientPubKey = new PublicKey(mainWalletPublicKey);

export async function checkSolTransfer(
  sender: string,
  amountSol: number
): Promise<boolean> {
  try {
    const senderPubKey = new PublicKey(sender);

    const signatures = await connection.getSignaturesForAddress(senderPubKey, {
      limit: 4,
    });

    for (const sig of signatures) {
      const versionedTransaction = await connection.getTransaction(sig.signature, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0
      });

      if (versionedTransaction?.version == 0) {
        continue;
      }

      const transaction = await connection.getTransaction(sig.signature, {
        commitment: "confirmed",
      });

      if (!transaction || !transaction.meta) continue;

      const { meta, transaction: tx } = transaction;
      const { postBalances, preBalances } = meta;

      const { instructions } = tx.message;

      // Iterate through instructions and check for a system transfer
      for (const instruction of instructions) {
        if (instruction.accounts.length > 1) {
          // Check if the recipient address matches
          const recipientAccount = new PublicKey(tx.message.accountKeys[instruction.accounts[1]]);
          if (!recipientAccount.equals(recipientPubKey)) continue;

          // Extract the relevant balances
          const recipientBalanceBefore = preBalances[instruction.accounts[1]];
          const recipientBalanceAfter = postBalances[instruction.accounts[1]];

          const lamportsTransferred = recipientBalanceAfter - recipientBalanceBefore;

          // Check if lamports transferred match the expected amount
          if (lamportsTransferred === amountSol * LAMPORTS_PER_SOL) {
            console.log(`✅ Found transaction: ${sig.signature}`);

            // check if this is for a previous tree plant
            const document = await USERS.findOne({ userAddress: sender });

            if (!document || document.paymentIds == undefined || !document.paymentIds.includes(sig.signature)) {
              if (document) {
                // add the transaction to mark this deployment as done
                await USERS.findOneAndUpdate(
                  { userAddress: sender },
                  { $push: { paymentIds: sig.signature } }
                );
              }
              return true;
            }

            return false;
          }
        }
      }
    }
    console.log("❌ No matching transaction found.");
    return false;
  } catch (error) {
    console.error("Error checking transaction:", error);
    return false;
  }
}