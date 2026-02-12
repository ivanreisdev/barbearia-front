<template>
  <LoadingLogo v-if="carregando" class="loading-overlay" />
  <q-page v-else>
    <div class="header-dashboard">
      <q-toolbar class="dashboard-toolbar q-mb-sm">
        <div class="row items-center header-left">
          <q-avatar size="56" class="cursor-pointer"
            style="background: linear-gradient(144deg, #777777, #494949); color: white">
            <!-- LOADING -->
            <q-skeleton v-if="loadingUser" type="QAvatar" size="56px" />

            <!-- CONTEÚDO REAL -->
            <template v-else>
              <!-- FOTO -->
              <img v-if="fotoBackend" :src="fotoBackend" />

              <!-- FALLBACK -->
              <span v-else>
                {{ usuario?.name?.charAt(0) || 'U' }}
              </span>
            </template>
          </q-avatar>

          <div class="user-info">
            <div class="user-info">
              <div class="text-h6 user-name">
                <!-- LOADING -->
                <q-skeleton v-if="loadingUser" type="text" width="180px" />

                <!-- DADO REAL -->
                <span v-else>
                  Olá,
                  <span class="user-name-bold">
                    {{ formatarNomeInicial(usuario.name || 'Usuário') }}
                  </span>
                </span>
              </div>
            </div>


            <div class="text-subtitle2 text-grey-6 texto-comun">
              confira seus agendamentos
            </div>
          </div>
        </div>

        <q-space />

        <div class="row items-center q-gutter-sm">
          <q-btn flat dense round icon="menu" @click="abrirMenu" />
          <q-btn flat dense round :icon="isDark ? 'dark_mode' : 'light_mode'" @click="toggleTheme" v-show="false"
            disabled />
        </div>
      </q-toolbar>

      <div class="dashboard-header row items-center q-mb-sm justify-between no-wrap">
        <div v-if="inicioDaSemana && fimDeSemana" class="week-display row items-center">
          <div class="week-range q-px-md row items-center no-wrap">
            <q-icon name="calendar_today" class="q-mr-sm text-h week-icon" aria-hidden="true" />
            <div class="text-h6 week-text">
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
      <div class="row q-gutter-xs q-mb-sm">
        <q-card v-for="(day, index) in diasDaSemana" :key="index" clickable @click="selecionarDia(index)"
          class="q-pa-sm text-center cursor-pointer card-dia"
          :class="{ 'card-dia-selecionado': diaSelecionado === index }"
          style="flex: 1 1 0; min-width: 0; border-radius: 12px">
          <div class="text-caption">{{ day.label }}</div>
          <div class="text-h6 q-mt-xs">{{ day.number }}</div>
        </q-card>
      </div>
    </div>
    <!-- 📊 CARDS DE RENDA -->
    <!-- 📊 CARDS DE RENDA -->
    <div class="row q-gutter-xs cards-renda-container">
      <!-- Renda do dia selecionado -->
      <q-card class="q-pa-md q-mr-xs card-renda-dia card-renda">
        <div class="row items-center justify-between">
          <div>
            <div class="dia-cards-renda">{{ buscarMesDia(dataSelecionada) }}</div>
            <div class="valor-renda-cards q-mt-xs">
              <q-skeleton v-if="loadingDay" type="text" width="120px" />
              <span v-else>{{ formatoMoeda(diaDaReceita) }}</span>
            </div>
            <div class="quantidade-agend-cards q-mt-xs">
              <q-skeleton v-if="loadingDay" type="text" width="120px" />
              <span v-else>{{ quantidadeAgendamentoDia }}</span>
            </div>
          </div>

          <!-- <q-icon name="today" class="text-h5" /> -->
        </div>

        <!-- <div class="text-caption q-mt-sm">{{ buscarMesDia(dataSelecionada) }}</div> -->
      </q-card>

      <!-- Renda da semana -->
      <q-card class="q-pa-xs card-renda-semana card-renda">
        <div class="row items-center justify-between">
          <div>
            <div class="dia-cards-renda">{{ buscarMesDia(inicioDaSemana) }} à {{ buscarMesDia(fimDeSemana) }}</div>
            <div class="valor-renda-cards q-mt-xs">
              <q-skeleton v-if="loadingWeek" type="text" width="120px" />
              <span v-else>{{ formatoMoeda(receitaDaSemana) }}</span>
            </div>
            <div class="quantidade-agend-cards q-mt-xs">
              <q-skeleton v-if="loadingDay" type="text" width="120px" />
              <span v-else>{{ quantidadeAgendamentoSemana }}</span>
            </div>
          </div>
        </div>
      </q-card>
    </div>
    <br>
    <br>

    <AgendamentosPage :data-selecionada="dataSelecionada" :dias-da-semana="diasDaSemana"
      :dia-selecionado="diaSelecionado" />

  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import AgendamentosPage from 'pages/AgendamentosPage.vue'
