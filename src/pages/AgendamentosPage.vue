<template>
  <q-page padding>
    <!-- Cabeçalho -->
    <div class="row justify-between items-center q-mb-lg">
      <h4 :class="$q.dark.isActive ? 'text-white' : 'text-dark'">Agendamentos do dia</h4>
    </div>

    <!-- Lista de Agendamentos por hora -->
    <div class="agenda-container">

  <div
    v-for="slot in horariosDoDia"
    :key="slot.hora"
    class="agenda-row"
    :class="{
      'row-almoco': slot.tipo === 'almoco'
    }"
  >

    <!-- COLUNA DA HORA -->
    <div class="agenda-hora">
      {{ slot.hora }}:00
    </div>

    <!-- COLUNA DO SLOT -->
    <div class="agenda-slot">

      <!-- ALMOÇO -->
      <template v-if="slot.tipo === 'almoco'">
        <div class="almoco-box">
          🍽 Hora do almoço
        </div>
      </template>

      <!-- AGENDADO -->
      <template v-else-if="slot.agendamento">
        <q-card class="agendamento-card" bordered>
  <q-card-section class="relative-position">

    <!-- HORÁRIO NO TOPO DIREITO -->
    <div class="card-horario">
      {{ calcularHorarioFim(slot.hora, slot.agendamento.servico.duracao_minutos) }}
    </div>

    <div class="text-weight-bold q-mb-xs">
      {{ slot.agendamento.servico.nome }}
    </div>

    <div class="text-caption">
      {{ formatoMoeda(slot.agendamento.servico.preco) }}<br>
      Cliente: {{ slot.agendamento.cliente?.nome || '—' }}<br>
      Barbeiro: {{ slot.agendamento.barbeiro?.nome || '—' }}
    </div>

  </q-card-section>
</q-card>

      </template>

      <!-- LIVRE -->
      <template v-else>
        <div class="slot-livre">
          Horário livre
          <q-btn
            icon="add"
            round
            dense
            flat
            size="sm"
            color="primary"
            @click="abrirModal(slot.hora)"
          />
        </div>
      </template>

    </div>
  </div>

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
  calcularHorarioFim,
  atualizarPreco,
} = useAgendamentos(dataSelecionada)
</script>
