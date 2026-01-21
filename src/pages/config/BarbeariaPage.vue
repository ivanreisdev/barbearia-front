<template>
  <q-page class="q-pa-lg">
    <BotaoVoltar />

    <!-- Cabeçalho -->
    <div class="q-mb-xl">
      <div class="text-h5">Configurações da Barbearia</div>
      <div class="text-caption text-grey-5">
        Configure os dias e horários de funcionamento da barbearia
      </div>
    </div>

    <!-- Horários de funcionamento -->
    <div class="text-subtitle1 q-mb-md">
      Horário de Funcionamento
    </div>

    <q-card v-for="dia in diasSemana" :key="dia.key" class="q-mb-md" flat bordered>
      <q-card-section class="row items-center justify-between">
        <div class="text-subtitle2">
          {{ dia.label }}
        </div>

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

    <!-- Informações da barbearia -->
    <q-card class="q-mt-xl" flat bordered>
      <q-card-section>
        <div class="text-subtitle1">Informações da Barbearia</div>
      </q-card-section>

      <q-card-section class="row q-col-gutter-md">
        <q-input filled label="Nome da Barbearia" v-model="barbearia.nome" class="col-12 col-md-6" />

        <q-input filled label="Telefone" v-model="barbearia.telefone" class="col-12 col-md-6" />

        <q-input filled label="Endereço" v-model="barbearia.endereco" class="col-12" />
      </q-card-section>
    </q-card>

    <!-- Serviços -->
    <!-- Serviços -->
    <!-- Serviços -->
    <div class="q-mt-xl servicos-wrapper">
      <!-- Cabeçalho -->
      <div class="row items-center justify-between q-mb-md">
        <div class="text-caption text-grey-5">SERVIÇOS</div>

        <div class="text-caption text-orange" @click="editarServicos">
          GERENCIAR
        </div>
      </div>

      <!-- Grid de serviços -->
      <div class="row q-col-gutter-md">

        <!-- Card adicionar serviço (sempre o primeiro) -->
        <div class="col-6 col-sm-4 col-md-3">
          <q-card class="servico-card servico-add" flat clickable @click="adicionarServico">
            <q-card-section class="servico-add-content">
              <q-icon name="add" size="32px" />
              <div class="q-mt-sm text-caption">
                Adicionar serviço
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Cards de serviços -->
        <div v-for="servico in servicos" :key="servico.id" class="col-6 col-sm-4 col-md-3">
          <q-card class="servico-card" flat>
            <q-card-section class="servico-content">
              <div class="servico-titulo">
                {{ servico.nome }}
              </div>

              <div class="servico-preco">
                {{ servico.preco }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Hint -->
      <div class="text-caption text-grey-6 q-mt-sm text-right">
        Clique em "Editar" para gerenciar os serviços
      </div>
    </div>


    <!-- Botão salvar -->
    <div class="row justify-end q-mt-xl">
      <q-btn color="primary" icon="save" label="Salvar Configurações" @click="salvarConfiguracoes" />
    </div>

  </q-page>
</template>

<script setup>
import BotaoVoltar from 'components/BotaoVoltar.vue'
import 'src/css/servicos.css'
import { useConfiguracoesBarbearia } from '../config/scripts/configuracoesBarbearia.js'
const {
  diasSemana,
  barbearia,
  servicos,
  adicionarServico,
  salvarConfiguracoes,
  editarServicos
} = useConfiguracoesBarbearia()
</script>

