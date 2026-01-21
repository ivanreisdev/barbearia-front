<!-- Cabeçalho -->
<template>
  <q-page class="q-pa-lg bg-dark">

    <!-- Header -->
    <div class="row items-center q-mb-md">
      <q-btn flat round icon="arrow_back" @click="$router.back()" />
    </div>

    <div class="text-h6 text-white q-mb-xs text-center">
      Serviços
    </div>

    <div class="text-caption text-grey-5 q-mb-lg text-center">
      Cadastre e edite os serviços fornecidos pela empresa
    </div>

    <!-- INSERIR NOVO SERVIÇO -->
    <div class="text-caption text-grey-6 q-mb-sm">
      INSERIR UM NOVO SERVIÇO
    </div>
    <q-card class="q-mb-xl novo-servico-card">
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
        <q-btn label="ADICIONAR À LISTA" unelevated class="full-width btn-add-servico" size="md" @click="salvar" />

      </q-card-section>
    </q-card>
 
    <div class="text-caption text-grey-6 q-mb-sm">
      LISTA DE SERVIÇOS
    </div>

    <q-list class="servicos-list">

      <q-item v-for="servico in servicos" :key="servico.id" clickable class="servico-card q-mb-sm">

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
              @click.stop="editarServico(servico)" />
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
            <div class="row items-center justify-center q-gutter-md info-servico">
              <span class="chip-info servico-duracao">
                {{ servicoSelecionado?.duracao }}
              </span>

              <span class="chip-info preco">
                {{ servicoSelecionado?.preco }}
              </span>
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
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import 'src/css/servicos.css'
import { useRouter } from 'vue-router'
const router = useRouter()
const $q = useQuasar()

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


const fecharModalExcluir = () => {
  swipeX.value = 0
  servicoSelecionado.value = null
  modalExcluir.value = false
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

const editarServico = (servico) => {
  // Lógica para editar o serviço
  router.push({
    name: 'servicos-update',
    params: {
      servicoId: servico.id
    }
  })

}

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
onMounted(() => {
  buscarServicos()
})
</script>
<style scoped>
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
  font-size: 0.30rem;
  padding: 15px;
  /* 12px */
  letter-spacing: 0.5px;
}
</style>
