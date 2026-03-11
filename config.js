// js/config.js
// Configuração global central do sistema.
// Fonte única para:
// - identidade visual
// - temas
// - labels
// - textos
// - perfis
// - fases
// - chaves de sessão
// - nós do Realtime Database
// - preferências compartilhadas

export const AppConfig = {
  app: {
    name: 'Nova Saúde',
    subtitle: 'Controle de Devoluções',
    loginPage: 'index.html',
    dashboardPage: 'dashboard.html',
    defaultTheme: 'dark',
    supportedThemes: ['dark', 'light'],
    currentVersion: '1.0.0',
    companyLabel: 'Rede Nova Saúde',
    sessionStorageKey: 'novaSaude.session',
    themeStorageKey: 'novaSaude.theme',
    rememberViewStorageKey: 'novaSaude.dashboard.view',
    timezone: 'America/Campo_Grande',
    locale: 'pt-BR',
    printTitle: 'Rótulo de Devolução - Nova Saúde',
  },

  firebase: {
    // Substitua pelos dados reais do seu projeto Firebase.
    // O databaseURL abaixo já foi definido conforme o link que você informou.
    config: {
      apiKey: 'COLE_AQUI_SUA_API_KEY',
      authDomain: 'COLE_AQUI_SEU_AUTH_DOMAIN',
      databaseURL: 'https://system-devolucoescontrol-default-rtdb.europe-west1.firebasedatabase.app',
      projectId: 'COLE_AQUI_SEU_PROJECT_ID',
      storageBucket: 'COLE_AQUI_SEU_STORAGE_BUCKET',
      messagingSenderId: 'COLE_AQUI_SEU_MESSAGING_SENDER_ID',
      appId: 'COLE_AQUI_SEU_APP_ID',
    },
  },

  database: {
    paths: {
      meta: 'meta',
      users: 'users',
      filiais: 'filiais',
      grupos: 'grupos',
      devolucoes: 'devolucoes',
      audit: 'audit',
    },
    seedVersion: 1,
    metaSeedVersionPath: 'meta/seedVersion',
    metaSeededAtPath: 'meta/seededAt',
    metaLastSyncPath: 'meta/lastSyncAt',
  },

  profiles: {
    loja: 'loja',
    compras: 'compras',
    admin: 'admin',
    observador: 'observador',
  },

  profileLabels: {
    loja: 'Loja',
    compras: 'Compras',
    admin: 'Administrador',
    observador: 'Observador',
  },

  phases: {
    registrada: 'registrada',
    protocolada: 'protocolada',
    finalizada: 'finalizada',
    recusada: 'recusada',
  },

  phaseLabels: {
    registrada: 'Registrada',
    protocolada: 'Protocolada',
    finalizada: 'Coletada / Finalizada',
    recusada: 'Recusada pelo Compras',
  },

  actions: {
    login: 'login',
    resetPassword: 'resetPassword',
    createDevolucao: 'createDevolucao',
    updateDevolucao: 'updateDevolucao',
    protocolar: 'protocolar',
    recusar: 'recusar',
    finalizar: 'finalizar',
    desfazer: 'desfazer',
    excluir: 'excluir',
    criarUsuario: 'criarUsuario',
    criarFilial: 'criarFilial',
    criarGrupo: 'criarGrupo',
  },

  timelineActionLabels: {
    created: 'Registro inicial',
    updated: 'Alteração',
    protocolada: 'Protocolada junto ao fornecedor',
    recusada: 'Recusada pelo compras',
    finalizada: 'Coletada / finalizada',
    desfeita: 'Ação desfeita',
    excluida: 'Exclusão',
    resetPassword: 'Redefinição de senha',
  },

  views: {
    pendencias: 'pendencias',
    historico: 'historico',
  },

  sortOptions: {
    filial: 'filial',
    dataEmissao: 'dataEmissao',
    dataRegistro: 'dataRegistro',
    fase: 'fase',
  },

  filters: {
    defaults: {
      dataInicial: '',
      dataFinal: '',
      grupoId: '',
      filialId: '',
      fase: '',
      pesquisa: '',
      ordenacao: 'filial',
      view: 'pendencias',
    },
  },

  labels: {
    appName: 'Nova Saúde',
    appSubtitle: 'Controle de Devoluções',
    loginTitle: 'Acesso ao sistema',
    loginSubtitle: 'Entre com seu usuário e senha para acompanhar devoluções da rede.',
    dashboardTitle: 'Dashboard de Devoluções',
    dashboardSubtitle: 'Acompanhamento operacional de devoluções entre lojas, compras e administração.',

    cards: {
      pendentes: 'Pendentes',
      registradas: 'Registradas',
      protocoladas: 'Protocoladas',
      finalizadas: 'Finalizadas',
      totalMes: 'Total do mês',
    },

    sections: {
      filtros: 'Filtros',
      pendencias: 'Pendências',
      historico: 'Histórico',
      detalhes: 'Detalhes da devolução',
      timeline: 'Timeline',
      administracao: 'Configurações administrativas',
    },

    buttons: {
      entrar: 'Entrar',
      sair: 'Sair',
      incluir: 'Incluir devolução',
      atualizar: 'Atualizar',
      filtrar: 'Aplicar filtros',
      limparFiltros: 'Limpar filtros',
      detalhes: 'Detalhes',
      alterar: 'Alterar',
      andamento: 'Dar andamento',
      finalizar: 'Finalizar',
      desfazer: 'Desfazer',
      excluir: 'Excluir',
      rotulo: 'Rótulo',
      salvar: 'Salvar',
      cancelar: 'Cancelar',
      confirmar: 'Confirmar',
      imprimir: 'Imprimir',
      fechar: 'Fechar',
      admin: 'Administração',
      forgotPassword: 'Esqueci minha senha',
      trocarTema: 'Alternar tema',
    },

    placeholders: {
      login: 'Digite seu login',
      senha: 'Digite sua senha',
      pesquisa: 'Pesquisar por fornecedor, NF, motivo, observações, produtos ou identificação',
      fornecedor: 'Nome do fornecedor',
      motivo: 'Descreva o motivo',
      observacoes: 'Observações adicionais',
      produtos: 'Liste os produtos da devolução',
      protocoloFornecedor: 'Número ou referência do protocolo',
      justificativa: 'Informe a justificativa',
    },

    statusMessages: {
      loading: 'Carregando dados...',
      empty: 'Nenhum registro encontrado.',
      loginSuccess: 'Login realizado com sucesso.',
      logoutSuccess: 'Sessão encerrada com sucesso.',
      saveSuccess: 'Registro salvo com sucesso.',
      updateSuccess: 'Registro atualizado com sucesso.',
      deleteSuccess: 'Registro excluído com sucesso.',
      undoSuccess: 'Ação desfeita com sucesso.',
      passwordResetSuccess: 'Senha atualizada com sucesso.',
      refreshSuccess: 'Dados atualizados com sucesso.',
    },

    errors: {
      generic: 'Ocorreu um erro inesperado.',
      invalidCredentials: 'Login ou senha inválidos.',
      unauthorized: 'Você não tem permissão para esta ação.',
      notFound: 'Registro não encontrado.',
      requiredFields: 'Existem campos obrigatórios pendentes.',
      passwordMismatch: 'As senhas informadas não coincidem.',
      userNotFound: 'Usuário não encontrado.',
      alreadyExists: 'Já existe um registro com esses dados.',
      invalidUndoCredentials: 'Usuário ou senha inválidos para confirmar a ação.',
      forbiddenForObserver: 'Perfil observador não pode executar ações.',
      network: 'Não foi possível comunicar com o banco de dados.',
      firebaseConfigMissing: 'A configuração do Firebase não foi preenchida corretamente.',
    },
  },

  icons: {
    brand: 'NS',
    login: '🔐',
    user: '👤',
    password: '🔑',
    add: '➕',
    edit: '✏️',
    details: '📋',
    refresh: '🔄',
    logout: '🚪',
    admin: '⚙️',
    filter: '🧰',
    search: '🔎',
    timeline: '🕒',
    print: '🖨️',
    themeDark: '🌙',
    themeLight: '☀️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️',
    label: '🏷️',
    protocolada: '📦',
    recusada: '⛔',
    finalizada: '📬',
    registrada: '📝',
    observador: '👁️',
  },

  ui: {
    cardsPerRowDesktop: 5,
    toastDuration: 3200,
    modalAnimationMs: 180,
    autoRefreshMs: 10000,
    productsTextareaRows: 15,
    maxSearchLength: 120,
    maxObservationLength: 5000,
    maxProductsLength: 12000,
    maxReasonLength: 500,
    defaultListLimit: 200,
    responsiveBreakpointTablet: 960,
    responsiveBreakpointMobile: 640,
  },

  theme: {
    fontFamily: "'Inter', 'Segoe UI', Roboto, Arial, sans-serif",
    monoFontFamily: "'JetBrains Mono', Consolas, monospace",

    shared: {
      radiusXs: '8px',
      radiusSm: '12px',
      radiusMd: '16px',
      radiusLg: '20px',
      radiusXl: '24px',
      radiusPill: '999px',
      shadowSoft: '0 8px 24px rgba(15, 23, 42, 0.12)',
      shadowMedium: '0 14px 36px rgba(15, 23, 42, 0.18)',
      shadowStrong: '0 22px 52px rgba(15, 23, 42, 0.26)',
      transitionFast: '120ms ease',
      transitionNormal: '180ms ease',
      transitionSlow: '260ms ease',
      layoutMaxWidth: '1560px',
      sidebarWidth: '280px',
      topbarHeight: '78px',
      inputHeight: '46px',
      buttonHeight: '44px',
      panelPadding: '18px',
      pagePadding: '18px',
      gridGap: '16px',
      cardGap: '14px',
      borderThin: '1px',
      borderStrong: '2px',
    },

    dark: {
      colorBgApp: '#030b1a',
      colorBgCanvas: '#040f21',
      colorBgSidebar: '#07142b',
      colorBgTopbar: 'rgba(6, 16, 36, 0.82)',
      colorBgPanel: '#08162f',
      colorBgPanelAlt: '#0a1a36',
      colorBgCard: '#0a1832',
      colorBgCardSoft: '#0b1d3c',
      colorBgInput: '#071429',
      colorBgModal: '#081427',
      colorBgElevated: '#0d1d3f',
      colorBgOverlay: 'rgba(2, 8, 23, 0.72)',

      colorTextPrimary: '#f8fafc',
      colorTextSecondary: '#cbd5e1',
      colorTextMuted: '#94a3b8',
      colorTextInverse: '#0f172a',

      colorBorderSoft: 'rgba(148, 163, 184, 0.18)',
      colorBorderStrong: 'rgba(148, 163, 184, 0.30)',
      colorDivider: 'rgba(148, 163, 184, 0.12)',

      colorPrimary: '#2563eb',
      colorPrimaryHover: '#1d4ed8',
      colorPrimarySoft: 'rgba(37, 99, 235, 0.18)',

      colorSuccess: '#059669',
      colorSuccessHover: '#047857',
      colorSuccessSoft: 'rgba(5, 150, 105, 0.18)',

      colorWarning: '#f59e0b',
      colorWarningHover: '#d97706',
      colorWarningSoft: 'rgba(245, 158, 11, 0.18)',

      colorDanger: '#dc2626',
      colorDangerHover: '#b91c1c',
      colorDangerSoft: 'rgba(220, 38, 38, 0.18)',

      colorInfo: '#0ea5e9',
      colorInfoSoft: 'rgba(14, 165, 233, 0.18)',

      colorMetricBlue: '#2f66df',
      colorMetricOrange: '#ff7a12',
      colorMetricGreen: '#0e9f6e',
      colorMetricRed: '#e52424',
      colorMetricNeutral: '#0f172a',

      colorScrollbarTrack: '#071429',
      colorScrollbarThumb: '#163052',
      colorFocusRing: 'rgba(56, 189, 248, 0.34)',
    },

    light: {
      colorBgApp: '#eef3f9',
      colorBgCanvas: '#f6f8fc',
      colorBgSidebar: '#0b1730',
      colorBgTopbar: 'rgba(255, 255, 255, 0.85)',
      colorBgPanel: '#ffffff',
      colorBgPanelAlt: '#f8fafc',
      colorBgCard: '#ffffff',
      colorBgCardSoft: '#f3f6fb',
      colorBgInput: '#ffffff',
      colorBgModal: '#ffffff',
      colorBgElevated: '#ffffff',
      colorBgOverlay: 'rgba(15, 23, 42, 0.18)',

      colorTextPrimary: '#0f172a',
      colorTextSecondary: '#475569',
      colorTextMuted: '#64748b',
      colorTextInverse: '#ffffff',

      colorBorderSoft: 'rgba(148, 163, 184, 0.22)',
      colorBorderStrong: 'rgba(148, 163, 184, 0.34)',
      colorDivider: 'rgba(148, 163, 184, 0.18)',

      colorPrimary: '#2563eb',
      colorPrimaryHover: '#1d4ed8',
      colorPrimarySoft: 'rgba(37, 99, 235, 0.12)',

      colorSuccess: '#059669',
      colorSuccessHover: '#047857',
      colorSuccessSoft: 'rgba(5, 150, 105, 0.12)',

      colorWarning: '#d97706',
      colorWarningHover: '#b45309',
      colorWarningSoft: 'rgba(217, 119, 6, 0.12)',

      colorDanger: '#dc2626',
      colorDangerHover: '#b91c1c',
      colorDangerSoft: 'rgba(220, 38, 38, 0.12)',

      colorInfo: '#0284c7',
      colorInfoHover: '#0369a1',
      colorInfoSoft: 'rgba(2, 132, 199, 0.12)',

      colorMetricBlue: '#2f66df',
      colorMetricOrange: '#ff7a12',
      colorMetricGreen: '#0e9f6e',
      colorMetricRed: '#e52424',
      colorMetricNeutral: '#0f172a',

      colorScrollbarTrack: '#e5edf6',
      colorScrollbarThumb: '#b4c4d9',
      colorFocusRing: 'rgba(37, 99, 235, 0.22)',
    },
  },

  seeds: {
    users: {
      admin: {
        id: 'user_admin',
        nome: 'Administrador Nova Saúde',
        login: 'admin',
        senha: 'admin',
        perfil: 'admin',
        filialId: '',
        grupoId: '',
        ativo: true,
      },
      observador: {
        id: 'user_observador',
        nome: 'Observador Geral',
        login: 'observador',
        senha: 'observador',
        perfil: 'observador',
        filialId: '',
        grupoId: '',
        ativo: true,
      },
      loja1: {
        id: 'user_loja_1',
        nome: 'Loja Jardim São Bento',
        login: 'loja1',
        senha: '123456',
        perfil: 'loja',
        filialId: 'filial_001',
        grupoId: '',
        ativo: true,
      },
      compras1: {
        id: 'user_compras_1',
        nome: 'Compras Grupo Centro',
        login: 'compras1',
        senha: '123456',
        perfil: 'compras',
        filialId: '',
        grupoId: 'grupo_001',
        ativo: true,
      },
    },

    filiais: {
      filial_001: {
        id: 'filial_001',
        numero: '001',
        nome: 'Jardim São Bento',
        ativo: true,
      },
      filial_002: {
        id: 'filial_002',
        numero: '002',
        nome: 'Centro',
        ativo: true,
      },
      filial_003: {
        id: 'filial_003',
        numero: '003',
        nome: 'Vila Nova',
        ativo: true,
      },
    },

    grupos: {
      grupo_001: {
        id: 'grupo_001',
        nome: 'Grupo Centro',
        filialIds: ['filial_001', 'filial_002'],
        ativo: true,
      },
      grupo_002: {
        id: 'grupo_002',
        nome: 'Grupo Expansão',
        filialIds: ['filial_003'],
        ativo: true,
      },
    },
  },
};

