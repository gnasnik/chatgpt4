import { createSignal, Show, For} from 'solid-js';
import { showConversationQrcodeModal,showConversationPurchaseModal, currentUser} from '@/stores/ui'
import { useStore } from '@nanostores/solid'
import { Transition } from 'solid-transition-group'

interface MenuItem {
    name: string,
    icon: string,
    value: string,
}
  

export default () => { 
    const $currentUser = useStore(currentUser)
    const [isShowQrcode, setShowQrcode] = createSignal(false);
    const [isMenuOpen, setMenuOpen] = createSignal(false);
    const [menuItems] = createSignal<MenuItem[]>([
        {
            name: "扫码入群",
            icon: 'i-carbon-qr-code',
            value: 'qrcode',
        },
        {
            name: "退出登陆",
            icon: 'i-carbon-logout',
            value: 'logout',
        },
    ]);
  
    const handleUserButtonClick = () => {
      setMenuOpen(!isMenuOpen());
    };

    const handlePurchaseButtonClick =(e: Event) =>{
      e.stopPropagation()
      showConversationPurchaseModal.set(true)
    }
  
    const handleMenuItemClick = (item: MenuItem) => {
      if (item.value == 'qrcode') {
        showConversationQrcodeModal.set(true)
      }else if (item.value == 'logout') {
        localStorage.clear();
        window.location.reload();
      }
      setMenuOpen(!isMenuOpen());
    };


    return (
        <Show when={!!$currentUser()}>
        <div >
           
            <hr class="border-t border-gray-600 my-2" />
            <a class="flex p-3 items-center gap-3 transition-colors duration-200 text-white cursor-pointer text-sm hover:bg-[#343541] rounded-md" onclick={handlePurchaseButtonClick}>
              <span class="flex w-full flex-row justify-between">
              <span class="gold-new-button flex items-center gap-3">
                <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              支付宝充值</span>
              <span class="rounded-md bg-yellow-200 px-1.5 py-0.5 text-xs font-medium uppercase text-gray-800">优惠</span></span>
            </a>
            <div class="relative">

            <Transition name="slide-bottom">
              <Show when={isMenuOpen()}>
                  <div class="absolute bottom-full left-0 z-20 mb-2 w-full overflow-hidden rounded-md bg-gray-950 pb-1.5 pt-1 outline-none opacity-100 translate-y-0">
                      <nav role='none'>
                      <For each={menuItems()}>
                            {(item) => (
                            <a class='flex p-3 items-center gap-3 transition-colors duration-200 text-white cursor-pointer text-sm hover:bg-gray-700' onClick={() => handleMenuItemClick(item)} >
                            <div class={`w-6 h-4 text-xl ${item.icon}`} />{item.name}
                            </a>
                            )}
                          </For>  
                      </nav>    
                  </div>
              </Show>
            </Transition>

            <div class="flex p-3 items-center gap-4 hover:bg-[#343541] rounded-md transition-colors duration-200 text-white cursor-pointer"
                  onClick={handleUserButtonClick}>
                  <div class="flex items-center justify-center">
                    <div class={`text-center text-sm items-center justify-center w-5 h-5 bg-[#502CA8]`}>{$currentUser().nickname[0]}</div>
                  </div>
                  <div class="text-sm" >{$currentUser().nickname}</div>
                  <div class="flex flex-grow"></div>
                  <div class="i-carbon-overflow-menu-horizontal op-60 mr-2"></div>
            </div>

          </div>  
        </div>
        </Show>
      );
}
