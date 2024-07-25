import OpenAI from "openai";

const OPENAI_CLIENT = new OpenAI({
  apiKey: process.env.OPENAPI_API_KEY,
});

export function runAgent(agentPrompt: string) {
  return async (userPrompt: string): Promise<string> => {
    const response = await OPENAI_CLIENT.chat.completions.create({
      messages: [
        {
          role: "system",
          content: agentPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      model: "gpt-3.5-turbo-16k",
      stream: false,
    });

    let output = "";

    response.choices.forEach((choice) => {
      output += choice.message.content;
    });

    if (process.env.DEBUG === "all") console.log("\n=> Response \n", output);

    return output;
  };
}
