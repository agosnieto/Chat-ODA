const { getData, updateState } = require('./sheets');
const { Client } = require('whatsapp-web.js');
const qrTerminal = require('qrcode-terminal');
const client = new Client();

client.on('qr', (qr) => {
  qrTerminal.generate(qr, { small: true });
  console.log('Escanea el QR para conectarte:', qr);
});

client.on('ready', async () => {
  console.log('WhatsApp está listo');

  // Leer los datos desde Sheets
  const rows = await getData();

  for (let i = 1; i < rows.length; i++) {  // Comienza desde la fila 1 para evitar encabezados
    const [telefono, presupuesto, estado, fechaEnvio, pdfLink] = rows[i];

    if (estado === 'para enviar') {
      // Si hay un enlace de PDF, lo enviamos
      try {
        const chat = await client.getChatById(`${telefono}@c.us`);
        
        if (pdfLink) {
          // Enviar el PDF
          await chat.sendMessage('Aquí está el presupuesto en PDF: ', { linkPreview: false });
          await chat.sendMessage(pdfLink);
        } else {
          // Si no hay enlace de PDF, enviamos solo el presupuesto
          await chat.sendMessage(presupuesto);
        }

        console.log(`Presupuesto enviado a ${telefono}`);

        // Actualizar el estado a "enviado" y agregar la fecha de envío
        const timestamp = new Date().toLocaleString('es-AR');
        await updateState(i + 1, 'enviado', timestamp);  // +1 porque las filas en Sheets son 1-indexadas

      } catch (error) {
        console.error(`Error enviando el presupuesto a ${telefono}:`, error);
      }
    }
  }
});

client.initialize();
