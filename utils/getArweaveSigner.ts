import { ArweaveSigner, JWKInterface } from "arbundles";

export const getArweaveSigner = ({ jwk }: { jwk: boolean }) => {
  if (!process.env.WALLET) {
    throw new Error("Wallet not found.");
  }
  const wallet = JSON.parse(
    Buffer.from(process.env.WALLET, "base64").toString()
  ) as JWKInterface;

  if (jwk) {
    return wallet;
  }

  return new ArweaveSigner(wallet);
};
