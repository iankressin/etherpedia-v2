'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { getArticles } from "@/app/actions/get-articles";
import { ArticleMetadata } from "../models/article";
import { generateArticle } from "@/app/actions/generate-article";

export default function List() {
    const [articles, setArticles] = useState<ArticleMetadata[]>()
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [showGenerateArticle, setShowGenerateArticle] = useState<boolean>(false)
    const [generatingArticle, setGeneratingArticle] = useState<boolean>(false) 
    const [newArticleCid, setNewArticleCid] = useState<string>("")

    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            setShowGenerateArticle(false)

            getArticles(searchTerm).then((articles) => {
                if (!articles.length) setShowGenerateArticle(true)
                setArticles(articles);
            });
        }, 500);

        return () => {
            clearTimeout(debounceTimeout);
        };
    }, [searchTerm]);

    async function handleArticleCreation() {
        try {
            setGeneratingArticle(true)
            const { cid }= await generateArticle(searchTerm)

            if (cid) {
                setNewArticleCid(cid)
            }
        } catch {
            console.log('something went wrong')
        } finally {
            setGeneratingArticle(false)
        }
    }

    return (
        <div className="flex flex-col gap-8">
            <h1 className="text-3xl font-bold">Articles</h1>
            <input
                className="w-min text-black py-1 px-2 rounded-md"
                type="text"
                name="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            {
                showGenerateArticle && (
                    <div className="flex flex-col gap-2 ">
                        <p>
                            No article found for {searchTerm}. Do you want to generate one?
                        </p>
                        <button
                            className="border border-zinc-400 rounded-md px-4 py-2 w-min"
                            onClick={handleArticleCreation}
                            disabled={generatingArticle}
                        >
                        { generatingArticle ? "Please wait..." : "Generate"}
                        </button>
                    </div>
                )
            }

            {
                !generatingArticle && newArticleCid && (
                    <div>
                        <h2 className="text-2xl font-bold">New Article</h2>
                        <Link href={`/articles/${newArticleCid}`}>
                            A new article has been generated. Click here to view it.
                        </Link>
                    </div>
                )
            }

            <div className="flex flex-col gap-8">
                {articles?.map((article) => (
                    <div key={article.cid}>
                        <h2 className="text-2xl font-bold">{article.title}</h2>
                        <p>{article.createdAt}</p>
                        {article.updatedAt && <span>{article.updatedAt}</span>}
                    </div>
                ))}
            </div>
        </div>
    )
}
