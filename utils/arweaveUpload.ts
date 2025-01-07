/* eslint-disable @typescript-eslint/no-unused-vars */
// declare global {
//   interface Window {
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     arweaveWallet: any;
//   }
// }

import { getArweaveSigner } from "./getArweaveSigner";
import { createData, ArweaveSigner, DataItem } from "arbundles";
import Arweave from "arweave";

const arweave = new Arweave({
  host: "ar-io.net",
  port: 443,
  protocol: "https",
});

export async function uploadToArweave(file: Blob) {
  try {
    // const signer = getArweaveSigner({ jwk: false }) as ArweaveSigner;
    await window.arweaveWallet.connect(["SIGN_TRANSACTION", "DISPATCH"]);

    // Convert Blob to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);

    // Create signed data with appropriate content type
    // const signedData = await window.arweaveWallet.signDataItem({
    //   data: fileData,
    //   tags: [
    //     { name: "Content-Type", value: file.type },
    //     { name: "App-Name", value: "SnappyCam" },
    //     { name: "App-Version", value: "0.1.0" },
    //   ],
    // });

    // const dataItem = new DataItem(await signedData);
    // console.log("DataItem:", {
    //   raw: dataItem.getRaw(),
    // });

    // const response = await fetch(`https://upload.ardrive.io/v1/tx`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/octet-stream",
    //     Accept: "application/json",
    //   },
    //   body: dataItem.getRaw(),
    // });

    // if (!response.ok) {
    //   throw new Error(`Upload failed: ${response.statusText}`);
    // }

    // const result = await response.json();
    const transaction = await arweave.createTransaction({
      data: fileData,
      // tags: [
      //   { name: "Content-Type", value: file.type },
      //   { name: "App-Name", value: "SnappyCam" },
      //   { name: "App-Version", value: "0.1.0" },
      // ],
    });
    transaction.addTag("Content-Type", file.type);
    transaction.addTag("App-Name", "SnappyCam");
    transaction.addTag("App-Version", "0.1.0");
    console.dir(transaction);

    const res = await window.arweaveWallet.dispatch(transaction);

    console.log(
      `The transaction was dispatched as a ${
        res.type === "BUNDLED" ? "bundled" : "base layer"
      } Arweave transaction.`
    );
    console.dir(res);
    return res;
  } catch (error) {
    console.error("Failed to upload image:", error);
    throw error;
  }
}

export async function queryUploadsFromArweave(
  owner: string,
  appName: string = "SnappyCam"
): Promise<string[]> {
  try {
    const queryObject = {
      query: `{
        transactions(
          owners: ["${owner}"]
          tags: { 
            name: "App-Name", 
            values: ["${appName}"]
          }
        ) {
          edges {
            node {
              id
            }
          }
        }
      }`,
    };

    const results = await arweave.api.post("/graphql", queryObject);

    // Extract just the transaction IDs from the response
    return results.data.data.transactions.edges.map(
      (edge: { node: { id: string } }) => edge.node.id
    );
  } catch (error) {
    console.error("Failed to query transactions:", error);
    throw error;
  }
}
