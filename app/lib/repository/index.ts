import { uploadFile } from "@/app/lib/repository/ipfs";
import { saveArticleMetadata } from "@/app/lib/repository/mongo";
import { MetadataSchema } from "@/app/models/article";
import matter from "gray-matter";

export class Repository {
  public static async saveFile(file: string): Promise<string> {
    const frontMatter = matter(file).data;
    const cid = await uploadFile(file, frontMatter.title);
    const metadata = MetadataSchema.parse({
      ...frontMatter,
      cid,
      createdAt: new Date(),
    });

    await saveArticleMetadata(metadata);

    return cid;
  }
}
