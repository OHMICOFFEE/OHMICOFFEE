export type Product = {
  id: string; name: string; slug: string; type: 'single_origin' | 'infused'
  origin: string; roast: string; process: string; masl: string; body: string
  tasting_notes: string; flavour_profile: string; sca_score: number
  price_250g: number; price_500g: number; price_1kg: number
  wholesale_250g: number; wholesale_500g: number; wholesale_1kg: number
  image_url: string; status: string; stock_250g: number; stock_500g: number
  stock_1kg: number; sort_order: number; created_at: string; updated_at: string
}
export type Package = {
  id: string; name: string; once_off_fee: number; monthly_fee: number
  direct_commission: number; wholesale_discount: number
  coffee_bags_included: number; description: string; features: string[]
  is_active: boolean; sort_order: number
}
export type Rank = {
  id: string; name: string; left_required: number; right_required: number
  monthly_earnings: number; sort_order: number; badge_color: string
}
export type Representative = {
  id: string; auth_user_id: string; email: string; first_name: string
  last_name: string; phone: string; id_number: string
  bank_name: string; bank_account_number: string; bank_branch_code: string
  bank_account_type: string; crypto_wallet: string; payout_method: string
  kyc_status: string; id_document_url: string; selfie_url: string
  kyc_submitted_at: string; kyc_verified_at: string; kyc_notes: string
  agreement_signed: boolean; agreement_signed_at: string
  package_id: string; sponsor_id: string; sponsor_name: string
  leg: 'left' | 'right'; current_rank: string; status: string; is_active: boolean
  activated_at: string; total_direct_commissions: number
  total_residual_commissions: number; total_earned: number; total_paid_out: number
  pending_payout: number; left_team_count: number; right_team_count: number
  personal_recruits: number; meals_contributed: number
  rep_slug: string; rep_site_bio: string; created_at: string; updated_at: string
}
export type Commission = {
  id: string; rep_id: string; from_rep_id: string; from_rep_name: string
  type: string; amount: number; description: string; week_ending: string
  status: string; paid_at: string; created_at: string
}
export type Payout = {
  id: string; rep_id: string; rep_name: string; amount: number; method: string
  bank_name: string; bank_account: string; crypto_wallet: string
  status: string; reference: string; week_ending: string; notes: string
  processed_at: string; created_at: string
}
export type Order = {
  id: string; order_number: string; customer_name: string; customer_email: string
  customer_phone: string; rep_id: string; rep_name: string; order_type: string
  items: OrderItem[]; subtotal: number; shipping: number; discount: number
  total: number; status: string; payment_status: string; payment_reference: string
  payment_method: string; shipping_address: ShippingAddress; tracking_number: string
  notes: string; created_at: string; updated_at: string
}
export type OrderItem = {
  product_id: string; product_name: string; size: string; grind: string
  quantity: number; unit_price: number; total: number
}
export type ShippingAddress = { line1: string; line2?: string; city: string; province: string; postal_code: string }
export type CartItem = { product: Product; size: '250g'|'500g'|'1kg'; grind: string; quantity: number; unit_price: number }

export const RANKS_TABLE = [
  { name: 'Qualified Representative', left: 2, right: 2, earnings: 800 },
  { name: 'Rising Star', left: 5, right: 5, earnings: 2000 },
  { name: 'One Star Representative', left: 10, right: 10, earnings: 4000 },
  { name: 'Two Star Representative', left: 20, right: 20, earnings: 8000 },
  { name: 'Four Star Representative', left: 40, right: 40, earnings: 16000 },
  { name: 'Regional Representative', left: 75, right: 75, earnings: 30000 },
  { name: 'National Representative', left: 150, right: 150, earnings: 60000 },
  { name: 'Crowned Director', left: 200, right: 200, earnings: 80000 },
  { name: 'Emerald Director', left: 250, right: 250, earnings: 100000 },
  { name: 'Sapphire Director', left: 300, right: 300, earnings: 120000 },
  { name: 'Diamond Director', left: 350, right: 350, earnings: 140000 },
  { name: 'Black Diamond Director', left: 400, right: 400, earnings: 160000 },
  { name: 'Double Crown Diamond', left: 450, right: 450, earnings: 180000 },
  { name: 'Sovereign Crown Leader', left: 500, right: 500, earnings: 200000 },
]

export function fmt(cents: number): string {
  return `R ${(cents / 100).toLocaleString('en-ZA')}`
}
export function calcRank(l: number, r: number): string {
  return [...RANKS_TABLE].reverse().find(x => l >= x.left && r >= x.right)?.name || 'Unranked'
}
export function residualIncome(l: number, r: number): number {
  return [...RANKS_TABLE].reverse().find(x => l >= x.left && r >= x.right)?.earnings || 0
}
