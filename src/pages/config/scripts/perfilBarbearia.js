import { ref, onMounted, computed } from 'vue'
import { useQuasar, Loading } from 'quasar'
import { api } from 'boot/axios'
import LoadingLogo from 'components/LoadingLogo.vue'


export const useConfiguracoesBarbearia = () => {
  const $q = useQuasar()
  const carregamento = ref(true)
  const criarEnderecoPadrao = () => ({
    id: null,
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    uf: '',
    complemento: '',
    barbearia_id: null,
  })

  const ufsBrasil = [
    { label: 'AC - Acre', value: 'AC' },
    { label: 'AL - Alagoas', value: 'AL' },
    { label: 'AP - Amapa', value: 'AP' },
    { label: 'AM - Amazonas', value: 'AM' },
    { label: 'BA - Bahia', value: 'BA' },
    { label: 'CE - Ceara', value: 'CE' },
    { label: 'DF - Distrito Federal', value: 'DF' },
    { label: 'ES - Espirito Santo', value: 'ES' },
    { label: 'GO - Goias', value: 'GO' },
    { label: 'MA - Maranhao', value: 'MA' },
    { label: 'MT - Mato Grosso', value: 'MT' },
    { label: 'MS - Mato Grosso do Sul', value: 'MS' },
    { label: 'MG - Minas Gerais', value: 'MG' },
    { label: 'PA - Para', value: 'PA' },
    { label: 'PB - Paraiba', value: 'PB' },
    { label: 'PR - Parana', value: 'PR' },
    { label: 'PE - Pernambuco', value: 'PE' },
    { label: 'PI - Piaui', value: 'PI' },
    { label: 'RJ - Rio de Janeiro', value: 'RJ' },
    { label: 'RN - Rio Grande do Norte', value: 'RN' },
    { label: 'RS - Rio Grande do Sul', value: 'RS' },
    { label: 'RO - Rondonia', value: 'RO' },
    { label: 'RR - Roraima', value: 'RR' },
    { label: 'SC - Santa Catarina', value: 'SC' },
    { label: 'SP - Sao Paulo', value: 'SP' },
    { label: 'SE - Sergipe', value: 'SE' },
    { label: 'TO - Tocantins', value: 'TO' },
  ]

  const barbearia = ref({
    nome: '',
    telefone: '',
    endereco: criarEnderecoPadrao(),
    id: null,
    foto: null,
  })

  const previewFoto = ref(null)
  const fileInput = ref(null)
  const modalCrop = ref(false)
  const imagemParaCrop = ref(null)

  const buscarBarbearia = async () => {
    try {
      const { data } = await api.get('/barbearia/info')
      const endereco =
        data.barbearia?.endereco && typeof data.barbearia.endereco === 'object'
          ? data.barbearia.endereco
          : {}

      barbearia.value = {
        ...barbearia.value,
        ...data.barbearia,
        endereco: {
          ...criarEnderecoPadrao(),
          ...endereco,
        },
      }
    } catch (error) {
      console.error(error)
      $q.notify({ type: 'negative', message: 'Erro ao carregar barbearia' })
    }
  }

  function gerarPreview(file) {
    if (!file) return

    const reader = new FileReader()
    reader.onload = e => {
      imagemParaCrop.value = e.target.result
      modalCrop.value = true
    }
    reader.readAsDataURL(file)
  }

  // const abrirUpload = () => {
  //   fileInput.value.pickFiles()
  // }

  const BASE_URL = import.meta.env.VITE_API_URL
  const fotoFile = ref(null)


  const fotoBackend = computed(() => {
    if (!barbearia.value.foto) return null
    return `${BASE_URL}/storage/${barbearia.value.foto}?t=${Date.now()}`
  })

  function onImagemCortada({ file, preview }) {
    fotoFile.value = file
    previewFoto.value = preview
  }
  const salvarPerfilBarbearia = async () => {
    try {
      const formData = new FormData()
      const endereco = barbearia.value.endereco || criarEnderecoPadrao()

      formData.append('nome', barbearia.value.nome)
      formData.append('telefone', barbearia.value.telefone)
      formData.append('endereco[id]', endereco.id ?? '')
      formData.append('endereco[rua]', endereco.rua ?? '')
      formData.append('endereco[numero]', endereco.numero ?? '')
      formData.append('endereco[bairro]', endereco.bairro ?? '')
      formData.append('endereco[cidade]', endereco.cidade ?? '')
      formData.append('endereco[uf]', endereco.uf ?? '')
      formData.append('endereco[complemento]', endereco.complemento ?? '')

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
      barbearia.value = {
        ...data.barbearia,
        endereco: {
          ...criarEnderecoPadrao(),
          ...(data.barbearia?.endereco || {}),
        },
      }

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
    Loading.show({
      spinner: LoadingLogo,
      backgroundColor: '#0c0d10'
    })

    try {
      await Promise.all([
        buscarBarbearia(),
      ])
    } finally {
      carregamento.value = false
      Loading.hide()
    }
  })

  return {
    barbearia,
    salvarPerfilBarbearia,
    fotoBackend,
    fotoFile,
    gerarPreview,
    modalCrop,
    imagemParaCrop,
    onImagemCortada,
    fileInput,
    previewFoto,
    LoadingLogo,
    carregamento,
    ufsBrasil
  }
}
