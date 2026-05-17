<template>
    <q-dialog v-model="modal" persistent maximized>
        <q-card class="column no-wrap">
            <!-- HEADER -->
            <q-card-section class="row items-center q-py-sm">
                <div class="text-h6">Ajuste sua imagem</div>
                <q-space />
                <q-btn icon="close" flat round dense @click="fechar" />
            </q-card-section>

            <q-separator />

            <!-- CORPO -->
            <q-card-section class="col q-pa-none flex flex-center">
                <Cropper v-if="src" ref="cropper" :src="src" :stencil-props="{ aspectRatio }" class="cropper-full"
                    @ready="cropperReady = true" />
            </q-card-section>

            <q-separator />

            <!-- AÇÕES -->
            <q-card-actions class="q-pa-md">
                <q-btn flat label="Cancelar" class="full-width q-mb-sm" @click="fechar" />
                <q-btn color="primary" label="Salvar" class="full-width" :disable="!cropperReady"
                    @click="confirmarCrop" />
            </q-card-actions>

        </q-card>
    </q-dialog>
</template>


<script setup>
import { ref, computed } from 'vue'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

const props = defineProps({
    modelValue: Boolean,
    src: String,
    aspectRatio: {
        type: Number,
        default: 1
    }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const cropper = ref(null)
const cropperReady = ref(false)

function fechar() {
    emit('update:modelValue', false)
    cropperReady.value = false
}

const confirmarCrop = () => {
    if (!cropper.value) return

    const { canvas } = cropper.value.getResult()
    if (!canvas) return

    canvas.toBlob((blob) => {
        const arquivoFinal = new File([blob], 'avatar.jpg', {
            type: 'image/jpeg',
            lastModified: Date.now()
        })

        // 🔥 EMITE IGUAL, MAS PRA FORA
        emit('confirm', {
            file: arquivoFinal,
            preview: URL.createObjectURL(blob)
        })

        emit('update:modelValue', false)

        cropperReady.value = false
    }, 'image/jpeg', 0.95)
}
const modal = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
})

</script>

<style scoped>
.cropper-full {
    width: 100%;
    height: 100%;
    max-height: calc(100vh - 160px);
}
</style>
