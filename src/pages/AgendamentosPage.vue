<template>
  <q-page padding>
    <!-- Cabeçalho -->
    <div class="row justify-between items-center q-mb-lg">
      <h4 :class="$q.dark.isActive ? 'text-white' : 'text-dark'">Agendamentos do dia</h4>
    </div>

    <!-- Lista de Agendamentos por hora -->
    <div class="q-gutter-md">
      <q-card v-for="slot in horariosDoDia" :key="slot.hora" clickable :class="[
        $q.dark.isActive ? 'bg-grey-10' : 'bg-grey-2',
        $q.dark.isActive ? 'text-white' : 'text-dark'
      ]" class="q-pa-md q-mb-md card-agendamento" style="position: relative">
        <!-- Botão + para criar novo agendamento -->
        <q-btn v-if="slot.tipo === 'normal' && !slot.agendamento" icon="add" round dense color="primary" size="sm" flat
          class="absolute-top-right q-mr-xs q-mt-xs" @click="abrirModal(slot.hora)" />

        <q-card-section>
          <div class="text-caption">{{ slot.hora }}:00</div>

          <!-- HORÁRIO DE ALMOÇO -->
          <template v-if="slot.tipo === 'almoco'">
            <div class="text-body2 q-mt-sm text-orange">
              🍽 Hora do almoço
            </div>
          </template>

          <!-- AGENDADO -->
          <template v-else-if="slot.agendamento">
            <div class="text-h6 q-mt-xs">
              <strong>{{ slot.agendamento.servico.nome }}</strong> -
              {{ formatoMoeda(slot.agendamento.servico.preco) }}
            </div>

            <div class="text-caption q-mt-xs">
              Cliente: {{ slot.agendamento.cliente?.nome || 'Cliente não informado' }}<br />
              Barbeiro: {{ slot.agendamento.barbeiro?.nome || '—' }}
            </div>
          </template>

          <!-- LIVRE -->
          <template v-else>
            <div class="text-body2 q-mt-xs text-grey-5">
              Horário indisponível
            </div>
          </template>
        </q-card-section>


        <q-separator v-if="slot.agendamento" />
      </q-card>
    </div>

    <!-- Modal de novo agendamento -->
    <q-dialog v-model="modalAberto" maximized persistent>
      <div class="agendamento-wrapper">
        <!-- HEADER -->
        <div class="header-agendamento">
          <q-btn icon="arrow_back" flat round color="white" class="absolute-top-left q-ma-md"
            @click="modalAberto = false" />

          <div class="header-content">
            <div class="text-h5 text-weight-medium">Novo agendamento</div>
            <div class="text-caption opacity-8">
              Preencha todos os campos para realizar um novo agendamento.
            </div>
          </div>
        </div>

        <!-- CARD -->
        <q-card class="card-form">
          <q-card-section class="q-gutter-md">
            <q-input v-model="novoAgendamento.cliente" rounded filled label="Nome do cliente" />

            <q-input v-model="novoAgendamento.telefone" rounded filled label="Telefone" mask="(##) #####-####" />
            <q-input v-model="novoAgendamento.email" rounded filled label="E-mail do cliente" type="email" />

            <q-select v-model="novoAgendamento.servico" :options="servicos" option-label="nome" option-value="id"
              emit-value map-options rounded filled label="Selecione um serviço" @update:model-value="atualizarPreco" />

            <q-input v-model="novoAgendamento.data" type="date" rounded filled label="Data" readonly />

            <div class="row q-col-gutter-sm">
              <div class="col">
                <q-input v-model="novoAgendamento.hora" rounded filled label="Horário" readonly />
              </div>

              <div class="col-auto">
                <q-chip color="positive" text-color="white" class="q-mt-sm"> Livre </q-chip>
              </div>
            </div>

            <q-toggle v-model="novoAgendamento.repetir" label="Repetir este agendamento" color="primary" />
          </q-card-section>

          <!-- BOTÃO -->
          <q-card-actions class="q-pa-md">
            <q-btn label="AGENDAR" class="btn-agendar full-width" unelevated @click="salvarAgendamento" />
          </q-card-actions>
        </q-card>
      </div>
    </q-dialog>
  </q-page>
</template>

<script setup>
import '../css/agendamentos.css'
import { toRef, defineProps } from 'vue'
import { useAgendamentos } from '../scripts/agendamentos.js'

const props = defineProps({ dataSelecionada: { type: Date, required: true } })
const dataSelecionada = toRef(props, 'dataSelecionada')

const {
  horariosDoDia,
  abrirModal,
  salvarAgendamento,
  novoAgendamento,
  modalAberto,
  servicos,
  formatoMoeda,
} = useAgendamentos(dataSelecionada)
</script>
