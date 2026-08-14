// ============================================
// SUPREMEALPHA OS — MAIN ENTRY
// ============================================
import { initSupabase, supabase, isConfigured } from './supabase.js';
import { showToast, openModal, closeModal, setupTagInput, renderTags, setupPWA, registerSW } from './components.js';
import { escapeHtml, formatDate, initTheme, initScrollHeader, setupReveal } from './utils.js';
import {
  cache, renderHero, renderAbout, renderSkills, loadSkills, renderWork, loadProjects,
  renderTimeline, loadMilestones, renderGraveyard, loadGraveyard, renderSponsors, loadSponsors,
  renderPhilosophy, renderWritings, loadPosts, renderPostDetail, renderGarden, loadNotes,
  renderTIL, loadTIL, renderPrinciples, loadPrinciples, renderReading, loadReading,
  renderLinks, loadLinks, renderMedia, loadMedia, renderNow, renderTravel, loadTravel,
  renderGoals, loadGoals, renderPredictions, loadPredictions, renderAMA, loadAMA,
  renderGuestbook, loadGuestbook, renderContact, renderColophon, renderAdmin
} from './sections.js';

// State
let currentUser = null;
let isAdmin = false;
let projectTags = [];
let sponsorBenefits = [];
let currentRoute = '';

// ============================================
// ROUTER
// ============================================
const routes = {
  '/': async () => renderHome(),
  '/work': async () => { await loadProjects(); return renderWork(); },
  '/about': () => renderAbout(),
  '/skills': async () => { await loadSkills(); return renderSkills(); },
  '/timeline': async () => { await loadMilestones(); return renderTimeline(); },
  '/graveyard': async () => { await loadGraveyard(); return renderGraveyard(); },
  '/sponsors': async () => { await loadSponsors(); return renderSponsors(); },
  '/philosophy': () => renderPhilosophy(),
  '/writings': async () => { await loadPosts(); return renderWritings(); },
  '/garden': async () => { await loadNotes(); return renderGarden(); },
  '/til': async () => { await loadTIL(); return renderTIL(); },
  '/principles': async () => { await loadPrinciples(); return renderPrinciples(); },
  '/reading': async () => { await loadReading(); return renderReading(); },
  '/links': async () => { await loadLinks(); return renderLinks(); },
  '/media': async () => { await loadMedia(); return renderMedia(); },
  '/now': () => renderNow(),
  '/travel': async () => { await loadTravel(); return renderTravel(); },
  '/goals': async () => { await loadGoals(); return renderGoals(); },
  '/predictions': async () => { await loadPredictions(); return renderPredictions(); },
  '/ama': async () => { await loadAMA(); return renderAMA(); },
  '/guestbook': async () => { await loadGuestbook(); return renderGuestbook(); },
  '/contact': () => renderContact(),
  '/colophon': () => renderColophon(),
  '/admin': () => { if (!isAdmin) { showToast('Access Denied', 'Admin only.', 'error'); location.hash = '#/'; return ''; } return renderAdmin(); }
};

async function renderHome() {
  await loadProjects();
  return renderHero() + renderAbout() + renderWork() + renderSponsors() + renderPhilosophy() + renderContact();
}

async function handleRoute() {
  const hash = location.hash.replace('#', '') || '/';
  const [path, ...rest] = hash.split('/').filter(Boolean);
  const fullPath = '/' + (path || '');
  const slug = rest[0];
  currentRoute = fullPath;

  // Admin mode
  if (fullPath === '/admin') {
    document.getElementById('app').innerHTML = '';
    document.getElementById('siteFooter').style.display = 'none';
    document.getElementById('floatNav').style.display = 'none';
    document.getElementById('header').style.display = 'none';
    document.body.insertAdjacentHTML('beforeend', renderAdmin());
    document.getElementById('admin').classList.add('active');
    loadAdminData();
    window.scrollTo(0, 0);
    return;
  }

  // Exit admin if leaving
  const adminEl = document.getElementById('admin');
  if (adminEl) {
    adminEl.remove();
    document.getElementById('siteFooter').style.display = '';
    document.getElementById('floatNav').style.display = '';
    document.getElementById('header').style.display = 'flex';
  }

  // Writings detail
  if (path === 'writings' && slug) {
    await loadPosts();
    document.getElementById('app').innerHTML = renderPostDetail(slug);
    setupReveal();
    window.scrollTo(0, 0);
    return;
  }

  const renderer = routes[fullPath] || routes['/'];
  const html = await renderer();
  document.getElementById('app').innerHTML = html;
  setupReveal();
  attachNavListeners();
  window.scrollTo(0, 0);

  // Update float nav
  document.querySelectorAll('.float-btn').forEach(btn => {
    const href = btn.getAttribute('href');
    btn.classList.toggle('active', href === '#' + fullPath);
  });
}

