// js/app.js
// Entry point da aplicação.
// Responsabilidades:
// - bootstrap do sistema
// - decidir entre login e dashboard
// - conectar UI e serviços
// - coordenar filtros, modais, CRUD e realtime
// - evitar listeners duplicados
// - manter estado de tela e seleção atual

import { AppConfig } from './config.js';

import {
  initAppData,
  login,
  logout,
  resetPassword,
  getCurrentUser,
  getDashboardPayload,
  getDevolucaoById,
  getTimelineEntries,
  createDevolucao,
  updateDevolucao,
  protocolarDevolucao,
  recusarDevolucao,
  finalizarDevolucao,
  desfazerAcao,
  excluirDevolucao,
  gerarRotulo,
  createUser,
  createFilial,
  createGrupo,
  subscribeDevolucoesRealtime,
  subscribeLookupsRealtime,
} from './services.js';

import {
  renderLoginPage,
  renderDashboardPage,
  bindLoginPageEvents,
  bindDashboardEvents,
  setInlineFeedback,
  showToast,
  handleThemeButtonClick,
  readFiltersFromDom,
  clearFiltersDom,
  openForgotPasswordModal,
  openCreateDevolucaoModal,
  openUpdateDevolucaoModal,
  openDetailsModal,
  openAndamentoModal,
  openFinalizarModal,
  openDesfazerModal,
  openExcluirModal,
  openAdminHubModal,
  openCreateUserModal,
  openCreateFilialModal,
  openCreateGrupoModal,
  openLabelPreviewModal,
  openRequiredFieldsModal,
  closeModal,
  printLabelHtml,
  getFormDataObject,
} from './ui.js';

const AppState = {
  initialized: false,
  currentFilters: null,
  selectedDevolucaoId: null,
  formMode: null,
  unsubscribers: {
    devolucoes: null,
    lookups: null,
  },
};

// [Função 1] stopRealtimeListeners
// Responsabilidade: encerrar todas as assinaturas em tempo real ativas antes de reconfigurar a tela.
function stopRealtimeListeners() {
  if (typeof AppState.unsubscribers.devolucoes === 'function') {
    AppState.unsubscribers.devolucoes();
  }

  if (typeof AppState.unsubscribers.lookups === 'function') {
    AppState.unsubscribers.lookups();
  }

  AppState.unsubscribers.devolucoes = null;
  AppState.unsubscribers.lookups = null;
}
// -----------------------

// [Função 2] getSafeCurrentFilters
// Responsabilidade: devolver filtros atuais do app com fallback consistente.
function getSafeCurrentFilters() {
  return AppState.currentFilters || {
    ...AppConfig.filters.defaults,
  };
}
// -----------------------

// [Função 3] refreshDashboard
// Responsabilidade: recalcular payload do dashboard e renderizar a tela principal.
async function refreshDashboard(filters = null) {
  const effectiveFilters = filters || getSafeCurrentFilters();
  const payload = getDashboardPayload(effectiveFilters);

  AppState.currentFilters = payload.filters;
  renderDashboardPage(payload);
  bindDashboardHandlers();

  return payload;
}
// -----------------------

// [Função 4] renderLogin
// Responsabilidade: renderizar a tela de login e conectar seus eventos.
function renderLogin() {
  stopRealtimeListeners();
  AppState.currentFilters = null;
  AppState.selectedDevolucaoId = null;
  AppState.formMode = null;

  renderLoginPage();

  bindLoginPageEvents({
    onSubmit: handleLoginSubmit,
    onForgotPassword: handleForgotPasswordClick,
    onThemeToggle: handleThemeToggle,
  });
}
// -----------------------

// [Função 5] renderDashboard
// Responsabilidade: renderizar o dashboard autenticado e ativar sincronização em tempo real.
async function renderDashboard() {
  await refreshDashboard(AppState.currentFilters);
  startRealtimeListeners();
}
// -----------------------

