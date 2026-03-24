import { useEffect, useMemo, useState } from 'react';
import type { Poliza } from '../types';
import { exportarPolizaPDF } from '../pdf/reportesPdf.ts';

interface Props {
  polizas: Poliza[];
}

const TablaPolizas = ({ polizas }: Props) => {
  const [busqueda, setBusqueda] = useState('');
  const [filtroRiesgo, setFiltroRiesgo] = useState('Todos');
  const [filtroTipoVehiculo, setFiltroTipoVehiculo] = useState('Todos');
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 10;

  const tiposVehiculoDisponibles = useMemo(
    () => [...new Set(polizas.map((poliza) => poliza.tipoVehiculo))],
    [polizas],
  );

  const obtenerColorRiesgo = (clasificacion: string): string => {
    switch (clasificacion) {
      case 'Bajo': return 'success';
      case 'Medio': return 'primary';
      case 'Alto': return 'warning';
      case 'Crítico': return 'danger';
      default: return 'secondary';
    }
  };

  const polizasFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return polizas.filter((poliza) => {
      const coincideBusqueda =
        termino.length === 0 ||
        poliza.nombre.toLowerCase().includes(termino) ||
        poliza.tipoVehiculo.toLowerCase().includes(termino) ||
        poliza.clasificacionRiesgo.toLowerCase().includes(termino) ||
        String(poliza.id).includes(termino);

      const coincideRiesgo =
        filtroRiesgo === 'Todos' || poliza.clasificacionRiesgo === filtroRiesgo;

      const coincideTipo =
        filtroTipoVehiculo === 'Todos' || poliza.tipoVehiculo === filtroTipoVehiculo;

      return coincideBusqueda && coincideRiesgo && coincideTipo;
    });
  }, [busqueda, filtroRiesgo, filtroTipoVehiculo, polizas]);

  const totalPaginas = Math.max(1, Math.ceil(polizasFiltradas.length / registrosPorPagina));

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroRiesgo, filtroTipoVehiculo]);

  useEffect(() => {
    if (paginaActual > totalPaginas) {
      setPaginaActual(totalPaginas);
    }
  }, [paginaActual, totalPaginas]);

  const indiceInicio = (paginaActual - 1) * registrosPorPagina;
  const polizasPaginadas = polizasFiltradas.slice(indiceInicio, indiceInicio + registrosPorPagina);

  const paginasVisibles = useMemo(() => {
    const maxBotones = 5;
    let inicio = Math.max(1, paginaActual - 2);
    const fin = Math.min(totalPaginas, inicio + maxBotones - 1);
    if (fin - inicio + 1 < maxBotones) {
      inicio = Math.max(1, fin - maxBotones + 1);
    }

    const numeros: number[] = [];
    for (let i = inicio; i <= fin; i += 1) {
      numeros.push(i);
    }
    return numeros;
  }, [paginaActual, totalPaginas]);

  if (polizas.length === 0) {
    return null;
  }

  return (
    <div className="card panel mb-4">
      <div className="card-header panel-header">
        <h4 className="mb-0 panel-title">Pólizas Registradas</h4>
      </div>
      <div className="card-body panel-body">
        <div className="row g-2 mb-3 table-filters">
          <div className="col-12 col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por cliente, tipo, riesgo o ID"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div className="col-12 col-md-4">
            <select
              className="form-select"
              value={filtroRiesgo}
              onChange={(e) => setFiltroRiesgo(e.target.value)}
            >
              <option value="Todos">Todos los riesgos</option>
              <option value="Bajo">Bajo</option>
              <option value="Medio">Medio</option>
              <option value="Alto">Alto</option>
              <option value="Crítico">Crítico</option>
            </select>
          </div>
          <div className="col-12 col-md-4">
            <select
              className="form-select"
              value={filtroTipoVehiculo}
              onChange={(e) => setFiltroTipoVehiculo(e.target.value)}
            >
              <option value="Todos">Todos los vehículos</option>
              {tiposVehiculoDisponibles.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
          <small className="text-muted">
            Mostrando {polizasPaginadas.length} de {polizasFiltradas.length} pólizas filtradas
          </small>
          <button
            type="button"
            className="btn btn-outline-neutral btn-sm"
            onClick={() => {
              setBusqueda('');
              setFiltroRiesgo('Todos');
              setFiltroTipoVehiculo('Todos');
            }}
          >
            Limpiar filtros
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-modern table-hover align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Edad</th>
                <th>Vehículo</th>
                <th>Año</th>
                <th>Valor</th>
                <th>Accidentes</th>
                <th>Prima Base</th>
                <th>Recargos</th>
                <th>Descuentos</th>
                <th>Prima Anual</th>
                <th>Cuota Mensual</th>
                <th>Riesgo</th>
                <th>Promo</th>
                <th>Reporte</th>
              </tr>
            </thead>
            <tbody>
              {polizasPaginadas.map((poliza, index) => (
                <tr key={poliza.id}>
                  <td>{indiceInicio + index + 1}</td>
                  <td>{poliza.nombre}</td>
                  <td>{poliza.edad}</td>
                  <td>{poliza.tipoVehiculo}</td>
                  <td>{poliza.anioVehiculo}</td>
                  <td>${poliza.valorVehiculo.toLocaleString()}</td>
                  <td className="fw-semibold">
                    {poliza.accidentes}
                  </td>
                  <td>${poliza.primaBase.toFixed(2)}</td>
                  <td>${poliza.recargos.toFixed(2)}</td>
                  <td>${poliza.descuentos.toFixed(2)}</td>
                  <td className="fw-bold amount-highlight">${poliza.primaAnual.toFixed(2)}</td>
                  <td>${poliza.cuotaMensual.toFixed(2)}</td>
                  <td>
                    <span className={`badge bg-${obtenerColorRiesgo(poliza.clasificacionRiesgo)}`}>
                      {poliza.clasificacionRiesgo}
                    </span>
                  </td>
                  <td>
                    {poliza.promoAplicada ? (
                      <span className="badge badge-neutral">Sí</span>
                    ) : (
                      <span className="badge badge-neutral">No</span>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-outline-neutral btn-sm"
                      onClick={() => exportarPolizaPDF(poliza)}
                    >
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
              {polizasPaginadas.length === 0 && (
                <tr>
                  <td colSpan={15} className="text-center py-4 text-muted">
                    No se encontraron pólizas con esos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-center mt-3">
          <nav aria-label="Paginación de pólizas">
            <ul className="pagination pagination-sm mb-0 table-pagination">
              <li className={`page-item ${paginaActual === 1 ? 'disabled' : ''}`}>
                <button
                  type="button"
                  className="page-link"
                  onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
                >
                  Anterior
                </button>
              </li>

              {paginasVisibles.map((pagina) => (
                <li
                  key={pagina}
                  className={`page-item ${pagina === paginaActual ? 'active' : ''}`}
                >
                  <button
                    type="button"
                    className="page-link"
                    onClick={() => setPaginaActual(pagina)}
                  >
                    {pagina}
                  </button>
                </li>
              ))}

              <li className={`page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`}>
                <button
                  type="button"
                  className="page-link"
                  onClick={() => setPaginaActual((prev) => Math.min(totalPaginas, prev + 1))}
                >
                  Siguiente
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default TablaPolizas;
