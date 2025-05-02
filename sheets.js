const { google } = require('googleapis');
require('dotenv').config();

const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  null,
  process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  ['https://www.googleapis.com/auth/spreadsheets']
);

const sheets = google.sheets({ version: 'v4', auth });

const appendRow = async (data) => {
  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SHEET_ID,
      range: 'A1', 
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [data],
      },
    });
    console.log('Fila agregada:', response.data.updates.updatedRange);
  } catch (error) {
    console.error('Error al escribir en Sheets:', error);
  }
};

module.exports = { appendRow };