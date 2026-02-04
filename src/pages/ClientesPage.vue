<template>
  <q-page class="q-pa-md text-white">
    <!-- HEADER -->
    <div class="row items-center justify-between q-mb-lg">

      <!-- Lado esquerdo -->
      <div class="row items-center">
        <q-btn flat round icon="arrow_back" @click="$router.back()" />

        <div class="q-ml-md">
          <div class="text-h5 text-weight-bold">Clientes</div>
          <div class="text-caption text-grey-5">
            Gerencie seus clientes e contatos
          </div>
        </div>
      </div>

      <q-space />

    </div>


    <!-- FILTROS -->
    <q-card-section class="row items-center q-col-gutter-md filtros-section q-mb-md">
      <q-input dense filled dark clearable v-model="filtros.nome" label="Buscar cliente" debounce="200"
        class="col input-pesquisa">
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </q-card-section>


    <!-- LISTA DE CLIENTES -->
    <div class="row q-col-gutter-md">
      <div v-for="cliente in clientesFiltrados" :key="cliente.id" class="col-12 col-sm-6 col-md-4 col-lg-4">
        <q-card flat bordered class="bg-grey-10 cliente-card">
          <q-card-section class="row items-center no-wrap q-col-gutter-sm cliente-card-section">
            <div class="col-auto">
              <q-avatar color="grey-8" text-color="white" size="34px" class="cliente-avatar">
                {{ cliente.nome?.charAt(0) || '?' }}
              </q-avatar>
            </div>

            <div class="col cliente-info">
              <div class="text-weight-bold cliente-nome">{{ cliente.nome }}</div>
              <div class="text-caption text-grey-5 cliente-telefone">{{ formatarCelular(cliente.celular) }}</div>
            </div>

            <div class="col-auto">
              <div class="row items-center no-wrap q-gutter-xs cliente-actions-inline">
                <q-btn-group unelevated class="acoes-cliente">

                  <q-btn flat icon="mdi-whatsapp" color="green-5" @click.stop="abrirWhatsapp(cliente.celular)" />

                  <q-btn flat icon="mdi-chart-line
" color="grey-5" @click.stop="verCliente(cliente)" />

                  <q-btn flat icon="mdi-pencil" color="grey-4" />

                </q-btn-group>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>

  <q-page-sticky position="bottom-right" :offset="[18, 18]">
    <q-btn fab color="green" icon="add" @click="novoCliente" />
  </q-page-sticky>
</template>

<script setup>

import { useClientes } from './config/scripts/clientes.js'

const {
  clientesFiltrados,
  formatarCelular,
  abrirWhatsapp,
  verCliente,
  novoCliente,
  filtros,
} = useClientes()
</script>

<style scoped>
.bg-dark {
  background: #0f0f10;
}

.cliente-card {
  border-color: rgba(255, 255, 255, 0.08);
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
  border-radius: 25px;
}

.cliente-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.16);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.cliente-avatar {
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.cliente-card-section {
  padding: 10px 12px;
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
  font-size: 0.75rem;
}

.cliente-action-btn {
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.cliente-actions-inline .q-btn {
  min-width: 28px;
  min-height: 28px;
}

.input-pesquisa {
  border-radius: 14px;
}

.filtros-card {
  border-color: rgba(255, 255, 255, 0.08);
  margin-bottom: 16px;
}

.filtros-section {
  padding: 12px 14px;
}

.input-pesquisa :deep(.q-field__control) {
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
}

.input-pesquisa :deep(.q-field__label) {
  color: rgba(255, 255, 255, 0.65);
}

.input-pesquisa :deep(.q-field__prepend) {
  color: rgba(255, 255, 255, 0.55);
}

.acoes-cliente {
  background: #1e2430;
  border-radius: 12px;
  overflow: hidden;
}

.acoes-cliente .q-btn {
  padding: 8px 12px;
}

.acoes-cliente .q-btn:not(:last-child) {
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}
</style>