function attachNavListeners() {
  document.querySelectorAll('a[data-nav]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href && href.startsWith('#/')) {
        e.preventDefault();
        location.hash = href;
      }
    });
  });
}

// ============================================
// AUTH
// ============================================
export function openAuth(type) {
  openModal('authModal');
  switchAuthTab(type);
}
export function closeAuth() {
  closeModal('authModal');
  document.getElementById('loginError').style.display = 'none';
  document.getElementById('signupError').style.display = 'none';
}
export function switchAuthTab(type) {
  document.querySelectorAll('#authModal .tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab' + (type === 'login' ? 'Login' : 'Signup')).classList.add('active');
  document.getElementById('loginForm').style.display = type === 'login' ? 'block' : 'none';
  document.getElementById('signupForm').style.display = type === 'signup' ? 'block' : 'none';
  document.getElementById('authModalTitle').textContent = type === 'login' ? 'Sign In' : 'Create Account';
}

export async function handleLogin(e) {
  e.preventDefault();
  if (!isConfigured()) { showToast('Error', 'Backend not configured. Check .env file.', 'error'); return; }
  const btn = document.getElementById('loginBtn');
  btn.innerHTML = '<div class="spinner"></div>'; btn.disabled = true;
  const { error } = await supabase.auth.signInWithPassword({
    email: document.getElementById('loginEmail').value.trim(),
    password: document.getElementById('loginPassword').value
  });
  btn.innerHTML = '<span>Sign In</span>'; btn.disabled = false;
  if (error) { document.getElementById('loginError').textContent = error.message; document.getElementById('loginError').style.display = 'block'; return; }
  closeAuth(); await loadUser(); showToast('Welcome back!', 'Signed in successfully.', 'success');
}

export async function handleSignup(e) {
  e.preventDefault();
  if (!isConfigured()) { showToast('Error', 'Backend not configured. Check .env file.', 'error'); return; }
  const btn = document.getElementById('signupBtn');
  btn.innerHTML = '<div class="spinner"></div>'; btn.disabled = true;
  const { error } = await supabase.auth.signUp({
    email: document.getElementById('signupEmail').value.trim(),
    password: document.getElementById('signupPassword').value,
    options: { data: { full_name: document.getElementById('signupName').value.trim() } }
  });
  btn.innerHTML = '<span>Create Account</span>'; btn.disabled = false;
  if (error) { document.getElementById('signupError').textContent = error.message; document.getElementById('signupError').style.display = 'block'; return; }
  closeAuth(); showToast('Account created!', 'Welcome to AlphaOS.', 'success'); await loadUser();
}

export async function signOut() {
  if (!isConfigured()) return;
  await supabase.auth.signOut();
  currentUser = null; isAdmin = false;
  updateAuthUI();
  showToast('Signed out', 'See you soon.', 'info');
  if (location.hash === '#/admin') location.hash = '#/';
}

export async function loadUser() {
  if (!isConfigured()) return;
  const { data: { user } } = await supabase.auth.getUser();
  currentUser = user;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('is_admin, full_name').eq('id', user.id).single();
    isAdmin = profile?.is_admin || false;
    const contactName = document.getElementById('contactName');
    const contactEmail = document.getElementById('contactEmail');
    if (contactName) contactName.value = profile?.full_name || user.user_metadata?.full_name || '';
    if (contactEmail) contactEmail.value = user.email || '';
  }
  updateAuthUI();
}

function updateAuthUI() {
  const authSection = document.getElementById('authSection');
  const userMenu = document.getElementById('userMenu');
  const adminNavItem = document.getElementById('adminNavItem');
  const contactAuthHint = document.getElementById('contactAuthHint');
  if (currentUser) {
    if (authSection) authSection.style.display = 'none';
    if (userMenu) userMenu.style.display = 'block';
    const name = currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'User';
    const un = document.getElementById('userName');
    const ua = document.getElementById('userAvatar');
    if (un) un.textContent = name;
    if (ua) ua.textContent = name.charAt(0).toUpperCase();
    if (adminNavItem) adminNavItem.style.display = isAdmin ? 'flex' : 'none';
    if (contactAuthHint) contactAuthHint.innerHTML = `Signed in as <strong style="color:var(--gold)">${currentUser.email}</strong>.`;
  } else {
    if (authSection) authSection.style.display = 'flex';
    if (userMenu) userMenu.style.display = 'none';
    if (adminNavItem) adminNavItem.style.display = 'none';
    if (contactAuthHint) contactAuthHint.innerHTML = 'Sign in to send messages. <a href="#" onclick="window.app.openAuth('signup');return false" style="color:var(--gold)">Create account</a>.';
  }
}

