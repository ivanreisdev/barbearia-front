<!-- Cabeçalho -->
<template>
  <LoadingLogo v-if="carregando" class="loading-overlay" />

  <q-page v-else class="q-pa-lg bg-dark relative-position servicos-page">

    <!-- LOADING -->
    <q-inner-loading :showing="loading">
      <q-spinner-dots size="40px" color="orange" />
    </q-inner-loading>
    <div v-if="!loading">
      <!-- Header -->

      <div class="row items-center q-mb-lg page-header header-inline no-wrap">
        <q-btn flat round icon="arrow_back" class="back-btn" @click="$router.back()" />

        <div class="header-text">
          <div class="text-h6 text-white q-mb-xs title-gradient">
            Serviços
          </div>

          <div class="text-caption text-grey-5 subtitle-soft">
            Cadastre e edite os serviços fornecidos pela empresa
          </div>
        </div>
      </div>

      <!-- INSERIR NOVO SERVIÇO -->
      <div class="text-caption text-grey-6 q-mb-sm">
        INSERIR UM NOVO SERVIÇO
      </div>
      <q-card class="q-mb-xl novo-servico-card card-dark">
        <q-card-section>

          <div class="text-caption text-grey-6 q-mb-sm">
            NOME DO SERVIÇO
          </div>
          <q-input dense dark filled placeholder="EX: Corte Social" class="input-dark q-mb-md" v-model="form.nome" />

          <div class="row q-col-gutter-sm q-mb-md">
            <div class="col-6">
              <div class="text-caption text-grey-6 q-mb-sm">
                DURAÇÃO (min)
              </div>
              <q-input dense dark filled type="number" placeholder="Duração (min)" class="input-dark"
                v-model="form.duracao" />
            </div>

            <div class="col-6">
              <div class="text-caption text-grey-6 q-mb-sm">
                PREÇO
              </div>
              <q-input dense dark filled prefix="R$" placeholder=" 0,00" class="input-dark" v-model="form.preco"
                mask="#,##" reverse-fill-mask />
            </div>
          </div>

          <!-- Botão -->
          <q-btn label="ADICIONAR À LISTA" unelevated class="full-width btn-add-servico ghost-btn" size="md"
            @click="salvar" />

        </q-card-section>
      </q-card>

      <div class="text-caption text-grey-6 q-mb-sm">
        LISTA DE SERVIÇOS
      </div>

      <q-list class="servicos-list">

        <q-item v-for="servico in servicos" :key="servico.id" clickable class="servico-card q-mb-sm item-hover">

          <!-- Ícone -->
          <q-item-section avatar>
            <div class="icon-wrapper">
              <q-icon name="content_cut" size="20px" color="orange-4" />
            </div>
          </q-item-section>

          <!-- Infos -->
          <q-item-section>
            <q-item-label class="servico-nome">
              {{ servico.nome }}
            </q-item-label>

            <div class="row items-center q-gutter-sm servico-info">
              <span>{{ servico.duracao }}</span>
              <span>•</span>
              <span>{{ servico.preco }}</span>
            </div>
          </q-item-section>

          <!-- Ações -->
          <q-item-section side>
            <div class="row items-center q-gutter-xs">
              <q-btn flat round dense icon="edit" color="grey-5" class="iconeEdiçao"
                @click="AbrirModaleditarServico(servico)" />
              <q-btn flat round dense icon="delete" color="grey-5" class="iconeDelete"
                @click="abrirModalExcluir(servico)" />
            </div>
          </q-item-section>

        </q-item>
      </q-list>

      <!-- MODAL Excluir serviço -->
      <q-dialog v-model="modalExcluir" maximized persistent>
        <div class="modal-excluir-servico">

          <!-- HEADER -->
          <div class="header-exclusao">
            <q-btn icon="arrow_back" flat round color="white" class="absolute-top-left q-ma-md"
              @click="fecharModalExcluir" />

            <div class="header-content text-white">
              <div class="titulo-exclusao">
                Excluir serviço
              </div>
              <div class="subtitulo-exclusao">
                Essa ação não poderá ser desfeita
              </div>
            </div>
          </div>

          <!-- BODY -->
          <div class="modal-body">

            <div class="servico-info text-center q-gutter-lg">

              <!-- Nome -->

              <div class="text-h6 text-weight-medium servico-nome-delete">
                {{ servicoSelecionado?.nome }}
              </div>

              <!-- Infos -->
              <div class="row justify-center q-gutter-lg info-servico">

                <div class="info-item">
                  <div class="subtitulo-exclusao">
                    Duração
                  </div>
                  <span class="chip-info servico-duracao">
                    {{ servicoSelecionado?.duracao }}
                  </span>
                </div>

                <div class="info-item">
                  <div class="subtitulo-exclusao">
                    Valor
                  </div>
                  <span class="chip-info preco">
                    {{ servicoSelecionado?.preco }}
                  </span>
                </div>

              </div>


              <!-- Texto -->
              <div class="q-mt-xl text-caption opacity-8 texto-deslize">
                Deslize para confirmar a exclusão
              </div>

              <!-- SLIDER -->
              <div class="row justify-center q-mt-md">
                <div class="swipe-container">

                  <div class="swipe-fill" :style="{ width: fillPercent + '%' }"></div>

                  <span class="swipe-text">
                    Deslize para a direita
                  </span>

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


      <!--  modal Editar -->
      <q-dialog v-model="modalEditarServico" maximized persistent>
        <!-- OVERLAY -->
        <div class="modal-overlay">

          <!-- MODAL CARD -->
          <div class="modal-editar-servico">
            <!-- HEADER -->
            <div class="modal-header header-editar-servico">
              <q-btn flat round icon="arrow_back" color="white" @click="fecharModalEditar" />

              <div class="modal-title">
                ATUALIZE SEU SERVIÇO
              </div>

              <!-- Spacer invisível para balancear -->
              <div class="header-spacer"></div>

            </div>
            <!-- CONTEÚDO -->
            <div class="modal-content">

              <div class="text-caption text-grey-5 q-mb-sm">

              </div>

              <div class="text-caption text-grey-6 q-mb-sm">
                NOME DO SERVIÇO
              </div>

              <q-input dense dark filled class="input-dark q-mb-md" v-model="servicoSelecionado.nome" />

              <div class="row q-col-gutter-sm q-mb-md">
                <div class="col-6">
                  <div class="text-caption text-grey-6 q-mb-sm">
                    DURAÇÃO (min)
                  </div>
                  <q-input dense dark filled type="number" v-model="servicoSelecionado.duracao" />
                </div>

                <div class="col-6">
                  <div class="text-caption text-grey-6 q-mb-sm">
                    PREÇO
                  </div>
                  <q-input dense dark filled prefix="R$" mask="#,##" reverse-fill-mask
                    v-model="servicoSelecionado.preco" />
                </div>
              </div>

              <q-btn label="ATUALIZAR SERVIÇO" unelevated class="full-width btn-add-servico" @click="atualizar" />

            </div>
          </div>
        </div>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar, Loading } from 'quasar'
