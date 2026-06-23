import '../styles/index.css'
import { mulberry32, vnoise, fbm, buildPermutation } from './noise.js'
import { content } from './content-loader.js'

// Reindex timeline content — content-loader returns in order 1..N (most recent first)
// but river.js expects to linearly space them: adjust t values
const ENTRIES = content.timeline.map((entry, idx, arr) => ({
  ...entry,
  t: idx / arr.length, // spread evenly across river
}))

// Re-index highlights for town placement
const HIGHLIGHTS_BY_ORDER = content.highlights.reduce((acc, h) => {
  acc[h.order] = h
  return acc
}, {})

const ROLE_COPY = {
  zero: {
    lead: "You're building from nothing. So did I.",
    points: [
      'Co-founded CleanPlate — idea, build, launch, growth, the lot',
      'Comfortable with ambiguity: discovery before roadmap, always',
      'Scrappy by instinct, structured by training',
    ],
  },
  scale: {
    lead: "Scale-ups need pace without chaos. That's my home water.",
    points: [
      'Outcome-led delivery: KPI trees, not feature factories',
      "Founder's bias for momentum, consultant's bias for evidence",
      'Experience taking products from working to winning',
    ],
  },
  enterprise: {
    lead: 'Big organisations move when delivery and politics flow together.',
    points: [
      'Years of enterprise delivery across healthcare and automotive',
      'Stakeholder craft from board level to build team',
      'Governance that speeds teams up rather than slowing them down',
    ],
  },
  platform: {
    lead: 'Platforms are rivers: invisible when healthy, catastrophic when not.',
    points: [
      'Strong technical fluency — credible with engineers',
      'Bridged business strategy and architecture decisions',
      'Replatforming experience with zero-drama migrations (placeholder)',
    ],
  },
}

const PRIO_COPY = {
  discovery:
    'Continuous research cadence — interviews and signals every sprint, not every quarter',
  pace: 'Ways of working that raise speed and quality together',
  data: 'Data-led by default: instrument first, opine second',
  stakeholders:
    'Fluent in exec, engineer and customer — and translates between all three',
}

const seed = Math.floor(Math.random() * 1e9)
const perm = buildPermutation(seed)
const rng = mulberry32(seed ^ 0xbeef)

let J = { top: 0, left: 0, width: 0, height: 0 }
let pickedRole = null
let pickedPrios = []

function centreX(yLocal, width) {
  const amp1 = width * 0.155
  const amp2 = width * 0.095
  let x =
    width * 0.5 +
    Math.sin(yLocal * 0.0032 + 1.1) * amp1 +
    Math.sin(yLocal * 0.0009 + 4.2) * amp2
  return Math.min(Math.max(x, width * 0.18), width * 0.82)
}

function riverHalfW(yLocal, height) {
  return 18 - 12 * (yLocal / Math.max(height, 1))
}

function buildJourney() {
  const wrap = document.getElementById('riverWrap')
  const svg = document.getElementById('riverSvg')
  wrap.querySelectorAll('.entry,.node,.km').forEach((n) => n.remove())

  const W = wrap.clientWidth
  const isNarrow = window.innerWidth < 700
  const H = ENTRIES.length * (isNarrow ? 440 : 500) + 240
  wrap.style.height = H + 'px'
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
  svg.setAttribute('preserveAspectRatio', 'none')

  const pts = []
  for (let y = 0; y <= H; y += 20) pts.push([centreX(y, W), y])
  const d = 'M' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L ')

  svg.innerHTML = `
    <path d="${d}" fill="none" stroke="#0E564C" stroke-width="34" stroke-linecap="round" opacity="0.55"/>
    <path d="${d}" fill="none" stroke="#2FA38F" stroke-width="14" stroke-linecap="round"/>
    <path d="${d}" fill="none" stroke="#8FE9D3" stroke-width="3" opacity="0.35"/>
    <path class="flowline" d="${d}"/>
  `

  ENTRIES.forEach((e, i) => {
    const y = e.t * H + 80
    const x = centreX(y, W)
    const side = x > W / 2 ? 'left' : 'right'

    const node = document.createElement('div')
    node.className = 'node' + (e.source ? ' source' : '')
    node.className += ' timeline-node'
    node.setAttribute('data-entry-index', i)
    node.style.left = x + 'px'
    node.style.top = y + 'px'
    node.style.cursor = 'pointer'
    node.addEventListener('click', () => openModalFromEntry(e))
    wrap.appendChild(node)

    const km = document.createElement('span')
    km.className = 'mono km'
    km.textContent = e.km
    km.style.left = x + 'px'
    km.style.top = y - 26 + 'px'
    wrap.appendChild(km)

    const card = document.createElement('div')
    card.className = 'entry'
    card.innerHTML = `<div class="e-card">
        <span class="mono">${e.years}</span>
        <h3>${e.role}</h3>
        <div class="org">${e.org}</div>
        <p>${e.blurb}</p>
      </div>`
    card.style.top = y - 40 + 'px'
    const gap = isNarrow ? 34 : 56
    const cardW = isNarrow ? window.innerWidth * 0.76 : Math.min(360, window.innerWidth * 0.38)
    if (side === 'left') {
      card.style.left = Math.max(12, x - gap - cardW) + 'px'
    } else {
      card.style.left = Math.min(W - 12 - cardW, x + gap) + 'px'
    }
    wrap.appendChild(card)
  })

  const r = wrap.getBoundingClientRect()
  J = { top: r.top + window.scrollY, left: r.left + window.scrollX, width: W, height: H }
}

