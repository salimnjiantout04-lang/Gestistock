import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export const exportStockExcel = (products) => {
  const statusLabel = { normal: 'Normal', faible: 'Faible', rupture: 'Rupture' }

  // Feuille 1 - Résumé
  const total  = products.length
  const valeur = products.reduce((s, p) => s + p.quantity * p.price, 0)
  const rupture = products.filter(p => p.stock_status === 'rupture').length
  const faible  = products.filter(p => p.stock_status === 'faible').length

  const resume = [
    ['GESTISTOCK - Rapport de stock'],
    ['Généré le', new Date().toLocaleDateString('fr-FR')],
    [],
    ['RÉSUMÉ'],
    ['Total produits',  total],
    ['Valeur du stock', Math.round(valeur) + ' FCFA'],
    ['En rupture',      rupture],
    ['Stock faible',    faible],
  ]

  // Feuille 2 - Produits
  const headers = [
    'Produit',
    'Référence',
    'Catégorie',
    'Prix (FCFA)',
    'Quantité',
    'Unité',
    'Seuil minimum',
    'Statut',
    'Valeur stock (FCFA)',
  ]

  const rows = products.map(p => [
    p.name,
    p.reference,
    p.category?.name || '—',
    Math.round(p.price),
    p.quantity,
    p.unit,
    p.quantity_min,
    statusLabel[p.stock_status] || '—',
    Math.round(p.quantity * p.price),
  ])

  // Feuille 3 - Alertes
  const alertes = products
    .filter(p => p.stock_status !== 'normal')
    .map(p => [
      p.name,
      p.reference,
      p.quantity + ' ' + p.unit,
      p.quantity_min + ' ' + p.unit,
      statusLabel[p.stock_status],
    ])

  // Création du workbook
  const wb = XLSX.utils.book_new()

  // Feuille Résumé
  const wsResume = XLSX.utils.aoa_to_sheet(resume)
  wsResume['A1'].s = { font: { bold: true, sz: 14 } }
  XLSX.utils.book_append_sheet(wb, wsResume, 'Résumé')

  // Feuille Produits
  const wsProduits = XLSX.utils.aoa_to_sheet([headers, ...rows])
  wsProduits['!cols'] = [
    { wch: 35 }, { wch: 12 }, { wch: 18 }, { wch: 12 },
    { wch: 10 }, { wch: 8  }, { wch: 14 }, { wch: 10 }, { wch: 18 },
  ]
  XLSX.utils.book_append_sheet(wb, wsProduits, 'Produits')

  // Feuille Alertes
  if (alertes.length > 0) {
    const wsAlertes = XLSX.utils.aoa_to_sheet([
      ['Produit', 'Référence', 'Stock actuel', 'Seuil min', 'Statut'],
      ...alertes
    ])
    wsAlertes['!cols'] = [
      { wch: 35 }, { wch: 12 }, { wch: 14 }, { wch: 10 }, { wch: 10 },
    ]
    XLSX.utils.book_append_sheet(wb, wsAlertes, 'Alertes')
  }

  // Export
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
  saveAs(blob, `gestistock-rapport-${new Date().toISOString().slice(0, 10)}.xlsx`)
}