// [Função 6] startRealtimeListeners
// Responsabilidade: ativar listeners do Realtime Database para manter dashboard sincronizado.
function startRealtimeListeners() {
  stopRealtimeListeners();

  AppState.unsubscribers.devolucoes = subscribeDevolucoesRealtime(async () => {
    if (!getCurrentUser()) return;
    await refreshDashboard(getSafeCurrentFilters());
  });

  AppState.unsubscribers.lookups = subscribeLookupsRealtime(async () => {
    if (!getCurrentUser()) return;
    await refreshDashboard(getSafeCurrentFilters());
  });
}
// -----------------------

// [Função 7] boot
// Responsabilidade: inicializar serviços e escolher a primeira tela da aplicação.
async function boot() {
  try {
    await initAppData();
    AppState.initialized = true;

    const user = getCurrentUser();

    if (user) {
      await renderDashboard();
    } else {
      renderLogin();
    }
  } catch (error) {
    console.error(error);
    renderLogin();
    setInlineFeedback('#login-feedback', error.message || AppConfig.labels.errors.generic, 'error');
  }
}
// -----------------------

// [Função 8] handleThemeToggle
// Responsabilidade: alternar o tema visual da aplicação.
function handleThemeToggle() {
  handleThemeButtonClick();
}
// -----------------------

// [Função 9] handleLoginSubmit
// Responsabilidade: processar o formulário de login e abrir o dashboard em caso de sucesso.
async function handleLoginSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const data = getFormDataObject(form);

  setInlineFeedback('#login-feedback', '', 'info');

  try {
    await login(data.login, data.senha);
    showToast(AppConfig.labels.statusMessages.loginSuccess, 'success');
    await renderDashboard();
  } catch (error) {
    setInlineFeedback('#login-feedback', error.message || AppConfig.labels.errors.invalidCredentials, 'error');
  }
}
// -----------------------

// [Função 10] handleLogout
// Responsabilidade: encerrar a sessão atual e retornar para a tela de login.
function handleLogout() {
  logout();
  showToast(AppConfig.labels.statusMessages.logoutSuccess, 'success');
  renderLogin();
}
// -----------------------

// [Função 11] handleForgotPasswordClick
// Responsabilidade: abrir o modal de redefinição de senha.
function handleForgotPasswordClick() {
  openForgotPasswordModal();
}
// -----------------------

// [Função 12] handleForgotPasswordSubmit
// Responsabilidade: processar a redefinição de senha a partir do modal.
async function handleForgotPasswordSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const data = getFormDataObject(form);

  try {
    await resetPassword(data.login, data.novaSenha, data.confirmarSenha);
    setInlineFeedback('#forgot-password-feedback', AppConfig.labels.statusMessages.passwordResetSuccess, 'success');
    showToast(AppConfig.labels.statusMessages.passwordResetSuccess, 'success');
    window.setTimeout(() => closeModal(), 700);
  } catch (error) {
    setInlineFeedback('#forgot-password-feedback', error.message || AppConfig.labels.errors.generic, 'error');
  }
}
// -----------------------

// [Função 13] bindDashboardHandlers
// Responsabilidade: ligar os eventos principais do dashboard recém-renderizado.
function bindDashboardHandlers() {
  bindDashboardEvents({
    onThemeToggle: handleThemeToggle,
    onLogout: handleLogout,
    onApplyFilters: handleApplyFilters,
    onClearFilters: handleClearFilters,
    onRefresh: handleRefreshClick,
    onInclude: handleIncludeClick,
    onAdmin: handleAdminClick,
    onChangeView: handleViewSwitchClick,
    onListAction: handleListActionClick,
  });
}
// -----------------------

// [Função 14] handleApplyFilters
// Responsabilidade: aplicar filtros atuais lidos do DOM e rerenderizar a lista.
async function handleApplyFilters(event) {
  event.preventDefault();
  const filters = readFiltersFromDom();
  await refreshDashboard(filters);
}
// -----------------------

// [Função 15] handleClearFilters
// Responsabilidade: limpar filtros visuais e recarregar o dashboard com padrões.
async function handleClearFilters() {
  const cleared = clearFiltersDom();
  await refreshDashboard(cleared);
}
// -----------------------

// [Função 16] handleRefreshClick
// Responsabilidade: forçar recálculo e rerenderização do dashboard.
async function handleRefreshClick() {
  await refreshDashboard(getSafeCurrentFilters());
  showToast(AppConfig.labels.statusMessages.refreshSuccess, 'success');
}
// -----------------------

