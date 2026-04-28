export type Rep = {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string
  id_number: string
  bank_name: string
  bank_account_number: string
  bank_branch_code: string
  crypto_wallet: string
  payout_method: 'bank' | 'crypto'
  kyc_status: 'pending' | 'submitted' | 'verified' | 'rejected'
  package_id: string
  package_name: string
  sponsor_id: string
  sponsor_name: string
  leg: 'left' | 'right'
  current_rank: string
  status: 'pending' | 'active' | 'suspended'
  is_active: boolean
  left_team_count: number
  right_team_count: number
  personal_recruits: number
  total_earned: number
  total_paid_out: number
  pending_payout: number
  rep_code: string
  created_at: string
}

export type Product = {
  id: string
  name: string
  slug: string
  type: string
  origin: string
  roast: string
  sca_score: number
  price_250g: number
  price_500g: number
  price_1kg: number
  wholesale_250g: number
  wholesale_500g: number
  wholesale_1kg: number
  image_url: string
  status: string
  created_at: string
}

export type Commission = {
  id: string
  rep_id: string
  rep_name: string
  type: 'direct' | 'residual' | 'matching'
  amount: number
  description: string
  week_ending: string
  status: 'pending' | 'approved' | 'paid'
  created_at: string
}

export type Payout = {
  id: string
  rep_id: string
  rep_name: string
  amount: number
  method: 'bank' | 'crypto'
  bank_account: string
  crypto_wallet: string
  status: 'pending' | 'processing' | 'paid' | 'failed'
  week_ending: string
  created_at: string
}

export const RANKS = [
  { name: 'Qualified Representative', left: 2, right: 2, monthly: 800 },
  { name: 'Rising Star', left: 5, right: 5, monthly: 2000 },
  { name: 'One Star Representative', left: 10, right: 10, monthly: 4000 },
  { name: 'Two Star Representative', left: 20, right: 20, monthly: 8000 },
  { name: 'Four Star Representative', left: 40, right: 40, monthly: 16000 },
  { name: 'Regional Representative', left: 75, right: 75, monthly: 30000 },
  { name: 'National Representative', left: 150, right: 150, monthly: 60000 },
  { name: 'Crowned Director', left: 200, right: 200, monthly: 80000 },
  { name: 'Emerald Director', left: 250, right: 250, monthly: 100000 },
  { name: 'Sapphire Director', left: 300, right: 300, monthly: 120000 },
  { name: 'Diamond Director', left: 350, right: 350, monthly: 140000 },
  { name: 'Black Diamond Director', left: 400, right: 400, monthly: 160000 },
  { name: 'Double Crown Diamond', left: 450, right: 450, monthly: 180000 },
  { name: 'Sovereign Crown Leader', left: 500, right: 500, monthly: 200000 },
]

export function calcRank(l: number, r: number) {
  return [...RANKS].reverse().find(x => l >= x.left && r >= x.right) || null
}

export function fmt(cents: number) {
  return 'R ' + (cents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 0 })
}
