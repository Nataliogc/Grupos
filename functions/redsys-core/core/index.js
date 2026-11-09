/**
 * Punto de entrada principal del core de integración centralizada Redsys
 */

const cryptoUtils = require('./redsys-crypto');
const hotelsConfig = require('./hotels-config');
const routingEngine = require('./routing-engine');
const paymentCalculator = require('./payment-calculator');
const transactionStore = require('./transaction-store');
const orderIdGenerator = require('./order-id-generator');
const retryWorker = require('./retry-worker');
const firebaseClients = require('./firebase-clients');
const crossDispatcher = require('../dispatchers/cross-project-dispatcher');
const scheduledRetry = require('../triggers/scheduled-retry');
const internalReceiver = require('../endpoints/internal-receiver');

module.exports = {
  ...cryptoUtils,
  ...hotelsConfig,
  ...routingEngine,
  ...paymentCalculator,
  ...transactionStore,
  ...orderIdGenerator,
  ...retryWorker,
  ...firebaseClients,
  ...crossDispatcher,
  ...scheduledRetry,
  ...internalReceiver
};
