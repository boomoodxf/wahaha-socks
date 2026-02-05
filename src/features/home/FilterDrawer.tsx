import { Drawer } from 'vaul';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { THICKNESS_OPTIONS, MATERIAL_OPTIONS, CROTCH_TYPE_OPTIONS, FilterState } from '@/types';
import { Filter, SlidersHorizontal } from 'lucide-react';

interface FilterDrawerProps {
  onApply: (filters: FilterState) => void;
}

export function FilterDrawer({ onApply }: FilterDrawerProps) {
  const [filters, setFilters] = useState<FilterState>({
    thickness: [],
    material: [],
    crotch_type: [],
  });

  const toggleFilter = (category: keyof FilterState, value: string) => {
    setFilters(prev => {
      const current = prev[category] as string[];
      const exists = current.includes(value);
      return {
        ...prev,
        [category]: exists 
          ? current.filter(item => item !== value)
          : [...current, value]
      };
    });
  };

  const handleReset = () => {
    setFilters({
      thickness: [],
      material: [],
      crotch_type: [],
    });
  };

  const handleApply = () => {
    onApply(filters);
  };

  return (
    <Drawer.Root shouldScaleBackground>
      {/* 
        The Trigger now wraps the entire bottom bar area in Home.tsx implicitly via absolute positioning,
        but to make it truly "swipe up" from anywhere on the white bar, we need a visible trigger or custom logic.
        Here we make the trigger a full-width transparent overlay on the bottom bar, BUT we want the + button to still be clickable.
        So we will use a specific layout.
      */}
      <Drawer.Trigger asChild>
         <div className="w-full h-full flex items-center justify-end px-6 cursor-pointer active:bg-gray-50 transition-colors">
            <div className="text-gray-400 flex items-center gap-1">
                <SlidersHorizontal size={20} />
            </div>
         </div>
      </Drawer.Trigger>
      
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-[10px] h-[85vh] mt-24 fixed bottom-0 left-0 right-0 z-50">
          <div className="p-4 bg-white rounded-t-[10px] flex-1 overflow-y-auto">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-300 mb-8" />
            
            <div className="max-w-md mx-auto space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">筛选</h2>
                <Filter className="w-6 h-6 text-gray-400" />
              </div>

              {/* Thickness */}
              <section>
                <h3 className="font-semibold mb-3">厚度</h3>
                <div className="flex flex-wrap gap-2">
                  {THICKNESS_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => toggleFilter('thickness', opt)}
                      className={cn(
                        "px-4 py-2 rounded-full border text-sm transition-colors",
                        filters.thickness.includes(opt) 
                          ? "bg-black text-white border-black" 
                          : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </section>

              {/* Material */}
              <section>
                <h3 className="font-semibold mb-3">材质</h3>
                <div className="flex flex-wrap gap-2">
                  {MATERIAL_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => toggleFilter('material', opt.value)}
                      className={cn(
                        "px-4 py-2 rounded-full border text-sm transition-colors",
                        filters.material.includes(opt.value) 
                          ? "bg-black text-white border-black" 
                          : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* Crotch Type */}
              <section>
                <h3 className="font-semibold mb-3">裆型</h3>
                <div className="flex flex-wrap gap-2">
                  {CROTCH_TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => toggleFilter('crotch_type', opt.value)}
                      className={cn(
                        "px-4 py-2 rounded-full border text-sm transition-colors",
                        filters.crotch_type.includes(opt.value) 
                          ? "bg-black text-white border-black" 
                          : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </section>

            </div>
          </div>
          
          <div className="p-4 bg-gray-50 border-t mt-auto flex gap-3">
             <button 
                onClick={handleReset}
                className="flex-1 bg-white border border-gray-300 text-black py-3 rounded-lg font-semibold active:scale-95 transition-transform"
             >
                重置
             </button>
             <Drawer.Close asChild>
                <button 
                  onClick={handleApply}
                  className="flex-[2] bg-black text-white py-3 rounded-lg font-semibold active:scale-95 transition-transform"
                >
                  应用筛选
                </button>
             </Drawer.Close>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
