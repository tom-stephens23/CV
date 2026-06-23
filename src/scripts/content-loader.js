import matter from 'gray-matter'
import { marked } from 'marked'

async function loadContent() {
  const timelineModules = import.meta.glob('../content/timeline/*.md', {
    as: 'raw',
  })
  const highlightModules = import.meta.glob('../content/highlights/*.md', {
    as: 'raw',
  })

  // Parse timeline
  const timelineEntries = []
  for (const [path, getRaw] of Object.entries(timelineModules)) {
    const raw = await getRaw()
    const { data, content } = matter(raw)
    const bodyHtml = await marked(content)
    const bodyText = content
      .split('\n')
      .map((line) => line.replace(/^[-*]\s+/, ''))
      .join(' ')

    timelineEntries.push({
      ...data,
      bodyHtml,
      bodyText,
      // Map to shape expected by river.js
      t: data.order / 100, // approximate position on river
      blurb: bodyText.split('\n')[0], // first line as blurb for timeline cards
    })
  }

  // Parse highlights
  const highlightEntries = []
  for (const [path, getRaw] of Object.entries(highlightModules)) {
    const raw = await getRaw()
    const { data, content } = matter(raw)
    const bodyHtml = await marked(content)
    const bodyText = content
      .split('\n')
      .map((line) => line.replace(/^[-*]\s+/, ''))
      .join(' ')

    highlightEntries.push({
      ...data,
      bodyHtml,
      bodyText,
    })
  }

  // Sort by order ascending
  timelineEntries.sort((a, b) => a.order - b.order)
  highlightEntries.sort((a, b) => a.order - b.order)

  return {
    timeline: timelineEntries,
    highlights: highlightEntries,
  }
}

export const content = await loadContent()
