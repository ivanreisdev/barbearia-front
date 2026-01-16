<template>
  <q-page padding>
    <!-- Cabeçalho -->
    <div class="row justify-between items-center q-mb-lg">
      <h4 :class="$q.dark.isActive ? 'text-white' : 'text-dark'">Agendamentos do dia</h4>
    </div>

    <!-- Lista de Agendamentos por hora -->
    <div class="agenda-container">
      <div
        v-for="slot in horariosProcessados"
        :key="slot.inicioMinutos"
        class="agenda-row"
        :class="{ 'row-almoco': slot.tipo === 'almoco' }"
        :style="{ minHeight: slot.alturaRow + 'px' }"
      >
        <!-- COLUNA DA HORA -->
        <div class="agenda-hora">{{ slot.hora }}:{{ slot.minuto }}</div>

        <!-- COLUNA DO SLOT -->
        <div class="agenda-slot">
          <!-- Renderiza todos os agendamentos que começam neste slot -->
          <template v-if="slot.agendamentos?.length && slot.tipo !== 'almoco'">
            <q-card
  v-for="item in processarAgendamentos(slot)"
  :key="item.ag.id"
  class="agendamento-card cursor-pointer"
  bordered
  :style="estiloCard(item, slot)"
  @click="abrirModalAgendamento(item)"
>

              <q-card-section class="relative-position">
                <div class="card-horario">
                  {{ calcularHorarioFim(item.inicio, item.duracao) }}
                </div>
                <div class="card-nome-servico">
                  {{ item.ag.servico.nome }}
                </div>
                <div class="card-valor-servico">
                  {{ formatoMoeda(item.ag.servico.preco) }}
                </div>
                 <div class="card-nome-cliente">
                  {{ item.ag.cliente?.nome || '—' }}
                </div>
              </q-card-section>
            </q-card>
          </template>

          <!-- SLOT LIVRE -->
          <div v-else-if="!slot.ocupado && slot.tipo === 'normal'" class="slot-livre">
            Horário livre
          </div>
          <!-- caso seja ocupado mas não hajam agendamentos iniciando aqui (continuação), deixa vazio -->
          <div v-else class="slot-ocupado"></div>
        </div>
      </div>
    </div>

      <!-- Modal de detalhes do agendamento -->

    <q-dialog v-model="modalAgendamento">
  <q-card style="min-width: 400px">
    <q-card-section class="row items-center">
      <div class="text-h6">Detalhes do Agendamento</div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>

    <q-separator />

    <q-card-section v-if="agendamentoSelecionado">
      <p><strong>Cliente:</strong> {{ agendamentoSelecionado.ag.cliente?.nome }}</p>
      <p><strong>Serviço:</strong> {{ agendamentoSelecionado.ag.servico.nome }}</p>
      <p><strong>Valor:</strong> {{ formatoMoeda(agendamentoSelecionado.ag.servico.preco) }}</p>
      <p><strong>Início:</strong> {{ agendamentoSelecionado.inicio }}</p>
      <p><strong>Duração:</strong> {{ agendamentoSelecionado.duracao }} min</p>
      <p><strong>Fim:</strong>
        {{ calcularHorarioFim(
          agendamentoSelecionado.inicio,
          agendamentoSelecionado.duracao
        ) }}
      </p>
    </q-card-section>

    <q-separator />

<q-card-action>
      <q-btn flat color="negative" label="Cancelar Agendamento" @click="cancelarAgendamento" />
</q-card-action>
    <q-card-actions align="right">
      <q-btn flat label="Fechar" v-close-popup />
    </q-card-actions>

  </q-card>
</q-dialog>


    <!-- Modal de novo agendamento -->
    <q-dialog v-model="modalAberto" maximized persistent>
      <div class="agendamento-wrapper">
        <!-- HEADER -->
        <div class="header-agendamento">
          <q-btn
            icon="arrow_back"
            flat
            round
            color="white"
            class="absolute-top-left q-ma-md"
            @click="modalAberto = false"
          />

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

            <q-input
              v-model="novoAgendamento.telefone"
              rounded
              filled
              label="Telefone"
              mask="(##) #####-####"
            />
            <q-input
              v-model="novoAgendamento.email"
              rounded
              filled
              label="E-mail do cliente"
              type="email"
            />

            <q-select
              v-model="novoAgendamento.servico"
              :options="servicos"
              option-label="nome"
              option-value="id"
              emit-value
              map-options
              rounded
              filled
              label="Selecione um serviço"
              @update:model-value="atualizarPreco"
            />

            <q-input v-model="novoAgendamento.data" type="date" rounded filled label="Data" />

            <div class="row q-col-gutter-sm">
              <div class="col">
                <q-select
      v-model="novoAgendamento.hora"
      :options="horariosPadrao"
      option-label="label"
      option-value="value"
      emit-value
      map-options
      rounded
      filled
      label="Horário"
      :disable="!novoAgendamento.data"
      :placeholder="novoAgendamento.data ? 'Selecione um horário' : 'Selecione a data primeiro'"
    />
              </div>

              <div class="col-auto">
                <q-chip color="positive" text-color="white" class="q-mt-sm"> Livre </q-chip>
              </div>
            </div>

            <q-toggle
              v-model="novoAgendamento.repetir"
              label="Repetir este agendamento"
              color="primary"
            />
          </q-card-section>

          <!-- BOTÃO -->
          <q-card-actions class="q-pa-md">
            <q-btn
              label="AGENDAR"
              class="btn-agendar full-width"
              unelevated
              @click="salvarAgendamento"
            />
          </q-card-actions>
        </q-card>
      </div>
    </q-dialog>

    <!-- Botão fixo para novo agendamento -->
    <q-btn
      icon="add"
      fab
      round
      unelevated
      color="primary"
      style="position: fixed; right: 24px; bottom: 24px; z-index: 2000"
      @click="abrirModalGlobal"
    />
  </q-page>
</template>

<script setup>
import '../css/agendamentos.css'
import { toRef, defineProps } from 'vue'
import { useAgendamentos } from '../scripts/agendamentos.js'

const props = defineProps({ dataSelecionada: { type: Date, required: true } })
const dataSelecionada = toRef(props, 'dataSelecionada')

const {
  horariosProcessados,
  horariosPadrao,
  abrirModal,
  salvarAgendamento,
  novoAgendamento,
  modalAberto,
  servicos,
  estiloCard,
  abrirModalAgendamento,
  agendamentoSelecionado,
  modalAgendamento,
  processarAgendamentos,
  formatoMoeda,
  calcularHorarioFim,
  atualizarPreco,
  cancelarAgendamento,
} = useAgendamentos(dataSelecionada)

// Wrapper para abrir o modal a partir do botão fixo (sem passar minuto)
const abrirModalGlobal = () => abrirModal?.()
</script>
