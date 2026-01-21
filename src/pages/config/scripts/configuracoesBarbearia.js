import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { useRouter } from 'vue-router'

export const useConfiguracoesBarbearia = () => {
  const $q = useQuasar()
  const router = useRouter()

  const diasSemana = ref([])
  const loading = ref(true)

  const barbearia = ref({
    nome: '',
    telefone: '',
    endereco: '',
    id: null
  })

  const adicionarServico = () => {
    router.push({
      name: 'servicos-create',
      params: {
        barbeariaId: barbearia.value.id
      }
    })
  }

const servicos = ref([
  { id: null,
    nome: '',
    preco: '' }
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

      await api.post('/horarios-atendimento/atualizarHorariosDeFuncionamento', {
        horarios,
        dadosBarbearia: barbearia.value
      })

      $q.notify({
        type: 'positive',
        message: 'Configurações salvas com sucesso!',
        icon: 'check_circle'
      })
    } catch (error) {
      console.error(error)
      $q.notify({ type: 'negative', message: 'Erro ao salvar configurações' })
    }
  }

onMounted(async () => {
  loading.value = true

  try {
    await Promise.all([
      buscarHorarios(),
      buscarBarbearia(),
      buscarServicos()
    ])
  } finally {
    loading.value = false
  }
})


  return {
    diasSemana,
    barbearia,
    salvarConfiguracoes,
    // servicosContainer,
    servicos,
    // scrollServicos,
    buscarServicos,
    editarServicos,
    loading,

    adicionarServico
  }
}
