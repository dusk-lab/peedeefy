import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { MergeTool } from './pages/merge/MergeTool';
import { SplitTool } from './pages/split/SplitTool';
import './styles/LandingPage.css';

// Placeholder components for tools

const LandingPage = () => (
  <div className="landing-page">
    <div className="landing-hero">
      <h1 className="hero-title">
        Safe PDF Tools <br />
        <span className="highlight-text">in Your Browser</span>
      </h1>
      <p className="hero-subtitle">
        Merge, split, compress, and convert PDFs entirely on your device.
        Your files never leave your computer.
      </p>
    </div>

    <div className="features-grid">
      <Link to="/merge" className="feature-card">
        <h3 className="card-title">Merge PDFs</h3>
        <p className="card-description">Combine multiple files into one seamless document in seconds.</p>
      </Link>
      <Link to="/split" className="feature-card">
        <h3 className="card-title">Split PDF</h3>
        <p className="card-description">Extract specific pages or split a large document into separate files.</p>
      </Link>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/merge" element={<MergeTool />} />
          <Route path="/split" element={<SplitTool />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;

