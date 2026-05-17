import { Notify } from 'quasar'

const baseOptions = {
    position: 'top',
    timeout: 3000,
}


const notify = (options) => {
    Notify.create({
        ...baseOptions,
        ...options,
    })
}

export const notifySuccess = (message) => {
    notify({
        type: 'positive',
        message,
        icon: 'check_circle',
    })
}

export const notifyError = (message) => {
    notify({
        type: 'negative',
        message,
        icon: 'error',
    })
}

export const notifyWarning = (message) => {
    notify({
        type: 'warning',
        message,
        icon: 'warning',
    })
}

export const notifyInfo = (message) => {
    notify({
        type: 'info',
        message,
        icon: 'info',
    })
}