import { Loading } from 'quasar'
import LoadingLogo from 'components/LoadingLogo.vue'

const carregando = ref([true])

// auth store imported below for toolbar and data fetching

import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/auth'

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
const quantidadeAgendamentoDia = ref(0)
const quantidadeAgendamentoSemana = ref(0)

const loadingDay = ref(false)
const loadingWeek = ref(false)

// const horariosBloqueadosDaAgenda = ref([])


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

function buscarMesDia(dt) {
  if (!dt) return ''
  const d = new Date(dt)
  const dia = String(d.getDate()).padStart(2, '0')
  const mes = meses[d.getMonth()]
  return `${dia} ${mes}`
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
  // carregarHorariosBloqueadosDaAgenda()
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
    console.log('dateISO');

    console.log(dateISO);

    const auth = useAuthStore()

    const res = await api.get('/rendas/calcularTotalPorDia', {
      params: {
        dia: dateISO,
        usuario_id: auth.user.id,
      },
    })
    console.log(res);

    diaDaReceita.value = res.data?.valorTotalDia ?? res.data?.total ?? 0
    quantidadeAgendamentoDia.value = res.data?.quantidade_agendamentos ?? 0
  } catch (e) {
    console.warn('Erro ao buscar renda do dia', e)
    diaDaReceita.value = 0
  }

  loadingDay.value = false
}

//-------------------busca Usuario ------------------
const loadingUser = ref(true)
const usuario = ref({
  name: '',
  telefone: '',
  endereco: '',
  id: null,
  email: '',
  foto: null,
})

const buscarUsuario = async () => {
  loadingUser.value = true
  try {
    const { data } = await api.get('/usuario/buscarDadosUsuario')
    console.log(data)

    usuario.value = {
      id: data.id,
      name: data.name,
      telefone: data.telefone,
      email: data.email,
      endereco: data.endereco,
      foto: data.foto
    }

  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar dados do usuário'
    })
  } finally {
    loadingUser.value = false
  }
}

const BASE_URL = import.meta.env.VITE_API_URL
const fotoBackend = computed(() => {
  if (!usuario.value.foto) return null
  return `${BASE_URL}/storage/${usuario.value.foto}?t=${Date.now()}`
})

