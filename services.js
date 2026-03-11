// js/services.js
// Camada única de regra de negócio, sessão, permissões e dados.
// Este arquivo concentra:
// - autenticação baseada em usuários no Realtime Database
// - seed inicial
// - sessão local
// - permissões por perfil
// - CRUD de devoluções
// - timeline/auditoria
// - administração (usuários, filiais, grupos)
// - filtros e payload do dashboard
// - geração do rótulo para impressão

import {
  AppConfig,
  getDatabasePath,
  getDefaultFilters,
  getPhaseLabel,
  getProfileLabel,
  getSessionStorageKey,
  getRememberedViewKey,
  getEmptySeedBundle,
} from './config.js';

import {
  readValue,
  writeValue,
  updateValue,
  removeValue,
  pushValue,
  subscribeValue,
  readOrderedEqual,
  getServerNow,
  normalizeFirebaseError,
} from './firebase.js';

const ServiceRuntime = {
  initialized: false,
  cache: {
    users: null,
    filiais: null,
    grupos: null,
    devolucoes: null,
  },
};

// [Função 1] safeClone
// Responsabilidade: criar uma cópia profunda simples de objetos serializáveis.
function safeClone(value) {
  return JSON.parse(JSON.stringify(value));
}
// -----------------------

// [Função 2] nowIso
// Responsabilidade: retornar data/hora atual em formato ISO para uso operacional local.
function nowIso() {
  return new Date().toISOString();
}
// -----------------------

// [Função 3] toArray
// Responsabilidade: converter objetos indexados do RTDB em array, preservando ids.
function toArray(recordMap) {
  if (!recordMap || typeof recordMap !== 'object') return [];

  return Object.entries(recordMap).map(([key, value]) => ({
    id: value?.id || key,
    ...value,
  }));
}
// -----------------------

// [Função 4] toMapById
// Responsabilidade: converter lista em mapa indexado por id.
function toMapById(items = []) {
  return items.reduce((acc, item) => {
    if (item?.id) acc[item.id] = item;
    return acc;
  }, {});
}
// -----------------------

// [Função 5] generateId
// Responsabilidade: gerar um identificador legível para registros internos não baseados em push key.
function generateId(prefix = 'id') {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  const stamp = Date.now().toString(36).toUpperCase();
  return `${prefix}_${stamp}_${random}`;
}
// -----------------------

// [Função 6] normalizeText
// Responsabilidade: normalizar texto para comparação e pesquisa sem acento e sem diferença de caixa.
function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}
// -----------------------

// [Função 7] isFilled
// Responsabilidade: indicar se um valor textual está preenchido de forma útil.
function isFilled(value) {
  return String(value ?? '').trim().length > 0;
}
// -----------------------

// [Função 8] getSessionData
// Responsabilidade: ler a sessão atual armazenada no navegador.
function getSessionData() {
  const raw = window.localStorage.getItem(getSessionStorageKey());

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (error) {
    window.localStorage.removeItem(getSessionStorageKey());
    return null;
  }
}
// -----------------------

// [Função 9] saveSessionData
// Responsabilidade: persistir sessão autenticada no navegador.
function saveSessionData(session) {
  window.localStorage.setItem(getSessionStorageKey(), JSON.stringify(session));
}
// -----------------------

// [Função 10] clearSessionData
// Responsabilidade: remover a sessão atual do navegador.
function clearSessionData() {
  window.localStorage.removeItem(getSessionStorageKey());
}
// -----------------------

// [Função 11] setRememberedView
// Responsabilidade: persistir a aba/view escolhida no dashboard.
function setRememberedView(viewName) {
  window.localStorage.setItem(getRememberedViewKey(), viewName);
}
// -----------------------

// [Função 12] getRememberedView
// Responsabilidade: recuperar a aba/view persistida do dashboard.
function getRememberedView() {
  return window.localStorage.getItem(getRememberedViewKey()) || AppConfig.views.pendencias;
}
// -----------------------

// [Função 13] assertRuntimeInitialized
// Responsabilidade: garantir que a inicialização básica de dados já foi executada.
function assertRuntimeInitialized() {
  if (!ServiceRuntime.initialized) {
    throw new Error('Os serviços ainda não foram inicializados. Execute initAppData() antes.');
  }
}
// -----------------------

// [Função 14] getUsersPath
// Responsabilidade: retornar o caminho configurado de usuários no RTDB.
function getUsersPath() {
  return getDatabasePath('users');
}
// -----------------------

// [Função 15] getFiliaisPath
// Responsabilidade: retornar o caminho configurado de filiais no RTDB.
function getFiliaisPath() {
  return getDatabasePath('filiais');
}
// -----------------------

// [Função 16] getGruposPath
// Responsabilidade: retornar o caminho configurado de grupos no RTDB.
function getGruposPath() {
  return getDatabasePath('grupos');
}
// -----------------------

// [Função 17] getDevolucoesPath
// Responsabilidade: retornar o caminho configurado de devoluções no RTDB.
function getDevolucoesPath() {
  return getDatabasePath('devolucoes');
}
// -----------------------

// [Função 18] getMetaPath
// Responsabilidade: retornar o caminho configurado de metadados no RTDB.
function getMetaPath() {
  return getDatabasePath('meta');
}
// -----------------------

// [Função 19] ensureArray
// Responsabilidade: garantir retorno sempre em array.
function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}
// -----------------------

// [Função 20] compareStrings
// Responsabilidade: comparar textos de forma estável e case-insensitive.
function compareStrings(a, b) {
  return String(a || '').localeCompare(String(b || ''), 'pt-BR', { sensitivity: 'base' });
}
// -----------------------

// [Função 21] getSeedUsers
// Responsabilidade: devolver usuários iniciais do sistema com metadados básicos.
function getSeedUsers() {
  const createdAt = nowIso();

  return Object.fromEntries(
    Object.entries(AppConfig.seeds.users).map(([key, user]) => [
      key,
      {
        ...user,
        criadoEm: createdAt,
        atualizadoEm: createdAt,
      },
    ])
  );
}
// -----------------------

// [Função 22] getSeedFiliais
// Responsabilidade: devolver filiais iniciais do sistema com metadados básicos.
function getSeedFiliais() {
  const createdAt = nowIso();

  return Object.fromEntries(
    Object.entries(AppConfig.seeds.filiais).map(([key, filial]) => [
      key,
      {
        ...filial,
        criadoEm: createdAt,
        atualizadoEm: createdAt,
      },
    ])
  );
}
// -----------------------

// [Função 23] getSeedGrupos
// Responsabilidade: devolver grupos iniciais do sistema com metadados básicos.
function getSeedGrupos() {
  const createdAt = nowIso();

  return Object.fromEntries(
    Object.entries(AppConfig.seeds.grupos).map(([key, grupo]) => [
      key,
      {
        ...grupo,
        criadoEm: createdAt,
        atualizadoEm: createdAt,
      },
    ])
  );
}
// -----------------------

