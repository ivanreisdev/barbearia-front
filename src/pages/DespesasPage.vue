<template>
  <q-page class="despesas-page q-pa-md">
    <div class="row items-center q-mb-sm despesas-header no-wrap">
      <div class="header-title row items-center no-wrap">
        <q-btn flat round icon="arrow_back" class="back-btn q-mr-md" @click="$router.back()" />
        <div>
          <div class="text-h5 text-weight-bold page-title">Despesas</div>
          <div class="text-caption text-grey-5">Controle de custos e saidas da barbearia</div>
        </div>
      </div>
    </div>

    <div class="filters-row q-mb-lg">
      <div class="header-filters">
        <q-input v-model="filtroNome" dense outlined color="grey-4" class="input-dark input-nome"
          placeholder="Buscar por nome">
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-select v-model="filtroMes" dense outlined color="grey-4" class="input-dark input-mes"
          :options="mesesDisponiveis" option-label="label" option-value="value" emit-value map-options />
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-lg-4">
        <q-card flat bordered class="card-dark card-stack">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold">Resumo do Mes</div>
            <div class="text-caption text-grey-5">Indicadores rapidos</div>
          </q-card-section>
          <q-separator dark class="separator-soft" />
          <q-card-section class="q-gutter-md">
            <div class="stat-card">
              <div class="text-caption text-grey-5">Total de despesas</div>
              <div class="text-h6 text-weight-bold">{{ totalFiltrado }}</div>
            </div>
            <div class="stat-card">
              <div class="text-caption text-grey-5">Quantidade</div>
              <div class="text-h6 text-weight-bold">{{ despesasFiltradas.length }}</div>
            </div>
            <div class="stat-card">
              <div class="text-caption text-grey-5">Categoria principal</div>
              <div class="text-h6 text-weight-bold">{{ categoriaPrincipal }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-lg-8">
        <q-card flat bordered class="card-dark">
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-subtitle1 text-weight-bold">Despesas Registradas</div>
              <div class="text-caption text-grey-5">Filtro atual: {{ filtroMesLabel }}</div>
            </div>
            <div class="text-caption text-grey-5">Total: {{ totalFiltrado }}</div>
          </q-card-section>
          <q-separator dark class="separator-soft" />
          <q-card-section class="q-pa-none">
            <q-list v-if="despesasFiltradas.length" separator dark>
              <q-item v-for="despesa in despesasFiltradas" :key="despesa.id" class="item-dark item-hover">
                <q-item-section avatar>
                  <q-avatar size="36px" color="red-7" text-color="white">
                    <q-icon name="receipt_long" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ despesa.titulo }}</q-item-label>
                  <q-item-label caption class="text-grey-5">
                    {{ formatarData(despesa.data) }} • {{ despesa.categoria }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side class="items-end">
                  <div class="price-text text-negative">{{ formatarMoeda(despesa.valor) }}</div>
                  <div class="action-icons q-mt-xs">
                    <q-btn dense flat round class="action-icon action-icon-edit" icon="edit"
                      @click="abrirEdicao(despesa)" />
                    <q-btn dense flat round class="action-icon action-icon-delete" icon="delete"
                      @click="excluirDespesa(despesa.id)" />
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="text-grey text-center q-pa-lg empty-state">
              Nenhuma despesa encontrada para o periodo selecionado.
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-btn fab icon="add" color="green-6" class="fab-add" @click="abrirModalNovaDespesa" />

    <ModalNovaDespesa v-model="modalNovaDespesaAberto" @clienteCriado="buscarDespesas" />

  </q-page>
</template>

<script setup>
import { api } from 'src/boot/axios'
import { computed, onMounted, ref } from 'vue'
import ModalNovaDespesa from '../components/modais/financeiro/ModalNovaDespesa.vue'


const despesas = ref([])

const filtroMes = ref('todos')
const filtroNome = ref('')
const modalNovaDespesaAberto = ref(false)

const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
}).format(Number(valor) || 0)

const formatarData = (dataStr) => {
  if (!dataStr) return '-'
  const data = new Date(`${dataStr}T00:00:00`)
  if (Number.isNaN(data.getTime())) return dataStr
  return data.toLocaleDateString('pt-BR')
}

const mapearDespesasApi = (lista = []) => lista.map((item, index) => ({
  id: item.id ?? index + 1,
  titulo: item.descricao ?? 'Despesa',
  categoria: item.categoria ?? '-',
  valor: Number(item.valor ?? 0),
  data: item.data ?? ''
}))

