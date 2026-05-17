<template>
  <q-dialog v-model="dialog" persistent>
    <q-card class="bg-dark text-white">

      <!-- HEADER -->
      <div class="row items-center q-pa-md">
        <q-btn flat round icon="arrow_back" @click="fechar" />
        <div class="text-h6 q-ml-md">Editar Serviço</div>
      </div>

      <q-separator />

      <!-- CONTEÚDO -->
      <q-card-section class="q-pa-lg">

        <div class="text-caption text-grey-6 q-mb-sm">
          ATUALIZE SEU SERVIÇO
        </div>

        <div class="text-caption text-grey-6 q-mb-sm">
          NOME DO SERVIÇO
        </div>

        <q-input dense dark filled placeholder="EX: Corte Social" v-model="form.nome" class="q-mb-md" />

        <div class="row q-col-gutter-sm q-mb-md">
          <div class="col-6">
            <div class="text-caption text-grey-6 q-mb-sm">
              DURAÇÃO (min)
            </div>
            <q-input dense dark filled type="number" v-model="form.duracao" />
          </div>

          <div class="col-6">
            <div class="text-caption text-grey-6 q-mb-sm">
              PREÇO
            </div>
            <q-input dense dark filled prefix="R$" mask="#,##" reverse-fill-mask v-model="form.preco" />
          </div>
        </div>

        <q-btn label="ATUALIZAR SERVIÇO" unelevated color="primary" class="full-width" size="lg" @click="atualizar" />

      </q-card-section>
    </q-card>
  </q-dialog>
</template>


<script setup>
import { ref, watch, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const props = defineProps({
  modelValue: Boolean,
  servicoId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'atualizado'])
const $q = useQuasar()

/* ✅ v-model seguro */
const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

/* FORM */
const form = ref({
  nome: '',
  duracao: null,
  preco: ''
})

const resetForm = () => {
  form.value = {
    nome: '',
    duracao: null,
    preco: ''
  }
}

const fechar = () => {
  dialog.value = false
  resetForm()
}

/* BUSCAR SERVIÇO */
const buscarServicoPorId = async () => {
  try {
    const { data } = await api.get(`/servicos/buscarServico/${props.servicoId}`)

    form.value = {
      nome: data.nome,
      duracao: data.duracao_minutos,
      preco: String(data.preco).replace('.', ',')
    }
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar serviço'
    })
  }
}

/* ATUALIZAR */
const atualizar = async () => {
  if (!form.value.nome || !form.value.duracao || !form.value.preco) {
    $q.notify({
      type: 'warning',
      message: 'Preencha todos os campos'
    })
    return
  }

  try {
    await api.put('/servicos/editarServico', {
      id: props.servicoId,
      nome: form.value.nome,
      duracao_minutos: form.value.duracao,
      preco: form.value.preco.replace(',', '.')
    })

    $q.notify({
      type: 'positive',
      message: 'Serviço atualizado!'
    })

    emit('atualizado')
    fechar()
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Erro ao salvar serviço'
    })
  }
}

/* WATCH DEFENSIVO */
watch(
  () => [props.modelValue, props.servicoId],
  ([aberto, id]) => {
    if (aberto && id) {
      buscarServicoPorId()
    }
  }
)
</script>
