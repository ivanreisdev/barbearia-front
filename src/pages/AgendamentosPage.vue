<template>
  <q-page padding>

    <!-- ✅ AGENDA ABERTA -->
    <div v-if="!barbeariaFechada" class="agenda-container">
      <div v-for="slot in horariosProcessados" :key="slot.inicioMinutos" class="agenda-row"
        :class="{ 'row-almoco': slot.tipo === 'almoco' }" :style="{ minHeight: slot.alturaRow + 'px' }">
        <!-- HORA -->
        <div class="agenda-hora" :class="{ 'hora-almoco': slot.tipo === 'almoco' }">
          {{ slot.hora }}:{{ slot.minuto }}
        </div>

        <!-- SLOT -->
        <div class="agenda-slot">

          <!-- 🍽️ ALMOÇO -->
          <div v-if="slot.tipo === 'almoco'" class="slot-almoco">
            <q-icon name="restaurant" size="18px" />
            <span>Horário de Almoço</span>
          </div>

          <!-- 📌 AGENDAMENTOS -->
          <template v-else-if="slot.agendamentos?.length">
            <q-card v-for="item in processarAgendamentos(slot)" :key="item.ag.id"
              class="agendamento-card cursor-pointer" bordered :style="estiloCard(item, slot)"
              @click="irParaDetalheAgendamento(item.ag.id)">
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

          <!-- 🟢 LIVRE -->
          <div v-else-if="!slot.ocupado && slot.tipo === 'normal'" class="slot-livre">
            Horário livre
          </div>

          <!-- ⚪ OCUPADO / CONTINUAÇÃO -->
          <div v-else class="slot-ocupado" />
        </div>
      </div>
    </div>

    <!-- 🛑 BARBEARIA FECHADA -->
    <div v-else class="agenda-fechada">
      <div class="fechada-overlay">
        <q-icon name="store" size="48px" />
        <div class="text-h5 q-mt-md">Barbearia Fechada</div>
        <div class="text-caption q-mt-sm">
          Estamos fora do horário de atendimento
        </div>
      </div>
    </div>

    <!-- Modal de detalhes -->
    <ModalCancelarAgendamento v-model="modalAgendamento" :agendamento="agendamentoSelecionado"
      :formato-moeda="formatoMoeda" :calcular-horario-fim="calcularHorarioFim" @cancelar="cancelarAgendamento" />

    <!-- Modal novo agendamento -->
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

            <q-input v-model="novoAgendamento.data" type="date" rounded filled label="Data" />

            <div class="row q-col-gutter-sm">
              <div class="col">
                <q-select v-model="novoAgendamento.hora" :options="horariosPadrao" option-label="label"
                  option-value="value" emit-value map-options rounded filled label="Horário"
                  :disable="!novoAgendamento.data" :placeholder="novoAgendamento.data
                    ? 'Selecione um horário'
                    : 'Selecione a data primeiro'" />
              </div>

              <div class="col-auto">
                <q-chip color="positive" text-color="white" class="q-mt-sm">
                  Livre
                </q-chip>
              </div>
            </div>

          </q-card-section>

          <q-card-actions class="q-pa-md">
            <q-btn label="AGENDAR" class="btn-agendar full-width" unelevated @click="salvarAgendamento" />
          </q-card-actions>
        </q-card>
      </div>
    </q-dialog>

    <q-dialog v-model="modalBloqueiaAgendamentos" maximized persistent>
      <div class="modal-cancelamento">

        <!-- HEADER FIXO -->
        <div class="header-agendamento header-bloqueio">
          <q-btn icon="arrow_back" flat round color="white" class="absolute-top-left q-ma-md"
            @click="modalBloqueiaAgendamentos = false" />

          <div class="header-content text-white">
            <div class="text-h5 titulo-bloqueio text-weight-medium">Fechar Agenda</div>
            <div class="text-caption opacity-8 descricao-header-bloqueio">
              Por favor informe quando você deseja
            </div>
            <div class="text-caption opacity-8 descricao-header-bloqueio">
              fechar o Estabelecimento.
            </div>
          </div>
        </div>

        <!-- CORPO DO MODAL -->
        <div class="modal-body">

          <div class="agendamento-info text-center q-gutter-md">

            <div class="bloqueio-form q-gutter-md">

              <!-- DATA -->
              <q-input v-model="formBloqueio.data" type="date" label="Data do bloqueio" outlined dense rounded
                color="primary">
                <template #prepend>
                  <q-icon name="event" />
                </template>
              </q-input>

              <!-- INTERVALO -->
              <div class="intervalo-card q-pa-sm q-mt-xs">
                <div class="text-caption text-grey-7 q-mb-xs">
                  Intervalo de horário (opcional)
                </div>

                <div class="row q-col-gutter-sm">
                  <div class="col-6">
                    <q-input v-model="formBloqueio.hora_inicio" type="time" label="Das" outlined dense rounded>
                      <template #prepend>
                        <q-icon name="schedule" />
                      </template>
                    </q-input>
                  </div>

                  <div class="col-6">
                    <q-input v-model="formBloqueio.hora_fim" type="time" label="Até" outlined dense rounded>
                      <template #prepend>
                        <q-icon name="schedule" />
                      </template>
                    </q-input>
                  </div>
                </div>

                <div class="text-caption text-grey-6 q-mt-xs">
                  Se não informado, o dia inteiro será bloqueado
                </div>
              </div>

              <!-- MOTIVO -->
              <q-input v-model="formBloqueio.motivo" type="textarea" label="Motivo do bloqueio (opcional)" outlined
                autogrow dense rounded>
                <template #prepend>
                  <q-icon name="notes" />
                </template>
              </q-input>

            </div>
            <div class="q-mt-xl text-caption inter-semibold">
              Deslize para confirmar o cancelamento
            </div>

            <!-- SLIDER -->
            <div class="row justify-center q-mt-md">

              <div class="swipe-container">
                <!-- TRACK QUE PREENCHE -->
                <div class="swipe-fill" :style="{ width: fillPercent + '%' }"></div>

                <!-- TEXTO -->
                <span class="swipe-text">
                  Deslize para a direita
                </span>

                <!-- BOTÃO -->
                <div class="swipe-thumb" :style="{ transform: `translateX(${swipeX}px)` }" @mousedown="startSwipe"
                  @touchstart="startSwipe">
                  <q-icon name="chevron_right" size="26px" color="negative" />

                </div>
              </div>


            </div>

          </div>
        </div>
      </div>
    </q-dialog>

    <!-- Botão fixo -->
    <div class="floating-wrapper">
      <q-btn flat dense icon="lock" class="btn-lock" color="black" @click="modalBloqueiaAgendamentos = true" />

      <q-btn unelevated class="btn-main" @click="abrirModalGlobal">
        <div class="btn-content">
          <span class="btn-text">Novo Agendamento</span>
          <q-icon name="arrow_forward" class="btn-arrow" />
        </div>
      </q-btn>
    </div>

  </q-page>
