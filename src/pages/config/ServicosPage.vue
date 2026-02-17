<template>
  <LoadingLogo v-if="carregando" class="loading-overlay" />

  <q-page v-else class="q-pa-md q-pa-lg-sm relative-position servicos-page">
    <q-inner-loading :showing="loading">
      <q-spinner-dots size="40px" color="orange" />
    </q-inner-loading>

    <div v-if="!loading" class="servicos-shell">
      <div class="row items-center no-wrap justify-between q-mb-lg page-header">
        <div class="row items-center no-wrap q-gutter-sm">
          <q-btn flat round icon="arrow_back" class="back-btn" @click="$router.back()" />

          <div class="header-text">
            <div class="text-h6 q-mb-xs title-gradient">
              Servicos
            </div>

            <div class="text-caption text-grey-5 subtitle-soft">
              Cadastre e gerencie os servicos da barbearia
            </div>
          </div>
        </div>
      </div>

      <q-card class="q-mb-lg card-dark form-card">
        <q-card-section>
          <div class="row items-center justify-between q-mb-md">
            <div>
              <div class="text-overline section-kicker">
                Novo servico
              </div>

              <div class="text-subtitle1 text-weight-medium text-white">
                Adicionar item ao catalogo
              </div>
            </div>

            <div class="desktop-only text-caption text-grey-5">
              Preencha e clique em adicionar
            </div>
          </div>

          <q-input v-model="form.nome" dense dark filled placeholder="Ex: Corte social" class="input-soft q-mb-sm">
            <template #prepend>
              <q-icon name="badge" />
            </template>
          </q-input>

          <div class="row q-col-gutter-sm q-mb-md">
            <div class="col-12 col-sm-6">
              <q-input v-model="form.duracao" dense dark filled type="number" placeholder="Duracao (min)"
                class="input-soft">
                <template #prepend>
                  <q-icon name="schedule" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-sm-6">
              <q-input v-model="form.preco" dense dark filled prefix="R$" placeholder="0,00" class="input-soft"
                mask="#,##" reverse-fill-mask>
                <template #prepend>
                  <q-icon name="payments" />
                </template>
              </q-input>
            </div>
          </div>

          <q-btn label="Adicionar servico" unelevated class="full-width btn-add-servico ghost-btn" size="md"
            @click="salvar" />
        </q-card-section>
      </q-card>

      <div class="row items-center justify-between q-mb-sm">
        <div class="text-overline section-kicker">
          Lista de servicos
        </div>

        <div class="text-caption text-grey-5">
          {{ servicos.length }} itens cadastrados
        </div>
      </div>

      <div v-if="servicos.length" class="service-grid">
        <q-card v-for="servico in servicos" :key="servico.id" class="servico-card item-hover">
          <q-card-section class="q-pa-md">
            <div class="row items-start justify-between no-wrap q-gutter-sm">
              <div class="row items-center no-wrap q-gutter-sm">
                <div class="icon-wrapper">
                  <q-icon name="content_cut" size="20px" color="orange-3" />
                </div>

                <div>
                  <div class="servico-nome">
                    {{ servico.nome }}
                  </div>

                  <div class="text-caption text-grey-5">
                    Servico ativo
                  </div>
                </div>
              </div>

              <div class="row items-center q-gutter-xs">
                <q-btn flat round dense icon="edit" color="grey-4" class="iconeEdicao"
                  @click="AbrirModaleditarServico(servico)" />
                <q-btn flat round dense icon="delete" color="grey-4" class="iconeDelete"
                  @click="abrirModalExcluir(servico)" />
              </div>
            </div>

            <div class="row q-col-gutter-sm q-mt-md">
              <div class="col-6">
                <div class="meta-chip">
                  <q-icon name="schedule" size="16px" />
                  <span>{{ servico.duracao }}</span>
                </div>
              </div>

              <div class="col-6">
                <div class="meta-chip price">
                  <q-icon name="payments" size="16px" />
                  <span>{{ servico.preco }}</span>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <q-card v-else class="card-dark empty-state">
        <q-card-section class="text-center q-py-xl">
          <q-icon name="content_cut" size="36px" color="grey-6" class="q-mb-sm" />

          <div class="text-subtitle2 text-grey-4">
            Nenhum servico cadastrado ainda
          </div>

          <div class="text-caption text-grey-6">
            Use o formulario acima para adicionar o primeiro servico.
          </div>
        </q-card-section>
      </q-card>

      <q-dialog v-model="modalExcluir" maximized persistent>
        <div class="modal-excluir-servico">
          <div class="header-exclusao">
            <q-btn icon="arrow_back" flat round color="white" class="absolute-top-left q-ma-md"
              @click="fecharModalExcluir" />

            <div class="header-content text-white">
              <div class="titulo-exclusao">
                Excluir servico
              </div>

              <div class="subtitulo-exclusao">
                Essa acao nao podera ser desfeita
              </div>
            </div>
          </div>

          <div class="modal-body">
            <div class="servico-info text-center q-gutter-lg">
              <div class="text-h6 text-weight-medium servico-nome-delete">
                {{ servicoSelecionado?.nome }}
              </div>

              <div class="row justify-center q-gutter-lg info-servico">
                <div class="info-item">
                  <div class="subtitulo-exclusao">
                    Duracao
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

              <div class="q-mt-xl text-caption opacity-8 texto-deslize">
                Deslize para confirmar a exclusao
              </div>

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

      <q-dialog v-model="modalEditarServico" maximized persistent>
        <div class="modal-overlay">
          <div class="modal-editar-servico">
            <div class="modal-header header-editar-servico">
              <q-btn flat round icon="arrow_back" color="white" @click="fecharModalEditar" />

              <div class="modal-title">
                Atualize seu servico
              </div>

              <div class="header-spacer"></div>
            </div>

            <div class="modal-content">
              <div class="text-caption text-grey-6 q-mb-sm">
                Nome do servico
              </div>

              <q-input dense dark filled class="input-dark q-mb-md" v-model="servicoSelecionado.nome" />

              <div class="row q-col-gutter-sm q-mb-md">
                <div class="col-6">
                  <div class="text-caption text-grey-6 q-mb-sm">
                    Duracao (min)
                  </div>

                  <q-input dense dark filled type="number" v-model="servicoSelecionado.duracao" />
                </div>

                <div class="col-6">
                  <div class="text-caption text-grey-6 q-mb-sm">
                    Preco
                  </div>

                  <q-input dense dark filled prefix="R$" mask="#,##" reverse-fill-mask
                    v-model="servicoSelecionado.preco" />
                </div>
              </div>

              <q-btn label="Atualizar servico" unelevated class="full-width btn-add-servico" @click="atualizar" />
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
const loading = ref(false)

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
  const delta = clientX - startX

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
  console.log(localStorage.getItem('user'))
  try {
    const { data } = await api.get('/servicos/buscarServicosPorBarbeariaId')

    servicos.value = data.map((item) => ({
      id: item.id,
      nome: item.nome,
      preco: `R$ ${Number(item.preco).toFixed(2).replace('.', ',')}`,
      duracao: `${item.duracao_minutos} min`
    }))
  } catch (error) {
    console.error('Erro ao buscar servicos', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar servicos'
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
      message: 'Servico excluido com sucesso!'
    })

    buscarServicos()
    modalExcluir.value = false
  } catch (error) {
    console.error('Erro ao excluir servico', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao excluir servico'
    })
  }
}