// [Função 1] getCurrentThemeName
// Responsabilidade: obter o tema atual salvo localmente ou o padrão da aplicação.
export function getCurrentThemeName() {
  const savedTheme = window.localStorage.getItem(AppConfig.app.themeStorageKey);
  const themeName = savedTheme || AppConfig.app.defaultTheme;

  return AppConfig.app.supportedThemes.includes(themeName)
    ? themeName
    : AppConfig.app.defaultTheme;
}
// -----------------------

// [Função 2] saveThemePreference
// Responsabilidade: persistir a preferência de tema no navegador.
export function saveThemePreference(themeName) {
  if (!AppConfig.app.supportedThemes.includes(themeName)) return;
  window.localStorage.setItem(AppConfig.app.themeStorageKey, themeName);
}
// -----------------------

// [Função 3] getThemeTokens
// Responsabilidade: combinar tokens compartilhados com os tokens específicos do tema selecionado.
export function getThemeTokens(themeName = AppConfig.app.defaultTheme) {
  const selectedTheme = AppConfig.theme[themeName] || AppConfig.theme[AppConfig.app.defaultTheme];

  return {
    ...AppConfig.theme.shared,
    ...selectedTheme,
    fontFamily: AppConfig.theme.fontFamily,
    monoFontFamily: AppConfig.theme.monoFontFamily,
  };
}
// -----------------------

