const express = require('express');
const cors = require('cors'); // <--- agregalo
const dotenv = require('dotenv');
const { appendRow, findRowByPhone,updateRowStatus,getData,updateState} = require('./sheets');

dotenv.config();

const app = express();
app.use(cors()); // <--- y esto también
app.use(express.json());

const sessions = {};

app.post('/webhook', async (req, res) => {
  const { nombre, barrio, medidasypre, pago, horario} = req.body;

  const timestamp = new Date().toLocaleString('es-AR');

  await appendRow([timestamp, nombre, barrio, medidasypre, pago, horario]);

  res.send('Datos guardados en Google Sheets');
});

if (estado === 'para enviar') {
  // enviar mensaje por WhatsApp...

  const timestamp = new Date().toLocaleString('es-AR');
  await updateState(i + 1, 'enviado', timestamp); // <--- acá se registra el cambio
}

const flow = [
  'Nombre:',
  'Barrio/Ciudad: ',
  'Medidas aprox. pileta y presupuesto previsto: ',
  'Formas de pago:',
  'Horario de contacto: ',
];

app.post('/chat', async (req, res)=>{
  const {telefono, mensaje} = req.body;
  const respuesta = mensaje.split('\n').map(r => r.trim());

if(!sessions[telefono]){
  sessions[telefono]= {
    step: 0,
    data: [],
  }
}
const session = sessions[telefono];

if(respuesta.length < 5){
  return res.json({respuesta: 'Por favor responde siguiendo el formato, con cada dato en una línea distinta.'})
}

const timestamp = new Date().toLocaleString('es-AR');
const [nombre, ubicacion, medidasypre, pago ,horario] = respuesta;

await appendRow([timestamp,nombre, ubicacion, medidasypre, pago, horario]);
res.json({respuesta: '!Gracias por tu consulta! Recibimos tu información y pronto te contactaremos.'})
})

app.get('/', (req, res) => {
  res.send('Servidor activo');
});


app.post('/test-update', async (req, res) => {
  const { telefono, estado, enlacePDF, observacion } = req.body;

  const result = await findRowByPhone(telefono);

  if (!result) {
    return res.status(404).json({ error: 'No se encontró ese número.' });
  }

  await updateRowStatus(result.rowNumber, estado, enlacePDF, observacion);
  res.json({ message: `Estado actualizado para ${telefono}, fila: ${result.rowNumber}` });
});
const { sendMessage } = require('./whatsapp'); // suponiendo que tenés un archivo que hace esto

async function enviarPresupuestos() {
  const datos = await getData();

  for (let i = 0; i < datos.length; i++) {
    const fila = datos[i];
    const estado = fila[7]; // asumimos que columna G = estado
    const telefono = fila[6]?.toLowerCase(); // columna H = teléfono
    const enlace = fila[8]; // columna I = enlace

    if (estado && estado.toLowerCase() === 'para enviar') {
      try {
        await sendMessage(telefono, `¡Hola! Te compartimos tu presupuesto:\n${enlace}`);
        const fechaEnvio = new Date().toLocaleString('es-AR');
        await updateState(i + 2, 'enviado', fechaEnvio); // +2 porque los arrays arrancan en 0 y tu sheet tiene encabezados
      } catch (error) {
        console.error(`Error al enviar a ${telefono}:`, error);
      }
    }
  }
}

// Llamalo al iniciar o programalo con un cronjob
enviarPresupuestos();


const PORT = process.env.PORT || 3001;
console.log("Antes de escuchar el servidor");
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puero: ${PORT}`)
});