</template>


<script setup>
import ModalCancelarAgendamento from '../components/modais/ModalCancelarAgendamento.vue'
import '../css/agendamentos.css'
import { toRef, defineProps, computed } from 'vue'
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
  //abrirModalAgendamento,
  agendamentoSelecionado,
  modalAgendamento,
  processarAgendamentos,
  formatoMoeda,
  calcularHorarioFim,
  atualizarPreco,
  cancelarAgendamento,
  irParaDetalheAgendamento,
  modalBloqueiaAgendamentos,
  formBloqueio,
  fillPercent,
  startSwipe,
  swipeX,
} = useAgendamentos(dataSelecionada)

const barbeariaFechada = computed(() => {
  return !horariosProcessados.value || horariosProcessados.value.length === 0
})

// Wrapper para abrir o modal a partir do botão fixo (sem passar minuto)
const abrirModalGlobal = () => abrirModal?.()
</script>
<style scoped>
.container-mobile {
  max-width: 420px;
  margin: 0 auto;
}

.container-desktop {
  max-width: 1100px;
  margin: 0 auto;
}

.ticket-divider {
  height: 2px;
  background: repeating-linear-gradient(to right,
      #333,
      #333 8px,
      transparent 8px,
      transparent 16px);
  border-radius: 2px;
}

.inter-semibold {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
}

.agendamento-info {
  font-family: 'Inter', sans-serif;
}

.cliente-nome {
  color: #e57373;
  /* vermelho claro */
}

.card-form {
  border-radius: 42px;
}

.modal-cancelamento {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #201a1a;
}

.header-agendamento {
  height: 250px;
  flex-shrink: 0;
  border-radius: 0 0 50px 50px;
}

.header-bloqueio {
  position: relative;

  background-image:
    linear-gradient(135deg, rgba(63, 62, 60, 0.65), rgba(139, 110, 110, 0.75)),
    url('/imgs/Barbearia-background.jpg');

  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;

  width: 100%;
  min-height: 180px;
}

/* DESKTOP */
@media (min-width: 1024px) {
  .header-bloqueio {
    background-size: contain;
    background-position: center top;
  }
}


.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 16px;
  display: flex;
  justify-content: center;
}

.agendamento-info {
  width: 100%;
  max-width: 420px;
}

.cliente-nome {
  color: #e57373;
}

.swipe-container {
  width: 100%;
  display: flex;
  justify-content: center;
}

.swipe-track {
  position: relative;
  width: 320px;
  height: 56px;
  background: #5f6368;
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.swipe-text {
  color: white;
  font-weight: 500;
  pointer-events: none;
}

.swipe-thumb {
  position: absolute;
  left: 4px;
  width: 48px;
  height: 48px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.swipe-container {
  position: relative;
  width: 100%;
  max-width: 320px;
  height: 52px;
  background: #4b4f56;
  border-radius: 26px;
  overflow: hidden;
  user-select: none;
}

.swipe-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, #d32f2f, #ff5252);
  border-radius: 26px;
  transition: width 0.1s linear;
}

.swipe-text {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  z-index: 1;
  pointer-events: none;
}

.swipe-thumb {
  position: absolute;
  left: 4px;
  top: 4px;
  width: 44px;
  height: 44px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  z-index: 2;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.titulo-bloqueio {
  color: #ffb9b9;
  font-family: 'Inter', sans-serif;
  font-weight: 600;

}

.descricao-header-bloqueio {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
}
</style>
