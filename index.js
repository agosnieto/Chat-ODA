const client = require('./web-whatsapp');
const sendBudgets = require('./sendBudgetMessage');

client.on('ready', async () => {
  console.log('🚀 Cliente iniciado. Enviando presupuestos...');
  await sendBudgets();
});

client.initialize();