function buildTerrain() {
  const cv = document.getElementById('terrain')
  const W = document.documentElement.clientWidth
  const H = document.documentElement.scrollHeight
  cv.width = W
  cv.height = H
  cv.style.width = W + 'px'
  cv.style.height = H + 'px'
  const ctx = cv.getContext('2d')
  ctx.clearRect(0, 0, W, H)

  const step = 7
  for (let y = 0; y < H; y += step) {
    for (let x = 0; x < W; x += step) {
      const jx = x + (rng() - 0.5) * step
      const jy = y + (rng() - 0.5) * step

      const e = fbm(jx * 0.0042, jy * 0.0042, perm)

      const band = e * 11
      const distToLine = Math.abs(band - Math.round(band))
      let p = distToLine < 0.07 ? 0.62 : 0.045
      p *= 0.35 + e * 0.85

      if (jy > J.top && jy < J.top + J.height && J.width > 0) {
        const yl = jy - J.top
        const cx = J.left + centreX(yl, J.width)
        const dist = Math.abs(jx - cx)
        const half = riverHalfW(yl, J.height) + 26
        if (dist < half) {
          continue
        }
        p *= Math.min(1, 0.25 + (dist - half) / 160)
      }

      if (rng() < p) {
        const size = distToLine < 0.07 ? 1.6 : 1.1
        const alpha = 0.12 + e * 0.2
        ctx.fillStyle = `rgba(74,102,80,${alpha.toFixed(3)})`
        ctx.fillRect(jx, jy, size, size)
      }
    }
  }
}

function closeModal() {
  document.getElementById('overlay').classList.remove('open')
}

function openModalFromEntry(entry) {
  document.getElementById('modalKicker').textContent = entry.years
  document.getElementById('modalTitle').textContent = entry.role
  document.getElementById('modalOrg').textContent = entry.org
  document.getElementById('modalBody').innerHTML = entry.bodyHtml
  document.getElementById('modalStats').innerHTML = (entry.stats || [])
    .map((s) => `<div class="stat"><b>${s.value}</b><span>${s.label}</span></div>`)
    .join('')
  document.getElementById('overlay').classList.add('open')
  document.getElementById('modalClose').focus()
}

function renderFit() {
  const out = document.getElementById('fitResult')
  if (!pickedRole) {
    out.innerHTML = `<p class="hint">Pick a role type above and the river will do the rest.</p>`
    return
  }
  const r = ROLE_COPY[pickedRole]
  const extra = pickedPrios.map((p) => PRIO_COPY[p])
  out.innerHTML = `
    <p class="lead">${r.lead}</p>
    <ul>${[...r.points.slice(0, extra.length ? 2 : 3), ...extra].map((p) => `<li>${p}</li>`).join('')}</ul>
    <a class="fit-cta" href="mailto:hello@example.com?subject=Your%20role%20%C3%97%20Tom">Sounds right? Email me →</a>`
}

