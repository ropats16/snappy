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
  host: "arweave.net",
  port: 443,
  protocol: "https",
});

type PermissionType = "SIGN_TRANSACTION" | "ACCESS_ADDRESS";

export async function uploadToArweave(file: Blob) {
  try {
    // Check if ArConnect is installed
    if (typeof window.arweaveWallet === "undefined") {
      throw new Error(
        "ArConnect wallet not found. Please install ArConnect to upload images."
      );
    }

    const requiredPermissions: PermissionType[] = [
      "SIGN_TRANSACTION",
      "ACCESS_ADDRESS",
    ];
    const currentPermissions = await window.arweaveWallet.getPermissions();

    // Check if any required permissions are missing
    const needsPermissions = requiredPermissions.some(
      (p) => !currentPermissions.includes(p)
    );
    if (needsPermissions) {
      await window.arweaveWallet.connect(
        requiredPermissions,
        { name: "Snappy", logo: "/camera.svg" },
        {
          host: "arweave.net",
          port: 443,
          protocol: "https",
        }
      );
    }

    // Convert Blob to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);

    // Create signed data with appropriate content type
    // const signedData = await window.arweaveWallet.signDataItem({
    //   data: fileData,
    //   tags: [
    //     { name: "Content-Type", value: file.type },
    //     { name: "App-Name", value: "Snappy" },
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
    const transaction = await arweave.createTransaction(
      {
        data: fileData,
        // tags: [
        //   { name: "Content-Type", value: file.type },
        //   { name: "App-Name", value: "Snappy" },
        //   { name: "App-Version", value: "0.1.0" },
        // ],
      },
      "use_wallet"
    );
    transaction.addTag("Content-Type", file.type);
    transaction.addTag("App-Name", "Snappy");
    transaction.addTag("App-Version", "0.1.0");
    console.dir(transaction);

    // const res = await window.arweaveWallet.dispatch(transaction);
    try {
      await arweave.transactions.sign(transaction, "use_wallet");
    } catch (error) {
      console.error("Failed to sign transaction:", error);
      throw error;
    }
    // const res = await arweave.transactions.post(transaction);
    // eslint-disable-next-line prefer-const
    let uploader = await arweave.transactions.getUploader(transaction);

    while (!uploader.isComplete) {
      await uploader.uploadChunk();
      console.log(
        `${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`
      );
    }

    // console.log(
    //   `The transaction was dispatched as a ${
    //     res.type === "BUNDLED" ? "bundled" : "base layer"
    //   } Arweave transaction.`
    // );
    console.log("Result of uploadToArweave", uploader);
    console.log("Transaction", transaction);
    return { transaction, uploader };
  } catch (error) {
    console.error("Failed to upload image:", error);
    throw error;
  }
}

const appName: string = "Snappy";
const oldAppName: string = "SnappyCam";

export async function queryUploadsFromArweave(): Promise<string[]> {
  try {
    // Check if ArConnect is installed
    if (typeof window.arweaveWallet === "undefined") {
      throw new Error(
        "ArConnect wallet not found. Please install ArConnect to view your gallery."
      );
    }

    const requiredPermissions: PermissionType[] = [
      "SIGN_TRANSACTION",
      "ACCESS_ADDRESS",
    ];
    const currentPermissions = await window.arweaveWallet.getPermissions();

    // Check if any required permissions are missing
    const needsPermissions = requiredPermissions.some(
      (p) => !currentPermissions.includes(p)
    );
    if (needsPermissions) {
      await window.arweaveWallet.connect(
        requiredPermissions,
        { name: "Snappy", logo: "/camera.svg" },
        {
          host: "arweave.net",
          port: 443,
          protocol: "https",
        }
      );
    }

    const address = await window.arweaveWallet.getActiveAddress();

    const response = await fetch("https://arweave-search.goldsky.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `{
          transactions(
            owners: ["${address}"]
            tags: { 
              name: "App-Name", 
              values: ["${appName}", "${oldAppName}"]
            }
          ) {
            edges {
              node {
                id
              }
            }
          }
        }`,
      }),
    });

    const data = await response.json();
    return (
      data?.data?.transactions?.edges?.map(
        (edge: { node: { id: string } }) => edge.node.id
      ) || []
    );
  } catch (error) {
    console.error("Failed to query transactions:", error);
    throw error;
  }
}