// [Função 17] handleIncludeClick
// Responsabilidade: abrir modal de criação de devolução e marcar modo de formulário.
function handleIncludeClick() {
  AppState.formMode = 'create';
  AppState.selectedDevolucaoId = null;
  openCreateDevolucaoModal();
}
// -----------------------

// [Função 18] handleAdminClick
// Responsabilidade: abrir o hub administrativo.
function handleAdminClick() {
  openAdminHubModal();
}
// -----------------------

// [Função 19] handleViewSwitchClick
// Responsabilidade: alternar entre pendências e histórico a partir dos botões da view.
async function handleViewSwitchClick(event) {
  const button = event.target.closest('[data-view]');
  if (!button) return;

  const nextView = String(button.dataset.view || '');
  if (!nextView) return;

  const filters = {
    ...readFiltersFromDom(),
    view: nextView,
  };

  await refreshDashboard(filters);
}
// -----------------------

// [Função 20] handleListActionClick
// Responsabilidade: tratar ações dos cards da lista usando delegação de eventos.
async function handleListActionClick(event) {
  const button = event.target.closest('[data-action]');
  if (!button) return;

  const action = String(button.dataset.action || '');
  const id = String(button.dataset.id || '');

  if (!action || !id) return;

  AppState.selectedDevolucaoId = id;

  try {
    if (action === 'detalhes') {
      const devolucao = getDevolucaoById(id);
      const timeline = getTimelineEntries(devolucao);
      openDetailsModal(devolucao, timeline);
      return;
    }

    if (action === 'alterar') {
      const devolucao = getDevolucaoById(id);
      AppState.formMode = 'update';
      openUpdateDevolucaoModal(devolucao);
      return;
    }

    if (action === 'andamento') {
      openAndamentoModal();
      return;
    }

    if (action === 'finalizar') {
      openFinalizarModal();
      return;
    }

    if (action === 'desfazer') {
      openDesfazerModal();
      return;
    }

    if (action === 'excluir') {
      openExcluirModal();
      return;
    }

    if (action === 'rotulo') {
      const labelData = gerarRotulo(id);
      openLabelPreviewModal(labelData);
      return;
    }
  } catch (error) {
    showToast(error.message || AppConfig.labels.errors.generic, 'error');
  }
}
// -----------------------

// [Função 21] handleCreateOrUpdateDevolucaoSubmit
// Responsabilidade: decidir entre criação ou atualização da devolução a partir do mesmo formulário visual.
async function handleCreateOrUpdateDevolucaoSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const data = getFormDataObject(form);

  try {
    const requiredLabels = [];

    if (!String(data.fornecedor || '').trim()) requiredLabels.push('Fornecedor');
    if (!String(data.dataEmissao || '').trim()) requiredLabels.push('Data de emissão');
    if (!String(data.numeroNF || '').trim()) requiredLabels.push('Número da NF');
    if (!String(data.motivo || '').trim()) requiredLabels.push('Motivo');

    if (requiredLabels.length) {
      openRequiredFieldsModal(requiredLabels);
      return;
    }

    if (AppState.formMode === 'update' && AppState.selectedDevolucaoId) {
      await updateDevolucao(AppState.selectedDevolucaoId, data);
      showToast(AppConfig.labels.statusMessages.updateSuccess, 'success');
    } else {
      await createDevolucao(data);
      showToast(AppConfig.labels.statusMessages.saveSuccess, 'success');
    }

    closeModal();
    await refreshDashboard(getSafeCurrentFilters());
  } catch (error) {
    const selector = AppState.formMode === 'update'
      ? '#create-devolucao-feedback'
      : '#create-devolucao-feedback';

    setInlineFeedback(selector, error.message || AppConfig.labels.errors.generic, 'error');
  }
}
// -----------------------