// [Função 24] getSeedDevolucoes
// Responsabilidade: criar um conjunto inicial de devoluções demonstrativas com timeline.
function getSeedDevolucoes() {
  const registroA = '2026-03-02T10:15:00.000Z';
  const registroB = '2026-03-04T14:20:00.000Z';
  const registroC = '2026-03-06T09:10:00.000Z';

  const devolucao1Id = 'dev_seed_001';
  const devolucao2Id = 'dev_seed_002';
  const devolucao3Id = 'dev_seed_003';

  return {
    [devolucao1Id]: {
      id: devolucao1Id,
      identificacao: 'DEV-20260302-001',
      filialId: 'filial_001',
      grupoId: 'grupo_001',
      fornecedor: 'Distribuidora Centro Farma',
      dataEmissao: '2026-03-01',
      numeroNF: '45871',
      motivo: 'Produto com avaria na embalagem',
      produtos: 'Dipirona 500mg cx c/ 100 unidades\nAmoxicilina 500mg blister',
      observacoes: 'Separado no almoxarifado aguardando tratativa.',
      fase: AppConfig.phases.registrada,
      faseAnterior: '',
      protocoloFornecedor: '',
      justificativaRecusa: '',
      ativo: true,
      excluida: false,
      criadoPor: {
        userId: 'user_loja_1',
        nome: 'Loja Jardim São Bento',
        perfil: AppConfig.profiles.loja,
      },
      criadoEm: registroA,
      atualizadoEm: registroA,
      protocoladoPor: null,
      protocoladoEm: '',
      finalizadoPor: null,
      finalizadoEm: '',
      timeline: {
        tl_001: {
          id: 'tl_001',
          tipo: 'created',
          label: AppConfig.timelineActionLabels.created,
          dataHora: registroA,
          usuarioId: 'user_loja_1',
          usuarioNome: 'Loja Jardim São Bento',
          usuarioPerfil: AppConfig.profiles.loja,
          detalhes: 'Devolução registrada pela loja.',
          observacoes: 'Separado no almoxarifado aguardando tratativa.',
          justificativa: '',
          before: null,
          after: {
            fase: AppConfig.phases.registrada,
          },
        },
      },
    },

    [devolucao2Id]: {
      id: devolucao2Id,
      identificacao: 'DEV-20260304-002',
      filialId: 'filial_002',
      grupoId: 'grupo_001',
      fornecedor: 'Pharma Sul Distribuição',
      dataEmissao: '2026-03-03',
      numeroNF: '78125',
      motivo: 'Erro de faturamento',
      produtos: 'Vitamina C 1g tubo\nOmeprazol 20mg cx c/ 56 cápsulas',
      observacoes: 'Compras já em contato com o fornecedor.',
      fase: AppConfig.phases.protocolada,
      faseAnterior: AppConfig.phases.registrada,
      protocoloFornecedor: 'PROTOCOLO-PS-44381',
      justificativaRecusa: '',
      ativo: true,
      excluida: false,
      criadoPor: {
        userId: 'user_loja_1',
        nome: 'Loja Jardim São Bento',
        perfil: AppConfig.profiles.loja,
      },
      criadoEm: registroB,
      atualizadoEm: '2026-03-05T11:00:00.000Z',
      protocoladoPor: {
        userId: 'user_compras_1',
        nome: 'Compras Grupo Centro',
        perfil: AppConfig.profiles.compras,
      },
      protocoladoEm: '2026-03-05T11:00:00.000Z',
      finalizadoPor: null,
      finalizadoEm: '',
      timeline: {
        tl_002_1: {
          id: 'tl_002_1',
          tipo: 'created',
          label: AppConfig.timelineActionLabels.created,
          dataHora: registroB,
          usuarioId: 'user_loja_1',
          usuarioNome: 'Loja Jardim São Bento',
          usuarioPerfil: AppConfig.profiles.loja,
          detalhes: 'Devolução registrada pela loja.',
          observacoes: 'Compras já em contato com o fornecedor.',
          justificativa: '',
          before: null,
          after: { fase: AppConfig.phases.registrada },
        },
        tl_002_2: {
          id: 'tl_002_2',
          tipo: 'protocolada',
          label: AppConfig.timelineActionLabels.protocolada,
          dataHora: '2026-03-05T11:00:00.000Z',
          usuarioId: 'user_compras_1',
          usuarioNome: 'Compras Grupo Centro',
          usuarioPerfil: AppConfig.profiles.compras,
          detalhes: 'Protocolada junto ao fornecedor.',
          observacoes: 'Fornecedor confirmou coleta em rota semanal.',
          justificativa: '',
          before: { fase: AppConfig.phases.registrada },
          after: {
            fase: AppConfig.phases.protocolada,
            protocoloFornecedor: 'PROTOCOLO-PS-44381',
          },
        },
      },
    },

    [devolucao3Id]: {
      id: devolucao3Id,
      identificacao: 'DEV-20260306-003',
      filialId: 'filial_003',
      grupoId: 'grupo_002',
      fornecedor: 'Laboratório Vida Plena',
      dataEmissao: '2026-03-05',
      numeroNF: '99317',
      motivo: 'Mercadoria vencida identificada no recebimento',
      produtos: 'Lote de suplemento vitamínico vencido',
      observacoes: 'Coleta já confirmada pela loja.',
      fase: AppConfig.phases.finalizada,
      faseAnterior: AppConfig.phases.protocolada,
      protocoloFornecedor: 'LVP-23090',
      justificativaRecusa: '',
      ativo: true,
      excluida: false,
      criadoPor: {
        userId: 'user_loja_1',
        nome: 'Loja Jardim São Bento',
        perfil: AppConfig.profiles.loja,
      },
      criadoEm: registroC,
      atualizadoEm: '2026-03-08T16:15:00.000Z',
      protocoladoPor: {
        userId: 'user_compras_1',
        nome: 'Compras Grupo Centro',
        perfil: AppConfig.profiles.compras,
      },
      protocoladoEm: '2026-03-07T08:30:00.000Z',
      finalizadoPor: {
        userId: 'user_loja_1',
        nome: 'Loja Jardim São Bento',
        perfil: AppConfig.profiles.loja,
      },
      finalizadoEm: '2026-03-08T16:15:00.000Z',
      timeline: {
        tl_003_1: {
          id: 'tl_003_1',
          tipo: 'created',
          label: AppConfig.timelineActionLabels.created,
          dataHora: registroC,
          usuarioId: 'user_loja_1',
          usuarioNome: 'Loja Jardim São Bento',
          usuarioPerfil: AppConfig.profiles.loja,
          detalhes: 'Devolução registrada pela loja.',
          observacoes: '',
          justificativa: '',
          before: null,
          after: { fase: AppConfig.phases.registrada },
        },
        tl_003_2: {
          id: 'tl_003_2',
          tipo: 'protocolada',
          label: AppConfig.timelineActionLabels.protocolada,
          dataHora: '2026-03-07T08:30:00.000Z',
          usuarioId: 'user_compras_1',
          usuarioNome: 'Compras Grupo Centro',
          usuarioPerfil: AppConfig.profiles.compras,
          detalhes: 'Protocolada junto ao fornecedor.',
          observacoes: 'Fornecedor informou janela de retirada para sexta-feira.',
          justificativa: '',
          before: { fase: AppConfig.phases.registrada },
          after: { fase: AppConfig.phases.protocolada, protocoloFornecedor: 'LVP-23090' },
        },
        tl_003_3: {
          id: 'tl_003_3',
          tipo: 'finalizada',
          label: AppConfig.timelineActionLabels.finalizada,
          dataHora: '2026-03-08T16:15:00.000Z',
          usuarioId: 'user_loja_1',
          usuarioNome: 'Loja Jardim São Bento',
          usuarioPerfil: AppConfig.profiles.loja,
          detalhes: 'Coleta confirmada e devolução finalizada pela loja.',
          observacoes: 'Volumes retirados no balcão de conferência.',
          justificativa: '',
          before: { fase: AppConfig.phases.protocolada },
          after: { fase: AppConfig.phases.finalizada },
        },
      },
    },
  };
}
// -----------------------

// [Função 25] getSeedBundle
// Responsabilidade: montar o pacote completo de seed inicial.
function getSeedBundle() {
  const base = getEmptySeedBundle();
  const seededAt = nowIso();

  return {
    ...base,
    users: getSeedUsers(),
    filiais: getSeedFiliais(),
    grupos: getSeedGrupos(),
    devolucoes: getSeedDevolucoes(),
    meta: {
      seedVersion: AppConfig.database.seedVersion,
      seededAt,
      lastSyncAt: seededAt,
    },
  };
}
// -----------------------

