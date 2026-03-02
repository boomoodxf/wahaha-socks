export interface Product {
  id: string;
  created_at: string;
  brand: string;
  item_no: string | null;
  crotch_type: string;
  thickness: string;
  material: string;
  cover_url: string;
  cover_url_2?: string | null;
  link: string | null;
  comment: string | null;
}

export type FilterState = {
  thickness: string[];
  material: string[];
  crotch_type: string[];
};

export const THICKNESS_OPTIONS = ['1D', '3D', '5D', '10D', '15D', '20D'];

export const MATERIAL_OPTIONS = [
  { label: '天鹅绒', value: 'velvet' },
  { label: '包芯丝', value: 'core_spun' },
  { label: '雪黛丽', value: 'xuedaili' }
];

export const CROTCH_TYPE_OPTIONS = [
  { label: 'T档', value: 'T_crotch' },
  { label: '无缝裆', value: 'seamless' },
  { label: '一线裆', value: 'one_line' },
  { label: '开档', value: 'open' },
  { label: '长筒', value: 'long' },
  { label: '吊带', value: 'suspender' }
];
