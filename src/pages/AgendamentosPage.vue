<template>
  <q-page padding>
    <q-inner-loading :showing="carregandoInicial" color="primary" class="loading-overlay">
      <div class="loading-dots" aria-label="Carregando">
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </div>
    </q-inner-loading>

    <div v-if="!carregandoInicial">
      <div class="agenda-wrapper relative-position" :key="dataSelecionada">
        <!-- HORAS -->
        <div class="agenda-hours">
          <div v-for="h in horasDoDia" :key="h" class="hour-row">
            {{ h }}
          </div>
        </div>

        <!-- GRID -->
        <div class="agenda-grid" v-if="horasDoDia.length">

          <div v-for="h in horasDoDia" :key="h" class="grid-hour" />

          <q-card v-for="ev in eventos" :key="ev.id" class="event-card" :class="ev.tipo" :style="estiloEvento(ev)"
            clickable v-ripple @click="ev.tipo === 'agendamento' && irParaDetalheAgendamento(ev.id)">
            <template v-if="ev.tipo === 'agendamento'">

              <div class="conteudo">
                <div class="text-bold card-nome-servico">
                  {{ formatarHorarioInicio(ev.inicio) }}
                  -
                  {{ calcularHorarioFim(ev.inicio, ev.duracao) }}
                </div>

                <div class="text-bold card-cliente-nome">
                  {{ ev.cliente?.nome || '—' }}
                </div>

                <div class="text-caption card-nome-cliente">
                  {{ ev.servico.nome }}
                </div>
              </div>

              <div class="rodape">
                <div class="text-caption card-nome-cliente">
                  R$ {{ ev.servico.preco }}
                </div>
              </div>
            </template>

            <template v-else-if="ev.tipo === 'almoco'">
              <div class="almoco-card">
                <div class="almoco-text">
                  <q-icon name="restaurant" size="32px" class="almoco-icon" /> {{ formatarHora(ev.hora_inicio) }}–{{
                    formatarHora(ev.hora_fim) }}
                </div>
              </div>
            </template>

            <template v-else>
              <div class="texto-block">
                FECHADO
              </div>
              <div class="bloqueado-text">
                {{ ev.hora_inicio }}–{{ ev.hora_fim }}
              </div>
              <div class="btn-excluir-bloqueio_agenda">
                <q-icon name="delete" @click="abriModalExclusaoBloqueio(ev)" />
              </div>
              <div class="motivo-bloqueio">
                {{ ev.motivo }}
              </div>
            </template>
          </q-card>
        </div>
      </div>

      <div class="hora-final">
        {{ horarioFinalExpediente }}
      </div>

      <!-- Modal de detalhes -->
      <ModalCancelarAgendamento v-model="modalAgendamento" :agendamento="agendamentoSelecionado"
        :formato-moeda="formatoMoeda" :calcular-horario-fim="calcularHorarioFim" @cancelar="cancelarAgendamento" />

      <ModalExcluirBloqueioAgenda v-model="modalExclusaoBloqueioAberto" :bloqueio="bloqueioSelecionado"
        @excluido="carregarHorariosBloqueadosDaAgenda" />


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

              <div class="servicos-selecao">
                <div class="row items-center justify-between q-mb-md">
                  <div class="text-grey-8 titulo-selecione-servico">
                    Selecione um serviço
                  </div>

                  <q-icon name="trending_flat" size="36px" color="grey-8" class="seta-larga" />
                </div>

                <div v-if="servicos.length" class="servicos-scroll">
                  <q-card v-for="servico in servicos" :key="servico.id" class="servico-card"
                    :class="{ 'servico-card--ativo': novoAgendamento.servico === servico.id }" flat bordered clickable
                    v-ripple @click="selecionarServico(servico.id)">
                    <div class="servico-card__nome">
                      {{ servico.nome }}
                    </div>
                    <div class="servico-card__preco">
                      R$ {{ servico.preco }}
                    </div>
                  </q-card>
                </div>

                <q-banner v-else dense rounded class="bg-grey-2 text-grey-7">
                  Nenhum serviço cadastrado
                </q-banner>
              </div>

              <q-input v-model="novoAgendamento.data" type="date" rounded filled label="Data"
                :disable="!novoAgendamento.servico" />

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

            <q-card-section>
              <SwipeConfirm ref="swipeRef" class="novo-agendamento-swipe" label="Deslize para salvar o Agendamento"
                hint="Deslize para confirmar" :enabled="!carregandoInicial" @confirm="onConfirmSalvarAgendamento" />
            </q-card-section>

          </q-card>
        </div>
      </q-dialog>

      <q-dialog v-model="modalBloqueiaAgendamentos" maximized persistent>
        <div class="modal-cancelamento">

          <!-- HEADER FIXO -->
          <div class="header-agendamento header-bloqueio">
            <q-btn icon="arrow_back" flat round color="white" class="absolute-top-left q-ma-md"
              @click="FecharmodalBloqueiaAgendamentos" />

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
                  color="primary" @update:model-value="buscarIntervalosLivres">
                  <template #prepend>
                    <q-icon name="event" />
                  </template>
                </q-input>

                <q-select v-model="intervaloSelecionado" :options="opcoesIntervalos"
                  label="Selecione um intervalo disponível" outlined dense rounded emit-value map-options
                  :disable="!opcoesIntervalos.length">
                  <template #prepend>
                    <q-icon name="schedule" />
                  </template>
                </q-select>

                <!-- INTERVALO -->
                <div v-if="intervaloSelecionado" class="intervalo-card q-pa-sm q-mt-xs">
                  <div class="text-caption text-grey-7 q-mb-xs">
                    Horário do bloqueio
                  </div>

                  <div class="row q-col-gutter-sm">
                    <div class="col-6">
                      <q-input v-model="formBloqueio.hora_inicio" type="time" label="Das" outlined dense rounded
                        :min="limitesHorario.min" :max="limitesHorario.max" :disable="!intervaloSelecionado"
                        :error="erroHoraInicio"
                        error-message="O horário definido não bate com o intervalo selecionado" />
                    </div>

                    <div class="col-6">
                      <q-input v-model="formBloqueio.hora_fim" type="time" label="Até" outlined dense rounded
                        :min="formBloqueio.hora_inicio || limitesHorario.min" :max="limitesHorario.max"
                        :disable="!intervaloSelecionado" :error="erroHoraFim"
                        error-message="O horário definido não bate com o intervalo selecionado" />
                    </div>
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
                  <div class="swipe-thumb" :class="{ disabled: !swipeHabilitado }"
                    :style="{ transform: `translateX(${swipeX}px)` }" @mousedown="swipeHabilitado && startSwipe($event)"
                    @touchstart="swipeHabilitado && startSwipe($event)">
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
        <q-btn flat dense icon="lock" class="btn-lock" color="black" @click="abrirModalBloqueiaAgendamentos" />

        <q-btn unelevated class="btn-main" @click="abrirModalGlobal">
          <div class="btn-content">
            <span class="btn-text">Novo Agendamento</span>
            <q-icon name="arrow_forward" class="btn-arrow" />
          </div>
        </q-btn>
      </div>

      <div class="footer-agendamento">
        <span class="btn-text">
          <q-icon name="schedule" size="16px" />
          {{ textoHorarioFuncionamento }}
        </span>
      </div>
    </div>

  </q-page>