// [Função 26] ensureSeedData
// Responsabilidade: verificar se o banco está vazio e aplicar seed inicial quando necessário.
async function ensureSeedData() {
  const meta = await readValue(getMetaPath());

  const seedVersion = meta?.seedVersion || 0;
  const users = await readValue(getUsersPath());

  if (seedVersion >= AppConfig.database.seedVersion && users && Object.keys(users).length > 0) {
    return false;
  }

  const seedBundle = getSeedBundle();

  await writeValue(getUsersPath(), seedBundle.users);
  await writeValue(getFiliaisPath(), seedBundle.filiais);
  await writeValue(getGruposPath(), seedBundle.grupos);
  await writeValue(getDevolucoesPath(), seedBundle.devolucoes);
  await writeValue(getMetaPath(), seedBundle.meta);

  return true;
}
// -----------------------

// [Função 27] refreshCaches
// Responsabilidade: recarregar caches em memória com os dados atuais do banco.
async function refreshCaches() {
  const [users, filiais, grupos, devolucoes] = await Promise.all([
    readValue(getUsersPath()),
    readValue(getFiliaisPath()),
    readValue(getGruposPath()),
    readValue(getDevolucoesPath()),
  ]);

  ServiceRuntime.cache.users = users || {};
  ServiceRuntime.cache.filiais = filiais || {};
  ServiceRuntime.cache.grupos = grupos || {};
  ServiceRuntime.cache.devolucoes = devolucoes || {};

  return true;
}
// -----------------------

// [Função 28] initAppData
// Responsabilidade: inicializar a camada de serviços, aplicar seed se necessário e carregar caches.
export async function initAppData() {
  if (ServiceRuntime.initialized) return true;

  try {
    await ensureSeedData();
    await refreshCaches();
    ServiceRuntime.initialized = true;
    return true;
  } catch (error) {
    throw normalizeFirebaseError(error);
  }
}
// -----------------------

// [Função 29] getAllUsers
// Responsabilidade: devolver todos os usuários em array.
export function getAllUsers() {
  assertRuntimeInitialized();
  return toArray(ServiceRuntime.cache.users).sort((a, b) => compareStrings(a.nome, b.nome));
}
// -----------------------

// [Função 30] getAllFiliais
// Responsabilidade: devolver todas as filiais em array ordenado por número.
export function getAllFiliais() {
  assertRuntimeInitialized();
  return toArray(ServiceRuntime.cache.filiais).sort((a, b) => compareStrings(a.numero, b.numero));
}
// -----------------------

// [Função 31] getAllGrupos
// Responsabilidade: devolver todos os grupos em array ordenado por nome.
export function getAllGrupos() {
  assertRuntimeInitialized();
  return toArray(ServiceRuntime.cache.grupos).sort((a, b) => compareStrings(a.nome, b.nome));
}
// -----------------------

// [Função 32] getAllDevolucoesRaw
// Responsabilidade: devolver todas as devoluções em array sem filtro de visibilidade.
function getAllDevolucoesRaw() {
  assertRuntimeInitialized();
  return toArray(ServiceRuntime.cache.devolucoes);
}
// -----------------------

// [Função 33] getUserById
// Responsabilidade: buscar usuário pelo id em cache.
export function getUserById(userId) {
  assertRuntimeInitialized();
  return ServiceRuntime.cache.users?.[userId] || null;
}
// -----------------------

// [Função 34] getFilialById
// Responsabilidade: buscar filial pelo id em cache.
export function getFilialById(filialId) {
  assertRuntimeInitialized();
  return ServiceRuntime.cache.filiais?.[filialId] || null;
}
// -----------------------

// [Função 35] getGrupoById
// Responsabilidade: buscar grupo pelo id em cache.
export function getGrupoById(grupoId) {
  assertRuntimeInitialized();
  return ServiceRuntime.cache.grupos?.[grupoId] || null;
}
// -----------------------

// [Função 36] isAdmin
// Responsabilidade: verificar se o usuário pertence ao perfil administrador.
export function isAdmin(user) {
  return user?.perfil === AppConfig.profiles.admin;
}
// -----------------------

// [Função 37] isCompras
// Responsabilidade: verificar se o usuário pertence ao perfil compras.
export function isCompras(user) {
  return user?.perfil === AppConfig.profiles.compras;
}
// -----------------------

// [Função 38] isLoja
// Responsabilidade: verificar se o usuário pertence ao perfil loja.
export function isLoja(user) {
  return user?.perfil === AppConfig.profiles.loja;
}
// -----------------------

// [Função 39] isObservador
// Responsabilidade: verificar se o usuário pertence ao perfil observador.
export function isObservador(user) {
  return user?.perfil === AppConfig.profiles.observador;
}
// -----------------------

// [Função 40] getVisibleFilialIdsForUser
// Responsabilidade: calcular quais filiais o usuário pode enxergar no sistema.
export function getVisibleFilialIdsForUser(user) {
  if (!user) return [];

  if (isAdmin(user) || isObservador(user)) {
    return getAllFiliais().map((filial) => filial.id);
  }

  if (isLoja(user)) {
    return user.filialId ? [user.filialId] : [];
  }

  if (isCompras(user)) {
    const grupo = getGrupoById(user.grupoId);
    return ensureArray(grupo?.filialIds);
  }

  return [];
}
// -----------------------

// [Função 41] canManageAdmin
// Responsabilidade: informar se o usuário pode acessar e executar a área administrativa.
export function canManageAdmin(user) {
  return !!user && isAdmin(user);
}
// -----------------------

// [Função 42] canCreateDevolucao
// Responsabilidade: informar se o usuário pode incluir nova devolução.
export function canCreateDevolucao(user) {
  return !!user && isLoja(user);
}
// -----------------------

// [Função 43] canViewDevolucao
// Responsabilidade: informar se o usuário pode visualizar uma devolução específica.
export function canViewDevolucao(user, devolucao) {
  if (!user || !devolucao || devolucao.excluida) return false;

  const allowedFiliais = getVisibleFilialIdsForUser(user);
  return allowedFiliais.includes(devolucao.filialId);
}
// -----------------------

// [Função 44] canUpdateDevolucao
// Responsabilidade: informar se o usuário pode alterar dados da devolução.
export function canUpdateDevolucao(user, devolucao) {
  if (!canViewDevolucao(user, devolucao)) return false;
  if (isObservador(user)) return false;
  if (isAdmin(user)) return true;
  return isCompras(user);
}
// -----------------------

// [Função 45] canProtocolar
// Responsabilidade: informar se o usuário pode protocolar a devolução.
export function canProtocolar(user, devolucao) {
  if (!canViewDevolucao(user, devolucao)) return false;
  if (!isCompras(user) && !isAdmin(user)) return false;
  return devolucao.fase === AppConfig.phases.registrada;
}
// -----------------------

// [Função 46] canRecusar
// Responsabilidade: informar se o usuário pode recusar a devolução pelo compras.
export function canRecusar(user, devolucao) {
  if (!canViewDevolucao(user, devolucao)) return false;
  if (!isCompras(user) && !isAdmin(user)) return false;
  return devolucao.fase === AppConfig.phases.registrada;
}
// -----------------------

// [Função 47] canFinalizar
// Responsabilidade: informar se o usuário pode finalizar a devolução.
export function canFinalizar(user, devolucao) {
  if (!canViewDevolucao(user, devolucao)) return false;
  if (!isLoja(user) && !isAdmin(user)) return false;
  return devolucao.fase === AppConfig.phases.protocolada;
}
// -----------------------

