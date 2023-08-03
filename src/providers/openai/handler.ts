import { isWithinTokenLimit } from 'gpt-tokenizer'
import { fetchChatCompletion, fetchImageGeneration } from './api'
import { parseStream, consumeWord } from './parser'
import type { HandlerPayload, Provider } from '@/types/provider'

export const handlePrompt: Provider['handlePrompt'] = async(payload, signal?: AbortSignal) => {
  if (payload.botId === 'chat_continuous')
    return handleChatCompletion(payload, signal)
  if (payload.botId === 'chat_single')
    return handleChatCompletion(payload, signal)
  if (payload.botId === 'image_generation')
    return handleImageGeneration(payload)
}

export const handleRapidPrompt: Provider['handleRapidPrompt'] = async(prompt, globalSettings) => {
  const rapidPromptPayload = {
    conversationId: 'temp',
    conversationType: 'chat_single',
    botId: 'temp',
    globalSettings: {
      ...globalSettings,
      model: 'gpt-3.5-turbo',
      temperature: 0.4,
      maxTokens: 200,
      top_p: 1,
      stream: false,
    },
    botSettings: {},
    prompt,
    messages: [{ role: 'user', content: prompt.substring(0, 100) }],
  } as HandlerPayload
  const result = await handleChatCompletion(rapidPromptPayload)
  if (typeof result === 'string')
    return result
  return ''
}

const handleChatCompletion = async(payload: HandlerPayload, signal?: AbortSignal) => {
  // 消耗字数
  if (payload.conversationId !== 'temp') {
    let tempMessage = payload.messages
    let tempArr1 = []
    let tempArr2 = []
    let text = ''
    for (let i = 0; i < 1; i++) {
      if (tempMessage?.[i]) {
        text += tempMessage?.[i]?.content || ''
        tempArr1.push(tempMessage[i])
        tempMessage = tempMessage.slice(1)
      }
    }
    tempMessage.reverse()
    const tokenLimit = 3200
    for (const msg of tempMessage) {
      text = text + msg.content
      if (!isWithinTokenLimit(text, tokenLimit))
        break
      else
        tempArr2.push(msg)
    }
    if (tempArr2.length > 0) {
      tempArr2 = tempArr2.reverse()
      tempArr1 = tempArr1.concat(tempArr2)
    }

    payload.messages = tempArr1
    let word_num = 0
    payload.messages.forEach((v) => {
      word_num += v.content.length
    })
    const useRes = await fetch(`${import.meta.env.API_URL}/api/gpt/consumeWord`, {
      headers: {
        'Content-Type': 'application/json',
        'Token': payload.globalSettings.authToken as string,
      },
      method: 'POST',
      body: JSON.stringify({
        model: payload.globalSettings.model,
        type: 'ask',
        word_num,
        app_key: import.meta.env.APP_KEY,
      }),
    })
    const res = await useRes.text()
    const resJson = JSON.parse(res)
    if (resJson.code !== 200)
      return resJson.message
  }

  payload.messages.unshift({
    role: 'system',
    content: '你是GPT4,比GPT3更聪明,请认真思考后回答',
  })

  const response = await fetchChatCompletion({
    apiKey: payload.globalSettings.apiKey as string,
    baseUrl: payload.globalSettings.baseUrl as string,
    body: {
      model: payload.globalSettings.model as string,
      messages: payload.messages,
      temperature: payload.globalSettings.temperature as number,
      // max_tokens: (payload.globalSettings.maxTokens as number) * 2,
      top_p: payload.globalSettings.topP as number,
      stream: payload.globalSettings.stream as boolean ?? true,
    },
    signal,
  })
  if (!response.ok) {
    const responseJson = await response.json()
    console.log('responseJson', responseJson)
    const errMessage = responseJson.error?.message || response.statusText || 'Unknown error'
    throw new Error(errMessage, { cause: responseJson.error })
  }
  const isStream = response.headers.get('content-type')?.includes('text/event-stream')
  if (isStream) {
    return parseStream(response, payload.globalSettings)
  } else {
    const resJson = await response.json()
    return resJson.choices[0].message.content as string
  }
}

const handleImageGeneration = async(payload: HandlerPayload) => {
    // 消耗字数
    if (payload.conversationId !== 'temp') {
      let word_num = 240 // ~2毛钱
      payload.messages.forEach((v) => {
        // word_num += v.content.length
      })
      const useRes = await fetch(`${import.meta.env.API_URL}/api/gpt/consumeWord`, {
        headers: {
          'Content-Type': 'application/json',
          'Token': payload.globalSettings.authToken as string,
        },
        method: 'POST',
        body: JSON.stringify({
          model: payload.globalSettings.model,
          type: 'ask',
          word_num,
          app_key: import.meta.env.APP_KEY,
        }),
      })
      const res = await useRes.text()
      const resJson = JSON.parse(res)
      if (resJson.code !== 200)
        return resJson.message
    }

  const prompt = payload.prompt
  const response = await fetchImageGeneration({
    apiKey: payload.globalSettings.apiKey as string,
    baseUrl: payload.globalSettings.baseUrl as string,
    body: {
      prompt,
      n: 1,
      size: '1024x1024',
      response_format: 'url', // TODO: support 'b64_json'
    },
  })
  if (!response.ok) {
    const responseJson = await response.json()
    const errMessage = responseJson.error?.message || response.statusText || 'Unknown error'
    throw new Error(errMessage)
  }
  const resJson = await response.json()
  consumeWord(payload.globalSettings, 10)
  return resJson.data[0].url

  
}
