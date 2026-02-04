import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { FilterDrawer } from '@/features/home/FilterDrawer';
import { FilterState, MATERIAL_OPTIONS } from '@/types';
import { useState, useMemo } from 'react';
import { useProductStore } from '@/store/useProductStore';

export default function Home() {
  const products = useProductStore((state) => state.products);
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    thickness: [],
    material: [],
    crotch_type: []
  });

  const handleApplyFilters = (filters: FilterState) => {
    setActiveFilters(filters);
  };

  const getMaterialLabel = (value: string | null) => {
    return MATERIAL_OPTIONS.find(o => o.value === value)?.label || value;
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
        const matchesThickness = activeFilters.thickness.length === 0 || (product.thickness && activeFilters.thickness.includes(product.thickness));
        const matchesMaterial = activeFilters.material.length === 0 || (product.material && activeFilters.material.includes(product.material));
        const matchesCrotch = activeFilters.crotch_type.length === 0 || (product.crotch_type && activeFilters.crotch_type.includes(product.crotch_type));
        
        return matchesThickness && matchesMaterial && matchesCrotch;
    });
  }, [products, activeFilters]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50 pb-24 relative"
    >
      <header className="p-4 bg-white shadow-sm sticky top-0 z-10">
        <h1 className="text-xl font-bold text-center">袜哈哈</h1>
      </header>

      <main className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {filteredProducts.map(product => (
          <Link key={product.id} to={`/product/${product.id}`} className="block">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden aspect-[3/4] relative">
              <img 
                src={product.cover_url} 
                alt={product.brand || 'Product'} 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                 <p className="text-white text-xs font-semibold">{product.brand}</p>
                 <p className="text-white/80 text-[10px]">{product.thickness} • {getMaterialLabel(product.material)}</p>
              </div>
            </div>
          </Link>
        ))}
        
        {filteredProducts.length === 0 && (
          <div className="col-span-full text-center text-gray-400 py-10">
            {products.length === 0 ? "暂无商品，点击 + 添加" : "没有符合筛选条件的商品"}
          </div>
        )}
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col items-center gap-4 z-20">
         {/* Filter Button */}
         <FilterDrawer onApply={handleApplyFilters} />

         {/* Add Button */}
         <Link 
          to="/add" 
          className="bg-black text-white p-4 rounded-full shadow-lg hover:scale-105 transition-transform"
        >
          <Plus size={32} />
        </Link>
      </div>
    </motion.div>
  );
}
