import { leading, throttle } from '@solid-primitives/scheduled'
import StreamableText from '../StreamableText'
import Charge from './Charge'
import { Accessor, Setter, Show } from 'solid-js'
import type { MessageInstance } from '@/types/message'
import type { User } from '@/types'
interface Props {
  conversationId: string
  messages: Accessor<MessageInstance[]>

  setUser: Setter<User>
  user: Accessor<User>
}

export default ({ conversationId, messages, user, setUser }: Props) => {
  let scrollRef: HTMLDivElement
  const messageInput = () => messages().length > 0 ? messages()[0] : null
  const messageOutput = () => messages().length > 1 ? messages()[1] : null

  const instantScrollToBottomThrottle = leading(throttle, (element: HTMLDivElement) => element.scrollTo({ top: element.scrollHeight }), 250)

  const handleStreamableTextUpdate = () => {
    instantScrollToBottomThrottle(scrollRef)
  }

  return (
    <div class="flex flex-col h-full">
      {/* <div class="px-6">
        <Charge
          setUser={setUser}
          user={user}
        />
      </div>
      */}

    <div class="flex justify-center">
      <p class="px-6 pb-2 mt-2 text-xs text-yellow-900 items-center"> 注意:单次对话模式新问题将直接覆盖老问题</p>
    </div>

    <div class="flex-[1] border-b border-base p-6 break-all overflow-y-scroll">

      <div class="flex flex-row gap-4">
        <Show when={!!messageInput()}>
          <div class={`shrink-0 w-7 h-7 rounded-md op-80 bg-gradient-to-b from-[#fccb90] to-[#d57eeb]`}></div>
        </Show>
        
          <StreamableText
            class="mx-auto flex-grow"
            text={messageInput()?.content || ''}
          />
      </div>
      </div>

      <div class="scroll-list flex-[2] p-6 break-all overflow-y-scroll" ref={scrollRef!}>
      <div class="flex flex-row gap-4">
      <Show when={!!messageOutput()}>
        <div class="relative p-1 rounded-sm h-[30px] w-[30px] text-white flex items-center justify-center bg-[#19c37d]">
          <img src="gpt.svg" />
        </div>
      </Show>  
        <StreamableText
          class="mx-auto flex-grow"
          text={messageOutput()?.content || ''}
          streamInfo={messageOutput()?.stream
            ? () => ({
                conversationId,
                messageId: messageOutput()?.id || '',
                handleStreaming: handleStreamableTextUpdate,
              })
            : undefined}
        />
      </div>

        </div>
      
    </div>
  )
}
