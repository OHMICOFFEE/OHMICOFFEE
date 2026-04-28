import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(url, anon)

export function serviceClient() {
  return createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function getProducts() {
  const { data } = await supabase.from('products').select('*').eq('status','active').order('sort_order')
  return data || []
}

export async function getProduct(slug: string) {
  const { data } = await supabase.from('products').select('*').eq('slug', slug).single()
  return data
}

export async function getPackages() {
  const { data } = await supabase.from('packages').select('*').eq('is_active', true).order('sort_order')
  return data || []
}

export async function getRanks() {
  const { data } = await supabase.from('ranks').select('*').order('sort_order')
  return data || []
}

export async function getSettings(): Promise<Record<string, string>> {
  const { data } = await supabase.from('site_settings').select('*')
  const s: Record<string, string> = {}
  data?.forEach((x: { key: string; value: string }) => { s[x.key] = x.value })
  return s
}
