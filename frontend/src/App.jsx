import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ReferenceAnalysis from './pages/ReferenceAnalysis';
import DataAnalysis from './pages/DataAnalysis';
import ParagraphGeneration from './pages/ParagraphGeneration';
import ChartGeneration from './pages/ChartGeneration';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="reference" element={<ReferenceAnalysis />} />
          <Route path="data" element={<DataAnalysis />} />
          <Route path="generate" element={<ParagraphGeneration />} />
          <Route path="chart" element={<ChartGeneration />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
