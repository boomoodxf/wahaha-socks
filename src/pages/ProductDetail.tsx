import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Pencil, Trash2, Copy, Check, X, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MATERIAL_OPTIONS, CROTCH_TYPE_OPTIONS } from '@/types';
import { useEffect, useState } from 'react';
import { useProductStore } from '@/store/useProductStore';
import { Product } from '@/types';
import { Clipboard } from '@capacitor/clipboard';

export default function ProductDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { products, deleteProduct } = useProductStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [isCopiedItem, setIsCopiedItem] = useState(false);
  const [isCopiedLink, setIsCopiedLink] = useState(false);

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

  const copyToClipboard = async (text: string, type: 'item' | 'link') => {
    try {
        await Clipboard.write({ string: text });
        if (type === 'item') {
            setIsCopiedItem(true);
            setTimeout(() => setIsCopiedItem(false), 2000);
        } else {
            setIsCopiedLink(true);
            setTimeout(() => setIsCopiedLink(false), 2000);
        }
    } catch (err) {
        console.error('Failed to copy', err);
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
      <header 
        className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-center"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 35px)' }}
      >
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
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-gray-500 text-sm">货号: {product.item_no || '无'}</p>
                    {product.item_no && (
                        <button 
                            onClick={() => copyToClipboard(`${product.brand} ${product.item_no}`, 'item')}
                            className="p-1 text-gray-400 hover:text-black transition-colors"
                        >
                            {isCopiedItem ? <Check size={14} className="text-green-500"/> : <Copy size={14} />}
                        </button>
                    )}
                </div>
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

        {/* Product Link Display Box */}
        {product.link && (
            <div className="space-y-2">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <LinkIcon size={18} />
                    商品链接
                </h3>
                <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between gap-3 group">
                    <p className="text-gray-600 text-sm truncate flex-1">
                        {product.link}
                    </p>
                    <button 
                        onClick={() => copyToClipboard(product.link!, 'link')}
                        className="p-2 bg-white rounded-lg shadow-sm active:scale-95 transition-transform"
                    >
                        {isCopiedLink ? <Check size={16} className="text-green-500"/> : <Copy size={16} />}
                    </button>
                </div>
            </div>
        )}

        {/* Comment */}
        {product.comment && (
            <div className="space-y-2">
                <h3 className="font-semibold text-lg">备注</h3>
                <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl">
                    {product.comment}
                </p>
            </div>
        )}

        {/* Link Button (Bottom Action) */}
        {product.link && (
             <button 
                onClick={() => setShowLinkModal(true)}
                className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white py-4 rounded-xl font-semibold active:scale-[0.98] transition-transform"
             >
                <ExternalLink size={18} />
                查看完整链接
             </button>
        )}
      </div>

      {/* Link Modal */}
      <AnimatePresence>
        {showLinkModal && product.link && (
            <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowLinkModal(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                <motion.div 
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 space-y-6 m-4"
                >
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold">商品链接</h3>
                        <button onClick={() => setShowLinkModal(false)} className="p-2 bg-gray-100 rounded-full">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-xl max-h-[40vh] overflow-y-auto break-all text-sm text-gray-700 leading-relaxed border border-gray-100">
                        {product.link}
                    </div>

                    <button 
                        onClick={() => copyToClipboard(product.link!, 'link')}
                        className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-[0.98] transition-transform"
                    >
                        {isCopiedLink ? <Check size={20} /> : <Copy size={20} />}
                        {isCopiedLink ? '已复制' : '一键复制链接'}
                    </button>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