// [Função 48] canDesfazer
// Responsabilidade: informar se o usuário pode desfazer ações em uma devolução.
export function canDesfazer(user, devolucao) {
  if (!canViewDevolucao(user, devolucao)) return false;
  if (isObservador(user)) return false;
  return isLoja(user) || isCompras(user) || isAdmin(user);
}
// -----------------------

// [Função 49] canExcluir
// Responsabilidade: informar se o usuário pode excluir uma devolução.
export function canExcluir(user, devolucao) {
  if (!canViewDevolucao(user, devolucao)) return false;
  if (!isLoja(user) && !isAdmin(user)) return false;
  return devolucao.fase === AppConfig.phases.registrada || devolucao.fase === AppConfig.phases.recusada;
}
// -----------------------

// [Função 50] getCurrentUser
// Responsabilidade: devolver o usuário autenticado a partir da sessão local.
export function getCurrentUser() {
  assertRuntimeInitialized();

  const session = getSessionData();
  if (!session?.userId) return null;

  const user = getUserById(session.userId);
  if (!user || !user.ativo) return null;

  return user;
}
// -----------------------

// [Função 51] assertAuthenticatedUser
// Responsabilidade: garantir que existe um usuário autenticado.
function assertAuthenticatedUser() {
  const user = getCurrentUser();

  if (!user) {
    throw new Error(AppConfig.labels.errors.invalidCredentials);
  }

  return user;
}
// -----------------------

// [Função 52] login
// Responsabilidade: autenticar um usuário pelo login e senha usando dados armazenados no Realtime Database.
export async function login(loginValue, passwordValue) {
  await initAppData();

  try {
    const result = await readOrderedEqual(getUsersPath(), 'login', String(loginValue || '').trim());
    const found = toArray(result).find((user) => user.ativo);

    if (!found || String(found.senha) !== String(passwordValue || '')) {
      throw new Error(AppConfig.labels.errors.invalidCredentials);
    }

    const session = {
      userId: found.id,
      login: found.login,
      perfil: found.perfil,
      createdAt: nowIso(),
    };

    saveSessionData(session);

    return {
      success: true,
      user: found,
      session,
    };
  } catch (error) {
    throw normalizeFirebaseError(error);
  }
}
// -----------------------

// [Função 53] logout
// Responsabilidade: encerrar a sessão local do usuário atual.
export function logout() {
  clearSessionData();
  return true;
}
// -----------------------

// [Função 54] resetPassword
// Responsabilidade: redefinir a senha de um usuário existente pelo login informado.
export async function resetPassword(loginValue, newPassword, confirmPassword) {
  await initAppData();

  if (!isFilled(loginValue)) {
    throw new Error('Informe o usuário.');
  }

  if (!isFilled(newPassword) || !isFilled(confirmPassword)) {
    throw new Error('Preencha os campos de nova senha e confirmação.');
  }

  if (String(newPassword) !== String(confirmPassword)) {
    throw new Error(AppConfig.labels.errors.passwordMismatch);
  }

  const result = await readOrderedEqual(getUsersPath(), 'login', String(loginValue).trim());
  const found = toArray(result)[0];

  if (!found) {
    throw new Error(AppConfig.labels.errors.userNotFound);
  }

  await updateValue(`${getUsersPath()}/${found.id}`, {
    senha: String(newPassword),
    atualizadoEm: nowIso(),
  });

  await refreshCaches();

  return {
    success: true,
    message: AppConfig.labels.statusMessages.passwordResetSuccess,
  };
}
// -----------------------

// [Função 55] validateRequiredFields
// Responsabilidade: validar campos obrigatórios e retornar lista de faltantes.
export function validateRequiredFields(payload, requiredFields = []) {
  const missing = requiredFields.filter((fieldName) => !isFilled(payload?.[fieldName]));
  return {
    valid: missing.length === 0,
    missing,
  };
}
// -----------------------

// [Função 56] getFilialGroupId
// Responsabilidade: descobrir o grupo principal associado a uma filial.
function getFilialGroupId(filialId) {
  const grupos = getAllGrupos();
  const match = grupos.find((grupo) => ensureArray(grupo.filialIds).includes(filialId));
  return match?.id || '';
}
// -----------------------

// [Função 57] createTimelineEntry
// Responsabilidade: construir um item padronizado de timeline para auditoria.
function createTimelineEntry({
  tipo,
  label,
  user,
  detalhes = '',
  observacoes = '',
  justificativa = '',
  before = null,
  after = null,
  dataHora = nowIso(),
}) {
  return {
    id: generateId('tl'),
    tipo,
    label,
    dataHora,
    usuarioId: user?.id || '',
    usuarioNome: user?.nome || '',
    usuarioPerfil: user?.perfil || '',
    detalhes,
    observacoes,
    justificativa,
    before,
    after,
  };
}
// -----------------------

// [Função 58] buildDevolucaoIdentifier
// Responsabilidade: gerar a identificação única legível da devolução.
function buildDevolucaoIdentifier() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const tail = Math.random().toString().slice(2, 5);
  return `DEV-${year}${month}${day}-${tail}`;
}
// -----------------------

// [Função 59] sanitizeDevolucaoInput
// Responsabilidade: normalizar campos do formulário de devolução antes de persistir.
function sanitizeDevolucaoInput(payload) {
  return {
    fornecedor: String(payload?.fornecedor || '').trim(),
    dataEmissao: String(payload?.dataEmissao || '').trim(),
    numeroNF: String(payload?.numeroNF || '').trim(),
    motivo: String(payload?.motivo || '').trim(),
    produtos: String(payload?.produtos || '').trim(),
    observacoes: String(payload?.observacoes || '').trim(),
  };
}
// -----------------------

// [Função 60] getDevolucaoById
// Responsabilidade: buscar uma devolução pelo id validando visibilidade do usuário autenticado.
export function getDevolucaoById(id) {
  const currentUser = assertAuthenticatedUser();
  const devolucao = ServiceRuntime.cache.devolucoes?.[id] || null;

  if (!devolucao || !canViewDevolucao(currentUser, devolucao)) {
    throw new Error(AppConfig.labels.errors.notFound);
  }

  return safeClone(devolucao);
}
// -----------------------