// [Função 22] handleAndamentoSubmit
// Responsabilidade: executar protocolar ou recusar conforme ação escolhida no modal.
async function handleAndamentoSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const data = getFormDataObject(form);

  try {
    if (!AppState.selectedDevolucaoId) {
      throw new Error('Nenhuma devolução selecionada.');
    }

    if (data.tipoAcao === 'recusar') {
      await recusarDevolucao(AppState.selectedDevolucaoId, {
        justificativa: data.justificativa,
        observacoes: data.observacoes,
      });
    } else {
      await protocolarDevolucao(AppState.selectedDevolucaoId, {
        protocoloFornecedor: data.protocoloFornecedor,
        observacoes: data.observacoes,
      });
    }

    showToast(AppConfig.labels.statusMessages.updateSuccess, 'success');
    closeModal();
    await refreshDashboard(getSafeCurrentFilters());
  } catch (error) {
    setInlineFeedback('#andamento-feedback', error.message || AppConfig.labels.errors.generic, 'error');
  }
}
// -----------------------

// [Função 23] handleFinalizarSubmit
// Responsabilidade: finalizar a devolução atualmente selecionada.
async function handleFinalizarSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const data = getFormDataObject(form);

  try {
    if (!AppState.selectedDevolucaoId) {
      throw new Error('Nenhuma devolução selecionada.');
    }

    await finalizarDevolucao(AppState.selectedDevolucaoId, {
      observacoes: data.observacoes,
    });

    showToast(AppConfig.labels.statusMessages.updateSuccess, 'success');
    closeModal();
    await refreshDashboard(getSafeCurrentFilters());
  } catch (error) {
    setInlineFeedback('#finalizar-feedback', error.message || AppConfig.labels.errors.generic, 'error');
  }
}
// -----------------------

// [Função 24] handleDesfazerSubmit
// Responsabilidade: desfazer a última ação operacional da devolução selecionada.
async function handleDesfazerSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const data = getFormDataObject(form);

  try {
    if (!AppState.selectedDevolucaoId) {
      throw new Error('Nenhuma devolução selecionada.');
    }

    await desfazerAcao(AppState.selectedDevolucaoId, {
      login: data.login,
      senha: data.senha,
      justificativa: data.justificativa,
      observacoes: data.observacoes,
    });

    showToast(AppConfig.labels.statusMessages.undoSuccess, 'success');
    closeModal();
    await refreshDashboard(getSafeCurrentFilters());
  } catch (error) {
    setInlineFeedback('#desfazer-feedback', error.message || AppConfig.labels.errors.generic, 'error');
  }
}
// -----------------------

// [Função 25] handleExcluirSubmit
// Responsabilidade: excluir logicamente a devolução selecionada após confirmação.
async function handleExcluirSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const data = getFormDataObject(form);

  try {
    if (!AppState.selectedDevolucaoId) {
      throw new Error('Nenhuma devolução selecionada.');
    }

    await excluirDevolucao(AppState.selectedDevolucaoId, {
      login: data.login,
      senha: data.senha,
      justificativa: data.justificativa,
    });

    showToast(AppConfig.labels.statusMessages.deleteSuccess, 'success');
    closeModal();
    await refreshDashboard(getSafeCurrentFilters());
  } catch (error) {
    setInlineFeedback('#excluir-feedback', error.message || AppConfig.labels.errors.generic, 'error');
  }
}
// -----------------------

// [Função 26] handleAdminHubClick
// Responsabilidade: abrir o modal administrativo específico conforme card clicado.
function handleAdminHubClick(event) {
  const button = event.target.closest('[data-admin-action]');
  if (!button) return;

  const action = String(button.dataset.adminAction || '');

  const payload = getDashboardPayload(getSafeCurrentFilters());

  if (action === 'create-user') {
    openCreateUserModal({
      filiais: payload.lookups.filiais,
      grupos: payload.lookups.grupos,
    });
    return;
  }

  if (action === 'create-filial') {
    openCreateFilialModal();
    return;
  }

  if (action === 'create-grupo') {
    openCreateGrupoModal({
      filiais: payload.lookups.filiais,
    });
  }
}
// -----------------------

// [Função 27] handleCreateUserSubmit
// Responsabilidade: cadastrar um novo usuário via modal administrativo.
async function handleCreateUserSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const data = getFormDataObject(form);

  try {
    await createUser(data);
    showToast(AppConfig.labels.statusMessages.saveSuccess, 'success');
    closeModal();
    await refreshDashboard(getSafeCurrentFilters());
  } catch (error) {
    setInlineFeedback('#create-user-feedback', error.message || AppConfig.labels.errors.generic, 'error');
  }
}
// -----------------------

