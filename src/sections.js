// ============================================
// PUBLIC SECTIONS
// ============================================
import { supabase, isConfigured } from './supabase.js';
import { escapeHtml, formatDate, readingTime, sectionWrapper, emptyState, loadingState, statusPill } from './utils.js';
import { openModal } from './components.js';

// Cached data
let cache = { projects: [], sponsors: [], milestones: [], graveyard: [], posts: [], notes: [], til: [], principles: [], reading: [], links: [], media: [], travel: [], goals: [], predictions: [], ama: [], guestbook: [], skills: [], appearances: [], gear: [] };

/* ---------- HERO ---------- */
export function renderHero() {
  return `<section class="hero" id="home">
    <div class="hero-content">
      <div class="hero-label">Founder & Digital Architect</div>
      <h1>Supreme<span>Alpha</span></h1>
      <p class="hero-role">Building the Future of African Digital Innovation</p>
      <p class="hero-desc">Nigerian technology entrepreneur and software developer. Founder of <a href="https://supreme-amerweb.vercel.app" target="_blank" style="color:var(--gold);text-decoration:none">SupremeAmer</a> — creating platforms that merge blockchain infrastructure with intuitive user experiences.</p>
      <div class="hero-btns">
        <a href="#/work" class="btn btn-gold" data-nav>View Work</a>
        <a href="#/contact" class="btn btn-ghost" data-nav>Get in Touch</a>
        <a href="#/sponsors" class="btn btn-ghost" data-nav>Sponsor</a>
      </div>
      <div class="hero-stats">
        <div class="hero-stat"><div class="hero-stat-value" id="statProjects">0</div><div class="hero-stat-label">Projects</div></div>
        <div class="hero-stat"><div class="hero-stat-value" id="statCountries">3+</div><div class="hero-stat-label">Countries</div></div>
        <div class="hero-stat"><div class="hero-stat-value" id="statYears">5+</div><div class="hero-stat-label">Years Coding</div></div>
      </div>
    </div>
  </section>`;
}

/* ---------- ABOUT ---------- */
export function renderAbout() {
  return `<section class="about-sec" id="about">
    <div class="sec-label">About</div>
    <h2 class="sec-title">The Founder</h2>
    <div class="about-grid">
      <div class="about-text">
        <h3>SupremeAlpha</h3>
        <p>Nigerian technology entrepreneur, software developer, and digital innovator focused on building scalable platforms that combine blockchain technology, affiliate marketing, and modern web experiences.</p>
        <p>Founded with the vision of creating accessible digital opportunities across Africa. Every product empowers users to earn, transact, and participate in the growing decentralized economy.</p>
        <div class="about-quote">
          <p>"To create innovative digital ecosystems that empower individuals across Africa through technology, financial inclusion, and decentralized opportunities."</p>
          <small>— Mission Statement</small>
        </div>
      </div>
      <div class="about-img-wrap">
        <img src="" data-placeholder="Add your profile image URL here" class="about-img" alt="SupremeAlpha" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <div style="display:none;width:100%;aspect-ratio:3/4;background:var(--bg3);border-radius:4px;align-items:center;justify-content:center;color:var(--fg3);font-size:12px;font-family:monospace">Add your profile image</div>
      </div>
    </div>
  </section>`;
}

/* ---------- SKILLS ---------- */
export async function loadSkills() {
  if (!isConfigured()) return;
  const { data } = await supabase.from('skills').select('*').order('sort_order', { ascending: true });
  cache.skills = data || [];
}
export function renderSkills() {
  const skills = cache.skills;
  let html = sectionWrapper('Craft', 'Skills Matrix', 'Technologies, disciplines, and capabilities developed over years of building.');
  if (!skills.length) {
    html += emptyState('Skills will appear here once configured in the admin panel.');
    return `<section id="skills">${html}</section>`;
  }
  html += `<div class="skills-grid">` + skills.map(s => {
    const pct = (s.level || 5) * 10;
    return `<div class="skill-card reveal">
      <div class="skill-header"><span class="skill-name">${escapeHtml(s.name)}</span><span class="skill-level">${s.level}/10</span></div>
      <div class="skill-bar"><div class="skill-bar-fill" style="width:${pct}%"></div></div>
      <div class="skill-meta">${s.years_exp ? s.years_exp + ' years exp' : ''} · ${escapeHtml(s.category || '')}</div>
    </div>`;
  }).join('') + `</div>`;
  return `<section id="skills">${html}</section>`;
}

