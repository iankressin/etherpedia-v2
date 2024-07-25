"use server";

import { Pipeline } from "@/app/lib/agents/Pipeline";
import { research } from "@/app/lib/agents/researcher";
import { edit } from "@/app/lib/agents/editor";
import { write } from "@/app/lib/agents/writer";
import { createHelia } from "helia";
import { strings } from "@helia/strings";
import { MongoClient, ServerApiVersion } from "mongodb";
import { ArticleMetadata } from "@/app/models/article";
import matter from "gray-matter";
import * as z from "zod";

const mongoClient = getMongoClient();

const dateString = z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: "Expected a valid date string",
});

const MetadataSchema = z.object({
  title: z.string(),
  cid: z.string(),
  createdAt: dateString,
  updatedAt: dateString.optional(),
  tags: z.array(z.string()),
  description: z.string(),
});

export async function generateArticle(
  userPrompt: string,
): Promise<{ cid: string }> {
  try {
    const result = await new Pipeline()
      .push(research)
      .push(write)
      .push(edit)
      .run(userPrompt);

    const cid = await uploadToIPFS(result);
    console.log({
      data: matter(result).data,
    });
    const metadata = MetadataSchema.parse({ ...matter(result).data, cid });
    await saveMetadata(metadata);

    return { cid };
  } catch (error) {
    console.error(error);

    return { cid: "" };
  }
}

async function uploadToIPFS(article: string): Promise<string> {
  const helia = await createHelia();
  const s = strings(helia);
  const cid = await s.add(article);
  return cid.toString();
}

async function saveMetadata(metadata: ArticleMetadata) {
  try {
    await mongoClient.connect();
    const db = mongoClient.db("etherpedia-metadata");

    const inserted = await db.collection("metadata").insertOne({
      metadata,
    });

    console.log({
      inserted,
    });
  } catch (e) {
    console.log(e);
  } finally {
    await mongoClient.close();
  }
}

function getMongoClient(): MongoClient {
  const mongoDbUri = process.env.MONGODB_CONNECTION_URI;

  if (!mongoDbUri) {
    throw new Error("MONGODB_CONNECTION_URI is not defined");
  }

  return new MongoClient(mongoDbUri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
}
