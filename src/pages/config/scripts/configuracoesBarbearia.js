import { ref, onMounted, computed } from 'vue'
import { useQuasar, Loading } from 'quasar'
import { api } from 'boot/axios'
import { useRouter } from 'vue-router'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import LoadingLogo from 'components/LoadingLogo.vue'


export const useConfiguracoesBarbearia = () => {
  const $q = useQuasar()
  const router = useRouter()

  const diasSemana = ref([])
  // const loading = ref(true)
  const previewFoto = ref(null)
  const fotoFile = ref(null)
  const fileInput = ref(null)

  const modalCrop = ref(false)
  const imagemParaCrop = ref(null)
  const cropper = ref(null)
  const cropperReady = ref(false)

  const abrirUpload = () => {
    fileInput.value.pickFiles()
  }

  const gerarPreview = (file) => {
    const arquivo = Array.isArray(file) ? file[0] : file
    imagemParaCrop.value = URL.createObjectURL(arquivo)
    modalCrop.value = true
  }

  const carregamento = ref([true])

  const confirmarCrop = () => {
    if (!cropper.value) return

    const { canvas } = cropper.value.getResult()
    if (!canvas) return

    canvas.toBlob((blob) => {
      const arquivoFinal = new File([blob], 'avatar.jpg', {
        type: 'image/jpeg',
        lastModified: Date.now()
      })

      fotoFile.value = arquivoFinal
      previewFoto.value = URL.createObjectURL(blob)

      modalCrop.value = false
      cropperReady.value = false
    }, 'image/jpeg', 0.95)
  }

  const barbearia = ref({
    nome: '',
    telefone: '',
    endereco: '',
    id: null
  })

  const usuario = ref({
    name: '',
    telefone: '',
    endereco: '',
    id: null,
    email: '',
    foto: null,
  })
  const BASE_URL = import.meta.env.VITE_API_URL

  const fotoBackend = computed(() => {
    if (!usuario.value.foto) return null
    return `${BASE_URL}/storage/${usuario.value.foto}?t=${Date.now()}`
  })


  // const adicionarServico = () => {
  //   router.push({
  //     name: 'servicos-create',
  //     params: {
  //       barbeariaId: barbearia.value.id
  //     }
  //   })
  // }

  const servicos = ref([
    {
      id: null,
      nome: '',
      preco: ''
    }
  ])
  console.log('servicos ref', servicos);
  const labels = [
    { key: 'domingo', label: 'Domingo', dia_semana: 1 },
    { key: 'segunda', label: 'Segunda-feira', dia_semana: 2 },
    { key: 'terca', label: 'Terça-feira', dia_semana: 3 },
    { key: 'quarta', label: 'Quarta-feira', dia_semana: 4 },
    { key: 'quinta', label: 'Quinta-feira', dia_semana: 5 },
    { key: 'sexta', label: 'Sexta-feira', dia_semana: 6 },
    { key: 'sabado', label: 'Sábado', dia_semana: 7 }
  ]

  const buscarHorarios = async () => {
    try {
      const { data } = await api.get('/horarios-atendimento/buscarHorariosAtendimentos')

      const diasMap = {}
      data.forEach(item => {
        diasMap[item.dia_semana] = item
      })

      diasSemana.value = labels.map(l => {
        const item = diasMap[l.dia_semana] || {}
        return {
          key: l.key,
          label: l.label,
          dia_semana: l.dia_semana,
          ativo: item.ativo === 1,
          inicio: item.inicio?.slice(0, 5) || '09:00',
          almocoInicio: item.almoco_inicio?.slice(0, 5) || '',
          almocoFim: item.almoco_fim?.slice(0, 5) || '',
          fim: item.fim?.slice(0, 5) || '18:00'
        }
      })
    } catch (error) {
      console.error(error)
      $q.notify({ type: 'negative', message: 'Erro ao carregar horários' })
    }
  }

  const buscarUsuario = async () => {
    try {
      const { data } = await api.get('/usuario/buscarDadosUsuario')

      usuario.value = {
        id: data.id ?? '',
        name: data.name ?? '',
        telefone: data.telefone ?? '',
        email: data.email ?? '',
        endereco: data.endereco,
        foto: data.foto
      }

    } catch (error) {
      console.error(error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar dados do usuário'
      })
    }
  }



  const buscarBarbearia = async () => {
    try {
      const { data } = await api.get('/barbearia/info')
      barbearia.value = { ...barbearia.value, ...data.barbearia }
    } catch (error) {
      console.error(error)
      $q.notify({ type: 'negative', message: 'Erro ao carregar barbearia' })
    }
  }

  const buscarServicos = async () => {
    try {
      const { data } = await api.get('/servicos/buscarServicosPorBarbeariaId')

      servicos.value = data.map(item => ({
        id: item.id,
        nome: item.nome,
        preco: `R$ ${Number(item.preco).toFixed(2).replace('.', ',')}`,
        duracao: `${item.duracao_minutos} min`
      }))
    } catch (error) {
      console.error('Erro ao buscar serviços', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar serviços'
      })
    }
  }

  const editarServicos = () => {
    router.push({
      name: 'servicos-page',
    })
  }
  const swipeSalvar = ref(null)
  const onConfirmSalvar = async () => {
    await salvarConfiguracoes()
    swipeSalvar.value?.resetSwipe()
  }


  const salvarConfiguracoes = async () => {
    try {
      const horarios = diasSemana.value.map(dia => ({
        dia_semana: dia.dia_semana,
        ativo: dia.ativo ? 1 : 0,
        inicio: dia.inicio + ':00',
        almoco_inicio: dia.almocoInicio ? dia.almocoInicio + ':00' : null,
        almoco_fim: dia.almocoFim ? dia.almocoFim + ':00' : null,
        fim: dia.fim + ':00'
      }))

      const formData = new FormData()

      // 👉 horários (array)
      formData.append('horarios', JSON.stringify(horarios))

      // 👉 dados do usuário
      formData.append('name', usuario.value.name)
      formData.append('telefone', usuario.value.telefone)
      formData.append('email', usuario.value.email)
      formData.append('endereco', usuario.value.endereco ?? '')

      // 👉 foto (somente se tiver)
      if (fotoFile.value) {
        formData.append('foto', fotoFile.value)
      }


      await api.post(
        '/horarios-atendimento/atualizarHorariosDeFuncionamento',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      $q.notify({
        type: 'positive',
        message: 'Configurações salvas com sucesso!',
        icon: 'check_circle'
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
        buscarHorarios(),
        buscarBarbearia(),
        buscarServicos(),
        buscarUsuario(),
      ])
    } finally {
      carregamento.value = false
      Loading.hide()
    }
  })


  return {
    diasSemana,
    barbearia,
    usuario,
    onConfirmSalvar,
    // servicosContainer,
    servicos,
    // scrollServicos,
    buscarServicos,
    editarServicos,
    // loading,
    previewFoto,
    fotoBackend,
    fotoFile,
    fileInput,
    abrirUpload,
    gerarPreview,
    confirmarCrop,
    Cropper,
    imagemParaCrop,
    // adicionarServico,
    modalCrop,
    cropperReady,
    cropper,
    swipeSalvar,
    LoadingLogo,
    carregamento,
  }
}
