<template>
  <LoadingLogo v-if="carregamento" class="loading-overlay" />

  <q-page v-else class="q-pa-md q-pa-lg q-pa-x barbearia-page">
    <!-- LOADING -->
    <!-- <q-inner-loading :showing="loading">
      <q-spinner-dots size="40px" color="primary" />
    </q-inner-loading> -->

    <div v-if="!loading" class="row justify-center">

      <!-- CONTAINER RESPONSIVO -->
      <div class="col-12 col-md-10 col-lg-8 col-xs-6">

        <!-- HEADER -->
        <div class="row items-center no-wrap q-gutter-sm q-mb-md page-header">
          <BotaoVoltar class="back-btn" />

          <div class="column">
            <div class="text-weight-bold title-gradient" :class="$q.screen.lt.sm ? 'text-subtitle1' : 'text-h5'">
              Informações da Barbearia
            </div>

            <div class="text-caption text-grey-6 subtitle-soft">
              Gerencie os dados do seu estabelecimento
            </div>
          </div>
        </div>


        <q-separator class="separator-soft" />

        <!-- FOTO -->
        <!-- FOTO -->
        <div class="column items-center q-my-xl">

          <q-avatar size="140px" class="avatar-barbearia cursor-pointer avatar-soft" @click="abrirUpload">
            <img v-if="previewFoto" :src="previewFoto" />
            <img v-else-if="fotoBackend" :src="fotoBackend" />
            <q-icon v-else name="photo_camera" size="42px" color="white" />
          </q-avatar>

          <div class="text-caption text-grey-6 q-mt-sm">
            Clique para alterar a foto
          </div>

          <q-file ref="fileInput" accept="image/*" class="hidden" @update:model-value="gerarPreview" />

          <ModalAjusteFotos v-model="modalCrop" :src="imagemParaCrop" @confirm="onImagemCortada" />
        </div>

        <q-separator spaced class="separator-soft" />

        <!-- FORM -->
        <div class="text-subtitle1 text-weight-medium q-mb-sm section-title">
          Dados básicos
        </div>

        <div class="row q-col-gutter-md">

          <q-input outlined dense label="Nome da Barbearia" v-model="barbearia.nome" class="col-12 col-sm-6 input-dark">
            <template #prepend>
              <q-icon name="badge" />
            </template>
          </q-input>

          <q-input outlined dense label="Telefone" v-model="barbearia.telefone" class="col-12 col-sm-6 input-dark"
            mask="(##) #####-####" maxlength="15">
            <template #prepend>
              <q-icon name="phone" />
            </template>
          </q-input>

        </div>

        <div class="text-subtitle1 text-weight-medium q-mt-lg q-mb-sm section-title">
          Endereco
        </div>

        <div class="row q-col-gutter-md">
          <q-input outlined dense label="Rua" v-model="barbearia.endereco.rua" class="col-12 col-sm-8 input-dark">
            <template #prepend>
              <q-icon name="location_on" />
            </template>
          </q-input>

          <q-input outlined dense label="Numero" v-model="barbearia.endereco.numero" class="col-12 col-sm-4 input-dark">
            <template #prepend>
              <q-icon name="tag" />
            </template>
          </q-input>

          <q-input outlined dense label="Bairro" v-model="barbearia.endereco.bairro" class="col-12 col-sm-6 input-dark">
            <template #prepend>
              <q-icon name="map" />
            </template>
          </q-input>

          <q-input outlined dense label="Cidade" v-model="barbearia.endereco.cidade" class="col-12 col-sm-6 input-dark">
            <template #prepend>
              <q-icon name="location_city" />
            </template>
          </q-input>

          <q-select outlined dense label="Estado / UF" v-model="barbearia.endereco.uf" :options="ufsBrasil" emit-value
            map-options class="col-12 col-sm-4 input-dark">
            <template #prepend>
              <q-icon name="public" />
            </template>
          </q-select>

          <q-input outlined dense label="Complemento" v-model="barbearia.endereco.complemento"
            class="col-12 col-sm-8 input-dark">
            <template #prepend>
              <q-icon name="add_location_alt" />
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
import ModalAjusteFotos from 'components/modais/ModalAjusteFotos.vue'


const {
  barbearia,
  // salvarConfiguracoes,
  salvarPerfilBarbearia,
  fotoBackend,
  // fotoFile,
  modalCrop,
  gerarPreview,
  imagemParaCrop,
  onImagemCortada,
  fileInput,
  previewFoto,
  carregamento,
  LoadingLogo,
  ufsBrasil

} = useConfiguracoesBarbearia()


const abrirUpload = () => {
  fileInput.value?.pickFiles()
}


const swipeRef = ref(null)

const onConfirmarSwipe = async () => {
  try {
    await salvarPerfilBarbearia()
  } finally {
    swipeRef.value?.resetSwipe()
  }
}
</script>


<style scoped>
.barbearia-page {
  color: #f3f4f6;
  font-family: 'Inter', sans-serif;
  background:
    radial-gradient(1200px 600px at 10% -20%, rgba(34, 197, 94, 0.10), transparent 60%),
    radial-gradient(900px 500px at 110% 10%, rgba(59, 130, 246, 0.08), transparent 55%),
    linear-gradient(180deg, #0f1115 0%, #0c0d10 100%);
  border-radius: 16px;
}

.page-header {
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.title-gradient {
  background: linear-gradient(90deg, #e5e7eb 0%, #9ca3af 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.subtitle-soft {
  letter-spacing: 0.2px;
}

.separator-soft {
  opacity: 0.6;
}

.back-btn {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
}

.avatar-soft {
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.12),
    0 10px 22px rgba(0, 0, 0, 0.35);
  background: #151922;
}

.section-title {
  letter-spacing: 0.2px;
}

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

@media (max-width: 600px) {
  .full-width-xs {
    width: 100%;
  }

  .barbearia-page {
    width: calc(100% - 20px);
    margin: 0 auto;
    border-radius: 16px;
  }
}
</style>
