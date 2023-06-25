import { getSettingsByProviderId, setSettingsByProviderId } from '@/stores/settings'
import { For, Show, onMount } from 'solid-js'
import { useStore } from '@nanostores/solid'
import { useI18n } from '@/hooks'
import { addConversation } from '@/stores/conversation'
import { conversationMapSortList, currentConversationId } from '@/stores/conversation'
import { showConversationEditModal, currentUser } from '@/stores/ui'
import Login from './Login'
import Charge from './Charge'
import type { User } from '@/types'
import type { Accessor, Setter } from 'solid-js'

interface Props {
  setIsLogin: Setter<boolean>
  isLogin: Accessor<boolean>
  setUser: Setter<User>
  user: Accessor<User>
}
export default (props: Props) => {
  const { t } = useI18n()
  const $conversationMapSortList = useStore(conversationMapSortList)

  onMount(async() => {
    try {
      // 读取token
      if (localStorage.getItem('token')) {
        props.setIsLogin(true)
        const response = await fetch('/api/info', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: localStorage.getItem('token'),
          }),
        })
        const responseJson = await response.json()
        if (responseJson.code === 200) {
          localStorage.setItem('user', JSON.stringify(responseJson.data))
          props.setUser(responseJson.data)
          currentUser.set(responseJson.data)

          setTimeout(() => {
            const setting = getSettingsByProviderId('provider-openai')
            setSettingsByProviderId('provider-openai', {
              authToken: localStorage.getItem('token') as string,
              maxTokens: setting.maxTokens,
              model: setting.model,
              temperature: setting.temperature,
            })
          }, 1000)
        } else {
          props.setIsLogin(false)
        }
      } else {
        props.setIsLogin(false)
      }
    } catch (err) {
      console.error(err)
    }
  })

  return (

  <div class="flex h-full w-full pt-10">
      <div class="flex flex-col w-full max-w-md mx-12 sm:mx-18 overflow-hidden space-y-2">

        <Show when={!props.isLogin()}>
          <div class="fi">
            {/* <span class="text-(2xl transparent) font-extrabold bg-(clip-text gradient-to-r) from-sky-400 to-emerald-600">欢迎使用 ChatGPT 4.0 </span> */}
            <span class="text-2xl font-bold"> 欢迎使用 ChatGPT</span>
            <span class="text-xs ml-2 font-bold rounded bg-[#fde047] text-[#8c5712] p-1">PLUS</span>
          </div>
          {/* <div mt-1 op-60>欢迎来到人工智能时代</div> */}
          <div op-60>验证邮箱开始使用</div>
          <Login
            setIsLogin={props.setIsLogin}
            setUser={props.setUser}
          />
        </Show>
        <Show when={props.isLogin()}>
          <Charge
            setUser={props.setUser}
            user={props.user}
          />
         
        </Show>
      </div>
    
    </div>
  )
}