// [Função 28] handleCreateFilialSubmit
// Responsabilidade: cadastrar uma nova filial via modal administrativo.
async function handleCreateFilialSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const data = getFormDataObject(form);

  try {
    await createFilial(data);
    showToast(AppConfig.labels.statusMessages.saveSuccess, 'success');
    closeModal();
    await refreshDashboard(getSafeCurrentFilters());
  } catch (error) {
    setInlineFeedback('#create-filial-feedback', error.message || AppConfig.labels.errors.generic, 'error');
  }
}
// -----------------------

// [Função 29] handleCreateGrupoSubmit
// Responsabilidade: cadastrar um novo grupo de filiais via modal administrativo.
async function handleCreateGrupoSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const data = getFormDataObject(form);

  try {
    const filialIds = Array.isArray(data.filialIds)
      ? data.filialIds
      : data.filialIds
      ? [data.filialIds]
      : [];

    await createGrupo({
      nome: data.nome,
      filialIds,
    });

    showToast(AppConfig.labels.statusMessages.saveSuccess, 'success');
    closeModal();
    await refreshDashboard(getSafeCurrentFilters());
  } catch (error) {
    setInlineFeedback('#create-grupo-feedback', error.message || AppConfig.labels.errors.generic, 'error');
  }
}
// -----------------------

// [Função 30] handlePrintLabelClick
// Responsabilidade: imprimir o rótulo da devolução atualmente selecionada.
function handlePrintLabelClick() {
  try {
    if (!AppState.selectedDevolucaoId) {
      throw new Error('Nenhuma devolução selecionada.');
    }

    const labelData = gerarRotulo(AppState.selectedDevolucaoId);
    printLabelHtml(labelData);
  } catch (error) {
    showToast(error.message || AppConfig.labels.errors.generic, 'error');
  }
}
// -----------------------

// [Função 31] bindGlobalDelegatedEvents
// Responsabilidade: registrar delegação global para formulários e botões criados dinamicamente.
function bindGlobalDelegatedEvents() {
  document.addEventListener('submit', async (event) => {
    const form = event.target;

    if (!(form instanceof HTMLFormElement)) return;

    if (form.matches('#forgot-password-form')) {
      await handleForgotPasswordSubmit(event);
      return;
    }

    if (form.matches('#create-devolucao-form')) {
      await handleCreateOrUpdateDevolucaoSubmit(event);
      return;
    }

    if (form.matches('#andamento-form')) {
      await handleAndamentoSubmit(event);
      return;
    }

    if (form.matches('#finalizar-form')) {
      await handleFinalizarSubmit(event);
      return;
    }

    if (form.matches('#desfazer-form')) {
      await handleDesfazerSubmit(event);
      return;
    }

    if (form.matches('#excluir-form')) {
      await handleExcluirSubmit(event);
      return;
    }

    if (form.matches('#create-user-form')) {
      await handleCreateUserSubmit(event);
      return;
    }

    if (form.matches('#create-filial-form')) {
      await handleCreateFilialSubmit(event);
      return;
    }

    if (form.matches('#create-grupo-form')) {
      await handleCreateGrupoSubmit(event);
    }
  });

  document.addEventListener('click', (event) => {
    const adminAction = event.target.closest('[data-admin-action]');
    if (adminAction) {
      handleAdminHubClick(event);
      return;
    }

    const printButton = event.target.closest('#print-label-btn');
    if (printButton) {
      handlePrintLabelClick();
    }
  });
}
// -----------------------

// [Função 32] protectPageUnload
// Responsabilidade: encerrar listeners ao sair da página para reduzir resíduos de assinatura.
function protectPageUnload() {
  window.addEventListener('beforeunload', () => {
    stopRealtimeListeners();
  });
}
// -----------------------

// [Função 33] startApplication
// Responsabilidade: iniciar o app uma única vez e registrar listeners globais.
function startApplication() {
  if (AppState.initialized) return;

  bindGlobalDelegatedEvents();
  protectPageUnload();
  boot();
}
// -----------------------

startApplication();
