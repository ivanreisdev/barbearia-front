<template>
  <LoadingLogo v-if="carregando" class="loading-overlay" />   <q-page v-else class="q-pa-md text-white clientes-page">
    <div class="clientes-container">
      <!-- HEADER -->
       <div class="q-mb-lg header-wrap">
        <div class="row items-center no-wrap header-main">
          <q-btn flat round icon="arrow_back" class="back-btn" @click="$router.back()" />

          <div class="q-ml-md">
            <div class="text-h5 text-weight-bold page-title">Clientes</div>
            <div class="text-caption page-subtitle">
              Gerencie seus clientes e contatos
            </div>
          </div>
        </div>

        <div class="clientes-indicadores">
          <div class="clientes-indicador">
            <q-icon name="groups" size="26px" class="indicador-icone" />
            <div class="indicador-texto">
              <div class="indicador-label">Base de clientes</div>
              <div class="indicador-valor-quantidade">{{ resumoClientes }}</div>
            </div>
          </div>

          <div class="clientes-indicador clientes-indicador--top">
            <q-icon name="emoji_events" size="26px" class="indicador-icone indicador-icone--top" />
            <div class="indicador-texto">
              <div class="indicador-label">Cliente destaque</div>
              <div class="indicador-valor indicador-valor--truncate">{{ topCliente?.nome || 'Sem dados' }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- FILTRO -->
      <div class="filtros-section q-mb-md">
        <q-input dense filled dark clearable v-model="filtros.nome" label="Buscar cliente" debounce="200"
          class="input-pesquisa">
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <!-- LISTA DE CLIENTES -->
      <div class="row q-col-gutter-md">
        <div v-for="cliente in clientesFiltrados" :key="cliente.id" class="col-12 col-sm-6 col-md-4 col-lg-4">
          <q-card flat bordered class="cliente-card">
            <q-card-section class="cliente-card-section">
              <div class="row items-center no-wrap q-col-gutter-sm cliente-top-row">
                <div class="col-auto">
                  <q-avatar color="grey-8" text-color="white" size="34px" class="cliente-avatar">
                    {{ cliente.nome?.charAt(0) || '?' }}
                  </q-avatar>
                </div>

                <div class="col cliente-info">
                  <div class="text-weight-bold cliente-nome">{{ cliente.nome }}</div>
                  <div class="text-caption text-grey-5 cliente-telefone">{{ formatarCelular(cliente.celular) }}</div>
                </div>
              </div>

              <div class="cliente-actions-inline q-mt-sm">
                <q-btn-group unelevated class="acoes-cliente">
                  <q-btn flat icon="mdi-whatsapp" color="green-5" @click.stop="abrirWhatsapp(cliente.celular)" />
                  <q-btn flat icon="mdi-chart-line" color="grey-5" @click.stop="verCliente(cliente)" />
                  <q-btn flat icon="mdi-pencil" color="grey-4" @click="abriModalEditarCliente(cliente)" />
                  <q-btn flat icon="mdi-delete" color="negative" @click.stop="abriModalExcluirCliente(cliente)" />
                </q-btn-group>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <q-card v-if="clientesFiltrados.length === 0" flat bordered class="empty-state-card q-mt-md">
        <q-card-section class="text-center q-py-xl">
          <q-icon name="group_off" size="34px" class="q-mb-sm" />
          <div class="text-subtitle1 text-weight-medium">Voce ainda nao possui nenhum cliente.</div>
        </q-card-section>
      </q-card>
    </div>

    <ModalEditarCliente v-model="modalEditarClienteAberto" :cliente="clienteSelecionado" @atualizado="buscarClientes" />
    <modalNovoCliente v-model="modalNovoClienteAberto" @clienteCriado="buscarClientes" />
    <ModalExcluirCliente v-model="modalExcluirClienteAberto" :cliente="clienteSelecionado" @clienteRemovido="buscarClientes" />
  </q-page>

  <q-page-sticky position="bottom-right" :offset="[18, 18]">
    <q-btn fab color="green" icon="add" @click="abriModalNovoCliente" />
  </q-page-sticky>
</template>

<script setup>
import { computed } from 'vue'

import { useClientes } from './config/scripts/clientes.js'
import ModalEditarCliente from '../components/modais/clientes/modalEditarCliente.vue'
import ModalNovoCliente from '../components/modais/clientes/ModalNovoCliente.vue'
import ModalExcluirCliente from '../components/modais/clientes/ModalExcluirCliente.vue'

const {
  clientes,
  clientesFiltrados,
  formatarCelular,
  abrirWhatsapp,
  verCliente,
  abriModalExcluirCliente,
  filtros,
  modalEditarClienteAberto,
  abriModalEditarCliente,
  clienteSelecionado,
  buscarClientes,
  LoadingLogo,
  carregando,
  modalNovoClienteAberto,
  abriModalNovoCliente,
  modalExcluirClienteAberto
} = useClientes()

const resumoClientes = computed(() => {
  const total = clientes.value.length
  return `${total}`
})

const contarAgendamentosCliente = (cliente) => {
  if (!cliente || typeof cliente !== 'object') return 0

  if (Array.isArray(cliente.agendamentos)) {
    return cliente.agendamentos.filter((ag) => String(ag?.status || '').toLowerCase() !== 'cancelado').length
  }

  const totalDireto = Number(
    cliente.total_agendamentos ??
    cliente.quantidade_agendamentos ??
    cliente.agendamentos_count
  )

  if (Number.isFinite(totalDireto) && totalDireto >= 0) return totalDireto
  return 0
}

const topCliente = computed(() => {
  if (!clientes.value.length) return null

  return clientes.value.reduce((melhor, atual) => {
    if (!melhor) return atual
    return contarAgendamentosCliente(atual) > contarAgendamentosCliente(melhor) ? atual : melhor
  }, null)
})

</script>

<style scoped>
.bg-dark {
  background: #0f0f10;
}

.clientes-page {
  background:
    radial-gradient(900px 500px at 0% -20%, rgba(34, 197, 94, 0.1), transparent 65%),
    radial-gradient(800px 460px at 100% -10%, rgba(59, 130, 246, 0.09), transparent 60%),
    linear-gradient(180deg, #0f1115 0%, #0c0d10 100%);
}

.clientes-container {
  max-width: 1160px;
  margin: 0 auto;
}

.header-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.header-main {
  min-width: 0;
}

.back-btn {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
}

.page-title {
  letter-spacing: 0.2px;
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.62);
}

.clientes-indicador {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: linear-gradient(135deg, rgba(22, 163, 74, 0.16), rgba(30, 41, 59, 0.35));
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03);
  flex-shrink: 0;
  min-width: 280px;
  min-height: 74px;
}


