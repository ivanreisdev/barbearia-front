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

        <!-- Botão salvar -->
        <div class="row justify-end q-mt-xl">
            <q-btn color="primary" icon="save" label="Salvar Configurações" @click="salvarConfiguracoes" />
        </div>

    </q-page>
</template>

<script setup>
import BotaoVoltar from 'components/BotaoVoltar.vue'
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const $q = useQuasar()

// Dias da semana dinâmicos
const diasSemana = ref([])

// Informações da barbearia
const barbearia = ref({
    nome: '',
    telefone: '',
    endereco: '',
    id: null,
})

// Labels e mapeamento fixo
const labels = [
    { key: 'domingo', label: 'Domingo', dia_semana: 1 },
    { key: 'segunda', label: 'Segunda-feira', dia_semana: 2 },
    { key: 'terca', label: 'Terça-feira', dia_semana: 3 },
    { key: 'quarta', label: 'Quarta-feira', dia_semana: 4 },
    { key: 'quinta', label: 'Quinta-feira', dia_semana: 5 },
    { key: 'sexta', label: 'Sexta-feira', dia_semana: 6 },
    { key: 'sabado', label: 'Sábado', dia_semana: 7 }
]

// --- Função de salvar
const salvarConfiguracoes = async () => {
    try {
        const horarios = diasSemana.value.map(dia => ({
            dia_semana: dia.dia_semana,
            ativo: dia.ativo ? 1 : 0,
            inicio: dia.inicio + ':00',
            almoco_inicio: dia.almocoInicio ? dia.almocoInicio + ':00' : null,
            almoco_fim: dia.almocoFim ? dia.almocoFim + ':00' : null,
            fim: dia.fim + ':00'
        }))

        const payload = {
            horarios,
            dadosBarbearia: {
                nome: barbearia.value.nome,
                telefone: barbearia.value.telefone,
                endereco: barbearia.value.endereco,
                id: barbearia.value.id
            }
        }


        const response = await api.post('/horarios-atendimento/atualizarHorariosDeFuncionamento', payload)

        $q.notify({
            type: 'positive',
            message: 'Configurações salvas com sucesso!',
            position: 'top',
            icon: 'check_circle',
            timeout: 2500
        })

        console.log('Resposta da API:', response.data)
    } catch (error) {
        console.error('Erro ao salvar configurações:', error)
        $q.notify({
            type: 'negative',
            message: 'Erro ao salvar configurações',
            position: 'top',
            icon: 'error',
            timeout: 3000
        })
    }
}

// --- Buscar horários da API e gerar diasSemana dinamicamente
const buscarHorarios = async () => {
    try {
        const response = await api.get('/horarios-atendimento/buscarHorariosAtendimentos')
        const dados = response.data

        // Cria um map para garantir que só exista um registro por dia_semana
        const diasMap = {}
        dados.forEach(item => {
            diasMap[item.dia_semana] = item
        })

        // Monta o array diasSemana seguindo a ordem fixa de labels
        diasSemana.value = labels.map(l => {
            const item = diasMap[l.dia_semana] || {}
            return {
                key: l.key,
                label: l.label,
                dia_semana: l.dia_semana,
                ativo: item.ativo === 1 || false,
                inicio: item.inicio ? item.inicio.slice(0, 5) : '09:00',
                almocoInicio: item.almoco_inicio ? item.almoco_inicio.slice(0, 5) : '',
                almocoFim: item.almoco_fim ? item.almoco_fim.slice(0, 5) : '',
                fim: item.fim ? item.fim.slice(0, 5) : '18:00'
            }
        })

        console.log('Dias da semana carregados da API:', diasSemana.value)
    } catch (error) {
        console.error('Erro ao buscar horários:', error)
        $q.notify({ type: 'negative', message: 'Erro ao carregar horários da barbearia' })
    }
}

// --- Buscar informações da barbearia
const buscarBarbearia = async () => {
    try {
        const res = await api.get('/barbearia/info') // ajuste sua rota
        const dados = res.data
        console.log('Dados da barbearia:', dados)
        barbearia.value.nome = dados.barbearia.nome || ''
        barbearia.value.telefone = dados.barbearia.telefone || ''
        barbearia.value.endereco = dados.barbearia.endereco || ''
        barbearia.value.id = dados.barbearia.id || null
    } catch (e) {
        console.warn('Erro ao buscar informações da barbearia', e)
        $q.notify({ type: 'negative', message: 'Erro ao carregar informações da barbearia' })
    }
}

// --- Executar ao montar
onMounted(() => {
    buscarHorarios()
    buscarBarbearia()
})
</script>




<style scoped></style>
