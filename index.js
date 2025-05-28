const client = require('./web-whatsapp');
const sendBudgets = require('./sendBudgetMessage');
const { addDataToSheet } = require('./sheets');
const { text } = require('express');

function detectarIntencion(texto) {
  const msg = texto.toLowerCase();

  if (/(hola|buenas|buenos días|buenas tardes|qué tal | que onda)/.test(msg)) {
    return 'saludo';
  }

  if (/(gracias|muchas gracias|te agradezco)/.test(msg)) {
    return 'agradecimiento';
  }

  if (/(agendar|cita|coordinar|visita|turno|reunión)/.test(msg)) {
    return 'agendar';
  }

  if (msg.split(',').length >= 6) {
    return 'datos';
  }

  return 'otro';
}

function contienePalabraClave(texto, palabras) {
  return palabras.some(p => texto.toLowerCase().includes(p));
}

const mensajeBienvenida = `👋🏻 Gracias por escribir a ODA construcciones. Tu piscina está cada vez más cerca.   
Dejanos tus  datos:
- Nombre:
- Barrio / Ciudad:
- Medidas aprox pileta y presupuesto previsto:
- Formas de pago:
- Horario de contacto:`;

const { extraerHorario } = require('./horarios');

// Luego lo usás cuando el cliente mande su disponibilidad:
const disponibilidad = extraerHorario(mensajeDelCliente);

function normalizarTelefono(telefono) {
  let numero = telefono.replace(/\D/g, ''); // Elimina cualquier carácter que no sea número

  if (numero.startsWith('549')) {
    return numero; // Ya está en formato correcto
  }

  if (numero.startsWith('54')) {
    return '549' + numero.slice(2); // Le falta el 9
  }

  if (numero.startsWith('9')) {
    return '549' + numero.slice(1); // Está sin 54
  }

  if (numero.startsWith('15')) {
    return '549351' + numero.slice(2); // Suponiendo que es de Córdoba capital sin característica
  }

  if (numero.startsWith('351')) {
    return '549' + numero; // Córdoba sin 54 ni 9
  }

  // Si solo tiene 10 dígitos (ej. 351XXXXXXX), se asume que es de Argentina sin prefijo
  if (numero.length === 10) {
    return '549' + numero;
  }

  // Si no cumple ninguna, se devuelve como está (para que puedas revisar)
  return numero;
}


if (disponibilidad) {
  console.log('Hora de inicio:', disponibilidad.inicio);
  console.log('Hora de fin:', disponibilidad.fin);
} else {
  console.log('No se pudo extraer el horario 😥');
}

client.on('message', async (msg) => {
  try {
    const texto = msg.body.trim();
    const intencion = detectarIntencion(texto);

    switch (intencion) {
      case 'saludo':
        await msg.reply(mensajeBienvenida);
        break;

      case 'agradecimiento':
        await msg.reply('🙌 ¡De nada! Si querés agendar una visita o recibir un presupuesto, solo avisá.');
        break;

      case 'agendar':
        await msg.reply('📅 Perfecto, ¿qué día y horario te viene bien para coordinar la visita?');
        break;

      case 'datos':
        const partes = msg.body.split('\n');
        if (partes.length >= 6) {

          let [nombre, barrio, presupuesto, medioPago, horario, telefono] = partes.map(p => p.trim());
          const telefonoNormalizado = normalizarTelefono(telefono);
          await addDataToSheet([new Date().toLocaleString('es-AR'), 
            nombre, 
            barrio, 
            presupuesto, 
            medioPago, 
            horario, 
            telefonoNormalizado]);
          await msg.reply('✅ Datos recibidos y guardados correctamente. ¡Gracias!');
        } else {
          await msg.reply('❌ Formato incorrecto. Por favor envía: nombre, barrio, presupuesto, medio de pago, horario, teléfono');
        }
        break;

      case 'otro':
      default:
        if (contienePalabraClave(texto,['presupuesto', 'precio', 'costo','presu', 'info'])) {
            await msg.reply(mensajeBienvenida);
            return;
        }
        else if (contienePalabraClave(texto, ['agendar', 'visita', 'coordinar'])) {
         await  msg.reply('📅 Perfecto, ¿qué día y horario te viene bien para coordinar la visita?');
         return;
        }else if (contienePalabraClave(texto, ['info', 'información', 'consultar', 'saber'])){
          await msg.reply('📄 ¡Claro! Podemos enviarte toda la info sobre los modelos de piletas, plazos y garantías. ¿Tenés algo puntual que te interese saber?');
          return;
        }
        else{
          // await msg.reply('🤖 ¿Querés un presupuesto, agendar una cita o recibir información? Estoy para ayudarte.')
          await msg.reply('Te derivaré con un asesor comercial. Muchas gracias por tu consulta!')
          return;
        }
      
    }
  } catch (error) {
    console.error('Error procesando mensaje:', error);
    await msg.reply('⚠️ Hubo un error. Intentá nuevamente.');
  }
});


client.initialize();
