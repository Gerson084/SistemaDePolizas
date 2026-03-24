import { useEffect, useState } from 'react';
import type { Poliza } from '../types';
import { exportarReporteGeneralPDF } from '../pdf/reportesPdf';

interface Props {
  polizas: Poliza[];
}

interface Estadisticas {
  totalPolizas: number;
  promedioPremas: number;
  tipoMasAsegurado: string;
  maxConteoTipo: number;
  polizaMasAlta: Poliza | null;
  conductoresSinAccidentes: number;
  clientesRiesgoAltoOCritico: number;
}

const ReporteGeneral = ({ polizas }: Props) => {
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    totalPolizas: 0,
    promedioPremas: 0,
    tipoMasAsegurado: '',
    maxConteoTipo: 0,
    polizaMasAlta: null,
    conductoresSinAccidentes: 0,
    clientesRiesgoAltoOCritico: 0,
  });

  useEffect(() => {
    if (polizas.length === 0) {
      setEstadisticas({
        totalPolizas: 0,
        promedioPremas: 0,
        tipoMasAsegurado: '',
        maxConteoTipo: 0,
        polizaMasAlta: null,
        conductoresSinAccidentes: 0,
        clientesRiesgoAltoOCritico: 0,
      });
      return;
    }

    const totalPolizas = polizas.length;

    const sumaPrimas = polizas.reduce((sum, p) => sum + p.primaAnual, 0);
    const promedioPremas = sumaPrimas / totalPolizas;

    const conteoTipos: { [key: string]: number } = {};
    polizas.forEach(p => {
      conteoTipos[p.tipoVehiculo] = (conteoTipos[p.tipoVehiculo] || 0) + 1;
    });
    let tipoMasAsegurado = '';
    let maxConteoTipo = 0;
    Object.entries(conteoTipos).forEach(([tipo, conteo]) => {
      if (conteo > maxConteoTipo) {
        maxConteoTipo = conteo;
        tipoMasAsegurado = tipo;
      }
    });

    const polizaMasAlta = polizas.reduce((max, p) => 
      p.primaAnual > max.primaAnual ? p : max
    , polizas[0]);

    const conductoresSinAccidentes = polizas.filter(p => p.accidentes === 0).length;

    const clientesRiesgoAltoOCritico = polizas.filter(
      p => p.clasificacionRiesgo === 'Alto' || p.clasificacionRiesgo === 'Crítico'
    ).length;

    setEstadisticas({
      totalPolizas,
      promedioPremas,
      tipoMasAsegurado,
      maxConteoTipo,
      polizaMasAlta,
      conductoresSinAccidentes,
      clientesRiesgoAltoOCritico,
    });
  }, [polizas]);

  if (polizas.length === 0) {
    return (
      <div className="card panel">
        <div className="card-header panel-header">
          <h4 className="mb-0 panel-title">Reporte General - Estadísticas</h4>
        </div>
        <div className="card-body text-center panel-body">
          <p className="text-muted">No hay pólizas registradas aún</p>
        </div>
      </div>
    );
  }

  const obtenerColorRiesgo = (clasificacion: string): string => {
    switch (clasificacion) {
      case 'Bajo': return 'success';
      case 'Medio': return 'primary';
      case 'Alto': return 'warning';
      case 'Crítico': return 'danger';
      default: return 'secondary';
    }
  };

  const descargarReporteGeneral = () => {
    exportarReporteGeneralPDF(estadisticas, polizas.length);
  };

  return (
    <div className="card panel mb-4">
      <div className="card-header panel-header">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
          <h4 className="mb-0 panel-title">Reporte General - Estadísticas</h4>
          <button
            type="button"
            className="btn btn-outline-neutral btn-sm fw-semibold"
            onClick={descargarReporteGeneral}
          >
            Descargar PDF
          </button>
        </div>
      </div>
      <div className="card-body panel-body">
        <div className="row g-3">
          <div className="col-md-6">
            <div className="card h-100 stat-card">
              <div className="card-body">
                <h5 className="card-title">Total de Pólizas</h5>
                <p className="display-6">{estadisticas.totalPolizas}</p>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card h-100 stat-card">
              <div className="card-body">
                <h5 className="card-title">Promedio de Primas</h5>
                <p className="display-6 amount-highlight">${estadisticas.promedioPremas.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card h-100 stat-card">
              <div className="card-body">
                <h5 className="card-title">Tipo Más Asegurado</h5>
                <p className="fs-4">{estadisticas.tipoMasAsegurado}</p>
                <small className="text-muted">({estadisticas.maxConteoTipo} pólizas)</small>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card h-100 stat-card">
              <div className="card-body">
                <h5 className="card-title">Póliza Más Alta</h5>
                {estadisticas.polizaMasAlta && (
                  <>
                    <p className="fs-5 mb-1">{estadisticas.polizaMasAlta.nombre}</p>
                    <p className="fs-6 mb-0 amount-highlight">${estadisticas.polizaMasAlta.primaAnual.toFixed(2)}</p>
                    <span className={`badge bg-${obtenerColorRiesgo(estadisticas.polizaMasAlta.clasificacionRiesgo)} mt-2`}>
                      {estadisticas.polizaMasAlta.clasificacionRiesgo}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card h-100 stat-card">
              <div className="card-body">
                <h5 className="card-title">Sin Accidentes</h5>
                <p className="display-6">{estadisticas.conductoresSinAccidentes}</p>
                <small className="text-muted">
                  {((estadisticas.conductoresSinAccidentes / estadisticas.totalPolizas) * 100).toFixed(1)}% del total
                </small>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card h-100 stat-card">
              <div className="card-body">
                <h5 className="card-title">Riesgo Alto/Crítico</h5>
                <p className="display-6">{estadisticas.clientesRiesgoAltoOCritico}</p>
                <small className="text-muted">
                  {((estadisticas.clientesRiesgoAltoOCritico / estadisticas.totalPolizas) * 100).toFixed(1)}% del total
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReporteGeneral;
