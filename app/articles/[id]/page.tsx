import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Article } from '../../models/article';
import path from 'path';
import { promises as fs } from 'fs';
import { CID } from 'multiformats/cid'
import matter from 'gray-matter';
import Markdown from 'markdown-to-jsx';
import { createHelia } from 'helia';
import { strings } from '@helia/strings';

// Define the metadata for the article page
export const metadata: Metadata = {
  title: 'Article',
};

async function fetchArticle(id: string): Promise<Article | null> {

  try {
    const helia = await createHelia();
    const s = strings(helia);

    const fileContents = await s.get(CID.parse(id));
    const parsedPost = matter(fileContents)

    // TODO: dynamic title, author, id, and createdAt
    return {
        title: 'Article',
        author: 'GPT',
        id: 'id',
        createdAt: '2024-07-24',
        content: parsedPost.content,
        tags: ['GPT', 'AI']
    }
  } catch (error) {
      console.log('Error: ', error)
    return null;
  }
}

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const article = await fetchArticle(params.id);

  if (!article) {
    notFound();
  }

  return (
    <div>
        <article className='
        h-full w-full laptop:max-w-4xl py-8 px-8 laptop:px-20 flex flex-col gap-16
        [&>div>h1]:text-2xl [&>div>h1]:font-bold [&>div>h1]:mt-2 [&>div>h1]:font-sans [&>div>h1]:text-red
        [&>div>h2]:text-xl [&>div>h2]:font-bold [&>div>h2]:mt-10 [&>div>h2]:font-sans [&>div>h2]:text-blue
        [&>div>h3]:text-md [&>div>h3]:font-bold [&>div>h3]:mt-4 [&>div>h3]:font-sans [&>div>h3]:text-green
        [&>div>h4]:text-md [&>div>h4]:font-bold [&>div>h4]:mt-2 [&>div>h4]:font-sans [&>div>h4]:text-yellow
        [&>div>blockquote]:px-4 [&>div>blockquote]:border-l-4 [&>div>blockquote]:italic
        [&>div>pre]:bg-stone-900 [&>div>pre]:p-4 [&>div>pre]:rounded [&>div>pre]:text-sm
        [&>div>p>a]:text-blue-400 [&>div>p>a]:underline [&>div>p>a]:underline-offset-2
        [&>div>p>em]:text-xl [&>div>p>em]:text-center
        [&>div>ul>li]:list-disc [&>div>ul]:gap-2 [&>div>ul]:flex [&>div>ul]:flex-col
        [&>div>ul>li>ul]:list-[circle] [&>div>ul>li>ul]:px-8
        [&>div>ul>li>p>code]:bg-stone-900 [&>div>ul>li>p>code]:p-1 [&>div>ul>li>p>code]:rounded [&>div>ul>li>p>code]:text-sm
        '>
            <Markdown>
                {article.content}
            </Markdown>
        </article>
    </div>
  );
}
