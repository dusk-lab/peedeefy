import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ToolLayout } from './layouts/ToolLayout';
import { MainLayout } from './layouts/MainLayout';
import { MergeTool } from './pages/merge/MergeTool';
import { SplitTool } from './pages/split/SplitTool';
import { OrganizeTool } from './pages/organize/OrganizeTool';
import { ImagesToPdfTool } from './pages/convert/ImagesToPdf';
import { PdfToImagesTool } from './pages/convert/PdfToImages';
import './styles/LandingPage.css';

// Placeholder components for tools
const CompressTool = () => <ToolLayout title="Compress PDF" description="Reduce file size"><div className="text-center py-12 text-text-muted">Tool coming soon...</div></ToolLayout>;

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
        <span className="card-icon">🖇️</span>
        <h3 className="card-title">Merge PDF</h3>
      </Link>
      <Link to="/split" className="feature-card">
        <span className="card-icon">✂️</span>
        <h3 className="card-title">Split PDF</h3>
      </Link>
      <Link to="/organize" className="feature-card">
        <span className="card-icon">📑</span>
        <h3 className="card-title">Organize</h3>
      </Link>
      <Link to="/compress" className="feature-card">
        <span className="card-icon">🗜️</span>
        <h3 className="card-title">Compress</h3>
      </Link>
      <Link to="/images-to-pdf" className="feature-card">
        <span className="card-icon">🖼️</span>
        <h3 className="card-title">Images to PDF</h3>
      </Link>
      <Link to="/pdf-to-images" className="feature-card">
        <span className="card-icon">📸</span>
        <h3 className="card-title">PDF to Images</h3>
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
          <Route path="/organize" element={<OrganizeTool />} />
          <Route path="/images-to-pdf" element={<ImagesToPdfTool />} />
          <Route path="/pdf-to-images" element={<PdfToImagesTool />} />
          <Route path="/compress" element={<CompressTool />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;

