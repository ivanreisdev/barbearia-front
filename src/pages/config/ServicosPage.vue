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
              Preencha e Deslize para adicionar
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

          <div class="q-mb-md">
            <div class="text-caption text-grey-5 q-mb-sm">
              Barbeiros que realizam este servico
            </div>

            <div v-if="barbeiros.length" class="barbeiros-grid">
              <q-card v-for="barbeiro in barbeiros" :key="barbeiro.id" flat bordered class="barbeiro-card"
                :class="{ 'barbeiro-card--ativo': form.barbeiros_ids.includes(barbeiro.id) }"
                @click="alternarBarbeiro(barbeiro.id)">
                <div class="row items-center no-wrap q-gutter-sm">
                  <q-avatar size="36px" class="barbeiro-avatar">
                    <img v-if="fotoBarbeiroUrl(barbeiro.foto)" :src="fotoBarbeiroUrl(barbeiro.foto)"
                      :alt="barbeiro.nome">
                    <q-icon v-else name="person" />
                  </q-avatar>

                  <div class="barbeiro-nome ellipsis">
                    {{ barbeiro.nome }}
                  </div>

                  <q-space />

                  <q-checkbox :model-value="form.barbeiros_ids.includes(barbeiro.id)" color="orange-5"
                    @update:model-value="alternarBarbeiro(barbeiro.id)" @click.stop />
                </div>
              </q-card>
            </div>

            <div v-if="!barbeiros.length" class="text-caption text-grey-6 q-mt-xs">
              Nenhum barbeiro cadastrado
            </div>
          </div>

          <!-- <q-btn label="Adicionar servico" unelevated class="full-width btn-add-servico ghost-btn" size="md"
            @click="salvar" /> -->
          <SwipeConfirm ref="swipeRef" class="novo-servico-swipe" label="Deslize para Criar um Novo Serviço"
            hint="Deslize para confirmar" :enabled="!loading" @confirm="onConfirmSalvarServico" />
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
    </div>
    <ModalUpdateServico v-model="modalEditarServicoAberto" :servico="servicoSelecionado" @atualizado="buscarServicos" />

  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar, Loading } from 'quasar'
import { api } from 'boot/axios'
import LoadingLogo from 'components/LoadingLogo.vue'
import SwipeConfirm from 'components/SwipeConfirm.vue'
import ModalUpdateServico from 'components/modais/modalUpdateServico.vue'



import 'src/css/servicos.css'

const $q = useQuasar()
const carregando = ref(true)
const loading = ref(false)
const swipeRef = ref(null)

const servicos = ref([
  {
    id: null,
    nome: '',
    preco: '',
    duracao: ''
  }
])

const barbeiros = ref([])
const servicoSelecionado = ref(null)
const modalExcluir = ref(false)
const modalEditarServicoAberto = ref(false)
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

  modalEditarServicoAberto.value = true
}

const fecharModalExcluir = () => {
  swipeX.value = 0
  servicoSelecionado.value = null
  modalExcluir.value = false
}

const onConfirmSalvarServico = async () => {
  await salvar()
  swipeRef.value?.resetSwipe?.()
}
const buscarServicos = async () => {
  console.log(localStorage.getItem('user'))
  try {
    const { data } = await api.get('/servicos/buscarServicosDoBarbeiroLogado')

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
  preco: '',
  barbeiros_ids: []
})

const apiBaseUrl = import.meta.env.VITE_API_URL || ''

const fotoBarbeiroUrl = (foto) => {
  if (!foto) return null
  if (/^https?:\/\//i.test(foto)) return foto
  const caminho = String(foto).replace(/^\/+/, '')
  return `${apiBaseUrl}/storage/${caminho}`
}

const alternarBarbeiro = (barbeiroId) => {
  const selecionados = [...form.value.barbeiros_ids]
  const index = selecionados.indexOf(barbeiroId)

  if (index >= 0) {
    selecionados.splice(index, 1)
  } else {
    selecionados.push(barbeiroId)
  }

  form.value.barbeiros_ids = selecionados
}

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

const buscarBarbeiros = async () => {
  try {
    const { data } = await api.get('/barbearia/buscarBarbeiros')

    barbeiros.value = data.barbeiros.map((item) => ({
      id: item.id,
      nome: item.nome,
      foto: item.user?.foto || null
    }))
    console.log('barbeiros.value')

    console.log(barbeiros.value)

  } catch (error) {
    console.error('Erro ao buscar Barbeiros', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar Barbeiros'
    })
  }
}

const salvar = async () => {
  const nome = String(form.value.nome || '').trim()
  const duracao = Number(form.value.duracao)
  const preco = String(form.value.preco || '').trim()
  const barbeirosIds = form.value.barbeiros_ids || []

  if (!nome || !duracao || !preco) {
    $q.notify({
      type: 'negative',
      message: 'Todos os campos sao obrigatorios'
    })
    return false
  }

  if (!barbeirosIds.length) {
    $q.notify({
      type: 'negative',
      message: 'Selecione os barbeiros que executarão este serviço'
    })
    return false
  }

  try {
    console.log('Salvando servico:', form.value)
    await api.post('/servicos/criarNovoServico', {
      nome,
      duracao_minutos: duracao,
      preco: preco.replace(',', '.'),
      barbeiros_ids: barbeirosIds
    })

    $q.notify({
      type: 'positive',
      message: 'Servico cadastrado com sucesso!'
    })
    form.value.nome = ''
    form.value.duracao = null
    form.value.preco = ''
    form.value.barbeiros_ids = []

    buscarServicos()
    return true
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao salvar servico'
    })
    return false
  }
}

onMounted(async () => {
  Loading.show({
    spinner: LoadingLogo,
    backgroundColor: '#0c0d10'
  })

  try {
    await buscarServicos()
    await buscarBarbeiros()
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
  background:
    radial-gradient(1200px 600px at 10% -20%, rgba(34, 197, 94, 0.10), transparent 60%),
    radial-gradient(900px 500px at 110% 10%, rgba(59, 130, 246, 0.08), transparent 55%),
    linear-gradient(180deg, #0f1115 0%, #0c0d10 100%);
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

.barbeiros-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 8px;
}

.barbeiro-card {
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
  transition: border-color 140ms ease, background-color 140ms ease, transform 140ms ease;
}

.barbeiro-card:hover {
  transform: translateY(-1px);
  border-color: rgba(251, 146, 60, 0.32);
}

.barbeiro-card--ativo {
  border-color: rgba(251, 146, 60, 0.45);
  background: rgba(249, 115, 22, 0.12);
}

.barbeiro-avatar {
  background: rgba(255, 255, 255, 0.08);
  color: #cbd5e1;
}

.barbeiro-nome {
  max-width: 150px;
  color: #e2e8f0;
  font-size: 0.9rem;
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
  background:
    radial-gradient(1200px 600px at 10% -20%, rgba(48, 122, 76, 0.1), transparent 60%),
    radial-gradient(900px 500px at 110% 10%, rgba(44, 116, 233, 0.08), transparent 55%),
    linear-gradient(180deg, #0f1115 0%, #0c0d10 100%);
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

.novo-servico-swipe {
  margin-bottom: 6px;
}

.novo-servico-swipe :deep(.q-mt-xl) {
  margin-top: 8px;
}

.novo-servico-swipe :deep(.q-mt-md) {
  margin-top: 6px;
}
</style>
