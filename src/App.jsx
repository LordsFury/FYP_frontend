import './App.css';
import { BrowserRouter } from 'react-router-dom';
import Home from './components/Home';
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Home />
    </BrowserRouter>
  );
}

export default App;
