import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { MATERIAL_OPTIONS, CROTCH_TYPE_OPTIONS } from '@/types';
import { useEffect, useState } from 'react';
import { useProductStore } from '@/store/useProductStore';
import { Product } from '@/types';

export default function ProductDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { products, deleteProduct } = useProductStore();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (id) {
      const found = products.find(p => p.id === id);
      setProduct(found || null);
    }
  }, [id, products]);

  if (!product) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            加载中...
        </div>
    );
  }

  const getLabel = (options: {label: string, value: string}[], value: string | null) => {
    return options.find(o => o.value === value)?.label || value;
  };

  const handleDelete = () => {
    if (window.confirm('确定要删除这个商品吗？')) {
        deleteProduct(product.id);
        navigate('/');
    }
  };

  return (
    <motion.div 
      initial={{ x: '100%' }} 
      animate={{ x: 0 }} 
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="min-h-screen bg-white pb-10"
    >
      <header className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-center">
        <button 
          onClick={() => navigate(-1)} 
          className="bg-white/80 backdrop-blur-md p-2 rounded-full shadow-sm hover:bg-white transition"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="flex gap-2">
            <button 
              onClick={() => navigate(`/edit/${product.id}`)}
              className="bg-white/80 backdrop-blur-md p-2 rounded-full shadow-sm hover:bg-white transition"
            >
              <Pencil size={20} />
            </button>
            <button 
              onClick={handleDelete}
              className="bg-white/80 backdrop-blur-md p-2 rounded-full shadow-sm hover:bg-white text-red-500 transition"
            >
              <Trash2 size={20} />
            </button>
        </div>
      </header>

      {/* Hero Image */}
      <div className="w-full h-[60vh] bg-gray-100">
        <img 
            src={product.cover_url} 
            alt={product.brand || 'Product'} 
            className="w-full h-full object-cover"
        />
      </div>

      <div className="p-6 -mt-6 bg-white rounded-t-3xl relative z-0 space-y-6 min-h-[40vh]">
        {/* Header Info */}
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold">{product.brand}</h1>
                <p className="text-gray-500 text-sm mt-1">货号: {product.item_no || '无'}</p>
            </div>
            <div className="bg-black text-white px-3 py-1 rounded-full text-sm font-semibold">
                {product.thickness}
            </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-gray-100">
            <div className="space-y-1">
                <span className="text-xs text-gray-400 uppercase tracking-wider">材质</span>
                <p className="font-medium">{getLabel(MATERIAL_OPTIONS, product.material)}</p>
            </div>
            <div className="space-y-1">
                <span className="text-xs text-gray-400 uppercase tracking-wider">裆型</span>
                <p className="font-medium">{getLabel(CROTCH_TYPE_OPTIONS, product.crotch_type)}</p>
            </div>
        </div>

        {/* Comment */}
        {product.comment && (
            <div className="space-y-2">
                <h3 className="font-semibold text-lg">备注</h3>
                <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl">
                    {product.comment}
                </p>
            </div>
        )}

        {/* Link Button */}
        {product.link && (
             <a 
                href={product.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white py-4 rounded-xl font-semibold active:scale-[0.98] transition-transform"
             >
                <ExternalLink size={18} />
                查看商品链接
             </a>
        )}
      </div>
    </motion.div>
  );
}
