<template>
  <LoadingLogo v-if="carregando" class="loading-overlay" />

  <q-page v-else class="finance-page q-pa-md">
    <div class="row items-center q-mb-lg finance-header no-wrap">
      <div class="header-title row items-center no-wrap">
        <q-btn flat round icon="arrow_back" class="back-btn q-mr-md" @click="$router.back()" />
        <div>
          <div class="text-h5 text-weight-bold page-title">Faturamento</div>
          <div class="text-caption text-grey-5">Visao geral do faturamento da barbearia</div>
        </div>
      </div>
      <div class="header-actions">
        <q-btn flat round icon="more_vert" color="grey-4" class="ghost-btn menu-btn">
          <q-menu anchor="bottom right" self="top right">
            <q-list dense>
              <q-item clickable v-close-popup @click="exportarPdf">
                <q-item-section avatar>
                  <q-icon name="download" />
                </q-item-section>
                <q-item-section>Exportar</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-lg resumo-row">
      <div class="col-12 col-sm resumo-col" v-for="card in resumoCards" :key="card.label">
        <q-card flat bordered class="card-dark summary-card">
          <q-card-section class="row items-center justify-between summary-content">
            <div>
              <div class="text-caption text-grey-5">{{ card.label }}</div>
              <div class="text-h6 text-weight-bold">{{ card.valor }}</div>
              <div class="text-caption" :class="card.deltaClass">{{ card.delta }}</div>
            </div>
            <q-avatar size="42px" color="grey-9" text-color="white">
              <q-icon :name="card.icon" />
            </q-avatar>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="q-mb-lg">
      <div class="row items-center justify-center q-mb-sm">
        <div class="text-center">
          <div class="text-subtitle1 text-weight-bold">Faturamento por Funcionario</div>
          <div class="text-caption text-grey-5">{{ subtituloFaturamentoMembros }}</div>
        </div>
      </div>

      <div v-if="membrosFaturamento.length" class="row q-col-gutter-sm justify-center membros-row">
        <div v-for="membro in membrosFaturamento" :key="membro.id" class="col-12 col-sm-6 col-md-5 col-lg-4 membro-col">
          <q-card flat bordered class="card-dark membro-card">
            <q-card-section class="membro-card-section">
              <div class="membro-header">
                <q-avatar size="34px" class="membro-avatar">
                  <img v-if="membro.fotoUrl" :src="membro.fotoUrl" :alt="membro.nome">
                  <q-icon v-else name="person" color="grey-4" />
                </q-avatar>
                <div class="membro-identidade">
                  <div class="membro-nome ellipsis">{{ membro.nome }}</div>
                  <div class="membro-cargo">Barbeiro</div>
                </div>
              </div>

              <div class="membro-info">
                <div class="membro-metricas">
                  <div class="metrica-col">
                    <div class="metrica-label">Agendamentos</div>
                    <div class="metrica-valor">{{ membro.totalAgendamentos }}</div>
                  </div>
                  <div class="metrica-col">
                    <div class="metrica-label">Faturamento</div>
                    <div class="metrica-valor metrica-valor--money">{{ formatarMoeda(membro.totalFaturado) }}</div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <q-card v-else flat bordered class="card-dark membro-empty">
        <q-card-section class="text-center text-grey-5">
          Nenhum dado de faturamento por funcionario encontrado.
        </q-card-section>
      </q-card>
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-lg-8">
        <q-card flat bordered class="card-dark chart-card">
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-subtitle1 text-weight-bold">Receita Mensal</div>
              <div class="text-caption text-grey-5">Ultimos 12 meses</div>
            </div>
            <div class="text-caption text-grey-5">Total: {{ totalReceita }}</div>
          </q-card-section>
          <q-separator dark class="separator-soft" />
          <q-card-section class="chart-wrapper">
            <div class="chart-grid">
              <div v-for="mes in receitaMensal" :key="mes.nome" class="chart-bar-wrap">
                <div class="chart-value">{{ formatarValorMes(mes.valor) }}</div>
                <div class="chart-bar" :style="{ height: mes.altura + '%' }"></div>
                <div class="chart-label">{{ mes.nome }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-lg-4">
        <q-card flat bordered class="card-dark card-stack">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold">Metas do Mes</div>
            <div class="text-caption text-grey-5">Acompanhamento de performance</div>
          </q-card-section>
          <q-separator dark class="separator-soft" />
          <q-card-section class="q-gutter-md">
            <div>
              <div class="row items-center justify-between">
                <div class="text-caption text-grey-5">Taxa de Ocupacao</div>
                <div class="text-caption text-grey-4">{{ taxaOcupacao }}%</div>
              </div>
              <q-linear-progress dark color="blue-5" :value="taxaOcupacao / 100" rounded />
            </div>
            <div>
              <div class="row items-center justify-between">
                <div class="text-caption text-grey-5">Ticket Medio</div>
                <div class="text-caption text-grey-4">{{ ticketMedio }}</div>
              </div>
              <q-linear-progress dark color="amber-5" :value="0.72" rounded />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-lg-4">
        <q-card flat bordered class="card-dark card-stack">
          <q-card-section>
            <div class="row items-center justify-between no-wrap distribuicao-header">
              <div>
                <div class="text-subtitle1 text-weight-bold">Distribuicao por Servico</div>
                <div class="text-caption text-grey-5">Participacao no faturamento</div>
              </div>
              <q-select v-model="filtroPeriodoServico" dense outlined color="grey-4" class="input-dark input-periodo"
                :options="periodosServico" option-label="label" option-value="value" emit-value map-options />
            </div>
          </q-card-section>
          <q-separator dark class="separator-soft" />
          <q-card-section>
            <div class="donut" :style="donutStyle">
              <div class="donut-center">
                <div class="text-caption text-grey-5">Total</div>
                <div class="text-subtitle1 text-weight-bold">{{ totalServicoPeriodo }}</div>
              </div>
            </div>
            <div class="q-mt-md">
              <div v-for="cat in categorias" :key="cat.nome" class="row items-center justify-between q-mb-sm">
                <div class="row items-center">
                  <span class="legend-dot" :style="{ background: cat.cor }"></span>
                  <div class="text-body2">{{ cat.nome }}</div>
                </div>
                <div class="text-body2 text-grey-5">{{ cat.percentual }}%</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-8">
        <q-card flat bordered class="card-dark card-stack">
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-subtitle1 text-weight-bold">Ultimas Movimentacoes</div>
              <div class="text-caption text-grey-5">Entradas e saidas recentes</div>
            </div>
            <q-btn v-if="movimentacoes.length > limiteMovimentacoes" flat dense color="grey-4"
              :label="mostrarTodasMovimentacoes ? 'Ver menos' : 'Ver tudo'" class="ghost-btn"
              @click="mostrarTodasMovimentacoes = !mostrarTodasMovimentacoes" />
          </q-card-section>
          <q-separator dark class="separator-soft" />
          <q-card-section class="q-pa-none">
            <q-list separator dark>
              <q-item v-for="mov in movimentacoesExibidas" :key="mov.id" class="item-dark item-hover">
                <q-item-section avatar>
                  <q-avatar size="36px" :color="mov.tipo === 'entrada' ? 'green-7' : 'red-7'" text-color="white">
                    <q-icon :name="mov.tipo === 'entrada' ? 'trending_up' : 'trending_down'" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ mov.titulo }}</q-item-label>
                  <q-item-label caption class="text-grey-5">{{ mov.data }} • {{ mov.categoria }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="price-text" :class="mov.tipo === 'entrada' ? 'text-positive' : 'text-negative'">
                    {{ mov.valor }}
                  </div>
                </q-item-section>
              </q-item>

              <q-item v-if="movimentacoesExibidas.length === 0" class="mov-empty">
                <q-item-section class="text-center">
                  <div class="column items-center q-py-lg">
                    <q-icon name="receipt_long" size="26px" class="q-mb-sm text-grey-6" />
                    <q-item-label class="text-grey-5 text-weight-medium">Não há movimentações.</q-item-label>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { api } from 'src/boot/axios'
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import LoadingLogo from 'components/LoadingLogo.vue'



const agendamentos = ref([])
const despesas = ref([])
const membrosFaturamento = ref([])
const inicioBaseMembros = ref(null)
const fimBaseMembros = ref(null)
const $q = useQuasar()
const mostrarTodasMovimentacoes = ref(false)
const filtroPeriodoServico = ref('3m')
const ticketMedio = ref('')
const taxaOcupacao = ref('')
const carregando = ref(true)
const apiBaseUrl = import.meta.env.VITE_API_URL || ''



const periodosServico = [
  { value: '1m', label: 'Ultimo mes' },
  { value: '3m', label: 'Ultimos 3 meses' },
  { value: '6m', label: 'Ultimos 6 meses' },
  { value: '12m', label: 'Ultimos 12 meses' }
]

const obterServicosAgendamento = (ag) => {
  if (Array.isArray(ag?.servicos) && ag.servicos.length) return ag.servicos
  if (ag?.servico) return [ag.servico]
  return []
}

const obterValorTotalAgendamento = (ag) => {
  const valorApi = Number(ag?.valor_total_agendamento)
  if (!Number.isNaN(valorApi)) return valorApi

  return obterServicosAgendamento(ag).reduce((total, servico) => {
    const preco = Number(servico?.preco ?? servico?.pivot?.preco ?? 0)
    return total + (Number.isNaN(preco) ? 0 : preco)
  }, 0)
}

const obterNomeServicosAgendamento = (ag) => {
  const nomes = obterServicosAgendamento(ag)
    .map((servico) => servico?.nome)
    .filter(Boolean)
  return nomes.length ? nomes.join(' + ') : 'Servico'
}

const calcularTotalMes = (dataBase) => {
  const ano = dataBase.getFullYear()
  const mes = dataBase.getMonth()
  return agendamentos.value.reduce((acc, ag) => {
    if (ag?.status && ag.status !== 'agendado') return acc
    if (!ag?.data_horario) return acc
    const data = new Date(ag.data_horario.replace(' ', 'T'))
    if (Number.isNaN(data.getTime())) return acc
    if (data.getFullYear() !== ano || data.getMonth() !== mes) return acc
    return acc + obterValorTotalAgendamento(ag)
  }, 0)
}

const calcularTotalDespesasMes = (dataBase) => {
  const ano = dataBase.getFullYear()
  const mes = dataBase.getMonth()
  return despesas.value.reduce((acc, desp) => {
    if (!desp?.data) return acc
    const data = new Date(`${desp.data}T00:00:00`)
    if (Number.isNaN(data.getTime())) return acc
    if (data.getFullYear() !== ano || data.getMonth() !== mes) return acc
    const valor = Number(desp.valor ?? 0)
    if (Number.isNaN(valor)) return acc
    return acc + valor
  }, 0)
}

const resumoCards = computed(() => {
  const agora = new Date()
  const totalMesAtual = calcularTotalMes(agora)
  const totalMesAnterior = calcularTotalMes(new Date(agora.getFullYear(), agora.getMonth() - 1, 1))
  const totalDespesasAtual = calcularTotalDespesasMes(agora)
  const totalDespesasAnterior = calcularTotalDespesasMes(new Date(agora.getFullYear(), agora.getMonth() - 1, 1))
  const lucroAtual = totalMesAtual - totalDespesasAtual
  const lucroAnterior = totalMesAnterior - totalDespesasAnterior
  const delta = totalMesAnterior > 0
    ? ((totalMesAtual - totalMesAnterior) / totalMesAnterior) * 100
    : 0
  const deltaLabel = totalMesAnterior > 0
    ? `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}% vs mes anterior`
    : 'Sem base anterior'
  const deltaClass = delta >= 0 ? 'text-positive' : 'text-negative'

  const deltaDespesas = totalDespesasAnterior > 0
    ? ((totalDespesasAtual - totalDespesasAnterior) / totalDespesasAnterior) * 100
    : 0
  const deltaDespesasLabel = totalDespesasAnterior > 0
    ? `${deltaDespesas >= 0 ? '+' : ''}${deltaDespesas.toFixed(1)}% vs mes anterior`
    : 'Sem base anterior'
  const deltaDespesasClass = deltaDespesas >= 0 ? 'text-negative' : 'text-positive'
  const deltaLucro = lucroAnterior !== 0
    ? ((lucroAtual - lucroAnterior) / Math.abs(lucroAnterior)) * 100
    : 0
  const deltaLucroLabel = lucroAnterior !== 0
    ? `${deltaLucro >= 0 ? '+' : ''}${deltaLucro.toFixed(1)}% vs mes anterior`
    : 'Sem base anterior'
  const deltaLucroClass = deltaLucro >= 0 ? 'text-positive' : 'text-negative'

  return [
    {
      label: 'Faturamento do Mes',
      valor: formatarMoeda(totalMesAtual),
      delta: deltaLabel,
      deltaClass: totalMesAnterior > 0 ? deltaClass : 'text-grey-5',
      icon: 'paid'
    },

    {
      label: 'Despesas',
      valor: formatarMoeda(totalDespesasAtual),
      delta: deltaDespesasLabel,
      deltaClass: totalDespesasAnterior > 0 ? deltaDespesasClass : 'text-grey-5',
      icon: 'receipt_long'
    },

    {
      label: 'Lucro Liquido',
      valor: formatarMoeda(lucroAtual),
      delta: deltaLucroLabel,
      deltaClass: lucroAnterior !== 0 ? deltaLucroClass : 'text-grey-5',
      icon: 'savings'
    },
    // { label: 'Caixa Atual', valor: 'R$ 22.180,00', delta: 'Atualizado hoje', deltaClass: 'text-grey-5', icon: 'account_balance_wallet' },
  ]
})


const receitaMensalRaw = computed(() => {
  const agora = new Date()
  const meses = []
  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1)
    const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    meses.push({
      chave,
      nome: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
      valor: 0
    })
  }

  const mapa = new Map(meses.map(m => [m.chave, m]))
  agendamentos.value.forEach((ag) => {
    if (ag?.status && ag.status !== 'agendado') return
    if (!ag?.data_horario) return
    const data = new Date(ag.data_horario.replace(' ', 'T'))
    if (Number.isNaN(data.getTime())) return
    const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
    const item = mapa.get(chave)
    if (!item) return
    item.valor += obterValorTotalAgendamento(ag)
  })

  return meses
})

