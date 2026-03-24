import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Poliza } from '../types';

interface EstadisticasReporte {
  totalPolizas: number;
  promedioPremas: number;
  tipoMasAsegurado: string;
  maxConteoTipo: number;
  polizaMasAlta: Poliza | null;
  conductoresSinAccidentes: number;
  clientesRiesgoAltoOCritico: number;
}

type DocConTabla = jsPDF & {
  lastAutoTable?: { finalY?: number };
};

const COLOR = {
  slate900: [15, 23, 42] as [number, number, number],
  slate700: [51, 65, 85] as [number, number, number],
  slate500: [100, 116, 139] as [number, number, number],
  slate200: [226, 232, 240] as [number, number, number],
  slate100: [241, 245, 249] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  emerald: [16, 185, 129] as [number, number, number],
} as const;

const formatoMoneda = (valor: number): string =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(valor);

const obtenerColorRiesgoRGB = (clasificacion: string): [number, number, number] => {
  switch (clasificacion) {
    case 'Bajo':
      return [22, 163, 74];
    case 'Medio':
      return [37, 99, 235];
    case 'Alto':
      return [217, 119, 6];
    case 'Crítico':
      return [220, 38, 38];
    default:
      return [107, 114, 128];
  }
};

const safeFileName = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();

const getFinalY = (doc: DocConTabla, fallback: number) => doc.lastAutoTable?.finalY ?? fallback;

const dibujarEncabezado = (doc: jsPDF, titulo: string, subtitulo: string) => {
  doc.setFillColor(...COLOR.slate900);
  doc.rect(0, 0, 210, 34, 'F');

  doc.setFillColor(...COLOR.slate700);
  doc.rect(0, 34, 210, 6, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...COLOR.white);
  doc.text('Sistema de Cálculo de Pólizas de Seguro de Auto', 14, 13);

  doc.setFontSize(11);
  doc.text(titulo, 14, 21);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(220, 230, 240);
  doc.text(subtitulo, 14, 28);
};

const agregarPie = (doc: jsPDF) => {
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(...COLOR.slate200);
    doc.line(14, 286, 196, 286);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...COLOR.slate500);
    doc.text('Documento generado automáticamente por el sistema', 14, 291);
    doc.text(`Página ${page} de ${pages}`, 196, 291, { align: 'right' });
  }
};

const dibujarKpi = (
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  titulo: string,
  valor: string,
  acento: [number, number, number],
) => {
  doc.setFillColor(...COLOR.white);
  doc.setDrawColor(...COLOR.slate200);
  doc.roundedRect(x, y, w, 25, 3, 3, 'FD');

  doc.setFillColor(...acento);
  doc.rect(x, y, 3, 25, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLOR.slate500);
  doc.setFontSize(8.5);
  doc.text(titulo, x + 6, y + 8);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLOR.slate900);
  doc.setFontSize(12);
  doc.text(valor, x + 6, y + 17);
};

export const exportarPolizaPDF = (poliza: Poliza) => {
  const doc = new jsPDF();
  const fecha = new Date().toLocaleString('es-MX');
  const docTabla = doc as DocConTabla;

  dibujarEncabezado(doc, 'Reporte individual de póliza', `Emitido: ${fecha}`);

  const colorRiesgo = obtenerColorRiesgoRGB(poliza.clasificacionRiesgo);
  doc.setFillColor(...COLOR.slate100);
  doc.roundedRect(14, 46, 182, 16, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(...COLOR.slate900);
  doc.text(poliza.nombre, 18, 56);

  doc.setFillColor(...colorRiesgo);
  doc.roundedRect(154, 49, 38, 9, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLOR.white);
  doc.text(poliza.clasificacionRiesgo, 173, 55.3, { align: 'center' });

  dibujarKpi(doc, 14, 68, 58, 'Prima anual final', formatoMoneda(poliza.primaAnual), colorRiesgo);
  dibujarKpi(doc, 76, 68, 58, 'Cuota mensual', formatoMoneda(poliza.cuotaMensual), COLOR.slate700);
  dibujarKpi(doc, 138, 68, 58, 'Promoción aplicada', poliza.promoAplicada ? 'Sí' : 'No', COLOR.emerald);

  autoTable(doc, {
    startY: 99,
    head: [['Datos del conductor y vehículo', 'Detalle']],
    body: [
      ['Edad', `${poliza.edad} años`],
      ['Tipo de vehículo', poliza.tipoVehiculo],
      ['Año del vehículo', `${poliza.anioVehiculo}`],
      ['Uso del vehículo', poliza.usoVehiculo],
      ['Zona de circulación', poliza.zonaCirculacion],
      ['Valor comercial', formatoMoneda(poliza.valorVehiculo)],
      ['Accidentes reportados', `${poliza.accidentes}`],
    ],
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 9.8,
      cellPadding: 3,
      lineColor: COLOR.slate200,
      lineWidth: 0.2,
      textColor: COLOR.slate900,
    },
    headStyles: {
      fillColor: COLOR.slate700,
      textColor: COLOR.white,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [250, 251, 253],
    },
  });

  autoTable(doc, {
    startY: getFinalY(docTabla, 150) + 8,
    head: [['Concepto financiero', 'Monto']],
    body: [
      ['Prima base', formatoMoneda(poliza.primaBase)],
      ['Recargos acumulados', formatoMoneda(poliza.recargos)],
      ['Descuentos aplicados', formatoMoneda(poliza.descuentos)],
      ['Prima anual final', formatoMoneda(poliza.primaAnual)],
      ['Cuota mensual', formatoMoneda(poliza.cuotaMensual)],
    ],
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 10,
      cellPadding: 3,
      lineColor: COLOR.slate200,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: COLOR.slate900,
      textColor: COLOR.white,
      fontStyle: 'bold',
    },
    columnStyles: {
      1: { halign: 'right' },
    },
    didParseCell: (hookData) => {
      if (hookData.section === 'body' && hookData.row.index === 3) {
        hookData.cell.styles.fillColor = [241, 245, 249];
        hookData.cell.styles.textColor = COLOR.slate900;
        hookData.cell.styles.fontStyle = 'bold';
      }
    },
    alternateRowStyles: {
      fillColor: [250, 251, 253],
    },
  });

  agregarPie(doc);

  doc.save(`poliza-${safeFileName(poliza.nombre)}-${poliza.id}.pdf`);
};

