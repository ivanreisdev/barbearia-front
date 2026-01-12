<template>
  <q-page padding>

    <!-- FILTRO DE SEMANA -->
    <div class="row items-center q-mb-lg" v-if="inicioDaSemana && fimDeSemana">

      <!-- Botão voltar -->
      <q-btn
        flat
        round
        icon="chevron_left"
        @click="voltarUmaSemana"
        class="q-mr-sm"
      />

      <!-- Intervalo -->
      <div class="row items-center"
           :class="$q.dark.isActive ? 'text-grey-3' : 'text-grey-8'">

        <q-icon name="event" class="q-mr-sm" />

        <div class="text-h6">
          {{ formatDate(inicioDaSemana) }} à {{ formatDate(fimDeSemana) }}
        </div>
      </div>

      <!-- Botão avançar -->
      <q-btn
        flat
        round
        icon="chevron_right"
        @click="avancarUmaSemana"
        class="q-ml-sm"
      />
    </div>

    <!-- 🟦 CARDS DOS DIAS DA SEMANA -->
    <div class="row no-wrap q-gutter-sm q-mb-lg">
      <q-card
        v-for="(day, index) in diasDaSemana"
        :key="index"
        clickable
        @click="selecionarDia(index)"
        class="q-pa-sm text-center cursor-pointer"
        :class="diaSelecionado === index
          ? ($q.dark.isActive ? 'bg-blue-8 text-white' : 'bg-blue-4 text-dark')
          : ($q.dark.isActive ? 'bg-grey-10 text-grey-3' : 'bg-grey-2 text-dark')
        "
        style="width: 70px; border-radius: 12px;"
      >
        <div class="text-caption">{{ day.label }}</div>
        <div class="text-h6 q-mt-xs">{{ day.number }}</div>
      </q-card>
    </div>

    <!-- 📊 CARDS DE RENDA -->
    <!-- 📊 CARDS DE RENDA -->
<div class="row q-mb-lg cards-renda-container">

  <!-- Renda do dia selecionado -->
  <q-card class="q-pa-md q-mr-md card-renda-dia" style="min-width:200px; flex: 1;">
    <div class="row items-center justify-between">
      <div>
        <div class="text-caption">Renda do dia</div>
        <div class="text-h6 q-mt-xs">
          <q-skeleton v-if="loadingDay" type="text" width="120px" />
          <span v-else>{{ formatoMoeda(diaDaReceita) }}</span>
        </div>
      </div>

      <q-icon name="today" class="text-h5" />
    </div>

    <div class="text-caption q-mt-sm">
      Data: {{ formatDate(dataSelecionada) }}
    </div>
  </q-card>

  <!-- Renda da semana -->
  <q-card class="q-pa-md card-renda-semana" style="min-width:200px; flex: 1;">
    <div class="row items-center justify-between">
      <div>
        <div class="text-caption">Renda (semana)</div>
        <div class="text-h6 q-mt-xs">
          <q-skeleton v-if="loadingWeek" type="text" width="120px" />
          <span v-else>{{ formatoMoeda(receitaDaSemana) }}</span>
        </div>
      </div>

      <q-icon name="attach_money" class="text-h5" />
    </div>

    <div class="text-caption q-mt-sm">
      Período: {{ formatDate(inicioDaSemana) }} → {{ formatDate(fimDeSemana) }}
    </div>
  </q-card>

</div>

<AgendamentosPage
  :data-selecionada="dataSelecionada"
  :dias-da-semana="diasDaSemana"
  :dia-selecionado="diaSelecionado"
/>


  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import AgendamentosPage from 'pages/AgendamentosPage.vue'

import { useAuthStore } from 'stores/auth'   // <-- aqui você IMPORTA o auth store

import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const $q = useQuasar()

const meses = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez'
]

const dias = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB']

// datas principais
const hoje = new Date()
const inicioDaSemana = ref(inicioSemana(hoje))
const fimDeSemana = ref(fimSemana(hoje))

// dia clicado nos cards
const diaSelecionado = ref(1)
const dataSelecionada = ref(null)

// Estado de renda
const diaDaReceita = ref(0)
const receitaDaSemana = ref(0)

const loadingDay = ref(false)
const loadingWeek = ref(false)

