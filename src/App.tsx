import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import AddProduct from './pages/AddProduct';
import ProductDetail from './pages/ProductDetail';
import { App as CapacitorApp } from '@capacitor/app';
import { useEffect, useRef } from 'react';

function AnimatedRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const prevLocationRef = useRef(location.pathname);

  const getPageLevel = (path: string) => {
    if (path === '/') return 0;
    if (path.startsWith('/product/')) return 1;
    if (path.startsWith('/edit/') || path === '/add') return 2;
    return 0;
  };

  const prevPath = prevLocationRef.current;
  const currentPath = location.pathname;
  const direction: 'forward' | 'backward' = getPageLevel(currentPath) > getPageLevel(prevPath) ? 'forward' : 'backward';

  useEffect(() => {
    prevLocationRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (location.pathname !== '/') {
        navigate(-1);
      } else {
        CapacitorApp.exitApp();
      }
    });

    return () => {
      CapacitorApp.removeAllListeners();
    };
  }, [navigate, location]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflowX: 'hidden', overflowY: 'visible' }}>
      <AnimatePresence initial={false} mode="sync">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home direction={direction} />} />
          <Route path="/add" element={<AddProduct direction={direction} />} />
          <Route path="/edit/:id" element={<AddProduct direction={direction} />} />
          <Route path="/product/:id" element={<ProductDetail direction={direction} />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <AnimatedRoutes />
    </HashRouter>
  );
}

export default App;