// ============================================
// CONTACT & FORMS
// ============================================
export async function handleContactSubmit(e) {
  e.preventDefault();
  if (!isConfigured()) { showToast('Error', 'Backend not configured.', 'error'); return; }
  if (!currentUser) { openAuth('login'); return; }
  const btn = document.getElementById('contactSubmitBtn');
  btn.innerHTML = '<div class="spinner"></div> Sending...'; btn.disabled = true;
  const { error } = await supabase.from('messages').insert([{
    user_id: currentUser.id,
    name: document.getElementById('contactName').value.trim(),
    email: document.getElementById('contactEmail').value.trim(),
    subject: document.getElementById('contactSubject').value.trim(),
    message: document.getElementById('contactMessage').value.trim(),
    type: 'contact', status: 'new'
  }]);
  btn.innerHTML = '<span>Send Message</span>'; btn.disabled = false;
  if (error) { showToast('Error', error.message, 'error'); return; }
  document.getElementById('contactForm').reset();
  document.getElementById('contactName').value = currentUser.user_metadata?.full_name || '';
  document.getElementById('contactEmail').value = currentUser.email || '';
  showToast('Message sent!', 'I will get back to you soon.', 'success');
}

export function openSponsorInquiry(tierId, tierName) {
  if (!currentUser) { openAuth('login'); return; }
  document.getElementById('sponsorTierId').value = tierId;
  document.getElementById('sponsorTierNameDisplay').value = tierName;
  document.getElementById('sponsorName').value = currentUser.user_metadata?.full_name || '';
  document.getElementById('sponsorEmail').value = currentUser.email || '';
  openModal('sponsorModal');
}
export function closeSponsorModal() { closeModal('sponsorModal'); document.getElementById('sponsorForm').reset(); }

export async function handleSponsorSubmit(e) {
  e.preventDefault();
  if (!isConfigured()) { showToast('Error', 'Backend not configured.', 'error'); return; }
  const btn = document.getElementById('sponsorSubmitBtn');
  btn.innerHTML = '<div class="spinner"></div>'; btn.disabled = true;
  const tierId = document.getElementById('sponsorTierId').value;
  const tierName = document.getElementById('sponsorTierNameDisplay').value;
  const { error } = await supabase.from('messages').insert([{
    user_id: currentUser.id,
    name: document.getElementById('sponsorName').value.trim(),
    email: document.getElementById('sponsorEmail').value.trim(),
    subject: 'Sponsor Inquiry: ' + tierName + (document.getElementById('sponsorCompany').value ? ' - ' + document.getElementById('sponsorCompany').value : ''),
    message: document.getElementById('sponsorMessage').value.trim(),
    type: 'sponsor_inquiry', sponsor_tier_id: tierId, status: 'new'
  }]);
  btn.innerHTML = '<span>Submit Inquiry</span>'; btn.disabled = false;
  if (error) { showToast('Error', error.message, 'error'); return; }
  closeSponsorModal();
  showToast('Inquiry sent!', 'Thank you for your interest.', 'success');
}

export async function handleAMASubmit(e) {
  e.preventDefault();
  if (!isConfigured()) { showToast('Error', 'Backend not configured.', 'error'); return; }
  const { error } = await supabase.from('ama_questions').insert([{
    name: document.getElementById('amaName').value.trim(),
    email: document.getElementById('amaEmail').value.trim(),
    category: document.getElementById('amaCategory').value,
    question: document.getElementById('amaQuestion').value.trim(),
    answered: false
  }]);
  if (error) { showToast('Error', error.message, 'error'); return; }
  e.target.reset();
  showToast('Question submitted!', 'It will be reviewed and answered soon.', 'success');
}

export async function handleGuestbookSubmit(e) {
  e.preventDefault();
  if (!isConfigured()) { showToast('Error', 'Backend not configured.', 'error'); return; }
  const { error } = await supabase.from('guestbook').insert([{
    name: document.getElementById('gbName').value.trim(),
    website: document.getElementById('gbWebsite').value.trim() || null,
    message: document.getElementById('gbMessage').value.trim()
  }]);
  if (error) { showToast('Error', error.message, 'error'); return; }
  e.target.reset();
  await loadGuestbook();
  showToast('Signed!', 'Your entry has been added.', 'success');
  handleRoute();
}

// ============================================
// MY MESSAGES
// ============================================
export function openMyMessages() { openModal('messagesModal'); loadMyMessages(); }
export function closeMyMessages() { closeModal('messagesModal'); }

async function loadMyMessages() {
  if (!isConfigured() || !currentUser) return;
  const { data, error } = await supabase.from('messages').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false });
  const list = document.getElementById('myMessagesList');
  if (error || !data?.length) { list.innerHTML = '<div style="padding:40px;text-align:center;color:var(--fg3)">No messages yet.</div>'; return; }
  list.innerHTML = data.map(m => {
    const preview = m.message.substring(0, 150) + (m.message.length > 150 ? '...' : '');
    return `<div style="padding:20px 24px;border-bottom:1px solid var(--border)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <span style="font-weight:700;font-size:14px">${escapeHtml(m.subject || 'No Subject')}</span>
        <span class="status-pill status-${m.status}">${m.status}</span>
      </div>
      <p style="font-size:13px;color:var(--fg2);margin-bottom:8px;line-height:1.6">${escapeHtml(preview)}</p>
      <span style="font-size:11px;color:var(--fg3);font-family:monospace">${formatDate(m.created_at)}</span>
    </div>`;
  }).join('');
}

