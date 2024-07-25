'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { getArticles } from "@/app/actions/get-articles";
import { ArticleMetadata } from "../models/article";
import { generateArticle, pollArticleGeneration } from "@/app/actions/generate-article";
import { GridLoader, PulseLoader } from "react-spinners";

export default function List() {
    const [articles, setArticles] = useState<ArticleMetadata[]>()
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [showGenerateArticle, setShowGenerateArticle] = useState<boolean>(false)
    const [generatingArticle, setGeneratingArticle] = useState<boolean>(false) 
    const [newArticleCid, setNewArticleCid] = useState<string>("")
    const [loadingSearch, setLoadingSearch] = useState<boolean>(false)
    const [loadingArticles, setLoadingArticles] = useState<boolean>(true)

    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            setShowGenerateArticle(false)

            if (searchTerm)
                setLoadingSearch(true)

            getArticles(searchTerm)
                .then((articles) => {
                    if (!articles.length) setShowGenerateArticle(true)
                    setArticles(articles);
                })
                .catch(e => console.log(e))
                .finally(() => {
                    setLoadingSearch(false)
                    setLoadingArticles(false)
                })
        }, 500);

        return () => {
            clearTimeout(debounceTimeout);
        };
    }, [searchTerm]);

    async function handleArticleCreation() {
        try {
            setGeneratingArticle(true)
            generateArticle(searchTerm)

            let cid: string | undefined = undefined
            const interval = setInterval(async () => {
                cid = await pollArticleGeneration(searchTerm)
                if (cid) {
                    setNewArticleCid(cid)
                    clearInterval(interval)
                }
            }, 1000)
        } catch {
            console.log('something went wrong')
        } finally {
            setGeneratingArticle(false)
        }
    }

    return (
        <div className="flex flex-col gap-16">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Etherpedia</h1>
                <div className="flex gap-2 items-center">
                    { loadingSearch ? (<GridLoader color="#ffffff" size={8}/>) : (<label htmlFor="search" className="font-bold">Search</label>)}
                    <input
                        className="w-min text-black py-1 px-2 rounded-md"
                        type="text"
                        name="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            {
                loadingArticles && (
                    <div className="flex flex-col justify-center items-center gap-4">
                        <h1 className="text-gray-300 text-xl font-bold">Fetching articles</h1>
                        <GridLoader color="#ffffff"/>
                    </div>
                )
            }
            {
                !searchTerm && !showGenerateArticle && !articles?.length && !loadingArticles && (
                    <p>
                        No articles yet
                    </p>
                )
            }
            {
                searchTerm && showGenerateArticle && !newArticleCid && (
                    <div className="flex flex-col gap-2 items-center justify-center">
                        <p className="font-semibold">
                            { 
                                generatingArticle ? (`Generating a new article for "${searchTerm}"`) : `No article found for ${searchTerm}. Do you want to generate one?`
                            }
                        </p>
                        <button
                            className="border border-zinc-400 rounded-md px-4 py-2 w-fit"
                            onClick={handleArticleCreation}
                            disabled={generatingArticle}
                        >
                        { generatingArticle ? (
                            <PulseLoader color="#ffffff" size={8}/>
                        ) : "Generate"}
                        </button>
                    </div>
                )
            }

            {
                !generatingArticle && newArticleCid && (
                    <div className="flex flex-col items-center justify-center gap-2">
                        <h2 className="text-2xl font-bold">Your article is ready</h2>
                        <p className="text-lg">An article about &ldquo;{searchTerm}&ldquo; has been generated.</p>
                        <Link href={`/articles/${newArticleCid}`} className="border border-zinc-400 rounded-md px-4 py-2 w-fit">
                            Click here to view it.
                        </Link>
                    </div>
                )
            }

            <div className="flex flex-col gap-8">
                {articles?.map((article) => (
                    <Link key={article.cid} href={`articles/${article.cid}`} className="flex flex-col gap-2 max-w-[600px]">
                        <h2 className="text-2xl font-bold">{article.title}</h2>
                        <i className="text-sm">{article.description}</i>
                        <p className="text-sm">Published at: {article.createdAt.toLocaleDateString()}</p>
                    </Link>
                ))}
            </div>
        </div>
    )
}
