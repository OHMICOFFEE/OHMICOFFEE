'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

type Rep = {
  id: string; first_name: string; last_name: string
  leg: 'left' | 'right'; sponsor_id: string | null
  is_active: boolean; current_rank: string
  left_team_count: number; right_team_count: number
  email: string; phone: string; personal_actives: number
}

type TreeNode = { rep: Rep; left: TreeNode | null; right: TreeNode | null; depth: number }

function buildTree(reps: Rep[], rootId: string | null, depth = 0): TreeNode | null {
  const root = rootId ? reps.find(r => r.id === rootId) : reps.find(r => !r.sponsor_id)
  if (!root) return null
  const children = reps.filter(r => r.sponsor_id === root.id)
  const leftChild = children.find(r => r.leg === 'left') || null
  const rightChild = children.find(r => r.leg === 'right') || null
  return {
    rep: root,
    left: leftChild ? buildTree(reps, leftChild.id, depth + 1) : null,
    right: rightChild ? buildTree(reps, rightChild.id, depth + 1) : null,
    depth,
  }
}

// ── ADD REP MODAL ──────────────────────────────────────────
function AddRepModal({ sponsorId, sponsorName, leg, onClose, onSaved }: {
  sponsorId: string; sponsorName: string; leg: 'left'|'right'
  onClose: () => void; onSaved: () => void
}) {
  const [form, setForm] = useState({ first_name:'', last_name:'', email:'', phone:'', leg, personal_actives:'0' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function save() {
    if (!form.first_name || !form.last_name || !form.email) { setError('Name and email required'); return }
    setSaving(true)
    const slug = `${form.first_name}${form.last_name}`.toLowerCase().replace(/[^a-z0-9]/g,'') + Math.floor(Math.random()*9000+1000)
    const { error: err } = await supabase.from('representatives').insert({
      first_name: form.first_name.trim(), last_name: form.last_name.trim(),
      email: form.email.trim().toLowerCase(), phone: form.phone,
      leg: form.leg, sponsor_id: sponsorId, sponsor_name: sponsorName,
      personal_actives: parseInt(form.personal_actives)||0,
      status: 'active', is_active: true, kyc_status: 'pending',
      agreement_signed: false, current_rank: 'Unranked',
      total_earned: 0, pending_payout: 0, total_paid_out: 0,
      left_team_count: 0, right_team_count: 0, rep_slug: slug,
    })
    if (err) { setError(err.message); setSaving(false); return }
    // Update sponsor team count
    const field = form.leg === 'left' ? 'left_team_count' : 'right_team_count'
    const { data: sponsor } = await supabase.from('representatives').select(field).eq('id', sponsorId).single()
    if (sponsor) await supabase.from('representatives').update({ [field]: (sponsor[field]||0)+1 }).eq('id', sponsorId)
    onSaved()
    onClose()
  }

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(28,28,28,0.6)',backdropFilter:'blur(4px)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{background:'#fff',borderRadius:14,border:'1px solid var(--border)',width:'100%',maxWidth:480,boxShadow:'var(--shadow2)'}}>
        <div style={{padding:'18px 22px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontFamily:'Cormorant Garamond,Georgia,serif',fontSize:20,color:'var(--text)'}}>Add Rep</div>
            <div style={{fontSize:11,color:'var(--text4)',marginTop:2}}>Under {sponsorName} · {leg} leg</div>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'var(--text4)'}}>×</button>
        </div>
        <div style={{padding:22}}>
          {error && <div style={{background:'rgba(196,30,74,0.06)',border:'1px solid rgba(196,30,74,0.2)',borderRadius:6,padding:'10px 14px',marginBottom:14,fontSize:12,color:'var(--red)'}}>{error}</div>}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            {[['first_name','First Name *'],['last_name','Last Name *'],['email','Email *'],['phone','Phone']].map(([k,l]) => (
              <div key={k} style={{marginBottom:0}}>
                <label style={{display:'block',fontSize:10,fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--text4)',marginBottom:5}}>{l}</label>
                <input type={k==='email'?'email':'text'} value={(form as any)[k]} onChange={e=>setForm((f:any)=>({...f,[k]:e.target.value}))} style={{width:'100%'}} />
              </div>
            ))}
            <div>
              <label style={{display:'block',fontSize:10,fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--text4)',marginBottom:5}}>Leg</label>
              <select value={form.leg} onChange={e=>setForm(f=>({...f,leg:e.target.value as 'left'|'right'}))}>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div>
              <label style={{display:'block',fontSize:10,fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--text4)',marginBottom:5}}>Personal Actives</label>
              <input type="number" min="0" value={form.personal_actives} onChange={e=>setForm(f=>({...f,personal_actives:e.target.value}))} />
            </div>
          </div>
        </div>
        <div style={{padding:'14px 22px',borderTop:'1px solid var(--border)',display:'flex',justifyContent:'flex-end',gap:8,background:'var(--bg)',borderRadius:'0 0 14px 14px'}}>
          <button onClick={onClose} style={{background:'transparent',border:'1px solid var(--border)',borderRadius:6,padding:'8px 16px',fontSize:12,cursor:'pointer',color:'var(--text3)'}}>Cancel</button>
          <button onClick={save} disabled={saving} style={{background:'var(--red)',color:'#fff',border:'none',borderRadius:6,padding:'8px 20px',fontSize:12,fontWeight:600,cursor:'pointer',opacity:saving?0.6:1}}>
            {saving?'Adding...':'Add Rep'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── EDIT REP MODAL ─────────────────────────────────────────
function EditRepModal({ rep, onClose, onSaved }: { rep: Rep; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    first_name: rep.first_name, last_name: rep.last_name,
    email: rep.email, phone: rep.phone||'',
    leg: rep.leg, current_rank: rep.current_rank||'Unranked',
    is_active: rep.is_active, personal_actives: rep.personal_actives||0,
  })
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    await supabase.from('representatives').update(form).eq('id', rep.id)
    onSaved(); onClose()
  }

  async function remove() {
    if (!confirm(`Remove ${rep.first_name} ${rep.last_name}?`)) return
    await supabase.from('representatives').delete().eq('id', rep.id)
    onSaved(); onClose()
  }

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(28,28,28,0.6)',backdropFilter:'blur(4px)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{background:'#fff',borderRadius:14,border:'1px solid var(--border)',width:'100%',maxWidth:480,boxShadow:'var(--shadow2)'}}>
        <div style={{padding:'18px 22px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{fontFamily:'Cormorant Garamond,Georgia,serif',fontSize:20,color:'var(--text)'}}>Edit — {rep.first_name} {rep.last_name}</div>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'var(--text4)'}}>×</button>
        </div>
        <div style={{padding:22,display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          {[['first_name','First Name'],['last_name','Last Name'],['email','Email'],['phone','Phone']].map(([k,l]) => (
            <div key={k}>
              <label style={{display:'block',fontSize:10,fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--text4)',marginBottom:5}}>{l}</label>
              <input value={(form as any)[k]} onChange={e=>setForm((f:any)=>({...f,[k]:e.target.value}))} />
            </div>
          ))}
          <div>
            <label style={{display:'block',fontSize:10,fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--text4)',marginBottom:5}}>Leg</label>
            <select value={form.leg} onChange={e=>setForm(f=>({...f,leg:e.target.value as 'left'|'right'}))}>
              <option value="left">Left</option><option value="right">Right</option>
            </select>
          </div>
          <div>
            <label style={{display:'block',fontSize:10,fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--text4)',marginBottom:5}}>Rank</label>
            <select value={form.current_rank} onChange={e=>setForm(f=>({...f,current_rank:e.target.value}))}>
              {['Unranked','R1','R2','R3','R4','R5','R6','R7','R8'].map(r=><option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label style={{display:'block',fontSize:10,fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--text4)',marginBottom:5}}>Personal Actives</label>
            <input type="number" value={form.personal_actives} onChange={e=>setForm(f=>({...f,personal_actives:parseInt(e.target.value)||0}))} />
          </div>
          <div>
            <label style={{display:'block',fontSize:10,fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--text4)',marginBottom:5}}>Status</label>
            <select value={form.is_active?'active':'inactive'} onChange={e=>setForm(f=>({...f,is_active:e.target.value==='active'}))}>
              <option value="active">Active</option><option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div style={{padding:'14px 22px',borderTop:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center',background:'var(--bg)',borderRadius:'0 0 14px 14px'}}>
          <button onClick={remove} style={{background:'none',border:'1px solid rgba(196,30,74,0.3)',borderRadius:6,padding:'8px 14px',fontSize:11,cursor:'pointer',color:'var(--red)',fontWeight:600,letterSpacing:'0.06em',textTransform:'uppercase'}}>Remove</button>
          <div style={{display:'flex',gap:8}}>
            <button onClick={onClose} style={{background:'transparent',border:'1px solid var(--border)',borderRadius:6,padding:'8px 16px',fontSize:12,cursor:'pointer',color:'var(--text3)'}}>Cancel</button>
            <button onClick={save} disabled={saving} style={{background:'var(--red)',color:'#fff',border:'none',borderRadius:6,padding:'8px 20px',fontSize:12,fontWeight:600,cursor:'pointer'}}>
              {saving?'Saving...':'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── NODE CARD ──────────────────────────────────────────────
function NodeCard({ node, isAdmin, onEdit, onAddLeft, onAddRight, isMe }: {
  node: TreeNode; isAdmin: boolean
  onEdit?: (rep: Rep) => void
  onAddLeft?: () => void; onAddRight?: () => void
  isMe?: boolean
}) {
  const { rep } = node
  const [hovered, setHovered] = useState(false)
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => isAdmin && onEdit && onEdit(rep)}
        style={{
          background: isMe ? 'var(--red)' : hovered && isAdmin ? 'var(--bg)' : 'var(--white)',
          border: isMe ? '2px solid var(--red2)' : `1px solid ${hovered && isAdmin ? 'var(--border2)' : 'var(--border)'}`,
          borderRadius: 10, padding: '10px 14px', cursor: isAdmin ? 'pointer' : 'default',
          minWidth: 150, maxWidth: 170, transition: 'all 0.18s',
          boxShadow: isMe ? '0 6px 20px rgba(196,30,74,0.2)' : hovered && isAdmin ? 'var(--shadow2)' : 'var(--shadow)',
        }}
      >
        <div style={{display:'flex',alignItems:'center',gap:5,marginBottom:5}}>
          <div style={{width:6,height:6,borderRadius:'50%',flexShrink:0,background:rep.is_active?'var(--green)':'var(--border2)'}} />
          <span style={{fontSize:8,fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:isMe?'rgba(255,255,255,0.7)':rep.is_active?'var(--green)':'var(--text4)'}}>
            {rep.is_active?'Active':'Pending'}
          </span>
          {isAdmin && hovered && <span style={{marginLeft:'auto',fontSize:8,color:'var(--red)',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase'}}>Edit →</span>}
        </div>
        <div style={{fontFamily:'Cormorant Garamond,Georgia,serif',fontSize:15,fontWeight:500,lineHeight:1.15,marginBottom:4,color:isMe?'#fff':'var(--text)'}}>
          {rep.first_name}<br/>{rep.last_name}
        </div>
        {rep.current_rank && rep.current_rank !== 'Unranked' && (
          <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:isMe?'rgba(255,255,255,0.75)':'var(--red)',marginBottom:5}}>{rep.current_rank}</div>
        )}
        <div style={{display:'flex',gap:10}}>
          {[['L',rep.left_team_count],['R',rep.right_team_count]].map(([s,c]) => (
            <div key={s as string} style={{fontSize:9,color:isMe?'rgba(255,255,255,0.55)':'var(--text4)',display:'flex',gap:3}}>
              <span style={{fontWeight:700}}>{s}</span><span>{c}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── EMPTY SLOT ─────────────────────────────────────────────
function EmptySlot({ label, isAdmin, onClick }: { label: string; isAdmin: boolean; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={isAdmin ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        minWidth: 150, maxWidth: 170, padding: '14px',
        border: `1.5px dashed ${hovered && isAdmin ? 'var(--red)' : 'var(--border2)'}`,
        borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        color: hovered && isAdmin ? 'var(--red)' : 'var(--text4)',
        fontSize: isAdmin ? 12 : 11, cursor: isAdmin ? 'pointer' : 'default',
        background: hovered && isAdmin ? 'rgba(196,30,74,0.03)' : 'transparent',
        transition: 'all 0.15s', gap: 4,
      }}
    >
      {isAdmin && <span style={{fontSize:20,lineHeight:1}}>{hovered ? '+' : '○'}</span>}
      <span style={{fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase',fontSize:9}}>
        {isAdmin ? (hovered ? 'Add Rep' : 'Open Slot') : 'Open'}
      </span>
    </div>
  )
}

// ── TREE BRANCH ────────────────────────────────────────────
function TreeBranch({ node, isAdmin, onEdit, onAdd, meId, depth = 0 }: {
  node: TreeNode; isAdmin: boolean
  onEdit?: (rep: Rep) => void
  onAdd?: (sponsorId: string, sponsorName: string, leg: 'left'|'right') => void
  meId?: string; depth?: number
}) {
  const [collapsed, setCollapsed] = useState(depth >= 3)
  const hasChildren = node.left || node.right
  const isMe = node.rep.id === meId
  const LINE = 'var(--border)'
  const sponsorName = `${node.rep.first_name} ${node.rep.last_name}`

  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
      <NodeCard
        node={node} isAdmin={isAdmin} onEdit={onEdit} isMe={isMe}
        onAddLeft={() => onAdd && onAdd(node.rep.id, sponsorName, 'left')}
        onAddRight={() => onAdd && onAdd(node.rep.id, sponsorName, 'right')}
      />

      {/* Expand/collapse */}
      {(hasChildren || isAdmin) && (
        <button onClick={() => setCollapsed(c => !c)}
          style={{width:20,height:20,borderRadius:'50%',background:collapsed?'var(--red)':'var(--white)',border:'1px solid var(--border)',color:collapsed?'#fff':'var(--red)',fontSize:13,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s',zIndex:2,marginTop:2}}>
          {collapsed ? '+' : '−'}
        </button>
      )}

      {!collapsed && (
        <>
          <div style={{width:1,height:20,background:LINE}} />
          <div style={{position:'relative',display:'flex',alignItems:'flex-start'}}>
            {node.left && node.right && (
              <div style={{position:'absolute',top:0,left:'calc(25% + 8px)',right:'calc(25% + 8px)',height:1,background:LINE}} />
            )}

            {/* Left */}
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'0 20px'}}>
              <div style={{width:1,height:20,background:LINE}} />
              <div style={{fontSize:8,fontWeight:700,letterSpacing:'0.22em',textTransform:'uppercase',color:'var(--red)',marginBottom:8}}>Left</div>
              {node.left
                ? <TreeBranch node={node.left} isAdmin={isAdmin} onEdit={onEdit} onAdd={onAdd} meId={meId} depth={depth+1} />
                : <EmptySlot label="Open" isAdmin={isAdmin} onClick={() => onAdd && onAdd(node.rep.id, sponsorName, 'left')} />
              }
            </div>

            {/* Right */}
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'0 20px'}}>
              <div style={{width:1,height:20,background:LINE}} />
              <div style={{fontSize:8,fontWeight:700,letterSpacing:'0.22em',textTransform:'uppercase',color:'var(--red)',marginBottom:8}}>Right</div>
              {node.right
                ? <TreeBranch node={node.right} isAdmin={isAdmin} onEdit={onEdit} onAdd={onAdd} meId={meId} depth={depth+1} />
                : <EmptySlot label="Open" isAdmin={isAdmin} onClick={() => onAdd && onAdd(node.rep.id, sponsorName, 'right')} />
              }
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── MAIN EXPORT ────────────────────────────────────────────
export default function BinaryTree({ portalType, repId }: { portalType: 'admin'|'rep'; repId?: string }) {
  const [reps, setReps] = useState<Rep[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRep, setEditingRep] = useState<Rep|null>(null)
  const [addingTo, setAddingTo] = useState<{sponsorId:string;sponsorName:string;leg:'left'|'right'}|null>(null)
  const [search, setSearch] = useState('')
  const isAdmin = portalType === 'admin'

  async function load() {
    const { data } = await supabase.from('representatives').select('*').order('created_at', { ascending: true })
    setReps((data || []) as Rep[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const tree = reps.length > 0 ? (isAdmin ? buildTree(reps, null) : buildTree(reps, repId||null)) : null

  const stats = {
    total: reps.length,
    active: reps.filter(r => r.is_active).length,
    left: reps.filter(r => r.leg === 'left').length,
    right: reps.filter(r => r.leg === 'right').length,
  }

  const searchResults = search.length > 1
    ? reps.filter(r => `${r.first_name} ${r.last_name} ${r.email}`.toLowerCase().includes(search.toLowerCase())).slice(0,6)
    : []

  return (
    <div className="main">
      <div className="topbar">
        <span className="topbar-title">{isAdmin ? 'Binary Network Tree' : 'My Network Position'}</span>
        {isAdmin && (
          <div style={{position:'relative'}}>
            <input placeholder="Search rep…" value={search} onChange={e => setSearch(e.target.value)} style={{width:220,padding:'6px 12px',fontSize:12}} />
            {searchResults.length > 0 && (
              <div style={{position:'absolute',top:'100%',right:0,zIndex:200,background:'var(--white)',border:'1px solid var(--border)',borderRadius:8,width:280,marginTop:4,boxShadow:'var(--shadow2)'}}>
                {searchResults.map(r => (
                  <div key={r.id} onClick={() => { setEditingRep(r); setSearch('') }}
                    style={{padding:'10px 14px',borderBottom:'1px solid var(--border)',cursor:'pointer'}}
                    onMouseEnter={e => (e.currentTarget.style.background='var(--bg)')}
                    onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
                    <div style={{fontWeight:500,color:'var(--text)',fontSize:13}}>{r.first_name} {r.last_name}</div>
                    <div style={{fontSize:11,color:'var(--text4)'}}>{r.leg} leg · {r.current_rank||'Unranked'} · {r.is_active?'Active':'Pending'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{display:'flex',gap:1,background:'var(--border)',flexShrink:0}}>
        {(isAdmin
          ? [['Total',stats.total],['Active',stats.active],['Left Leg',stats.left],['Right Leg',stats.right]]
          : [['Your Position','Rep'],['Left Leg',reps.filter(r=>r.sponsor_id===repId&&r.leg==='left').length],['Right Leg',reps.filter(r=>r.sponsor_id===repId&&r.leg==='right').length]]
        ).map(([l,v]) => (
          <div key={l as string} style={{flex:1,background:'var(--white)',padding:'12px 20px'}}>
            <div style={{fontSize:8,fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--text4)',marginBottom:3}}>{l as string}</div>
            <div style={{fontFamily:'Cormorant Garamond,Georgia,serif',fontSize:24,color:'var(--text)',lineHeight:1}}>{v}</div>
          </div>
        ))}
      </div>

      {/* Canvas */}
      <div style={{flex:1,overflow:'auto',padding:'48px 80px 100px',background:'var(--bg)',backgroundImage:'radial-gradient(circle, var(--border) 1px, transparent 1px)',backgroundSize:'28px 28px'}}>
        {loading ? (
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:300,fontSize:11,color:'var(--text4)',letterSpacing:'0.2em',textTransform:'uppercase'}}>Loading network…</div>
        ) : !tree ? (
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:300,gap:12}}>
            <div style={{fontFamily:'Cormorant Garamond,Georgia,serif',fontSize:24,color:'var(--text4)'}}>No representatives yet</div>
            {isAdmin && <div style={{fontSize:11,color:'var(--text4)',letterSpacing:'0.12em',textTransform:'uppercase'}}>Add your first rep from the Network page</div>}
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
            <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.24em',textTransform:'uppercase',color:isAdmin?'var(--text4)':'var(--red)',marginBottom:12}}>
              {isAdmin ? 'Click any node to edit · Click open slot to add' : 'Your Position'}
            </div>
            <TreeBranch
              node={tree} isAdmin={isAdmin}
              onEdit={isAdmin ? setEditingRep : undefined}
              onAdd={isAdmin ? (sponsorId, sponsorName, leg) => setAddingTo({sponsorId, sponsorName, leg}) : undefined}
              meId={!isAdmin ? repId : undefined}
              depth={0}
            />
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{display:'flex',gap:20,padding:'10px 32px',borderTop:'1px solid var(--border)',background:'var(--white)',flexShrink:0,alignItems:'center',flexWrap:'wrap'}}>
        <span style={{fontSize:9,fontWeight:700,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--text4)'}}>Legend</span>
        {[
          {color:'var(--white)',border:'1px solid var(--border)',label:'Active Rep'},
          {color:'var(--white)',border:'1px dashed var(--border2)',label:'Pending Rep'},
          ...(isAdmin?[{color:'transparent',border:'1.5px dashed var(--border2)',label:'Open — click to add'}]:[]),
          ...(!isAdmin?[{color:'var(--red)',border:'2px solid var(--red2)',label:'Your Position'}]:[]),
        ].map(item => (
          <div key={item.label} style={{display:'flex',alignItems:'center',gap:6}}>
            <div style={{width:14,height:14,background:item.color,border:item.border,borderRadius:3}} />
            <span style={{fontSize:10,color:'var(--text3)'}}>{item.label}</span>
          </div>
        ))}
        <span style={{fontSize:10,color:'var(--text4)',marginLeft:'auto'}}>{isAdmin?'Click node to edit · Click open slot to add rep':'Read only view'}</span>
      </div>

      {/* Edit modal */}
      {editingRep && isAdmin && (
        <EditRepModal rep={editingRep} onClose={() => setEditingRep(null)} onSaved={load} />
      )}

      {/* Add modal */}
      {addingTo && isAdmin && (
        <AddRepModal
          sponsorId={addingTo.sponsorId}
          sponsorName={addingTo.sponsorName}
          leg={addingTo.leg}
          onClose={() => setAddingTo(null)}
          onSaved={load}
        />
      )}
    </div>
  )
}