function buildDelta() {
  const svg = document.getElementById('deltaCanvasSvg')
  const townsContainer = document.getElementById('towns')
  if (!svg || !townsContainer || content.highlights.length === 0) return

  const W = townsContainer.parentElement.clientWidth
  const H = 420

  svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
  svg.setAttribute('preserveAspectRatio', 'none')

  // Generate 3 delta channels from top center, fanning out
  const channels = [
    { x: W * 0.35, amp: -30 },
    { x: W * 0.5, amp: 0 },
    { x: W * 0.65, amp: 30 },
  ]

  let pathsHtml = ''
  channels.forEach((ch) => {
    const x1 = ch.x
    const y1 = 0
    const x2 = ch.x + ch.amp
    const y2 = H
    const cx1 = x1 + ch.amp * 0.4
    const cy1 = H * 0.3
    const cx2 = x2 - ch.amp * 0.2
    const cy2 = H * 0.7

    // Deep river layer
    pathsHtml += `<path d="M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}" fill="none" stroke="#0E4C44" stroke-width="28" stroke-linecap="round" opacity="0.5"/>`
    // River
    pathsHtml += `<path d="M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}" fill="none" stroke="#1F8A78" stroke-width="12" stroke-linecap="round"/>`
    // Flow animation
    pathsHtml += `<path class="flowline" d="M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}"/>`
  })

  svg.innerHTML = pathsHtml

  // Position towns between channels
  const positions = [
    { left: 12, top: 40 }, // left of left channel
    { left: 40, top: 200 }, // between left and center
    { left: 58, top: 100 }, // between center and right
    { left: 82, top: 240 }, // right of right channel
  ]

  townsContainer.innerHTML = ''
  content.highlights.forEach((highlight, idx) => {
    const pos = positions[idx] || { left: 50, top: 100 }
    const town = document.createElement('div')
    town.className = 'town'
    town.style.left = pos.left + '%'
    town.style.top = pos.top + 'px'
    town.setAttribute('data-highlight-order', highlight.order)

    const card = document.createElement('button')
    card.className = 'town-card'
    card.setAttribute('data-modal', `m${highlight.order}`)
    card.setAttribute('aria-haspopup', 'dialog')

    const thumb = document.createElement('div')
    thumb.className = 'thumb'
    thumb.innerHTML = `<svg viewBox="0 0 320 200" role="img" aria-label="${highlight.title}">
      <rect width="320" height="200" fill="var(--paper)" opacity="0.5"/>
      <circle cx="160" cy="100" r="60" fill="none" stroke="#1F8A78" stroke-width="2" opacity="0.6"/>
    </svg>`

    const title = document.createElement('h3')
    title.textContent = highlight.title

    card.appendChild(thumb)
    card.appendChild(title)
    town.appendChild(card)
    townsContainer.appendChild(town)

    // Wire up click handler
    card.addEventListener('click', () => {
      document.getElementById('modalKicker').textContent = highlight.kicker
      document.getElementById('modalTitle').textContent = highlight.title
      document.getElementById('modalOrg').textContent = highlight.org
      document.getElementById('modalBody').innerHTML = highlight.bodyHtml
      document.getElementById('modalStats').innerHTML = (highlight.stats || [])
        .map((s) => `<div class="stat"><b>${s.value}</b><span>${s.label}</span></div>`)
        .join('')
      document.getElementById('overlay').classList.add('open')
      document.getElementById('modalClose').focus()
    })
  })
}

function buildAll() {
  buildJourney()
  buildDelta()
  requestAnimationFrame(buildTerrain)
}

function initModals() {
  // Map modal data attributes to highlight orders (m1=order1, m2=order2, etc.)
  document.querySelectorAll('.card').forEach((btn) => {
    btn.addEventListener('click', () => {
      const modalId = btn.dataset.modal // "m1", "m2", etc.
      const order = parseInt(modalId.charAt(1)) // extract the number
      const highlight = HIGHLIGHTS_BY_ORDER[order]

      if (highlight) {
        document.getElementById('modalKicker').textContent = highlight.kicker
        document.getElementById('modalTitle').textContent = highlight.title
        document.getElementById('modalOrg').textContent = highlight.org
        document.getElementById('modalBody').innerHTML = highlight.bodyHtml
        document.getElementById('modalStats').innerHTML = (highlight.stats || [])
          .map((s) => `<div class="stat"><b>${s.value}</b><span>${s.label}</span></div>`)
          .join('')
        document.getElementById('overlay').classList.add('open')
        document.getElementById('modalClose').focus()
      }
    })
  })

  document.getElementById('modalClose').addEventListener('click', closeModal)
  document.getElementById('overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('overlay')) closeModal()
  })
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal()
  })
}

function initRecruiterWidget() {
  document.getElementById('roleChips').addEventListener('click', (e) => {
    const c = e.target.closest('.chip')
    if (!c) return
    document.querySelectorAll('#roleChips .chip').forEach((x) => x.setAttribute('aria-pressed', 'false'))
    c.setAttribute('aria-pressed', 'true')
    pickedRole = c.dataset.role
    renderFit()
  })

  document.getElementById('prioChips').addEventListener('click', (e) => {
    const c = e.target.closest('.chip')
    if (!c) return
    const k = c.dataset.prio
    if (pickedPrios.includes(k)) {
      pickedPrios = pickedPrios.filter((x) => x !== k)
      c.setAttribute('aria-pressed', 'false')
    } else if (pickedPrios.length < 2) {
      pickedPrios.push(k)
      c.setAttribute('aria-pressed', 'true')
    }
    renderFit()
  })
}

window.addEventListener('load', buildAll)
let rT
window.addEventListener('resize', () => {
  clearTimeout(rT)
  rT = setTimeout(buildAll, 200)
})

buildAll()
initModals()
initRecruiterWidget()
