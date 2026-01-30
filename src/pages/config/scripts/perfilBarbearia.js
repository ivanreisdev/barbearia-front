import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

export const useConfiguracoesBarbearia = () => {
  const $q = useQuasar()
  const loading = ref(true)

  const barbearia = ref({
    nome: '',
    telefone: '',
    endereco: '',
    id: null,
    foto: null,
  })

  const buscarBarbearia = async () => {
    try {
      const { data } = await api.get('/barbearia/info')
      barbearia.value = { ...barbearia.value, ...data.barbearia }
    } catch (error) {
      console.error(error)
      $q.notify({ type: 'negative', message: 'Erro ao carregar barbearia' })
    }
  }

  const BASE_URL = import.meta.env.VITE_API_URL
  const fotoFile = ref(null)


  const fotoBackend = computed(() => {
    if (!barbearia.value.foto) return null
    return `${BASE_URL}/storage/${barbearia.value.foto}?t=${Date.now()}`
  })

  const salvarPerfilBarbearia = async () => {
    try {
      const formData = new FormData()

      formData.append('nome', barbearia.value.nome)
      formData.append('telefone', barbearia.value.telefone)
      formData.append('endereco', barbearia.value.endereco)

      if (fotoFile.value instanceof File) {
        formData.append('foto', fotoFile.value)
      }

      const { data } = await api.post(
        '/barbearia/atualizarBarbearia',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      // atualiza estado com retorno do backend
      barbearia.value = data.barbearia

      $q.notify({
        type: 'positive',
        message: 'Configurações salvas com sucesso!'
      })
    } catch (error) {
      console.error(error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao salvar configurações'
      })
    }
  }



  onMounted(async () => {
    loading.value = true

    try {
      await Promise.all([
        buscarBarbearia(),
      ])
    } finally {
      loading.value = false
    }
  })

  return {
    barbearia,
    loading,
    salvarPerfilBarbearia,
    fotoBackend,
    fotoFile
  }
}
