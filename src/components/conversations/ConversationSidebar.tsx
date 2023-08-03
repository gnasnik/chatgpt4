import { Show, For, createSignal, onMount } from 'solid-js'
import { useStore } from '@nanostores/solid'
import { useI18n } from '@/hooks'
import { conversationMapSortList } from '@/stores/conversation'
import ConversationSidebarItem from './ConversationSidebarItem'
import ConversationSidebarAdd from './ConversationSidebarAdd'
import ConversationSidebarUser from './ConversationSidebarUser'
import type { User } from '@/types'

export default () => {
  const { t } = useI18n()
  const $conversationMapSortList = useStore(conversationMapSortList)
  const [user, setUser] = createSignal<User>({
    id: 0,
    email: '',
    nickname: '',
    times: 0,
    token: '',
    word: 0,
    temp_times: 0,
    expired_at: ''
  })

  return (
    <div class="h-full flex flex-col bg-sidebar bg-[#202123] color-[#ffffff] p-2">
      <header class="h-14 fi justify-between px-4 text-xs uppercase pl-6">
        <p class="px-2">{t('conversations.title')}</p>
        <div class="fi gap-1">
          {/* <Button
            icon="i-carbon-search"
            onClick={() => {}}
            size="sm"
          /> */}
          <ConversationSidebarAdd />
        </div>
      </header>
      <div class="flex-1 overflow-auto">
        <div class="px-2">
          <For each={$conversationMapSortList()}>
            {instance => (
              <ConversationSidebarItem instance={instance} />
            )}
          </For>
        </div>
      </div>
      <div>
      
      <ConversationSidebarUser  
        setUser={setUser}
        user={user} 
      />
      </div>


    </div>
  )
}