/* ---------- WORK / PROJECTS ---------- */
export async function loadProjects() {
  if (!isConfigured()) return;
  const { data } = await supabase.from('projects').select('*').order('sort_order', { ascending: true });
  cache.projects = data || [];
  const el = document.getElementById('statProjects');
  if (el) el.textContent = cache.projects.length;
}
export function renderWork() {
  const projects = cache.projects;
  let html = sectionWrapper('Work', 'Deployed Modules', 'Production-ready platforms powering African digital commerce and Web3 adoption.');
  if (!projects.length) {
    html += `<div class="products-grid">${emptyState('No projects yet. Add them in the admin panel.')}</div>`;
    return `<section class="work-sec" id="work">${html}</section>`;
  }
  html += `<div class="products-grid">` + projects.map(p => {
    const initials = p.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    const statusClass = p.status === 'live' ? 'status-live' : 'status-soon';
    const statusText = p.status === 'live' ? 'Live' : 'Soon';
    const btn = p.url ? `<a href="${p.url}" class="btn btn-gold" target="_blank">Launch App</a>` : `<button class="btn btn-ghost" style="cursor:default">Launching Soon</button>`;
    const tags = (p.tags || []).map(t => `<span>${escapeHtml(t)}</span>`).join('');
    return `<div class="product reveal">
      <div class="prod-header"><div class="prod-logo">${initials}</div><span class="prod-status ${statusClass}">${statusText}</span></div>
      <h3>${escapeHtml(p.name)}</h3>
      <p>${escapeHtml(p.description)}</p>
      <div class="prod-tags">${tags}</div>
      <div class="prod-btns">${btn}</div>
    </div>`;
  }).join('') + `</div>`;
  return `<section class="work-sec" id="work">${html}</section>`;
}

/* ---------- TIMELINE ---------- */
export async function loadMilestones() {
  if (!isConfigured()) return;
  const { data } = await supabase.from('milestones').select('*').order('date', { ascending: false });
  cache.milestones = data || [];
}
export function renderTimeline() {
  const items = cache.milestones;
  let html = sectionWrapper('Journey', 'Career Timeline', 'The path from first line of code to founding SupremeAmer.');
  if (!items.length) {
    html += emptyState('Timeline events will appear here once added in admin.');
    return `<section id="timeline">${html}</section>`;
  }
  html += `<div class="timeline-wrap">` + items.map(m => `
    <div class="timeline-item reveal">
      <div class="timeline-dot ${m.highlight ? 'highlight' : ''}"></div>
      <div class="timeline-date">${formatDate(m.date)}</div>
      <div class="timeline-title">${escapeHtml(m.title)}</div>
      <div class="timeline-desc">${escapeHtml(m.description)}</div>
      <div class="timeline-category">${escapeHtml(m.category)}</div>
    </div>
  `).join('') + `</div>`;
  return `<section id="timeline">${html}</section>`;
}

/* ---------- GRAVEYARD ---------- */
export async function loadGraveyard() {
  if (!isConfigured()) return;
  const { data } = await supabase.from('graveyard').select('*').order('year', { ascending: false });
  cache.graveyard = data || [];
}
export function renderGraveyard() {
  const items = cache.graveyard;
  let html = sectionWrapper('Honest', 'The Graveyard', 'Failed experiments, retired projects, and lessons learned the hard way.');
  if (!items.length) {
    html += emptyState('The graveyard is empty. Every builder has failures — add yours in admin.');
    return `<section id="graveyard">${html}</section>`;
  }
  html += `<div class="graveyard-grid">` + items.map(g => `
    <div class="grave-card reveal">
      <div class="grave-year">${g.year}</div>
      <div class="grave-name">${escapeHtml(g.name)}</div>
      <div class="grave-cause">${escapeHtml(g.why_it_died)}</div>
      <div class="grave-lesson">${escapeHtml(g.lessons)}</div>
    </div>
  `).join('') + `</div>`;
  return `<section id="graveyard">${html}</section>`;
}

/* ---------- SPONSORS ---------- */
export async function loadSponsors() {
  if (!isConfigured()) return;
  const { data } = await supabase.from('sponsor_tiers').select('*').eq('status', 'active').order('sort_order', { ascending: true });
  cache.sponsors = data || [];
}
export function renderSponsors() {
  const tiers = cache.sponsors;
  let html = sectionWrapper('Invest', 'Sponsor Tiers', 'Partner with SupremeAmer to shape the future of African digital innovation.');
  if (!tiers.length) {
    html += `<div class="sponsors-grid">${emptyState('No sponsor tiers available.')}</div>`;
    return `<section class="sponsors-sec" id="sponsors">${html}</section>`;
  }
  html += `<div class="sponsors-grid">` + tiers.map(s => {
    const benefits = (s.benefits || []).map(b => `<li>${escapeHtml(b)}</li>`).join('');
    return `<div class="sponsor-card reveal">
      <div class="sponsor-tier">${escapeHtml(s.name)}</div>
      <h3>${escapeHtml(s.name)}</h3>
      <div class="sponsor-amount">${escapeHtml(s.amount)}</div>
      <p>${escapeHtml(s.description)}</p>
      <ul class="sponsor-benefits">${benefits}</ul>
      <button class="btn btn-gold" style="width:100%" onclick="window.app.openSponsorInquiry('${s.id}', '${s.name.replace(/'/g, "\'")}')">Inquire Now</button>
    </div>`;
  }).join('') + `</div>`;
  return `<section class="sponsors-sec" id="sponsors">${html}</section>`;
}

