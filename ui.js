// js/ui.js
// Camada visual do sistema.
// Este arquivo concentra:
// - renderização de login e dashboard
// - componentes visuais reutilizáveis
// - leitura de filtros do DOM
// - toasts e feedback
// - timeline visual
// - modais acessíveis
// Não acessa Firebase diretamente.
// Não contém regra de negócio crítica.
// Não deve importar app.js.

import {
  AppConfig,
  applyTheme,
  getAppIdentity,
  getCurrentThemeName,
  getDefaultFilters,
  getPhaseLabel,
  getPhaseMeta,
  getProfileLabel,
  toggleTheme,
} from './config.js';

const UIState = {
  dashboardPayload: null,
  modalOpen: null,
  modalLastFocusedElement: null,
};

// [Função 1] escapeHtml
// Responsabilidade: escapar HTML para evitar quebra visual e inserção indevida em conteúdo textual.
function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
// -----------------------

// [Função 2] formatDate
// Responsabilidade: formatar uma data simples no padrão brasileiro.
function formatDate(dateValue) {
  if (!dateValue) return '-';

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return String(dateValue);

  return new Intl.DateTimeFormat(AppConfig.app.locale, {
    dateStyle: 'short',
  }).format(date);
}
// -----------------------

// [Função 3] formatDateTime
// Responsabilidade: formatar data e hora no padrão brasileiro.
function formatDateTime(dateValue) {
  if (!dateValue) return '-';

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return String(dateValue);

  return new Intl.DateTimeFormat(AppConfig.app.locale, {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}
// -----------------------

// [Função 4] getEl
// Responsabilidade: obter elemento do DOM e opcionalmente falhar com erro legível se não existir.
function getEl(selector, required = true) {
  const element = document.querySelector(selector);

  if (!element && required) {
    throw new Error(`Elemento obrigatório não encontrado: ${selector}`);
  }

  return element;
}
// -----------------------

// [Função 5] setHtml
// Responsabilidade: atualizar o conteúdo HTML de um elemento do DOM.
function setHtml(selector, html) {
  const element = getEl(selector);
  element.innerHTML = html;
  return element;
}
// -----------------------

// [Função 6] buildBrandMark
// Responsabilidade: montar o bloco visual de marca do sistema.
function buildBrandMark() {
  const identity = getAppIdentity();

  return `
    <div class="brand-mark">
      <div class="brand-mark__logo">${escapeHtml(identity.logoText)}</div>
      <div class="brand-mark__texts">
        <div class="brand-mark__name">${escapeHtml(identity.name)}</div>
        <div class="brand-mark__subtitle">${escapeHtml(identity.subtitle)}</div>
      </div>
    </div>
  `;
}
// -----------------------

// [Função 7] buildThemeToggleButton
// Responsabilidade: montar o botão visual de alternância de tema.
function buildThemeToggleButton() {
  const themeName = getCurrentThemeName();
  const icon = themeName === 'dark' ? AppConfig.icons.themeLight : AppConfig.icons.themeDark;

  return `
    <button
      type="button"
      class="theme-toggle-btn"
      id="theme-toggle-btn"
      aria-label="${escapeHtml(AppConfig.labels.buttons.trocarTema)}"
      title="${escapeHtml(AppConfig.labels.buttons.trocarTema)}"
    >
      <span class="theme-toggle-btn__icon">${escapeHtml(icon)}</span>
      <span class="theme-toggle-btn__label">${escapeHtml(AppConfig.labels.buttons.trocarTema)}</span>
    </button>
  `;
}
// -----------------------

// [Função 8] buildLoginCard
// Responsabilidade: montar o card principal da tela de login com aparência profissional.
function buildLoginCard() {
  return `
    <section class="login-shell__card card-panel card-panel--glass">
      <div class="login-shell__card-top">
        ${buildBrandMark()}
        ${buildThemeToggleButton()}
      </div>

      <div class="login-shell__hero">
        <div class="login-shell__badge">${escapeHtml(AppConfig.icons.login)}</div>
        <div>
          <h1 class="page-title">${escapeHtml(AppConfig.labels.loginTitle)}</h1>
          <p class="page-subtitle">${escapeHtml(AppConfig.labels.loginSubtitle)}</p>
        </div>
      </div>

      <form id="login-form" class="form-grid form-grid--single" novalidate>
        <label class="field">
          <span class="field__label">Login</span>
          <div class="field__control">
            <span class="field__icon">${escapeHtml(AppConfig.icons.user)}</span>
            <input
              id="login"
              name="login"
              class="input"
              type="text"
              autocomplete="username"
              placeholder="${escapeHtml(AppConfig.labels.placeholders.login)}"
            />
          </div>
        </label>

        <label class="field">
          <span class="field__label">Senha</span>
          <div class="field__control">
            <span class="field__icon">${escapeHtml(AppConfig.icons.password)}</span>
            <input
              id="senha"
              name="senha"
              class="input"
              type="password"
              autocomplete="current-password"
              placeholder="${escapeHtml(AppConfig.labels.placeholders.senha)}"
            />
          </div>
        </label>

        <div id="login-feedback" class="inline-feedback" aria-live="polite"></div>

        <div class="login-shell__actions">
          <button type="submit" class="btn btn--primary btn--large">
            ${escapeHtml(AppConfig.labels.buttons.entrar)}
          </button>

          <button
            type="button"
            class="btn btn--ghost btn--large"
            id="forgot-password-btn"
          >
            ${escapeHtml(AppConfig.labels.buttons.forgotPassword)}
          </button>
        </div>

        <div class="login-shell__hint">
          <div class="hint-pill">Admin: admin / admin</div>
          <div class="hint-pill">Observador: observador / observador</div>
        </div>
      </form>
    </section>
  `;
}
// -----------------------

// [Função 9] renderLoginPage
// Responsabilidade: renderizar a tela de login dentro do container principal da página.
export function renderLoginPage() {
  applyTheme(getCurrentThemeName());

  const container = getEl('#page-root');

  container.innerHTML = `
    <div class="login-shell">
      <div class="login-shell__background"></div>
      <div class="login-shell__content">
        ${buildLoginCard()}
      </div>
    </div>
  `;
}
// -----------------------

// [Função 10] setInlineFeedback
// Responsabilidade: exibir feedback textual em uma região dinâmica da página.
export function setInlineFeedback(selector, message = '', type = 'info') {
  const element = getEl(selector);
  const safeMessage = escapeHtml(message);

  if (!safeMessage) {
    element.className = 'inline-feedback';
    element.innerHTML = '';
    return;
  }

  element.className = `inline-feedback inline-feedback--${escapeHtml(type)}`;
  element.innerHTML = `
    <span class="inline-feedback__icon">${escapeHtml(
      type === 'error'
        ? AppConfig.icons.error
        : type === 'success'
        ? AppConfig.icons.success
        : AppConfig.icons.info
    )}</span>
    <span>${safeMessage}</span>
  `;
}
// -----------------------

// [Função 11] buildTopbar
// Responsabilidade: montar o cabeçalho superior do dashboard.
function buildTopbar(payload) {
  const user = payload.currentUser;

  return `
    <header class="topbar">
      <div class="topbar__left">
        ${buildBrandMark()}
      </div>

      <div class="topbar__center">
        <div class="page-head">
          <h1 class="page-title">${escapeHtml(AppConfig.labels.dashboardTitle)}</h1>
          <p class="page-subtitle">${escapeHtml(AppConfig.labels.dashboardSubtitle)}</p>
        </div>
      </div>

      <div class="topbar__right">
        ${buildThemeToggleButton()}
        <div class="user-chip">
          <div class="user-chip__avatar">${escapeHtml((user.nome || 'U').slice(0, 2).toUpperCase())}</div>
          <div class="user-chip__meta">
            <div class="user-chip__name">${escapeHtml(user.nome || '-')}</div>
            <div class="user-chip__role">${escapeHtml(user.perfilLabel || getProfileLabel(user.perfil))}</div>
          </div>
        </div>
        <button class="btn btn--danger" type="button" id="logout-btn">
          ${escapeHtml(AppConfig.labels.buttons.sair)}
        </button>
      </div>
    </header>
  `;
}
// -----------------------

// [Função 12] buildMetricCard
// Responsabilidade: montar um card de métrica com estilo de KPI administrativo.
function buildMetricCard(title, value, accentClass = 'metric-card--blue') {
  return `
    <article class="metric-card ${escapeHtml(accentClass)}">
      <div class="metric-card__title">${escapeHtml(title)}</div>
      <div class="metric-card__value">${escapeHtml(value)}</div>
    </article>
  `;
}
// -----------------------

// [Função 13] buildMetricsSection
// Responsabilidade: montar a grade de cards principais do dashboard.
function buildMetricsSection(payload) {
  const metrics = payload.metrics;

  return `
    <section class="content-block">
      <div class="content-block__header">
        <h2 class="content-block__title">Resumo operacional</h2>
        <p class="content-block__subtitle">Visão consolidada conforme filtros e permissões do perfil.</p>
      </div>

      <div class="metrics-grid">
        ${buildMetricCard(AppConfig.labels.cards.pendentes, metrics.pendentes, 'metric-card--blue')}
        ${buildMetricCard(AppConfig.labels.cards.registradas, metrics.registradas, 'metric-card--orange')}
        ${buildMetricCard(AppConfig.labels.cards.protocoladas, metrics.protocoladas, 'metric-card--green')}
        ${buildMetricCard(AppConfig.labels.cards.finalizadas, metrics.finalizadas, 'metric-card--red')}
        ${buildMetricCard(AppConfig.labels.cards.totalMes, metrics.totalMes, 'metric-card--neutral')}
      </div>
    </section>
  `;
}
// -----------------------

// [Função 14] buildFiltersSection
// Responsabilidade: montar a barra de filtros e pesquisa do dashboard.
function buildFiltersSection(payload) {
  const filters = payload.filters;
  const filiaisOptions = payload.lookups.filiais
    .map((filial) => {
      const selected = String(filters.filialId) === String(filial.id) ? 'selected' : '';
      return `<option value="${escapeHtml(filial.id)}" ${selected}>${escapeHtml(filial.numero)} - ${escapeHtml(filial.nome)}</option>`;
    })
    .join('');

  const gruposOptions = payload.lookups.grupos
    .map((grupo) => {
      const selected = String(filters.grupoId) === String(grupo.id) ? 'selected' : '';
      return `<option value="${escapeHtml(grupo.id)}" ${selected}>${escapeHtml(grupo.nome)}</option>`;
    })
    .join('');

  const fasesOptions = payload.lookups.fases
    .map((fase) => {
      const selected = String(filters.fase) === String(fase.value) ? 'selected' : '';
      return `<option value="${escapeHtml(fase.value)}" ${selected}>${escapeHtml(fase.label)}</option>`;
    })
    .join('');

  const ordenacaoOptions = payload.lookups.ordenacoes
    .map((item) => {
      const selected = String(filters.ordenacao) === String(item.value) ? 'selected' : '';
      return `<option value="${escapeHtml(item.value)}" ${selected}>${escapeHtml(item.label)}</option>`;
    })
    .join('');

  return `
    <section class="content-block">
      <div class="content-block__header">
        <h2 class="content-block__title">${escapeHtml(AppConfig.labels.sections.filtros)}</h2>
        <p class="content-block__subtitle">Período, grupo, filial, fase, pesquisa e ordenação.</p>
      </div>

      <form id="filters-form" class="filters-grid">
        <label class="field">
          <span class="field__label">Data inicial</span>
          <input type="date" class="input" name="dataInicial" value="${escapeHtml(filters.dataInicial || '')}" />
        </label>

        <label class="field">
          <span class="field__label">Data final</span>
          <input type="date" class="input" name="dataFinal" value="${escapeHtml(filters.dataFinal || '')}" />
        </label>

        <label class="field">
          <span class="field__label">Grupo de filiais</span>
          <select class="input" name="grupoId">
            <option value="">Todos os grupos</option>
            ${gruposOptions}
          </select>
        </label>

        <label class="field">
          <span class="field__label">Filial</span>
          <select class="input" name="filialId">
            <option value="">Todas as filiais</option>
            ${filiaisOptions}
          </select>
        </label>

        <label class="field">
          <span class="field__label">Fase</span>
          <select class="input" name="fase">
            <option value="">Todas as fases</option>
            ${fasesOptions}
          </select>
        </label>

        <label class="field">
          <span class="field__label">Ordenação</span>
          <select class="input" name="ordenacao">
            ${ordenacaoOptions}
          </select>
        </label>

        <label class="field field--search">
          <span class="field__label">Pesquisa</span>
          <div class="field__control">
            <span class="field__icon">${escapeHtml(AppConfig.icons.search)}</span>
            <input
              type="search"
              class="input"
              name="pesquisa"
              maxlength="${escapeHtml(AppConfig.ui.maxSearchLength)}"
              value="${escapeHtml(filters.pesquisa || '')}"
              placeholder="${escapeHtml(AppConfig.labels.placeholders.pesquisa)}"
            />
          </div>
        </label>

        <div class="filters-grid__actions">
          <button type="submit" class="btn btn--primary" id="apply-filters-btn">
            ${escapeHtml(AppConfig.labels.buttons.filtrar)}
          </button>
          <button type="button" class="btn btn--ghost" id="clear-filters-btn">
            ${escapeHtml(AppConfig.labels.buttons.limparFiltros)}
          </button>
          <button type="button" class="btn btn--ghost" id="refresh-btn">
            ${escapeHtml(AppConfig.labels.buttons.atualizar)}
          </button>
        </div>
      </form>
    </section>
  `;
}
// -----------------------

// [Função 15] buildActionToolbar
// Responsabilidade: montar a barra superior de ações do sistema conforme permissões do usuário.
function buildActionToolbar(payload) {
  const perms = payload.currentUser ? payload.currentUser : {};
  const canCreate = payload.currentUser?.perfil === AppConfig.profiles.loja;
  const canManage = payload.currentUser?.perfil === AppConfig.profiles.admin;

  return `
    <section class="action-toolbar">
      <div class="action-toolbar__left">
        ${canCreate ? `
          <button type="button" class="btn btn--primary" id="include-devolucao-btn">
            ${escapeHtml(AppConfig.labels.buttons.incluir)}
          </button>
        ` : ''}

        ${canManage ? `
          <button type="button" class="btn btn--ghost" id="admin-btn">
            ${escapeHtml(AppConfig.labels.buttons.admin)}
          </button>
        ` : ''}
      </div>

      <div class="action-toolbar__right">
        <div class="view-switch" id="view-switch">
          <button
            type="button"
            class="view-switch__btn ${payload.filters.view === AppConfig.views.pendencias ? 'is-active' : ''}"
            data-view="${escapeHtml(AppConfig.views.pendencias)}"
          >
            Pendências
          </button>
          <button
            type="button"
            class="view-switch__btn ${payload.filters.view === AppConfig.views.historico ? 'is-active' : ''}"
            data-view="${escapeHtml(AppConfig.views.historico)}"
          >
            Histórico
          </button>
        </div>
      </div>
    </section>
  `;
}
// -----------------------

// [Função 16] buildEmptyState
// Responsabilidade: montar estado visual vazio para listas sem resultado.
function buildEmptyState(message = AppConfig.labels.statusMessages.empty) {
  return `
    <div class="empty-state">
      <div class="empty-state__icon">${escapeHtml(AppConfig.icons.info)}</div>
      <div class="empty-state__title">Sem resultados</div>
      <div class="empty-state__text">${escapeHtml(message)}</div>
    </div>
  `;
}
// -----------------------

// [Função 17] buildDevolucaoActionButtons
// Responsabilidade: montar botões permitidos para cada item da lista.
function buildDevolucaoActionButtons(devolucao) {
  const permissions = devolucao.permissions || {};
  const buttons = [];

  buttons.push(`
    <button type="button" class="btn btn--soft" data-action="detalhes" data-id="${escapeHtml(devolucao.id)}">
      ${escapeHtml(AppConfig.labels.buttons.detalhes)}
    </button>
  `);

  if (permissions.canUpdate) {
    buttons.push(`
      <button type="button" class="btn btn--soft" data-action="alterar" data-id="${escapeHtml(devolucao.id)}">
        ${escapeHtml(AppConfig.labels.buttons.alterar)}
      </button>
    `);
  }

  if (permissions.canProtocolar || permissions.canRecusar) {
    buttons.push(`
      <button type="button" class="btn btn--warning" data-action="andamento" data-id="${escapeHtml(devolucao.id)}">
        ${escapeHtml(AppConfig.labels.buttons.andamento)}
      </button>
    `);
  }

  if (permissions.canFinalizar) {
    buttons.push(`
      <button type="button" class="btn btn--success" data-action="finalizar" data-id="${escapeHtml(devolucao.id)}">
        ${escapeHtml(AppConfig.labels.buttons.finalizar)}
      </button>
    `);
  }

  if (permissions.canDesfazer) {
    buttons.push(`
      <button type="button" class="btn btn--ghost" data-action="desfazer" data-id="${escapeHtml(devolucao.id)}">
        ${escapeHtml(AppConfig.labels.buttons.desfazer)}
      </button>
    `);
  }

  if (permissions.canExcluir) {
    buttons.push(`
      <button type="button" class="btn btn--danger" data-action="excluir" data-id="${escapeHtml(devolucao.id)}">
        ${escapeHtml(AppConfig.labels.buttons.excluir)}
      </button>
    `);
  }

  buttons.push(`
    <button type="button" class="btn btn--ghost" data-action="rotulo" data-id="${escapeHtml(devolucao.id)}">
      ${escapeHtml(AppConfig.labels.buttons.rotulo)}
    </button>
  `);

  return `<div class="devolucao-card__actions">${buttons.join('')}</div>`;
}
// -----------------------

// [Função 18] buildDevolucaoCard
// Responsabilidade: montar um card resumido de devolução com destaque visual da filial.
function buildDevolucaoCard(devolucao) {
  const phaseMeta = getPhaseMeta(devolucao.fase);

  return `
    <article class="devolucao-card" data-devolucao-id="${escapeHtml(devolucao.id)}">
      <div class="devolucao-card__left">
        <div class="filial-badge">
          <div class="filial-badge__number">${escapeHtml(devolucao.filial?.numero || '--')}</div>
          <div class="filial-badge__label">Filial</div>
        </div>
      </div>

      <div class="devolucao-card__content">
        <div class="devolucao-card__top">
          <div>
            <div class="devolucao-card__id">${escapeHtml(devolucao.identificacao || '-')}</div>
            <div class="devolucao-card__title">${escapeHtml(devolucao.fornecedor || '-')}</div>
          </div>

          <div class="phase-chip" style="--phase-accent:${escapeHtml(phaseMeta.color)};">
            <span class="phase-chip__emoji">${escapeHtml(phaseMeta.emoji)}</span>
            <span>${escapeHtml(phaseMeta.label)}</span>
          </div>
        </div>

        <div class="devolucao-card__meta">
          <span><strong>NF:</strong> ${escapeHtml(devolucao.numeroNF || '-')}</span>
          <span><strong>Motivo:</strong> ${escapeHtml(devolucao.motivo || '-')}</span>
        </div>

        <div class="devolucao-card__meta">
          <span><strong>Filial:</strong> ${escapeHtml(devolucao.filial?.numero || '-')} - ${escapeHtml(devolucao.filial?.nome || '-')}</span>
          <span><strong>Grupo:</strong> ${escapeHtml(devolucao.grupo?.nome || '-')}</span>
        </div>

        <div class="devolucao-card__meta">
          <span><strong>Registro:</strong> ${escapeHtml(formatDateTime(devolucao.criadoEm))}</span>
          <span><strong>Emissão:</strong> ${escapeHtml(formatDate(devolucao.dataEmissao))}</span>
        </div>

        ${buildDevolucaoActionButtons(devolucao)}
      </div>
    </article>
  `;
}
// -----------------------

// [Função 19] buildListSection
// Responsabilidade: montar a lista principal de devoluções do dashboard.
function buildListSection(payload) {
  const items = payload.devolucoes || [];
  const viewLabel = payload.filters.view === AppConfig.views.historico ? 'Histórico' : 'Pendências';

  return `
    <section class="content-block content-block--grow">
      <div class="content-block__header">
        <div>
          <h2 class="content-block__title">${escapeHtml(viewLabel)}</h2>
          <p class="content-block__subtitle">${escapeHtml(items.length)} registro(s) encontrados.</p>
        </div>
      </div>

      <div class="devolucoes-list" id="devolucoes-list">
        ${items.length ? items.map(buildDevolucaoCard).join('') : buildEmptyState()}
      </div>
    </section>
  `;
}
// -----------------------

// [Função 20] buildDashboardPage
// Responsabilidade: montar o HTML completo da tela principal do dashboard.
function buildDashboardPage(payload) {
  return `
    <div class="dashboard-shell">
      ${buildTopbar(payload)}

      <main class="dashboard-main">
        <div class="dashboard-grid">
          ${buildMetricsSection(payload)}
          ${buildActionToolbar(payload)}
          ${buildFiltersSection(payload)}
          ${buildListSection(payload)}
        </div>
      </main>
    </div>
  `;
}
// -----------------------

// [Função 21] renderDashboardPage
// Responsabilidade: renderizar o dashboard principal com base no payload já calculado.
export function renderDashboardPage(payload) {
  UIState.dashboardPayload = payload;
  applyTheme(getCurrentThemeName());

  const container = getEl('#page-root');
  container.innerHTML = buildDashboardPage(payload);
}
// -----------------------

// [Função 22] readFiltersFromDom
// Responsabilidade: ler os filtros atuais preenchidos na interface.
export function readFiltersFromDom() {
  const form = getEl('#filters-form', false);

  if (!form) {
    return getDefaultFilters();
  }

  const data = new FormData(form);

  return {
    dataInicial: String(data.get('dataInicial') || ''),
    dataFinal: String(data.get('dataFinal') || ''),
    grupoId: String(data.get('grupoId') || ''),
    filialId: String(data.get('filialId') || ''),
    fase: String(data.get('fase') || ''),
    pesquisa: String(data.get('pesquisa') || ''),
    ordenacao: String(data.get('ordenacao') || AppConfig.sortOptions.filial),
    view: UIState.dashboardPayload?.filters?.view || AppConfig.views.pendencias,
  };
}
// -----------------------

// [Função 23] clearFiltersDom
// Responsabilidade: limpar os campos visuais de filtro e retornar os padrões.
export function clearFiltersDom() {
  const form = getEl('#filters-form', false);
  const defaults = getDefaultFilters();

  if (!form) return defaults;

  form.reset();

  const searchInput = form.querySelector('[name="pesquisa"]');
  if (searchInput) searchInput.value = '';

  return {
    ...defaults,
    view: UIState.dashboardPayload?.filters?.view || defaults.view,
  };
}
// -----------------------

// [Função 24] buildTimelineItem
// Responsabilidade: montar um item visual da timeline com metadados completos.
function buildTimelineItem(entry) {
  return `
    <article class="timeline-item">
      <div class="timeline-item__dot"></div>
      <div class="timeline-item__content">
        <div class="timeline-item__top">
          <div class="timeline-item__label">${escapeHtml(entry.label || entry.tipo || '-')}</div>
          <div class="timeline-item__time">${escapeHtml(formatDateTime(entry.dataHora))}</div>
        </div>
        <div class="timeline-item__meta">
          <span>${escapeHtml(entry.usuarioNome || '-')}</span>
          <span>${escapeHtml(getProfileLabel(entry.usuarioPerfil || ''))}</span>
        </div>
        <div class="timeline-item__details">${escapeHtml(entry.detalhes || '-')}</div>
        ${entry.observacoes ? `<div class="timeline-item__note"><strong>Observações:</strong> ${escapeHtml(entry.observacoes)}</div>` : ''}
        ${entry.justificativa ? `<div class="timeline-item__note"><strong>Justificativa:</strong> ${escapeHtml(entry.justificativa)}</div>` : ''}
      </div>
    </article>
  `;
}
// -----------------------

// [Função 25] buildTimelineSection
// Responsabilidade: montar o bloco visual da timeline dentro dos detalhes da devolução.
function buildTimelineSection(timelineEntries = []) {
  return `
    <section class="details-panel">
      <div class="details-panel__header">
        <h3 class="details-panel__title">${escapeHtml(AppConfig.labels.sections.timeline)}</h3>
      </div>
      <div class="timeline-list">
        ${timelineEntries.length ? timelineEntries.map(buildTimelineItem).join('') : buildEmptyState('Sem eventos de timeline.')}
      </div>
    </section>
  `;
}
// -----------------------

// [Função 26] createModalShell
// Responsabilidade: criar o contêiner estrutural e acessível de um modal.
function createModalShell({ modalId, title, bodyHtml, footerHtml = '', size = 'lg' }) {
  return `
    <div class="modal-backdrop" data-modal-backdrop>
      <section
        class="modal modal--${escapeHtml(size)}"
        role="dialog"
        aria-modal="true"
        aria-labelledby="${escapeHtml(modalId)}-title"
        tabindex="-1"
        data-modal-root
      >
        <header class="modal__header">
          <div>
            <h2 class="modal__title" id="${escapeHtml(modalId)}-title">${escapeHtml(title)}</h2>
          </div>
          <button type="button" class="modal__close" data-modal-close aria-label="Fechar modal">×</button>
        </header>

        <div class="modal__body">
          ${bodyHtml}
        </div>

        ${footerHtml ? `<footer class="modal__footer">${footerHtml}</footer>` : ''}
      </section>
    </div>
  `;
}
// -----------------------

// [Função 27] getModalRoot
// Responsabilidade: obter ou criar o nó raiz onde os modais serão renderizados.
function getModalRoot() {
  let root = document.querySelector('#modal-root');

  if (!root) {
    root = document.createElement('div');
    root.id = 'modal-root';
    document.body.appendChild(root);
  }

  return root;
}
// -----------------------

// [Função 28] getToastRoot
// Responsabilidade: obter ou criar o nó raiz para notificações rápidas.
function getToastRoot() {
  let root = document.querySelector('#toast-root');

  if (!root) {
    root = document.createElement('div');
    root.id = 'toast-root';
    root.className = 'toast-root';
    root.setAttribute('aria-live', 'polite');
    root.setAttribute('aria-atomic', 'true');
    document.body.appendChild(root);
  }

  return root;
}
// -----------------------

// [Função 29] getFocusableElements
// Responsabilidade: localizar elementos focáveis dentro do modal para controlar navegação por teclado.
function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => !element.hasAttribute('disabled'));
}
// -----------------------

