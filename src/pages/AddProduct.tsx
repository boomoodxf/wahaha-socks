import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, Upload, X, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { THICKNESS_OPTIONS, MATERIAL_OPTIONS, CROTCH_TYPE_OPTIONS, Product } from '@/types';
import { useProductStore } from '@/store/useProductStore';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Clipboard } from '@capacitor/clipboard';
import { FilePicker } from '@capawesome/capacitor-file-picker';

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
  const safeDecode = (value: string) => {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  };

  const routeId = id ? safeDecode(id) : undefined;
  const { addProduct, updateProduct, products } = useProductStore();
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [longPressIndex, setLongPressIndex] = useState<number | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, watch, reset, setValue, getValues, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      thickness_select: '10D', // Default
    }
  });

  useEffect(() => {
    if (routeId) {
        const productToEdit = products.find((p) => String(p.id) === String(routeId));
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

            const images = [productToEdit.cover_url];
            if (productToEdit.cover_url_2) {
                images.push(productToEdit.cover_url_2);
            }
            setImagePreviews(images);
        }
    } else {
        // 清空表单和图片预览，避免从编辑页返回时残留数据
        setImagePreviews([]);
    }
  }, [routeId, products, reset]);

  const selectedThickness = watch('thickness_select');
  const selectedMaterial = watch('material_select');
  const selectedCrotch = watch('crotch_type_select');

  const generateProductId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  };

  const compressImageDataUrl = (dataUrl: string, maxSide = 1400, quality = 0.72) => {
    return new Promise<string>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const { width, height } = img;
        const ratio = Math.min(1, maxSide / Math.max(width, height));
        const targetWidth = Math.round(width * ratio);
        const targetHeight = Math.round(height * ratio);

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  const takePhoto = async () => {
    try {
      const image = await CapacitorCamera.getPhoto({
        quality: 70,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      });
      if (image.base64String) {
          const base64Image = `data:image/jpeg;base64,${image.base64String}`;
          setImagePreviews(prev => [...prev, base64Image]);
      }
    } catch (error) {
        console.error('Camera error:', error);
    }
  };

  const pickImages = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const result = await FilePicker.pickImages({
          readData: true,
          limit: 0,
        });

        const newImages = result.files
          .filter((file) => Boolean(file.data))
          .map((file) => `data:${file.mimeType || 'image/jpeg'};base64,${file.data}`);

        if (newImages.length > 0) {
          setImagePreviews((prev) => [...prev, ...newImages]);
        }

        return;
      }

      if (imageInputRef.current) {
        imageInputRef.current.value = '';
        imageInputRef.current.click();
      }
    } catch (error) {
        console.error('Gallery error:', error);
    }
  };

  const handleImageInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const images = await Promise.all(
        Array.from(files).map(
          (file) =>
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = () => reject(reader.error);
              reader.readAsDataURL(file);
            })
        )
      );

      setImagePreviews((prev) => [...prev, ...images]);
    } catch (error) {
      console.error('Web gallery parse error:', error);
      alert('读取图片失败，请重试');
    } finally {
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const moveImageToFirst = (index: number) => {
    if (index === 0) return;
    setImagePreviews(prev => {
      const newPreviews = [...prev];
      const [movedImage] = newPreviews.splice(index, 1);
      newPreviews.unshift(movedImage);
      return newPreviews;
    });
    setLongPressIndex(null);
  };

  const handleLongPressStart = (index: number) => {
    const timer = setTimeout(() => {
      setLongPressIndex(index);
    }, 500);
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(imagePreviews);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setImagePreviews(items);
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
    if (imagePreviews.length === 0) {
      alert('请上传至少一张封面图片');
      return;
    }

    setIsSubmitting(true);

    try {
      const coverImage = await compressImageDataUrl(imagePreviews[0]);
      const secondImage = imagePreviews[1] ? await compressImageDataUrl(imagePreviews[1]) : null;

      const productData: Product = {
        id: routeId || generateProductId(),
        created_at: routeId ? (products.find((p) => String(p.id) === String(routeId))?.created_at || new Date().toISOString()) : new Date().toISOString(),
        brand: data.brand,
        item_no: data.item_no || null,
        crotch_type: data.crotch_type_select === 'Other' ? (data.crotch_type_custom || 'Other') : data.crotch_type_select,
        thickness: data.thickness_select === 'Other' ? (data.thickness_custom || 'Other') : data.thickness_select,
        material: data.material_select === 'Other' ? (data.material_custom || 'Other') : data.material_select,
        cover_url: coverImage,
        cover_url_2: secondImage,
        link: data.link || null,
        comment: data.comment || null,
      };

      if (routeId) {
        updateProduct(productData);
        // 使用 -1 返回到详情页，因为路由是：首页 → 详情页 → 编辑页
        // 返回一次就回到详情页，再返回一次就到首页
        navigate(-1);
      } else {
        addProduct(productData);
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Save product failed:', error);
      alert('保存失败，请减少图片数量或选择更小图片后重试');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ x: '14%', opacity: 0.75 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '12%', opacity: 0.7 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="min-h-screen bg-gray-50 flex flex-col"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 35px)' }}
      >
        <header className="p-4 bg-white border-b flex items-center gap-4 sticky top-0 z-20 shadow-sm">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft />
          </button>
          <h1 className="text-lg font-bold">{routeId ? '编辑商品' : '添加新商品'}</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 pb-32">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg mx-auto">

          {/* Image Upload Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              包装封面 {imagePreviews.length > 0 && <span className="text-xs text-gray-500">(第一张为主图，长按或拖动调整顺序)</span>}
            </label>

            {/* Image Grid */}
            <Reorder.Group
              axis="x"
              values={imagePreviews}
              onReorder={setImagePreviews}
              className="grid grid-cols-2 gap-3"
              as="div"
            >
              {imagePreviews.map((image, index) => (
                <Reorder.Item
                  key={image}
                  value={image}
                  className="relative aspect-[3/4] bg-gray-200 rounded-xl overflow-hidden border-2 border-gray-300"
                  dragListener={false}
                  as="div"
                >
                  <motion.div
                    className="w-full h-full"
                    onTouchStart={() => handleLongPressStart(index)}
                    onTouchEnd={handleLongPressEnd}
                    onMouseDown={() => handleLongPressStart(index)}
                    onMouseUp={handleLongPressEnd}
                    onMouseLeave={handleLongPressEnd}
                    drag
                    dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                    dragElastic={0.1}
                    whileTap={{ scale: 0.95 }}
                  >
                    <img src={image} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                    
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        主图
                      </div>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 z-10"
                    >
                      <X size={16} />
                    </button>
                  </motion.div>
                </Reorder.Item>
              ))}

              {/* Add Button */}
              <div className="relative aspect-[3/4] bg-gray-200 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 flex flex-col items-center justify-center group">
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
                        onClick={pickImages}
                        className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition"
                     >
                        <Upload className="w-8 h-8 text-green-500" />
                        <span className="text-xs text-gray-500">相册</span>
                     </button>
                  </div>
                  <p className="text-xs text-gray-400">添加图片</p>
                </div>
              </div>
            </Reorder.Group>
          </div>

          {/* Long Press Menu */}
          <AnimatePresence>
            {longPressIndex !== null && longPressIndex > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center"
                onClick={() => setLongPressIndex(null)}
              >
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="relative bg-white rounded-2xl p-6 m-4 max-w-sm w-full shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-lg font-bold mb-4 text-center">图片操作</h3>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => moveImageToFirst(longPressIndex)}
                      className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition"
                    >
                      设为主图
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        removeImage(longPressIndex);
                        setLongPressIndex(null);
                      }}
                      className="w-full bg-red-500 text-white py-3 rounded-xl font-medium hover:bg-red-600 transition"
                    >
                      删除图片
                    </button>
                    <button
                      type="button"
                      onClick={() => setLongPressIndex(null)}
                      className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-300 transition"
                    >
                      取消
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>


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
        <div className="shrink-0 p-4 bg-white border-t z-20 pb-[calc(env(safe-area-inset-bottom)+20px)]">
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {isSubmitting ? '保存中...' : '保存商品'}
          </button>
        </div>
      </motion.div>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleImageInputChange}
      />
    </>
  );
}
