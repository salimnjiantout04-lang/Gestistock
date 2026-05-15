import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export const exportStockPDF = (products) => {
  const doc = new jsPDF()

  // En-tête
  doc.setFillColor(37, 99, 235)
  doc.rect(0, 0, 210, 30, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('GestiStock', 14, 15)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Rapport de stock', 14, 23)

  // Date
  const date = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
  doc.text(`Genere le ${date}`, 140, 15)

  // Statistiques
  const total   = products.length
  const valeur  = products.reduce((s, p) => s + p.quantity * p.price, 0)
  const rupture = products.filter(p => p.stock_status === 'rupture').length
  const faible  = products.filter(p => p.stock_status === 'faible').length

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Resume', 14, 42)

  autoTable(doc, {
    startY: 46,
    head: [],
    body: [
      ['Total produits',  String(total)],
      ['Valeur du stock', Math.round(valeur) + ' FCFA'],
      ['En rupture',      String(rupture)],
      ['Stock faible',    String(faible)],
    ],
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, textColor: [100, 100, 100] },
      1: { cellWidth: 80 },
    },
  })

  // Tableau produits
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Liste des produits', 14, doc.lastAutoTable.finalY + 12)

  const statusLabel = { normal: 'Normal', faible: 'Faible', rupture: 'Rupture' }

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 16,
    head: [['Produit', 'Reference', 'Categorie', 'Prix (FCFA)', 'Quantite', 'Statut']],
    body: products.map(p => [
      p.name,
      p.reference,
      p.category?.name || '-',
      String(Math.round(p.price)),
      p.quantity + ' ' + p.unit,
      statusLabel[p.stock_status] || '-',
    ]),
    headStyles: {
      fillColor:   [37, 99, 235],
      textColor:   255,
      fontStyle:   'bold',
      fontSize:    9,
    },
    bodyStyles:          { fontSize: 9 },
    alternateRowStyles:  { fillColor: [245, 247, 255] },
    didDrawCell: (data) => {
      if (data.section === 'body' && data.column.index === 5) {
        const status = data.cell.raw
        if (status === 'Rupture') {
          doc.setTextColor(220, 38, 38)
        } else if (status === 'Faible') {
          doc.setTextColor(202, 138, 4)
        } else {
          doc.setTextColor(22, 163, 74)
        }
        doc.setFontSize(9)
        doc.text(status, data.cell.x + 2, data.cell.y + 5)
        doc.setTextColor(0, 0, 0)
        return false
      }
    },
  })

  // Pied de page
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(`Page ${i} / ${pageCount}`, 105, 290, { align: 'center' })
    doc.text('GestiStock - Rapport ', 14, 290)
  }

  doc.save(`gestistock-rapport-${new Date().toISOString().slice(0, 10)}.pdf`)
}