// [Função 61] createDevolucao
// Responsabilidade: registrar uma nova devolução com fase inicial e primeiro evento de timeline.
export async function createDevolucao(payload) {
  await initAppData();

  const user = assertAuthenticatedUser();

  if (!canCreateDevolucao(user)) {
    throw new Error(AppConfig.labels.errors.unauthorized);
  }

  const cleaned = sanitizeDevolucaoInput(payload);

  const validation = validateRequiredFields(cleaned, [
    'fornecedor',
    'dataEmissao',
    'numeroNF',
    'motivo',
  ]);

  if (!validation.valid) {
    const missingLabels = {
      fornecedor: 'Fornecedor',
      dataEmissao: 'Data de emissão',
      numeroNF: 'Número da NF',
      motivo: 'Motivo',
    };

    const readableMissing = validation.missing.map((field) => missingLabels[field] || field);
    throw new Error(`${AppConfig.labels.errors.requiredFields}: ${readableMissing.join(', ')}`);
  }

  const id = generateId('devolucao');
  const createdAt = nowIso();
  const filial = getFilialById(user.filialId);

  const timelineEntry = createTimelineEntry({
    tipo: 'created',
    label: AppConfig.timelineActionLabels.created,
    user,
    detalhes: 'Devolução registrada pela loja.',
    observacoes: cleaned.observacoes,
    before: null,
    after: {
      fase: AppConfig.phases.registrada,
      numeroNF: cleaned.numeroNF,
      fornecedor: cleaned.fornecedor,
    },
    dataHora: createdAt,
  });

  const devolucao = {
    id,
    identificacao: buildDevolucaoIdentifier(),
    filialId: user.filialId,
    grupoId: getFilialGroupId(user.filialId),
    filialNumero: filial?.numero || '',
    fornecedor: cleaned.fornecedor,
    dataEmissao: cleaned.dataEmissao,
    numeroNF: cleaned.numeroNF,
    motivo: cleaned.motivo,
    produtos: cleaned.produtos,
    observacoes: cleaned.observacoes,
    fase: AppConfig.phases.registrada,
    faseAnterior: '',
    protocoloFornecedor: '',
    justificativaRecusa: '',
    ativo: true,
    excluida: false,
    criadoPor: {
      userId: user.id,
      nome: user.nome,
      perfil: user.perfil,
    },
    criadoEm: createdAt,
    atualizadoEm: createdAt,
    protocoladoPor: null,
    protocoladoEm: '',
    finalizadoPor: null,
    finalizadoEm: '',
    timeline: {
      [timelineEntry.id]: timelineEntry,
    },
  };

  await writeValue(`${getDevolucoesPath()}/${id}`, devolucao);
  await updateValue(getMetaPath(), { lastSyncAt: getServerNow() });
  await refreshCaches();

  return {
    success: true,
    devolucao: safeClone(devolucao),
    message: AppConfig.labels.statusMessages.saveSuccess,
  };
}
// -----------------------

// [Função 62] computeFieldDiff
// Responsabilidade: comparar antes/depois e retornar apenas os campos alterados.
function computeFieldDiff(before, after, candidateFields) {
  const diff = {};

  candidateFields.forEach((field) => {
    const oldValue = before?.[field] ?? '';
    const newValue = after?.[field] ?? '';

    if (String(oldValue) !== String(newValue)) {
      diff[field] = {
        before: oldValue,
        after: newValue,
      };
    }
  });

  return diff;
}
// -----------------------

// [Função 63] updateDevolucao
// Responsabilidade: alterar dados editáveis de uma devolução sem apagar histórico anterior.
export async function updateDevolucao(id, payload) {
  await initAppData();

  const user = assertAuthenticatedUser();
  const current = getDevolucaoById(id);

  if (!canUpdateDevolucao(user, current)) {
    throw new Error(AppConfig.labels.errors.unauthorized);
  }

  const cleaned = sanitizeDevolucaoInput({
    fornecedor: payload?.fornecedor ?? current.fornecedor,
    dataEmissao: payload?.dataEmissao ?? current.dataEmissao,
    numeroNF: payload?.numeroNF ?? current.numeroNF,
    motivo: payload?.motivo ?? current.motivo,
    produtos: payload?.produtos ?? current.produtos,
    observacoes: payload?.observacoes ?? current.observacoes,
  });

  const diff = computeFieldDiff(current, cleaned, [
    'fornecedor',
    'dataEmissao',
    'numeroNF',
    'motivo',
    'produtos',
    'observacoes',
  ]);

  if (Object.keys(diff).length === 0) {
    return {
      success: true,
      devolucao: current,
      message: 'Nenhuma alteração foi identificada.',
    };
  }

  const updatedAt = nowIso();

  const timelineEntry = createTimelineEntry({
    tipo: 'updated',
    label: AppConfig.timelineActionLabels.updated,
    user,
    detalhes: 'Dados da devolução alterados pelo compras.',
    observacoes: cleaned.observacoes,
    before: diff,
    after: cleaned,
    dataHora: updatedAt,
  });

  const nextTimeline = {
    ...(current.timeline || {}),
    [timelineEntry.id]: timelineEntry,
  };

  const nextState = {
    ...current,
    ...cleaned,
    atualizadoEm: updatedAt,
    timeline: nextTimeline,
  };

  await writeValue(`${getDevolucoesPath()}/${id}`, nextState);
  await updateValue(getMetaPath(), { lastSyncAt: getServerNow() });
  await refreshCaches();

  return {
    success: true,
    devolucao: safeClone(nextState),
    message: AppConfig.labels.statusMessages.updateSuccess,
  };
}
// -----------------------

// [Função 64] protocolarDevolucao
// Responsabilidade: registrar protocolo junto ao fornecedor e mudar fase para protocolada.
export async function protocolarDevolucao(id, data) {
  await initAppData();

  const user = assertAuthenticatedUser();
  const current = getDevolucaoById(id);

  if (!canProtocolar(user, current)) {
    throw new Error(AppConfig.labels.errors.unauthorized);
  }

  const protocoloFornecedor = String(data?.protocoloFornecedor || '').trim();
  const observacoes = String(data?.observacoes || '').trim();

  if (!isFilled(protocoloFornecedor)) {
    throw new Error('Informe o protocolo do fornecedor.');
  }

  const actionAt = nowIso();

  const timelineEntry = createTimelineEntry({
    tipo: 'protocolada',
    label: AppConfig.timelineActionLabels.protocolada,
    user,
    detalhes: 'Protocolada junto ao fornecedor.',
    observacoes,
    before: { fase: current.fase, protocoloFornecedor: current.protocoloFornecedor || '' },
    after: { fase: AppConfig.phases.protocolada, protocoloFornecedor },
    dataHora: actionAt,
  });

  const nextState = {
    ...current,
    faseAnterior: current.fase,
    fase: AppConfig.phases.protocolada,
    protocoloFornecedor,
    atualizadoEm: actionAt,
    protocoladoEm: actionAt,
    protocoladoPor: {
      userId: user.id,
      nome: user.nome,
      perfil: user.perfil,
    },
    timeline: {
      ...(current.timeline || {}),
      [timelineEntry.id]: timelineEntry,
    },
  };

  await writeValue(`${getDevolucoesPath()}/${id}`, nextState);
  await updateValue(getMetaPath(), { lastSyncAt: getServerNow() });
  await refreshCaches();

  return {
    success: true,
    devolucao: safeClone(nextState),
    message: AppConfig.labels.statusMessages.updateSuccess,
  };
}
// -----------------------

// [Função 65] recusarDevolucao
// Responsabilidade: registrar recusa pelo compras com justificativa obrigatória.
export async function recusarDevolucao(id, data) {
  await initAppData();

  const user = assertAuthenticatedUser();
  const current = getDevolucaoById(id);

  if (!canRecusar(user, current)) {
    throw new Error(AppConfig.labels.errors.unauthorized);
  }

  const justificativa = String(data?.justificativa || '').trim();
  const observacoes = String(data?.observacoes || '').trim();

  if (!isFilled(justificativa)) {
    throw new Error('A justificativa de recusa é obrigatória.');
  }

  const actionAt = nowIso();

  const timelineEntry = createTimelineEntry({
    tipo: 'recusada',
    label: AppConfig.timelineActionLabels.recusada,
    user,
    detalhes: 'Devolução recusada pelo compras.',
    observacoes,
    justificativa,
    before: { fase: current.fase },
    after: { fase: AppConfig.phases.recusada },
    dataHora: actionAt,
  });

  const nextState = {
    ...current,
    faseAnterior: current.fase,
    fase: AppConfig.phases.recusada,
    justificativaRecusa: justificativa,
    atualizadoEm: actionAt,
    timeline: {
      ...(current.timeline || {}),
      [timelineEntry.id]: timelineEntry,
    },
  };

  await writeValue(`${getDevolucoesPath()}/${id}`, nextState);
  await updateValue(getMetaPath(), { lastSyncAt: getServerNow() });
  await refreshCaches();

  return {
    success: true,
    devolucao: safeClone(nextState),
    message: AppConfig.labels.statusMessages.updateSuccess,
  };
}
// -----------------------

