import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Characters from './pages/Characters';
import CharacterDetails from './pages/CharacterDetails';
import MiniGame from './pages/MiniGame';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/characters" element={<Characters />} />
      <Route path="/character/:name" element={<CharacterDetails />} />
      <Route path="/game" element={<MiniGame />} />
    </Routes>
  );
}