/* ---------- PHILOSOPHY ---------- */
export function renderPhilosophy() {
  return `<section class="phil-sec" id="philosophy">
    <div class="sec-label">Philosophy</div>
    <h2 class="sec-title">Core Protocols</h2>
    <div class="phil-grid">
      <div class="phil-item reveal"><div class="phil-num">01</div><h3>Create Opportunities</h3><p>Every platform opens new income streams and financial access for users across Africa.</p></div>
      <div class="phil-item reveal"><div class="phil-num">02</div><h3>Remove Barriers</h3><p>Complex blockchain abstracted into intuitive interfaces. No Web3 knowledge required.</p></div>
      <div class="phil-item reveal"><div class="phil-num">03</div><h3>Empower Participation</h3><p>Users are stakeholders — from mining rewards to affiliate commissions.</p></div>
    </div>
  </section>`;
}

/* ---------- WRITINGS ---------- */
export async function loadPosts() {
  if (!isConfigured()) return;
  const { data } = await supabase.from('posts').select('*').eq('published', true).order('created_at', { ascending: false });
  cache.posts = data || [];
}
export function renderWritings() {
  const posts = cache.posts;
  let html = sectionWrapper('Writings', 'The Alpha Log', 'Essays, technical deep-dives, and monthly reflections on building in Africa.');
  if (!posts.length) {
    html += emptyState('No published writings yet. Create your first post in the admin panel.');
    return `<section id="writings">${html}</section>`;
  }
  html += `<div class="writings-grid">` + posts.map(p => `
    <a href="#/writings/${p.slug}" class="post-card reveal" data-nav style="text-decoration:none;color:inherit">
      <div class="post-cover">✍️</div>
      <div class="post-body">
        <div class="post-title">${escapeHtml(p.title)}</div>
        <div class="post-excerpt">${escapeHtml(p.excerpt || p.content.substring(0, 120))}...</div>
        <div class="post-meta"><span>${formatDate(p.created_at)}</span><span>${readingTime(p.content)}</span></div>
      </div>
    </a>
  `).join('') + `</div>`;
  return `<section id="writings">${html}</section>`;
}
export function renderPostDetail(slug) {
  const post = cache.posts.find(p => p.slug === slug);
  if (!post) return `<section><div class="empty-state"><p>Post not found.</p></div></section>`;
  return `<section>
    <div style="max-width:720px;margin:0 auto;padding:40px 0">
      <div class="sec-label">${(post.tags || []).join(' · ')}</div>
      <h1 style="font-size:clamp(28px,4vw,48px);font-weight:900;margin-bottom:16px">${escapeHtml(post.title)}</h1>
      <div style="display:flex;gap:16px;font-size:12px;color:var(--fg3);font-family:monospace;margin-bottom:40px">
        <span>${formatDate(post.created_at)}</span><span>${readingTime(post.content)}</span>
      </div>
      <div class="post-content">${escapeHtml(post.content).replace(/\n/g, '<br>')}</div>
      <div style="margin-top:60px;padding-top:24px;border-top:1px solid var(--border)">
        <a href="#/writings" class="btn btn-ghost" data-nav>← All Writings</a>
      </div>
    </div>
  </section>`;
}

/* ---------- GARDEN ---------- */
export async function loadNotes() {
  if (!isConfigured()) return;
  const { data } = await supabase.from('notes').select('*').order('created_at', { ascending: false });
  cache.notes = data || [];
}
export function renderGarden() {
  const notes = cache.notes;
  let html = sectionWrapper('Garden', 'Digital Garden', 'Living documents. Interconnected notes that grow over time.');
  if (!notes.length) {
    html += emptyState('The garden is empty. Plant your first note in the admin panel.');
    return `<section id="garden">${html}</section>`;
  }
  html += `<div class="garden-grid">` + notes.map(n => `
    <div class="note-card reveal">
      <div class="note-title">${escapeHtml(n.title)}</div>
      <div class="note-preview">${escapeHtml(n.content.substring(0, 120))}...</div>
      <div class="note-links">${(n.backlinks || []).slice(0, 3).map(b => `[[${escapeHtml(b)}]]`).join(' ')}</div>
    </div>
  `).join('') + `</div>`;
  return `<section id="garden">${html}</section>`;
}

/* ---------- TIL ---------- */
export async function loadTIL() {
  if (!isConfigured()) return;
  const { data } = await supabase.from('til').select('*').order('date', { ascending: false }).limit(50);
  cache.til = data || [];
}
export function renderTIL() {
  const items = cache.til;
  let html = sectionWrapper('Learning', 'Today I Learned', 'Micro-lessons. One insight at a time.');
  if (!items.length) {
    html += emptyState('No TIL entries yet. Start documenting what you learn.');
    return `<section id="til">${html}</section>`;
  }
  html += `<div class="writings-grid">` + items.map(t => `
    <div class="post-card reveal" style="cursor:default">
      <div class="post-body">
        <div class="post-title" style="font-size:15px">${escapeHtml(t.content)}</div>
        <div class="post-meta"><span>${formatDate(t.date)}</span><span>${escapeHtml(t.category)}</span></div>
      </div>
    </div>
  `).join('') + `</div>`;
  return `<section id="til">${html}</section>`;
}