// [Função 66] finalizarDevolucao
// Responsabilidade: marcar a devolução como coletada/finalizada pela loja.
export async function finalizarDevolucao(id, data) {
  await initAppData();

  const user = assertAuthenticatedUser();
  const current = getDevolucaoById(id);

  if (!canFinalizar(user, current)) {
    throw new Error(AppConfig.labels.errors.unauthorized);
  }

  const observacoes = String(data?.observacoes || '').trim();
  const actionAt = nowIso();

  const timelineEntry = createTimelineEntry({
    tipo: 'finalizada',
    label: AppConfig.timelineActionLabels.finalizada,
    user,
    detalhes: 'Coleta confirmada e devolução finalizada pela loja.',
    observacoes,
    before: { fase: current.fase },
    after: { fase: AppConfig.phases.finalizada },
    dataHora: actionAt,
  });

  const nextState = {
    ...current,
    faseAnterior: current.fase,
    fase: AppConfig.phases.finalizada,
    atualizadoEm: actionAt,
    finalizadoEm: actionAt,
    finalizadoPor: {
      userId: user.id,
      nome: user.nome,
      perfil: user.perfil,
    },
    timeline: {
      ...(current.timeline || {}),
      [timelineEntry.id]: timelineEntry,
    },
  };

  await writeValue(`${getDevolucoesPath()}/${id}`, nextState);
  await updateValue(getMetaPath(), { lastSyncAt: getServerNow() });
  await refreshCaches();

  return {
    success: true,
    devolucao: safeClone(nextState),
    message: AppConfig.labels.statusMessages.updateSuccess,
  };
}
// -----------------------

// [Função 67] assertConfirmationCredentials
// Responsabilidade: validar usuário e senha informados para ações sensíveis.
function assertConfirmationCredentials(loginValue, senhaValue) {
  const users = getAllUsers();
  const found = users.find((user) => user.login === String(loginValue || '').trim() && user.ativo);

  if (!found || String(found.senha) !== String(senhaValue || '')) {
    throw new Error(AppConfig.labels.errors.invalidUndoCredentials);
  }

  return found;
}
// -----------------------

// [Função 68] desfazerAcao
// Responsabilidade: desfazer alteração, andamento ou finalização mediante credenciais e justificativa.
export async function desfazerAcao(id, data) {
  await initAppData();

  const currentUser = assertAuthenticatedUser();
  const current = getDevolucaoById(id);

  if (!canDesfazer(currentUser, current)) {
    throw new Error(AppConfig.labels.errors.unauthorized);
  }

  const confirmedBy = assertConfirmationCredentials(data?.login, data?.senha);
  const justificativa = String(data?.justificativa || '').trim();
  const observacoes = String(data?.observacoes || '').trim();

  if (!isFilled(justificativa)) {
    throw new Error('A justificativa para desfazer é obrigatória.');
  }

  const lastTimeline = getTimelineEntries(current).at(-1);

  if (!lastTimeline) {
    throw new Error('Não há ação anterior para desfazer.');
  }

  let nextState = safeClone(current);

  if (current.fase === AppConfig.phases.finalizada) {
    nextState.faseAnterior = current.fase;
    nextState.fase = AppConfig.phases.registrada;
    nextState.finalizadoEm = '';
    nextState.finalizadoPor = null;
  } else if (current.fase === AppConfig.phases.protocolada) {
    nextState.faseAnterior = current.fase;
    nextState.fase = AppConfig.phases.registrada;
    nextState.protocoladoEm = '';
    nextState.protocoladoPor = null;
    nextState.protocoloFornecedor = '';
  } else if (current.fase === AppConfig.phases.recusada) {
    nextState.faseAnterior = current.fase;
    nextState.fase = AppConfig.phases.registrada;
    nextState.justificativaRecusa = '';
  }

  const actionAt = nowIso();

  const timelineEntry = createTimelineEntry({
    tipo: 'desfeita',
    label: AppConfig.timelineActionLabels.desfeita,
    user: confirmedBy,
    detalhes: `Ação desfeita. Última ação revertida: ${lastTimeline.label}.`,
    observacoes,
    justificativa,
    before: { fase: current.fase },
    after: { fase: nextState.fase },
    dataHora: actionAt,
  });

  nextState.atualizadoEm = actionAt;
  nextState.timeline = {
    ...(current.timeline || {}),
    [timelineEntry.id]: timelineEntry,
  };

  await writeValue(`${getDevolucoesPath()}/${id}`, nextState);
  await updateValue(getMetaPath(), { lastSyncAt: getServerNow() });
  await refreshCaches();

  return {
    success: true,
    devolucao: safeClone(nextState),
    message: AppConfig.labels.statusMessages.undoSuccess,
  };
}
// -----------------------

// [Função 69] excluirDevolucao
// Responsabilidade: realizar exclusão lógica da devolução mediante confirmação com credenciais.
export async function excluirDevolucao(id, credentials) {
  await initAppData();

  const currentUser = assertAuthenticatedUser();
  const current = getDevolucaoById(id);

  if (!canExcluir(currentUser, current)) {
    throw new Error(AppConfig.labels.errors.unauthorized);
  }

  const confirmedBy = assertConfirmationCredentials(credentials?.login, credentials?.senha);
  const justificativa = String(credentials?.justificativa || '').trim();
  const actionAt = nowIso();

  const timelineEntry = createTimelineEntry({
    tipo: 'excluida',
    label: AppConfig.timelineActionLabels.excluida,
    user: confirmedBy,
    detalhes: 'Devolução excluída logicamente do sistema.',
    observacoes: '',
    justificativa,
    before: { ativo: current.ativo, excluida: current.excluida },
    after: { ativo: false, excluida: true },
    dataHora: actionAt,
  });

  const nextState = {
    ...current,
    ativo: false,
    excluida: true,
    atualizadoEm: actionAt,
    timeline: {
      ...(current.timeline || {}),
      [timelineEntry.id]: timelineEntry,
    },
  };

  await writeValue(`${getDevolucoesPath()}/${id}`, nextState);
  await updateValue(getMetaPath(), { lastSyncAt: getServerNow() });
  await refreshCaches();

  return {
    success: true,
    message: AppConfig.labels.statusMessages.deleteSuccess,
  };
}
// -----------------------

// [Função 70] getTimelineEntries
// Responsabilidade: retornar a timeline ordenada cronologicamente.
export function getTimelineEntries(devolucao) {
  return toArray(devolucao?.timeline || {}).sort((a, b) => {
    return new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime();
  });
}
// -----------------------

// [Função 71] attachRelations
// Responsabilidade: anexar dados derivados de filial, grupo e permissões à devolução.
function attachRelations(devolucao, currentUser) {
  const filial = getFilialById(devolucao.filialId);
  const grupo = getGrupoById(devolucao.grupoId);

  return {
    ...safeClone(devolucao),
    filial: filial || null,
    grupo: grupo || null,
    phaseLabel: getPhaseLabel(devolucao.fase),
    permissions: {
      canView: canViewDevolucao(currentUser, devolucao),
      canUpdate: canUpdateDevolucao(currentUser, devolucao),
      canProtocolar: canProtocolar(currentUser, devolucao),
      canRecusar: canRecusar(currentUser, devolucao),
      canFinalizar: canFinalizar(currentUser, devolucao),
      canDesfazer: canDesfazer(currentUser, devolucao),
      canExcluir: canExcluir(currentUser, devolucao),
    },
  };
}
// -----------------------