const salvar = async () => {
  try {
    console.log('Salvando servico:', form.value)
    await api.post('/servicos/criarNovoServico', {
      nome: form.value.nome,
      duracao_minutos: form.value.duracao,
      preco: form.value.preco.replace(',', '.')
    })

    $q.notify({
      type: 'positive',
      message: 'Servico cadastrado com sucesso!'
    })
    form.value.nome = ''
    form.value.duracao = null
    form.value.preco = ''

    buscarServicos()
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao salvar servico'
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
      message: 'Servico atualizado com sucesso!'
    })

    modalEditarServico.value = false
    servicoSelecionado.value = null
    buscarServicos()
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao atualizar servico'
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
    radial-gradient(1200px 600px at 10% -20%, rgba(34, 197, 94, 0.1), transparent 60%),
    radial-gradient(900px 500px at 110% 10%, rgba(59, 130, 246, 0.08), transparent 55%),
    linear-gradient(180deg, #0f1115 0%, #0c0d10 100%);
  border-radius: 16px;
}

.servicos-shell {
  width: 100%;
  max-width: 980px;
  margin: 0 auto;
}

.page-header {
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.header-text {
  min-width: 0;
}

.title-gradient {
  background: linear-gradient(90deg, #f8fafc 0%, #94a3b8 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.subtitle-soft {
  letter-spacing: 0.2px;
}

.back-btn {
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
}

.stats-chip {
  background: linear-gradient(140deg, rgba(249, 115, 22, 0.24), rgba(249, 115, 22, 0.1));
  border: 1px solid rgba(251, 146, 60, 0.35);
}

.card-dark {
  background: linear-gradient(180deg, #151923 0%, #10141d 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.form-card {
  overflow: hidden;
}

.section-kicker {
  color: #94a3b8;
  letter-spacing: 0.6px;
}

.input-soft :deep(.q-field__control) {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.ghost-btn {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  background: linear-gradient(90deg, #f97316 0%, #fb923c 100%);
  color: #0f1115;
  font-weight: 700;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.servico-card {
  background: linear-gradient(180deg, rgba(20, 24, 34, 0.95), rgba(14, 18, 27, 0.95));
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  height: auto;
  min-height: 0;
}

.item-hover {
  transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}

.item-hover:hover {
  transform: translateY(-2px);
  border-color: rgba(249, 115, 22, 0.3);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
}

.servico-nome {
  font-weight: 600;
  letter-spacing: 0.2px;
  color: #e2e8f0;
}

.icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: rgba(249, 115, 22, 0.14);
  border: 1px solid rgba(251, 146, 60, 0.26);
}

.meta-chip {
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 500;
}

.meta-chip.price {
  color: #fdba74;
}

.empty-state {
  margin-bottom: 8px;
}

.inter-semibold {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
}

.header-exclusao {
  height: 250px;
  background: linear-gradient(135deg, #c50327a8, #f56363);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0 0 50px 50px;
  font-family: 'Inter', sans-serif;
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
  font-size: 12px;
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

.servico-duracao,
.preco {
  font-size: 18px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
}

.texto-deslize {
  font-size: 14px;
  font-family: 'Inter', sans-serif;
}

.header-content {
  text-align: center;
}

.titulo-exclusao {
  font-size: 22px;
  font-weight: 600;
  line-height: 1.3;
}

.subtitulo-exclusao {
  margin-top: 6px;
  font-size: 14px;
  opacity: 0.85;
}

.btn-add-servico {
  font-size: 0.9rem;
  padding: 15px;
  letter-spacing: 0.4px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-editar-servico {
  width: 100%;
  max-width: 420px;
  background: #121212;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background-color: #000;
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
  letter-spacing: 0.4px;
}

.header-spacer {
  width: 40px;
}

.modal-content {
  padding: 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

@media (max-width: 900px) {
  .service-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .servicos-page {
    width: calc(100% - 20px);
    margin: 0 auto;
    border-radius: 16px;
  }

  .desktop-only {
    display: none;
  }

  .stats-chip {
    font-size: 11px;
    padding: 0 8px;
  }
}
</style>
