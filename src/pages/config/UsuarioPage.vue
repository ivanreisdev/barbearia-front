<template>
  <q-page class="q-pa-lg relative-position">

    <!-- LOADING -->
    <q-inner-loading :showing="loading">
      <q-spinner-dots size="40px" color="primary" />
    </q-inner-loading>

    <!-- CONTEÚDO -->
    <div v-if="!loading">

      <BotaoVoltar />

      <!-- Cabeçalho -->
      <div class="q-mb-xl">
        <div class="text-h5">Configurações da Barbearia</div>
        <div class="text-caption text-grey-5">
          Configure os dias e horários de funcionamento da barbearia
        </div>
      </div>

      <!-- Horários -->
      <div class="text-subtitle1 q-mb-md">
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

      <!-- Barbearia -->



      <q-card class="q-mt-xl" flat bordered>
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
        <q-card-section>
          <div class="text-subtitle1">Informações Do Usuario</div>
        </q-card-section>

        <q-card-section class="row q-col-gutter-md">
          <q-input filled label="Nome do Usuario" v-model="usuario.name" class="col-12 col-md-6" />
          <q-input filled label="Telefone" v-model="usuario.telefone" class="col-12 col-md-6" />
          <q-input filled label="email" v-model="usuario.email" class="col-12" />
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
      <div class="row justify-end q-mt-xl">
        <q-btn color="primary" icon="save" label="Salvar Configurações" @click="salvarConfiguracoes" />
      </div>

    </div>
  </q-page>
</template>


<script setup>
import BotaoVoltar from 'components/BotaoVoltar.vue'
import 'src/css/servicos.css'
import { useConfiguracoesBarbearia } from '../config/scripts/configuracoesBarbearia.js'
const {
  diasSemana,
  usuario,
  servicos,
  adicionarServico,
  salvarConfiguracoes,
  editarServicos,
  loading,
  previewFoto,
  fotoBackend,
  fotoFile,
  fileInput,
  abrirUpload,
  gerarPreview,
} = useConfiguracoesBarbearia()
</script>
