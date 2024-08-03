"use server";

import { MongoClient, ServerApiVersion } from "mongodb";
import { ArticleMetadata, MetadataSchema } from "@/app/models/article";

export async function saveArticleMetadata(metadata: ArticleMetadata) {
  const mongoClient = getMongoClient();

  try {
    await mongoClient.connect();
    const db = mongoClient.db("etherpedia-metadata");

    await db.collection("metadata").insertOne({
      metadata,
    });
  } catch (e) {
    console.log(e);
  } finally {
    mongoClient.close();
  }
}

export async function getArticles(
  searchTerm: string,
): Promise<ArticleMetadata[]> {
  const mongoClient = getMongoClient();

  try {
    await mongoClient.connect();
    const db = mongoClient.db("etherpedia-metadata");
    const collection = db.collection("metadata");

    const articles = await (searchTerm
      ? collection.find({ title: { $regex: searchTerm, $options: "i" } })
      : collection.find()
    ).toArray();

    return articles.map((article) => MetadataSchema.parse(article.metadata));
  } catch (error) {
    console.error(error);

    return [];
  } finally {
    mongoClient.close();
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
