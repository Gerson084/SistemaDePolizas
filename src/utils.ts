import type { FormData, Poliza, ClasificacionRiesgo } from './types';

export const validarFormulario = (data: FormData): string[] => {
  const errores: string[] = [];
  const anioMaximoVehiculo = new Date().getFullYear() + 1;

  if (!data.nombre || data.nombre.trim() === '') {
    errores.push('El nombre no puede estar vacío');
  }

  if (data.edad < 18) {
    errores.push('La edad no puede ser menor de 18 años');
  }

  if (data.edad > 90) {
    errores.push('La edad no puede ser mayor de 90 años');
  }

  if (data.valorVehiculo <= 0) {
    errores.push('El valor del vehículo debe ser mayor a cero');
  }

  if (data.anioVehiculo < 1990) {
    errores.push('El año del vehículo no puede ser menor a 1990');
  }

  if (data.anioVehiculo > anioMaximoVehiculo) {
    errores.push(`El año del vehículo no puede ser mayor a ${anioMaximoVehiculo}`);
  }

  if (data.accidentes < 0) {
    errores.push('El número de accidentes no puede ser negativo');
  }

  return errores;
};

export const calcularPoliza = (data: FormData, id: number): Poliza => {
  const primaBase = data.valorVehiculo * 0.05;

  let recargosTotal = 0;
  let descuentosTotal = 0;

  if (data.edad < 25) {
    recargosTotal += primaBase * 0.20;
  } else if (data.edad > 60) {
    recargosTotal += primaBase * 0.15;
  }

  switch (data.tipoVehiculo) {
    case 'SUV':
      recargosTotal += primaBase * 0.10;
      break;
    case 'Pickup':
      recargosTotal += primaBase * 0.08;
      break;
    case 'Deportivo':
      recargosTotal += primaBase * 0.25;
      break;
    case 'Sedán':
      break;
  }

  if (data.accidentes === 0) {
    descuentosTotal += primaBase * 0.10;
  } else if (data.accidentes === 1) {
    recargosTotal += primaBase * 0.15;
  } else if (data.accidentes === 2) {
    recargosTotal += primaBase * 0.30;
  } else if (data.accidentes >= 3) {
    recargosTotal += primaBase * 0.50;
  }

  if (data.usoVehiculo === 'Comercial') {
    recargosTotal += primaBase * 0.20;
  }

  if (data.zonaCirculacion === 'Zona de alto riesgo') {
    recargosTotal += primaBase * 0.15;
  }

  const numeroPromo = Math.floor(Math.random() * 5) + 1;
  const promoAplicada = numeroPromo === 3;
  if (promoAplicada) {
    descuentosTotal += primaBase * 0.12;
  }

  const primaAnual = primaBase + recargosTotal - descuentosTotal;
  const cuotaMensual = primaAnual / 12;

  let clasificacionRiesgo: ClasificacionRiesgo;
  if (primaAnual < 500) {
    clasificacionRiesgo = 'Bajo';
  } else if (primaAnual >= 500 && primaAnual <= 900) {
    clasificacionRiesgo = 'Medio';
  } else if (primaAnual >= 901 && primaAnual <= 1500) {
    clasificacionRiesgo = 'Alto';
  } else {
    clasificacionRiesgo = 'Crítico';
  }

  return {
    id,
    nombre: data.nombre,
    edad: data.edad,
    valorVehiculo: data.valorVehiculo,
    anioVehiculo: data.anioVehiculo,
    tipoVehiculo: data.tipoVehiculo,
    accidentes: data.accidentes,
    usoVehiculo: data.usoVehiculo,
    zonaCirculacion: data.zonaCirculacion,
    primaBase,
    recargos: recargosTotal,
    descuentos: descuentosTotal,
    primaAnual,
    cuotaMensual,
    clasificacionRiesgo,
    promoAplicada,
  };
};