</template>

<script setup>
import ModalCancelarAgendamento from '../components/modais/ModalCancelarAgendamento.vue'
import ModalExcluirBloqueioAgenda from '../components/modais/ModalExcluirBloqueioAgenda.vue'

import '../css/agendamentos.css'
import { toRef, defineProps, ref } from 'vue'
import { useAgendamentos } from '../scripts/agendamentos.js'

const props = defineProps({ dataSelecionada: { type: Date, required: true } })
const dataSelecionada = toRef(props, 'dataSelecionada')
const swipeRef = ref(null)


const {
  carregandoInicial,
  horariosPadrao,
  abrirModal,
  salvarAgendamento,
  novoAgendamento,
  modalAberto,
  servicos,
  agendamentoSelecionado,
  modalAgendamento,
  formatoMoeda,
  atualizarPreco,
  cancelarAgendamento,
  irParaDetalheAgendamento,
  modalBloqueiaAgendamentos,
  formBloqueio,
  fillPercent,
  startSwipe,
  swipeX,
  eventos,
  horasDoDia,
  estiloEvento,
  calcularHorarioFim,
  formatarHorarioInicio,
  formatarHora,
  textoHorarioFuncionamento,
  horarioFinalExpediente,
  abriModalExclusaoBloqueio,
  modalExclusaoBloqueioAberto,
  bloqueioSelecionado,
  carregarHorariosBloqueadosDaAgenda,
  abrirModalBloqueiaAgendamentos,
  buscarIntervalosLivres,
  opcoesIntervalos,
  intervaloSelecionado,
  limitesHorario,
  // mensagemErro,
  erroHoraFim,
  erroHoraInicio,
  swipeHabilitado,
  FecharmodalBloqueiaAgendamentos,
  SwipeConfirm
} = useAgendamentos(dataSelecionada)

// Wrapper para abrir o modal a partir do botão fixo (sem passar minuto)
const abrirModalGlobal = () => abrirModal?.()

const onConfirmSalvarAgendamento = async () => {
  const sucesso = await salvarAgendamento()
  if (!sucesso) {
    swipeRef.value?.resetSwipe?.()
  }
}

const selecionarServico = (servicoId) => {
  novoAgendamento.value.servico = servicoId
  atualizarPreco(servicoId)
}
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
  margin-top: 15px;
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

.slot-bloqueado {
  width: 100%;
  background: repeating-linear-gradient(45deg,
      #eeeeee,
      #eeeeee 10px,
      #e0e0e0 10px,
      #e0e0e0 20px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #616161;
  font-weight: 600;
}


.row-bloqueio-parcial .slot-bloqueado {
  height: 100%;
}

/* área livre abaixo do bloqueio */
.row-bloqueio-parcial::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 50%;
  /* controlado pelo JS se quiser */
  background: rgba(22, 19, 19, 0.6);
  pointer-events: none;
}