/* ---------- PRINCIPLES ---------- */
export async function loadPrinciples() {
  if (!isConfigured()) return;
  const { data } = await supabase.from('principles').select('*').order('sort_order', { ascending: true });
  cache.principles = data || [];
}
export function renderPrinciples() {
  const items = cache.principles;
  let html = sectionWrapper('Beliefs', 'Principles Database', 'How I think, decide, and build. Searchable and ever-evolving.');
  html += `<input type="text" class="principles-search" id="principleSearch" placeholder="Search principles...">`;
  if (!items.length) {
    html += emptyState('No principles documented yet. Add them in the admin panel.');
    return `<section id="principles">${html}</section>`;
  }
  html += `<div class="principles-grid" id="principlesGrid">` + items.map(p => `
    <div class="principle-card reveal" data-cat="${escapeHtml(p.category)}">
      <div class="principle-text">"${escapeHtml(p.text)}"</div>
      ${p.story ? `<div class="principle-story">${escapeHtml(p.story)}</div>` : ''}
      <div class="principle-meta"><span>${escapeHtml(p.category)}</span><span>${formatDate(p.date_adopted)}</span></div>
    </div>
  `).join('') + `</div>`;
  return `<section id="principles">${html}</section>`;
}

/* ---------- READING ---------- */
export async function loadReading() {
  if (!isConfigured()) return;
  const { data } = await supabase.from('reading_list').select('*').order('created_at', { ascending: false });
  cache.reading = data || [];
}
export function renderReading() {
  const books = cache.reading;
  let html = sectionWrapper('Library', 'Reading List', 'Books that shaped my thinking. Currently reading, recently finished, and wishlist.');
  if (!books.length) {
    html += emptyState('No books in the library yet. Start tracking your reading.');
    return `<section id="reading">${html}</section>`;
  }
  html += `<div class="reading-grid">` + books.map(b => `
    <div class="book-card reveal">
      <div class="book-cover">📚</div>
      <div class="book-title">${escapeHtml(b.title)}</div>
      <div class="book-author">${escapeHtml(b.author)}</div>
      <span class="book-status status-${b.status}">${b.status}</span>
      ${b.rating ? `<div style="margin-top:8px;font-size:12px;color:var(--gold)">${'★'.repeat(b.rating)}${'☆'.repeat(5 - b.rating)}</div>` : ''}
    </div>
  `).join('') + `</div>`;
  return `<section id="reading">${html}</section>`;
}

/* ---------- LINKS ---------- */
export async function loadLinks() {
  if (!isConfigured()) return;
  const { data } = await supabase.from('bookmarks').select('*').order('date_added', { ascending: false });
  cache.links = data || [];
}
export function renderLinks() {
  const items = cache.links;
  let html = sectionWrapper('Curated', 'Link Garden', 'The best of the internet, annotated by me.');
  if (!items.length) {
    html += emptyState('No links curated yet. Start saving what you read.');
    return `<section id="links">${html}</section>`;
  }
  html += `<div class="links-grid">` + items.map(l => `
    <a href="${l.url}" target="_blank" class="link-card reveal" style="text-decoration:none;color:inherit">
      <div class="link-favicon">🔗</div>
      <div class="link-content">
        <div class="link-title">${escapeHtml(l.title)}</div>
        <div class="link-url">${escapeHtml(l.url.replace(/^https?:\/\//, '').substring(0, 40))}</div>
        <div class="link-note">${escapeHtml(l.note)}</div>
      </div>
    </a>
  `).join('') + `</div>`;
  return `<section id="links">${html}</section>`;
}

/* ---------- MEDIA ---------- */
export async function loadMedia() {
  if (!isConfigured()) return;
  const { data } = await supabase.from('media').select('*').order('date', { ascending: false });
  cache.media = data || [];
}
export function renderMedia() {
  const items = cache.media;
  let html = sectionWrapper('Visuals', 'Media Gallery', 'Behind the builds, events, and moments that define the journey.');
  if (!items.length) {
    html += emptyState('No media uploaded yet. Add photos in the admin panel.');
    return `<section id="media">${html}</section>`;
  }
  html += `<div class="media-grid">` + items.map(m => `
    <div class="media-item reveal">
      <img src="${m.url}" alt="${escapeHtml(m.caption)}" loading="lazy" onerror="this.style.display='none'">
      <div class="media-caption">${escapeHtml(m.caption)} · ${escapeHtml(m.location || '')}</div>
    </div>
  `).join('') + `</div>`;
  return `<section id="media">${html}</section>`;
}

/* ---------- NOW ---------- */
export async function loadNow() {
  // Now page is typically a single row in a settings table, but we'll use goals/milestones as proxy
}
export function renderNow() {
  return `<section id="now">
    ${sectionWrapper('Current', 'Now', 'What I am focused on at this exact moment in time.')}
    <div class="now-grid">
      <div class="now-card reveal">
        <div class="now-label">Location</div>
        <div class="now-value">Abuja, Nigeria</div>
        <div class="now-desc">Base of operations for SupremeAmer and African digital expansion.</div>
      </div>
      <div class="now-card reveal">
        <div class="now-label">Current Obsession</div>
        <div class="now-value">BNB Chain Ecosystem</div>
        <div class="now-desc">Deep diving into opBNB and building low-cost onboarding flows for African users.</div>
      </div>
      <div class="now-card reveal">
        <div class="now-label">This Month's Goal</div>
        <div class="now-value">Ship AlphaOS v2</div>
        <div class="now-desc">Complete the personal OS platform with full Supabase backend and admin panel.</div>
      </div>
      <div class="now-card reveal">
        <div class="now-label">Recent Win</div>
        <div class="now-value">SupremeAmer Platform Live</div>
        <div class="now-desc">First 100 users onboarded. Feedback loop established.</div>
      </div>
    </div>
    <div style="text-align:center;margin-top:40px"><span class="now-updated">Last updated: August 2026</span></div>
  </section>`;
}

