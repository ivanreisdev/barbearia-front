<template>
  <q-dialog v-model="aberto" persistent>
    <q-card class="modal-agendamento">

      <!-- HEADER -->
      <q-card-section class="row items-center q-pb-sm">
        <div class="row items-center">
          <q-icon name="event" size="24px" class="q-mr-sm text-primary" />
          <div class="text-h6">Detalhes do Agendamento</div>
        </div>

        <q-space />

        <q-btn
          icon="close"
          flat
          round
          dense
          v-close-popup
        />
      </q-card-section>

      <q-separator />

      <!-- CONTEÚDO -->
      <q-card-section v-if="agendamento" class="q-gutter-md">

        <!-- CLIENTE -->
        <q-card flat bordered class="info-card">
          <q-card-section class="row items-center">
            <q-icon name="person" class="q-mr-md text-grey-7" />
            <div>
              <div class="text-caption text-grey-7">Cliente</div>
              <div class="text-body1">
                {{ agendamento.ag.cliente?.nome || '—' }}
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- SERVIÇO -->
        <q-card flat bordered class="info-card">
          <q-card-section class="row items-center">
            <q-icon name="content_cut" class="q-mr-md text-grey-7" />
            <div>
              <div class="text-caption text-grey-7">Serviço</div>
              <div class="text-body1">
                {{ agendamento.ag.servico.nome }}
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- HORÁRIO / VALOR -->
        <div class="row q-col-gutter-md">
          <div class="col-6">
            <q-card flat bordered class="info-card">
              <q-card-section>
                <div class="text-caption text-grey-7">Horário</div>
                <div class="text-body1">
                  {{ agendamento.inicio }} →
                  {{ calcularHorarioFim(
                    agendamento.inicio,
                    agendamento.duracao
                  ) }}
                </div>
                <div class="text-caption text-grey-6">
                  Duração: {{ agendamento.duracao }} min
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-6">
            <q-card flat bordered class="info-card">
              <q-card-section>
                <div class="text-caption text-grey-7">Valor</div>
                <div class="text-body1 text-weight-medium">
                  {{ formatoMoeda(agendamento.ag.servico.preco) }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

      </q-card-section>

      <q-separator />

      <!-- AÇÕES -->
      <q-card-actions align="between" class="q-pa-md">
        <q-btn
          color="negative"
          flat
          icon="delete"
          label="Cancelar agendamento"
          @click="$emit('cancelar', agendamento)"
        />

        <div class="row q-gutter-sm">
          <q-btn flat label="Fechar" v-close-popup />
        </div>
      </q-card-actions>

    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  agendamento: Object,
  formatoMoeda: Function,
  calcularHorarioFim: Function
})

const emit = defineEmits(['update:modelValue', 'cancelar'])

const aberto = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
</script>

<style scoped>
.modal-agendamento {
  width: 520px;
  max-width: 90vw;
  border-radius: 14px;
}

.info-card {
  border-radius: 10px;
}
</style>
