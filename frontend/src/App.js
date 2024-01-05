import './App.css';
import Header from './components/Header';
import HomePage from "./pages/HomePage";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Header />
        <Routes>
            <Route path="/" element={<HomePage />} />
        </Routes>
    </BrowserRouter>
  );
}

export default App;

