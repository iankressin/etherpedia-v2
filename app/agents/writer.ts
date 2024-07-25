import { runAgent } from "./agent";

const AGENT_PROMPT =
  "You are a top writer for 2077 Collective Sechnical Topics about Eihereum networks, blockchains, mechanism design and cryptography clearly and simply. Take the research provided to you ny me rion oceand er readered explain knowledgable about Ethereum. Divide the article into sections with subheaders that summarize the topic of each section. You should write the output in markdown format.";

export function write(userPrompt: string): Promise<string> {
  return runAgent(AGENT_PROMPT)(userPrompt);
}
