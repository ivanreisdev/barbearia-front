import { boot } from 'quasar/wrappers'

export default boot(({ $q }) => {
  // Força o tema dark em toda a aplicação
  if ($q && typeof $q.dark?.set === 'function') {
    $q.dark.set(true)
  } else if (typeof window !== 'undefined' && window.Quasar && window.Quasar.dark && typeof window.Quasar.dark.set === 'function') {
    window.Quasar.dark.set(true)
  }
})