// ============================================
// ADMIN PANEL
// ============================================
export function goToAdmin() {
  if (!isAdmin) { showToast('Access Denied', 'Admin privileges required.', 'error'); return; }
  location.hash = '#/admin';
}
export function exitAdmin() { location.hash = '#/'; }

export async function switchAdminTab(tab) {
  document.querySelectorAll('.admin-nav-item').forEach(b => b.classList.remove('active'));
  const navItem = document.querySelector(`.admin-nav-item[data-tab="${tab}"]`);
  if (navItem) navItem.classList.add('active');
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById('tab-' + tab);
  if (panel) panel.classList.add('active');
  if (tab === 'messages') await refreshMessages();
  if (tab === 'projects') renderAdminProjects();
  if (tab === 'sponsors') renderAdminSponsors();
  if (tab === 'milestones') renderAdminMilestones();
  if (tab === 'graveyard') renderAdminGraveyard();
  if (tab === 'skills') renderAdminSkills();
  if (tab === 'posts') renderAdminPosts();
  if (tab === 'principles') renderAdminPrinciples();
  if (tab === 'goals') renderAdminGoals();
  if (tab === 'ama') renderAdminAMA();
  if (tab === 'guestbook') renderAdminGuestbook();
  if (tab === 'overview') updateStats();
}

async function loadAdminData() {
  await refreshMessages();
  updateStats();
}

async function refreshMessages() {
  if (!isConfigured()) return;
  const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
  cache.messages = data || [];
  const newCount = cache.messages.filter(m => m.status === 'new').length;
  const badge = document.getElementById('msgBadge');
  if (badge) { badge.textContent = newCount; badge.style.display = newCount > 0 ? 'block' : 'none'; }
  renderMessagesTable();
  updateStats();
}

function renderMessagesTable() {
  const recent = document.getElementById('recentMessagesTable');
  const all = document.getElementById('allMessagesTable');
  if (!recent || !all) return;
  const rows = (msgs, actions) => msgs.map(m => {
    const typeStyle = m.type === 'contact' ? 'background:rgba(96,165,250,.1);color:var(--info);border:1px solid rgba(96,165,250,.2)' : 'background:rgba(201,168,76,.1);color:var(--gold);border:1px solid rgba(201,168,76,.2)';
    let html = `<tr><td><strong>${escapeHtml(m.name)}</strong></td>`;
    if (actions) html += `<td>${escapeHtml(m.email)}</td>`;
    html += `<td>${escapeHtml(m.subject || 'No Subject')}</td>`;
    html += `<td><span class="status-pill" style="${typeStyle};font-size:9px;padding:2px 8px;border-radius:100px">${m.type === 'contact' ? 'Contact' : 'Sponsor'}</span></td>`;
    html += `<td><span class="status-pill status-${m.status}">${m.status}</span></td>`;
    html += `<td style="font-family:monospace;font-size:11px">${formatDate(m.created_at)}</td>`;
    if (actions) html += `<td><div class="table-actions"><button onclick="window.app.viewMessage('${m.id}')" title="View">👁</button><button onclick="window.app.updateMessageStatus('${m.id}', 'read')" title="Mark Read">✓</button><button onclick="window.app.updateMessageStatus('${m.id}', 'replied')" title="Mark Replied">↩</button><button onclick="window.app.deleteMessage('${m.id}')" title="Delete" style="color:var(--error)">🗑</button></div></td>`;
    html += `</tr>`;
    return html;
  }).join('');
  recent.innerHTML = cache.messages.slice(0, 5).length ? rows(cache.messages.slice(0, 5), false) : '<tr><td colspan="5" style="text-align:center;color:var(--fg3)">No messages</td></tr>';
  all.innerHTML = cache.messages.length ? rows(cache.messages, true) : '<tr><td colspan="7" style="text-align:center;color:var(--fg3)">No messages</td></tr>';
}

