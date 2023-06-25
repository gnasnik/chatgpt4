import { For, createSignal, onMount, Show } from 'solid-js';
import { useStore } from '@nanostores/solid';
import Charge from '../main/Charge'
import { currentUser} from '@/stores/ui'
import type { User } from '@/types'


export default () => {
  const $currentUser = useStore(currentUser)
  const [user, setUser] = createSignal<User>($currentUser())
  return (
    <Show when={!!$currentUser()}>
    <div class="p-6">
        <header class="mb-4">
          <h1 class="font-bold">支付宝充值</h1>
        </header>
        <main class="flex flex-col gap-5">
        <Charge
                user={user}
                setUser={setUser}
                show={true}
                />
        </main>
    </div>
    </Show>
  );
};
