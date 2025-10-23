const AWS = require('aws-sdk');
const PDFDocument = require('pdfkit');
const streamBuffers = require('stream-buffers');

const s3 = new AWS.S3({
  accessKeyId: process.env.YANDEX_ACCESS_KEY,
  secretAccessKey: process.env.YANDEX_SECRET_KEY,
  endpoint: process.env.YANDEX_ENDPOINT,
  region: 'ru-central1',
  signatureVersion: 'v4'
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).send('Method Not Allowed'); return; }

  const { tracks } = req.body;
  if (!tracks || !Array.isArray(tracks) || tracks.length === 0) {
    res.status(400).json({ error: 'Tracks not provided' });
    return;
  }

  // Генерация PDF в памяти
  const doc = new PDFDocument();
  const pdfStream = new streamBuffers.WritableStreamBuffer();
  doc.pipe(pdfStream);
  doc.fontSize(18).text('Track List', { align: 'center' }).moveDown();
  tracks.forEach((track, idx) => {
    doc.fontSize(14).text(`${idx + 1}. ${track.title} — ${track.artist}`);
  });
  doc.end();

  pdfStream.on('finish', async () => {
    const buffer = pdfStream.getContents();
    const filename = `tracklist-${Date.now()}.pdf`;
    await s3.putObject({
      Bucket: process.env.YANDEX_BUCKET,
      Key: filename,
      Body: buffer,
      ACL: 'public-read',
      ContentType: 'application/pdf'
    }).promise();

    const fileUrl = `${process.env.YANDEX_ENDPOINT}/${process.env.YANDEX_BUCKET}/${filename}`;
    res.status(200).json({ url: fileUrl });
  });
};

