import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, Upload, X, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { THICKNESS_OPTIONS, MATERIAL_OPTIONS, CROTCH_TYPE_OPTIONS, Product } from '@/types';
import { useProductStore } from '@/store/useProductStore';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Clipboard } from '@capacitor/clipboard';

// Schema Definition
const productSchema = z.object({
  brand: z.string().min(1, '品牌不能为空'),
  item_no: z.string().optional(),
  crotch_type_select: z.string().min(1, '请选择裆型'),
  crotch_type_custom: z.string().optional(),
  thickness_select: z.string().min(1, '请选择厚度'),
  thickness_custom: z.string().optional(),
  material_select: z.string().min(1, '请选择材质'),
  material_custom: z.string().optional(),
  link: z.string().optional(),
  comment: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function AddProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addProduct, updateProduct, products } = useProductStore();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  const { register, handleSubmit, watch, reset, setValue, getValues, formState: { errors } } = useForm<ProductFormValues>({
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
            const isCustomMaterial = !MATERIAL_OPTIONS.some(opt => opt.value === productToEdit.material);
            const isCustomCrotch = !CROTCH_TYPE_OPTIONS.some(opt => opt.value === productToEdit.crotch_type);
            
            reset({
                brand: productToEdit.brand || '',
                item_no: productToEdit.item_no || '',
                crotch_type_select: isCustomCrotch ? 'Other' : productToEdit.crotch_type || '',
                crotch_type_custom: isCustomCrotch ? productToEdit.crotch_type : '',
                thickness_select: isCustomThickness ? 'Other' : productToEdit.thickness || '10D',
                thickness_custom: isCustomThickness ? productToEdit.thickness || '' : '',
                material_select: isCustomMaterial ? 'Other' : productToEdit.material || '',
                material_custom: isCustomMaterial ? productToEdit.material : '',
                link: productToEdit.link || '',
                comment: productToEdit.comment || ''
            });
            setImagePreview(productToEdit.cover_url);
        }
    }
  }, [id, products, reset]);

  const selectedThickness = watch('thickness_select');
  const selectedMaterial = watch('material_select');
  const selectedCrotch = watch('crotch_type_select');

  const takePhoto = async () => {
    try {
      const image = await CapacitorCamera.getPhoto({
        quality: 70,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      });
      if (image.base64String) {
          setImagePreview(`data:image/jpeg;base64,${image.base64String}`);
      }
    } catch (error) {
        console.error('Camera error:', error);
    }
  };

  const pickImage = async () => {
    try {
      const image = await CapacitorCamera.getPhoto({
        quality: 70,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos
      });
      if (image.base64String) {
          setImagePreview(`data:image/jpeg;base64,${image.base64String}`);
      }
    } catch (error) {
        console.error('Gallery error:', error);
    }
  };

  const copyLink = async () => {
    const linkText = getValues('link');
    if (!linkText) return;

    try {
        await Clipboard.write({
            string: linkText
        });
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
        console.error('Failed to copy', err);
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
        crotch_type: data.crotch_type_select === 'Other' ? (data.crotch_type_custom || 'Other') : data.crotch_type_select,
        thickness: data.thickness_select === 'Other' ? (data.thickness_custom || 'Other') : data.thickness_select,
        material: data.material_select === 'Other' ? (data.material_custom || 'Other') : data.material_select,
        cover_url: imagePreview,
        link: data.link || null,
        comment: data.comment || null,
    };

    if (id) {
        updateProduct(productData);
    } else {
        addProduct(productData);
    }

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
      style={{ paddingTop: 'max(env(safe-area-inset-top), 35px)' }}
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
                        onClick={takePhoto}
                        className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition"
                     >
                        <Camera className="w-8 h-8 text-blue-500" />
                        <span className="text-xs text-gray-500">拍照</span>
                     </button>
                     <button 
                        type="button"
                        onClick={pickImage}
                        className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition"
                     >
                        <Upload className="w-8 h-8 text-green-500" />
                        <span className="text-xs text-gray-500">相册</span>
                     </button>
                  </div>
                  <p className="text-xs text-gray-400">点击上传封面</p>
                </div>
              )}
            </div>
          </div>

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
                {[...CROTCH_TYPE_OPTIONS, { label: '其他', value: 'Other' }].map(opt => (
                    <label key={opt.value} className="cursor-pointer">
                        <input 
                            type="radio" 
                            value={opt.value} 
                            {...register('crotch_type_select')}
                            className="hidden peer"
                        />
                        <span className="px-3 py-2 rounded-lg border bg-white text-sm text-gray-600 peer-checked:bg-black peer-checked:text-white peer-checked:border-black transition-colors block">
                            {opt.label}
                        </span>
                    </label>
                ))}
            </div>
            {selectedCrotch === 'Other' && (
                <input 
                  {...register('crotch_type_custom')}
                  className="w-full mt-2 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="输入自定义裆型"
                />
            )}
            {errors.crotch_type_select && <p className="text-red-500 text-xs">{errors.crotch_type_select.message}</p>}
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
                {[...MATERIAL_OPTIONS, { label: '其他', value: 'Other' }].map(opt => (
                    <label key={opt.value} className="cursor-pointer">
                        <input 
                            type="radio" 
                            value={opt.value} 
                            {...register('material_select')}
                            className="hidden peer"
                        />
                        <span className="px-3 py-2 rounded-lg border bg-white text-sm text-gray-600 peer-checked:bg-black peer-checked:text-white peer-checked:border-black transition-colors block">
                            {opt.label}
                        </span>
                    </label>
                ))}
            </div>
            {selectedMaterial === 'Other' && (
                <input 
                  {...register('material_custom')}
                  className="w-full mt-2 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="输入自定义材质"
                />
            )}
            {errors.material_select && <p className="text-red-500 text-xs">{errors.material_select.message}</p>}
          </div>

          {/* Link */}
          <div className="space-y-1">
            <label className="text-sm font-medium">商品链接</label>
            <div className="flex gap-2">
                <input 
                  {...register('link')}
                  className="flex-1 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="输入链接或文字..."
                />
                <button 
                  type="button" 
                  onClick={copyLink}
                  className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors"
                  title="复制内容"
                >
                    {isCopied ? <Check size={20} className="text-green-600" /> : <Copy size={20} />}
                </button>
            </div>
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
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-20 pb-[calc(env(safe-area-inset-bottom)+20px)]">
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