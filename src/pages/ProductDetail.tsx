import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Pencil, Trash2, Copy, Check, X, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MATERIAL_OPTIONS, CROTCH_TYPE_OPTIONS } from '@/types';
import { useEffect, useRef, useState } from 'react';
import { useProductStore } from '@/store/useProductStore';
import { Clipboard } from '@capacitor/clipboard';

export default function ProductDetail({ direction }: { direction: number }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { products, deleteProduct } = useProductStore();
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [isCopiedItem, setIsCopiedItem] = useState(false);
  const [isCopiedLink, setIsCopiedLink] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1);
  const [touchStartY, setTouchStartY] = useState(0);
  const [touchEndY, setTouchEndY] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalTouchStartY, setModalTouchStartY] = useState(0);
  const [modalDragY, setModalDragY] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomX, setZoomX] = useState(0);
  const [zoomY, setZoomY] = useState(0);
  const pinchStartDistance = useRef<number | null>(null);
  const pinchStartScale = useRef(1);
  const previousProductIdRef = useRef<string | null>(null);

  const safeDecode = (value: string) => {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  };

  const routeId = id ? safeDecode(id) : '';
  const product = products.find((p) => String(p.id) === String(routeId)) || null;

  if (product && previousProductIdRef.current !== product.id) {
    previousProductIdRef.current = product.id;
    if (currentImageIndex !== 0) {
      setCurrentImageIndex(0);
    }
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white px-4">
        <p className="text-gray-700">商品不存在或已被删除</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded-lg bg-black text-white"
        >
          返回首页
        </button>
      </div>
    );
  }

  const getLabel = (options: {label: string, value: string}[], value: string | null) => {
    return options.find(o => o.value === value)?.label || value;
  };

  const handleDelete = () => {
    if (window.confirm('确定要删除这个商品吗？')) {
      deleteProduct(product.id);
      window.location.hash = '#/';
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

  const images = [product.cover_url, product.cover_url_2].filter(Boolean) as string[];
  const safeImageIndex = images.length === 0 ? 0 : currentImageIndex % images.length;
  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    setSlideDirection(1);
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSlideDirection(-1);
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndY(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStartY || !touchEndY) return;

    const deltaY = touchEndY - touchStartY;
    const isSwipeDownToExpand = deltaY > 70;

    if (isSwipeDownToExpand) {
      setShowImageModal(true);
    }

    setTouchStartY(0);
    setTouchEndY(0);
  };

  const handleModalTouchStart = (e: React.TouchEvent) => {
    if (e.targetTouches.length === 2) {
      const [touchA, touchB] = [e.targetTouches[0], e.targetTouches[1]];
      const distance = Math.hypot(
        touchA.clientX - touchB.clientX,
        touchA.clientY - touchB.clientY
      );
      pinchStartDistance.current = distance;
      pinchStartScale.current = zoomScale;
      return;
    }

    setModalTouchStartY(e.targetTouches[0].clientY);
    setModalDragY(0);
  };

  const handleModalTouchMove = (e: React.TouchEvent) => {
    if (e.targetTouches.length === 2) {
      const [touchA, touchB] = [e.targetTouches[0], e.targetTouches[1]];
      const distance = Math.hypot(
        touchA.clientX - touchB.clientX,
        touchA.clientY - touchB.clientY
      );

      if (pinchStartDistance.current) {
        const nextScale = (distance / pinchStartDistance.current) * pinchStartScale.current;
        setZoomScale(Math.min(4, Math.max(1, nextScale)));
      }

      return;
    }

    if (zoomScale > 1) {
      return;
    }

    if (!modalTouchStartY) return;
    const currentY = e.targetTouches[0].clientY;
    const diff = currentY - modalTouchStartY;
    if (diff > 0) {
      setModalDragY(diff);
    }
  };

  const handleModalTouchEnd = () => {
    if (pinchStartDistance.current) {
      pinchStartDistance.current = null;
      pinchStartScale.current = zoomScale;
    }

    if (modalDragY > 100) {
      setShowImageModal(false);
    }
    setModalDragY(0);
    setModalTouchStartY(0);
  };

  useEffect(() => {
    if (!showImageModal) {
      setZoomScale(1);
      setZoomX(0);
      setZoomY(0);
      pinchStartDistance.current = null;
      pinchStartScale.current = 1;
    }
  }, [showImageModal]);

  return (
    <motion.div 
      className="min-h-screen bg-white pb-10"
      custom={direction}
      initial={{ x: direction > 0 ? '100%' : '-100%' }}
      animate={{ x: 0 }}
      exit={{ x: direction > 0 ? '100%' : '-100%' }}
      transition={{ type: 'tween', duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{ position: 'absolute', width: '100%', minHeight: '100vh' }}
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

      {/* Hero Image with Carousel */}
      <div
        className="w-full h-[60vh] bg-gray-100 relative overflow-hidden cursor-pointer"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {images.length > 0 ? (
          <AnimatePresence initial={false} custom={slideDirection}>
            <motion.img
              key={images[safeImageIndex]}
              src={images[safeImageIndex]}
              alt={product.brand || 'Product'}
              custom={slideDirection}
              className="absolute inset-0 w-full h-full object-cover"
              variants={{
                enter: (direction: number) => ({
                  x: direction > 0 ? '100%' : '-100%'
                }),
                center: {
                  x: 0
                },
                exit: (direction: number) => ({
                  x: direction > 0 ? '-100%' : '100%'
                })
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                type: 'spring',
                stiffness: 320,
                damping: 34
              }}
              drag={hasMultipleImages ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              onDragEnd={(_, info) => {
                if (!hasMultipleImages) return;
                if (info.offset.x < -60) {
                  nextImage();
                } else if (info.offset.x > 60) {
                  prevImage();
                }
              }}
            />
          </AnimatePresence>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            无图片
          </div>
        )}

        {/* Image Indicators */}
        {hasMultipleImages && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
            {images.map((_, index) => (
              <div
                key={index}
                className={`transition-all ${
                  index === currentImageIndex
                    ? 'w-2 h-2 rounded-full bg-white'
                    : 'w-1.5 h-1.5 rounded-full bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
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

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && images.length > 0 && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowImageModal(false)}
                    className="absolute inset-0 bg-black"
                />
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{
                      scale: 1,
                      opacity: Math.max(0, 1 - modalDragY / 300),
                      y: modalDragY
                    }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                     className="relative w-full h-full flex items-center justify-center p-4"
                     onTouchStart={handleModalTouchStart}
                     onTouchMove={handleModalTouchMove}
                     onTouchEnd={handleModalTouchEnd}
                >
                    <motion.img
                        src={images[safeImageIndex]}
                        alt={product.brand || 'Product'}
                        className="max-w-full max-h-full object-contain"
                        animate={{
                          scale: zoomScale,
                          x: zoomX,
                          y: zoomY,
                        }}
                        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
                        drag={zoomScale > 1 ? true : false}
                        dragMomentum={false}
                        onDoubleClick={() => {
                          if (zoomScale > 1) {
                            setZoomScale(1);
                            setZoomX(0);
                            setZoomY(0);
                          } else {
                            setZoomScale(2);
                          }
                        }}
                    />
                    <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowImageModal(false);
                        }}
                        className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full text-white"
                        style={{ top: 'max(env(safe-area-inset-top), 16px)' }}
                    >
                        <X size={24} />
                    </button>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
