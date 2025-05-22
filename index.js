const client = require('./web-whatsapp');
const sendBudgets = require('./sendBudgetMessage');
const { addDataToSheet } = require('./sheets');

const mensajeBienvenida = `👋🏻 Gracias por escribir a ODA construcciones. Tu piscina está cada vez más cerca.   
Dejanos tus  datos:
- Nombre:
- Barrio / Ciudad:
- Medidas aprox pileta y presupuesto previsto:
- Formas de pago:
- Horario de contacto:`;


client.on('message', async (msg) => {
   if (msg.body.toLowerCase().includes('hola') || message.body.length < 15) {
    await msg.reply(mensajeBienvenida);
    return;
  }
  try {
    console.log('Mensaje recibido:', msg.body);

    const texto = msg.body.trim();
    const partes = texto.split(',');

    if (partes.length >= 6) {
      const [nombre, barrio, presupuesto, medioPago, horario, telefono] = partes.map(p => p.trim());

      await addDataToSheet([new Date().toLocaleString('es-AR'), nombre, barrio, presupuesto, medioPago, horario, telefono]);

      await msg.reply('✅ Datos recibidos y guardados correctamente. ¡Gracias!');
    } else {
      await msg.reply('❌ Formato incorrecto. Por favor envía: nombre, barrio, presupuesto, medio de pago, horario, teléfono');
    }
  } catch (error) {
    console.error('Error procesando mensaje:', error);
    await msg.reply('⚠️ Hubo un error guardando tus datos. Intenta nuevamente.');
  }
});


client.on('ready', async () => {
  console.log('🚀 Cliente iniciado. Enviando presupuestos...');
  await sendBudgets();
});

client.initialize();
