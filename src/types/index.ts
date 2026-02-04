export type CrotchType = 'T_crotch' | 'seamless' | 'one_line' | 'open' | 'long' | 'suspender';
export type Material = 'velvet' | 'core_spun' | 'xuedaili';

export interface Product {
  id: string;
  created_at: string;
  brand: string | null;
  item_no: string | null;
  crotch_type: CrotchType | null;
  thickness: string | null;
  material: Material | null;
  cover_url: string;
  link: string | null;
  comment: string | null;
}

export interface FilterState {
  thickness: string[];
  material: Material[];
  crotch_type: CrotchType[];
}

export const THICKNESS_OPTIONS = ['1D', '3D', '5D', '10D', '15D', '20D'];
export const MATERIAL_OPTIONS: { label: string; value: Material }[] = [
  { label: '天鹅绒', value: 'velvet' },
  { label: '包芯丝', value: 'core_spun' },
  { label: '雪黛丽', value: 'xuedaili' },
];
export const CROTCH_TYPE_OPTIONS: { label: string; value: CrotchType }[] = [
  { label: 'T档', value: 'T_crotch' },
  { label: '无缝裆', value: 'seamless' },
  { label: '一线裆', value: 'one_line' },
  { label: '开档', value: 'open' },
  { label: '长筒', value: 'long' },
  { label: '吊带', value: 'suspender' },
];
