const express = require('express');
const cors = require('cors'); // <--- agregalo
const dotenv = require('dotenv');
const { appendRow } = require('./sheets');

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


const PORT = process.env.PORT || 3001;
console.log("Antes de escuchar el servidor");
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puero: ${PORT}`)
});