/* ---------- TRAVEL ---------- */
export async function loadTravel() {
  if (!isConfigured()) return;
  const { data } = await supabase.from('travel_map').select('*').order('date', { ascending: false });
  cache.travel = data || [];
}
export function renderTravel() {
  const items = cache.travel;
  let html = sectionWrapper('Journeys', 'Travel Map', 'Work, conferences, and exploration across the continent and beyond.');
  html += `<div class="travel-map reveal">🗺️ Interactive Map (Leaflet.js ready — add API key to enable)</div>`;
  if (!items.length) {
    html += emptyState('No travel logs yet. Document your journeys in the admin panel.');
    return `<section id="travel">${html}</section>`;
  }
  html += `<div class="travel-grid">` + items.map(t => `
    <div class="travel-card reveal">
      <div class="travel-city">${escapeHtml(t.city)}</div>
      <div class="travel-country">${escapeHtml(t.country)}</div>
      <div class="travel-purpose">${escapeHtml(t.purpose)} · ${formatDate(t.date)}</div>
      <div class="travel-note">${escapeHtml(t.note)}</div>
    </div>
  `).join('') + `</div>`;
  return `<section id="travel">${html}</section>`;
}

/* ---------- GOALS ---------- */
export async function loadGoals() {
  if (!isConfigured()) return;
  const { data } = await supabase.from('goals').select('*').order('sort_order', { ascending: true });
  cache.goals = data || [];
}
export function renderGoals() {
  const items = cache.goals;
  let html = sectionWrapper('Focus', 'Public Goals', 'Quarterly OKRs. Transparent progress toward building the future.');
  if (!items.length) {
    html += emptyState('No goals set yet. Define your quarterly OKRs in the admin panel.');
    return `<section id="goals">${html}</section>`;
  }
  html += `<div class="goals-grid">` + items.map(g => {
    const pct = Math.round((g.current / Math.max(g.target, 1)) * 100);
    return `<div class="goal-card reveal">
      <div class="goal-header">
        <span class="goal-title">${escapeHtml(g.title)}</span>
        <span class="goal-quarter">${g.quarter} ${g.year}</span>
      </div>
      <div class="goal-progress"><div class="goal-progress-fill" style="width:${pct}%"></div></div>
      <div class="goal-meta"><span>${g.current} / ${g.target}</span><span class="goal-status ${g.status === 'completed' ? 'status-live' : g.status === 'at_risk' ? 'status-soon' : 'status-new'}">${g.status}</span></div>
    </div>`;
  }).join('') + `</div>`;
  return `<section id="goals">${html}</section>`;
}

/* ---------- PREDICTIONS ---------- */
export async function loadPredictions() {
  if (!isConfigured()) return;
  const { data } = await supabase.from('predictions').select('*').order('date_made', { ascending: false });
  cache.predictions = data || [];
}
export function renderPredictions() {
  const items = cache.predictions;
  let html = sectionWrapper('Bets', 'Predictions', 'Public bets on the future. Accountability through transparency.');
  if (!items.length) {
    html += emptyState('No predictions logged yet. Start placing public bets on the future.');
    return `<section id="predictions">${html}</section>`;
  }
  html += `<div class="predictions-grid">` + items.map(p => `
    <div class="prediction-card reveal">
      <div class="prediction-text">${escapeHtml(p.prediction)}</div>
      <div class="prediction-meta">
        <span>Confidence: ${p.confidence}%</span>
        <span>Made: ${formatDate(p.date_made)}</span>
        <span>Resolves: ${formatDate(p.resolution_date)}</span>
        <span class="prediction-result result-${p.result}">${p.result}</span>
      </div>
    </div>
  `).join('') + `</div>`;
  return `<section id="predictions">${html}</section>`;
}

/* ---------- AMA ---------- */
export async function loadAMA() {
  if (!isConfigured()) return;
  const { data } = await supabase.from('ama_questions').select('*').eq('answered', true).order('created_at', { ascending: false });
  cache.ama = data || [];
}
export function renderAMA() {
  const items = cache.ama;
  let html = sectionWrapper('Q&A', 'Ask Me Anything', 'Questions from the community, answered publicly.');
  if (!items.length) {
    html += emptyState('No questions answered yet. Submit one below!');
  } else {
    html += `<div class="ama-grid">` + items.map(a => `
      <div class="ama-card reveal">
        <div class="ama-question">${escapeHtml(a.question)}</div>
        <div class="ama-answer">${escapeHtml(a.answer)}</div>
        <div class="ama-meta"><span>${escapeHtml(a.category)}</span><span>${formatDate(a.created_at)}</span></div>
      </div>
    `).join('') + `</div>`;
  }
  html += `<div class="ama-form reveal">
    <h3 style="margin-bottom:20px;font-size:18px">Ask a Question</h3>
    <form onsubmit="window.app.handleAMASubmit(event)">
      <div class="form-group"><label class="form-label">Your Name</label><input type="text" class="form-input" id="amaName" required></div>
      <div class="form-group"><label class="form-label">Email</label><input type="email" class="form-input" id="amaEmail" required></div>
      <div class="form-group"><label class="form-label">Category</label><select class="form-select" id="amaCategory"><option>Tech</option><option>Business</option><option>Life</option><option>Africa</option><option>Web3</option></select></div>
      <div class="form-group"><label class="form-label">Question</label><textarea class="form-textarea" id="amaQuestion" required></textarea></div>
      <button type="submit" class="btn btn-gold">Submit Question</button>
    </form>
  </div>`;
  return `<section id="ama">${html}</section>`;
}

