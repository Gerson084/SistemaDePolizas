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
    <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div className="container">
        <div className="text-center mb-4">
          <h1 className="display-4 fw-bold text-primary">Sistema de Cálculo de Pólizas de Seguro de Auto</h1>
          <p className="lead text-muted">Calcule el costo anual de su seguro de vehículo</p>
          {polizas.length > 0 && (
            <button 
              className="btn btn-danger btn-lg mt-3"
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
