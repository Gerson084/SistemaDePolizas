import { useState, useEffect } from 'react';
import type { FormData } from '../types';
import { validarFormulario, calcularPoliza } from '../utils';
import type { Poliza } from '../types';

interface Props {
  onAgregarPoliza: (poliza: Poliza) => void;
  resetKey?: number;
}

const FormularioPoliza = ({ onAgregarPoliza, resetKey }: Props) => {
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    edad: 18,
    valorVehiculo: 0,
    anioVehiculo: new Date().getFullYear(),
    tipoVehiculo: 'Sedán',
    accidentes: 0,
    usoVehiculo: 'Personal',
    zonaCirculacion: 'Zona normal',
  });

  const [errores, setErrores] = useState<string[]>([]);
  const [ultimaPoliza, setUltimaPoliza] = useState<Poliza | null>(null);

  useEffect(() => {
    setUltimaPoliza(null);
    setErrores([]);
  }, [resetKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validacionErrores = validarFormulario(formData);
    
    if (validacionErrores.length > 0) {
      setErrores(validacionErrores);
      setUltimaPoliza(null);
      return;
    }

    setErrores([]);
    const poliza = calcularPoliza(formData, Date.now());
    setUltimaPoliza(poliza);
    onAgregarPoliza(poliza);
    
    setFormData({
      nombre: '',
      edad: 18,
      valorVehiculo: 0,
      anioVehiculo: new Date().getFullYear(),
      tipoVehiculo: 'Sedán',
      accidentes: 0,
      usoVehiculo: 'Personal',
      zonaCirculacion: 'Zona normal',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'nombre' || name === 'tipoVehiculo' || name === 'usoVehiculo' || name === 'zonaCirculacion' 
        ? value 
        : Number(value)
    }));
  };

  const obtenerColorRiesgo = (clasificacion: string): string => {
    switch (clasificacion) {
      case 'Bajo': return 'success';
      case 'Medio': return 'primary';
      case 'Alto': return 'warning';
      case 'Crítico': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <div className="card panel mb-4">
      <div className="card-header panel-header">
        <h4 className="mb-0 panel-title">Cálculo de Póliza de Seguro</h4>
      </div>
      <div className="card-body panel-body">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Nombre del Cliente</label>
              <input
                type="text"
                className="form-control"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">Edad</label>
              <input
                type="number"
                className="form-control"
                name="edad"
                value={formData.edad}
                onChange={handleChange}
                min="18"
                max="90"
                required
              />
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">Año del Vehículo</label>
              <input
                type="number"
                className="form-control"
                name="anioVehiculo"
                value={formData.anioVehiculo}
                onChange={handleChange}
                min="1990"
                max={new Date().getFullYear() + 1}
                required
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Valor Comercial del Vehículo ($)</label>
              <input
                type="number"
                className="form-control"
                name="valorVehiculo"
                value={formData.valorVehiculo}
                onChange={handleChange}
                min="1"
                step="0.01"
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Tipo de Vehículo</label>
              <select
                className="form-select"
                name="tipoVehiculo"
                value={formData.tipoVehiculo}
                onChange={handleChange}
              >
                <option value="Sedán">Sedán (0%)</option>
                <option value="SUV">SUV (+10%)</option>
                <option value="Pickup">Pickup (+8%)</option>
                <option value="Deportivo">Deportivo (+25%)</option>
              </select>
            </div>
          </div>

          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Número de Accidentes</label>
              <input
                type="number"
                className="form-control"
                name="accidentes"
                value={formData.accidentes}
                onChange={handleChange}
                min="0"
                required
              />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">Uso del Vehículo</label>
              <select
                className="form-select"
                name="usoVehiculo"
                value={formData.usoVehiculo}
                onChange={handleChange}
              >
                <option value="Personal">Personal (0%)</option>
                <option value="Comercial">Comercial (+20%)</option>
              </select>
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">Zona de Circulación</label>
              <select
                className="form-select"
                name="zonaCirculacion"
                value={formData.zonaCirculacion}
                onChange={handleChange}
              >
                <option value="Zona normal">Zona Normal (0%)</option>
                <option value="Zona de alto riesgo">Zona de Alto Riesgo (+15%)</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-neutral btn-lg w-100">
            Calcular Póliza
          </button>
        </form>

        {errores.length > 0 && (
          <div className="alert alert-soft-danger mt-3" role="alert">
            <h5>Errores de validación:</h5>
            <ul className="mb-0">
              {errores.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {ultimaPoliza && (
          <div className="mt-4">
            <div className="card result-card">
              <div className="card-header result-header">
                <h5 className="mb-0">Resultado del Cálculo</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Cliente:</strong> {ultimaPoliza.nombre}</p>
                    <p><strong>Prima Base:</strong> ${ultimaPoliza.primaBase.toFixed(2)}</p>
                    <p><strong>Total Recargos:</strong> ${ultimaPoliza.recargos.toFixed(2)}</p>
                    <p><strong>Total Descuentos:</strong> ${ultimaPoliza.descuentos.toFixed(2)}</p>
                    {ultimaPoliza.promoAplicada && (
                      <div className="alert promo-alert py-2">
                        ¡Promoción especial aplicada! (-12%)
                      </div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <p><strong>Prima Anual:</strong> <span className="fs-4 amount-highlight">${ultimaPoliza.primaAnual.toFixed(2)}</span></p>
                    <p><strong>Cuota Mensual:</strong> ${ultimaPoliza.cuotaMensual.toFixed(2)}</p>
                    <p>
                      <strong>Clasificación de Riesgo:</strong>{' '}
                      <span className={`badge bg-${obtenerColorRiesgo(ultimaPoliza.clasificacionRiesgo)} fs-6`}>
                        {ultimaPoliza.clasificacionRiesgo}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormularioPoliza;
