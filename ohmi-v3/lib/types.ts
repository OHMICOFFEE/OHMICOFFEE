export type Rank = {
  id: string
  name: string
  left: number
  right: number
  monthly: number
  type: 'fixed'
  min_personal: number
}

export const RANKS: Rank[] = [
  { id: 'R1', name: 'R1', left: 5,   right: 5,   monthly: 2000,   type: 'fixed', min_personal: 2 },
  { id: 'R2', name: 'R2', left: 10,  right: 10,  monthly: 3500,   type: 'fixed', min_personal: 2 },
  { id: 'R3', name: 'R3', left: 20,  right: 20,  monthly: 6000,   type: 'fixed', min_personal: 2 },
  { id: 'R4', name: 'R4', left: 50,  right: 50,  monthly: 12000,  type: 'fixed', min_personal: 4 },
  { id: 'R5', name: 'R5', left: 100, right: 100, monthly: 35000,  type: 'fixed', min_personal: 4 },
  { id: 'R6', name: 'R6', left: 150, right: 150, monthly: 55000,  type: 'fixed', min_personal: 4 },
  { id: 'R7', name: 'R7', left: 300, right: 300, monthly: 90000,  type: 'fixed', min_personal: 4 },
  { id: 'R8', name: 'R8', left: 600, right: 600, monthly: 180000, type: 'fixed', min_personal: 4 },
]

export const MONTHLY = {
  subscription: 1500,
  coffee_cost: 500,
  license: 250,
  pool: 750,
}

export const ONCOFF = {
  total: 2000,
  license: 500,
  coffee: 750,
  commission: 500,
  profit: 250,
}

export const DIRECT_COMMISSION = {
  one_signup:           350,
  two_signups:          700,
  three_plus_monthly:   1500,
  four_monthly:         2000,
  five_plus:            500,
}

export function getRank(left: number, right: number, personalActives: number = 0): Rank | null {
  return [...RANKS].reverse().find(r =>
    left >= r.left && right >= r.right && personalActives >= r.min_personal
  ) || null
}

export function getNextRank(left: number, right: number, personalActives: number = 0): Rank | null {
  const current = getRank(left, right, personalActives)
  const idx = current ? RANKS.findIndex(r => r.id === current.id) : -1
  return idx < RANKS.length - 1 ? RANKS[idx + 1] : null
}

export function zar(cents: number): string {
  return 'R\u00a0' + (cents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 0 })
}

export function calcDirectCommission(weeklySignups: number, monthlySignups: number): number {
  if (monthlySignups >= 5) return DIRECT_COMMISSION.five_plus * weeklySignups
  if (monthlySignups >= 4) return DIRECT_COMMISSION.four_monthly
  if (monthlySignups >= 3) return DIRECT_COMMISSION.three_plus_monthly
  if (weeklySignups >= 2) return DIRECT_COMMISSION.two_signups
  if (weeklySignups >= 1) return DIRECT_COMMISSION.one_signup
  return 0
}

export function nextFriday(from = new Date()): Date {
  const d = new Date(from)
  const day = d.getDay()
  const daysUntil = day <= 5 ? 5 - day : 7 - day + 5
  d.setDate(d.getDate() + (daysUntil === 0 ? 7 : daysUntil))
  return d
}

export function residualPayoutDate(year: number, month: number): Date {
  const lastDay = new Date(year, month, 0)
  lastDay.setDate(lastDay.getDate() + 14)
  return lastDay
}
