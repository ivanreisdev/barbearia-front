<template>
  <q-page class="q-pa-md q-pa-lg q-pa-x">
    <!-- LOADING -->
    <q-inner-loading :showing="loading">
      <q-spinner-dots size="40px" color="primary" />
    </q-inner-loading>

    <div v-if="!loading" class="row justify-center">

      <!-- CONTAINER RESPONSIVO -->
      <div class="col-12 col-md-10 col-lg-8 col-xs-6">

        <!-- HEADER -->
        <div class="row items-center q-gutter-md q-mb-md">
          <BotaoVoltar />

          <div class="column">
            <div class="text-h5 text-weight-bold">
              Informações da Barbearia
            </div>
            <div class="text-caption text-grey-6">
              Gerencie os dados do seu estabelecimento
            </div>
          </div>
        </div>

        <q-separator />

        <!-- FOTO -->
        <div class="column items-center q-my-xl">

          <q-avatar size="140px" class="avatar-barbearia cursor-pointer" @click="abrirUpload">
            <!-- PRIORIDADE:
    1️⃣ preview (foto nova)
    2️⃣ foto do backend
    3️⃣ ícone -->
            <img v-if="previewFoto" :src="previewFoto" />
            <img v-else-if="fotoBackend" :src="fotoBackend" />
            <q-icon v-else name="photo_camera" size="42px" color="white" />
          </q-avatar>


          <div class="text-caption text-grey-6 q-mt-sm">
            Clique para alterar a foto
          </div>

          <q-file ref="fileInput" v-model="fotoFile" accept="image/*" class="hidden"
            @update:model-value="gerarPreview" />
        </div>


        <q-separator spaced />

        <!-- FORM -->
        <div class="text-subtitle1 text-weight-medium q-mb-sm">
          Dados básicos
        </div>

        <div class="row q-col-gutter-md">

          <q-input outlined dense label="Nome da Barbearia" v-model="barbearia.nome" class="col-12 col-sm-6">
            <template #prepend>
              <q-icon name="badge" />
            </template>
          </q-input>

          <q-input outlined dense label="Telefone" v-model="barbearia.telefone" class="col-12 col-sm-6">
            <template #prepend>
              <q-icon name="phone" />
            </template>
          </q-input>

          <q-input outlined dense label="Endereço" v-model="barbearia.endereco" class="col-12">
            <template #prepend>
              <q-icon name="location_on" />
            </template>
          </q-input>
        </div>

        <q-separator spaced />
        <!-- SALVAR -->
        <SwipeConfirm ref="swipeRef" label="Deslize para salvar as alterações" hint="Deslize para confirmar"
          :enabled="!loading" @confirm="onConfirmarSwipe" />

      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import BotaoVoltar from 'components/BotaoVoltar.vue'
import { useConfiguracoesBarbearia } from './scripts/perfilBarbearia.js'
import SwipeConfirm from 'components/SwipeConfirm.vue'

const {
  barbearia,
  // salvarConfiguracoes,
  salvarPerfilBarbearia,
  loading,
  fotoBackend,
  fotoFile
} = useConfiguracoesBarbearia()

const swipeRef = ref(null)

const previewFoto = ref(null)
const fileInput = ref(null)


const abrirUpload = () => {
  fileInput.value.pickFiles()
}

const gerarPreview = (file) => {
  if (!file) {
    previewFoto.value = null
    return
  }

  previewFoto.value = URL.createObjectURL(file)
}

const onConfirmarSwipe = async () => {
  try {
    await salvarPerfilBarbearia()
  } finally {
    swipeRef.value?.resetSwipe()
  }
}
</script>


<style scoped>
.avatar-barbearia {
  background: linear-gradient(135deg, #2c2c2c, #3a3a3a);
  transition: opacity 0.2s;
}

.avatar-barbearia:hover {
  opacity: 0.85;
}

.hidden {
  display: none;
}

/* Mobile: botão ocupa tudo */
@media (max-width: 600px) {
  .full-width-xs {
    width: 100%;
  }
}
</style>