const receitaMensal = computed(() => {
  const max = Math.max(...receitaMensalRaw.value.map(item => item.valor), 1)
  return receitaMensalRaw.value.map(item => ({
    ...item,
    altura: Math.round((item.valor / max) * 100)
  }))
})

const buscarDadosFaturamento = async () => {
  try {
    const response = await api.get('/financeiro/faturamento')
    const data = response.data
    agendamentos.value = data?.agendamentos || []
    console.log('Dados de faturamento:', data)
  } catch (error) {
    console.error('Erro ao buscar dados de faturamento:', error)
  }
}

const buscarDespesas = async () => {
  try {
    const response = await api.get('/despesas/buscarDespesas')
    const data = response.data
    despesas.value = data?.despesas || []
    console.log('Dados de despesas:', data)
  } catch (error) {
    console.error('Erro ao buscar dados de despesas:', error)
  }
}
const buscarFaturamentoPorMembro = async () => {
  try {
    const response = await api.get('/financeiro/faturamentoPorBarbeiro')
    const data = Array.isArray(response.data) ? response.data : []
    const primeiroItem = data[0] || {}
    inicioBaseMembros.value = primeiroItem?.inicio_base || null
    fimBaseMembros.value = primeiroItem?.fim_base || null

    membrosFaturamento.value = data.map((item) => {
      const foto = String(item?.foto || '').replace(/^\/+/, '')
      const fotoUrl = foto
        ? (/^https?:\/\//i.test(foto) ? foto : `${apiBaseUrl}/storage/${foto}`)
        : null

      return {
        id: item?.barbeiro_id,
        nome: item?.nome || 'Funcionario',
        fotoUrl,
        totalAgendamentos: Number(item?.total_agendamentos || 0),
        totalFaturado: Number(item?.total_faturado || 0)
      }
    })
  } catch (error) {
    console.error('Erro ao buscar faturamento por funcionario:', error)
    membrosFaturamento.value = []
    inicioBaseMembros.value = null
    fimBaseMembros.value = null
  }
}

const exportarPdf = async () => {
  try {
    const response = await api.get('/financeiro/exportar-pdf', { responseType: 'blob' })
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `financeiro-${new Date().toISOString().slice(0, 10)}.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Erro ao exportar PDF:', error)
  }
}

const buscarOcupacaoMesAtual = async () => {
  try {
    const response = await api.get('/financeiro/ocupacaoMesAtual')
    const data = response.data
    taxaOcupacao.value = `${data?.ocupacao_percentual || 0}`
    console.log('Dados de ocupação:', data)
  } catch (error) {
    console.error('Erro ao buscar dados de ocupação:', error)
  }
}
const formatarValorMes = (valor) => formatarMoedaCompacta(valor)

const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
}).format(Number(valor) || 0)

const formatarMoedaCompacta = (valor) => new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1
}).format(Number(valor) || 0)

const formatarData = (dataStr) => {
  if (!dataStr) return '-'
  const data = new Date(`${dataStr}T00:00:00`)
  if (Number.isNaN(data.getTime())) return dataStr
  return data.toLocaleDateString('pt-BR')
}

const formatarDataHora = (dataHoraStr) => {
  if (!dataHoraStr) return '-'
  const data = new Date(String(dataHoraStr).replace(' ', 'T'))
  if (Number.isNaN(data.getTime())) return dataHoraStr
  return data.toLocaleDateString('pt-BR')
}

const formatarDataBaseIso = (dataIso) => {
  if (!dataIso) return null
  const texto = String(dataIso)
  const parteData = texto.slice(0, 10)
  const match = parteData.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (match) {
    const [, ano, mes, dia] = match
    return `${dia}/${mes}/${ano}`
  }

  const data = new Date(texto)
  if (Number.isNaN(data.getTime())) return null
  const dia = String(data.getUTCDate()).padStart(2, '0')
  const mes = String(data.getUTCMonth() + 1).padStart(2, '0')
  const ano = String(data.getUTCFullYear())
  return `${dia}/${mes}/${ano}`
}

const subtituloFaturamentoMembros = computed(() => {
  const inicio = formatarDataBaseIso(inicioBaseMembros.value)
  const fim = formatarDataBaseIso(fimBaseMembros.value)

  if (inicio && fim) {
    return `Todos os barbeiros da barbearia | Data base: ${inicio} ate ${fim}`
  }

  return 'Todos os barbeiros da barbearia'
})

const totalReceita = computed(() => {
  const total = receitaMensalRaw.value.reduce((acc, item) => acc + item.valor, 0)
  return formatarMoeda(total)
})

const totalServicoPeriodo = computed(() => {
  const total = categorias.value.reduce((acc, item) => {
    return acc + Number(item.percentual || 0)
  }, 0)
  if (!categorias.value.length || total === 0) return formatarMoeda(0)
  const totalBruto = agendamentos.value.reduce((acc, ag) => {
    if (ag?.status && ag.status !== 'agendado') return acc
    if (!ag?.data_horario) return acc
    const data = new Date(String(ag.data_horario).replace(' ', 'T'))
    if (Number.isNaN(data.getTime())) return acc
    const meses = Number(filtroPeriodoServico.value.replace('m', '')) || 3
    const agora = new Date()
    const limite = new Date(agora.getFullYear(), agora.getMonth() - (meses - 1), 1)
    if (data < limite) return acc
    return acc + obterValorTotalAgendamento(ag)
  }, 0)
  return formatarMoeda(totalBruto)
})
// const metaFaturamento = 'R$ 45.000,00'
// const progressoFaturamento = 0.78
// const progressoLabel = '78% da meta atingida'


const buscarTicketMedioMesAtual = async () => {
  try {
    const response = await api.get('/financeiro/ticketMedio')
    const data = response.data
    console.log('Dados de ticket medio:', data)
    ticketMedio.value = formatarMoeda(data?.ticket_medio || 0)
  } catch (error) {
    console.error('Erro ao buscar ticket medio:', error)
    ticketMedio.value = formatarMoeda(0)
  }
}

const coresCategorias = ['#22c55e', '#3b82f6', '#f59e0b']
const corOutros = '#a855f7'

const categorias = computed(() => {
  const agora = new Date()
  const meses = Number(filtroPeriodoServico.value.replace('m', '')) || 3
  const limite = new Date(agora.getFullYear(), agora.getMonth() - (meses - 1), 1)

  const mapa = new Map()
  agendamentos.value.forEach((ag) => {
    if (ag?.status && ag.status !== 'agendado') return
    if (!ag?.data_horario) return
    const data = new Date(String(ag.data_horario).replace(' ', 'T'))
    if (Number.isNaN(data.getTime()) || data < limite) return
    obterServicosAgendamento(ag).forEach((servico) => {
      const nome = servico?.nome || 'Servico'
      const preco = Number(servico?.preco ?? servico?.pivot?.preco ?? 0)
      if (!Number.isNaN(preco)) {
        mapa.set(nome, (mapa.get(nome) || 0) + preco)
      }
    })
  })

  const ordenado = Array.from(mapa.entries()).sort((a, b) => b[1] - a[1])
  const top3 = ordenado.slice(0, 3)
  const outrosValor = ordenado.slice(3).reduce((acc, item) => acc + item[1], 0)
  const total = [...top3.map(i => i[1]), outrosValor].reduce((acc, v) => acc + v, 0) || 1

  const lista = top3.map((item, idx) => ({
    nome: item[0],
    percentual: Math.round((item[1] / total) * 100),
    cor: coresCategorias[idx] || '#22c55e'
  }))

  if (outrosValor > 0) {
    lista.push({
      nome: 'Outros',
      percentual: Math.round((outrosValor / total) * 100),
      cor: corOutros
    })
  }

  const soma = lista.reduce((acc, item) => acc + item.percentual, 0)
  if (lista.length && soma !== 100) {
    lista[lista.length - 1].percentual = Math.max(0, lista[lista.length - 1].percentual + (100 - soma))
  }

  return lista
})

const donutStyle = computed(() => {
  if (!categorias.value.length) {
    return { background: 'conic-gradient(#1f2937 0 100%)' }
  }
  let acumulado = 0
  const partes = categorias.value.map((cat) => {
    const inicio = acumulado
    acumulado += cat.percentual
    return `${cat.cor} ${inicio}% ${acumulado}%`
  })
  return { background: `conic-gradient(${partes.join(', ')})` }
})

const movimentacoes = computed(() => {
  const saidas = despesas.value
    .filter(d => d?.data)
    .map((d) => ({
      id: `despesa-${d.id ?? `${d.data}-${d.categoria}`}`,
      titulo: d.descricao || 'Despesa',
      data: formatarData(d.data),
      categoria: d.categoria || '-',
      valor: `- ${formatarMoeda(d.valor)}`,
      tipo: 'saida',
      _ordenacao: new Date(`${d.data}T00:00:00`).getTime()
    }))

  const entradas = agendamentos.value
    .filter(ag => ag?.data_horario)
    .map((ag, idx) => {
      const preco = obterValorTotalAgendamento(ag)
      return {
        id: `ag-${ag.id ?? idx}`,
        titulo: obterNomeServicosAgendamento(ag),
        data: formatarDataHora(ag.data_horario),
        categoria: 'Servico',
        valor: formatarMoeda(preco),
        tipo: 'entrada',
        _ordenacao: new Date(String(ag.data_horario).replace(' ', 'T')).getTime()
      }
    })

  return [...entradas, ...saidas]
    .filter(m => !Number.isNaN(m._ordenacao))
    .sort((a, b) => b._ordenacao - a._ordenacao)
    .map((item) => {
      const rest = { ...item }
      delete rest._ordenacao
      return rest
    })
})

const limiteMovimentacoes = computed(() => ($q.screen.lt.md ? 5 : 10))

const movimentacoesExibidas = computed(() => {
  return mostrarTodasMovimentacoes.value
    ? movimentacoes.value
    : movimentacoes.value.slice(0, limiteMovimentacoes.value)
})

onMounted(async () => {
  carregando.value = true
  try {
    await Promise.all([
      buscarDadosFaturamento(),
      buscarDespesas(),
      buscarTicketMedioMesAtual(),
      buscarOcupacaoMesAtual(),
      buscarFaturamentoPorMembro()
    ])
  } finally {
    carregando.value = false
  }
})
</script>

<style scoped>
.finance-page {
  color: #f3f4f6;
  background:
    radial-gradient(1200px 600px at 10% -20%, rgba(34, 197, 94, 0.12), transparent 60%),
    radial-gradient(900px 500px at 110% 10%, rgba(59, 130, 246, 0.10), transparent 55%),
    linear-gradient(180deg, #0f1115 0%, #0c0d10 100%);
  border-radius: 16px;
}

.page-title {
  background: linear-gradient(90deg, #e5e7eb 0%, #9ca3af 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.finance-header {
  gap: 12px;
}

.header-title {
  min-width: 0;
}

.header-actions {
  margin-left: auto;
  display: flex;
  justify-content: flex-end;
}

.back-btn {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
}

.card-dark {
  background: linear-gradient(180deg, #12151b 0%, #0f1116 100%);
  border-color: rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.summary-card {
  min-height: 110px;

}

.resumo-row {
  flex-wrap: nowrap;
}

.resumo-col {
  min-width: 0;
}

.membro-card {
  min-height: 110px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 140ms ease, border-color 140ms ease, box-shadow 140ms ease;
  max-width: 400px;
  margin: 0 auto;
}

.membros-row {
  max-width: 980px;
  margin: 0 auto;
}

.membro-col {
  max-width: 400px;
}

.membro-card:hover {
  transform: translateY(-2px);
  border-color: rgba(148, 163, 184, 0.35);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.28);
}

.membro-card-section {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
  padding: 14px;
}

.membro-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.membro-avatar {
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
}

.membro-identidade {
  min-width: 0;
}

.membro-nome {
  font-size: 0.95rem;
  font-weight: 600;
  color: #e5e7eb;
}

.membro-cargo {
  margin-top: 1px;
  font-size: 0.72rem;
  letter-spacing: 0.03em;
  color: #9ca3af;
}

.membro-info {
  min-width: 0;
  width: 100%;
}

.membro-metricas {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.metrica-col {
  min-width: 0;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 9px 10px;
  text-align: center;
}

.metrica-valor {
  margin-top: 4px;
  font-size: 1.02rem;
  font-weight: 700;
  line-height: 1.2;
}

.metrica-valor--money {
  color: #86efac;
}

.metrica-label {
  font-size: 0.72rem;
  letter-spacing: 0.03em;
  color: #94a3b8;
}

.membro-empty {
  background: rgba(255, 255, 255, 0.02);
}

.summary-content {
  text-align: center;
  justify-content: center;
}

.summary-content>div {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ghost-btn {
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 0 10px;
}

.separator-soft {
  opacity: 0.6;
}

.chart-card {
  min-height: 320px;
}

.chart-wrapper {
  padding: 18px;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 10px;
  align-items: end;
  height: 220px;
}

.chart-bar-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.chart-value {
  font-size: 0.68rem;
  color: #cbd5f5;
  font-weight: 600;
}

.chart-bar {
  width: 100%;
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.85), rgba(34, 197, 94, 0.35));
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.25);
  min-height: 12px;
  transition: transform 160ms ease;
}

.chart-bar:hover {
  transform: translateY(-4px);
}

.chart-label {
  font-size: 0.7rem;
  color: #9ca3af;
}

.card-stack {
  min-height: 320px;
}

.distribuicao-header {
  gap: 12px;
}

.input-periodo {
  min-width: 160px;
}

.donut {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  margin: 0 auto;
  background:
    conic-gradient(#22c55e 0 46%,
      #3b82f6 46% 74%,
      #f59e0b 74% 90%,
      #a855f7 90% 100%);
  display: grid;
  place-items: center;
}

.donut-center {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: #0f1116;
  display: grid;
  place-items: center;
  text-align: center;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
}

.item-dark {
  border-color: rgba(255, 255, 255, 0.06);
}

.item-hover {
  transition: background 160ms ease, transform 160ms ease;
}

.item-hover:hover {
  background: rgba(255, 255, 255, 0.03);
  transform: translateX(2px);
}

.price-text {
  font-size: 0.95rem;
  font-weight: 700;
  color: #e5e7eb;
  letter-spacing: 0.2px;
}

.mov-empty {
  min-height: 120px;
  background: rgba(255, 255, 255, 0.02);
}

@media (max-width: 1023px) {
  .chart-grid {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
}

@media (max-width: 599px) {
  .resumo-row {
    flex-wrap: wrap;
  }

  .resumo-col {
    min-width: 100%;
  }

  .chart-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    height: 180px;
  }

  .donut {
    width: 150px;
    height: 150px;
  }

  .donut-center {
    width: 90px;
    height: 90px;
  }
}
</style>
