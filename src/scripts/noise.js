export function mulberry32(a) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t
    return (((t ^ (t >>> 14)) >>> 0) / 4294967296)
  }
}

export function vnoise(x, y, perm) {
  const xi = Math.floor(x) & 255
  const yi = Math.floor(y) & 255
  const xf = x - Math.floor(x)
  const yf = y - Math.floor(y)
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)

  const h = (a, b) => perm[(perm[a & 255] + b) & 255] / 255

  const a = h(xi, yi)
  const b = h(xi + 1, yi)
  const c = h(xi, yi + 1)
  const d = h(xi + 1, yi + 1)

  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}

export function fbm(x, y, perm) {
  let s = 0
  let a = 0.5
  let f = 1

  for (let o = 0; o < 3; o++) {
    s += a * vnoise(x * f, y * f, perm)
    a *= 0.5
    f *= 2.1
  }

  return s / 0.875
}

export function buildPermutation(seed) {
  const rng = mulberry32(seed)
  const perm = new Uint8Array(512)
  const p = [...Array(256).keys()]

  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[p[i], p[j]] = [p[j], p[i]]
  }

  for (let i = 0; i < 512; i++) {
    perm[i] = p[i & 255]
  }

  return perm
}
