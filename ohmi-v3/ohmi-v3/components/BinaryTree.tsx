'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type Rep = {
  id: string
  first_name: string
  last_name: string
  leg: 'left' | 'right'
  sponsor_id: string | null
  is_active: boolean
  current_rank: string
  left_team_count: number
  right_team_count: number
  email: string
  phone: string
}

type TreeNode = {
  rep: Rep
  left: TreeNode | null
  right: TreeNode | null
  depth: number
}

function buildTree(reps: Rep[], rootId: string | null, depth = 0, maxDepth = 99): TreeNode | null {
  if (depth > maxDepth) return null
  const root = rootId
    ? reps.find(r => r.id === rootId)
    : reps.find(r => !r.sponsor_id)
  if (!root) return null
  const children = reps.filter(r => r.sponsor_id === root.id)
  const leftChild = children.find(r => r.leg === 'left') || null
  const rightChild = children.find(r => r.leg === 'right') || null
  return {
    rep: root,
    left: leftChild ? buildTree(reps, leftChild.id, depth + 1, maxDepth) : null,
    right: rightChild ? buildTree(reps, rightChild.id, depth + 1, maxDepth) : null,
    depth,
  }
}

function EditModal({ rep, allReps, onClose, onSave }: {
  rep: Rep
  allReps: Rep[]
  onClose: () => void
  onSave: (updated: Partial<Rep>) => void
}) {
  const [form, setForm] = useState({
    first_name: rep.first_name,
    last_name: rep.last_name,
    email: rep.email,
    phone: rep.phone || '',
    leg: rep.leg,
    sponsor_id: rep.sponsor_id || '',
    is_active: rep.is_active,
    current_rank: rep.current_rank || 'Unranked',
  })
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    await supabase.from('representatives').update(form).eq('id', rep.id)
    onSave(form)
    setSaving(false)
    onClose()
  }

  async function remove() {
    if (!confirm(`Remove ${rep.first_name} ${rep.last_name} from the network?`)) return
    await supabase.from('representatives').update({ sponsor_id: null, is_active: false, status: 'terminated' }).eq('id', rep.id)
    onSave({ sponsor_id: null, is_active: false })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Edit — {rep.first_name} {rep.last_name}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="grid-2">
            <div className="field">
              <label>First Name</label>
              <input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} />
            </div>
            <div className="field">
              <label>Last Name</label>
              <input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
            </div>
            <div className="field">
              <label>Email</label>
              <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="field">
              <label>Phone</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="field">
              <label>Leg Placement</label>
              <select value={form.leg} onChange={e => setForm(f => ({ ...f, leg: e.target.value as 'left' | 'right' }))}>
                <option value="left">Left Leg</option>
                <option value="right">Right Leg</option>
              </select>
            </div>
            <div className="field">
              <label>Rank</label>
              <select value={form.current_rank} onChange={e => setForm(f => ({ ...f, current_rank: e.target.value }))}>
                {['Unranked','R1','R2','R3','R4','R5','R6','R7','R8','R9','R10','R11'].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Sponsor</label>
              <select value={form.sponsor_id} onChange={e => setForm(f => ({ ...f, sponsor_id: e.target.value }))}>
                <option value="">— No Sponsor (Root) —</option>
                {allReps.filter(r => r.id !== rep.id).map(r => (
                  <option key={r.id} value={r.id}>{r.first_name} {r.last_name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Status</label>
              <select value={form.is_active ? 'active' : 'inactive'} onChange={e => setForm(f => ({ ...f, is_active: e.target.value === 'active' }))}>
                <option value="active">Active</option>
                <option value="inactive">Inactive / Pending</option>
              </select>
            </div>
          </div>
        </div>
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button className="btn btn-ghost" style={{ color: '#C41E4A', borderColor: 'rgba(196,30,74,0.3)' }} onClick={remove}>
            Remove from Network
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn btn-red" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function NodeCard({ node, isAdmin, onEdit, isMe }: {
  node: TreeNode
  isAdmin: boolean
  onEdit?: (rep: Rep) => void
  isMe?: boolean
}) {
  const { rep } = node
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => isAdmin && onEdit && onEdit(rep)}
      style={{
        background: isMe ? '#C41E4A' : hovered && isAdmin ? '#E5DCBF' : '#EDE5CC',
        border: isMe ? '2px solid #9e1039' : `1px solid ${hovered && isAdmin ? '#B5AA8C' : '#C4B99A'}`,
        borderRadius: 4,
        padding: '10px 14px',
        cursor: isAdmin ? 'pointer' : 'default',
        minWidth: 140,
        maxWidth: 164,
        transition: 'all 0.18s',
        boxShadow: isMe
          ? '0 6px 24px rgba(196,30,74,0.22)'
          : hovered && isAdmin
            ? '0 4px 16px rgba(26,8,8,0.1)'
            : '0 2px 8px rgba(26,8,8,0.05)',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
          background: rep.is_active ? '#1a6640' : '#C4B99A',
        }} />
        <span style={{
          fontSize: 8, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
          color: isMe ? 'rgba(245,237,214,0.7)' : rep.is_active ? '#1a6640' : '#8a6060',
        }}>
          {rep.is_active ? 'Active' : 'Pending'}
        </span>
        {isAdmin && hovered && (
          <span style={{
            marginLeft: 'auto', fontSize: 8, color: '#C41E4A',
            fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            Edit →
          </span>
        )}
      </div>
      <div style={{
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        fontSize: 15, fontWeight: 500, lineHeight: 1.15, marginBottom: 5,
        color: isMe ? '#F5EDD6' : '#1a0808',
      }}>
        {rep.first_name}<br />{rep.last_name}
      </div>
      {rep.current_rank && rep.current_rank !== 'Unranked' && (
        <div style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: isMe ? 'rgba(245,237,214,0.75)' : '#C41E4A',
          marginBottom: 6,
        }}>
          {rep.current_rank}
        </div>
      )}
      <div style={{ display: 'flex', gap: 10 }}>
        {[['L', rep.left_team_count], ['R', rep.right_team_count]].map(([s, c]) => (
          <div key={s as string} style={{
            fontSize: 9, color: isMe ? 'rgba(245,237,214,0.55)' : '#8a6060',
            display: 'flex', gap: 3,
          }}>
            <span style={{ fontWeight: 700 }}>{s}</span>
            <span>{c}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TreeBranch({ node, isAdmin, onEdit, meId, depth = 0 }: {
  node: TreeNode
  isAdmin: boolean
  onEdit?: (rep: Rep) => void
  meId?: string
  depth?: number
}) {
  const [collapsed, setCollapsed] = useState(depth >= 3)
  const hasChildren = node.left || node.right
  const isMe = node.rep.id === meId
  const LINE = '#C4B99A'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <NodeCard node={node} isAdmin={isAdmin} onEdit={onEdit} isMe={isMe} />
      {hasChildren && (
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            width: 20, height: 20, borderRadius: '50%',
            background: collapsed ? '#C41E4A' : '#EDE5CC',
            border: '1px solid #C4B99A',
            color: collapsed ? '#F5EDD6' : '#C41E4A',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s', lineHeight: 1, zIndex: 2,
          }}
        >
          {collapsed ? '+' : '−'}
        </button>
      )}
      {hasChildren && !collapsed && (
        <>
          <div style={{ width: 1, height: 20, background: LINE }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start' }}>
            {node.left && node.right && (
              <div style={{
                position: 'absolute', top: 0,
                left: 'calc(25% + 8px)', right: 'calc(25% + 8px)',
                height: 1, background: LINE,
              }} />
            )}
            {node.left && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px' }}>
                <div style={{ width: 1, height: 20, background: LINE }} />
                <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C41E4A', marginBottom: 10 }}>Left</div>
                <TreeBranch node={node.left} isAdmin={isAdmin} onEdit={onEdit} meId={meId} depth={depth + 1} />
              </div>
            )}
            {node.right && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px' }}>
                <div style={{ width: 1, height: 20, background: LINE }} />
                <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C41E4A', marginBottom: 10 }}>Right</div>
                <TreeBranch node={node.right} isAdmin={isAdmin} onEdit={onEdit} meId={meId} depth={depth + 1} />
              </div>
            )}
            {isAdmin && !node.left && node.right && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px' }}>
                <div style={{ width: 1, height: 20, background: LINE }} />
                <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C4B99A', marginBottom: 10 }}>Left</div>
                <EmptySlot label="Open" />
              </div>
            )}
            {isAdmin && node.left && !node.right && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px' }}>
                <div style={{ width: 1, height: 20, background: LINE }} />
                <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C4B99A', marginBottom: 10 }}>Right</div>
                <EmptySlot label="Open" />
              </div>
            )}
          </div>
        </>
      )}
      {isAdmin && !hasChildren && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 1, height: 20, background: LINE }} />
          <div style={{ display: 'flex', gap: 16 }}>
            {['Left', 'Right'].map(side => (
              <div key={side} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C4B99A', marginBottom: 8 }}>{side}</div>
                <EmptySlot label="Open" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function EmptySlot({ label }: { label: string }) {
  return (
    <div style={{
      minWidth: 140, maxWidth: 164, padding: '10px 14px',
      border: '1px dashed #C4B99A', borderRadius: 4,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#C4B99A', fontSize: 10, letterSpacing: '0.1em',
      textTransform: 'uppercase', fontWeight: 600,
      background: 'rgba(196,185,154,0.05)',
    }}>
      {label}
    </div>
  )
}

export default function BinaryTree({ portalType, repId }: {
  portalType: 'admin' | 'rep'
  repId?: string
}) {
  const [reps, setReps] = useState<Rep[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Rep | null>(null)
  const [search, setSearch] = useState('')
  const isAdmin = portalType === 'admin'

  async function load() {
    const { data } = await supabase.from('representatives').select('*').order('created_at', { ascending: true })
    setReps((data || []) as Rep[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const tree = (() => {
    if (!reps.length) return null
    if (isAdmin) return buildTree(reps, null)
    return buildTree(reps, repId || null)
  })()

  const stats = {
    total: reps.length,
    active: reps.filter(r => r.is_active).length,
    left: reps.filter(r => r.leg === 'left').length,
    right: reps.filter(r => r.leg === 'right').length,
  }

  const searchResults = search.length > 1
    ? reps.filter(r => `${r.first_name} ${r.last_name} ${r.email}`.toLowerCase().includes(search.toLowerCase())).slice(0, 6)
    : []

  return (
    <div className="main">
      <div className="topbar">
        <span className="topbar-title">{isAdmin ? 'Binary Network Tree' : 'My Network Position'}</span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {isAdmin && (
            <div style={{ position: 'relative' }}>
              <input placeholder="Search rep…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: 200, padding: '5px 10px', fontSize: 11 }} />
              {searchResults.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 200, background: '#EDE5CC', border: '1px solid #C4B99A', borderRadius: 3, width: 260, marginTop: 4, boxShadow: '0 8px 24px rgba(26,8,8,0.1)' }}>
                  {searchResults.map(r => (
                    <div key={r.id} onClick={() => { setEditing(r); setSearch('') }} style={{ padding: '8px 12px', borderBottom: '1px solid #C4B99A', cursor: 'pointer' }} onMouseEnter={e => (e.currentTarget.style.background = '#E5DCBF')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <div style={{ fontWeight: 500, color: '#1a0808', fontSize: 12 }}>{r.first_name} {r.last_name}</div>
                      <div style={{ fontSize: 10, color: '#8a6060' }}>{r.leg} leg · {r.current_rank || 'Unranked'} · {r.is_active ? 'Active' : 'Pending'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 1, background: '#C4B99A', borderBottom: '1px solid #C4B99A', flexShrink: 0 }}>
        {(isAdmin
          ? [['Total Reps', stats.total], ['Active', stats.active], ['Left Leg', stats.left], ['Right Leg', stats.right]]
          : [['Your Position', 'Rep'], ['Left Leg', reps.filter(r => r.sponsor_id === repId && r.leg === 'left').length], ['Right Leg', reps.filter(r => r.sponsor_id === repId && r.leg === 'right').length]]
        ).map(([l, v]) => (
          <div key={l as string} style={{ flex: 1, background: '#EDE5CC', padding: '10px 20px' }}>
            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8a6060', marginBottom: 3 }}>{l as string}</div>
            <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 22, color: '#1a0808', lineHeight: 1 }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '48px 80px 100px', background: '#F5EDD6', backgroundImage: 'radial-gradient(circle, #C4B99A 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
            <div style={{ fontSize: 10, color: '#8a6060', letterSpacing: '0.24em', textTransform: 'uppercase' }}>Loading network…</div>
          </div>
        ) : !tree ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 10 }}>
            <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 26, color: '#C4B99A', fontWeight: 300 }}>{isAdmin ? 'No representatives yet' : 'Position not found'}</div>
            {isAdmin && <div style={{ fontSize: 10, color: '#8a6060', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Add reps from the Network page to build the tree</div>}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: isAdmin ? '#8a6060' : '#C41E4A', marginBottom: 12 }}>
              {isAdmin ? 'Click any node to edit' : 'Your Position'}
            </div>
            <TreeBranch node={tree} isAdmin={isAdmin} onEdit={isAdmin ? setEditing : undefined} meId={!isAdmin ? repId : undefined} depth={0} />
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 20, padding: '10px 32px', borderTop: '1px solid #C4B99A', background: '#EDE5CC', flexShrink: 0, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#8a6060' }}>Legend</span>
        {[
          { color: '#EDE5CC', border: '1px solid #C4B99A', label: 'Active Rep' },
          { color: '#EDE5CC', border: '1px dashed #C4B99A', label: 'Pending Rep' },
          ...(isAdmin ? [{ color: 'rgba(196,185,154,0.05)', border: '1px dashed #C4B99A', label: 'Open Slot' }] : []),
          ...(!isAdmin ? [{ color: '#C41E4A', border: '2px solid #9e1039', label: 'Your Position' }] : []),
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 14, height: 14, background: item.color, border: item.border, borderRadius: 2 }} />
            <span style={{ fontSize: 10, color: '#5a3030' }}>{item.label}</span>
          </div>
        ))}
        <span style={{ fontSize: 10, color: '#8a6060', marginLeft: 'auto' }}>{isAdmin ? 'Click node to edit · +/− to expand' : '+/− to expand branches'}</span>
      </div>
      {editing && isAdmin && (
        <EditModal rep={editing} allReps={reps} onClose={() => setEditing(null)} onSave={() => { load(); setEditing(null) }} />
      )}
    </div>
  )
}
