'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Topbar from '@/components/Topbar'

type Product = {
  id: string; name: string; type: string; origin: string
  price_250g: number; price_500g: number; price_1kg: number
  wholesale_250g: number; wholesale_500g: number; wholesale_1kg: number
  image_url: string; sca_score: number; tasting_notes: string; status: string
}

type CartItem = {
  product: Product; size: '250g' | '500g' | '1kg'
  qty: number; unit_price: number
}

type Size = '250g' | '500g' | '1kg'

const PROVINCES = ['Eastern Cape','Free State','Gauteng','KwaZulu-Natal','Limpopo','Mpumalanga','Northern Cape','North West','Western Cape']

export default function RepShop({ params }: { params: { repId: string } }) {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [step, setStep] = useState<'shop'|'checkout'|'confirm'>('shop')
  const [delivery, setDelivery] = useState({ name:'', phone:'', email:'', address:'', city:'', province:'', postal:'' })
  const [notes, setNotes] = useState('')
  const [placing, setPlacing] = useState(false)
  const [orderRef, setOrderRef] = useState('')

  useEffect(() => {
    supabase.from('products').select('*').eq('status','active').order('sort_order')
      .then(({ data }) => setProducts((data || []) as Product[]))
  }, [])

  function wholesale(p: Product, size: Size) {
    return size === '250g' ? p.wholesale_250g : size === '500g' ? p.wholesale_500g : p.wholesale_1kg
  }

  function addToCart(p: Product, size: Size) {
    const price = wholesale(p, size)
    setCart(c => {
      const existing = c.find(i => i.product.id === p.id && i.size === size)
      if (existing) return c.map(i => i.product.id === p.id && i.size === size ? { ...i, qty: i.qty + 1 } : i)
      return [...c, { product: p, size, qty: 1, unit_price: price }]
    })
  }

  function removeFromCart(productId: string, size: Size) {
    setCart(c => c.filter(i => !(i.product.id === productId && i.size === size)))
  }

  function updateQty(productId: string, size: Size, qty: number) {
    if (qty <= 0) { removeFromCart(productId, size); return }
    setCart(c => c.map(i => i.product.id === productId && i.size === size ? { ...i, qty } : i))
  }

  const cartTotal = cart.reduce((s, i) => s + i.unit_price * i.qty, 0)
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  function zar(cents: number) { return 'R ' + (cents / 100).toLocaleString('en-ZA') }

  async function placeOrder() {
    setPlacing(true)
    const ref = 'ORD-' + Date.now().toString().slice(-6)
    const { error } = await supabase.from('orders').insert({
      order_number: ref,
      customer_name: delivery.name,
      customer_email: delivery.email,
      customer_phone: delivery.phone,
      rep_id: params.repId,
      order_type: 'wholesale',
      items: cart.map(i => ({
        product_id: i.product.id,
        product_name: i.product.name,
        size: i.size,
        quantity: i.qty,
        unit_price: i.unit_price,
        total: i.unit_price * i.qty,
      })),
      subtotal: cartTotal,
      shipping: 0,
      total: cartTotal,
      status: 'pending',
      payment_status: 'pending',
      payment_method: 'ikhokha',
      shipping_address: {
        line1: delivery.address,
        city: delivery.city,
        province: delivery.province,
        postal_code: delivery.postal,
      },
      notes,
    })
    if (!error) {
      setOrderRef(ref)
      setStep('confirm')
    } else {
      alert('Order failed: ' + error.message)
    }
    setPlacing(false)
  }

  if (step === 'confirm') return (
    <div className="main">
      <Topbar title="Order Placed" />
      <div className="page" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{background:'var(--white)',border:'1px solid var(--border)',borderRadius:14,padding:'48px 40px',maxWidth:480,width:'100%',textAlign:'center',boxShadow:'var(--shadow2)'}}>
          <div style={{width:56,height:56,borderRadius:'50%',background:'rgba(45,106,79,0.1)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',fontSize:24}}>✓</div>
          <div style={{fontFamily:'Cormorant Garamond,Georgia,serif',fontSize:26,color:'var(--text)',marginBottom:6}}>Order Confirmed</div>
          <div style={{width:32,height:1,background:'var(--red)',margin:'10px auto 16px'}} />
          <div style={{fontSize:13,color:'var(--text3)',marginBottom:6}}>Reference: <strong style={{color:'var(--text)'}}>{orderRef}</strong></div>
          <p style={{fontSize:13,color:'var(--text3)',lineHeight:1.8,marginBottom:24}}>
            Your order has been placed. Please complete payment via iKhokha to confirm. Once payment is received, OHMI will ship directly to <strong>{delivery.name}</strong> at {delivery.address}, {delivery.city}.
          </p>
          {/* Demo iKhokha payment button */}
          <div style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:10,padding:'16px 20px',marginBottom:20}}>
            <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--text4)',marginBottom:6}}>Amount Due (Wholesale)</div>
            <div style={{fontFamily:'Cormorant Garamond,Georgia,serif',fontSize:28,color:'var(--red)',marginBottom:12}}>{zar(cartTotal)}</div>
            <a href={`https://pay.ikhokha.com/ohmi-coffee/${cartTotal}`} target="_blank"
              style={{display:'block',background:'#C41E4A',color:'#fff',padding:'12px',borderRadius:8,textDecoration:'none',fontSize:12,fontWeight:600,letterSpacing:'0.06em',textTransform:'uppercase'}}>
              Pay Now via iKhokha →
            </a>
            <div style={{fontSize:10,color:'var(--text4)',marginTop:8}}>Demo link — replace with your iKhokha merchant payment URL</div>
          </div>
          <button onClick={()=>{ setCart([]); setStep('shop'); setDelivery({name:'',phone:'',email:'',address:'',city:'',province:'',postal:''}); }}
            className="btn btn-outline" style={{width:'100%'}}>Place Another Order</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="main">
      <Topbar title={step === 'shop' ? `Wholesale Shop` : 'Checkout'} action={
        step === 'shop' && cart.length > 0 ? (
          <button className="btn btn-red" onClick={()=>setStep('checkout')}>
            Checkout ({cartCount}) — {zar(cartTotal)}
          </button>
        ) : step === 'checkout' ? (
          <button className="btn btn-outline" onClick={()=>setStep('shop')}>← Back to Shop</button>
        ) : undefined
      } />
      <div className="page">

        {step === 'shop' && (
          <>
            <div style={{background:'var(--white)',border:'1px solid var(--border)',borderRadius:10,padding:'12px 18px',marginBottom:20,fontSize:12,color:'var(--text3)',display:'flex',alignItems:'center',gap:8,boxShadow:'var(--shadow)'}}>
              <span style={{color:'var(--red)',fontSize:14}}>ℹ</span>
              Prices shown are <strong style={{color:'var(--text)'}}>wholesale</strong>. You pay OHMI, we ship directly to your customer. Your retail margin is yours to keep.
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
              {products.map(p => (
                <div key={p.id} style={{background:'var(--white)',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden',boxShadow:'var(--shadow)'}}>
                  <div style={{height:160,background:'var(--bg)',position:'relative',overflow:'hidden'}}>
                    {p.image_url
                      ? <img src={p.image_url} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                      : <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',fontFamily:'Cormorant Garamond,Georgia,serif',fontSize:32,color:'var(--border2)'}}>☕</div>
                    }
                    <div style={{position:'absolute',top:10,left:10,background:'var(--red)',color:'#fff',padding:'2px 8px',borderRadius:20,fontSize:9,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase'}}>
                      SCA {p.sca_score}
                    </div>
                  </div>
                  <div style={{padding:'14px 16px'}}>
                    <div style={{fontFamily:'Cormorant Garamond,Georgia,serif',fontSize:17,color:'var(--text)',marginBottom:2}}>{p.name}</div>
                    <div style={{fontSize:10,color:'var(--text4)',marginBottom:10,textTransform:'uppercase',letterSpacing:'0.1em'}}>{p.origin}</div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6}}>
                      {(['250g','500g','1kg'] as Size[]).map(size => {
                        const price = wholesale(p, size)
                        const inCart = cart.find(i => i.product.id === p.id && i.size === size)
                        return (
                          <button key={size} onClick={()=>addToCart(p,size)}
                            style={{background:inCart?'var(--red)':'var(--bg)',border:`1px solid ${inCart?'var(--red)':'var(--border)'}`,borderRadius:6,padding:'6px 4px',cursor:'pointer',transition:'all 0.15s'}}>
                            <div style={{fontSize:10,fontWeight:600,color:inCart?'#fff':'var(--text)',marginBottom:2}}>{size}</div>
                            <div style={{fontSize:11,color:inCart?'rgba(255,255,255,0.8)':'var(--red)',fontWeight:600}}>{zar(price)}</div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {cart.length > 0 && (
              <div style={{position:'fixed',bottom:24,right:24,background:'var(--white)',border:'1px solid var(--border)',borderRadius:12,padding:'14px 20px',boxShadow:'var(--shadow2)',zIndex:100,minWidth:280}}>
                <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--text4)',marginBottom:8}}>Cart ({cartCount} items)</div>
                {cart.map(i => (
                  <div key={i.product.id+i.size} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'4px 0',borderBottom:'1px solid var(--border)',fontSize:12}}>
                    <span style={{color:'var(--text)'}}>{i.product.name} {i.size}</span>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <button onClick={()=>updateQty(i.product.id,i.size,i.qty-1)} style={{background:'none',border:'1px solid var(--border)',borderRadius:4,width:20,height:20,cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center'}}>−</button>
                      <span>{i.qty}</span>
                      <button onClick={()=>updateQty(i.product.id,i.size,i.qty+1)} style={{background:'none',border:'1px solid var(--border)',borderRadius:4,width:20,height:20,cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
                      <span style={{color:'var(--red)',fontWeight:600,minWidth:60,textAlign:'right'}}>{zar(i.unit_price*i.qty)}</span>
                    </div>
                  </div>
                ))}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:10,marginTop:4}}>
                  <span style={{fontFamily:'Cormorant Garamond,Georgia,serif',fontSize:16,color:'var(--text)'}}>Total</span>
                  <span style={{fontFamily:'Cormorant Garamond,Georgia,serif',fontSize:20,color:'var(--red)',fontWeight:600}}>{zar(cartTotal)}</span>
                </div>
                <button className="btn btn-red" style={{width:'100%',marginTop:10}} onClick={()=>setStep('checkout')}>
                  Proceed to Checkout →
                </button>
              </div>
            )}
          </>
        )}

        {step === 'checkout' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 380px',gap:20,alignItems:'start'}}>
            <div style={{background:'var(--white)',border:'1px solid var(--border)',borderRadius:12,padding:'28px 32px',boxShadow:'var(--shadow)'}}>
              <div style={{fontFamily:'Cormorant Garamond,Georgia,serif',fontSize:22,color:'var(--text)',marginBottom:4}}>Customer Delivery Details</div>
              <div style={{width:28,height:1,background:'var(--red)',marginBottom:24}} />
              <div className="grid-2">
                <div className="field"><label>Customer Full Name</label><input value={delivery.name} onChange={e=>setDelivery(d=>({...d,name:e.target.value}))} placeholder="Full name for delivery" /></div>
                <div className="field"><label>Customer Phone</label><input value={delivery.phone} onChange={e=>setDelivery(d=>({...d,phone:e.target.value}))} placeholder="+27 xx xxx xxxx" /></div>
                <div className="field span-2"><label>Customer Email</label><input type="email" value={delivery.email} onChange={e=>setDelivery(d=>({...d,email:e.target.value}))} /></div>
                <div className="field span-2"><label>Delivery Address</label><input value={delivery.address} onChange={e=>setDelivery(d=>({...d,address:e.target.value}))} placeholder="Street address" /></div>
                <div className="field"><label>City / Town</label><input value={delivery.city} onChange={e=>setDelivery(d=>({...d,city:e.target.value}))} /></div>
                <div className="field"><label>Province</label>
                  <select value={delivery.province} onChange={e=>setDelivery(d=>({...d,province:e.target.value}))}>
                    <option value="">Select province</option>
                    {PROVINCES.map(p=><option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="field"><label>Postal Code</label><input value={delivery.postal} onChange={e=>setDelivery(d=>({...d,postal:e.target.value}))} /></div>
              </div>
              <div className="field"><label>Order Notes (Optional)</label>
                <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="Special instructions for this order..." style={{resize:'vertical'}} />
              </div>
            </div>

            {/* Order summary */}
            <div style={{background:'var(--white)',border:'1px solid var(--border)',borderRadius:12,padding:'24px',boxShadow:'var(--shadow)',position:'sticky',top:24}}>
              <div style={{fontFamily:'Cormorant Garamond,Georgia,serif',fontSize:18,color:'var(--text)',marginBottom:16}}>Order Summary</div>
              {cart.map(i=>(
                <div key={i.product.id+i.size} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid var(--border)',fontSize:12}}>
                  <div>
                    <div style={{color:'var(--text)',fontWeight:500}}>{i.product.name}</div>
                    <div style={{color:'var(--text4)',fontSize:11}}>{i.size} × {i.qty}</div>
                  </div>
                  <span style={{color:'var(--red)',fontWeight:600}}>{zar(i.unit_price*i.qty)}</span>
                </div>
              ))}
              <div style={{display:'flex',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid var(--border)',fontSize:12}}>
                <span style={{color:'var(--text3)'}}>Shipping</span>
                <span style={{color:'var(--text3)'}}>Calculated by OHMI</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',padding:'12px 0',marginBottom:16}}>
                <span style={{fontFamily:'Cormorant Garamond,Georgia,serif',fontSize:16,color:'var(--text)'}}>Wholesale Total</span>
                <span style={{fontFamily:'Cormorant Garamond,Georgia,serif',fontSize:22,color:'var(--red)',fontWeight:600}}>{zar(cartTotal)}</span>
              </div>
              <div style={{background:'var(--bg)',borderRadius:8,padding:'10px 14px',marginBottom:16,fontSize:11,color:'var(--text4)',lineHeight:1.7}}>
                You will be redirected to iKhokha to complete payment. OHMI ships directly to your customer once payment is confirmed.
              </div>
              <button className="btn btn-red" style={{width:'100%',padding:'13px'}} onClick={placeOrder} disabled={placing||!delivery.name||!delivery.address||!delivery.city||!delivery.province}>
                {placing?'Placing Order...':'Place Order & Pay →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