// [Função 72] matchesPeriodFilter
// Responsabilidade: validar se a devolução está dentro do período filtrado.
function matchesPeriodFilter(devolucao, filters) {
  const start = filters?.dataInicial ? new Date(`${filters.dataInicial}T00:00:00`) : null;
  const end = filters?.dataFinal ? new Date(`${filters.dataFinal}T23:59:59`) : null;
  const createdAt = new Date(devolucao.criadoEm);

  if (start && createdAt < start) return false;
  if (end && createdAt > end) return false;
  return true;
}
// -----------------------

// [Função 73] matchesGroupFilter
// Responsabilidade: validar se a devolução pertence ao grupo filtrado.
function matchesGroupFilter(devolucao, filters) {
  if (!isFilled(filters?.grupoId)) return true;
  return String(devolucao.grupoId || '') === String(filters.grupoId);
}
// -----------------------

// [Função 74] matchesFilialFilter
// Responsabilidade: validar se a devolução pertence à filial filtrada.
function matchesFilialFilter(devolucao, filters) {
  if (!isFilled(filters?.filialId)) return true;
  return String(devolucao.filialId || '') === String(filters.filialId);
}
// -----------------------

// [Função 75] matchesPhaseFilter
// Responsabilidade: validar se a devolução está na fase filtrada.
function matchesPhaseFilter(devolucao, filters) {
  if (!isFilled(filters?.fase)) return true;
  return String(devolucao.fase || '') === String(filters.fase);
}
// -----------------------

// [Função 76] matchesSearchFilter
// Responsabilidade: validar se a devolução atende à pesquisa textual livre.
function matchesSearchFilter(devolucao, filters) {
  const term = normalizeText(filters?.pesquisa);
  if (!term) return true;

  const searchable = normalizeText([
    devolucao.fornecedor,
    devolucao.numeroNF,
    devolucao.motivo,
    devolucao.observacoes,
    devolucao.produtos,
    devolucao.identificacao,
    devolucao.filial?.numero,
    devolucao.filial?.nome,
  ].join(' | '));

  return searchable.includes(term);
}
// -----------------------

// [Função 77] sortDevolucoes
// Responsabilidade: ordenar devoluções conforme critério selecionado.
function sortDevolucoes(items, ordenacao) {
  const sorted = [...items];

  sorted.sort((a, b) => {
    if (ordenacao === AppConfig.sortOptions.dataEmissao) {
      return new Date(a.dataEmissao).getTime() - new Date(b.dataEmissao).getTime();
    }

    if (ordenacao === AppConfig.sortOptions.dataRegistro) {
      return new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime();
    }

    if (ordenacao === AppConfig.sortOptions.fase) {
      return compareStrings(a.phaseLabel, b.phaseLabel);
    }

    return compareStrings(a.filial?.numero, b.filial?.numero);
  });

  return sorted;
}
// -----------------------

// [Função 78] listDevolucoes
// Responsabilidade: listar devoluções visíveis ao usuário aplicando filtros, pesquisa e ordenação.
export function listDevolucoes(filters = {}) {
  const currentUser = assertAuthenticatedUser();
  const mergedFilters = {
    ...getDefaultFilters(),
    ...filters,
  };

  const visible = getAllDevolucoesRaw()
    .filter((item) => item.ativo !== false && item.excluida !== true)
    .filter((item) => canViewDevolucao(currentUser, item))
    .map((item) => attachRelations(item, currentUser))
    .filter((item) => matchesPeriodFilter(item, mergedFilters))
    .filter((item) => matchesGroupFilter(item, mergedFilters))
    .filter((item) => matchesFilialFilter(item, mergedFilters))
    .filter((item) => matchesPhaseFilter(item, mergedFilters))
    .filter((item) => matchesSearchFilter(item, mergedFilters));

  return sortDevolucoes(visible, mergedFilters.ordenacao);
}
// -----------------------

// [Função 79] getDashboardMetrics
// Responsabilidade: calcular cards e totais do dashboard a partir da lista filtrada.
function getDashboardMetrics(items) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthItems = items.filter((item) => {
    const createdAt = new Date(item.criadoEm);
    return createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear;
  });

  return {
    pendentes: items.filter((item) =>
      [AppConfig.phases.registrada, AppConfig.phases.protocolada].includes(item.fase)
    ).length,
    registradas: items.filter((item) => item.fase === AppConfig.phases.registrada).length,
    protocoladas: items.filter((item) => item.fase === AppConfig.phases.protocolada).length,
    finalizadas: items.filter((item) => item.fase === AppConfig.phases.finalizada).length,
    totalMes: thisMonthItems.length,
  };
}
// -----------------------

// [Função 80] getDashboardPayload
// Responsabilidade: montar o payload completo do dashboard já pronto para a camada de interface.
export function getDashboardPayload(filters = {}) {
  const currentUser = assertAuthenticatedUser();
  const effectiveFilters = {
    ...getDefaultFilters(),
    ...filters,
    view: filters?.view || getRememberedView(),
  };

  if (effectiveFilters.view) {
    setRememberedView(effectiveFilters.view);
  }

  const devolucoes = listDevolucoes(effectiveFilters);

  return {
    app: {
      name: AppConfig.app.name,
      subtitle: AppConfig.app.subtitle,
    },
    currentUser: {
      ...safeClone(currentUser),
      perfilLabel: getProfileLabel(currentUser.perfil),
      visibleFilialIds: getVisibleFilialIdsForUser(currentUser),
    },
    filters: effectiveFilters,
    lookups: {
      filiais: getAllFiliais(),
      grupos: getAllGrupos(),
      fases: Object.values(AppConfig.phases).map((phase) => ({
        value: phase,
        label: getPhaseLabel(phase),
      })),
      ordenacoes: Object.values(AppConfig.sortOptions).map((sortValue) => ({
        value: sortValue,
        label:
          sortValue === AppConfig.sortOptions.filial
            ? 'Filial'
            : sortValue === AppConfig.sortOptions.dataEmissao
            ? 'Data de emissão'
            : sortValue === AppConfig.sortOptions.dataRegistro
            ? 'Data de registro'
            : 'Fase',
      })),
    },
    metrics: getDashboardMetrics(devolucoes),
    devolucoes,
  };
}
// -----------------------

