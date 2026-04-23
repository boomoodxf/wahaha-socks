import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import AddProduct from './pages/AddProduct';
import ProductDetail from './pages/ProductDetail';
import { App as CapacitorApp } from '@capacitor/app';
import { useEffect, useState, useRef } from 'react';

function AnimatedRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const [direction, setDirection] = useState(0);
  const prevLocationRef = useRef(location.pathname);

  useEffect(() => {
    // 判断导航方向
    const prevPath = prevLocationRef.current;
    const currentPath = location.pathname;
    
    // 定义页面层级
    const getPageLevel = (path: string) => {
      if (path === '/') return 0;
      if (path.startsWith('/product/')) return 1;
      if (path.startsWith('/edit/') || path === '/add') return 2;
      return 0;
    };
    
    const prevLevel = getPageLevel(prevPath);
    const currentLevel = getPageLevel(currentPath);
    
    // 1: 前进（从右往左）, -1: 后退（从左往右）
    setDirection(currentLevel > prevLevel ? 1 : -1);
    prevLocationRef.current = currentPath;
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
    <AnimatePresence mode="popLayout" initial={false} custom={direction}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home direction={direction} />} />
        <Route path="/add" element={<AddProduct direction={direction} />} />
        <Route path="/edit/:id" element={<AddProduct direction={direction} />} />
        <Route path="/product/:id" element={<ProductDetail direction={direction} />} />
      </Routes>
    </AnimatePresence>
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
