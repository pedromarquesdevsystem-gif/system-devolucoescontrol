// js/firebase.js
// Inicialização central do Firebase Web SDK modular.
// Este arquivo:
// - valida a configuração global do Firebase
// - inicializa o app uma única vez
// - inicializa o Realtime Database
// - exporta db e helpers do SDK para uso exclusivo dos serviços

import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import {
  getDatabase,
  ref,
  child,
  get,
  set,
  push,
  update,
  remove,
  onValue,
  off,
  query,
  orderByChild,
  equalTo,
  serverTimestamp,
  onDisconnect,
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js';

import {
  AppConfig,
  getFirebaseConfig,
  validateFirebaseConfigShape,
} from './config.js';

// [Função 1] assertFirebaseConfig
// Responsabilidade: validar a configuração do Firebase antes de tentar inicializar o app.
function assertFirebaseConfig() {
  const validation = validateFirebaseConfigShape();

  if (!validation.isValid) {
    throw new Error(
      `${AppConfig.labels.errors.firebaseConfigMissing} Campos pendentes: ${validation.missingKeys.join(', ')}`
    );
  }

  return getFirebaseConfig();
}
// -----------------------

// [Função 2] createFirebaseApp
// Responsabilidade: inicializar o Firebase App uma única vez usando o SDK modular.
function createFirebaseApp() {
  const config = assertFirebaseConfig();

  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp(config);
}
// -----------------------

// [Função 3] createRealtimeDatabase
// Responsabilidade: inicializar e retornar a instância única do Realtime Database vinculada ao app.
function createRealtimeDatabase(firebaseApp) {
  return getDatabase(firebaseApp);
}
// -----------------------

// [Função 4] getDatabaseRef
// Responsabilidade: criar uma referência do Realtime Database para um caminho específico.
export function getDatabaseRef(path = '') {
  if (!path) {
    return ref(db);
  }

  return ref(db, path);
}
// -----------------------

// [Função 5] getChildRef
// Responsabilidade: criar uma referência filha a partir de um caminho base e um segmento adicional.
export function getChildRef(basePath, childPath) {
  const baseRef = getDatabaseRef(basePath);
  return child(baseRef, childPath);
}
// -----------------------

// [Função 6] readValue
// Responsabilidade: realizar leitura única de um caminho do Realtime Database.
export async function readValue(path) {
  const snapshot = await get(getDatabaseRef(path));
  return snapshot.exists() ? snapshot.val() : null;
}
// -----------------------

// [Função 7] writeValue
// Responsabilidade: gravar integralmente um valor em um caminho do Realtime Database.
export async function writeValue(path, value) {
  await set(getDatabaseRef(path), value);
  return true;
}
// -----------------------

// [Função 8] updateValue
// Responsabilidade: atualizar parcialmente um caminho do Realtime Database.
export async function updateValue(path, payload) {
  await update(getDatabaseRef(path), payload);
  return true;
}
// -----------------------

// [Função 9] removeValue
// Responsabilidade: remover um nó do Realtime Database.
export async function removeValue(path) {
  await remove(getDatabaseRef(path));
  return true;
}
// -----------------------

// [Função 10] pushValue
// Responsabilidade: criar um nó com chave automática em um caminho do Realtime Database.
export async function pushValue(path, payload) {
  const newRef = push(getDatabaseRef(path));
  await set(newRef, payload);
  return {
    key: newRef.key,
    path: `${path}/${newRef.key}`,
  };
}
// -----------------------

// [Função 11] subscribeValue
// Responsabilidade: criar assinatura em tempo real para mudanças de um caminho do banco.
export function subscribeValue(path, callback) {
  const targetRef = getDatabaseRef(path);

  const handler = onValue(targetRef, (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : null, snapshot);
  });

  return () => {
    off(targetRef, 'value', handler);
  };
}
// -----------------------

// [Função 12] subscribeOrderedEqual
// Responsabilidade: criar assinatura com query por campo ordenado e valor igual.
export function subscribeOrderedEqual(path, childKey, equalValue, callback) {
  const targetQuery = query(
    getDatabaseRef(path),
    orderByChild(childKey),
    equalTo(equalValue)
  );

  const handler = onValue(targetQuery, (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : null, snapshot);
  });

  return () => {
    off(targetQuery, 'value', handler);
  };
}
// -----------------------

// [Função 13] readOrderedEqual
// Responsabilidade: realizar leitura única usando query por campo ordenado e valor igual.
export async function readOrderedEqual(path, childKey, equalValue) {
  const targetQuery = query(
    getDatabaseRef(path),
    orderByChild(childKey),
    equalTo(equalValue)
  );

  const snapshot = await get(targetQuery);
  return snapshot.exists() ? snapshot.val() : null;
}
// -----------------------

// [Função 14] getServerNow
// Responsabilidade: fornecer o placeholder de timestamp do servidor do Firebase.
export function getServerNow() {
  return serverTimestamp();
}
// -----------------------

// [Função 15] markPresenceOnDisconnect
// Responsabilidade: registrar uma ação de atualização para quando a conexão do cliente cair.
export async function markPresenceOnDisconnect(path, payload) {
  const targetRef = getDatabaseRef(path);
  await onDisconnect(targetRef).update(payload);
  return true;
}
// -----------------------

// [Função 16] pingConnectionState
// Responsabilidade: observar o estado de conectividade do cliente com o Realtime Database.
export function pingConnectionState(callback) {
  const connectedRef = getDatabaseRef('.info/connected');

  const handler = onValue(connectedRef, (snapshot) => {
    callback(snapshot.val() === true);
  });

  return () => {
    off(connectedRef, 'value', handler);
  };
}
// -----------------------

// [Função 17] normalizeFirebaseError
// Responsabilidade: transformar erros do SDK em mensagens amigáveis para a aplicação.
export function normalizeFirebaseError(error) {
  if (!error) {
    return new Error(AppConfig.labels.errors.generic);
  }

  const code = String(error.code || '');
  const message = String(error.message || '');

  if (code.includes('permission-denied')) {
    return new Error(AppConfig.labels.errors.unauthorized);
  }

  if (code.includes('network') || message.toLowerCase().includes('network')) {
    return new Error(AppConfig.labels.errors.network);
  }

  return error instanceof Error
    ? error
    : new Error(message || AppConfig.labels.errors.generic);
}
// -----------------------

// [Função 18] getFirebaseRuntimeInfo
// Responsabilidade: expor dados básicos da instância corrente para diagnóstico e conferência.
export function getFirebaseRuntimeInfo() {
  return {
    appName: app.name,
    databaseURL: getFirebaseConfig().databaseURL,
    projectId: getFirebaseConfig().projectId,
  };
}
// -----------------------

export const app = createFirebaseApp();
export const db = createRealtimeDatabase(app);