import { api } from 'boot/axios'
import LoadingLogo from 'components/LoadingLogo.vue'


import 'src/css/servicos.css'

const $q = useQuasar()
const carregando = ref(true)

const servicos = ref([
  {
    id: null,
    nome: '',
    preco: '',
    duracao: ''
  }
])
const servicoSelecionado = ref(null)
const modalExcluir = ref(false)
const modalEditarServico = ref(false)
const swipeX = ref(0)
const maxSwipe = 260
let startX = 0
let dragging = false

const fillPercent = computed(() => {
  return Math.min((swipeX.value / maxSwipe) * 100, 100)
})

const startSwipe = (e) => {
  dragging = true
  startX = e.touches ? e.touches[0].clientX : e.clientX

  document.addEventListener('mousemove', moveSwipe)
  document.addEventListener('mouseup', endSwipe)
  document.addEventListener('touchmove', moveSwipe)
  document.addEventListener('touchend', endSwipe)
}

const moveSwipe = (e) => {
  if (!dragging) return

  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  let delta = clientX - startX

  swipeX.value = Math.max(0, Math.min(delta, maxSwipe))
}

const endSwipe = () => {
  dragging = false

  if (swipeX.value >= maxSwipe) {
    confirmarCancelamento()
  } else {
    swipeX.value = 0
  }

  document.removeEventListener('mousemove', moveSwipe)
  document.removeEventListener('mouseup', endSwipe)
  document.removeEventListener('touchmove', moveSwipe)
  document.removeEventListener('touchend', endSwipe)
}
const confirmarCancelamento = async () => {
  if (!servicoSelecionado.value) return
  await excluirServico(servicoSelecionado.value.id)
}

const abrirModalExcluir = (servico) => {
  servicoSelecionado.value = servico
  swipeX.value = 0
  modalExcluir.value = true
}
const AbrirModaleditarServico = (servico) => {
  servicoSelecionado.value = {
    id: servico.id,
    nome: servico.nome,
    duracao: parseInt(servico.duracao),
    preco: servico.preco.replace('R$', '').trim()
  }

  modalEditarServico.value = true
}


const fecharModalExcluir = () => {
  swipeX.value = 0
  servicoSelecionado.value = null
  modalExcluir.value = false
}

const fecharModalEditar = () => {
  modalEditarServico.value = false
}
const buscarServicos = async () => {
  console.log(localStorage.getItem('user'));
  try {
    const { data } = await api.get('/servicos/buscarServicosPorBarbeariaId')

    servicos.value = data.map(item => ({
      id: item.id,
      nome: item.nome,
      preco: `R$ ${Number(item.preco).toFixed(2).replace('.', ',')}`,
      duracao: `${item.duracao_minutos} min`
    }))
  } catch (error) {
    console.error('Erro ao buscar serviços', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar serviços'
    })
  }
}
const form = ref({
  nome: '',
  duracao: null,
  preco: ''
})

