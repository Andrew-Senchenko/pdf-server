const PDFDocument = require('pdfkit');

module.exports = (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const { tracks } = req.body;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="tracklist.pdf"');

  const doc = new PDFDocument();
  doc.pipe(res);

  doc.fontSize(18).text('Track List', { align: 'center' });
  doc.moveDown();

  (tracks || []).forEach((track, idx) => {
    doc.fontSize(14).text(`${idx + 1}. ${track.title} — ${track.artist}`);
  });

  doc.end();
};
