import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// เพิ่ม route '/' สำหรับทดสอบ
app.get('/', (req, res) => {
  res.send('Backend is working! Hello from Render!');
});

app.post('/feedback', async (req, res) => {
  try {
    const { rating, feedbackText, deviceType, browser, pageVersion, sessionId } = req.body;

    const values = [
      [new Date().toISOString(), rating, feedbackText, deviceType, browser, pageVersion, sessionId],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'CareerSuggestion_Feedback!A:G',
      valueInputOption: 'RAW',
      resource: { values },
    });

    res.json({ status: 'success' });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
