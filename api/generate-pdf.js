const PDFDocument = require('pdfkit');

export default async function handler(req, res) {
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
}