export async function viewMessage(id) {
  const msg = cache.messages.find(m => m.id === id); if (!msg) return;
  const body = document.getElementById('messageDetailBody');
  body.innerHTML = `<div style="margin-bottom:20px"><div style="font-size:11px;color:var(--fg3);text-transform:uppercase;letter-spacing:1.5px;font-family:monospace;margin-bottom:4px">From</div><div style="font-weight:700">${escapeHtml(msg.name)}</div><div style="color:var(--gold);font-size:13px">${escapeHtml(msg.email)}</div></div>
    <div style="margin-bottom:20px"><div style="font-size:11px;color:var(--fg3);text-transform:uppercase;letter-spacing:1.5px;font-family:monospace;margin-bottom:4px">Subject</div><div>${escapeHtml(msg.subject || 'No Subject')}</div></div>
    <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:20px;margin-bottom:20px"><div style="font-size:11px;color:var(--fg3);text-transform:uppercase;letter-spacing:1.5px;font-family:monospace;margin-bottom:8px">Message</div><p style="white-space:pre-wrap;line-height:1.7">${escapeHtml(msg.message)}</p></div>
    <div style="font-size:11px;color:var(--fg3);font-family:monospace">Received: ${formatDate(msg.created_at)}</div>`;
  openModal('messageDetailModal');
  if (msg.status === 'new') await updateMessageStatus(id, 'read');
}
export function closeMessageDetail() { closeModal('messageDetailModal'); }
export async function updateMessageStatus(id, status) { if (!isConfigured()) return; await supabase.from('messages').update({ status }).eq('id', id); await refreshMessages(); }
export async function deleteMessage(id) { if (!confirm('Delete?')) return; if (!isConfigured()) return; await supabase.from('messages').delete().eq('id', id); await refreshMessages(); showToast('Deleted', 'Message removed.', 'success'); }

function updateStats() {
  const tm = document.getElementById('statTotalMessages');
  const nm = document.getElementById('statNewMessages');
  const pl = document.getElementById('statProjectsLive');
  const sa = document.getElementById('statSponsorsActive');
  if (tm) tm.textContent = (cache.messages || []).length;
  if (nm) nm.textContent = (cache.messages || []).filter(m => m.status === 'new').length;
  if (pl) pl.textContent = (cache.projects || []).length;
  if (sa) sa.textContent = (cache.sponsors || []).filter(s => s.status === 'active').length;
}

// Admin Projects
function renderAdminProjects() {
  const tbody = document.getElementById('adminProjectsTable');
  if (!tbody) return;
  if (!cache.projects.length) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--fg3)">No projects</td></tr>'; return; }
  tbody.innerHTML = cache.projects.map(p => {
    const tags = (p.tags || []).map(t => `<span style="font-size:10px;padding:2px 8px;background:var(--bg);border:1px solid var(--border);border-radius:3px;margin-right:4px">${t}</span>`).join('');
    return `<tr><td><strong>${escapeHtml(p.name)}</strong></td><td><span class="status-pill ${p.status === 'live' ? 'status-live' : 'status-soon'}" style="font-size:9px;padding:2px 8px;border-radius:3px">${p.status}</span></td><td style="font-family:monospace;font-size:11px">${p.url ? `<a href="${p.url}" target="_blank" style="color:var(--gold)">Link</a>` : '-'}</td><td>${tags}</td><td><div class="table-actions"><button onclick="window.app.editProject('${p.id}')" title="Edit">✏</button><button onclick="window.app.deleteProject('${p.id}')" title="Delete" style="color:var(--error)">🗑</button></div></td></tr>`;
  }).join('');
}

export function openProjectModal(id) {
  projectTags = [];
  document.getElementById('projectForm').reset();
  document.getElementById('projectId').value = '';
  document.getElementById('projectModalTitle').textContent = 'Add Project';
  document.getElementById('projectTagsWrap').innerHTML = '<input type="text" class="tag-input" id="projectTagInput" placeholder="Add tag...">';
  setupTagInput('projectTagInput', 'projectTagsWrap', projectTags);
  if (id) {
    const p = cache.projects.find(x => x.id === id);
    if (p) {
      document.getElementById('projectId').value = p.id;
      document.getElementById('projectName').value = p.name;
      document.getElementById('projectDesc').value = p.description;
      document.getElementById('projectStatus').value = p.status;
      document.getElementById('projectUrl').value = p.url || '';
      document.getElementById('projectLogo').value = p.logo_url || '';
      document.getElementById('projectSort').value = p.sort_order || 0;
      projectTags = [...(p.tags || [])];
      renderTags('projectTagsWrap', 'projectTagInput', projectTags);
      document.getElementById('projectModalTitle').textContent = 'Edit Project';
    }
  }
  openModal('projectModal');
}
export function closeProjectModal() { closeModal('projectModal'); }
export function editProject(id) { openProjectModal(id); }