// [Função 4] applyTheme
// Responsabilidade: aplicar o tema ao documento usando data-theme e CSS custom properties.
export function applyTheme(themeName = AppConfig.app.defaultTheme) {
  const root = document.documentElement;
  const tokens = getThemeTokens(themeName);

  root.setAttribute('data-theme', themeName);

  Object.entries(tokens).forEach(([tokenKey, tokenValue]) => {
    const cssVarName = tokenKey.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
    root.style.setProperty(`--${cssVarName}`, tokenValue);
  });

  saveThemePreference(themeName);

  return themeName;
}
// -----------------------

// [Função 5] toggleTheme
// Responsabilidade: alternar entre tema claro e escuro e aplicar a mudança imediatamente.
export function toggleTheme() {
  const currentTheme = getCurrentThemeName();
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
  return nextTheme;
}
// -----------------------

// [Função 6] getProfileLabel
// Responsabilidade: retornar o rótulo amigável do perfil de usuário.
export function getProfileLabel(profile) {
  return AppConfig.profileLabels[profile] || profile || '-';
}
// -----------------------

// [Função 7] getPhaseLabel
// Responsabilidade: retornar o rótulo amigável da fase da devolução.
export function getPhaseLabel(phase) {
  return AppConfig.phaseLabels[phase] || phase || '-';
}
// -----------------------