const abrirModalNovaDespesa = () => {
  modalNovaDespesaAberto.value = true
}

const buscarDespesas = async () => {
  try {
    const response = await api.get('despesas/buscarDespesas')
    despesas.value = mapearDespesasApi(response.data?.despesas || [])
  } catch (error) {
    console.error('Erro ao buscar despesas:', error)
  }
}

const getMesChave = (dataStr) => {
  if (!dataStr) return ''
  const data = new Date(`${dataStr}T00:00:00`)
  if (Number.isNaN(data.getTime())) return ''
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
}

const mesesDisponiveis = computed(() => {
  const meses = Array.from(new Set(despesas.value.map(d => getMesChave(d.data)).filter(Boolean)))
  const options = meses
    .sort()
    .reverse()
    .map((mes) => {
      const [ano, mm] = mes.split('-')
      return { value: mes, label: `${mm}/${ano}` }
    })
  return [{ value: 'todos', label: 'Todos os meses' }, ...options]
})

const filtroMesLabel = computed(() => {
  const opt = mesesDisponiveis.value.find(item => item.value === filtroMes.value)
  return opt?.label || 'Todos os meses'
})

const despesasFiltradas = computed(() => {
  const termo = filtroNome.value.trim().toLowerCase()
  return despesas.value.filter((d) => {
    const mesOk = filtroMes.value === 'todos' || getMesChave(d.data) === filtroMes.value
    const nomeOk = !termo || d.titulo.toLowerCase().includes(termo)
    return mesOk && nomeOk
  })
})

const totalFiltrado = computed(() => {
  const total = despesasFiltradas.value.reduce((acc, item) => acc + Number(item.valor || 0), 0)
  return formatarMoeda(total)
})

const categoriaPrincipal = computed(() => {
  const mapa = new Map()
  despesasFiltradas.value.forEach((item) => {
    mapa.set(item.categoria, (mapa.get(item.categoria) || 0) + Number(item.valor || 0))
  })
  const ordenado = Array.from(mapa.entries()).sort((a, b) => b[1] - a[1])
  return ordenado[0]?.[0] || '-'
})

const excluirDespesa = (id) => {
  despesas.value = despesas.value.filter(item => item.id !== id)
}

onMounted(() => {
  buscarDespesas()
})
</script>

<style scoped>
.despesas-page {
  color: #f3f4f6;
  font-family: 'Inter', sans-serif;
  background:
    radial-gradient(1200px 600px at 10% -20%, rgba(239, 68, 68, 0.12), transparent 60%),
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

.despesas-header {
  gap: 12px;
}

.header-title {
  min-width: 0;
  font-family: 'Inter', sans-serif;

}

.header-filters {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: nowrap;
  width: 100%;
  max-width: 560px;
}

.filters-row {
  display: flex;
  justify-content: center;
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

.card-stack {
  min-height: 320px;
}

.ghost-btn {
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 0 10px;
}

.separator-soft {
  opacity: 0.6;
}

.input-dark :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.08);
}

.input-dark :deep(.q-field__append),
.input-dark :deep(.q-field__prepend) {
  color: rgba(255, 255, 255, 0.6);
}

.input-mes {
  min-width: 0;
  flex: 0 0 160px;
}

.input-nome {
  min-width: 0;
  flex: 1 1 0;
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
  letter-spacing: 0.2px;
}

.action-icons {
  display: flex;
  gap: 8px;
}

.action-icon {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  color: #e5e7eb;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.action-icon-edit {
  background: rgba(59, 130, 246, 0.12);
  border-color: rgba(59, 130, 246, 0.25);
}

.action-icon-delete {
  background: rgba(239, 68, 68, 0.18);
  border-color: rgba(239, 68, 68, 0.35);
  color: #fee2e2;
}

.stat-card {
  background: #151922;
  border-radius: 14px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02);
}

.empty-state {
  opacity: 0.7;
}

.fab-add {
  position: fixed;
  right: 24px;
  bottom: 24px;
  box-shadow: 0 10px 24px rgba(34, 197, 94, 0.3);
}

.dialog-card {
  min-width: 320px;
  max-width: 480px;
  width: 90vw;
}

@media (max-width: 599px) {
  .header-filters {
    max-width: 100%;
  }

  .input-mes {
    flex-basis: 120px;
  }

  .action-icons {
    flex-direction: row;
  }


  .fab-add {
    right: 16px;
    bottom: 16px;
  }
}
</style>