/* ---------- GUESTBOOK ---------- */
export async function loadGuestbook() {
  if (!isConfigured()) return;
  const { data } = await supabase.from('guestbook').select('*').order('created_at', { ascending: false }).limit(50);
  cache.guestbook = data || [];
}
export function renderGuestbook() {
  const entries = cache.guestbook;
  let html = sectionWrapper('Community', 'Guestbook', 'Leave your mark. The retro internet lives on.');
  if (!entries.length) {
    html += emptyState('No entries yet. Be the first to sign!');
  } else {
    html += `<div class="guestbook-grid">` + entries.map(e => `
      <div class="guest-entry reveal">
        <div class="guest-header">
          <span class="guest-name">${escapeHtml(e.name)}</span>
          <span class="guest-date">${formatDate(e.created_at)}</span>
        </div>
        <div class="guest-msg">${escapeHtml(e.message)}</div>
      </div>
    `).join('') + `</div>`;
  }
  html += `<div class="guest-form reveal">
    <h3 style="margin-bottom:20px;font-size:18px">Sign the Guestbook</h3>
    <form onsubmit="window.app.handleGuestbookSubmit(event)">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div class="form-group"><label class="form-label">Name</label><input type="text" class="form-input" id="gbName" required></div>
        <div class="form-group"><label class="form-label">Website (optional)</label><input type="url" class="form-input" id="gbWebsite" placeholder="https://..."></div>
      </div>
      <div class="form-group"><label class="form-label">Message</label><textarea class="form-textarea" id="gbMessage" required></textarea></div>
      <button type="submit" class="btn btn-gold">Sign Guestbook</button>
    </form>
  </div>`;
  return `<section id="guestbook">${html}</section>`;
}

/* ---------- CONTACT ---------- */
export function renderContact() {
  return `<section class="message-sec" id="contact">
    <div class="sec-label">Contact</div>
    <h2 class="sec-title">Get In Touch</h2>
    <p class="sec-desc">Available for collaboration, partnerships, and building the next generation of Web3 products.</p>
    <div class="message-grid">
      <div class="message-card reveal">
        <h3>📧 Email</h3>
        <p>Send a direct message for business inquiries, partnerships, or project discussions. I typically respond within 24 hours.</p>
        <a href="mailto:supremeaalpha@gmail.com" class="message-btn">Send Email</a>
      </div>
      <div class="message-card reveal">
        <h3>💬 WhatsApp</h3>
        <p>Quick conversations, project updates, or urgent inquiries. Available during business hours (WAT).</p>
        <a href="#" onclick="alert('Add your WhatsApp number in the code');return false" class="message-btn">Message on WhatsApp</a>
      </div>
      <div class="message-card reveal">
        <h3>🐙 GitHub</h3>
        <p>Explore open source projects, review code, or contribute to repositories.</p>
        <a href="https://github.com/supremealpha" class="message-btn ghost" target="_blank">View GitHub</a>
      </div>
      <div class="message-card reveal">
        <h3>💼 LinkedIn</h3>
        <p>Professional connections, endorsements, and business networking.</p>
        <a href="https://linkedin.com/in/supremealpha" class="message-btn ghost" target="_blank">Connect on LinkedIn</a>
      </div>
    </div>
  </section>
  <section class="contact-form-sec" id="contact-form">
    <div class="sec-label">Message</div>
    <h2 class="sec-title" style="text-align:center">Send a Message</h2>
    <p class="sec-desc" style="text-align:center;margin:0 auto">Have a project in mind or want to discuss partnership? Drop a message and I will get back to you.</p>
    <div class="contact-form-wrap">
      <form class="contact-form" id="contactForm" onsubmit="window.app.handleContactSubmit(event)">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          <div class="form-group"><label class="form-label">Name</label><input type="text" class="form-input" id="contactName" required></div>
          <div class="form-group"><label class="form-label">Email</label><input type="email" class="form-input" id="contactEmail" required></div>
        </div>
        <div class="form-group"><label class="form-label">Subject</label><input type="text" class="form-input" id="contactSubject"></div>
        <div class="form-group"><label class="form-label">Message</label><textarea class="form-textarea" id="contactMessage" required></textarea></div>
        <button type="submit" class="btn btn-gold" style="width:100%" id="contactSubmitBtn"><span>Send Message</span></button>
        <p class="form-hint" style="text-align:center;margin-top:16px"><span id="contactAuthHint">Sign in to send messages.</span></p>
      </form>
    </div>
  </section>`;
}

