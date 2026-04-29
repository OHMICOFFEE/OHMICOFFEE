// RANKS R1-R8 fixed, R9-R11 profit share
export const RANKS = [
  { id: 'R1',  left: 5,    right: 5,    monthly: 2000,   type: 'fixed' },
  { id: 'R2',  left: 10,   right: 10,   monthly: 3500,   type: 'fixed' },
  { id: 'R3',  left: 20,   right: 20,   monthly: 6000,   type: 'fixed' },
  { id: 'R4',  left: 50,   right: 50,   monthly: 12000,  type: 'fixed',  min_personal: 4 },
  { id: 'R5',  left: 100,  right: 100,  monthly: 35000,  type: 'fixed',  min_personal: 4 },
  { id: 'R6',  left: 150,  right: 150,  monthly: 55000,  type: 'fixed',  min_personal: 4 },
  { id: 'R7',  left: 300,  right: 300,  monthly: 90000,  type: 'fixed',  min_personal: 4 },
  { id: 'R8',  left: 600,  right: 600,  monthly: 180000, type: 'fixed',  min_personal: 4 },
  { id: 'R9',  left: 1000, right: 1000, pct: 3,          type: 'profit' },
  { id: 'R10', left: 2000, right: 2000, pct: 2,          type: 'profit' },
  { id: 'R11', left: 5000, right: 5000, pct: 1,          type: 'profit' },
]

// Monthly revenue breakdown
export const MONTHLY = {
  subscription: 1500,   // R1,500/month per rep
  coffee_cost: 750,     // R750 coffee product
  pool: 750,            // R750 commission pool
}

// Once-off join fee breakdown
export const ONCOFF = {
  total: 2000,          // R2,000 once-off
  license: 500,         // R500 distributor license
  coffee: 750,          // R750 coffee product
  commission: 500,      // R500 direct commission to sponsor
  profit: 250,          // R250 your profit
}

// Direct commission rules (weekly)
export const DIRECT_COMMISSION = {
  one_signup: 350,      // R350 for 1 signup in a week
  two_signups: 700,     // R700 for 2 signups in a week
  three_plus_monthly: 1500, // R1,500 each for 3 signups in a month
  four_monthly: 2000,   // R2,000 each for 4 signups in a month
  five_plus: 500,       // R500 each for 5+ signups in a month
}

// Wholesale tiers (per kg, price in ZAR cents x100)
export const WHOLESALE_TIERS = [
  { kg: 25,  price: 50000, label: '25kg' },
  { kg: 50,  price: 50000, label: '50kg' },
  { kg: 75,  price: 50000, label: '75kg' },
  { kg: 100, price: 50000, label: '100kg' },
]

export function getRank(left: number, right: number, personalActives: number = 0) {
  return [...RANKS].reverse().find(r => {
    const legOk = left >= r.left && right >= r.right
    const personalOk = !('min_personal' in r) || personalActives >= (r as any).min_personal
    return legOk && personalOk
  }) || null
}

export function getNextRank(left: number, right: number, personalActives: number = 0) {
  const current = getRank(left, right, personalActives)
  const idx = current ? RANKS.findIndex(r => r.id === current.id) : -1
  return idx < RANKS.length - 1 ? RANKS[idx + 1] : null
}

export function zar(cents: number) {
  return 'R ' + (cents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 0 })
}

export function calcDirectCommission(weeklySignups: number, monthlySignups: number): number {
  if (monthlySignups >= 5) return DIRECT_COMMISSION.five_plus * weeklySignups
  if (monthlySignups >= 4) return DIRECT_COMMISSION.four_monthly
  if (monthlySignups >= 3) return DIRECT_COMMISSION.three_plus_monthly
  if (weeklySignups >= 2) return DIRECT_COMMISSION.two_signups
  if (weeklySignups >= 1) return DIRECT_COMMISSION.one_signup
  return 0
}

export function calcPoolHealth(activeReps: number) {
  const pool = activeReps * MONTHLY.pool
  const r1_8 = RANKS.filter(r => r.type === 'fixed')
  return { pool, available: pool }
}

// Next Friday from a given date
export function nextFriday(from = new Date()): Date {
  const d = new Date(from)
  const day = d.getDay()
  const daysUntilFriday = day <= 5 ? 5 - day : 7 - day + 5
  d.setDate(d.getDate() + (daysUntilFriday === 0 ? 7 : daysUntilFriday))
  return d
}

// 7 days after month end
export function residualPayoutDate(year: number, month: number): Date {
  const lastDay = new Date(year, month, 0)
  lastDay.setDate(lastDay.getDate() + 7)
  return lastDay
}
