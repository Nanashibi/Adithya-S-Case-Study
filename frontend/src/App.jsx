import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Feed from './pages/Feed';
import Report from './pages/Report';
import SafeCircles from './pages/SafeCircles';

function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/report" element={<Report />} />
          <Route path="/circles" element={<SafeCircles />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;