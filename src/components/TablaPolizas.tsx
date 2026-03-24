import type { Poliza } from '../types';
import { exportarPolizaPDF } from '../pdf/reportesPdf';

interface Props {
  polizas: Poliza[];
}

const TablaPolizas = ({ polizas }: Props) => {
  const obtenerColorRiesgo = (clasificacion: string): string => {
    switch (clasificacion) {
      case 'Bajo': return 'success';
      case 'Medio': return 'primary';
      case 'Alto': return 'warning';
      case 'Crítico': return 'danger';
      default: return 'secondary';
    }
  };

  if (polizas.length === 0) {
    return null;
  }

  return (
    <div className="card panel mb-4">
      <div className="card-header panel-header">
        <h4 className="mb-0 panel-title">Pólizas Registradas</h4>
      </div>
      <div className="card-body panel-body">
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
              {polizas.map((poliza, index) => (
                <tr key={poliza.id}>
                  <td>{index + 1}</td>
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TablaPolizas;
