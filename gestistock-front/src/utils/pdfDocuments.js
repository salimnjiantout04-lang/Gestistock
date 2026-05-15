import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const COLORS = {
  primary: [37, 99, 235],
  gray: [100, 100, 100],
  green: [22, 163, 74],
  red: [220, 38, 38],
}

function header(doc, title, subtitle = '') {
  doc.setFillColor(...COLORS.primary)
  doc.rect(0, 0, 210, 35, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('GestiStock', 14, 15)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(title, 14, 24)
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`, 140, 15)
  doc.setTextColor(0, 0, 0)
}

function footer(doc) {
  const pages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(`Page ${i} / ${pages}`, 105, 290, { align: 'center' })
    doc.text('GestiStock', 14, 290)
  }
}

export function exportPurchaseOrderPDF(order) {
  const doc = new jsPDF()
  header(doc, 'Bon de commande', order.reference)

  // Infos
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`Réf: ${order.reference}`, 14, 48)
  doc.setFont('helvetica', 'normal')
  doc.text(`Fournisseur: ${order.supplier?.name || '—'}`, 14, 56)
  doc.text(`Date: ${new Date(order.created_at).toLocaleDateString('fr-FR')}`, 14, 62)
  doc.text(`Statut: ${statusFr(order.status)}`, 14, 68)
  if (order.notes) doc.text(`Notes: ${order.notes}`, 14, 74)

  // Tableau
  autoTable(doc, {
    startY: order.notes ? 80 : 74,
    head: [['Produit', 'Réf.', 'Qté', 'Prix unitaire', 'Total']],
    body: order.items.map(i => [
      i.product?.name || '—',
      i.product?.reference || '—',
      String(i.quantity),
      Number(i.unit_price).toLocaleString() + ' FCFA',
      Number(i.subtotal).toLocaleString() + ' FCFA',
    ]),
    foot: [[{ content: 'Total', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right', textColor: COLORS.primary } },
      '', Number(order.total).toLocaleString() + ' FCFA']],
    headStyles: { fillColor: COLORS.primary, textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    footStyles: { fontSize: 10, fontStyle: 'bold', fillColor: [245, 247, 255] },
    alternateRowStyles: { fillColor: [245, 247, 255] },
  })

  footer(doc)
  doc.save(`bon-commande-${order.reference}.pdf`)
}

export function exportDeliveryNotePDF(order) {
  const doc = new jsPDF()
  header(doc, 'Bon de livraison', order.reference)

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`Réf: ${order.reference}`, 14, 48)
  doc.setFont('helvetica', 'normal')
  doc.text(`Client: ${order.customer_name}`, 14, 56)
  if (order.customer_address) doc.text(`Adresse: ${order.customer_address}`, 14, 62)
  doc.text(`Date: ${new Date(order.delivered_at || order.created_at).toLocaleDateString('fr-FR')}`, 14, order.customer_address ? 68 : 62)

  const startY = order.customer_address ? 74 : 68

  autoTable(doc, {
    startY,
    head: [['Produit', 'Réf.', 'Qté', 'Prix unitaire', 'Total']],
    body: order.items.map(i => [
      i.product?.name || '—',
      i.product?.reference || '—',
      String(i.quantity),
      Number(i.unit_price).toLocaleString() + ' FCFA',
      Number(i.subtotal).toLocaleString() + ' FCFA',
    ]),
    foot: [[{ content: 'Total', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } },
      '', Number(order.total).toLocaleString() + ' FCFA']],
    headStyles: { fillColor: COLORS.green, textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    footStyles: { fontSize: 10, fontStyle: 'bold', fillColor: [236, 253, 245] },
    alternateRowStyles: { fillColor: [236, 253, 245] },
  })

  footer(doc)
  doc.save(`bon-livraison-${order.reference}.pdf`)
}

export function exportInventoryReportPDF(products) {
  const doc = new jsPDF()
  header(doc, "Rapport d'inventaire")

  const total = products.length
  const valeur = products.reduce((s, p) => s + p.quantity * p.price, 0)
  const rupture = products.filter(p => p.stock_status === 'rupture').length
  const faible = products.filter(p => p.stock_status === 'faible').length

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Résumé', 14, 48)

  autoTable(doc, {
    startY: 52,
    body: [
      ['Total produits', String(total)],
      ['Valeur du stock', Math.round(valeur).toLocaleString() + ' FCFA'],
      ['En rupture', String(rupture)],
      ['Stock faible', String(faible)],
    ],
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50, textColor: COLORS.gray }, 1: { cellWidth: 80 } },
  })

  const statusLabel = { normal: 'Normal', faible: 'Faible', rupture: 'Rupture' }

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 12,
    head: [['Produit', 'Réf.', 'Catégorie', 'Prix', 'Quantité', 'Statut']],
    body: products.map(p => [
      p.name, p.reference, p.category?.name || '—',
      Math.round(p.price).toLocaleString() + ' FCFA',
      `${p.quantity} ${p.unit}`,
      statusLabel[p.stock_status] || '—',
    ]),
    headStyles: { fillColor: COLORS.primary, textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [245, 247, 255] },
    didDrawCell: (data) => {
      if (data.section === 'body' && data.column.index === 5) {
        const status = data.cell.raw
        const color = status === 'Rupture' ? COLORS.red : status === 'Faible' ? [202, 138, 4] : COLORS.green
        doc.setTextColor(...color)
        doc.setFontSize(9)
        doc.text(status, data.cell.x + 2, data.cell.y + 5)
        doc.setTextColor(0, 0, 0)
        return false
      }
    },
  })

  footer(doc)
  doc.save(`inventaire-${new Date().toISOString().slice(0, 10)}.pdf`)
}

function statusFr(status) {
  const map = {
    brouillon: 'Brouillon', commande: 'Commandé', recu: 'Reçu', annule: 'Annulé',
    confirme: 'Confirmé', livre: 'Livré', valide: 'Validé',
  }
  return map[status] || status
}