export async function handleProjectSubmit(e) {
  e.preventDefault(); if (!isConfigured()) return;
  const btn = document.getElementById('projectSubmitBtn'); btn.innerHTML = '<div class="spinner"></div>'; btn.disabled = true;
  const id = document.getElementById('projectId').value;
  const data = {
    name: document.getElementById('projectName').value.trim(),
    description: document.getElementById('projectDesc').value.trim(),
    status: document.getElementById('projectStatus').value,
    url: document.getElementById('projectUrl').value.trim() || null,
    logo_url: document.getElementById('projectLogo').value.trim() || null,
    tags: projectTags,
    sort_order: parseInt(document.getElementById('projectSort').value) || 0
  };
  let error;
  if (id) { const { error: e } = await supabase.from('projects').update(data).eq('id', id); error = e; }
  else { const { error: e } = await supabase.from('projects').insert([data]); error = e; }
  btn.innerHTML = 'Save'; btn.disabled = false;
  if (error) { showToast('Error', error.message, 'error'); return; }
  closeProjectModal(); await loadProjects(); renderAdminProjects(); updateStats();
  showToast('Success', id ? 'Updated' : 'Created', 'success');
}
export async function deleteProject(id) { if (!confirm('Delete?')) return; if (!isConfigured()) return; await supabase.from('projects').delete().eq('id', id); await loadProjects(); renderAdminProjects(); updateStats(); showToast('Deleted', 'Project removed.', 'success'); }

// Admin Sponsors
function renderAdminSponsors() {
  const tbody = document.getElementById('adminSponsorsTable');
  if (!tbody) return;
  if (!cache.sponsors.length) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--fg3)">No tiers</td></tr>'; return; }
  tbody.innerHTML = cache.sponsors.map(s => {
    const benefits = (s.benefits || []).map(b => `<span style="font-size:10px;padding:2px 8px;background:var(--bg);border:1px solid var(--border);border-radius:3px;margin-right:4px">${b}</span>`).join('');
    return `<tr><td><strong>${escapeHtml(s.name)}</strong></td><td style="color:var(--gold);font-weight:700">${s.amount}</td><td><span class="status-pill ${s.status === 'active' ? 'status-live' : 'status-soon'}" style="font-size:9px;padding:2px 8px;border-radius:3px">${s.status}</span></td><td>${benefits}</td><td><div class="table-actions"><button onclick="window.app.editSponsorTier('${s.id}')" title="Edit">✏</button><button onclick="window.app.deleteSponsorTier('${s.id}')" title="Delete" style="color:var(--error)">🗑</button></div></td></tr>`;
  }).join('');
}

export function openSponsorTierModal(id) {
  sponsorBenefits = [];
  document.getElementById('sponsorTierForm').reset();
  document.getElementById('sponsorTierId').value = '';
  document.getElementById('sponsorTierModalTitle').textContent = 'Add Sponsor Tier';
  document.getElementById('sponsorBenefitsWrap').innerHTML = '<input type="text" class="tag-input" id="sponsorBenefitInput" placeholder="Add benefit...">';
  setupTagInput('sponsorBenefitInput', 'sponsorBenefitsWrap', sponsorBenefits);
  if (id) {
    const s = cache.sponsors.find(x => x.id === id);
    if (s) {
      document.getElementById('sponsorTierId').value = s.id;
      document.getElementById('sponsorTierNameInput').value = s.name;
      document.getElementById('sponsorTierDesc').value = s.description;
      document.getElementById('sponsorTierAmount').value = s.amount;
      document.getElementById('sponsorTierStatus').value = s.status;
      document.getElementById('sponsorTierSort').value = s.sort_order || 0;
      sponsorBenefits = [...(s.benefits || [])];
      renderTags('sponsorBenefitsWrap', 'sponsorBenefitInput', sponsorBenefits);
      document.getElementById('sponsorTierModalTitle').textContent = 'Edit Sponsor Tier';
    }
  }
  openModal('sponsorTierModal');
}
export function closeSponsorTierModal() { closeModal('sponsorTierModal'); }
export function editSponsorTier(id) { openSponsorTierModal(id); }

export async function handleSponsorTierSubmit(e) {
  e.preventDefault(); if (!isConfigured()) return;
  const btn = document.getElementById('sponsorTierSubmitBtn'); btn.innerHTML = '<div class="spinner"></div>'; btn.disabled = true;
  const id = document.getElementById('sponsorTierId').value;
  const data = {
    name: document.getElementById('sponsorTierNameInput').value.trim(),
    description: document.getElementById('sponsorTierDesc').value.trim(),
    amount: document.getElementById('sponsorTierAmount').value.trim(),
    status: document.getElementById('sponsorTierStatus').value,
    benefits: sponsorBenefits,
    sort_order: parseInt(document.getElementById('sponsorTierSort').value) || 0
  };
  let error;
  if (id) { const { error: e } = await supabase.from('sponsor_tiers').update(data).eq('id', id); error = e; }
  else { const { error: e } = await supabase.from('sponsor_tiers').insert([data]); error = e; }
  btn.innerHTML = 'Save'; btn.disabled = false;
  if (error) { showToast('Error', error.message, 'error'); return; }
  closeSponsorTierModal(); await loadSponsors(); renderAdminSponsors(); updateStats();
  showToast('Success', id ? 'Updated' : 'Created', 'success');
}
export async function deleteSponsorTier(id) { if (!confirm('Delete?')) return; if (!isConfigured()) return; await supabase.from('sponsor_tiers').delete().eq('id', id); await loadSponsors(); renderAdminSponsors(); updateStats(); showToast('Deleted', 'Tier removed.', 'success'); }