// --------------------- Funções de data ---------------------
function inicioSemana(dateRef) {
  const dt = new Date(dateRef)
  const day = dt.getDay()
  const diff = dt.getDate() - day + (day === 0 ? -6 : 1)
  dt.setDate(diff)
  dt.setHours(0, 0, 0, 0)
  return dt
}

function fimSemana(dateRef) {
  const start = inicioSemana(dateRef)
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

function formatDate(dt) {
  if (!dt) return ''
  const d = new Date(dt)
  const dia = String(d.getDate()).padStart(2, '0')
  const mes = meses[d.getMonth()]
  const ano = d.getFullYear()
  return `${dia} ${mes} ${ano}`
}

function toISODate(dt) {
  const d = new Date(dt)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ------------------ montar lista dos dias ------------------
const diasDaSemana = computed(() => {
  const lista = []
  const start = new Date(inicioDaSemana.value)

  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)

    lista.push({
      label: dias[d.getDay()],
      number: d.getDate(),
      full: d
    })
  }

  return lista
})

// Quando o usuário clicar num card:
function selecionarDia(index) {
  diaSelecionado.value = index
  dataSelecionada.value = diasDaSemana.value[index].full
  fetchDiaDaReceita()
}

// ------------------ formatação moeda ------------------
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
})
const formatoMoeda = v => currencyFormatter.format(Number(v || 0))

// ------------------ BUSCA DE RENDA DO DIA ------------------
async function fetchDiaDaReceita() {
  if (!dataSelecionada.value) return
  loadingDay.value = true
  diaDaReceita.value = 0

  try {
    const dateISO = toISODate(dataSelecionada.value)

    const auth = useAuthStore()

    const res = await api.get('/rendas/calcularTotalPorDia', {
      params: {
        dia: dateISO,
        usuario_id: auth.user.id
      }
    })

    diaDaReceita.value =
      res.data?.valorTotalDia ??
      res.data?.total ??
      0

  } catch (e) {
    console.warn('Erro ao buscar renda do dia', e)
    diaDaReceita.value = 0
  }

  loadingDay.value = false
}


// ------------------ BUSCA DA RENDA SEMANAL ------------------
async function fetchReceitaDaSemana() {
  loadingWeek.value = true
  receitaDaSemana.value = 0

  try {
    const start = toISODate(inicioDaSemana.value)
    const end = toISODate(fimDeSemana.value)

    const res = await api.get('/revenues/week', {
      params: { start, end }
    })

    receitaDaSemana.value =
      res.data?.week_total ??
      res.data?.total ??
      res.data?.value ??
      0

  } catch (e) {
    console.warn('Erro ao buscar renda da semana', e)
    receitaDaSemana.value = 0
  }

  loadingWeek.value = false
}

function voltarUmaSemana() {
  inicioDaSemana.value = new Date(inicioDaSemana.value.getTime() - 7 * 86400000)
  fimDeSemana.value = new Date(fimDeSemana.value.getTime() - 7 * 86400000)
}

function avancarUmaSemana() {
  inicioDaSemana.value = new Date(inicioDaSemana.value.getTime() + 7 * 86400000)
  fimDeSemana.value = new Date(fimDeSemana.value.getTime() + 7 * 86400000)
}

watch([inicioDaSemana, fimDeSemana], () => {
  fetchReceitaDaSemana()
})

onMounted(() => {
  dataSelecionada.value = diasDaSemana.value[diaSelecionado.value].full
  fetchDiaDaReceita()
  fetchReceitaDaSemana()
})
</script>

<style scoped>
.row.no-wrap {
  overflow-x: auto;
  padding: 6px 2px;
}

.cursor-pointer {
  cursor: pointer;
}
.cards-renda-container {
  margin-top: 25px;
}

/* Card do dia */
.card-renda-dia {
  border-radius: 16px !important;
  background: linear-gradient(135deg, #42a5f5, #90caf9); /* azul claro */
  color: white;
}

/* Card da semana */
.card-renda-semana {
  border-radius: 16px !important;
  background: linear-gradient(135deg, #66bb6a, #a5d6a7); /* verde claro */
  color: white;
}

/* Ícones brancos */
.card-renda-dia .q-icon,
.card-renda-semana .q-icon {
  color: white !important;
}

</style>