// [Função 81] buildLabelHtml
// Responsabilidade: montar o HTML de impressão do rótulo da devolução.
function buildLabelHtml(devolucao) {
  const filialNumero = devolucao?.filial?.numero || devolucao?.filialNumero || '--';

  return `
    <div style="font-family: Arial, sans-serif; padding: 24px; color: #0f172a;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:16px; border:2px solid #0f172a; border-radius:18px; padding:18px;">
        <div style="display:flex; gap:18px; align-items:center;">
          <div style="width:110px; height:110px; border-radius:999px; background:#0f172a; color:#ffffff; display:flex; align-items:center; justify-content:center; font-size:36px; font-weight:800;">
            ${filialNumero}
          </div>
          <div>
            <div style="font-size:14px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:#475569;">
              Nova Saúde
            </div>
            <div style="font-size:28px; font-weight:800; margin-top:6px;">
              NF ${devolucao.numeroNF || '-'}
            </div>
            <div style="font-size:14px; margin-top:8px;">
              Identificação: <strong>${devolucao.identificacao || '-'}</strong>
            </div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:12px; color:#475569;">Fase</div>
          <div style="font-size:16px; font-weight:700;">${devolucao.phaseLabel || getPhaseLabel(devolucao.fase)}</div>
        </div>
      </div>

      <div style="margin-top:18px; border:1px solid #cbd5e1; border-radius:14px; padding:16px;">
        <div style="font-size:13px; color:#475569;">Fornecedor</div>
        <div style="font-size:20px; font-weight:700; margin-top:4px;">${devolucao.fornecedor || '-'}</div>
      </div>

      <div style="display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap:12px; margin-top:12px;">
        <div style="border:1px solid #cbd5e1; border-radius:14px; padding:14px;">
          <div style="font-size:13px; color:#475569;">Motivo</div>
          <div style="font-size:16px; font-weight:600; margin-top:4px;">${devolucao.motivo || '-'}</div>
        </div>
        <div style="border:1px solid #cbd5e1; border-radius:14px; padding:14px;">
          <div style="font-size:13px; color:#475569;">Data de emissão</div>
          <div style="font-size:16px; font-weight:600; margin-top:4px;">${devolucao.dataEmissao || '-'}</div>
        </div>
        <div style="border:1px solid #cbd5e1; border-radius:14px; padding:14px;">
          <div style="font-size:13px; color:#475569;">Data de registro</div>
          <div style="font-size:16px; font-weight:600; margin-top:4px;">${devolucao.criadoEm || '-'}</div>
        </div>
        <div style="border:1px solid #cbd5e1; border-radius:14px; padding:14px;">
          <div style="font-size:13px; color:#475569;">Filial</div>
          <div style="font-size:16px; font-weight:600; margin-top:4px;">${filialNumero} - ${devolucao?.filial?.nome || '-'}</div>
        </div>
      </div>

      <div style="margin-top:12px; border:1px solid #cbd5e1; border-radius:14px; padding:14px;">
        <div style="font-size:13px; color:#475569;">Observações</div>
        <div style="font-size:15px; margin-top:4px; white-space:pre-wrap;">${devolucao.observacoes || '-'}</div>
      </div>
    </div>
  `;
}
// -----------------------

// [Função 82] gerarRotulo
// Responsabilidade: gerar conteúdo do rótulo para preview e impressão.
export function gerarRotulo(id) {
  const devolucao = attachRelations(getDevolucaoById(id), assertAuthenticatedUser());

  return {
    title: AppConfig.app.printTitle,
    html: buildLabelHtml(devolucao),
    devolucao,
  };
}
// -----------------------

// [Função 83] createUser
// Responsabilidade: criar novo usuário via área administrativa.
export async function createUser(payload) {
  await initAppData();

  const currentUser = assertAuthenticatedUser();

  if (!canManageAdmin(currentUser)) {
    throw new Error(AppConfig.labels.errors.unauthorized);
  }

  const required = validateRequiredFields(payload, ['nome', 'login', 'senha', 'perfil']);

  if (!required.valid) {
    throw new Error(`${AppConfig.labels.errors.requiredFields}: ${required.missing.join(', ')}`);
  }

  const users = getAllUsers();
  const existing = users.find((user) => normalizeText(user.login) === normalizeText(payload.login));

  if (existing) {
    throw new Error(AppConfig.labels.errors.alreadyExists);
  }

  const id = generateId('user');
  const createdAt = nowIso();

  const nextUser = {
    id,
    nome: String(payload.nome).trim(),
    login: String(payload.login).trim(),
    senha: String(payload.senha).trim(),
    perfil: String(payload.perfil).trim(),
    filialId: String(payload.filialId || '').trim(),
    grupoId: String(payload.grupoId || '').trim(),
    ativo: true,
    criadoEm: createdAt,
    atualizadoEm: createdAt,
  };

  await writeValue(`${getUsersPath()}/${id}`, nextUser);
  await refreshCaches();

  return {
    success: true,
    user: nextUser,
    message: AppConfig.labels.statusMessages.saveSuccess,
  };
}
// -----------------------

// [Função 84] createFilial
// Responsabilidade: cadastrar nova filial via área administrativa.
export async function createFilial(payload) {
  await initAppData();

  const currentUser = assertAuthenticatedUser();

  if (!canManageAdmin(currentUser)) {
    throw new Error(AppConfig.labels.errors.unauthorized);
  }

  const required = validateRequiredFields(payload, ['numero', 'nome']);

  if (!required.valid) {
    throw new Error(`${AppConfig.labels.errors.requiredFields}: ${required.missing.join(', ')}`);
  }

  const filiais = getAllFiliais();
  const existing = filiais.find((filial) => String(filial.numero) === String(payload.numero).trim());

  if (existing) {
    throw new Error('Já existe uma filial com esse número.');
  }

  const id = generateId('filial');
  const createdAt = nowIso();

  const nextFilial = {
    id,
    numero: String(payload.numero).trim(),
    nome: String(payload.nome).trim(),
    ativo: true,
    criadoEm: createdAt,
    atualizadoEm: createdAt,
  };

  await writeValue(`${getFiliaisPath()}/${id}`, nextFilial);
  await refreshCaches();

  return {
    success: true,
    filial: nextFilial,
    message: AppConfig.labels.statusMessages.saveSuccess,
  };
}
// -----------------------

// [Função 85] createGrupo
// Responsabilidade: cadastrar grupo de filiais via área administrativa.
export async function createGrupo(payload) {
  await initAppData();

  const currentUser = assertAuthenticatedUser();

  if (!canManageAdmin(currentUser)) {
    throw new Error(AppConfig.labels.errors.unauthorized);
  }

  const nome = String(payload?.nome || '').trim();
  const filialIds = ensureArray(payload?.filialIds).filter(Boolean);

  if (!isFilled(nome) || filialIds.length === 0) {
    throw new Error('Informe o nome do grupo e selecione pelo menos uma filial.');
  }

  const id = generateId('grupo');
  const createdAt = nowIso();

  const nextGrupo = {
    id,
    nome,
    filialIds,
    ativo: true,
    criadoEm: createdAt,
    atualizadoEm: createdAt,
  };

  await writeValue(`${getGruposPath()}/${id}`, nextGrupo);
  await refreshCaches();

  return {
    success: true,
    grupo: nextGrupo,
    message: AppConfig.labels.statusMessages.saveSuccess,
  };
}
// -----------------------

// [Função 86] subscribeDevolucoesRealtime
// Responsabilidade: assinar mudanças em tempo real nas devoluções e atualizar cache local.
export function subscribeDevolucoesRealtime(callback) {
  assertRuntimeInitialized();

  return subscribeValue(getDevolucoesPath(), (value) => {
    ServiceRuntime.cache.devolucoes = value || {};
    if (typeof callback === 'function') {
      callback(toArray(ServiceRuntime.cache.devolucoes));
    }
  });
}
// -----------------------

// [Função 87] subscribeLookupsRealtime
// Responsabilidade: assinar mudanças em usuários, filiais e grupos para manter o app sincronizado.
export function subscribeLookupsRealtime(callback) {
  assertRuntimeInitialized();

  const unsubs = [
    subscribeValue(getUsersPath(), (value) => {
      ServiceRuntime.cache.users = value || {};
      if (typeof callback === 'function') callback();
    }),
    subscribeValue(getFiliaisPath(), (value) => {
      ServiceRuntime.cache.filiais = value || {};
      if (typeof callback === 'function') callback();
    }),
    subscribeValue(getGruposPath(), (value) => {
      ServiceRuntime.cache.grupos = value || {};
      if (typeof callback === 'function') callback();
    }),
  ];

  return () => {
    unsubs.forEach((unsubscribe) => unsubscribe());
  };
}
// -----------------------

// [Função 88] getPermissionSnapshot
// Responsabilidade: expor permissões globais relevantes do usuário atual para a interface.
export function getPermissionSnapshot() {
  const user = assertAuthenticatedUser();

  return {
    canCreateDevolucao: canCreateDevolucao(user),
    canManageAdmin: canManageAdmin(user),
    isObservador: isObservador(user),
    isAdmin: isAdmin(user),
    isCompras: isCompras(user),
    isLoja: isLoja(user),
  };
}
// -----------------------
