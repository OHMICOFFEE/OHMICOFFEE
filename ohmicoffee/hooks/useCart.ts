'use client'
import { useState, useEffect } from 'react'
import { CartItem, Product } from '@/lib/types'

const CART_KEY = 'ohmi_cart'

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    const saved = localStorage.getItem(CART_KEY)
    if (saved) setItems(JSON.parse(saved))
  }, [])

  function save(newItems: CartItem[]) {
    setItems(newItems)
    localStorage.setItem(CART_KEY, JSON.stringify(newItems))
  }

  function addItem(item: CartItem) {
    const key = item.product.id + '_' + item.size
    const existing = items.find(i => i.product.id === item.product.id && i.size === item.size)
    if (existing) {
      save(items.map(i => i.product.id === item.product.id && i.size === item.size
        ? { ...i, quantity: i.quantity + 1 } : i))
    } else {
      save([...items, item])
    }
  }

  function removeItem(productId: string, size: string) {
    save(items.filter(i => !(i.product.id === productId && i.size === size)))
  }

  function clearCart() { save([]) }

  const total = items.reduce((s, i) => s + i.unit_price * i.quantity, 0)
  const count = items.reduce((s, i) => s + i.quantity, 0)

  return { items, addItem, removeItem, clearCart, total, count }
}
