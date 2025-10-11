import './styles/global.css';
import Button from './components/common/Button';

function App() {
  return (
    <><div className="App">
      <h1>Bem-vindo ao ODSlize!</h1>
    </div><div>
        <Button onClick={() => alert('Clicou!')}>Botão Primário</Button>
        <Button variant="secondary">Botão Secundário</Button>
        <Button disabled>Desabilitado</Button>
      </div></>
  );
}

export default App;
