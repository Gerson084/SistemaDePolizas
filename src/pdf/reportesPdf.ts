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

const crearCabecera = (doc: jsPDF, titulo: string, subtitulo: string) => {
  doc.setFillColor(21, 101, 192);
  doc.rect(0, 0, 210, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Sistema de Polizas de Auto', 14, 12);

  doc.setFontSize(13);
  doc.text(titulo, 14, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(subtitulo, 14, 26);
};

const formatoMoneda = (valor: number): string =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(valor);

const obtenerColorRiesgoRGB = (clasificacion: string): [number, number, number] => {
  switch (clasificacion) {
    case 'Bajo':
      return [46, 125, 50];
    case 'Medio':
      return [21, 101, 192];
    case 'Alto':
      return [245, 124, 0];
    case 'Crítico':
      return [198, 40, 40];
    default:
      return [97, 97, 97];
  }
};

export const exportarPolizaPDF = (poliza: Poliza) => {
  const doc = new jsPDF();
  const fecha = new Date().toLocaleString('es-MX');

  crearCabecera(doc, 'Reporte Individual de Poliza', `Generado: ${fecha}`);

  doc.setTextColor(33, 33, 33);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`Cliente: ${poliza.nombre}`, 14, 40);

  const riesgoColor = obtenerColorRiesgoRGB(poliza.clasificacionRiesgo);
  doc.setFillColor(riesgoColor[0], riesgoColor[1], riesgoColor[2]);
  doc.roundedRect(148, 34, 48, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(`Riesgo: ${poliza.clasificacionRiesgo}`, 152, 40);

  autoTable(doc, {
    startY: 46,
    head: [['Dato', 'Valor']],
    body: [
      ['Edad', `${poliza.edad} anios`],
      ['Tipo de vehiculo', poliza.tipoVehiculo],
      ['Anio del vehiculo', `${poliza.anioVehiculo}`],
      ['Uso del vehiculo', poliza.usoVehiculo],
      ['Zona de circulacion', poliza.zonaCirculacion],
      ['Accidentes reportados', `${poliza.accidentes}`],
      ['Promocion aplicada', poliza.promoAplicada ? 'Si' : 'No'],
    ],
    styles: {
      font: 'helvetica',
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [21, 101, 192],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [247, 249, 252],
    },
  });

  autoTable(doc, {
    startY: (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY
      ? (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable!.finalY! + 10
      : 120,
    head: [['Resumen Financiero', 'Monto']],
    body: [
      ['Prima base', formatoMoneda(poliza.primaBase)],
      ['Recargos', formatoMoneda(poliza.recargos)],
      ['Descuentos', formatoMoneda(poliza.descuentos)],
      ['Prima anual final', formatoMoneda(poliza.primaAnual)],
      ['Cuota mensual', formatoMoneda(poliza.cuotaMensual)],
    ],
    styles: {
      font: 'helvetica',
      fontSize: 11,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [46, 125, 50],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    columnStyles: {
      1: { halign: 'right' },
    },
    alternateRowStyles: {
      fillColor: [245, 252, 247],
    },
  });

  const finalY =
    (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 180;
  doc.setTextColor(90, 90, 90);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.text('Documento informativo generado automaticamente por el sistema.', 14, finalY + 12);

  doc.save(`poliza-${poliza.nombre.replace(/\s+/g, '-').toLowerCase()}-${poliza.id}.pdf`);
};

export const exportarReporteGeneralPDF = (
  estadisticas: EstadisticasReporte,
  totalPolizas: number,
) => {
  const doc = new jsPDF();
  const fecha = new Date().toLocaleString('es-MX');

  crearCabecera(doc, 'Reporte General de Estadisticas', `Generado: ${fecha}`);

  autoTable(doc, {
    startY: 40,
    head: [['Indicador', 'Resultado']],
    body: [
      ['Total de polizas registradas', `${estadisticas.totalPolizas}`],
      ['Promedio de primas', formatoMoneda(estadisticas.promedioPremas)],
      [
        'Tipo de vehiculo mas asegurado',
        `${estadisticas.tipoMasAsegurado} (${estadisticas.maxConteoTipo} polizas)`,
      ],
      [
        'Cliente con poliza mas alta',
        estadisticas.polizaMasAlta
          ? `${estadisticas.polizaMasAlta.nombre} - ${formatoMoneda(estadisticas.polizaMasAlta.primaAnual)}`
          : 'Sin datos',
      ],
      ['Conductores con 0 accidentes', `${estadisticas.conductoresSinAccidentes}`],
      ['Clientes riesgo Alto o Critico', `${estadisticas.clientesRiesgoAltoOCritico}`],
      [
        'Porcentaje sin accidentes',
        totalPolizas > 0
          ? `${((estadisticas.conductoresSinAccidentes / totalPolizas) * 100).toFixed(1)}%`
          : '0%',
      ],
      [
        'Porcentaje riesgo Alto/Critico',
        totalPolizas > 0
          ? `${((estadisticas.clientesRiesgoAltoOCritico / totalPolizas) * 100).toFixed(1)}%`
          : '0%',
      ],
    ],
    styles: {
      font: 'helvetica',
      fontSize: 10.5,
      cellPadding: 3.2,
    },
    headStyles: {
      fillColor: [0, 121, 107],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [243, 250, 249],
    },
    columnStyles: {
      1: { halign: 'right' },
    },
  });

  const finalY =
    (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 165;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text('Resumen ejecutivo:', 14, finalY + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Actualmente hay ${estadisticas.totalPolizas} polizas activas en memoria.`,
    14,
    finalY + 18,
  );

  doc.save(`reporte-general-polizas-${new Date().getTime()}.pdf`);
};