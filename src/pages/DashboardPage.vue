<template>
  <q-page padding>
    <q-toolbar class="dashboard-toolbar q-mb-md">
      <!-- LADO ESQUERDO: Avatar + texto -->
      <div class="row items-center header-left">
        <q-avatar
          size="56"
          style="background: linear-gradient(144deg, #777777, #494949); color: white"
        >
          {{ auth.user && auth.user.name ? auth.user.name.charAt(0) : 'U' }}
        </q-avatar>

        <div class="user-info">
          <div class="text-h6 user-name">
            Olá,
            <span class="user-name-bold">
              {{ auth.user ? auth.user.name : 'Usuário' }}
            </span>
          </div>
          <div class="text-subtitle2 text-grey-6">
            Bem-vindo de volta — confira seus agendamentos
          </div>
        </div>
      </div>

      <!-- EMPURRA PARA A DIREITA -->
      <q-space />

      <!-- LADO DIREITO: Ações -->
      <div class="row items-center q-gutter-sm">
        <q-btn flat dense round icon="menu" @click="abrirMenu" />
        <q-btn
          flat
          dense
          round
          :icon="isDark ? 'dark_mode' : 'light_mode'"
          @click="toggleTheme"
          v-show="false"
          disabled
        />
      </div>
    </q-toolbar>

    <div class="dashboard-header row items-center q-mb-md justify-between">
      <div v-if="inicioDaSemana && fimDeSemana" class="week-display row items-center">
        <div class="week-range q-px-md row items-center no-wrap">
          <q-icon name="calendar_today" class="q-mr-sm text-h6 week-icon" aria-hidden="true" />
          <div class="text-h6">
            {{ formatDate(inicioDaSemana) }} → {{ formatDate(fimDeSemana) }}
          </div>
        </div>
      </div>

      <div v-if="inicioDaSemana && fimDeSemana" class="week-actions row items-center q-pa-sm">
        <q-btn flat round dense icon="chevron_left" @click="voltarUmaSemana" class="chev-btn" />
        <q-btn flat round dense icon="chevron_right" @click="avancarUmaSemana" class="chev-btn" />
      </div>
    </div>

    <!-- 🟦 CARDS DOS DIAS DA SEMANA -->
    <div class="row q-gutter-sm q-mb-lg">
      <q-card
        v-for="(day, index) in diasDaSemana"
        :key="index"
        clickable
        @click="selecionarDia(index)"
        class="q-pa-sm text-center cursor-pointer card-dia"
        :class="{ 'card-dia-selecionado': diaSelecionado === index }"
        style="flex: 1 1 0; min-width: 0; border-radius: 12px"
      >
        <div class="text-caption">{{ day.label }}</div>
        <div class="text-h6 q-mt-xs">{{ day.number }}</div>
      </q-card>
    </div>

    <!-- 📊 CARDS DE RENDA -->
    <!-- 📊 CARDS DE RENDA -->
    <div class="row q-mb-lg cards-renda-container">
      <!-- Renda do dia selecionado -->
      <q-card class="q-pa-md q-mr-md card-renda-dia card-renda">
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

        <div class="text-caption q-mt-sm">Data: {{ formatDate(dataSelecionada) }}</div>
      </q-card>

      <!-- Renda da semana -->
      <q-card class="q-pa-md card-renda-semana card-renda">
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
          {{ formatDate(inicioDaSemana) }} → {{ formatDate(fimDeSemana) }}
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

// auth store imported below for toolbar and data fetching

import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/auth'

const auth = useAuthStore()
const $q = useQuasar()

const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

const dias = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB']

// datas principais
const hoje = new Date()
const inicioDaSemana = ref(inicioSemana(hoje))
const fimDeSemana = ref(fimSemana(hoje))

// dia clicado nos cards
const diaSelecionado = ref(0)
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
      full: d,
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
  currency: 'BRL',
})
const formatoMoeda = (v) => currencyFormatter.format(Number(v || 0))

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
        usuario_id: auth.user.id,
      },
    })

    diaDaReceita.value = res.data?.valorTotalDia ?? res.data?.total ?? 0
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
      params: { start, end },
    })

    receitaDaSemana.value = res.data?.week_total ?? res.data?.total ?? res.data?.value ?? 0
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
  // ao mudar a semana, tenta selecionar o dia de hoje se estiver na semana atual,
  // caso contrário seleciona o primeiro dia da semana
  const hojeMid = new Date()
  hojeMid.setHours(0, 0, 0, 0)
  const idx = diasDaSemana.value.findIndex((d) => {
    const fd = new Date(d.full)
    fd.setHours(0, 0, 0, 0)
    return fd.getTime() === hojeMid.getTime()
  })
  diaSelecionado.value = idx >= 0 ? idx : 0
  dataSelecionada.value = diasDaSemana.value[diaSelecionado.value].full
  fetchReceitaDaSemana()
  fetchDiaDaReceita()
})

onMounted(() => {
  // seleciona índice do dia de hoje dentro da semana atual (se existir)
  const hojeMid = new Date()
  hojeMid.setHours(0, 0, 0, 0)
  const idx = diasDaSemana.value.findIndex((d) => {
    const fd = new Date(d.full)
    fd.setHours(0, 0, 0, 0)
    return fd.getTime() === hojeMid.getTime()
  })
  diaSelecionado.value = idx >= 0 ? idx : 0
  dataSelecionada.value = diasDaSemana.value[diaSelecionado.value].full
  fetchDiaDaReceita()
  fetchReceitaDaSemana()
})

// --- toolbar local: abrir menu, alternar tema, logout ---
const isDark = ref($q.dark.isActive)

function abrirMenu() {
  window.dispatchEvent(new CustomEvent('toggle-drawer'))
}

function toggleTheme() {
  $q.dark.toggle()
  isDark.value = $q.dark.isActive
}

// logout moved to main drawer/menu
</script>

<style scoped>
.row.no-wrap {
  overflow-x: auto;
  padding: 6px 2px;
}

.cursor-pointer {
  cursor: pointer;
}

/* Header left: avatar + user info should stay on one line */
.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex-wrap: nowrap;
}

.header-left q-avatar {
  flex: 0 0 auto;
}

.user-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  flex: 1 1 auto;
  overflow: hidden;
}

.user-info .user-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.cards-renda-container {
  margin-top: 25px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  align-items: start;
}

.card-renda {
  border-radius: 16px !important;
  padding: 16px;
  min-height: 96px;
}

/* Card do dia */
.card-renda-dia {
  border-radius: 16px !important;
  background: linear-gradient(144deg, #777777, #494949);
  /* laranja */
  color: white;
}

.card-dia {
  background: #2b2b2b;
  /* dark base */
  color: #fff;
  /* texto claro para dark */
  transition:
    background 0.3s,
    color 0.3s;
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 18px;
  min-height: 92px;
}

.card-dia-selecionado {
  background: linear-gradient(144deg, #777777, #494949);
  color: white;
}

/* Card da semana */
.card-renda-semana {
  border-radius: 16px !important;
  background: linear-gradient(135deg, #ffffff, #def5de);
  /* verde claro */
  color: #3a3a3a;
}

/* Ícones brancos */
.card-renda-dia .q-icon,
.card-renda-semana .q-icon {
  color: white !important;
}

.dashboard-header .user-name-bold {
  font-weight: 700;
}

.week-filter {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  align-items: center;
}

.week-range .text-h6 {
  letter-spacing: 0.2px;
}

.chev-btn {
  color: #ffffff;
}

.week-display {
  display: flex;
  align-items: center;
}

.week-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
