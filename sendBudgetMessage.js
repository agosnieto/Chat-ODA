const client = require('./web-whatsapp');
const { getData, updateState } = require('./sheets');

const sendBudgets = async () => {
  try {
    const rows = await getData();
    console.log("📥 Datos obtenidos:", rows);

    let enviados = 0;

    for (let i = 0; i < rows.length; i++) {
      const fila = rows[i];
      const telefono = fila[6]?.toString().trim(); // Aseguramos que esté limpio
      const estado = fila[7]?.toLowerCase().trim();
      const enlacePdf = fila[8];

      if (estado === 'para enviar' && telefono) {
        try {
          const chatId = `${telefono}@c.us`;

          const isRegistered = await client.isRegisteredUser(chatId);

          if (!isRegistered) {
            console.warn(`⚠️ El número ${telefono} no está registrado en WhatsApp.`);
            continue;
          }

          console.log(`📨 Enviando mensaje a ${telefono}...`);
          await client.sendMessage(chatId, '¡Hola! Te compartimos tu presupuesto:');
          if (enlacePdf) {
            await client.sendMessage(chatId, enlacePdf);
            console.log(`📎 Enlace enviado: ${enlacePdf}`);
          }

          const fecha = new Date().toLocaleString('es-AR');
          await updateState(i + 2, 'enviado', fecha);
          console.log(`✅ Presupuesto enviado a ${telefono}`);
          enviados++;

        } catch (err) {
          console.error(`❌ Error enviando a ${telefono}:`, err.stack || err);
        }
      }
    }

    if (enviados === 0) {
      console.log('ℹ️ No hay presupuestos pendientes de envío.');
    }

  } catch (err) {
    console.error('❌ Error general al enviar presupuestos:', err.stack || err);
  }
};

module.exports = sendBudgets;
