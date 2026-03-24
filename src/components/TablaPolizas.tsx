import type { Poliza } from '../types';

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
    <div className="card mb-4">
      <div className="card-header bg-secondary text-white">
        <h4 className="mb-0">Pólizas Registradas</h4>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
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
                  <td className={poliza.accidentes === 0 ? 'text-success fw-bold' : 'text-danger'}>
                    {poliza.accidentes}
                  </td>
                  <td>${poliza.primaBase.toFixed(2)}</td>
                  <td className="text-danger">${poliza.recargos.toFixed(2)}</td>
                  <td className="text-success">${poliza.descuentos.toFixed(2)}</td>
                  <td className="fw-bold">${poliza.primaAnual.toFixed(2)}</td>
                  <td>${poliza.cuotaMensual.toFixed(2)}</td>
                  <td>
                    <span className={`badge bg-${obtenerColorRiesgo(poliza.clasificacionRiesgo)}`}>
                      {poliza.clasificacionRiesgo}
                    </span>
                  </td>
                  <td>
                    {poliza.promoAplicada ? (
                      <span className="badge bg-info">Sí</span>
                    ) : (
                      <span className="badge bg-secondary">No</span>
                    )}
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
