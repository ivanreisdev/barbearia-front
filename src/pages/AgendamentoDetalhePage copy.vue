<q-dialog v-model="modalCancelar" maximized persistent>
      <div class="agendamento-wrapper">
        <!-- HEADER -->
        <div class="header-agendamento">
          <q-btn
            icon="arrow_back"
            flat
            round
            color="white"
            class="absolute-top-left q-ma-md"
            @click="modalAberto = false"
          />

          <div class="header-content">
            <div class="text-h5 text-weight-medium">Novo agendamento</div>
            <div class="text-caption opacity-8">
              Preencha todos os campos para realizar um novo agendamento.
            </div>
          </div>
        </div>

        <!-- CARD -->
        <q-card class="card-form">
          <q-card-section class="q-gutter-md">
            <q-input v-model="novoAgendamento.cliente" rounded filled label="Nome do cliente" />

            <q-input
              v-model="novoAgendamento.telefone"
              rounded
              filled
              label="Telefone"
              mask="(##) #####-####"
            />
            <q-input
              v-model="novoAgendamento.email"
              rounded
              filled
              label="E-mail do cliente"
              type="email"
            />

            <q-select
              v-model="novoAgendamento.servico"
              :options="servicos"
              option-label="nome"
              option-value="id"
              emit-value
              map-options
              rounded
              filled
              label="Selecione um serviço"
              @update:model-value="atualizarPreco"
            />

            <q-input v-model="novoAgendamento.data" type="date" rounded filled label="Data" />

            <div class="row q-col-gutter-sm">
              <div class="col">
                <q-select
      v-model="novoAgendamento.hora"
      :options="horariosPadrao"
      option-label="label"
      option-value="value"
      emit-value
      map-options
      rounded
      filled
      label="Horário"
      :disable="!novoAgendamento.data"
      :placeholder="novoAgendamento.data ? 'Selecione um horário' : 'Selecione a data primeiro'"
    />
              </div>

              <div class="col-auto">
                <q-chip color="positive" text-color="white" class="q-mt-sm"> Livre </q-chip>
              </div>
            </div>

            <q-toggle
              v-model="novoAgendamento.repetir"
              label="Repetir este agendamento"
              color="primary"
            />
          </q-card-section>

          <!-- BOTÃO -->
          <q-card-actions class="q-pa-md">
            <q-btn
              label="AGENDAR"
              class="btn-agendar full-width"
              unelevated
              @click="salvarAgendamento"
            />
          </q-card-actions>
        </q-card>
      </div>
    </q-dialog>
