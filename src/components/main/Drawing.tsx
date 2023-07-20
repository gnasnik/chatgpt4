import { Show } from 'solid-js'
import StreamableText from '../StreamableText'
import type { Accessor } from 'solid-js'
import type { MessageInstance } from '@/types/message'

interface Props {
  // conversationId: string
  messages: Accessor<MessageInstance[]>
  // fetching: boolean
}

export default (props: Props) => {
  const isUrl = (url: string | undefined) :boolean=> {
      return /^(https?:\/\/(([a-zA-Z0-9]+-?)+[a-zA-Z0-9]+\.)+[a-zA-Z]+)(:\d+)?(\/.*)?(\?.*)?(#.*)?$/.test(url as string)
  }  
  const messageInput = () => props.messages().length > 0 ? props.messages()[0] : null
  const messageOutput = () => props.messages().length > 1 ? props.messages()[1] : null
  const expiredTime = new Date(new URLSearchParams(messageOutput()?.content || '').get('se') as string)

  console.log(messageOutput()?.content)
  console.log(isUrl(messageOutput()?.content))

  return (
    // <div class="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl">
    <div class="relative px-4 bg-white sm:px-20 sm:py-5 scroll-list">
    <div class="mb-4">
        <p class="text-sm text-gray-500 dark:text-gray-300 mb-2"> AI绘画提示词(prompt)是AI绘画的关键，你需要通过prompt来向AI描述你期望它生成的图片，比如： "Cluttered house in the woods | anime oil painting high resolution cottagecore ghibli inspired 4k"。图片有效期两个小时，请及时保存。</p><p class="text-sm text-gray-500 dark:text-gray-300 mb-2">(注意：DALL-E不可以涩涩，不用试了)</p>
    </div>

    <Show when={messageInput()}>
    <div class="min-h-16 max-h-40 fi px-6 py-4 border border-base rounded break-words overflow-y-scroll">
    <StreamableText
        class="w-full"
        text={messageInput()?.content || ''}
    />
    </div>
    </Show>
    <div class="flex-1 fcc overflow-y-auto px-6 py-5">
    <Show when={isUrl(messageOutput()?.content) && expiredTime > new Date()}>
        <img
        class="w-full max-w-[400px] aspect-1"
        src={messageOutput()?.content}
        alt={messageInput()?.content || ''}
        onError={e => e.currentTarget.classList.add('hidden')}
        />
    </Show>
    </div>
    <Show when={messageOutput()?.content && !isUrl(messageOutput()?.content)}> 
      <div class="flex-1 fcc overflow-y-auto">
        <div class="relative p-1 rounded-sm h-[30px] w-[30px] text-white flex items-center justify-center bg-[#19c37d]">
            <img src="gpt.svg" />
        </div>
        <StreamableText
            class="mx-auto flex-grow pl-3"
            text={messageOutput()?.content+' 😭' || ''}
            />
      </div>
    </Show>

    {/* </div> */}
    </div>
  )
}
