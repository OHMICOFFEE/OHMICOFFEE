'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Home' },
  { href: '/coffees', label: 'Our Coffees' },
  { href: '/foundation', label: 'Foundation' },
  { href: '/shop', label: 'Shop' },
  { href: '/network', label: 'Network' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-[#050505]/97 backdrop-blur-xl border-b border-white/[0.07] shadow-2xl' : ''}`}>
      <div className="flex items-center justify-between px-10 h-[62px]">
        <Link href="/" className="font-cond font-black text-[1.1rem] tracking-[0.2em] text-white uppercase hover:opacity-80 transition-opacity">
          OHMI <span className="text-red">COFFEE CO.</span>
        </Link>
        <ul className="flex gap-9 list-none">
          {links.map(l => (
            <li key={l.href}>
              <Link href={l.href} className={`font-sans text-[11px] font-medium tracking-[0.25em] uppercase transition-colors duration-200 ${pathname === l.href ? 'text-white' : 'text-white/45 hover:text-white'}`}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          <Link href="/rep/login" className="font-sans text-[11px] font-medium tracking-[0.2em] uppercase text-white/45 hover:text-white transition-colors border border-white/[0.14] px-4 py-[7px]">
            Rep Login
          </Link>
          <Link href="/network" className="bg-red hover:bg-red-dark font-cond font-bold text-[11px] tracking-[0.22em] uppercase text-white px-5 py-[8px] transition-colors duration-200">
            Join Now
          </Link>
        </div>
      </div>
    </nav>
  )
}
