export type TipoVehiculo = 'Sedán' | 'SUV' | 'Pickup' | 'Deportivo';
export type UsoVehiculo = 'Personal' | 'Comercial';
export type ZonaCirculacion = 'Zona normal' | 'Zona de alto riesgo';
export type ClasificacionRiesgo = 'Bajo' | 'Medio' | 'Alto' | 'Crítico';

export interface FormData {
  nombre: string;
  edad: number;
  valorVehiculo: number;
  anioVehiculo: number;
  tipoVehiculo: TipoVehiculo;
  accidentes: number;
  usoVehiculo: UsoVehiculo;
  zonaCirculacion: ZonaCirculacion;
}

export interface Poliza {
  id: number;
  nombre: string;
  edad: number;
  valorVehiculo: number;
  anioVehiculo: number;
  tipoVehiculo: TipoVehiculo;
  accidentes: number;
  usoVehiculo: UsoVehiculo;
  zonaCirculacion: ZonaCirculacion;
  primaBase: number;
  recargos: number;
  descuentos: number;
  primaAnual: number;
  cuotaMensual: number;
  clasificacionRiesgo: ClasificacionRiesgo;
  promoAplicada: boolean;
}

export interface Estadisticas {
  totalPolizas: number;
  promedioPremas: number;
  tipoVehiculoMasAsegurado: string;
  clienteMasAlta: string;
  conductoresSinAccidentes: number;
  clientesRiesgoAltoOCritico: number;
}