/* ---------- COLOPHON ---------- */
export function renderColophon() {
  return `<section id="colophon">
    ${sectionWrapper('Meta', 'Colophon', 'How this site is built, what powers it, and how it evolves.')}
    <div style="max-width:640px;margin:40px auto 0">
      <div class="now-card reveal" style="margin-bottom:24px">
        <div class="now-label">Technology</div>
        <div class="now-value" style="font-size:16px;font-weight:400;color:var(--fg2);line-height:1.8">
          Built with vanilla JavaScript, Vite, and Supabase. Styled with CSS custom properties. No React. No Vue. Just fast, intentional code.
        </div>
      </div>
      <div class="now-card reveal" style="margin-bottom:24px">
        <div class="now-label">Typography</div>
        <div class="now-value" style="font-size:16px;font-weight:400;color:var(--fg2);line-height:1.8">
          System UI stack for body text. Courier New for labels, code, and accents.
        </div>
      </div>
      <div class="now-card reveal" style="margin-bottom:24px">
        <div class="now-label">Version</div>
        <div class="now-value" style="font-size:16px;font-weight:400;color:var(--fg2);line-height:1.8">
          AlphaOS v2.0.0 — August 2026
        </div>
      </div>
      <div class="now-card reveal">
        <div class="now-label">Changelog</div>
        <div class="now-value" style="font-size:16px;font-weight:400;color:var(--fg2);line-height:1.8">
          v2.0 — Complete rebuild with Vite, .env security, and 20+ sections.<br>
          v1.0 — Original single-file portfolio.
        </div>
      </div>
    </div>
  </section>`;
}

