import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { MdCallMerge, MdContentCut, MdViewModule, MdCompress, MdImage, MdPictureAsPdf } from 'react-icons/md';

import { MainLayout } from './layouts/MainLayout';
import { MergeTool } from './pages/merge/MergeTool';
import { SplitTool } from './pages/split/SplitTool';
import { OrganizeTool } from './pages/organize/OrganizeTool';
import { ImagesToPdfTool } from './pages/convert/ImagesToPdf';
import { PdfToImagesTool } from './pages/convert/PdfToImages';
import './styles/LandingPage.css';

import { CompressTool } from './pages/compress/CompressTool';

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
        <MdCallMerge className="card-icon text-4xl mb-4 text-primary" />
        <h3 className="card-title">Merge PDF</h3>
      </Link>
      <Link to="/split" className="feature-card">
        <MdContentCut className="card-icon text-4xl mb-4 text-primary" />
        <h3 className="card-title">Split PDF</h3>
      </Link>
      <Link to="/organize" className="feature-card">
        <MdViewModule className="card-icon text-4xl mb-4 text-primary" />
        <h3 className="card-title">Organize</h3>
      </Link>
      <Link to="/compress" className="feature-card">
        <MdCompress className="card-icon text-4xl mb-4 text-primary" />
        <h3 className="card-title">Compress</h3>
      </Link>
      <Link to="/images-to-pdf" className="feature-card">
        <MdImage className="card-icon text-4xl mb-4 text-primary" />
        <h3 className="card-title">Images to PDF</h3>
      </Link>
      <Link to="/pdf-to-images" className="feature-card">
        <MdPictureAsPdf className="card-icon text-4xl mb-4 text-primary" />
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

