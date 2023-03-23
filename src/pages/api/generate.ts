import {Message} from "@/models";
import {createParser, ParsedEvent, ReconnectInterval} from "eventsource-parser";

export const config = {
  runtime: "edge"
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { messages } = (await req.json()) as {
      messages: Message[];
    };

    const charLimit = 12000;
    let charCount = 0;
    let messagesToSend = [];

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      if (charCount + message.content.length > charLimit) {
        break;
      }
      charCount += message.content.length;
      messagesToSend.push(message);
    }

    const stream = await OpenAIStream(messagesToSend);

    return new Response(stream);
  } catch (error) {
    console.error(error);
    return new Response("Error", { status: 500 });
  }
};
const OpenAIStream = async (messages: Message[]) => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const res = await fetch("https://blair-aoai.openai.azure.com/openai/deployments/gpt-35-turbo/chat/completions?api-version=2023-03-15-preview", {
    headers: {
      "Content-Type": "application/json",
      "api-key": `${process.env.AZURE_OPENAI_API_KEY}`
    },
    method: "POST",
    body: JSON.stringify({
      frequency_penalty:0,
      max_tokens: 4000,
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that helps people find information.`
        },
        ...messages
      ],
      presence_penalty:0,
      stream: true,
      temperature: 0.7,
      top_p: 0.95
    })
  });

  if (res.status !== 200) {
    throw new Error("OpenAI API returned an error");
  }

  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === "event") {
          const data = event.data;

          if (data === "[DONE]") {
            controller.close();
            return;
          }

          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta.content;
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
        }
      };

      const parser = createParser(onParse);

      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    }
  });

  return stream;
};
export default handler;