/* ---------- ADMIN PANEL ---------- */
export function renderAdmin() {
  return `<section class="admin-sec" id="admin">
    <nav class="admin-nav" id="adminNav">
      <div class="admin-nav-header">
        <a href="#/" class="logo" data-nav>Alpha<span>-Log</span></a>
        <p>Admin Dashboard</p>
      </div>
      <button class="admin-nav-item active" data-tab="overview" onclick="window.app.switchAdminTab('overview')">📊 Overview</button>
      <button class="admin-nav-item" data-tab="messages" onclick="window.app.switchAdminTab('messages')">💬 Messages <span class="badge" id="msgBadge" style="display:none">0</span></button>
      <button class="admin-nav-item" data-tab="projects" onclick="window.app.switchAdminTab('projects')">🚀 Projects</button>
      <button class="admin-nav-item" data-tab="sponsors" onclick="window.app.switchAdminTab('sponsors')">🤝 Sponsor Tiers</button>
      <button class="admin-nav-item" data-tab="milestones" onclick="window.app.switchAdminTab('milestones')">📅 Timeline</button>
      <button class="admin-nav-item" data-tab="graveyard" onclick="window.app.switchAdminTab('graveyard')">✝ Graveyard</button>
      <button class="admin-nav-item" data-tab="skills" onclick="window.app.switchAdminTab('skills')">🎯 Skills</button>
      <button class="admin-nav-item" data-tab="posts" onclick="window.app.switchAdminTab('posts')">✍️ Writings</button>
      <button class="admin-nav-item" data-tab="principles" onclick="window.app.switchAdminTab('principles')">📜 Principles</button>
      <button class="admin-nav-item" data-tab="goals" onclick="window.app.switchAdminTab('goals')">🎯 Goals</button>
      <button class="admin-nav-item" data-tab="ama" onclick="window.app.switchAdminTab('ama')">❓ AMA</button>
      <button class="admin-nav-item" data-tab="guestbook" onclick="window.app.switchAdminTab('guestbook')">📖 Guestbook</button>
      <div class="admin-nav-footer">
        <button class="user-dropdown-item" onclick="window.app.exitAdmin()" style="width:100%">🏠 Back to Site</button>
        <button class="user-dropdown-item" onclick="window.app.signOut()" style="width:100%">🚪 Sign Out</button>
      </div>
    </nav>
    <main class="admin-main" id="adminMain">
      <div class="tab-panel active" id="tab-overview">
        <div class="admin-header"><h1>Dashboard Overview</h1></div>
        <div class="stats-grid">
          <div class="stat-card"><div class="stat-label">Total Messages</div><div class="stat-value" id="statTotalMessages">0</div></div>
          <div class="stat-card"><div class="stat-label">New Messages</div><div class="stat-value" id="statNewMessages">0</div></div>
          <div class="stat-card"><div class="stat-label">Projects</div><div class="stat-value" id="statProjectsLive">0</div></div>
          <div class="stat-card"><div class="stat-label">Sponsor Tiers</div><div class="stat-value" id="statSponsorsActive">0</div></div>
        </div>
        <h3 style="font-size:16px;font-weight:700;margin-bottom:16px;font-family:monospace;text-transform:uppercase;letter-spacing:1px;color:var(--fg3)">Recent Messages</h3>
        <div class="data-table-wrap"><table class="data-table"><thead><tr><th>From</th><th>Subject</th><th>Type</th><th>Status</th><th>Date</th></tr></thead><tbody id="recentMessagesTable"><tr><td colspan="5" style="text-align:center;color:var(--fg3)">Loading...</td></tr></tbody></table></div>
      </div>
      <div class="tab-panel" id="tab-messages"><div class="admin-header"><h1>All Messages</h1></div><div class="data-table-wrap"><table class="data-table"><thead><tr><th>From</th><th>Email</th><th>Subject</th><th>Type</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead><tbody id="allMessagesTable"><tr><td colspan="7" style="text-align:center;color:var(--fg3)">Loading...</td></tr></tbody></table></div></div>
      <div class="tab-panel" id="tab-projects"><div class="admin-header"><h1>Manage Projects</h1><div class="admin-header-actions"><button class="btn btn-gold btn-sm" onclick="window.app.openProjectModal()">+ Add Project</button></div></div><div class="data-table-wrap"><table class="data-table"><thead><tr><th>Name</th><th>Status</th><th>URL</th><th>Tags</th><th>Actions</th></tr></thead><tbody id="adminProjectsTable"><tr><td colspan="5" style="text-align:center;color:var(--fg3)">Loading...</td></tr></tbody></table></div></div>
      <div class="tab-panel" id="tab-sponsors"><div class="admin-header"><h1>Manage Sponsor Tiers</h1><div class="admin-header-actions"><button class="btn btn-gold btn-sm" onclick="window.app.openSponsorTierModal()">+ Add Tier</button></div></div><div class="data-table-wrap"><table class="data-table"><thead><tr><th>Name</th><th>Amount</th><th>Status</th><th>Benefits</th><th>Actions</th></tr></thead><tbody id="adminSponsorsTable"><tr><td colspan="5" style="text-align:center;color:var(--fg3)">Loading...</td></tr></tbody></table></div></div>
      <div class="tab-panel" id="tab-milestones"><div class="admin-header"><h1>Manage Timeline</h1></div><div class="data-table-wrap"><table class="data-table"><thead><tr><th>Date</th><th>Title</th><th>Category</th><th>Highlight</th><th>Actions</th></tr></thead><tbody id="adminMilestonesTable"><tr><td colspan="5" style="text-align:center;color:var(--fg3)">Loading...</td></tr></tbody></table></div></div>
      <div class="tab-panel" id="tab-graveyard"><div class="admin-header"><h1>Manage Graveyard</h1></div><div class="data-table-wrap"><table class="data-table"><thead><tr><th>Year</th><th>Name</th><th>Cause</th><th>Actions</th></tr></thead><tbody id="adminGraveyardTable"><tr><td colspan="4" style="text-align:center;color:var(--fg3)">Loading...</td></tr></tbody></table></div></div>
      <div class="tab-panel" id="tab-skills"><div class="admin-header"><h1>Manage Skills</h1></div><div class="data-table-wrap"><table class="data-table"><thead><tr><th>Name</th><th>Level</th><th>Category</th><th>Years</th><th>Actions</th></tr></thead><tbody id="adminSkillsTable"><tr><td colspan="5" style="text-align:center;color:var(--fg3)">Loading...</td></tr></tbody></table></div></div>
      <div class="tab-panel" id="tab-posts"><div class="admin-header"><h1>Manage Writings</h1></div><div class="data-table-wrap"><table class="data-table"><thead><tr><th>Title</th><th>Slug</th><th>Published</th><th>Featured</th><th>Actions</th></tr></thead><tbody id="adminPostsTable"><tr><td colspan="5" style="text-align:center;color:var(--fg3)">Loading...</td></tr></tbody></table></div></div>
      <div class="tab-panel" id="tab-principles"><div class="admin-header"><h1>Manage Principles</h1></div><div class="data-table-wrap"><table class="data-table"><thead><tr><th>Principle</th><th>Category</th><th>Date Adopted</th><th>Actions</th></tr></thead><tbody id="adminPrinciplesTable"><tr><td colspan="4" style="text-align:center;color:var(--fg3)">Loading...</td></tr></tbody></table></div></div>
      <div class="tab-panel" id="tab-goals"><div class="admin-header"><h1>Manage Goals</h1></div><div class="data-table-wrap"><table class="data-table"><thead><tr><th>Title</th><th>Quarter</th><th>Progress</th><th>Status</th><th>Actions</th></tr></thead><tbody id="adminGoalsTable"><tr><td colspan="5" style="text-align:center;color:var(--fg3)">Loading...</td></tr></tbody></table></div></div>
      <div class="tab-panel" id="tab-ama"><div class="admin-header"><h1>Manage AMA</h1></div><div class="data-table-wrap"><table class="data-table"><thead><tr><th>Question</th><th>Name</th><th>Category</th><th>Answered</th><th>Actions</th></tr></thead><tbody id="adminAMATable"><tr><td colspan="5" style="text-align:center;color:var(--fg3)">Loading...</td></tr></tbody></table></div></div>
      <div class="tab-panel" id="tab-guestbook"><div class="admin-header"><h1>Manage Guestbook</h1></div><div class="data-table-wrap"><table class="data-table"><thead><tr><th>Name</th><th>Message</th><th>Date</th><th>Actions</th></tr></thead><tbody id="adminGuestbookTable"><tr><td colspan="4" style="text-align:center;color:var(--fg3)">Loading...</td></tr></tbody></table></div></div>
    </main>
  </section>`;
}

export { cache };
