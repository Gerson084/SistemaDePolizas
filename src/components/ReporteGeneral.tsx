import { useMemo } from 'react';
import type { Poliza } from '../types';
import { exportarReporteGeneralPDF } from '../pdf/reportesPdf.ts';

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

const riesgoColorMap: Record<string, string> = {
  Bajo: '#16a34a',
  Medio: '#2563eb',
  Alto: '#d97706',
  Crítico: '#dc2626',
};

const ReporteGeneral = ({ polizas }: Props) => {
  const estadisticas = useMemo<Estadisticas>(() => {
    if (polizas.length === 0) {
      return {
        totalPolizas: 0,
        promedioPremas: 0,
        tipoMasAsegurado: '',
        maxConteoTipo: 0,
        polizaMasAlta: null,
        conductoresSinAccidentes: 0,
        clientesRiesgoAltoOCritico: 0,
      };
    }

    const totalPolizas = polizas.length;
    const sumaPrimas = polizas.reduce((sum, p) => sum + p.primaAnual, 0);
    const promedioPremas = sumaPrimas / totalPolizas;

    const conteoTipos: Record<string, number> = {};
    polizas.forEach((p) => {
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

    const conductoresSinAccidentes = polizas.filter((p) => p.accidentes === 0).length;
    const clientesRiesgoAltoOCritico = polizas.filter(
      (p) => p.clasificacionRiesgo === 'Alto' || p.clasificacionRiesgo === 'Crítico',
    ).length;

    return {
      totalPolizas,
      promedioPremas,
      tipoMasAsegurado,
      maxConteoTipo,
      polizaMasAlta,
      conductoresSinAccidentes,
      clientesRiesgoAltoOCritico,
    };
  }, [polizas]);

  const distribucionTipos = useMemo(() => {
    if (polizas.length === 0) {
      return [] as Array<{ etiqueta: string; valor: number; porcentaje: number }>;
    }

    const conteo: Record<string, number> = {};
    polizas.forEach((p) => {
      conteo[p.tipoVehiculo] = (conteo[p.tipoVehiculo] || 0) + 1;
    });

    return Object.entries(conteo)
      .map(([etiqueta, valor]) => ({
        etiqueta,
        valor,
        porcentaje: (valor / polizas.length) * 100,
      }))
      .sort((a, b) => b.valor - a.valor);
  }, [polizas]);

  const graficaRiesgo = useMemo(() => {
    if (polizas.length === 0) {
      return { gradiente: '#e2e8f0', leyenda: [] as Array<{ etiqueta: string; valor: number; porcentaje: number; color: string }> };
    }

    const orden = ['Bajo', 'Medio', 'Alto', 'Crítico'];
    const conteo: Record<string, number> = {
      Bajo: 0,
      Medio: 0,
      Alto: 0,
      Crítico: 0,
    };

    polizas.forEach((p) => {
      conteo[p.clasificacionRiesgo] = (conteo[p.clasificacionRiesgo] || 0) + 1;
    });

    let avance = 0;
    const partes = orden
      .filter((nivel) => conteo[nivel] > 0)
      .map((nivel) => {
        const valor = conteo[nivel];
        const porcentaje = (valor / polizas.length) * 100;
        const inicio = avance;
        avance += porcentaje;
        const color = riesgoColorMap[nivel] || '#64748b';
        return {
          etiqueta: nivel,
          valor,
          porcentaje,
          color,
          segmento: `${color} ${inicio.toFixed(2)}% ${avance.toFixed(2)}%`,
        };
      });

    return {
      gradiente: partes.map((parte) => parte.segmento).join(', '),
      leyenda: partes,
    };
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
    exportarReporteGeneralPDF(estadisticas, polizas.length, polizas);
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

          <div className="col-12">
            <div className="row g-3 mt-1">
              <div className="col-12 col-lg-7">
                <div className="card h-100 stat-card chart-card">
                  <div className="card-body">
                    <h5 className="card-title">Distribución por Tipo de Vehículo</h5>
                    <div className="chart-bars mt-3">
                      {distribucionTipos.map((item) => (
                        <div key={item.etiqueta} className="chart-bar-row">
                          <div className="d-flex justify-content-between chart-bar-label">
                            <span>{item.etiqueta}</span>
                            <span>{item.valor} pólizas</span>
                          </div>
                          <div className="chart-track">
                            <div
                              className="chart-fill"
                              style={{ width: `${item.porcentaje.toFixed(1)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-lg-5">
                <div className="card h-100 stat-card chart-card">
                  <div className="card-body">
                    <h5 className="card-title">Composición de Riesgo</h5>
                    <div className="risk-donut-wrapper mt-3">
                      <div
                        className="risk-donut"
                        style={{
                          background: `conic-gradient(${graficaRiesgo.gradiente})`,
                        }}
                        aria-label="Distribución de niveles de riesgo"
                      >
                        <div className="risk-donut-center">
                          <strong>{polizas.length}</strong>
                          <small>pólizas</small>
                        </div>
                      </div>

                      <ul className="risk-legend">
                        {graficaRiesgo.leyenda.map((item) => (
                          <li key={item.etiqueta}>
                            <span
                              className="risk-dot"
                              style={{ backgroundColor: item.color }}
                            />
                            <span>{item.etiqueta}</span>
                            <span>{item.porcentaje.toFixed(1)}%</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReporteGeneral;