// Admin Milestones
function renderAdminMilestones() {
  const tbody = document.getElementById('adminMilestonesTable');
  if (!tbody) return;
  if (!cache.milestones.length) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--fg3)">No milestones</td></tr>'; return; }
  tbody.innerHTML = cache.milestones.map(m => `<tr><td style="font-family:monospace;font-size:11px">${formatDate(m.date)}</td><td><strong>${escapeHtml(m.title)}</strong></td><td>${escapeHtml(m.category)}</td><td>${m.highlight ? '✓' : ''}</td><td><div class="table-actions"><button onclick="window.app.deleteMilestone('${m.id}')" style="color:var(--error)">🗑</button></div></td></tr>`).join('');
}
export async function deleteMilestone(id) { if (!confirm('Delete?')) return; if (!isConfigured()) return; await supabase.from('milestones').delete().eq('id', id); await loadMilestones(); renderAdminMilestones(); }

// Admin Graveyard
function renderAdminGraveyard() {
  const tbody = document.getElementById('adminGraveyardTable');
  if (!tbody) return;
  if (!cache.graveyard.length) { tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--fg3)">No entries</td></tr>'; return; }
  tbody.innerHTML = cache.graveyard.map(g => `<tr><td style="font-family:monospace">${g.year}</td><td><strong>${escapeHtml(g.name)}</strong></td><td>${escapeHtml(g.why_it_died)}</td><td><div class="table-actions"><button onclick="window.app.deleteGrave('${g.id}')" style="color:var(--error)">🗑</button></div></td></tr>`).join('');
}
export async function deleteGrave(id) { if (!confirm('Delete?')) return; if (!isConfigured()) return; await supabase.from('graveyard').delete().eq('id', id); await loadGraveyard(); renderAdminGraveyard(); }

// Admin Skills
function renderAdminSkills() {
  const tbody = document.getElementById('adminSkillsTable');
  if (!tbody) return;
  if (!cache.skills.length) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--fg3)">No skills</td></tr>'; return; }
  tbody.innerHTML = cache.skills.map(s => `<tr><td><strong>${escapeHtml(s.name)}</strong></td><td>${s.level}/10</td><td>${escapeHtml(s.category)}</td><td>${s.years_exp || 0}</td><td><div class="table-actions"><button onclick="window.app.deleteSkill('${s.id}')" style="color:var(--error)">🗑</button></div></td></tr>`).join('');
}
export async function deleteSkill(id) { if (!confirm('Delete?')) return; if (!isConfigured()) return; await supabase.from('skills').delete().eq('id', id); await loadSkills(); renderAdminSkills(); }

// Admin Posts
function renderAdminPosts() {
  const tbody = document.getElementById('adminPostsTable');
  if (!tbody) return;
  if (!cache.posts.length) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--fg3)">No posts</td></tr>'; return; }
  tbody.innerHTML = cache.posts.map(p => `<tr><td><strong>${escapeHtml(p.title)}</strong></td><td style="font-family:monospace;font-size:11px">${p.slug}</td><td>${p.published ? '✓' : ''}</td><td>${p.featured ? '✓' : ''}</td><td><div class="table-actions"><button onclick="window.app.deletePost('${p.id}')" style="color:var(--error)">🗑</button></div></td></tr>`).join('');
}
export async function deletePost(id) { if (!confirm('Delete?')) return; if (!isConfigured()) return; await supabase.from('posts').delete().eq('id', id); await loadPosts(); renderAdminPosts(); }

// Admin Principles
function renderAdminPrinciples() {
  const tbody = document.getElementById('adminPrinciplesTable');
  if (!tbody) return;
  if (!cache.principles.length) { tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--fg3)">No principles</td></tr>'; return; }
  tbody.innerHTML = cache.principles.map(p => `<tr><td>${escapeHtml(p.text)}</td><td>${escapeHtml(p.category)}</td><td style="font-family:monospace;font-size:11px">${formatDate(p.date_adopted)}</td><td><div class="table-actions"><button onclick="window.app.deletePrinciple('${p.id}')" style="color:var(--error)">🗑</button></div></td></tr>`).join('');
}
export async function deletePrinciple(id) { if (!confirm('Delete?')) return; if (!isConfigured()) return; await supabase.from('principles').delete().eq('id', id); await loadPrinciples(); renderAdminPrinciples(); }