// [Função 8] getPhaseColorVar
// Responsabilidade: mapear a fase para a variável visual principal de cor.
export function getPhaseColorVar(phase) {
  const map = {
    registrada: 'var(--color-primary)',
    protocolada: 'var(--color-warning)',
    finalizada: 'var(--color-success)',
    recusada: 'var(--color-danger)',
  };

  return map[phase] || 'var(--color-info)';
}
// -----------------------

// [Função 9] getPhaseMeta
// Responsabilidade: retornar metadados visuais e textuais de uma fase.
export function getPhaseMeta(phase) {
  const emojiMap = {
    registrada: AppConfig.icons.registrada,
    protocolada: AppConfig.icons.protocolada,
    finalizada: AppConfig.icons.finalizada,
    recusada: AppConfig.icons.recusada,
  };

  return {
    key: phase,
    label: getPhaseLabel(phase),
    color: getPhaseColorVar(phase),
    emoji: emojiMap[phase] || AppConfig.icons.info,
  };
}
// -----------------------

// [Função 10] getDatabasePath
// Responsabilidade: retornar o caminho configurado de um nó do Realtime Database.
export function getDatabasePath(pathKey) {
  return AppConfig.database.paths[pathKey] || '';
}
// -----------------------

// [Função 11] getDefaultFilters
// Responsabilidade: fornecer uma cópia limpa dos filtros padrão.
export function getDefaultFilters() {
  return JSON.parse(JSON.stringify(AppConfig.filters.defaults));
}
// -----------------------

