import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, Upload, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { THICKNESS_OPTIONS, MATERIAL_OPTIONS, CROTCH_TYPE_OPTIONS, Product, CrotchType, Material } from '@/types';
import { useProductStore } from '@/store/useProductStore';

// Schema Definition
const productSchema = z.object({
  brand: z.string().min(1, '品牌不能为空'),
  item_no: z.string().optional(),
  crotch_type: z.string().min(1, '请选择裆型'),
  thickness_select: z.string().min(1, '请选择厚度'),
  thickness_custom: z.string().optional(),
  material: z.string().min(1, '请选择材质'),
  link: z.string().url('链接格式不正确').optional().or(z.literal('')),
  comment: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function AddProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addProduct, updateProduct, products } = useProductStore();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      thickness_select: '10D', // Default
    }
  });

  useEffect(() => {
    if (id) {
        const productToEdit = products.find(p => p.id === id);
        if (productToEdit) {
            const isCustomThickness = !THICKNESS_OPTIONS.includes(productToEdit.thickness || '');
            
            reset({
                brand: productToEdit.brand || '',
                item_no: productToEdit.item_no || '',
                crotch_type: productToEdit.crotch_type || '',
                thickness_select: isCustomThickness ? 'Other' : productToEdit.thickness || '10D',
                thickness_custom: isCustomThickness ? productToEdit.thickness || '' : '',
                material: productToEdit.material || '',
                link: productToEdit.link || '',
                comment: productToEdit.comment || ''
            });
            setImagePreview(productToEdit.cover_url);
        }
    }
  }, [id, products, reset]);

  const selectedThickness = watch('thickness_select');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
        setShowCamera(true);
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' }
        });
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    } catch (err) {
        console.error("Error accessing camera:", err);
        alert("无法访问相机，请确保已授予权限。");
        setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImagePreview(dataUrl);
        stopCamera();
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    if (!imagePreview) {
      alert('请上传封面图片');
      return;
    }
    
    setIsSubmitting(true);
    
    const productData: Product = {
        id: id || crypto.randomUUID(),
        created_at: id ? (products.find(p => p.id === id)?.created_at || new Date().toISOString()) : new Date().toISOString(),
        brand: data.brand,
        item_no: data.item_no || null,
        crotch_type: data.crotch_type as CrotchType,
        thickness: data.thickness_select === 'Other' ? (data.thickness_custom || 'Other') : data.thickness_select,
        material: data.material as Material,
        cover_url: imagePreview,
        link: data.link || null,
        comment: data.comment || null,
    };

    if (id) {
        updateProduct(productData);
    } else {
        addProduct(productData);
    }

    // Simulate a small delay for better UX
    setTimeout(() => {
        setIsSubmitting(false);
        navigate(id ? `/product/${id}` : '/');
    }, 500);
  };

  return (
    <motion.div 
      initial={{ x: '100%' }} 
      animate={{ x: 0 }} 
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="min-h-screen bg-gray-50 flex flex-col"
    >
      <header className="p-4 bg-white border-b flex items-center gap-4 sticky top-0 z-20 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft />
        </button>
        <h1 className="text-lg font-bold">{id ? '编辑商品' : '添加新商品'}</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-32">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg mx-auto">
          
          {/* Image Upload Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">包装封面</label>
            <div className="relative aspect-[3/4] bg-gray-200 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 flex flex-col items-center justify-center group">
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <div className="flex justify-center gap-4">
                     <button 
                        type="button"
                        onClick={startCamera}
                        className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition"
                     >
                        <Camera className="w-8 h-8 text-blue-500" />
                        <span className="text-xs text-gray-500">拍照</span>
                     </button>
                     <label className="cursor-pointer flex flex-col items-center gap-2 p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition">
                        <Upload className="w-8 h-8 text-green-500" />
                        <span className="text-xs text-gray-500">相册</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                     </label>
                  </div>
                  <p className="text-xs text-gray-400">点击上传封面</p>
                </div>
              )}
            </div>
          </div>

          {/* Camera Modal */}
          {showCamera && (
            <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover"
                />
                <div className="absolute bottom-10 flex gap-8 items-center">
                    <button 
                        type="button"
                        onClick={stopCamera}
                        className="p-4 rounded-full bg-gray-800 text-white"
                    >
                        <X size={24} />
                    </button>
                    <button 
                        type="button"
                        onClick={capturePhoto}
                        className="p-6 rounded-full bg-white border-4 border-gray-300 active:scale-95 transition-transform"
                    >
                        <div className="w-full h-full" />
                    </button>
                </div>
            </div>
          )}

          {/* Brand */}
          <div className="space-y-1">
            <label className="text-sm font-medium">品牌</label>
            <input 
              {...register('brand')}
              className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="例如: 宝娜斯"
            />
            {errors.brand && <p className="text-red-500 text-xs">{errors.brand.message}</p>}
          </div>

          {/* Item No */}
          <div className="space-y-1">
            <label className="text-sm font-medium">货号</label>
            <input 
              {...register('item_no')}
              className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="例如: 8080"
            />
          </div>

          {/* Crotch Type */}
          <div className="space-y-1">
            <label className="text-sm font-medium">裆型</label>
            <div className="flex flex-wrap gap-2">
                {CROTCH_TYPE_OPTIONS.map(opt => (
                    <label key={opt.value} className="cursor-pointer">
                        <input 
                            type="radio" 
                            value={opt.value} 
                            {...register('crotch_type')}
                            className="hidden peer"
                        />
                        <span className="px-3 py-2 rounded-lg border bg-white text-sm text-gray-600 peer-checked:bg-black peer-checked:text-white peer-checked:border-black transition-colors block">
                            {opt.label}
                        </span>
                    </label>
                ))}
            </div>
            {errors.crotch_type && <p className="text-red-500 text-xs">{errors.crotch_type.message}</p>}
          </div>

          {/* Thickness */}
          <div className="space-y-1">
            <label className="text-sm font-medium">厚度</label>
            <div className="grid grid-cols-3 gap-2">
                {[...THICKNESS_OPTIONS, 'Other'].map(opt => (
                     <label key={opt} className="cursor-pointer">
                        <input 
                            type="radio" 
                            value={opt} 
                            {...register('thickness_select')}
                            className="hidden peer"
                        />
                        <span className="px-3 py-2 rounded-lg border bg-white text-sm text-gray-600 peer-checked:bg-black peer-checked:text-white peer-checked:border-black transition-colors block text-center">
                            {opt === 'Other' ? '其他' : opt}
                        </span>
                    </label>
                ))}
            </div>
            
            {selectedThickness === 'Other' && (
                <input 
                  {...register('thickness_custom')}
                  className="w-full mt-2 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="输入自定义厚度 (例如: 80D)"
                />
            )}
             {errors.thickness_select && <p className="text-red-500 text-xs">{errors.thickness_select.message}</p>}
          </div>

          {/* Material */}
          <div className="space-y-1">
            <label className="text-sm font-medium">材质</label>
            <div className="flex flex-wrap gap-2">
                {MATERIAL_OPTIONS.map(opt => (
                    <label key={opt.value} className="cursor-pointer">
                        <input 
                            type="radio" 
                            value={opt.value} 
                            {...register('material')}
                            className="hidden peer"
                        />
                        <span className="px-3 py-2 rounded-lg border bg-white text-sm text-gray-600 peer-checked:bg-black peer-checked:text-white peer-checked:border-black transition-colors block">
                            {opt.label}
                        </span>
                    </label>
                ))}
            </div>
            {errors.material && <p className="text-red-500 text-xs">{errors.material.message}</p>}
          </div>

          {/* Link */}
          <div className="space-y-1">
            <label className="text-sm font-medium">商品链接</label>
            <input 
              {...register('link')}
              className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="https://..."
            />
            {errors.link && <p className="text-red-500 text-xs">{errors.link.message}</p>}
          </div>

          {/* Comment */}
          <div className="space-y-1">
            <label className="text-sm font-medium">备注/评价</label>
            <textarea 
              {...register('comment')}
              rows={3}
              className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="写下你的评价..."
            />
          </div>

        </form>
      </main>
      
      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-20">
         <button 
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-[0.98] transition-transform disabled:opacity-50"
         >
            {isSubmitting ? '保存中...' : '保存商品'}
         </button>
      </div>

    </motion.div>
  );
}
