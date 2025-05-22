const { google } = require('googleapis');
require('dotenv').config();

const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  null,
  process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  ['https://www.googleapis.com/auth/spreadsheets']
);

const sheets = google.sheets({ version: 'v4', auth });
const SHEET_NAME = 'DatosClientes';

const appendRow = async (data) => {
  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SHEET_ID,
      range: `${SHEET_NAME}!A1`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [data] },
    });
    console.log('Fila agregada:', response.data.updates.updatedRange);
  } catch (error) {
    console.error('Error al escribir en Sheets:', error);
  }
};

const getData = async () => {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      range: `${SHEET_NAME}!A2:J100`,
    });
    return res.data.values || [];
  } catch (error) {
    console.error('Error al leer de Sheets:', error);
    return [];
  }
};

const findRowByPhone = async (telefono) => {
  const rows = await getData();
  const index = rows.findIndex(row => row[6] === telefono);
  return index >= 0 ? { rowNumber: index + 2, rowData: rows[index] } : null;
};

const updateState = async (rowNumber, newState, fechaEnvio) => {
  try {
    const range = `${SHEET_NAME}!H${rowNumber}:I${rowNumber}`;
    const values = [[newState, fechaEnvio]];

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });

    console.log(`Estado actualizado para la fila ${rowNumber}`);
  } catch (error) {
    console.error('Error al actualizar estado:', error);
  }
};

const updateRowStatus = async (rowNumber, estado, enlacePdf, observacion = '') => {
  try {
    const range = `${SHEET_NAME}!H${rowNumber}:J${rowNumber}`;
    const values = [[estado, enlacePdf, observacion]];

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });

    console.log(`Fila ${rowNumber} actualizada con estado "${estado}"`);
  } catch (error) {
    console.error('Error al actualizar fila:', error);
  }
};  

async function addDataToSheet(row) {
  const request = {
    spreadsheetId: process.env.SHEET_ID,
    range: SHEET_NAME, // Empezar en la segunda fila (bajo encabezados)
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    resource: {
      values: [row],
    },
  };

  try {
    await sheets.spreadsheets.values.append(request);
    console.log('Fila agregada:', row);
  } catch (err) {
    console.error('Error agregando fila:', err);
    throw err;
  }
}

module.exports = {
  appendRow,
  getData,
  findRowByPhone,
  updateRowStatus,
  updateState,
  addDataToSheet
};
