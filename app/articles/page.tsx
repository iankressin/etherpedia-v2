'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { getArticles } from "@/app/actions/get-articles";
import { ArticleMetadata } from "../models/article";
import { GridLoader, PulseLoader } from "react-spinners";
import { AgentEventSource } from "@/app/lib/AgentEventSource";
import Markdown from 'markdown-to-jsx';
import { AgentStep } from "@/app/lib/ArticleEventPayload";

const stepLabel = {
    [AgentStep.Init]: 'Assembling our team',
    [AgentStep.Research]: 'Researching',
    [AgentStep.Write]: 'Writing',
    [AgentStep.Edit]: 'Editing',
    [AgentStep.Final]: 'Final Article',
}

export default function List() {
    const [articles, setArticles] = useState<ArticleMetadata[]>()
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [newArticleCid, setNewArticleCid] = useState<string>("")
    const [loadingSearch, setLoadingSearch] = useState<boolean>(false)
    const [loadingArticles, setLoadingArticles] = useState<boolean>(true)
    const [stepContent, setStepContent] = useState<string>("")
    const [articleStep, setArticleStep] = useState<AgentStep | undefined>()

    useEffect(() => {
        setStepContent("")
        setNewArticleCid("")
        setArticleStep(undefined)
        setStepContent("")
        setNewArticleCid("")

        const debounceTimeout = setTimeout(async () => {
            if (searchTerm)
                setLoadingSearch(true)

            try {
                const articles = await getArticles(searchTerm)

                if (articles.length) {
                    setArticles(articles);
                } else {
                    handleArticleCreation(searchTerm)
                }

            } catch (e) {
                console.error('Failed to fetch articles: ', e)
            } finally {
                setLoadingSearch(false)
                setLoadingArticles(false)
            }

        }, 600);

        return () => {
            clearTimeout(debounceTimeout);
        };
    }, [searchTerm]);

    // TODO: refactor
    function handleArticleCreation(searchTerm: string) {
        try {
            setArticleStep(AgentStep.Init)
            const agentEvent = new AgentEventSource(searchTerm)

            agentEvent.onResearch(event => {
                setArticleStep(event.step)
                setStepContent(event.data)
            })

            agentEvent.onWrite(event => {
                setArticleStep(event.step)
                setStepContent(event.data)
            })

            agentEvent.onEdit(event => {
                setArticleStep(event.step)
                setStepContent(event.data)
            })

            agentEvent.onFinalArticle(event => {
                setArticleStep(event.step)
                setStepContent("")
                setNewArticleCid(event.data)
            })
        } catch (e) {
            console.log('Failed to open stream channel: ', e)
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
                articleStep && articleStep !== AgentStep.Final && (
                    <div className="flex flex-col justify-center items-center gap-4">
                        <h2 className="text-2xl font-bold">Unable to find an article for &ldquo;{searchTerm}&ldquo;</h2>

                        <div className="flex flex-col justify-center items-center gap-4">
                            <p className="text-xl">We are creating a customized article based on your search</p>
                            <i className="text-lg">{articleStep ? stepLabel[articleStep] : "Assembling our team"}</i>
                            <PulseLoader color="#ffffff"/>

                            <div className="mt-10 text-gray-500 w-full laptop:max-w-4xl">
                                <Markdown>
                                    {stepContent}
                                </Markdown>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                (articleStep && articleStep === AgentStep.Final && (
                    <div className="flex flex-col items-center justify-center gap-2">
                        <h2 className="text-2xl font-bold">Your article is ready</h2>
                        <p className="text-lg">An article about &ldquo;{searchTerm}&ldquo; has been generated.</p>
                        <Link href={`/articles/${newArticleCid}`} className="border border-zinc-400 rounded-md px-4 py-2 w-fit">
                            Click here to view it.
                        </Link>
                    </div>
                ))
            }

            {
                !articleStep && (
                    <div className="flex flex-col gap-8">
                    {articles?.map((article) => (
                        <Link key={article.cid} href={`articles/${article.cid}`} className="flex flex-col gap-2 max-w-[600px]">
                        <h2 className="text-2xl font-bold">{article.title}</h2>
                        <i className="text-sm">{article.description}</i>
                        <p className="text-sm">Published at: {article.createdAt.toLocaleDateString()}</p>
                        </Link>
                    ))}
                    </div>
                )
            }
        </div>
    )
}
