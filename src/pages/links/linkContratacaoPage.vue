<template>
  <q-page class="q-pa-md q-pa-lg link-contratacao-page">
    <div class="link-shell">
      <q-card class="main-card">
        <q-card-section class="q-pa-lg">
          <div class="header-block q-mb-lg">
            <q-btn flat round icon="arrow_back" class="back-btn absolute-top-left q-ma-md" @click="$router.back()" />

            <div class="text-overline section-kicker">
              Convite de equipe
            </div>

            <div class="text-h5 q-mt-xs title-gradient">
              Link de contratacao
            </div>

            <div class="text-caption text-grey-4 subtitle-soft q-mt-sm">
              Compartilhe o codigo ou o link para novos barbeiros se registrarem direto na sua barbearia, Alguma duvida?
            </div>
            <q-btn flat dense no-caps class="duvida-link q-ml-xs" label="Clique aqui" @click="irParaDuvidas" />

          </div>

          <div class="inputs-wrapper">
            <q-input v-model="codigoVinculacao" dense dark filled readonly label="Codigo de vinculacao"
              class="input-soft q-mb-md">
              <template #prepend>
                <q-icon name="vpn_key" />
              </template>

              <template #append>
                <q-btn flat round dense icon="content_copy" @click="copiarCodigo" />
              </template>
            </q-input>

            <q-input v-model="linkVinculacao" dense dark filled readonly label="Link de vinculacao" class="input-soft">
              <template #prepend>
                <q-icon name="link" />
              </template>

              <template #append>
                <q-btn flat round dense icon="content_copy" @click="copiarLink" />
              </template>
            </q-input>
          </div>

          <div class="text-caption text-grey-5 text-center q-mt-md">
            O link ja inclui automaticamente o codigo de vinculacao.
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar, copyToClipboard } from 'quasar'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'


const $q = useQuasar()
const router = useRouter()

const codigoVinculacao = ref('');

const linkVinculacao = computed(() => {
  const origem = window.location.origin
  return `${origem}/register?codigo=${encodeURIComponent(codigoVinculacao.value)}`
})

const copiarCodigo = async () => {
  try {
    await copyToClipboard(codigoVinculacao.value)

    $q.notify({
      type: 'positive',
      message: 'Codigo copiado com sucesso!'
    })
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Nao foi possivel copiar o codigo.'
    })
  }
}

const copiarLink = async () => {
  try {
    await copyToClipboard(linkVinculacao.value)

    $q.notify({
      type: 'positive',
      message: 'Link copiado com sucesso!'
    })
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Nao foi possivel copiar o link.'
    })
  }
}

const buscarCodigoVinculacao = async () => {
  try {
    const response = await api.get('/barbearia/buscarCodigoVinculacao');
    if (response.data.tipo != 'sucesso') {
      $q.notify({
        type: 'negative',
        message: response.data.msg ?? 'Codigo não encontrado'
      })
    }
    codigoVinculacao.value = response.data?.codigo;
  } catch (error) {
    console.error(error);
    $q.notify({
      type: 'negative',
      message: 'Nao foi possivel Buscar o link.'
    })
  }
}

const irParaDuvidas = () => {
  router.push('/dashboard')
}

onMounted(() => {
  buscarCodigoVinculacao()
})
</script>

<style scoped>
.link-contratacao-page {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f3f4f6;
  font-family: 'Inter', sans-serif;
  background:
    radial-gradient(850px 500px at -10% -20%, rgba(16, 185, 129, 0.13), transparent 60%),
    radial-gradient(900px 520px at 110% 115%, rgba(14, 165, 233, 0.13), transparent 58%),
    linear-gradient(180deg, #0f1115 0%, #0b0d11 100%);
  border-radius: 16px;
}

.link-shell {
  width: 100%;
  max-width: 820px;
  margin: 0 auto;
}

.main-card {
  position: relative;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  background:
    linear-gradient(145deg, rgba(16, 24, 34, 0.88), rgba(12, 17, 24, 0.9)),
    radial-gradient(550px 240px at 15% 0%, rgba(59, 130, 246, 0.16), transparent 70%);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.title-gradient {
  background: linear-gradient(90deg, #f8fafc 0%, #cbd5e1 45%, #93c5fd 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.header-block {
  text-align: center;
}

.subtitle-soft {
  letter-spacing: 0.2px;
  max-width: 560px;
  margin-left: auto;
  margin-right: auto;
}

.back-btn {
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.06);
}

.section-kicker {
  color: #7dd3fc;
  letter-spacing: 0.8px;
  font-weight: 600;
}

.inputs-wrapper {
  width: 100%;
  max-width: 580px;
  margin: 0 auto;
}

.info-box {
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 0.86rem;
  line-height: 1.45;
  color: #dbeafe;
  border: 1px solid rgba(125, 211, 252, 0.22);
  background: rgba(14, 116, 144, 0.12);
}

.duvida-link {
  color: #7dd3fc;
  font-weight: 600;
  min-height: auto;
  padding: 0;
}

.input-soft :deep(.q-field__control) {
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.copy-code-btn {
  border-radius: 10px;
  font-weight: 600;
}

@media (max-width: 600px) {
  .link-contratacao-page {
    width: calc(100% - 20px);
    margin: 0 auto;
    border-radius: 16px;
  }

  .main-card {
    border-radius: 18px;
  }
}
</style>