// [Função 12] getSessionStorageKey
// Responsabilidade: expor a chave única de sessão da aplicação.
export function getSessionStorageKey() {
  return AppConfig.app.sessionStorageKey;
}
// -----------------------

// [Função 13] getRememberedViewKey
// Responsabilidade: expor a chave de persistência da view atual do dashboard.
export function getRememberedViewKey() {
  return AppConfig.app.rememberViewStorageKey;
}
// -----------------------

// [Função 14] getFirebaseConfig
// Responsabilidade: expor a configuração do Firebase para inicialização do app.
export function getFirebaseConfig() {
  return { ...AppConfig.firebase.config };
}
// -----------------------

// [Função 15] validateFirebaseConfigShape
// Responsabilidade: validar superficialmente se os campos essenciais do Firebase foram preenchidos.
export function validateFirebaseConfigShape() {
  const config = getFirebaseConfig();

  const requiredKeys = [
    'apiKey',
    'authDomain',
    'databaseURL',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  const missingKeys = requiredKeys.filter((key) => {
    const value = String(config[key] || '').trim();
    return !value || value.startsWith('COLE_AQUI');
  });

  return {
    isValid: missingKeys.length === 0,
    missingKeys,
  };
}
// -----------------------

// [Função 16] getAppIdentity
// Responsabilidade: retornar dados básicos da identidade da aplicação para cabeçalho e login.
export function getAppIdentity() {
  return {
    name: AppConfig.app.name,
    subtitle: AppConfig.app.subtitle,
    logoText: AppConfig.icons.brand,
  };
}
// -----------------------

// [Função 17] getEmptySeedBundle
// Responsabilidade: devolver a estrutura base mínima do seed inicial para uso nos serviços.
export function getEmptySeedBundle() {
  return {
    users: {},
    filiais: {},
    grupos: {},
    devolucoes: {},
    meta: {
      seedVersion: AppConfig.database.seedVersion,
      seededAt: null,
      lastSyncAt: null,
    },
  };
}
// -----------------------