// [Função 30] trapModalFocus
// Responsabilidade: manter o foco preso dentro do modal enquanto ele estiver aberto.
function trapModalFocus(modalElement) {
  const focusable = getFocusableElements(modalElement);

  if (!focusable.length) {
    modalElement.focus();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  modalElement.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  first.focus();
}
// -----------------------

// [Função 31] openModal
// Responsabilidade: abrir um modal acessível, registrando foco anterior e armando fechamento básico.
export function openModal({ modalId, title, bodyHtml, footerHtml = '', size = 'lg' }) {
  UIState.modalLastFocusedElement = document.activeElement;

  const root = getModalRoot();
  root.innerHTML = createModalShell({ modalId, title, bodyHtml, footerHtml, size });

  const modal = root.querySelector('[data-modal-root]');
  UIState.modalOpen = modalId;

  root.querySelector('[data-modal-backdrop]')?.addEventListener('click', (event) => {
    if (event.target?.hasAttribute('data-modal-backdrop')) {
      closeModal();
    }
  });

  root.querySelectorAll('[data-modal-close]').forEach((button) => {
    button.addEventListener('click', () => closeModal());
  });

  document.addEventListener('keydown', handleModalEscape, { once: true });
  trapModalFocus(modal);

  return modal;
}
// -----------------------

// [Função 32] handleModalEscape
// Responsabilidade: fechar modal atual ao pressionar ESC.
function handleModalEscape(event) {
  if (event.key === 'Escape') {
    closeModal();
  }
}
// -----------------------

// [Função 33] closeModal
// Responsabilidade: fechar o modal atual e restaurar o foco para o elemento anterior.
export function closeModal() {
  const root = getModalRoot();
  root.innerHTML = '';
  UIState.modalOpen = null;

  if (UIState.modalLastFocusedElement && typeof UIState.modalLastFocusedElement.focus === 'function') {
    UIState.modalLastFocusedElement.focus();
  }
}
// -----------------------

// [Função 34] buildFieldMissingList
// Responsabilidade: montar uma lista visual de campos obrigatórios ausentes.
function buildFieldMissingList(missingFields = []) {
  return `
    <ul class="missing-list">
      ${missingFields.map((field) => `<li>${escapeHtml(field)}</li>`).join('')}
    </ul>
  `;
}
// -----------------------

// [Função 35] openRequiredFieldsModal
// Responsabilidade: abrir modal de aviso com os campos obrigatórios faltantes.
export function openRequiredFieldsModal(missingFields = []) {
  openModal({
    modalId: 'required-fields-modal',
    title: 'Campos obrigatórios pendentes',
    bodyHtml: `
      <p class="modal-copy">Preencha os campos abaixo antes de continuar:</p>
      ${buildFieldMissingList(missingFields)}
    `,
    footerHtml: `
      <button type="button" class="btn btn--primary" data-modal-close>
        ${escapeHtml(AppConfig.labels.buttons.fechar)}
      </button>
    `,
    size: 'sm',
  });
}
// -----------------------

// [Função 36] openForgotPasswordModal
// Responsabilidade: abrir o modal de redefinição simples de senha.
export function openForgotPasswordModal() {
  const bodyHtml = `
    <form id="forgot-password-form" class="form-grid form-grid--single">
      <label class="field">
        <span class="field__label">Usuário</span>
        <input class="input" name="login" type="text" />
      </label>

      <label class="field">
        <span class="field__label">Nova senha</span>
        <input class="input" name="novaSenha" type="password" />
      </label>

      <label class="field">
        <span class="field__label">Confirmar nova senha</span>
        <input class="input" name="confirmarSenha" type="password" />
      </label>

      <div id="forgot-password-feedback" class="inline-feedback" aria-live="polite"></div>
    </form>
  `;

  const footerHtml = `
    <button type="button" class="btn btn--ghost" data-modal-close>${escapeHtml(AppConfig.labels.buttons.cancelar)}</button>
    <button type="submit" class="btn btn--primary" form="forgot-password-form">${escapeHtml(AppConfig.labels.buttons.salvar)}</button>
  `;

  return openModal({
    modalId: 'forgot-password-modal',
    title: 'Esqueci minha senha',
    bodyHtml,
    footerHtml,
    size: 'sm',
  });
}
// -----------------------

// [Função 37] openCreateDevolucaoModal
// Responsabilidade: abrir o modal de inclusão de devolução com todos os campos exigidos.
export function openCreateDevolucaoModal(initialData = {}) {
  const bodyHtml = `
    <form id="create-devolucao-form" class="form-grid form-grid--double">
      <label class="field">
        <span class="field__label">Fornecedor *</span>
        <input class="input" name="fornecedor" type="text" value="${escapeHtml(initialData.fornecedor || '')}" />
      </label>

      <label class="field">
        <span class="field__label">Data de emissão *</span>
        <input class="input" name="dataEmissao" type="date" value="${escapeHtml(initialData.dataEmissao || '')}" />
      </label>

      <label class="field">
        <span class="field__label">Número da NF *</span>
        <input class="input" name="numeroNF" type="text" value="${escapeHtml(initialData.numeroNF || '')}" />
      </label>

      <label class="field">
        <span class="field__label">Motivo *</span>
        <input class="input" name="motivo" type="text" value="${escapeHtml(initialData.motivo || '')}" />
      </label>

      <label class="field field--full">
        <span class="field__label">Produtos</span>
        <textarea class="input input--textarea" name="produtos" rows="${escapeHtml(AppConfig.ui.productsTextareaRows)}">${escapeHtml(initialData.produtos || '')}</textarea>
      </label>

      <label class="field field--full">
        <span class="field__label">Observações</span>
        <textarea class="input input--textarea" name="observacoes" rows="5">${escapeHtml(initialData.observacoes || '')}</textarea>
      </label>

      <div id="create-devolucao-feedback" class="inline-feedback field--full" aria-live="polite"></div>
    </form>
  `;

  const footerHtml = `
    <button type="button" class="btn btn--ghost" data-modal-close>${escapeHtml(AppConfig.labels.buttons.cancelar)}</button>
    <button type="submit" class="btn btn--primary" form="create-devolucao-form">${escapeHtml(AppConfig.labels.buttons.salvar)}</button>
  `;

  return openModal({
    modalId: 'create-devolucao-modal',
    title: 'Incluir devolução',
    bodyHtml,
    footerHtml,
    size: 'xl',
  });
}
// -----------------------

// [Função 38] openUpdateDevolucaoModal
// Responsabilidade: abrir modal de alteração de dados de uma devolução existente.
export function openUpdateDevolucaoModal(devolucao) {
  return openCreateDevolucaoModal(devolucao);
}
// -----------------------

// [Função 39] buildDetailsSummary
// Responsabilidade: montar o painel resumido de detalhes principais da devolução.
function buildDetailsSummary(devolucao) {
  return `
    <section class="details-panel">
      <div class="details-grid">
        <div class="details-kv"><span>Identificação</span><strong>${escapeHtml(devolucao.identificacao || '-')}</strong></div>
        <div class="details-kv"><span>Filial</span><strong>${escapeHtml(devolucao.filial?.numero || '-')} - ${escapeHtml(devolucao.filial?.nome || '-')}</strong></div>
        <div class="details-kv"><span>Fornecedor</span><strong>${escapeHtml(devolucao.fornecedor || '-')}</strong></div>
        <div class="details-kv"><span>NF</span><strong>${escapeHtml(devolucao.numeroNF || '-')}</strong></div>
        <div class="details-kv"><span>Fase</span><strong>${escapeHtml(devolucao.phaseLabel || getPhaseLabel(devolucao.fase))}</strong></div>
        <div class="details-kv"><span>Emissão</span><strong>${escapeHtml(formatDate(devolucao.dataEmissao))}</strong></div>
      </div>

      <div class="details-text-block">
        <h4>Motivo</h4>
        <p>${escapeHtml(devolucao.motivo || '-')}</p>
      </div>

      <div class="details-text-block">
        <h4>Produtos</h4>
        <pre>${escapeHtml(devolucao.produtos || '-')}</pre>
      </div>

      <div class="details-text-block">
        <h4>Observações</h4>
        <p>${escapeHtml(devolucao.observacoes || '-')}</p>
      </div>
    </section>
  `;
}
// -----------------------

// [Função 40] openDetailsModal
// Responsabilidade: abrir modal grande com detalhes completos e timeline.
export function openDetailsModal(devolucao, timelineEntries = []) {
  const bodyHtml = `
    <div class="details-modal-layout">
      ${buildDetailsSummary(devolucao)}
      ${buildTimelineSection(timelineEntries)}
    </div>
  `;

  const footerHtml = `
    <button type="button" class="btn btn--ghost" data-modal-close>${escapeHtml(AppConfig.labels.buttons.fechar)}</button>
  `;

  return openModal({
    modalId: 'details-modal',
    title: AppConfig.labels.sections.detalhes,
    bodyHtml,
    footerHtml,
    size: 'xl',
  });
}
// -----------------------

// [Função 41] openAndamentoModal
// Responsabilidade: abrir modal para protocolar ou recusar uma devolução.
export function openAndamentoModal() {
  const bodyHtml = `
    <form id="andamento-form" class="form-grid form-grid--single">
      <label class="field">
        <span class="field__label">Ação</span>
        <select class="input" name="tipoAcao">
          <option value="protocolar">Protocolado junto ao fornecedor</option>
          <option value="recusar">Recusado pelo compras</option>
        </select>
      </label>

      <label class="field" data-protocolo-field>
        <span class="field__label">Protocolo do fornecedor</span>
        <input class="input" name="protocoloFornecedor" type="text" />
      </label>

      <label class="field" data-justificativa-field>
        <span class="field__label">Justificativa</span>
        <textarea class="input input--textarea" name="justificativa" rows="4"></textarea>
      </label>

      <label class="field">
        <span class="field__label">Observações</span>
        <textarea class="input input--textarea" name="observacoes" rows="4"></textarea>
      </label>

      <div id="andamento-feedback" class="inline-feedback" aria-live="polite"></div>
    </form>
  `;

  const footerHtml = `
    <button type="button" class="btn btn--ghost" data-modal-close>${escapeHtml(AppConfig.labels.buttons.cancelar)}</button>
    <button type="submit" class="btn btn--primary" form="andamento-form">${escapeHtml(AppConfig.labels.buttons.confirmar)}</button>
  `;

  const modal = openModal({
    modalId: 'andamento-modal',
    title: 'Dar andamento',
    bodyHtml,
    footerHtml,
    size: 'md',
  });

  const form = modal.querySelector('#andamento-form');
  const actionSelect = form.querySelector('[name="tipoAcao"]');
  const protocoloField = form.querySelector('[data-protocolo-field]');
  const justificativaField = form.querySelector('[data-justificativa-field]');

  const sync = () => {
    const mode = actionSelect.value;
    protocoloField.style.display = mode === 'protocolar' ? '' : 'none';
    justificativaField.style.display = mode === 'recusar' ? '' : 'none';
  };

  actionSelect.addEventListener('change', sync);
  sync();

  return modal;
}
// -----------------------

// [Função 42] openFinalizarModal
// Responsabilidade: abrir modal para confirmação da finalização da devolução.
export function openFinalizarModal() {
  const bodyHtml = `
    <form id="finalizar-form" class="form-grid form-grid--single">
      <label class="field">
        <span class="field__label">Observações</span>
        <textarea class="input input--textarea" name="observacoes" rows="4"></textarea>
      </label>

      <div id="finalizar-feedback" class="inline-feedback" aria-live="polite"></div>
    </form>
  `;

  const footerHtml = `
    <button type="button" class="btn btn--ghost" data-modal-close>${escapeHtml(AppConfig.labels.buttons.cancelar)}</button>
    <button type="submit" class="btn btn--success" form="finalizar-form">${escapeHtml(AppConfig.labels.buttons.finalizar)}</button>
  `;

  return openModal({
    modalId: 'finalizar-modal',
    title: 'Finalizar devolução',
    bodyHtml,
    footerHtml,
    size: 'sm',
  });
}
// -----------------------

// [Função 43] openDesfazerModal
// Responsabilidade: abrir modal para desfazer ação com credenciais e justificativa.
export function openDesfazerModal() {
  const bodyHtml = `
    <form id="desfazer-form" class="form-grid form-grid--single">
      <label class="field">
        <span class="field__label">Usuário</span>
        <input class="input" name="login" type="text" />
      </label>

      <label class="field">
        <span class="field__label">Senha</span>
        <input class="input" name="senha" type="password" />
      </label>

      <label class="field">
        <span class="field__label">Justificativa</span>
        <textarea class="input input--textarea" name="justificativa" rows="4"></textarea>
      </label>

      <label class="field">
        <span class="field__label">Observações</span>
        <textarea class="input input--textarea" name="observacoes" rows="3"></textarea>
      </label>

      <div id="desfazer-feedback" class="inline-feedback" aria-live="polite"></div>
    </form>
  `;

  const footerHtml = `
    <button type="button" class="btn btn--ghost" data-modal-close>${escapeHtml(AppConfig.labels.buttons.cancelar)}</button>
    <button type="submit" class="btn btn--warning" form="desfazer-form">${escapeHtml(AppConfig.labels.buttons.confirmar)}</button>
  `;

  return openModal({
    modalId: 'desfazer-modal',
    title: 'Desfazer ação',
    bodyHtml,
    footerHtml,
    size: 'md',
  });
}
// -----------------------

// [Função 44] openExcluirModal
// Responsabilidade: abrir modal de exclusão com credenciais e aviso forte.
export function openExcluirModal() {
  const bodyHtml = `
    <div class="danger-box">
      <div class="danger-box__title">Atenção</div>
      <div class="danger-box__text">Esta exclusão deve parecer definitiva para o usuário e não há volta operacional visível.</div>
    </div>

    <form id="excluir-form" class="form-grid form-grid--single">
      <label class="field">
        <span class="field__label">Usuário</span>
        <input class="input" name="login" type="text" />
      </label>

      <label class="field">
        <span class="field__label">Senha</span>
        <input class="input" name="senha" type="password" />
      </label>

      <label class="field">
        <span class="field__label">Justificativa</span>
        <textarea class="input input--textarea" name="justificativa" rows="4"></textarea>
      </label>

      <div id="excluir-feedback" class="inline-feedback" aria-live="polite"></div>
    </form>
  `;

  const footerHtml = `
    <button type="button" class="btn btn--ghost" data-modal-close>${escapeHtml(AppConfig.labels.buttons.cancelar)}</button>
    <button type="submit" class="btn btn--danger" form="excluir-form">${escapeHtml(AppConfig.labels.buttons.excluir)}</button>
  `;

  return openModal({
    modalId: 'excluir-modal',
    title: 'Excluir devolução',
    bodyHtml,
    footerHtml,
    size: 'md',
  });
}
// -----------------------

// [Função 45] openAdminHubModal
// Responsabilidade: abrir o hub de administração com atalhos para usuários, filiais e grupos.
export function openAdminHubModal() {
  const bodyHtml = `
    <div class="admin-hub">
      <button type="button" class="admin-hub__card" data-admin-action="create-user">
        <span class="admin-hub__icon">${escapeHtml(AppConfig.icons.user)}</span>
        <span>Criar usuário</span>
      </button>

      <button type="button" class="admin-hub__card" data-admin-action="create-filial">
        <span class="admin-hub__icon">${escapeHtml(AppConfig.icons.add)}</span>
        <span>Cadastrar filial</span>
      </button>

      <button type="button" class="admin-hub__card" data-admin-action="create-grupo">
        <span class="admin-hub__icon">${escapeHtml(AppConfig.icons.admin)}</span>
        <span>Criar grupo</span>
      </button>
    </div>
  `;

  const footerHtml = `
    <button type="button" class="btn btn--ghost" data-modal-close>${escapeHtml(AppConfig.labels.buttons.fechar)}</button>
  `;

  return openModal({
    modalId: 'admin-hub-modal',
    title: AppConfig.labels.sections.administracao,
    bodyHtml,
    footerHtml,
    size: 'md',
  });
}
// -----------------------

// [Função 46] openCreateUserModal
// Responsabilidade: abrir modal administrativo para cadastro de usuário.
export function openCreateUserModal({ filiais = [], grupos = [] } = {}) {
  const filiaisOptions = filiais
    .map((filial) => `<option value="${escapeHtml(filial.id)}">${escapeHtml(filial.numero)} - ${escapeHtml(filial.nome)}</option>`)
    .join('');

  const gruposOptions = grupos
    .map((grupo) => `<option value="${escapeHtml(grupo.id)}">${escapeHtml(grupo.nome)}</option>`)
    .join('');

  const bodyHtml = `
    <form id="create-user-form" class="form-grid form-grid--double">
      <label class="field">
        <span class="field__label">Nome *</span>
        <input class="input" name="nome" type="text" />
      </label>

      <label class="field">
        <span class="field__label">Login *</span>
        <input class="input" name="login" type="text" />
      </label>

      <label class="field">
        <span class="field__label">Senha *</span>
        <input class="input" name="senha" type="text" />
      </label>

      <label class="field">
        <span class="field__label">Perfil *</span>
        <select class="input" name="perfil">
          <option value="loja">Loja</option>
          <option value="compras">Compras</option>
          <option value="admin">Administrador</option>
          <option value="observador">Observador</option>
        </select>
      </label>

      <label class="field">
        <span class="field__label">Filial vinculada</span>
        <select class="input" name="filialId">
          <option value="">Nenhuma</option>
          ${filiaisOptions}
        </select>
      </label>

      <label class="field">
        <span class="field__label">Grupo vinculado</span>
        <select class="input" name="grupoId">
          <option value="">Nenhum</option>
          ${gruposOptions}
        </select>
      </label>

      <div id="create-user-feedback" class="inline-feedback field--full" aria-live="polite"></div>
    </form>
  `;

  const footerHtml = `
    <button type="button" class="btn btn--ghost" data-modal-close>${escapeHtml(AppConfig.labels.buttons.cancelar)}</button>
    <button type="submit" class="btn btn--primary" form="create-user-form">${escapeHtml(AppConfig.labels.buttons.salvar)}</button>
  `;

  return openModal({
    modalId: 'create-user-modal',
    title: 'Criar usuário',
    bodyHtml,
    footerHtml,
    size: 'lg',
  });
}
// -----------------------

// [Função 47] openCreateFilialModal
// Responsabilidade: abrir modal administrativo para cadastro de filial.
export function openCreateFilialModal() {
  const bodyHtml = `
    <form id="create-filial-form" class="form-grid form-grid--single">
      <label class="field">
        <span class="field__label">Número da filial *</span>
        <input class="input" name="numero" type="text" />
      </label>

      <label class="field">
        <span class="field__label">Nome da filial *</span>
        <input class="input" name="nome" type="text" />
      </label>

      <div id="create-filial-feedback" class="inline-feedback" aria-live="polite"></div>
    </form>
  `;

  const footerHtml = `
    <button type="button" class="btn btn--ghost" data-modal-close>${escapeHtml(AppConfig.labels.buttons.cancelar)}</button>
    <button type="submit" class="btn btn--primary" form="create-filial-form">${escapeHtml(AppConfig.labels.buttons.salvar)}</button>
  `;

  return openModal({
    modalId: 'create-filial-modal',
    title: 'Cadastrar filial',
    bodyHtml,
    footerHtml,
    size: 'sm',
  });
}
// -----------------------

// [Função 48] openCreateGrupoModal
// Responsabilidade: abrir modal administrativo para criação de grupo de filiais.
export function openCreateGrupoModal({ filiais = [] } = {}) {
  const filialCheckboxes = filiais
    .map((filial) => `
      <label class="checkbox-card">
        <input type="checkbox" name="filialIds" value="${escapeHtml(filial.id)}" />
        <span>${escapeHtml(filial.numero)} - ${escapeHtml(filial.nome)}</span>
      </label>
    `)
    .join('');

  const bodyHtml = `
    <form id="create-grupo-form" class="form-grid form-grid--single">
      <label class="field">
        <span class="field__label">Nome do grupo *</span>
        <input class="input" name="nome" type="text" />
      </label>

      <div class="field">
        <span class="field__label">Filiais do grupo *</span>
        <div class="checkbox-grid">${filialCheckboxes}</div>
      </div>

      <div id="create-grupo-feedback" class="inline-feedback" aria-live="polite"></div>
    </form>
  `;

  const footerHtml = `
    <button type="button" class="btn btn--ghost" data-modal-close>${escapeHtml(AppConfig.labels.buttons.cancelar)}</button>
    <button type="submit" class="btn btn--primary" form="create-grupo-form">${escapeHtml(AppConfig.labels.buttons.salvar)}</button>
  `;

  return openModal({
    modalId: 'create-grupo-modal',
    title: 'Criar grupo de filiais',
    bodyHtml,
    footerHtml,
    size: 'lg',
  });
}
// -----------------------

// [Função 49] openLabelPreviewModal
// Responsabilidade: abrir modal com a pré-visualização do rótulo para impressão.
export function openLabelPreviewModal(labelData) {
  const bodyHtml = `
    <div class="label-preview">
      ${labelData.html}
    </div>
  `;

  const footerHtml = `
    <button type="button" class="btn btn--ghost" data-modal-close>${escapeHtml(AppConfig.labels.buttons.fechar)}</button>
    <button type="button" class="btn btn--primary" id="print-label-btn">${escapeHtml(AppConfig.labels.buttons.imprimir)}</button>
  `;

  return openModal({
    modalId: 'label-preview-modal',
    title: 'Pré-visualização do rótulo',
    bodyHtml,
    footerHtml,
    size: 'xl',
  });
}
// -----------------------

// [Função 50] printLabelHtml
// Responsabilidade: abrir uma janela de impressão com o HTML do rótulo gerado.
export function printLabelHtml(labelData) {
  const printWindow = window.open('', '_blank', 'width=900,height=700');

  if (!printWindow) {
    throw new Error('Não foi possível abrir a janela de impressão.');
  }

  printWindow.document.write(`
    <html lang="pt-BR">
      <head>
        <title>${escapeHtml(labelData.title || AppConfig.app.printTitle)}</title>
        <meta charset="UTF-8" />
        <style>
          body { margin: 0; padding: 24px; background: #ffffff; }
        </style>
      </head>
      <body>
        ${labelData.html}
        <script>
          window.onload = function () {
            window.print();
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
}
// -----------------------

// [Função 51] showToast
// Responsabilidade: exibir notificação rápida visual e acessível ao usuário.
export function showToast(message, type = 'info') {
  const root = getToastRoot();
  const toast = document.createElement('div');

  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <span class="toast__icon">${escapeHtml(
      type === 'success'
        ? AppConfig.icons.success
        : type === 'error'
        ? AppConfig.icons.error
        : type === 'warning'
        ? AppConfig.icons.warning
        : AppConfig.icons.info
    )}</span>
    <span class="toast__text">${escapeHtml(message)}</span>
  `;

  root.appendChild(toast);

  window.setTimeout(() => {
    toast.classList.add('is-leaving');
    window.setTimeout(() => toast.remove(), 220);
  }, AppConfig.ui.toastDuration);
}
// -----------------------

// [Função 52] handleThemeButtonClick
// Responsabilidade: alternar o tema e atualizar imediatamente os rótulos do botão.
export function handleThemeButtonClick() {
  toggleTheme();

  document.querySelectorAll('#theme-toggle-btn').forEach((button) => {
    const iconNode = button.querySelector('.theme-toggle-btn__icon');
    if (iconNode) {
      iconNode.textContent = getCurrentThemeName() === 'dark'
        ? AppConfig.icons.themeLight
        : AppConfig.icons.themeDark;
    }
  });
}
// -----------------------

// [Função 53] getFormDataObject
// Responsabilidade: extrair os dados de um formulário como objeto plano.
export function getFormDataObject(formElement) {
  const formData = new FormData(formElement);
  const plainObject = {};

  for (const [key, value] of formData.entries()) {
    if (plainObject[key]) {
      if (!Array.isArray(plainObject[key])) {
        plainObject[key] = [plainObject[key]];
      }
      plainObject[key].push(value);
    } else {
      plainObject[key] = value;
    }
  }

  return plainObject;
}
// -----------------------

// [Função 54] bindLoginPageEvents
// Responsabilidade: conectar os eventos da tela de login sem duplicar responsabilidade.
export function bindLoginPageEvents({ onSubmit, onForgotPassword, onThemeToggle }) {
  const loginForm = getEl('#login-form', false);
  const forgotPasswordBtn = getEl('#forgot-password-btn', false);
  const themeBtn = getEl('#theme-toggle-btn', false);

  if (loginForm && typeof onSubmit === 'function') {
    loginForm.addEventListener('submit', onSubmit);
  }

  if (forgotPasswordBtn && typeof onForgotPassword === 'function') {
    forgotPasswordBtn.addEventListener('click', onForgotPassword);
  }

  if (themeBtn && typeof onThemeToggle === 'function') {
    themeBtn.addEventListener('click', onThemeToggle);
  }
}
// -----------------------

// [Função 55] bindDashboardEvents
// Responsabilidade: conectar eventos do dashboard em um único ponto controlado.
export function bindDashboardEvents(handlers = {}) {
  const themeBtn = getEl('#theme-toggle-btn', false);
  const logoutBtn = getEl('#logout-btn', false);
  const filtersForm = getEl('#filters-form', false);
  const clearFiltersBtn = getEl('#clear-filters-btn', false);
  const refreshBtn = getEl('#refresh-btn', false);
  const includeBtn = getEl('#include-devolucao-btn', false);
  const adminBtn = getEl('#admin-btn', false);
  const viewSwitch = getEl('#view-switch', false);
  const listRoot = getEl('#devolucoes-list', false);

  if (themeBtn && typeof handlers.onThemeToggle === 'function') {
    themeBtn.addEventListener('click', handlers.onThemeToggle);
  }

  if (logoutBtn && typeof handlers.onLogout === 'function') {
    logoutBtn.addEventListener('click', handlers.onLogout);
  }

  if (filtersForm && typeof handlers.onApplyFilters === 'function') {
    filtersForm.addEventListener('submit', handlers.onApplyFilters);
  }

  if (clearFiltersBtn && typeof handlers.onClearFilters === 'function') {
    clearFiltersBtn.addEventListener('click', handlers.onClearFilters);
  }

  if (refreshBtn && typeof handlers.onRefresh === 'function') {
    refreshBtn.addEventListener('click', handlers.onRefresh);
  }

  if (includeBtn && typeof handlers.onInclude === 'function') {
    includeBtn.addEventListener('click', handlers.onInclude);
  }

  if (adminBtn && typeof handlers.onAdmin === 'function') {
    adminBtn.addEventListener('click', handlers.onAdmin);
  }

  if (viewSwitch && typeof handlers.onChangeView === 'function') {
    viewSwitch.addEventListener('click', handlers.onChangeView);
  }

  if (listRoot && typeof handlers.onListAction === 'function') {
    listRoot.addEventListener('click', handlers.onListAction);
  }
}
// -----------------------

// [Função 56] getDashboardPayloadSnapshot
// Responsabilidade: expor uma cópia do último payload renderizado no dashboard.
export function getDashboardPayloadSnapshot() {
  return UIState.dashboardPayload ? structuredClone(UIState.dashboardPayload) : null;
}
// -----------------------
