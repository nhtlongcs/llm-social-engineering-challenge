// #vercel-disable-blocks
import { ProxyAgent, fetch } from 'undici'
// #vercel-end
import { generatePayload, parseOpenAIStream } from '@/utils/openAI'
import { verifySignature } from '@/utils/auth'
import type { APIRoute } from 'astro'

import { encoding_for_model } from "@dqbd/tiktoken";


const apiKeys = import.meta.env.OPENAI_API_KEYS || ''
const httpsProxy = import.meta.env.HTTPS_PROXY
const baseUrl = ((import.meta.env.OPENAI_API_BASE_URL) || 'https://api.openai.com').trim().replace(/\/$/, '')
const sitePassword = import.meta.env.SITE_PASSWORD

const getRandomKey = () => {
  const keys = apiKeys.split(',').map((key) => key.trim()).filter(Boolean)
  return keys[Math.floor(Math.random() * keys.length)]
}
const _getOutdatedKey = () => {
  const keys = apiKeys.split(',').map((key) => key.trim()).filter(Boolean)
  const key = keys[0]
  return key
}
var apiKey = _getOutdatedKey() // for testing only
// var apiKey = getRandomKey()

export const post: APIRoute = async (context) => {
  const body = await context.request.json()
  var { sign, time, messages, pass } = body
  // debug log messages
  var Instruction = import.meta.env.INSTRUCTION || ''
  messages.unshift({
    role: 'system',
    content: Instruction,
  })
  console.log('messages', messages)
  if (!messages) {
    return new Response(JSON.stringify({
      error: {
        message: 'No input text.',
      },
    }), { status: 400 })
  }
  if (sitePassword && sitePassword !== pass) {
    return new Response(JSON.stringify({
      error: {
        message: 'Invalid password.',
      },
    }), { status: 401 })
  }
  if (import.meta.env.PROD && !await verifySignature({ t: time, m: messages?.[messages.length - 1]?.content || '' }, sign)) {
    return new Response(JSON.stringify({
      error: {
        message: 'Invalid signature.',
      },
    }), { status: 401 })
  }

  // export default async function (req: Request) {
  //   await init((imports) => WebAssembly.instantiate(wasm, imports));

  //   const encoding = new Tiktoken(
  //     model.bpe_ranks,
  //     model.special_tokens,
  //     model.pat_str
  //   );

  //   const tokens = encoding.encode("hello world");
  //   encoding.free();
  //   return new Response(`${tokens}`);
  // }
  const getNumberOfTokens = (messages: any) => {
    // let enc = tiktoken.encodingForModel("gpt-3.5-turbo-0301") // unstable pkg, changed to @dqbd/tiktoken
    const enc = encoding_for_model("gpt-3.5-turbo-0301");

    // write a function to calculate the number of tokens
    // 1. every message follows <|start|>{role/name}\n{content}<|end|>\n
    // 2. every reply is primed with <|start|>assistant<|message|>
    // 3. if there's a name, the role is omitted
    // 4. the number of tokens is the sum of the number of tokens of all messages and the number of tokens of the last message

    const tokens_per_message = 4
    const tokens_per_name = 1
    let num_tokens = 0
    for (let message of messages) {
      num_tokens += tokens_per_message
      for (let key in message) {
        num_tokens += enc.encode(message[key]).length
        if (key == "name") {
          num_tokens += tokens_per_name
        }
      }
    }
    num_tokens += 3
    enc.free();
    return num_tokens
  }
  const num_tokens = getNumberOfTokens(messages)
  // console.log('num_tokens', num_tokens)
  if (num_tokens > 1000) {
    return new Response(JSON.stringify({
      error: {
        message: 'Jason is tired. Please restart the conversation to play again.',
      },
    }), { status: 400 })
  }
  if (messages.length > 20) {
    return new Response(JSON.stringify({
      error: {
        message: 'Jason is tired. Please restart the conversation to play again.',
      },
    }), { status: 400 })
  }
  const initOptions = generatePayload(apiKey, messages)
  // #vercel-disable-blocks
  if (httpsProxy)
    initOptions.dispatcher = new ProxyAgent(httpsProxy)
  // #vercel-end

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  var response = await fetch(`${baseUrl}/v1/chat/completions`, initOptions).catch((err: Error) => {
    console.log(err)
    return new Response(JSON.stringify({
      error: {
        code: err.name,
        message: err.message,
      },
    }), { status: 500 })
  }) as Response

  if (!response.ok) {
    // Maybe the key is outdated, switch to another key
    // if the error is "You exceeded your current quota, please check your plan and billing details.", switch to another key
    apiKey = getRandomKey()
    console.log('switched to another key', apiKey)
    return new Response(JSON.stringify({
      error: {
        message: 'The server is busy. Please try regenerating the reply again.',
      },
    }), { status: 400 })
  }
  return parseOpenAIStream(response) as Response
}