const excluirServico = async (servico) => {
  try {
    await api.delete(`/servicos/excluirServico/${servico}`)

    $q.notify({
      type: 'positive',
      message: 'Serviço excluído com sucesso!'
    })

    buscarServicos()
    modalExcluir.value = false
  } catch (error) {
    console.error('Erro ao excluir serviço', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao excluir serviço'
    })
  }
}
const salvar = async () => {
  try {
    console.log('Salvando serviço:', form.value)
    await api.post('/servicos/criarNovoServico', {
      nome: form.value.nome,
      duracao_minutos: form.value.duracao,
      preco: form.value.preco.replace(',', '.'),
      // barbearia_id: barbeariaId
    })

    $q.notify({
      type: 'positive',
      message: 'Serviço cadastrado com sucesso!'
    })
    form.value.nome = ''
    form.value.duracao = null
    form.value.preco = ''

    buscarServicos()
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao salvar serviço'
    })
  }
}

const atualizar = async () => {
  if (!servicoSelecionado.value) return

  try {
    await api.put('/servicos/editarServico', {
      id: servicoSelecionado.value.id,
      nome: servicoSelecionado.value.nome,
      duracao_minutos: servicoSelecionado.value.duracao,
      preco: String(servicoSelecionado.value.preco).replace(',', '.')
    })

    $q.notify({
      type: 'positive',
      message: 'Serviço atualizado com sucesso!'
    })

    modalEditarServico.value = false
    servicoSelecionado.value = null
    buscarServicos()

  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao atualizar serviço'
    })
  }
}

onMounted(async () => {
  Loading.show({
    spinner: LoadingLogo,
    backgroundColor: '#0c0d10'
  })

  try {
    await buscarServicos()
  } finally {
    carregando.value = false
  }
})

</script>
<style scoped>
.servicos-page {
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
  border-bottom: 1px solid rgba(39, 39, 39, 0.06);
}

.header-inline {
  gap: 12px;
}

.header-text {
  min-width: 0;
}

.header-text .text-h6,
.header-text .text-caption {
  text-align: left;
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

.back-btn {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
}

.card-dark {
  background: linear-gradient(180deg, #12151b 0%, #0f1116 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.ghost-btn {
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
}

.item-hover {
  transition: background 160ms ease, transform 160ms ease, border-color 160ms ease;
}

.item-hover:hover {
  background: rgba(255, 255, 255, 0.03);
  transform: translateX(2px);
}

.servico-card {
  background: #12151b;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
}

.servico-nome {
  font-weight: 600;
  letter-spacing: 0.2px;
}

.servico-info {
  color: #9ca3af;
}

.icon-wrapper {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.inter-semibold {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
}

.header-exclusao {
  height: 120px;
  background: linear-gradient(135deg, #ac012059, #da4d4d);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
}

.cliente-nome {
  color: #e57373;
  /* vermelho claro */
}

.card-form {
  border-radius: 42px;
}

.modal-excluir-servico {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #201a1af5;
}

.header-exclusao {
  height: 250px;
  flex-shrink: 0;
  border-radius: 0 0 50px 50px;
}

.header-exclusao {
  background: linear-gradient(135deg, #c50327a8, #f56363);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 16px;
  display: flex;
  justify-content: center;
}

.servico-info {
  width: 100%;
  max-width: 420px;
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
  font-size: 12px;
  font-family: 'Inter', sans-serif;
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

.servico-nome-delete {
  font-size: 20px;
  font-weight: 600;
  color: #eb3a3a;
  font-family: 'Inter', sans-serif;
}

.servico-duracao {
  font-size: 18px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
}

.preco {
  font-size: 18px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
}

.texto-deslize {
  font-size: 14px;
  font-family: 'Inter', sans-serif;
}

header-subtitulo {
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  color: #201f1f;
}

.header-content {
  text-align: center;
  /* centraliza visualmente */
}

.titulo-exclusao {
  font-size: 22px;
  font-weight: 600;
  line-height: 1.3;
}

.subtitulo-exclusao {
  margin-top: 6px;
  /* RESPIRO 👈 */
  font-size: 14px;
  opacity: 0.85;
}

.btn-add-servico {
  font-size: 0.90rem;
  padding: 15px;
  /* 12px */
  letter-spacing: 0.5px;
}

/* Overlay transparente */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  /* TRANSPARÊNCIA REAL */
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Card do modal */
.modal-editar-servico {
  width: 100%;
  max-width: 420px;
  background: #121212;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  /* background: linear-gradient(135deg, #2c2c2c, #1a1a1a); */
  background-color: black;
}

.header-editar-servico {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
}

.modal-title {
  text-align: center;
  font-weight: 600;
  font-size: 1rem;
  letter-spacing: 0.5px;
}

.header-spacer {
  width: 40px;
  /* largura aproximada do botão */
}

/* Conteúdo */
.modal-content {
  padding: 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
</style>