export const exportarReporteGeneralPDF = (
  estadisticas: EstadisticasReporte,
  totalPolizas: number,
  polizas: Poliza[],
) => {
  const doc = new jsPDF();
  const fecha = new Date().toLocaleString('es-MX');
  const docTabla = doc as DocConTabla;

  dibujarEncabezado(doc, 'Reporte general de estadísticas', `Emitido: ${fecha}`);

  const porcentajeSinAccidentes =
    totalPolizas > 0 ? ((estadisticas.conductoresSinAccidentes / totalPolizas) * 100).toFixed(1) : '0.0';
  const porcentajeRiesgoAlto =
    totalPolizas > 0 ? ((estadisticas.clientesRiesgoAltoOCritico / totalPolizas) * 100).toFixed(1) : '0.0';

  dibujarKpi(doc, 14, 46, 88, 'Total de pólizas', `${estadisticas.totalPolizas}`, COLOR.slate700);
  dibujarKpi(doc, 108, 46, 88, 'Promedio de primas', formatoMoneda(estadisticas.promedioPremas), [30, 64, 175]);
  dibujarKpi(doc, 14, 75, 88, 'Sin accidentes', `${porcentajeSinAccidentes}%`, [5, 150, 105]);
  dibujarKpi(doc, 108, 75, 88, 'Riesgo alto/crítico', `${porcentajeRiesgoAlto}%`, [217, 119, 6]);

  autoTable(doc, {
    startY: 107,
    head: [['Indicador principal', 'Resultado']],
    body: [
      ['Total de pólizas registradas', `${estadisticas.totalPolizas}`],
      ['Promedio de primas', formatoMoneda(estadisticas.promedioPremas)],
      ['Tipo más asegurado', `${estadisticas.tipoMasAsegurado} (${estadisticas.maxConteoTipo})`],
      [
        'Cliente con póliza más alta',
        estadisticas.polizaMasAlta
          ? `${estadisticas.polizaMasAlta.nombre} - ${formatoMoneda(estadisticas.polizaMasAlta.primaAnual)}`
          : 'Sin datos',
      ],
      ['Conductores con 0 accidentes', `${estadisticas.conductoresSinAccidentes}`],
      ['Clientes en riesgo Alto o Crítico', `${estadisticas.clientesRiesgoAltoOCritico}`],
    ],
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 9.8,
      cellPadding: 3,
      lineColor: COLOR.slate200,
      lineWidth: 0.2,
      textColor: COLOR.slate900,
    },
    headStyles: {
      fillColor: COLOR.slate700,
      textColor: COLOR.white,
      fontStyle: 'bold',
    },
    columnStyles: {
      1: { halign: 'right' },
    },
    alternateRowStyles: {
      fillColor: [250, 251, 253],
    },
  });

  const topPolizas = [...polizas]
    .sort((a, b) => b.primaAnual - a.primaAnual)
    .slice(0, 10)
    .map((poliza, index) => [
      `${index + 1}`,
      poliza.nombre,
      poliza.tipoVehiculo,
      poliza.clasificacionRiesgo,
      formatoMoneda(poliza.primaAnual),
    ]);

  autoTable(doc, {
    startY: getFinalY(docTabla, 185) + 8,
    head: [['#', 'Cliente', 'Vehículo', 'Riesgo', 'Prima anual']],
    body: topPolizas.length > 0 ? topPolizas : [['-', 'Sin registros', '-', '-', '-']],
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 2.8,
      lineColor: COLOR.slate200,
      lineWidth: 0.2,
      textColor: COLOR.slate900,
    },
    headStyles: {
      fillColor: COLOR.slate900,
      textColor: COLOR.white,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      4: { halign: 'right', cellWidth: 34 },
    },
    didParseCell: (hookData) => {
      if (hookData.section === 'body' && hookData.row.index === 0 && topPolizas.length > 0) {
        hookData.cell.styles.fontStyle = 'bold';
      }
    },
    alternateRowStyles: {
      fillColor: [250, 251, 253],
    },
  });

  agregarPie(doc);

  doc.save(`reporte-general-polizas-${Date.now()}.pdf`);
};