// ------------------ BUSCA DA RENDA SEMANAL ------------------
async function fetchReceitaDaSemana() {
  loadingWeek.value = true
  receitaDaSemana.value = 0

  try {
    const dataInicial = toISODate(inicioDaSemana.value);
    const dataFinal = toISODate(fimDeSemana.value);


    const res = await api.get('/financeiro/buscarRendaSemanal', {
      params: { dataInicial, dataFinal },
    })

    receitaDaSemana.value = res.data?.valorTotalSemana ?? res.data?.valorTotalSemana ?? res.data?.value ?? 0
    quantidadeAgendamentoSemana.value = res.data?.quantidade_agendamentos ?? 0
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

const formatarNomeInicial = (nome) =>{
  return nome.trim().split(" ")[0]
}

// const carregarHorariosBloqueadosDaAgenda = async () => {
//   if (!dataSelecionada.value) return
//   try {
//     const dateIS = toISODate(dataSelecionada.value)
//     const response = await api.get(
//       '/bloqueio-agendamentos/buscarBloqueioDeAgenda',
//       {
//         params: {
//           data: dateIS
//         }
//       }
//     )

//     horariosBloqueadosDaAgenda.value = response.data ?? []
//   } catch (err) {
//     console.error('Erro ao buscar bloqueios da agenda:', err)
//   }
// }

function avancarUmaSemana() {
  inicioDaSemana.value = new Date(inicioDaSemana.value.getTime() + 7 * 86400000)
  fimDeSemana.value = new Date(fimDeSemana.value.getTime() + 7 * 86400000)
}

watch([inicioDaSemana, fimDeSemana], () => {
  const hojeMid = new Date()
  hojeMid.setHours(0, 0, 0, 0)

  const idx = diasDaSemana.value.findIndex((d) => {
    const fd = new Date(d.full)
    fd.setHours(0, 0, 0, 0)
    return fd.getTime() === hojeMid.getTime()
  })

  diaSelecionado.value = idx >= 0 ? idx : 0
  dataSelecionada.value = diasDaSemana.value[diaSelecionado.value].full
})

watch(
  () => dataSelecionada.value,
  (novaData) => {
    if (!novaData) return

    fetchDiaDaReceita()
    fetchReceitaDaSemana()
    // carregarHorariosBloqueadosDaAgenda()
  },
  { immediate: true }
)



onMounted(async () => {
  Loading.show({
    spinner: LoadingLogo, // seu logo JetBarber
    backgroundColor: '#0c0d10'
  })

  try {
    await buscarUsuario()

    const hojeMid = new Date()
    hojeMid.setHours(0, 0, 0, 0)

    const idx = diasDaSemana.value.findIndex((d) => {
      const fd = new Date(d.full)
      fd.setHours(0, 0, 0, 0)
      return fd.getTime() === hojeMid.getTime()
    })

    diaSelecionado.value = idx >= 0 ? idx : 0
    dataSelecionada.value = diasDaSemana.value[diaSelecionado.value].full

    // ⏱️ opcional: tempo mínimo pra você ajustar o layout
    await new Promise(resolve => setTimeout(resolve, 2000))

  } catch (error) {
    console.error(error)
  } finally {
    carregando.value = false
    Loading.hide()
  }
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
  font-family: 'Inter', sans-serif;
}

.cards-renda-container {
  margin-top: 25px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  align-items: stretch;
  /* 🔥 ESSENCIAL */
}


.card-renda {
  border-radius: 16px !important;
  padding: 16px;
  min-height: 96px;
}

/* Card do dia */
.card-renda {
  border-radius: 16px !important;
  padding: 16px;
  min-height: 96px;
  height: 100%;
  /* 🔥 */
  display: flex;
  /* 🔥 */
  flex-direction: column;
  justify-content: space-between;
  /* 🔥 distribui conteúdo */
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
  position: relative;
  border-radius: 16px !important;
  color: #fffbfb;
  background-color: #1e1e1e;
  overflow: hidden;
}

/* camada da imagem */
.card-renda-semana::after {
  content: "";
  position: absolute;
  inset: 0;

  background-image: url('/imgs/logoSemEscrita.png');
  background-repeat: no-repeat;
  background-position: right -20px bottom 5px;
  background-size: 130px;

  opacity: 0.20;
  /* 🔥 aqui controla o "apagado" */
  pointer-events: none;
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
  font-family: 'Inter', sans-serif;

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

.dashboard-header {
  flex-wrap: nowrap;
}

.week-display {
  min-width: 0;
  /* evita overflow estranho */
}

.week-range {
  white-space: nowrap;
}

.week-actions {
  flex-shrink: 0;
}

.week-text {
  font-size: 16px;
  /* desktop */
}

@media (max-width: 600px) {
  .cards-renda-container {
    grid-template-columns: 1fr 1fr;
  }

  .card-renda {
    min-height: 120px;
    /* opcional */
  }
}

.card-renda-dia {
  position: relative;
  background-color: #9e9e9e;
  color: rgb(34, 34, 34);
  overflow: hidden;
}

/* imagem de fundo escurecida */
.card-renda-dia::after {
  content: '';
  position: absolute;
  inset: 0;

  background-image: url('/imgs/logoSemEscrita.png');
  background-size: 130px;
  background-repeat: no-repeat;
  background-position: right bottom;

  /* 🔥 deixa a imagem escura */
  filter: brightness(0.1);

  /* controla a força */
  opacity: 0.2;

  pointer-events: none;
  background-position: right -20px bottom 5px;

}


.header-dashboard {
  background:
    radial-gradient(circle at 8% 10%, rgba(255, 255, 255, 0.06), transparent 26%),
    radial-gradient(circle at 88% 2%, rgba(164, 180, 212, 0.16), transparent 30%),
    linear-gradient(165deg, #090b0f, #121722);
  margin: -16px -16px -92px;
  padding: 16px 16px 92px;
  border-bottom-left-radius: 42px;
  border-bottom-right-radius: 42px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 -18px 30px rgba(0, 0, 0, 0.2);
}


.header-dashboard {
  padding-bottom: 92px;
  /* antes devia estar maior */
}

.cards-renda-container {
  margin-top: -26px;
  /* puxa os cards para cima */
}

.valor-renda-cards {
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  opacity: 80%;
}

.dia-cards-renda {
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
}

.quantidade-agend-cards {
  font-size: 28px;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
}

.texto-comun {
  font-family: 'Inter', sans-serif;
}



/* .cards-renda-container {
  margin-top: -24px;
} */
</style>