.clientes-indicadores {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  flex-wrap: wrap;
  font-family: 'Inter', sans-serif;

}

.clientes-indicador--top {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.18), rgba(30, 41, 59, 0.35));
}

.indicador-icone {
  color: #86efac;
  font-size: 20px;
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
}

.indicador-icone--top {
  color: #93c5fd;
}

.indicador-texto {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1.2;
  min-width: 0;
  width: 100%;
  padding: 0 14px;
}

.indicador-label {
  font-size: 0.72rem;
  letter-spacing: 0.35px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.62);
}

.indicador-valor {
  font-size: 0.94rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  font-family: 'Inter', sans-serif;
}

.indicador-valor-quantidade {
  font-size: 1.44rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  font-family: 'Inter', sans-serif;
}

.indicador-valor--truncate {
  max-width: 190px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cliente-card {
  background: linear-gradient(180deg, #141820 0%, #11151c 100%);
  border-color: rgba(255, 255, 255, 0.08);
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
  border-radius: 18px;
}

.cliente-card:hover {
  transform: translateY(-3px);
  border-color: rgba(255, 255, 255, 0.16);
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.28);
}

.cliente-avatar {
  background: linear-gradient(145deg, #374151 0%, #1f2937 100%);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.cliente-card-section {
  padding: 12px 14px;
}

.cliente-top-row {
  min-width: 0;
}

.cliente-info {
  min-width: 0;
}

.cliente-nome {
  letter-spacing: 0.2px;
  font-size: 0.92rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cliente-telefone {
  margin-top: 2px;
  font-size: 0.78rem;
}

.cliente-action-btn {
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.cliente-actions-inline .q-btn {
  min-width: 28px;
  min-height: 28px;
}

.cliente-actions-inline {
  width: 100%;
}

.input-pesquisa {
  width: 100%;
}

.filtros-section {
  padding: 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.input-pesquisa :deep(.q-field__control) {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
}

.input-pesquisa :deep(.q-field__label) {
  color: rgba(255, 255, 255, 0.65);
}

.input-pesquisa :deep(.q-field__prepend) {
  color: rgba(255, 255, 255, 0.55);
}

.acoes-cliente {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  background: #1a212d;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 11px;
  overflow: hidden;
}

.acoes-cliente .q-btn {
  min-height: 34px;
  min-width: 36px;
  padding: 7px 10px;
}

.acoes-cliente .q-btn:not(:last-child) {
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

.empty-state-card {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.88);
  border-radius: 18px;
}

@media (max-width: 599px) {
  .clientes-indicador {
    min-width: min(100%, 320px);
    min-height: 68px;
    padding: 10px 12px;
    gap: 10px;
  }

  .indicador-valor {
    font-size: 0.86rem;
  }

  .indicador-valor--truncate {
    max-width: 180px;
  }

  .cliente-card-section {
    align-items: flex-start;
  }

  .acoes-cliente .q-btn {
    width: 100%;
  }
}
</style>


