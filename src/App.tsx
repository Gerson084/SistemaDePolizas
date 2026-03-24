import { useState } from 'react';
import type { Poliza } from './types';
import FormularioPoliza from './components/FormularioPoliza';
import TablaPolizas from './components/TablaPolizas';
import ReporteGeneral from './components/ReporteGeneral';
import './App.css';

function App() {
  const [polizas, setPolizas] = useState<Poliza[]>([]);
  const [resetKey, setResetKey] = useState(0);

  const agregarPoliza = (poliza: Poliza) => {
    setPolizas(prev => [...prev, poliza]);
  };

  const reiniciarSistema = () => {
    if (window.confirm('¿Está seguro de que desea reiniciar el sistema? Se perderán todas las pólizas registradas.')) {
      setPolizas([]);
      setResetKey(prev => prev + 1);
    }
  };

  return (
    <div className="app-shell py-4">
      <div className="container app-container">
        <div className="app-hero text-center mb-4">
          <h1 className="app-title">Sistema de Cálculo de Pólizas de Seguro de Auto</h1>
          <p className="app-subtitle">Calcula el costo anual de tu seguro de vehículo con un resumen completo</p>
          {polizas.length > 0 && (
            <button 
              className="btn btn-neutral-danger btn-lg mt-3"
              onClick={reiniciarSistema}
            >
              Reiniciar Sistema
            </button>
          )}
        </div>

        <FormularioPoliza onAgregarPoliza={agregarPoliza} resetKey={resetKey} />
        
        <ReporteGeneral polizas={polizas} />
        
        <TablaPolizas polizas={polizas} />
      </div>
    </div>
  );
}

export default App;
