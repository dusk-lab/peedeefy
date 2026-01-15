import { MainLayout } from './layouts/MainLayout';

function App() {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">
          Safe PDF Tools in Your Browser
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mb-8">
          Merge, split, compress, and convert PDFs entirely on your device.
          Your files never leave your computer.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
          <div className="p-6 bg-surface rounded-lg shadow-md border border-border hover:border-primary cursor-pointer transition-colors group">
            <h3 className="font-bold text-lg mb-2 group-hover:text-primary">Merge PDFs</h3>
            <p className="text-sm text-text-muted">Combine multiple files into one</p>
          </div>
          <div className="p-6 bg-surface rounded-lg shadow-md border border-border hover:border-primary cursor-pointer transition-colors group">
            <h3 className="font-bold text-lg mb-2 group-hover:text-primary">Split PDF</h3>
            <p className="text-sm text-text-muted">Extract pages or split into files</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default App;
