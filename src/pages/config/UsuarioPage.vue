<template>
  <q-page class="q-pa-lg relative-position">
    <!-- LOADING -->
    <q-inner-loading :showing="loading">
      <q-spinner-dots size="40px" color="primary" />
    </q-inner-loading>

    <!-- CONTEÚDO -->
    <div v-if="!loading">

      <div class="row items-center no-wrap q-mb-md q-gutter-sm">
        <BotaoVoltar />

        <div class="column">
          <div class="text-weight-bold" :class="$q.screen.lt.sm ? 'text-subtitle1' : 'text-h5'">
            Configurações do Usuário
          </div>

          <div class="text-caption text-grey-5">
            Configure os dias e horários de funcionamento
          </div>
        </div>
      </div>

      <div class="text-captionn q-mb-sm">
        Informações Do Usuário
      </div>
      <!-- Usuario -->
      <q-card flat bordered>
        <div class="column items-center q-pa-lg">

          <q-avatar size="140px" class="avatar-barbearia cursor-pointer" @click="abrirUpload">
            <img v-if="previewFoto" :src="previewFoto" />
            <img v-else-if="fotoBackend" :src="fotoBackend" />
            <q-icon v-else name="photo_camera" size="42px" color="white" />
          </q-avatar>

          <div class="text-captionn text-grey-6 q-mt-sm">
            Clique para alterar a foto
          </div>

          <q-file ref="fileInput" v-model="fotoFile" accept="image/*" class="hidden"
            @update:model-value="gerarPreview" />

        </div>
        <q-card-section class="row q-col-gutter-md">
          <q-input filled label="Nome do Usuario" v-model="usuario.name" class="col-12 col-md-6" />
          <q-input filled label="Telefone" v-model="usuario.telefone" class="col-12 col-md-6" />
          <q-input filled label="email" v-model="usuario.email" class="col-12" />
        </q-card-section>
      </q-card>

      <!-- Horários -->
      <div class="q-mt-lg text-subtitle1">
        Horário de Funcionamento
      </div>

      <q-card v-for="dia in diasSemana" :key="dia.key" class="q-mb-md" flat bordered>
        <q-card-section class="row items-center justify-between">
          <div class="text-subtitle2">{{ dia.label }}</div>
          <q-toggle v-model="dia.ativo" color="green" :label="dia.ativo ? 'Atendendo' : 'Não atendendo'" />
        </q-card-section>

        <q-separator />

        <q-card-section v-if="dia.ativo" class="row q-col-gutter-md">
          <q-input filled type="time" v-model="dia.inicio" label="Início" class="col-12 col-md-3" />
          <q-input filled type="time" v-model="dia.almocoInicio" label="Almoço início" class="col-12 col-md-3" />
          <q-input filled type="time" v-model="dia.almocoFim" label="Almoço fim" class="col-12 col-md-3" />
          <q-input filled type="time" v-model="dia.fim" label="Fim" class="col-12 col-md-3" />
        </q-card-section>
      </q-card>

      <!-- Serviços -->
      <div class="q-mt-xl servicos-wrapper">
        <div class="row items-center justify-between q-mb-md">
          <div class="text-caption text-grey-5">SERVIÇOS</div>
          <div class="text-caption text-orange" @click="editarServicos">
            GERENCIAR
          </div>
        </div>

        <div class="row q-col-gutter-md">

          <!-- Add -->
          <div class="col-6 col-sm-4 col-md-3">
            <q-card class="servico-card servico-add" flat clickable @click="adicionarServico">
              <q-card-section class="servico-add-content">
                <q-icon name="add" size="32px" />
                <div class="q-mt-sm text-caption">Adicionar serviço</div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Cards -->
          <div v-for="servico in servicos" :key="servico.id" class="col-6 col-sm-4 col-md-3">
            <q-card class="servico-card" flat>
              <q-card-section>
                <div class="servico-titulo">{{ servico.nome }}</div>
                <div class="servico-preco">{{ servico.preco }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Salvar -->
      <div class="row justify-center q-mt-lg">
        <SwipeConfirm ref="swipeSalvar" label="Deslize para salvar alterações" @confirm="onConfirmSalvar" />

      </div>
    </div>

    <q-dialog v-model="modalCrop" persistent maximized>
      <q-card class="column no-wrap">

        <!-- HEADER -->
        <q-card-section class="row items-center q-py-sm">
          <div class="text-h6">Ajuste sua imagem</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <!-- CORPO (cropper ocupa tudo) -->
        <q-card-section class="col q-pa-none flex flex-center">
          <Cropper v-if="imagemParaCrop" ref="cropper" :src="imagemParaCrop" :stencil-props="{ aspectRatio: 1 }"
            class="cropper-full" @ready="cropperReady = true" />
        </q-card-section>

        <q-separator />

        <!-- AÇÕES -->
        <q-card-actions class="q-pa-md">
          <q-btn flat label="Cancelar" class="full-width q-mb-sm" v-close-popup />
          <q-btn color="primary" label="Salvar" class="full-width" :disable="!cropperReady" @click="confirmarCrop" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>


<script setup>
import BotaoVoltar from 'components/BotaoVoltar.vue'
import 'src/css/servicos.css'
import { useConfiguracoesBarbearia } from '../config/scripts/configuracoesBarbearia.js'
import SwipeConfirm from 'components/SwipeConfirm.vue'

const {
  diasSemana,
  usuario,
  servicos,
  adicionarServico,
  onConfirmSalvar,
  swipeSalvar,
  editarServicos,
  loading,
  previewFoto,
  fotoBackend,
  fotoFile,
  fileInput,
  abrirUpload,
  gerarPreview,
  confirmarCrop,
  Cropper,
  imagemParaCrop,
  modalCrop,
  cropperReady,
  cropper
} = useConfiguracoesBarbearia()
</script>
