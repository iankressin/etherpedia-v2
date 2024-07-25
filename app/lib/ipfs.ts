"use server";

import PinataSDK from "@pinata/sdk";
import { Readable } from "stream";

export async function uploadFile(file: string, name: string): Promise<string> {
  const readable = Readable.from(file);

  const pinned = await getPinataClient().pinFileToIPFS(readable, {
    pinataMetadata: {
      name,
    },
  });

  return pinned.IpfsHash;
}

function getPinataClient(): PinataSDK {
  if (!process.env.PINATA_API_KEY || !process.env.PINATA_API_SECRET) {
    throw new Error("Missing Pinata API keys");
  }

  return new PinataSDK(
    process.env.PINATA_API_KEY,
    process.env.PINATA_API_SECRET,
  );
}
