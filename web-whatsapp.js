// const { Client, LocalAuth } = require('whatsapp-web.js');
// const qrcode = require('qrcode-terminal');

// const client = new Client({
//   authStrategy: new LocalAuth(),
//   puppeteer: {
//     headless: true,
//     args: ['--no-sandbox', '--disable-setuid-sandbox']
//   }
// });

// client.on('qr', (qr) => {
//   console.log('Escaneá este QR solo la primera vez:');
//   qrcode.generate(qr, { small: true });
// });

// client.on('ready', () => {
//   console.log('✅ WhatsApp está listo y autenticado.');
// });

// client.on('auth_failure', (msg) => {
//   console.error('❌ Fallo de autenticación:', msg);
// });

// client.on('disconnected', (reason) => {
//   console.log('❌ Cliente desconectado:', reason);
// });

// module.exports = client;

require('dotenv').config(); // 👈 Importa las variables del .env

const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: process.env.SESSION_FOLDER // 👈 Usa la variable del .env
  }),
  puppeteer: {
    headless: false, // si querés ver el navegador para escanear el QR
    args: ['--no-sandbox']
  }
});

client.on('qr', (qr) => {
  console.log('🔲 Escanea este QR con tu nuevo número:');
  console.log(qr);
});

client.on('ready', () => {
  console.log('✅ ¡Sesión iniciada correctamente!');
});

module.exports = client;