// Admin Goals
function renderAdminGoals() {
  const tbody = document.getElementById('adminGoalsTable');
  if (!tbody) return;
  if (!cache.goals.length) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--fg3)">No goals</td></tr>'; return; }
  tbody.innerHTML = cache.goals.map(g => `<tr><td><strong>${escapeHtml(g.title)}</strong></td><td style="font-family:monospace">${g.quarter} ${g.year}</td><td>${g.current}/${g.target}</td><td><span class="status-pill ${g.status === 'completed' ? 'status-live' : g.status === 'at_risk' ? 'status-soon' : 'status-new'}" style="font-size:9px;padding:2px 8px;border-radius:3px">${g.status}</span></td><td><div class="table-actions"><button onclick="window.app.deleteGoal('${g.id}')" style="color:var(--error)">🗑</button></div></td></tr>`).join('');
}
export async function deleteGoal(id) { if (!confirm('Delete?')) return; if (!isConfigured()) return; await supabase.from('goals').delete().eq('id', id); await loadGoals(); renderAdminGoals(); }

// Admin AMA
function renderAdminAMA() {
  const tbody = document.getElementById('adminAMATable');
  if (!tbody) return;
  if (!cache.ama.length) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--fg3)">No questions</td></tr>'; return; }
  tbody.innerHTML = cache.ama.map(a => `<tr><td>${escapeHtml(a.question)}</td><td>${escapeHtml(a.name)}</td><td>${escapeHtml(a.category)}</td><td>${a.answered ? '✓' : ''}</td><td><div class="table-actions"><button onclick="window.app.deleteAMA('${a.id}')" style="color:var(--error)">🗑</button></div></td></tr>`).join('');
}
export async function deleteAMA(id) { if (!confirm('Delete?')) return; if (!isConfigured()) return; await supabase.from('ama_questions').delete().eq('id', id); await loadAMA(); renderAdminAMA(); }

// Admin Guestbook
function renderAdminGuestbook() {
  const tbody = document.getElementById('adminGuestbookTable');
  if (!tbody) return;
  if (!cache.guestbook.length) { tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--fg3)">No entries</td></tr>'; return; }
  tbody.innerHTML = cache.guestbook.map(g => `<tr><td><strong>${escapeHtml(g.name)}</strong></td><td>${escapeHtml(g.message)}</td><td style="font-family:monospace;font-size:11px">${formatDate(g.created_at)}</td><td><div class="table-actions"><button onclick="window.app.deleteGB('${g.id}')" style="color:var(--error)">🗑</button></div></td></tr>`).join('');
}
export async function deleteGB(id) { if (!confirm('Delete?')) return; if (!isConfigured()) return; await supabase.from('guestbook').delete().eq('id', id); await loadGuestbook(); renderAdminGuestbook(); }

// Tag removal helper
export function removeTag(wrapId, inputId, index) {
  if (wrapId === 'projectTagsWrap') { projectTags.splice(index, 1); renderTags(wrapId, inputId, projectTags); }
  else { sponsorBenefits.splice(index, 1); renderTags(wrapId, inputId, sponsorBenefits); }
}

// Mobile menu
export function toggleMobileMenu() {
  document.getElementById('mobileMenu').classList.toggle('active');
}

// ============================================
// INIT
// ============================================
async function init() {
  initSupabase();
  initTheme();
  initScrollHeader();
  setupPWA();
  registerSW();

  window.addEventListener('hashchange', handleRoute);
  await loadUser();
  await handleRoute();

  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('active'); });
  });

  // Hide loader
  setTimeout(() => {
    const loader = document.getElementById('pageLoader');
    if (loader) loader.classList.add('hidden');
  }, 600);

  if (!isConfigured()) {
    showToast('Configuration Needed', 'Create .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY', 'warning');
  }

  // Auth state listener
  if (isConfigured()) {
    supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') await loadUser();
      else if (event === 'SIGNED_OUT') { currentUser = null; isAdmin = false; updateAuthUI(); }
    });
  }
}

init();

// Expose to window for inline onclick handlers
window.app = {
  openAuth, closeAuth, switchAuthTab, handleLogin, handleSignup, signOut,
  openMyMessages, closeMyMessages, goToAdmin, exitAdmin, switchAdminTab,
  openSponsorInquiry, closeSponsorModal, handleSponsorSubmit,
  handleContactSubmit, handleAMASubmit, handleGuestbookSubmit,
  viewMessage, closeMessageDetail, updateMessageStatus, deleteMessage,
  openProjectModal, closeProjectModal, editProject, handleProjectSubmit, deleteProject,
  openSponsorTierModal, closeSponsorTierModal, editSponsorTier, handleSponsorTierSubmit, deleteSponsorTier,
  deleteMilestone, deleteGrave, deleteSkill, deletePost, deletePrinciple, deleteGoal, deleteAMA, deleteGB,
  removeTag, toggleMobileMenu
};