.agenda-wrapper {
  display: flex;
}

.agenda-hours {
  width: 70px;
}

.hour-row {
  height: 60px;
  padding-top: 4px;
  font-weight: bold;
}

.agenda-grid {
  position: relative;
  flex: 1;
  border-left: 1px solid #333;
}

.grid-hour {
  height: calc(60px * 4.5);
  /* 60 * PIXELS_PER_MINUTE */
}


.event-card {
  position: absolute;
  left: 8px;
  right: 8px;
  z-index: 10;
  border-radius: 8px;
  padding: 6px;
}

.event-card {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  /* 👈 joga tudo pra baixo */
  padding: 6px;
  margin-bottom: 6px;
}



.event-card.agendamento {
  background: #606163;
  color: white;
}

.event-card.bloqueio {
  background: #993030;
  color: white;
}

:root {
  --ppm: 4.5;
}

.grid-hour {
  height: calc(60px * var(--ppm));
}

.hour-row {
  height: calc(60px * var(--ppm));
}

.almoco-card {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 6px;

  background-image: url('/imgs/almoco3.png');
  /* caminho da imagem */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  border-radius: 8px;
  color: white;
  position: relative;
  opacity: 30%;
}


.almoco-icon {
  font-size: 32px;
}

.almoco-text {
  position: absolute;
  top: -2px;
  right: 8px;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #c0c0c0;
  font-family: 'Inter', sans-serif;
  font-weight: 600;

}

.bloqueado-text {
  position: absolute;
  top: 40px;
  font-size: 1.1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #c0c0c0;
  font-family: 'Inter', sans-serif;
  font-weight: 600;

}

.almoco-card {
  background-size: 100%;
}

@media (min-width: 1024px) {
  .almoco-card {
    background-size: 40%;
    margin-top: 20px;
  }
}

.motivo-bloqueio {
  position: absolute;
  /* top: 6px; */
  /* right: 8px; */
  font-size: 1.50rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #c0c0c0;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
}

.texto-block {
  position: absolute;
  top: 6px;
  font-size: 1.50rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #c0c0c0;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
}

.footer-agendamento {
  margin-top: 200px;
  position: sticky;
  bottom: 0;
  width: 100%;
  height: 56px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: rgba(20, 20, 20, 0.92);
  backdrop-filter: blur(6px);

  border-top: 1px solid rgba(255, 255, 255, 0.08);

  z-index: 10;
}

.footer-agendamento .btn-text {
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;

  color: #e0e0e0;
  letter-spacing: 0.3px;

  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-excluir-bloqueio_agenda {
  position: absolute;
  top: 6px;
  right: 8px;
  font-size: 1.50rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #c0c0c0;
  font-family: 'Inter', sans-serif;
  font-weight: 600;

}

.motivo-bloqueio {
  max-width: 100%;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.novo-agendamento-swipe {
  margin-top: -30px;
  margin-bottom: 18px;
}

.servicos-selecao {
  width: 100%;
  font-family: 'Inter', sans-serif;
}

.servicos-scroll {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 2px 2px 8px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: #c5c5c5 transparent;
}

.servicos-scroll::-webkit-scrollbar {
  height: 6px;
}

.servicos-scroll::-webkit-scrollbar-thumb {
  background: #c5c5c5;
  border-radius: 999px;
}

.servicos-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.servico-card {
  min-width: 180px;
  max-width: 240px;
  flex: 0 0 auto;
  border-radius: 16px;
  padding: 12px 14px;
  border: 1px solid #7e7b7b;
  background: linear-gradient(180deg, #646464 0%, #5c5a5a 100%);
  box-shadow: 0 2px 8px rgba(22, 22, 22, 0.08);
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.servico-card--ativo {
  border-color: #3b3b3b;
  background: linear-gradient(180deg, #a7a4a4 0%, #9b9a9a 100%);
  box-shadow: 0 6px 14px rgba(16, 16, 16, 0.14);
  transform: translateY(-1px);
}

.servico-card:hover {
  border-color: #bcbcbc;
  box-shadow: 0 5px 12px rgba(18, 18, 18, 0.12);
}

.servico-card__nome {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 0.96rem;
  color: #ffffff;

}

.servico-card__preco {
  margin-top: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  color: #faf4f4;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

@media (max-width: 600px) {
  .servico-card {
    min-width: 160px;
    max-width: 200px;
    padding: 10px 12px;
  }
}

.loading-dots {
  display: flex;
  gap: 6px;
  font-size: 42px;
  line-height: 1;
  font-weight: 700;
  color: #8a8a8a;
}

.loading-overlay {
  background: transparent !important;
  padding-bottom: 850px;
}

.loading-dots span {
  animation: dotBlink 1.2s infinite ease-in-out;
}

.loading-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dotBlink {

  0%,
  80%,
  100% {
    opacity: 0.2;
    transform: translateY(0);
  }

  40% {
    opacity: 1;
    transform: translateY(-4px);
  }
}

.titulo-selecione-servico {
  font-size: 18px;
}

.seta-larga {
  transform: scaleX(3.2);
  margin-right: 50px;
}
</style>
