import { Link } from 'react-router-dom';
import { Plus, Download, Upload, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FilterDrawer } from '@/features/home/FilterDrawer';
import { FilterState, MATERIAL_OPTIONS } from '@/types';
import { useState, useMemo, useRef } from 'react';
import { useProductStore } from '@/store/useProductStore';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { pageTransition, pageVariants } from '@/lib/pageTransition';

export default function Home({ direction }: { direction: 'forward' | 'backward' }) {
  const products = useProductStore((state) => state.products);
  const setProducts = useProductStore((state) => state.setProducts);
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    thickness: [],
    material: [],
    crotch_type: []
  });
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Export Logic
  const handleExport = async () => {
    const data = JSON.stringify(products);
    const fileName = `wahaha_backup_${new Date().toISOString().split('T')[0]}.json`;

    try {
      if (Capacitor.isNativePlatform()) {
        try {
            // First try using Share API directly with file data
            // This is more reliable on newer Android versions
            await Filesystem.writeFile({
              path: fileName,
              data: data,
              directory: Directory.Cache, // Use Cache directory first
              encoding: Encoding.UTF8,
            });

            const fileResult = await Filesystem.getUri({
                directory: Directory.Cache,
                path: fileName,
            });

            await Share.share({
              title: '导出商品数据',
              text: '这是您的商品数据备份',
              url: fileResult.uri,
              dialogTitle: '导出数据',
            });
        } catch (nativeError) {
             console.error('Native export failed, falling back to legacy method', nativeError);
             // Try Documents directory as fallback
             try {
                await Filesystem.writeFile({
                    path: fileName,
                    data: data,
                    directory: Directory.Documents,
                    encoding: Encoding.UTF8,
                  });
                  alert('已保存到文档目录，请在文件管理器中查看');
             } catch (fallbackError) {
                alert(`导出失败，请检查文件权限。错误: ${fallbackError}`);
             }
        }
      } else {
        // Web Export
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      setShowMenu(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert(`导出失败: ${error}`);
    }
  };

  // Import Logic
  const handleImportClick = async () => {
    if (Capacitor.isNativePlatform()) {
        try {
            const result = await FilePicker.pickFiles({
                types: ['application/json'],
                readData: true
            });

            if (result.files && result.files.length > 0) {
                const file = result.files[0];
                if (file.data) {
                    try {
                         // On Android, readData returns base64
                         const jsonContent = atob(file.data); 
                         const json = JSON.parse(jsonContent);
                         if (Array.isArray(json)) {
                            if (window.confirm(`确认导入 ${json.length} 个商品吗？这将覆盖当前数据。`)) {
                                setProducts(json);
                                alert('导入成功！');
                            }
                        } else {
                            alert('文件格式错误：必须是商品数组');
                        }
                    } catch (parseError) {
                        // Fallback: maybe it wasn't base64 or failed to decode
                         console.error("Parse error", parseError);
                         alert("解析文件失败");
                    }
                }
            }
        } catch (err) {
            console.error("File picker cancelled or failed", err);
        }
    } else {
        // Ensure the input is cleared so change event fires even if same file selected
        if (fileInputRef.current) fileInputRef.current.value = '';
        fileInputRef.current?.click();
    }
    setShowMenu(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
            // Basic validation
            if (window.confirm(`确认导入 ${json.length} 个商品吗？这将覆盖当前数据。`)) {
                setProducts(json);
                alert('导入成功！');
            }
        } else {
            alert('文件格式错误：必须是商品数组');
        }
      } catch (error) {
        console.error('Import error:', error);
        alert('导入失败：文件损坏或格式不正确');
      }
    };
    reader.readAsText(file);
    setShowMenu(false);
  };

  return (
    <motion.div
      custom={direction}
      variants={pageVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={pageTransition}
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        height: '100vh',
        overflow: 'hidden',
        willChange: 'transform'
      }}
    >
      <header 
        className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50 flex items-center justify-between px-4"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 35px)', paddingBottom: '1rem' }}
      >
        <div className="w-8" />
        <h1 className="text-xl font-bold text-center">袜哈哈</h1>
        <div className="relative">
             <button 
                onClick={() => setShowMenu(!showMenu)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
             >
                <MoreHorizontal size={24} />
             </button>
             
             <AnimatePresence>
                {showMenu && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 1 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 1 }}
                        className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden min-w-[140px] z-50 origin-top-right"
                    >
                        <button 
                            onClick={handleExport}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-sm font-medium text-left"
                        >
                            <Upload size={18} />
                            导出数据
                        </button>
                        <button 
                            onClick={handleImportClick}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-sm font-medium text-left text-red-600"
                        >
                            <Download size={18} />
                            导入数据
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </header>

      <div
        className="bg-gray-50 pb-24 absolute inset-0 overflow-y-auto"
        style={{ paddingTop: 'calc(max(env(safe-area-inset-top), 35px) + 60px)', paddingBottom: '120px' }}
      >
        <main 
            className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
            {filteredProducts.map(product => (
            <Link key={product.id} to={`/product/${encodeURIComponent(String(product.id))}`} className="block">
                <motion.div 
                    className="bg-white rounded-lg shadow-sm overflow-hidden aspect-[3/4] relative"
                    whileHover={{ scale: 1 }}
                    whileTap={{ scale: 1 }}
                    transition={{ type: 'tween', duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                >
                <img 
                    src={product.cover_url} 
                    alt={product.brand || 'Product'} 
                    className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="text-white text-xs font-semibold">{product.brand}</p>
                    {product.item_no && (
                        <p className="text-white/90 text-[10px] font-medium">货号: {product.item_no}</p>
                    )}
                    <p className="text-white/80 text-[10px]">{product.thickness} • {getMaterialLabel(product.material)}</p>
                </div>
                </motion.div>
            </Link>
            ))}
            
            {filteredProducts.length === 0 && (
            <div className="col-span-full text-center text-gray-400 py-10">
                {products.length === 0 ? "暂无商品，点击 + 添加" : "没有符合筛选条件的商品"}
            </div>
            )}
        </main>

        {/* Backdrop for menu */}
        {showMenu && (
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
        )}
      </div>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        accept=".json" 
        className="hidden" 
        onChange={handleFileChange} 
      />

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-30 flex items-center justify-center pb-[env(safe-area-inset-bottom)]">
          
          {/* Filter Area (Swipe Up) */}
          <div className="absolute inset-0 z-0">
             <FilterDrawer onApply={handleApplyFilters} />
          </div>

          {/* Center Add Button */}
          <Link 
                to="/add"
                className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center bg-black text-white hover:scale-105 transition-transform shadow-lg"
            >
                <Plus size={32} strokeWidth={2} />
            </Link>
      </div>
    </motion.div>
  );
}
