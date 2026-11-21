/*
 * Yantrika Admin Dashboard (UI + Supabase + Interactive Export, Plans, Projects & Calendar).
 * Loaded on every page; renders only at #/admin.
 * Access control is enforced by Supabase RLS and database functions
 * (supabase/admin_dashboard.sql). Hiding this page is NOT security.
 */
(function () {
  'use strict';

  const APPS = 'membership_applications';
  const MEMBERS = 'members';
  const GROUPS = 'member_groups';
  const POSITIONS = 'member_positions';
  const ACTIVITY = 'admin_activity';
  const TASKS = 'admin_tasks';
  const PLANS_TABLE = 'admin_plans';
  const PROJECTS_TABLE = 'admin_projects';
  const LS_PLANS = 'yantrika_admin_plans_v1';
  const LS_PROJECTS = 'yantrika_admin_projects_v1';

  const NAV_GROUPS = [
    {
      label: 'Workspace',
      items: [
        ['overview', 'Dashboard Overview'],
        ['calendar', 'Plans Calendar']
      ]
    },
    {
      label: 'People & Org',
      items: [
        ['members', 'All Members'],
        ['structure', 'Groups & Positions'],
        ['pending', 'Pending Applications'],
        ['approved', 'Approved Applications'],
        ['rejected', 'Rejected Applications']
      ]
    },
    {
      label: 'Planning & Ops',
      items: [
        ['plans', 'Club Plans'],
        ['projects', 'Projects Planned'],
        ['tasks', 'Tasks']
      ]
    },
    {
      label: 'Comms & Tools',
      items: [
        ['email', 'Send Email'],
        ['export', 'Export Data'],
        ['activity', 'Activity Log'],
        ['admins', 'Admin Users']
      ]
    }
  ];
  const VIEWS = NAV_GROUPS.reduce((acc, g) => acc.concat(g.items), []);

  const MEMBER_FIELDS = [
    ['full_name', 'Full name', true],
    ['email', 'Email'],
    ['phone', 'Phone'],
    ['institution', 'Institution'],
    ['department', 'Department'],
    ['affiliation', 'Affiliation', true],
    ['academic_year', 'Academic year'],
    ['current_body', 'Current body'],
    ['current_designation', 'Current designation'],
    ['linkedin_url', 'LinkedIn URL'],
    ['photo_url', 'Photo URL'],
    ['status', 'Status', true]
  ];
  const APP_DETAIL = [
    ['Name', 'full_name'], ['Email', 'email'], ['Phone', 'phone'], ['Institution', 'institution'],
    ['Department', 'department'], ['Programme', 'programme'], ['Academic year', 'academic_year'],
    ['Applicant type', 'applicant_type'], ['Role applied', 'role'], ['Interest', 'interest'],
    ['Interests', 'interests'], ['Experience', 'experience'], ['Experience level', 'experience_level'],
    ['Message', 'message'], ['LinkedIn', 'linkedin_url'], ['Legal consent', 'legal_consent'],
    ['Consent given at', 'legal_consent_at'], ['Status', 'status'], ['Applied on', 'created_at'],
    ['Reviewed on', 'reviewed_at']
  ];

  const PLAN_CATS = ['Workshop', 'Hackathon', 'Outreach', 'Talk', 'Operations', 'Funding', 'Competition', 'Other'];
  const PLAN_STATUSES = ['draft', 'planned', 'active', 'completed', 'on_hold'];
  const PROJ_STATUSES = ['idea', 'planned', 'in_progress', 'testing', 'completed', 'on_hold'];

  const EMAIL_TEMPLATES = [
    {
      id: 'workshop',
      name: 'Workshop Reminder',
      subject: 'Reminder: Yantrika Hands-on Robotics Workshop',
      body: 'Hello everyone,\n\nThis is a reminder for our upcoming Yantrika Robotics & Coding Club workshop.\n\nDate: [Date]\nTime: [Time]\nVenue: [Venue, IACS Kolkata]\n\nPlease bring your laptop if you have one. Looking forward to seeing you there!\n\nBest regards,\nTeam Yantrika'
    },
    {
      id: 'project',
      name: 'Project Kickoff',
      subject: 'Yantrika Project Kickoff & Team Allocation',
      body: 'Hi team,\n\nWe are kicking off our next robotics/coding project cycle! Please review the planned project timeline and join the kickoff sync.\n\nLet us know if you have any questions or component requests.\n\nBest,\nTeam Yantrika'
    },
    {
      id: 'general',
      name: 'General Club Update',
      subject: 'Yantrika Club Update — Upcoming Plans & Events',
      body: 'Hello Yantrika members,\n\nHere is a quick update on our upcoming plans, workshops, and projects for this month.\n\n[Write your update here]\n\nWarm regards,\nTeam Yantrika\nhttps://yantrika.in'
    }
  ];

  const DEFAULT_PLANS = [
    { id: 'plan-outreach-dec26', title: 'Schools Outreach Workshop', category: 'Outreach', status: 'planned', start_date: '2026-12-12', end_date: '2026-12-12', owner: 'PR & Outreach', budget: '₹8,000', description: 'Free hands-on robotics & electronics workshop for ~70 underprivileged students.' },
    { id: 'plan-robothon-jan27', title: 'Robotics Hackathon 2027', category: 'Hackathon', status: 'planned', start_date: '2027-01-23', end_date: '2027-01-24', owner: 'Core Committee', budget: '₹25,000', description: 'Hardware and software challenge for 100+ participants.' },
    { id: 'plan-gametheory-feb27', title: 'Game Theory Hackathon', category: 'Hackathon', status: 'draft', start_date: '2027-02-14', end_date: '2027-02-15', owner: 'Core Committee', budget: '₹12,000', description: 'Strategy, logic, and multi-agent simulation challenges.' },
    { id: 'plan-ai-mar27', title: 'AI & Robotics Workshop', category: 'Workshop', status: 'draft', start_date: '2027-03-20', end_date: '2027-03-20', owner: 'Technical Team', budget: '₹10,000', description: 'Applied computer vision and embedded AI session.' }
  ];

  const DEFAULT_PROJECTS = [
    { id: 'proj-rover', title: 'Autonomous Obstacle-Avoiding Rover', plan_id: 'plan-outreach-dec26', lead: 'Robotics Hardware Team', status: 'in_progress', target_date: '2026-12-10', progress: 65, budget: '₹6,500', repo_url: 'https://github.com/Yantrika-IACS', description: '4WD Arduino/ESP32 rover with ultrasonic array and PID motor control for workshop demos.' },
    { id: 'proj-sumobot', title: 'Mini SumoBot Kit (Open Hardware)', plan_id: 'plan-robothon-jan27', lead: 'Hardware Lab', status: 'planned', target_date: '2027-01-15', progress: 30, budget: '₹9,000', repo_url: 'https://github.com/Yantrika-IACS', description: 'Standardized low-cost SumoBot chassis and IR edge-detection kit for hackathon teams.' },
    { id: 'proj-trust-sim', title: 'Open-Source STEM Arcade & Trust Sim', plan_id: 'plan-gametheory-feb27', lead: 'Software & Web Team', status: 'testing', target_date: '2026-11-30', progress: 85, budget: '₹0', repo_url: 'https://github.com/Yantrika-IACS/Yantrika-IACS.github.io', description: 'Interactive browser simulations for Prisoner’s Dilemma, Maze Finder, and circuit labs.' }
  ];

  const S = {
    apps: [], members: [], groups: [], positions: [], activity: [], admins: [], tasks: [], directory: [],
    plans: [], projects: [], plansCloud: false, projectsCloud: false,
    taskFilter: 'all', planFilter: 'all', projectFilter: 'all',
    view: 'overview', q: '', status: 'all', error: '', notice: '', user: null, role: 'viewer', gq: '',
    quota: null, quotaError: '', emailLog: [], emailMode: 'group', emailSelectedIds: {},
    sort: { col: '', dir: 1 }, selectedRows: {},
    calYear: new Date().getFullYear(), calMonth: new Date().getMonth(), calSelectedDate: '',
    calShow: { plans: true, projects: true, tasks: true, events: true }, calMode: 'month',
    expDataset: 'members', expFilterStatus: 'all', expFilterBody: 'all', expSearch: '', expCols: null
  };

  /* ---------- helpers ---------- */
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const cap = s => s ? String(s).replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase()) : '';
  const pad2 = n => String(n).padStart(2, '0');
  const isoLocal = d => d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  const todayISO = () => isoLocal(new Date());
  /* date-only strings (YYYY-MM-DD) are read as LOCAL dates so they never shift a day */
  const parseD = d => {
    if (!d) return null;
    const s = String(d);
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(s);
  };
  const fmt = d => {
    if (!d) return '—';
    const dt = parseD(d);
    return !dt || isNaN(dt) ? '—' : dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  const svg = (p, s) => '<svg class="ya-ico" width="' + (s || 18) + '" height="' + (s || 18) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
  const ICON = {
    overview: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    members: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    structure: '<rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M12 8v4M5 16v-2a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2"/>',
    pending: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    approved: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    rejected: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
    plans: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
    projects: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/>',
    tasks: '<path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    email: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    export: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    activity: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/>',
    admins: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    bolt: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>'
  };
  const VIEW_DESC = {
    overview: 'Club snapshot: members, applications, plans and what is coming up.',
    calendar: 'Every plan, project milestone and task due date in one place.',
    members: 'Search, edit and manage the full member directory.',
    structure: 'Bodies, groups and the positions inside them.',
    pending: 'New applications waiting for a decision.',
    approved: 'Applications that have been accepted.',
    rejected: 'Applications that were declined. Restore any of them if needed.',
    plans: 'Club-level plans such as workshops, hackathons and outreach.',
    projects: 'Projects being planned or built, linked to the plan they serve.',
    tasks: 'Work assigned to admins, with due dates.',
    email: 'Send announcements to members from the club address.',
    export: 'Download clean CSV, JSON or PDF reports of your data.',
    activity: 'An audit trail of recent changes.',
    admins: 'Who can sign in to this dashboard, and what they can do.'
  };
  const uid = prefix => prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);

  const SUPABASE_URL = 'https://zcszmpxhlflalkgefwff.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_by8T2htgYfnz4qOK9jZ4rA_hu8PUIjK';
  let adminClient = null;
  function sb() {
    if (!adminClient && window.supabase && window.supabase.createClient) {
      adminClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { persistSession: false, detectSessionInUrl: false }
      });
    }
    return adminClient;
  }
  function clearSavedLogins() {
    try {
      Object.keys(localStorage)
        .filter(k => /^sb-.*-auth-token/.test(k))
        .forEach(k => localStorage.removeItem(k));
    } catch (e) { /* storage blocked */ }
  }
  const root = () => document.getElementById('yadmin-root');
  const val = (m, name) => ((m.querySelector('[name="' + name + '"]') || {}).value || '').trim();

  const ROLE_LABEL = { super_admin: 'Super admin', admin: 'Admin', viewer: 'Viewer' };
  const EDIT_ACTS = ['send-announcement', 'send-test-email', 'add-member', 'edit-member', 'member-role', 'save-member', 'approve-open', 'approve-submit',
    'reject', 'restore', 'save-notes', 'add-group', 'edit-group', 'save-group', 'add-position', 'edit-position',
    'save-position', 'save-role', 'new-task', 'save-task', 'new-plan', 'edit-plan', 'save-plan', 'delete-plan',
    'new-project', 'edit-project', 'save-project', 'delete-project'];
  const SUPER_ACTS = ['delete', 'confirm-delete', 'add-admin', 'save-admin', 'remove-admin', 'confirm-remove-admin'];
  const canEdit = () => S.role === 'super_admin' || S.role === 'admin';
  const isSuper = () => S.role === 'super_admin';
  function allowedAct(act) {
    if (EDIT_ACTS.indexOf(act) >= 0) return canEdit();
    if (SUPER_ACTS.indexOf(act) >= 0) return isSuper();
    return true;
  }
  function applyPermissions(scope) {
    scope.querySelectorAll('[data-ya]').forEach(el => {
      if (!allowedAct(el.getAttribute('data-ya'))) el.remove();
    });
    if (!canEdit()) scope.querySelectorAll('textarea[name="admin_notes"]').forEach(t => { t.readOnly = true; });
  }
  const AFFILIATIONS = ['IACS', 'Non-IACS'];
  function affiliationSelect(current) {
    const opts = AFFILIATIONS.slice();
    if (current && opts.indexOf(current) < 0) opts.push(current);
    const sel = current || AFFILIATIONS[0];
    return '<label class="ya-field"><span>Affiliation *</span><select name="affiliation">' +
      opts.map(o => '<option value="' + esc(o) + '"' + (o === sel ? ' selected' : '') + '>' + esc(o) + '</option>').join('') +
      '</select></label>';
  }
  const guessAffiliation = inst => /iacs|indian association for the cultivation/i.test(inst || '') ? 'IACS' : 'Non-IACS';
  const cellVal = v => Array.isArray(v) ? v.join(', ') : (v == null || v === '' ? '—' : v);

  function toast(msg, ok = true) {
    let t = document.getElementById('ya-toast');
    if (!t) { t = document.createElement('div'); t.id = 'ya-toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.className = 'ya-toast ' + (ok ? 'ok' : 'err');
    t.style.display = 'block';
    clearTimeout(t._h);
    t._h = setTimeout(() => { t.style.display = 'none'; }, 4800);
  }
  function openModal(html) {
    closeModal();
    const back = document.createElement('div');
    back.className = 'ya-back';
    back.id = 'ya-back';
    back.innerHTML = '<div class="ya-modal" role="dialog" aria-modal="true">' + html + '</div>';
    applyPermissions(back);
    back.addEventListener('click', e => { if (e.target === back) closeModal(); });
    document.body.appendChild(back);
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    const b = document.getElementById('ya-back');
    if (b) b.remove();
    document.body.style.overflow = '';
  }
  const modalEl = () => document.querySelector('#ya-back .ya-modal');
  const modalMsg = text => { const m = document.getElementById('ya-msg'); if (m) m.textContent = text; };

  /* ---------- localStorage helpers for Plans & Projects fallback ---------- */
  function lsRead(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) { /* ignore */ }
    return fallback.map(x => Object.assign({}, x));
  }
  function lsWrite(key, arr) {
    try { localStorage.setItem(key, JSON.stringify(arr)); } catch (e) { /* ignore */ }
  }

  /* ---------- data loading ---------- */
  async function loadPlansAndProjects() {
    const [plRes, prRes] = await Promise.all([
      sb().from(PLANS_TABLE).select('*').order('start_date', { ascending: true }),
      sb().from(PROJECTS_TABLE).select('*').order('target_date', { ascending: true })
    ]);
    if (!plRes.error && Array.isArray(plRes.data)) {
      S.plansCloud = true;
      S.plans = plRes.data;
    } else {
      S.plansCloud = false;
      S.plans = lsRead(LS_PLANS, DEFAULT_PLANS);
      lsWrite(LS_PLANS, S.plans);
    }
    if (!prRes.error && Array.isArray(prRes.data)) {
      S.projectsCloud = true;
      S.projects = prRes.data;
    } else {
      S.projectsCloud = false;
      S.projects = lsRead(LS_PROJECTS, DEFAULT_PROJECTS);
      lsWrite(LS_PROJECTS, S.projects);
    }
  }

  async function loadAll() {
    const [a, m, g, p, act] = await Promise.all([
      sb().from(APPS).select('*').order('created_at', { ascending: false }),
      sb().from(MEMBERS).select('*').order('full_name', { ascending: true }),
      sb().from(GROUPS).select('*').order('sort_order', { ascending: true }),
      sb().from(POSITIONS).select('*').order('sort_order', { ascending: true }),
      sb().from(ACTIVITY).select('*').order('created_at', { ascending: false }).limit(300)
    ]);
    if (a.error) throw a.error;
    if (m.error) throw m.error;
    S.apps = a.data || [];
    S.members = m.data || [];
    S.groups = g.data || [];
    S.positions = p.data || [];
    S.activity = act.data || [];
    const missing = [g, p, act].filter(r => r.error).map(r => r.error.message);
    S.notice = missing.length
      ? 'Some features are unavailable because part of the database setup is missing. Run supabase/admin_dashboard.sql in the SQL Editor, then press Refresh. (' + missing[0] + ')'
      : '';
    await loadPlansAndProjects();
  }
  async function loadDirectory() {
    const res = await sb().rpc('admin_directory');
    S.directory = res.error ? [] : (res.data || []).map(d => ({ id: d.dir_user_id, name: d.dir_name, role: d.dir_role }));
  }
  const nameOfAdmin = uidVal => ((S.directory.find(d => d.id === uidVal)) || {}).name || '';
  async function loadTasks() {
    await loadDirectory();
    const res = await sb().from(TASKS).select('*').order('created_at', { ascending: false });
    if (res.error) { S.tasks = []; return; }
    S.tasks = res.data || [];
  }
  async function refresh() {
    try { await loadAll(); await loadTasks(); S.error = ''; }
    catch (err) { S.error = 'Could not load data: ' + (err.message || 'unknown error'); }
    renderApp();
  }
  const appsByStatus = s => S.apps.filter(r => r.status === s);
  const memberStatuses = () => [...new Set(S.members.map(m => m.status).filter(Boolean))].sort();

  function filterRows(list, fields) {
    const q = S.q.trim().toLowerCase();
    let out = !q ? list.slice() : list.filter(r => fields.some(f => String(r[f] || '').toLowerCase().includes(q)));
    if (S.sort.col) {
      const col = S.sort.col, dir = S.sort.dir;
      out.sort((a, b) => String(a[col] || '').localeCompare(String(b[col] || ''), undefined, { numeric: true }) * dir);
    }
    return out;
  }
  function viewList() {
    switch (S.view) {
      case 'members': return S.status === 'all' ? S.members : S.members.filter(m => m.status === S.status);
      case 'pending': return appsByStatus('pending');
      case 'approved': return appsByStatus('approved');
      case 'rejected': return appsByStatus('rejected');
      default: return [];
    }
  }
  const LIST_FOR = {
    member: () => S.members, app: () => S.apps, group: () => S.groups,
    position: () => S.positions, task: () => S.tasks, plan: () => S.plans, project: () => S.projects
  };
  const MEMBER_SEARCH = ['full_name', 'email', 'member_id', 'affiliation', 'current_body', 'current_designation', 'phone', 'institution'];
  const TABLE_FOR = { member: MEMBERS, app: APPS, group: GROUPS, position: POSITIONS, task: TASKS, plan: PLANS_TABLE, project: PROJECTS_TABLE };
  const findRow = (kind, id) => ((LIST_FOR[kind] || LIST_FOR.app)()).find(x => String(x.id) === String(id));

  /* ---------- mutations ---------- */
  function dbMessage(err, fallback) {
    if (!err) return fallback;
    const m = err.message || '';
    if (err.code === '23505') {
      if (/member_position_one_current/.test(m)) return 'This member already holds that position.';
      if (/member_id/.test(m)) return 'That Member ID is already used.';
      if (/email/.test(m)) return 'A member with this email already exists.';
      if (/member_positions/.test(m)) return 'A position with that name already exists in this group.';
      return 'That name is already in use.';
    }
    if (err.code === '23503') return 'This is still in use (members or positions depend on it).';
    if (err.code === '23514') return 'The database rejected a value: ' + m;
    return m || fallback;
  }

  async function approveSubmit(appId) {
    const m = modalEl();
    const affiliation = val(m, 'affiliation');
    if (!affiliation) return modalMsg('Choose an affiliation.');
    modalMsg('Approving…');
    let res;
    for (let attempt = 0; attempt < 2; attempt++) {
      const idRes = await sb().rpc('next_member_id');
      if (idRes.error) return modalMsg('Could not generate a Member ID: ' + idRes.error.message);
      res = await sb().rpc('approve_application', {
        p_application_id: appId, p_member_id: idRes.data, p_affiliation: affiliation
      });
      if (!res.error || res.error.code !== '23505' || !/member_id/.test(res.error.message)) break;
    }
    if (res.error) return modalMsg(dbMessage(res.error, 'Approval failed.'));
    closeModal();
    toast('Application approved and member added.');
    await refresh();
  }

  async function saveNotes(id) {
    const m = modalEl();
    const res = await sb().from(APPS).update({ admin_notes: val(m, 'admin_notes') || null }).eq('id', id).select('id');
    if (res.error) return modalMsg('Could not save: ' + res.error.message);
    if (!res.data || !res.data.length) return modalMsg('Not saved. Check admin permissions.');
    toast('Note saved.');
    await refresh();
  }
  async function setAppStatus(app, status) {
    const res = await sb().from(APPS).update({ status: status }).eq('id', app.id).select('id');
    if (res.error) return toast('Update failed: ' + res.error.message, false);
    if (!res.data || !res.data.length) return toast('Nothing was updated. Check admin permissions.', false);
    closeModal();
    toast(status === 'rejected' ? 'Application rejected. Record kept.' : 'Moved back to pending.');
    await refresh();
  }

  async function openNewMember() {
    const res = await sb().rpc('next_member_id');
    if (res.error) return toast('Could not generate a Member ID: ' + res.error.message, false);
    openEditMember(null, res.data);
  }

  async function saveMember(member) {
    const m = modalEl();
    const adding = !member;
    const payload = {};
    if (adding) payload.joined_at = val(m, 'joined_at') || todayISO();
    for (const [k, label, req] of MEMBER_FIELDS) {
      const v = val(m, k);
      if (req && !v) return modalMsg(label + ' is required.');
      payload[k] = v || null;
    }
    if (payload.email) {
      payload.email = payload.email.toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) return modalMsg('Enter a valid email address.');
    }
    if (payload.phone && !/^[+\d\s()-]{6,20}$/.test(payload.phone)) return modalMsg('Enter a valid phone number.');
    if (payload.linkedin_url && !/^https?:\/\//i.test(payload.linkedin_url)) return modalMsg('LinkedIn URL must start with https://');
    modalMsg(adding ? 'Adding…' : 'Saving…');
    let res;
    if (adding) {
      for (let attempt = 0; attempt < 2; attempt++) {
        const idRes = await sb().rpc('next_member_id');
        if (idRes.error) return modalMsg('Could not generate a Member ID: ' + idRes.error.message);
        res = await sb().from(MEMBERS).insert(Object.assign({ member_id: idRes.data }, payload)).select('id');
        if (!res.error || res.error.code !== '23505' || !/member_id/.test(res.error.message)) break;
      }
    } else {
      res = await sb().from(MEMBERS).update(payload).eq('id', member.id).select('id');
    }
    if (res.error) return modalMsg(dbMessage(res.error, 'Save failed.'));
    if (!res.data || !res.data.length) return modalMsg('Not saved. Check admin permissions.');
    closeModal();
    toast(adding ? 'Member added.' : 'Member details saved.');
    await refresh();
  }

  async function removeRow(kind, id) {
    if (kind === 'group' || kind === 'position') {
      const item = findRow(kind, id) || {};
      const inUse = kind === 'group' ? membersIn('current_body', item.name) : membersIn('current_designation', item.name);
      if (inUse) return toast('Cannot delete "' + item.name + '": ' + inUse + ' member(s) use it. Change their body or designation first.', false);
    }
    if (kind === 'plan' && !S.plansCloud) {
      S.plans = S.plans.filter(p => String(p.id) !== String(id));
      lsWrite(LS_PLANS, S.plans);
      closeModal();
      toast('Plan deleted.');
      renderApp();
      return;
    }
    if (kind === 'project' && !S.projectsCloud) {
      S.projects = S.projects.filter(p => String(p.id) !== String(id));
      lsWrite(LS_PROJECTS, S.projects);
      closeModal();
      toast('Project deleted.');
      renderApp();
      return;
    }
    const res = await sb().from(TABLE_FOR[kind] || APPS).delete().eq('id', id).select('id');
    if (res.error) return toast(dbMessage(res.error, 'Delete failed.'), false);
    if (!res.data || !res.data.length) return toast('Nothing was deleted. Check admin permissions.', false);
    closeModal();
    toast('Deleted.');
    if (kind === 'task') await loadTasks();
    await refresh();
  }

  /* ---------- Interactive Export (CSV, JSON, PDF + Live Preview) ---------- */
  const EXPORT_DATASETS = {
    members: {
      label: 'All Members',
      cols: ['member_id', 'full_name', 'email', 'phone', 'institution', 'department', 'affiliation', 'academic_year', 'current_body', 'current_designation', 'linkedin_url', 'joined_at', 'status'],
      rows: () => S.members
    },
    pending: {
      label: 'Pending Applications',
      cols: ['full_name', 'email', 'phone', 'institution', 'department', 'programme', 'academic_year', 'role', 'interest', 'experience', 'status', 'created_at'],
      rows: () => appsByStatus('pending')
    },
    approved: {
      label: 'Approved Applications',
      cols: ['full_name', 'email', 'phone', 'institution', 'department', 'programme', 'academic_year', 'role', 'interest', 'status', 'created_at', 'reviewed_at'],
      rows: () => appsByStatus('approved')
    },
    rejected: {
      label: 'Rejected Applications',
      cols: ['full_name', 'email', 'phone', 'institution', 'role', 'status', 'created_at', 'reviewed_at'],
      rows: () => appsByStatus('rejected')
    },
    all_apps: {
      label: 'All Applications',
      cols: ['full_name', 'email', 'phone', 'institution', 'department', 'programme', 'academic_year', 'role', 'interest', 'experience', 'message', 'linkedin_url', 'status', 'created_at', 'reviewed_at'],
      rows: () => S.apps
    },
    plans: {
      label: 'Club Plans',
      cols: ['title', 'category', 'status', 'start_date', 'end_date', 'owner', 'budget', 'description'],
      rows: () => S.plans
    },
    projects: {
      label: 'Projects Planned',
      cols: ['title', 'status', 'progress', 'lead', 'target_date', 'budget', 'repo_url', 'description'],
      rows: () => S.projects
    },
    tasks: {
      label: 'Admin Tasks',
      cols: ['title', 'status', 'due_date', 'description'],
      rows: () => S.tasks.map(t => Object.assign({}, t, { assignee: nameOfAdmin(t.assignee_user_id) || '—' }))
    },
    activity: {
      label: 'Activity Log (Latest 300)',
      cols: ['created_at', 'actor_email', 'action', 'table_name', 'summary'],
      rows: () => S.activity
    }
  };

  function getExportData() {
    const ds = EXPORT_DATASETS[S.expDataset] || EXPORT_DATASETS.members;
    const allCols = ds.cols;
    if (!S.expCols || !S.expCols.length) S.expCols = allCols.slice();
    const cols = allCols.filter(c => S.expCols.indexOf(c) >= 0);
    let rows = ds.rows().slice();
    if (S.expFilterStatus !== 'all') {
      rows = rows.filter(r => String(r.status || '').toLowerCase() === S.expFilterStatus.toLowerCase());
    }
    if (S.expFilterBody !== 'all' && S.expDataset === 'members') {
      rows = rows.filter(r => (r.current_body || '') === S.expFilterBody);
    }
    const q = S.expSearch.trim().toLowerCase();
    if (q) {
      rows = rows.filter(r => allCols.some(c => String(r[c] || '').toLowerCase().includes(q)));
    }
    return { ds, allCols, cols: cols.length ? cols : allCols, rows };
  }

  function csvCell(v) {
    let s = Array.isArray(v) ? v.join('; ') : (v == null ? '' : String(v));
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replace(/"/g, '""') + '"';
  }
  function triggerDownload(blob, filename) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1500);
  }
  function exportCsv(rows, cols, name) {
    const lines = [cols.join(',')].concat(rows.map(r => cols.map(c => csvCell(r[c])).join(',')));
    const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    triggerDownload(blob, name + '-' + todayISO() + '.csv');
    toast('Exported ' + rows.length + ' record(s) as CSV.');
  }
  function exportJson(rows, cols, name, label) {
    const cleanRows = rows.map(r => {
      const obj = {};
      cols.forEach(c => { obj[c] = r[c] === undefined ? null : r[c]; });
      return obj;
    });
    const payload = {
      organization: 'Yantrika Robotics & Coding Club, IACS Kolkata',
      dataset: label || name,
      exported_at: new Date().toISOString(),
      exported_by: (S.user && S.user.email) || 'admin',
      record_count: cleanRows.length,
      columns: cols,
      records: cleanRows
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    triggerDownload(blob, name + '-' + todayISO() + '.json');
    toast('Exported ' + cleanRows.length + ' record(s) as JSON.');
  }
  function exportFullBackupJson() {
    const payload = {
      organization: 'Yantrika Robotics & Coding Club, IACS Kolkata',
      exported_at: new Date().toISOString(),
      exported_by: (S.user && S.user.email) || 'admin',
      counts: {
        members: S.members.length,
        applications: S.apps.length,
        groups: S.groups.length,
        positions: S.positions.length,
        plans: S.plans.length,
        projects: S.projects.length,
        tasks: S.tasks.length
      },
      members: S.members,
      applications: S.apps,
      groups: S.groups,
      positions: S.positions,
      plans: S.plans,
      projects: S.projects,
      tasks: S.tasks
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    triggerDownload(blob, 'yantrika-full-backup-' + todayISO() + '.json');
    toast('Full JSON backup downloaded.');
  }
  function exportPdfReport(rows, cols, title) {
    const w = window.open('', '_blank', 'width=1050,height=760');
    if (!w) return toast('Pop-up blocked. Allow pop-ups to generate the PDF report.', false);
    const th = cols.map(c => '<th>' + esc(cap(c)) + '</th>').join('');
    const tb = rows.map(r => '<tr>' + cols.map(c => '<td>' + esc(cellVal(r[c])) + '</td>').join('') + '</tr>').join('');
    const html = '<!doctype html><html><head><meta charset="utf-8"><title>Yantrika Report — ' + esc(title) + '</title>' +
      '<style>@page{size:A4 landscape;margin:12mm}body{font-family:system-ui,-apple-system,sans-serif;color:#17171d;margin:0;padding:20px;font-size:11px}' +
      '.hdr{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #17171d;padding-bottom:10px;margin-bottom:14px}' +
      '.brand{font-size:20px;font-weight:800;letter-spacing:-.02em}.tag{display:inline-block;background:#f1c40f;border:2px solid #17171d;padding:2px 8px;border-radius:6px;font-weight:700;font-size:10px;margin-left:8px}' +
      '.meta{text-align:right;font-size:10px;color:#555}' +
      'table{width:100%;border-collapse:collapse;margin-top:8px}th{background:#17171d;color:#fff;text-align:left;padding:6px 8px;font-size:10px;text-transform:uppercase}' +
      'td{padding:5px 8px;border-bottom:1px solid #ddd;vertical-align:top;word-break:break-word}tr:nth-child(even) td{background:#f9f9fb}' +
      '.noprint{margin-bottom:14px;display:flex;gap:8px}@media print{.noprint{display:none}}</style></head><body>' +
      '<div class="noprint"><button onclick="window.print()" style="padding:8px 16px;background:#f1c40f;border:2px solid #17171d;border-radius:8px;font-weight:700;cursor:pointer">Save as PDF / Print</button>' +
      '<button onclick="window.close()" style="padding:8px 14px;background:#fff;border:2px solid #17171d;border-radius:8px;cursor:pointer">Close</button></div>' +
      '<div class="hdr"><div><span class="brand">YANTRIKA</span><span class="tag">' + esc(title) + '</span><div style="margin-top:4px;color:#555">Robotics &amp; Coding Club · IACS Kolkata</div></div>' +
      '<div class="meta">Generated: ' + esc(new Date().toLocaleString('en-IN')) + '<br>Records: <strong>' + rows.length + '</strong> · By: ' + esc((S.user && S.user.email) || 'Admin') + '</div></div>' +
      '<table><thead><tr>' + th + '</tr></thead><tbody>' + (tb || '<tr><td colspan="' + cols.length + '">No matching records.</td></tr>') + '</tbody></table>' +
      '<script>setTimeout(()=>window.print(),350);</script></body></html>';
    w.document.open();
    w.document.write(html);
    w.document.close();
    toast('PDF report opened. Choose "Save as PDF" in the print dialog.');
  }

  function exportHTML() {
    const { ds, allCols, cols, rows } = getExportData();
    const dsOpts = Object.keys(EXPORT_DATASETS).map(k =>
      '<option value="' + k + '"' + (S.expDataset === k ? ' selected' : '') + '>' + esc(EXPORT_DATASETS[k].label) + '</option>').join('');
    const statuses = [...new Set(ds.rows().map(r => r.status).filter(Boolean))];
    const statusOpts = '<option value="all">All statuses</option>' +
      statuses.map(s => '<option value="' + esc(s) + '"' + (S.expFilterStatus === s ? ' selected' : '') + '>' + esc(cap(s)) + '</option>').join('');
    const bodyOpts = S.expDataset === 'members'
      ? '<select id="ya-exp-body" aria-label="Filter by body"><option value="all">All bodies</option>' +
        S.groups.map(g => '<option value="' + esc(g.name) + '"' + (S.expFilterBody === g.name ? ' selected' : '') + '>' + esc(g.name) + '</option>').join('') + '</select>'
      : '';
    const colChecks = allCols.map(c =>
      '<label class="ya-chip-check"><input type="checkbox" name="exp_col" value="' + esc(c) + '"' + (cols.indexOf(c) >= 0 ? ' checked' : '') + '> <span>' + esc(cap(c)) + '</span></label>').join('');
    const previewRows = rows.slice(0, 25);
    const previewTable = previewRows.length
      ? tableWrap(cols.map(c => cap(c)), previewRows.map(r =>
          '<tr>' + cols.map(c => '<td data-l="' + esc(cap(c)) + '">' + esc(cellVal(r[c])) + '</td>').join('') + '</tr>').join(''))
      : '<div class="ya-empty">No records match the current export filters.</div>';

    return '<div class="ya-card"><div class="ya-toolbar" style="justify-content:space-between"><div><h2 class="ya-h2" style="margin:0">Interactive Export &amp; Report Builder</h2>' +
      '<p class="ya-muted" style="margin:2px 0 0">Filter records, pick columns, preview live, and export as CSV, JSON, or PDF.</p></div>' +
      '<button class="ya-btn small ghost" data-ya="export-backup">Full Club Backup (JSON)</button></div>' +
      '<div class="ya-grid3" style="margin-top:14px">' +
      '<label class="ya-field"><span>Dataset</span><select id="ya-exp-ds">' + dsOpts + '</select></label>' +
      '<label class="ya-field"><span>Status filter</span><select id="ya-exp-status">' + statusOpts + '</select></label>' +
      (bodyOpts ? '<label class="ya-field"><span>Body / Group</span>' + bodyOpts + '</label>' : '<label class="ya-field"><span>Search inside dataset</span><input id="ya-exp-q" type="search" placeholder="Filter rows…" value="' + esc(S.expSearch) + '"></label>') +
      '</div>' +
      (bodyOpts ? '<div style="margin-top:10px"><input id="ya-exp-q" type="search" placeholder="Search inside dataset…" value="' + esc(S.expSearch) + '"></div>' : '') +
      '<div style="margin-top:14px"><div class="ya-toolbar" style="margin-bottom:6px"><strong style="font-size:.88rem">Columns (' + cols.length + '/' + allCols.length + ')</strong>' +
      '<button class="ya-btn small ghost" data-ya="exp-cols-all">All</button>' +
      '<button class="ya-btn small ghost" data-ya="exp-cols-min">Minimal</button></div>' +
      '<div class="ya-chip-grid">' + colChecks + '</div></div>' +
      '<div class="ya-actions start" style="margin-top:16px;padding-top:14px;border-top:1px solid rgba(128,128,128,.2)">' +
      '<button class="ya-btn ok" data-ya="export-fmt" data-fmt="csv">Download CSV (' + rows.length + ')</button>' +
      '<button class="ya-btn" data-ya="export-fmt" data-fmt="json">Download JSON (' + rows.length + ')</button>' +
      '<button class="ya-btn cy" data-ya="export-fmt" data-fmt="pdf">Export PDF Report (' + rows.length + ')</button>' +
      '<button class="ya-btn ghost" data-ya="export-fmt" data-fmt="copy-json">Copy JSON</button>' +
      '</div></div>' +
      '<div class="ya-card" style="margin-top:16px"><div class="ya-toolbar" style="justify-content:space-between;margin-bottom:8px">' +
      '<h3 style="margin:0;font-size:1rem">Live Interactive Preview</h3>' +
      '<span class="ya-muted">' + (rows.length > 25 ? 'Showing first 25 of ' + rows.length + ' rows' : rows.length + ' row(s)') + '</span></div>' +
      previewTable + '</div>';
  }

  /* ---------- Email (fixed Edge Function auth + diagnostics + templates + fallback) ---------- */
  const EMAIL_FN = 'send-email';
  const CHUNK = 40;
  const CHUNK_PAUSE_MS = 1500;

  async function invokeEmailFn(body) {
    const client = sb();
    if (!client) return { data: null, error: { message: 'Supabase client not loaded.' } };
    const { data: sessData } = await client.auth.getSession();
    const token = sessData && sessData.session && sessData.session.access_token;
    const headers = token ? { Authorization: 'Bearer ' + token } : {};
    return await client.functions.invoke(EMAIL_FN, { headers: headers, body: body });
  }

  async function errorText(error) {
    if (!error) return 'unknown error';
    try {
      if (error.context) {
        if (typeof error.context.json === 'function') {
          const clone = error.context.clone ? error.context.clone() : error.context;
          const body = await clone.json();
          if (body && (body.error || body.message)) {
            return (body.error || body.message) + (body.detail ? ' — ' + body.detail : '');
          }
        }
        if (typeof error.context.text === 'function') {
          const txt = await error.context.text();
          if (txt) return txt.slice(0, 240);
        }
      }
    } catch (e) { /* body was not JSON/text */ }
    return error.message || 'unknown error';
  }

  async function loadQuota() {
    const res = await invokeEmailFn({ action: 'quota' });
    S.quota = res.error ? null : res.data;
    S.quotaError = res.error ? await errorText(res.error) : '';
    return S.quota;
  }

  async function notifyTask(taskId, event) {
    const res = await invokeEmailFn({ action: 'task', task_id: taskId, event: event });
    if (res.error) {
      const detail = await errorText(res.error);
      toast('Task saved, but email notification failed: ' + detail, false);
      return false;
    }
    toast('Task saved & notification email sent.');
    return true;
  }

  function resolveEmailRecipients() {
    const withEmail = S.members.filter(m => m.email);
    if (S.emailMode === 'all') return withEmail;
    if (S.emailMode === 'group') {
      const grp = (document.querySelector('#yadmin-root select[name="ann_group"]') || {}).value || '';
      return grp ? withEmail.filter(m => m.current_body === grp) : withEmail;
    }
    if (S.emailMode === 'selected') {
      return withEmail.filter(m => S.emailSelectedIds[m.id]);
    }
    if (S.emailMode === 'pending') {
      return appsByStatus('pending').filter(a => a.email);
    }
    if (S.emailMode === 'custom') {
      const raw = (document.querySelector('#yadmin-root input[name="ann_custom"]') || {}).value || '';
      return raw.split(/[,;\s]+/).map(e => e.trim()).filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
        .map(email => ({ id: null, full_name: email, email: email }));
    }
    return [];
  }

  function emailHTML() {
    const q = S.quota;
    const left = q ? Math.max(0, q.daily_limit - q.sent_today) : null;
    const withEmail = S.members.filter(m => m.email);
    const groups = S.groups.slice().sort((a, b) => a.sort_order - b.sort_order);
    const groupOpts = '<option value="">Everyone with an email (' + withEmail.length + ')</option>' +
      groups.map(g => '<option value="' + esc(g.name) + '">' + esc(g.name) + ' (' + withEmail.filter(m => m.current_body === g.name).length + ')</option>').join('');
    const modeTabs = [
      ['group', 'By Group / All'],
      ['selected', 'Pick Members (' + Object.keys(S.emailSelectedIds).filter(k => S.emailSelectedIds[k]).length + ')'],
      ['pending', 'Pending Applicants (' + appsByStatus('pending').filter(a => a.email).length + ')'],
      ['custom', 'Custom Emails']
    ].map(([m, lbl]) => '<button type="button" class="ya-btn small ' + (S.emailMode === m ? '' : 'ghost') + '" data-ya="email-mode" data-m="' + m + '">' + lbl + '</button>').join('');

    let targetInput = '';
    if (S.emailMode === 'group') {
      targetInput = '<label class="ya-field"><span>Group / Body</span><select name="ann_group">' + groupOpts + '</select></label>';
    } else if (S.emailMode === 'selected') {
      targetInput = '<div class="ya-field" style="grid-column:1/-1"><span>Select Members</span><div class="ya-chip-grid" style="max-height:170px;overflow:auto">' +
        withEmail.map(m => '<label class="ya-chip-check"><input type="checkbox" name="email_pick" value="' + esc(m.id) + '"' + (S.emailSelectedIds[m.id] ? ' checked' : '') + '> <span>' + esc(m.full_name) + '</span></label>').join('') +
        '</div></div>';
    } else if (S.emailMode === 'pending') {
      targetInput = '<div class="ya-field"><span>Target</span><input value="All pending applicants with email" readonly class="ya-readonly"></div>';
    } else {
      targetInput = '<label class="ya-field" style="grid-column:1/-1"><span>Recipient Email(s) (comma-separated)</span><input name="ann_custom" placeholder="alice@example.com, bob@example.com"></label>';
    }

    const tplOpts = '<option value="">— Choose a template —</option>' +
      EMAIL_TEMPLATES.map(t => '<option value="' + t.id + '">' + esc(t.name) + '</option>').join('');

    const quotaBanner = q
      ? '<div class="ya-quota ok"><strong>Edge Function Connected</strong> · Emails sent today: <strong>' + q.sent_today + '</strong> / <strong>' + q.daily_limit + '</strong> (<strong>' + left + '</strong> left)</div>'
      : '<div class="ya-quota bad"><strong>Email Edge Function Issue:</strong> ' + esc(S.quotaError || 'Could not reach send-email.') +
        '<div class="ya-actions start" style="margin-top:8px"><button class="ya-btn small" data-ya="email-test-conn">Retry Connection</button>' +
        '<button class="ya-btn small ghost" data-ya="email-diag">How to Fix</button></div></div>';

    const logHTML = S.emailLog.length
      ? '<div class="ya-card" style="margin-top:16px"><h3 style="margin:0 0 8px">Session Sent Log</h3>' +
        tableWrap(['Time', 'Subject', 'Recipients', 'Status'], S.emailLog.map(l =>
          '<tr><td>' + esc(l.time) + '</td><td><strong>' + esc(l.subject) + '</strong></td><td>' + esc(l.count) + '</td><td>' + badge(l.ok ? 'approved' : 'rejected') + '</td></tr>').join('')) + '</div>'
      : '';

    return '<div class="ya-card"><h2 class="ya-h2" style="margin-top:0">Send Email / Announcement</h2>' +
      quotaBanner +
      '<div class="ya-toolbar" style="margin-top:14px"><span class="ya-muted" style="font-size:.85rem">Recipients:</span>' + modeTabs + '</div>' +
      '<div class="ya-grid2" style="margin-top:10px">' + targetInput +
      '<label class="ya-field"><span>Quick Template</span><select id="ya-email-tpl">' + tplOpts + '</select></label>' +
      '<label class="ya-field" style="grid-column:1/-1"><span>Subject *</span><input name="ann_subject" placeholder="e.g. Workshop on Saturday"></label>' +
      '<label class="ya-field" style="grid-column:1/-1"><span>Message *</span><textarea name="ann_body" rows="7" placeholder="Write your message…"></textarea></label>' +
      '</div>' +
      '<div class="ya-actions start" style="margin-top:14px">' +
      '<button class="ya-btn ok" data-ya="send-announcement">Review &amp; Send via Server</button>' +
      '<button class="ya-btn ghost" data-ya="send-test-email">Send Test to Myself</button>' +
      '<button class="ya-btn ghost" data-ya="email-mailto">Open in Email App (Fallback)</button>' +
      '<button class="ya-btn ghost" data-ya="email-copy">Copy Recipient Emails</button>' +
      '</div></div>' + logHTML;
  }

  function openEmailDiagnostics() {
    openModal('<h3>Fixing Supabase <code>send-email</code> Edge Function</h3>' +
      '<p class="ya-muted">If the dashboard cannot reach <code>send-email</code>, check these 3 items in your Supabase project:</p>' +
      '<ol style="padding-left:18px;line-height:1.7">' +
      '<li><strong>Deploy with <code>--no-verify-jwt</code>:</strong> Because this site uses an <code>sb_publishable_...</code> key, deploy the function with <code>supabase functions deploy send-email --no-verify-jwt</code> (the function verifies the admin JWT internally).</li>' +
      '<li><strong>Set Secrets:</strong> Run <code>supabase secrets set BREVO_API_KEY=... SENDER_EMAIL=noreply@yantrika.in</code>.</li>' +
      '<li><strong>CORS Headers:</strong> Ensure <code>OPTIONS</code> returns <code>Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type</code>.</li>' +
      '</ol><p class="ya-muted">Last error: <code>' + esc(S.quotaError || 'None') + '</code></p>' +
      '<div class="ya-actions"><button class="ya-btn" data-ya="close">Close</button></div>');
  }

  async function sendTestEmailToSelf() {
    const myEmail = S.user && S.user.email;
    if (!myEmail) return toast('No admin email found.', false);
    const subj = (document.querySelector('#yadmin-root input[name="ann_subject"]') || {}).value.trim() || 'Yantrika Admin Test Email';
    const msg = (document.querySelector('#yadmin-root textarea[name="ann_body"]') || {}).value.trim() || 'This is a test email from the Yantrika Admin Dashboard.';
    toast('Sending test email to ' + myEmail + '…');
    const res = await invokeEmailFn({ action: 'test', to: myEmail, subject: '[TEST] ' + subj, message: msg });
    if (res.error) {
      const detail = await errorText(res.error);
      toast('Test email failed: ' + detail, false);
    } else {
      toast('Test email sent to ' + myEmail + '!');
      await loadQuota();
      renderApp();
    }
  }

  function openEmailMailtoFallback() {
    const recips = resolveEmailRecipients();
    if (!recips.length) return toast('No recipients selected.', false);
    const subj = encodeURIComponent((document.querySelector('#yadmin-root input[name="ann_subject"]') || {}).value.trim());
    const body = encodeURIComponent((document.querySelector('#yadmin-root textarea[name="ann_body"]') || {}).value.trim());
    const bcc = encodeURIComponent(recips.map(r => r.email).join(','));
    window.location.href = 'mailto:?bcc=' + bcc + '&subject=' + subj + '&body=' + body;
    toast('Opened your email app with ' + recips.length + ' BCC recipient(s).');
  }

  async function copyRecipientEmails() {
    const recips = resolveEmailRecipients();
    if (!recips.length) return toast('No recipients selected.', false);
    try {
      await navigator.clipboard.writeText(recips.map(r => r.email).join(', '));
      toast('Copied ' + recips.length + ' email address(es) to clipboard.');
    } catch (e) {
      toast('Could not copy: ' + recips.map(r => r.email).join(', '), false);
    }
  }

  async function openAnnouncementConfirm() {
    const body = document.querySelector('#yadmin-root textarea[name="ann_body"]');
    const message = body ? body.value.trim() : '';
    const subj = (document.querySelector('#yadmin-root input[name="ann_subject"]') || {}).value.trim();
    if (!subj || !message) return toast('Add a subject and a message first.', false);
    const recips = resolveEmailRecipients();
    if (!recips.length) return toast('No recipients with a valid email address found.', false);
    if (!S.quota) await loadQuota();
    if (S.quota) {
      const left = Math.max(0, S.quota.daily_limit - S.quota.sent_today);
      if (left === 0) return toast('Daily limit (' + S.quota.daily_limit + ') reached. Use "Open in Email App (Fallback)" instead.', false);
      if (recips.length > left) return toast('Only ' + left + ' email(s) left today. Choose fewer recipients or use Email App fallback.', false);
    }
    S.pendingAnn = { subject: subj, message: message, recips: recips };
    openModal('<h3>Send this email?</h3>' +
      '<p><strong>' + esc(subj) + '</strong></p><p class="ya-muted">To ' + recips.length + ' recipient(s).</p>' +
      '<div class="ya-dl" style="white-space:pre-wrap;border:1px solid rgba(128,128,128,.25);border-radius:10px;padding:10px">' + esc(message) + '</div>' +
      '<p class="ya-msg" id="ya-msg" role="status"></p>' +
      '<div class="ya-actions"><button class="ya-btn ghost" data-ya="close">Cancel</button>' +
      '<button class="ya-btn ok" data-ya="confirm-announcement">Send now</button></div>');
  }

  async function sendAnnouncement() {
    const a = S.pendingAnn;
    if (!a) return;
    let sent = 0, failed = 0, firstError = '';
    const memberIds = a.recips.filter(r => r.id && S.members.some(m => m.id === r.id)).map(r => r.id);
    const directEmails = a.recips.filter(r => !r.id || !S.members.some(m => m.id === r.id)).map(r => r.email);

    const batches = [];
    for (let i = 0; i < memberIds.length; i += CHUNK) batches.push({ member_ids: memberIds.slice(i, i + CHUNK) });
    for (let i = 0; i < directEmails.length; i += CHUNK) batches.push({ emails: directEmails.slice(i, i + CHUNK) });

    for (let c = 0; c < batches.length; c++) {
      modalMsg('Sending batch ' + (c + 1) + ' of ' + batches.length + '…');
      const payload = Object.assign({ action: 'announcement', subject: a.subject, message: a.message }, batches[c]);
      const res = await invokeEmailFn(payload);
      if (res.error) {
        failed += (batches[c].member_ids || batches[c].emails).length;
        firstError = firstError || await errorText(res.error);
        break;
      }
      sent += (res.data && res.data.sent) || 0;
      failed += (res.data && res.data.failed) || 0;
      if (!firstError && res.data && res.data.failures && res.data.failures.length) firstError = res.data.failures[0];
      if (c < batches.length - 1) await new Promise(r => setTimeout(r, CHUNK_PAUSE_MS));
    }
    S.emailLog.unshift({ time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), subject: a.subject, count: sent + '/' + a.recips.length, ok: failed === 0 && sent > 0 });
    S.pendingAnn = null;
    closeModal();
    toast('Sent ' + sent + '. ' + (failed ? failed + ' not sent. ' + firstError : ''), failed === 0);
    await loadQuota();
    renderApp();
  }

  /* ---------- Plans, Projects Planned & Calendar ---------- */
  function plansHTML() {
    const f = S.planFilter;
    const list = S.plans.filter(p => f === 'all' || p.status === f);
    const filterSel = '<select id="ya-plan-filter" aria-label="Filter plans"><option value="all">All statuses</option>' +
      PLAN_STATUSES.map(s => '<option value="' + s + '"' + (f === s ? ' selected' : '') + '>' + esc(cap(s)) + '</option>').join('') + '</select>';
    const rows = list.map(p => {
      const linkedProj = S.projects.filter(pr => pr.plan_id === p.id).length;
      return '<tr><td data-l="Plan"><strong>' + esc(p.title) + '</strong>' +
        (p.description ? '<div class="ya-muted" style="font-size:.82rem">' + esc(p.description) + '</div>' : '') + '</td>' +
        '<td data-l="Category"><span class="ya-tag">' + esc(p.category || 'Other') + '</span></td>' +
        '<td data-l="Dates">' + esc(fmt(p.start_date)) + (p.end_date && p.end_date !== p.start_date ? ' → ' + esc(fmt(p.end_date)) : '') + '</td>' +
        '<td data-l="Owner">' + esc(p.owner || '—') + '</td>' +
        '<td data-l="Projects">' + linkedProj + '</td>' +
        '<td data-l="Status">' + stBadge(p.status) + '</td>' +
        '<td class="ya-acts">' + btn('edit-plan', 'plan', p.id, 'Edit') + btn('delete', 'plan', p.id, 'Delete', 'danger') + '</td></tr>';
    }).join('');
    const syncNote = S.plansCloud
      ? '<span class="ya-muted">Synced with Supabase</span>'
      : '<span class="ya-muted">Saved locally in browser (run <code>plans_and_projects.sql</code> in Supabase to sync across all admins)</span>';
    return '<div class="ya-toolbar">' + (canEdit() ? '<button class="ya-btn small ok" data-ya="new-plan">+ New Plan</button>' : '') +
      filterSel + '<button class="ya-btn small ghost" data-ya="nav" data-v="calendar">View on calendar</button>' +
      '<span class="ya-muted">' + list.length + ' plan(s)</span></div>' +
      '<p class="ya-muted ya-note">' + syncNote + '</p>' +
      (rows ? tableWrap(['Plan', 'Category', 'Dates', 'Owner', 'Projects', 'Status', ''], rows) : emptyState());
  }

  function openPlanForm(p, defaultDate) {
    const catOpts = PLAN_CATS.map(c => '<option value="' + c + '"' + ((p && p.category === c) ? ' selected' : '') + '>' + c + '</option>').join('');
    const stOpts = PLAN_STATUSES.map(s => '<option value="' + s + '"' + (((p ? p.status : 'planned') === s) ? ' selected' : '') + '>' + esc(cap(s)) + '</option>').join('');
    openModal('<h3>' + (p ? 'Edit Plan' : 'New Club Plan') + '</h3><div class="ya-grid2">' +
      '<label class="ya-field" style="grid-column:1/-1"><span>Title *</span><input name="title" value="' + esc(p ? p.title : '') + '" placeholder="e.g. Summer Robotics Bootcamp"></label>' +
      '<label class="ya-field"><span>Category</span><select name="category">' + catOpts + '</select></label>' +
      '<label class="ya-field"><span>Status</span><select name="status">' + stOpts + '</select></label>' +
      '<label class="ya-field"><span>Start Date *</span><input name="start_date" type="date" value="' + esc((p && p.start_date) || defaultDate || todayISO()) + '"></label>' +
      '<label class="ya-field"><span>End Date</span><input name="end_date" type="date" value="' + esc((p && p.end_date) || defaultDate || todayISO()) + '"></label>' +
      '<label class="ya-field"><span>Owner / Lead</span><input name="owner" value="' + esc(p ? p.owner || '' : '') + '" placeholder="e.g. Core Committee"></label>' +
      '<label class="ya-field"><span>Estimated Budget</span><input name="budget" value="' + esc(p ? p.budget || '' : '') + '" placeholder="e.g. ₹15,000"></label>' +
      '<label class="ya-field" style="grid-column:1/-1"><span>Description &amp; Goals</span><textarea name="description" rows="3">' + esc(p ? p.description || '' : '') + '</textarea></label>' +
      '</div><p class="ya-msg" id="ya-msg" role="status"></p>' +
      '<div class="ya-actions"><button class="ya-btn ghost" data-ya="close">Cancel</button>' +
      '<button class="ya-btn ok" data-ya="save-plan" data-id="' + esc(p ? p.id : '') + '">Save Plan</button></div>');
  }

  async function savePlan(id) {
    const m = modalEl();
    const title = val(m, 'title');
    const startDate = val(m, 'start_date');
    if (!title) return modalMsg('Title is required.');
    if (!startDate) return modalMsg('Start date is required.');
    if (val(m, 'end_date') && val(m, 'end_date') < startDate) return modalMsg('End date cannot be before the start date.');
    const payload = {
      title: title,
      category: val(m, 'category') || 'Other',
      status: val(m, 'status') || 'planned',
      start_date: startDate,
      end_date: val(m, 'end_date') || startDate,
      owner: val(m, 'owner') || null,
      budget: val(m, 'budget') || null,
      description: val(m, 'description') || null
    };
    if (S.plansCloud) {
      const res = id
        ? await sb().from(PLANS_TABLE).update(payload).eq('id', id).select('id')
        : await sb().from(PLANS_TABLE).insert(payload).select('id');
      if (res.error) return modalMsg(res.error.message);
      if (!res.data || !res.data.length) return modalMsg('Not saved. Check admin permissions.');
      await loadPlansAndProjects();
    } else {
      if (id) {
        const idx = S.plans.findIndex(x => String(x.id) === String(id));
        if (idx >= 0) S.plans[idx] = Object.assign({}, S.plans[idx], payload);
      } else {
        S.plans.push(Object.assign({ id: uid('plan') }, payload));
      }
      lsWrite(LS_PLANS, S.plans);
    }
    closeModal();
    focusCalendar(startDate);
    toast(id ? 'Plan updated.' : 'Plan created.');
    renderApp();
  }

  function projectsHTML() {
    const f = S.projectFilter;
    const list = S.projects.filter(p => f === 'all' || p.status === f);
    const filterSel = '<select id="ya-proj-filter" aria-label="Filter projects"><option value="all">All statuses</option>' +
      PROJ_STATUSES.map(s => '<option value="' + s + '"' + (f === s ? ' selected' : '') + '>' + esc(cap(s)) + '</option>').join('') + '</select>';
    const planTitle = pid => ((S.plans.find(p => String(p.id) === String(pid))) || {}).title || '—';
    const rows = list.map(pr => {
      const pct = Math.max(0, Math.min(100, parseInt(pr.progress || 0, 10) || 0));
      return '<tr><td data-l="Project"><strong>' + esc(pr.title) + '</strong>' +
        (pr.description ? '<div class="ya-muted" style="font-size:.82rem">' + esc(pr.description) + '</div>' : '') +
        (pr.repo_url ? '<div><a href="' + esc(pr.repo_url) + '" target="_blank" rel="noopener" style="font-size:.8rem">Repo / Link ↗</a></div>' : '') + '</td>' +
        '<td data-l="Linked Plan">' + esc(planTitle(pr.plan_id)) + '</td>' +
        '<td data-l="Lead">' + esc(pr.lead || '—') + '</td>' +
        '<td data-l="Target Date">' + esc(fmt(pr.target_date)) + '</td>' +
        '<td data-l="Progress" style="min-width:110px"><div class="ya-bar"><span style="width:' + pct + '%"></span></div><span class="ya-muted" style="font-size:.78rem">' + pct + '%</span></td>' +
        '<td data-l="Status">' + stBadge(pr.status) + '</td>' +
        '<td class="ya-acts">' + btn('edit-project', 'project', pr.id, 'Edit') + btn('delete', 'project', pr.id, 'Delete', 'danger') + '</td></tr>';
    }).join('');
    return '<div class="ya-toolbar">' + (canEdit() ? '<button class="ya-btn small ok" data-ya="new-project">+ New Project</button>' : '') +
      filterSel + '<button class="ya-btn small ghost" data-ya="nav" data-v="calendar">View on calendar</button>' +
      '<span class="ya-muted">' + list.length + ' project(s)</span></div>' +
      (rows ? tableWrap(['Project', 'Linked Plan', 'Lead', 'Target Date', 'Progress', 'Status', ''], rows) : emptyState());
  }

  function openProjectForm(pr, defaultDate) {
    const planOpts = '<option value="">— No linked plan —</option>' +
      S.plans.map(p => '<option value="' + esc(p.id) + '"' + (pr && String(pr.plan_id) === String(p.id) ? ' selected' : '') + '>' + esc(p.title) + '</option>').join('');
    const stOpts = PROJ_STATUSES.map(s => '<option value="' + s + '"' + (((pr ? pr.status : 'planned') === s) ? ' selected' : '') + '>' + esc(cap(s)) + '</option>').join('');
    openModal('<h3>' + (pr ? 'Edit Project' : 'New Planned Project') + '</h3><div class="ya-grid2">' +
      '<label class="ya-field" style="grid-column:1/-1"><span>Project Name *</span><input name="title" value="' + esc(pr ? pr.title : '') + '" placeholder="e.g. Autonomous Line Follower v2"></label>' +
      '<label class="ya-field"><span>Linked Plan</span><select name="plan_id">' + planOpts + '</select></label>' +
      '<label class="ya-field"><span>Status</span><select name="status">' + stOpts + '</select></label>' +
      '<label class="ya-field"><span>Lead / Team</span><input name="lead" value="' + esc(pr ? pr.lead || '' : '') + '" placeholder="e.g. Robotics Team"></label>' +
      '<label class="ya-field"><span>Target Date</span><input name="target_date" type="date" value="' + esc((pr && pr.target_date) || defaultDate || todayISO()) + '"></label>' +
      '<label class="ya-field"><span>Progress (%)</span><input name="progress" type="number" min="0" max="100" value="' + esc(pr ? pr.progress || 0 : 0) + '"></label>' +
      '<label class="ya-field"><span>Budget / Parts</span><input name="budget" value="' + esc(pr ? pr.budget || '' : '') + '" placeholder="e.g. ₹5,000"></label>' +
      '<label class="ya-field" style="grid-column:1/-1"><span>GitHub / Doc URL</span><input name="repo_url" value="' + esc(pr ? pr.repo_url || '' : '') + '" placeholder="https://github.com/Yantrika-IACS/..."></label>' +
      '<label class="ya-field" style="grid-column:1/-1"><span>Description &amp; Milestones</span><textarea name="description" rows="3">' + esc(pr ? pr.description || '' : '') + '</textarea></label>' +
      '</div><p class="ya-msg" id="ya-msg" role="status"></p>' +
      '<div class="ya-actions"><button class="ya-btn ghost" data-ya="close">Cancel</button>' +
      '<button class="ya-btn ok" data-ya="save-project" data-id="' + esc(pr ? pr.id : '') + '">Save Project</button></div>');
  }

  async function saveProject(id) {
    const m = modalEl();
    const title = val(m, 'title');
    if (!title) return modalMsg('Project name is required.');
    const payload = {
      title: title,
      plan_id: val(m, 'plan_id') || null,
      status: val(m, 'status') || 'planned',
      lead: val(m, 'lead') || null,
      target_date: val(m, 'target_date') || null,
      progress: Math.max(0, Math.min(100, parseInt(val(m, 'progress') || '0', 10) || 0)),
      budget: val(m, 'budget') || null,
      repo_url: val(m, 'repo_url') || null,
      description: val(m, 'description') || null
    };
    if (S.projectsCloud) {
      const res = id
        ? await sb().from(PROJECTS_TABLE).update(payload).eq('id', id).select('id')
        : await sb().from(PROJECTS_TABLE).insert(payload).select('id');
      if (res.error) return modalMsg(res.error.message);
      if (!res.data || !res.data.length) return modalMsg('Not saved. Check admin permissions.');
      await loadPlansAndProjects();
    } else {
      if (id) {
        const idx = S.projects.findIndex(x => String(x.id) === String(id));
        if (idx >= 0) S.projects[idx] = Object.assign({}, S.projects[idx], payload);
      } else {
        S.projects.push(Object.assign({ id: uid('proj') }, payload));
      }
      lsWrite(LS_PROJECTS, S.projects);
    }
    closeModal();
    if (payload.target_date) focusCalendar(payload.target_date);
    toast(id ? 'Project updated.' : 'Project added.');
    renderApp();
  }

  /* A status badge for plans / projects with sensible colours */
  function stBadge(s) {
    const cls = s === 'completed' ? 'approved'
      : (s === 'active' || s === 'in_progress' || s === 'testing') ? 'info'
      : s === 'planned' ? 'pending'
      : s === 'on_hold' ? 'rejected' : 'neutral';
    return '<span class="ya-b ' + cls + '">' + esc(cap(s || 'draft')) + '</span>';
  }

  /* Jump the calendar to a date (used after saving a plan or project so the change is visible at once) */
  function focusCalendar(iso) {
    const d = parseD(iso);
    if (!d || isNaN(d)) return;
    S.calYear = d.getFullYear();
    S.calMonth = d.getMonth();
    S.calSelectedDate = isoLocal(d);
  }

  /* Re-read plans, projects and tasks from the database so the schedule is never stale */
  async function syncSchedule() {
    const v = S.view;
    try { await loadPlansAndProjects(); await loadTasks(); } catch (e) { /* keep what we have */ }
    if (S.view === v && !document.getElementById('ya-back')) renderApp();
  }

  /* all = ignore the calendar's own show/hide toggles (used on the overview) */
  function gatherCalendarItems(all) {
    const items = [];
    const planTitle = pid => ((S.plans.find(p => String(p.id) === String(pid))) || {}).title || '';
    if (all || S.calShow.plans) {
      S.plans.forEach(p => {
        if (!p.start_date) return;
        const s = String(p.start_date).slice(0, 10);
        let e = String(p.end_date || p.start_date).slice(0, 10);
        if (e < s) e = s;
        items.push({ date: s, end: e, kind: 'plan', title: p.title, sub: (p.category || 'Other') + ' · ' + cap(p.status), id: p.id, done: p.status === 'completed' });
      });
    }
    if (all || S.calShow.projects) {
      S.projects.forEach(pr => {
        if (!pr.target_date) return;
        const d = String(pr.target_date).slice(0, 10);
        const lp = planTitle(pr.plan_id);
        items.push({ date: d, end: d, kind: 'project', title: pr.title, sub: 'Project · ' + (parseInt(pr.progress, 10) || 0) + '%' + (lp ? ' · Plan: ' + lp : ''), id: pr.id, done: pr.status === 'completed' });
      });
    }
    if (all || S.calShow.tasks) {
      S.tasks.forEach(t => {
        if (!t.due_date) return;
        const d = String(t.due_date).slice(0, 10);
        const who = nameOfAdmin(t.assignee_user_id);
        items.push({ date: d, end: d, kind: 'task', title: t.title, sub: 'Task · ' + cap(t.status) + (who ? ' · ' + who : ''), id: t.id, done: t.status === 'done' });
      });
    }
    return items;
  }

  function calItemRow(it) {
    const canOpen = it.kind === 'task' || canEdit();
    const range = it.end !== it.date ? ' · ' + fmt(it.date) + ' → ' + fmt(it.end) : '';
    return '<li class="ya-item' + (it.done ? ' done' : '') + '"><span class="ya-cal-pill ' + it.kind + '">' + esc(cap(it.kind)) + '</span>' +
      '<div class="ya-item-t"><strong>' + esc(it.title) + '</strong><div class="ya-muted ya-item-s">' + esc(it.sub + range) + '</div></div>' +
      (canOpen ? '<button class="ya-btn small ghost" data-ya="cal-open" data-k="' + it.kind + '" data-id="' + esc(it.id) + '" data-date="' + esc(it.date) + '">' + (it.kind === 'task' ? 'Open' : 'Edit') + '</button>' : '') + '</li>';
  }

  function calendarHTML() {
    const y = S.calYear, m = S.calMonth;
    const monthName = new Date(y, m, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    const monthStart = y + '-' + pad2(m + 1) + '-01';
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const monthEnd = y + '-' + pad2(m + 1) + '-' + pad2(daysInMonth);
    const today = todayISO();
    if (!S.calSelectedDate) S.calSelectedDate = today;
    const items = gatherCalendarItems();
    const monthItems = items.filter(it => it.date <= monthEnd && it.end >= monthStart)
      .sort((a, b) => a.date.localeCompare(b.date) || a.kind.localeCompare(b.kind));
    const monthPlans = S.plans.filter(p => p.start_date && String(p.start_date).slice(0, 10) <= monthEnd &&
      String(p.end_date || p.start_date).slice(0, 10) >= monthStart);
    const count = k => monthItems.filter(it => it.kind === k).length;

    const toggles = [['plans', 'Plans', 'plan'], ['projects', 'Projects', 'project'], ['tasks', 'Tasks', 'task']].map(([k, lbl, cls]) =>
      '<label class="ya-chip-check"><input type="checkbox" name="cal_show" value="' + k + '"' + (S.calShow[k] ? ' checked' : '') + '>' +
      '<span class="ya-cal-dot ' + cls + '"></span><span>' + lbl + '</span></label>').join('');

    let calBody;
    if (S.calMode === 'agenda') {
      calBody = monthItems.length
        ? tableWrap(['Date', 'Type', 'Title', 'Details', ''], monthItems.map(it =>
            '<tr><td data-l="Date">' + esc(fmt(it.date)) + (it.end !== it.date ? '<div class="ya-muted ya-item-s">to ' + esc(fmt(it.end)) + '</div>' : '') + '</td>' +
            '<td data-l="Type"><span class="ya-cal-pill ' + it.kind + '">' + esc(cap(it.kind)) + '</span></td>' +
            '<td data-l="Title"><strong>' + esc(it.title) + '</strong></td><td data-l="Details">' + esc(it.sub) + '</td>' +
            '<td class="ya-acts">' + ((it.kind === 'task' || canEdit()) ? '<button class="ya-btn small ghost" data-ya="cal-open" data-k="' + it.kind + '" data-id="' + esc(it.id) + '" data-date="' + esc(it.date) + '">' + (it.kind === 'task' ? 'Open' : 'Edit') + '</button>' : '') + '</td></tr>').join(''))
        : '<div class="ya-empty">Nothing scheduled in ' + esc(monthName) + '.</div>';
    } else {
      const firstDay = new Date(y, m, 1).getDay();
      const cells = [];
      for (let i = 0; i < firstDay; i++) cells.push('<div class="ya-cal-cell empty" aria-hidden="true"></div>');
      for (let d = 1; d <= daysInMonth; d++) {
        const iso = y + '-' + pad2(m + 1) + '-' + pad2(d);
        const dayItems = items.filter(it => it.date <= iso && it.end >= iso);
        const pills = dayItems.slice(0, 3).map(it =>
          '<button type="button" class="ya-cal-pill ' + it.kind + (it.date !== iso ? ' cont' : '') + (it.done ? ' done' : '') + '" data-ya="cal-open" data-k="' + it.kind + '" data-id="' + esc(it.id) + '" data-date="' + iso + '" title="' + esc(it.title + ' — ' + it.sub) + '">' + esc(it.title) + '</button>').join('') +
          (dayItems.length > 3 ? '<span class="ya-more">+' + (dayItems.length - 3) + ' more</span>' : '');
        const dow = new Date(y, m, d).getDay();
        cells.push('<div class="ya-cal-cell' + (iso === today ? ' today' : '') + (iso === S.calSelectedDate ? ' sel' : '') + ((dow === 0 || dow === 6) ? ' wkend' : '') + '" data-ya="cal-day" data-date="' + iso + '" role="button" tabindex="0" aria-label="' + esc(fmt(iso) + (dayItems.length ? ', ' + dayItems.length + ' item(s)' : '')) + '">' +
          '<div class="ya-cal-num">' + d + '</div>' + pills + '</div>');
      }
      while (cells.length % 7) cells.push('<div class="ya-cal-cell empty" aria-hidden="true"></div>');
      calBody = '<div class="ya-cal-grid">' +
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(w => '<div class="ya-cal-head">' + w + '</div>').join('') +
        cells.join('') + '</div>';
    }

    const sel = S.calSelectedDate;
    const selD = parseD(sel);
    const dItems = items.filter(it => it.date <= sel && it.end >= sel);
    const dayPanel = '<div class="ya-card ya-day">' +
      '<div class="ya-day-dow">' + esc(selD.toLocaleDateString('en-IN', { weekday: 'long' })) + (sel === today ? ' · Today' : '') + '</div>' +
      '<h3 class="ya-day-title">' + esc(fmt(sel)) + '</h3>' +
      (dItems.length ? '<ul class="ya-day-list">' + dItems.map(calItemRow).join('') + '</ul>' : '<p class="ya-muted ya-day-empty">Nothing scheduled on this date.</p>') +
      (canEdit() ? '<div class="ya-actions start">' +
        '<button class="ya-btn small ok" data-ya="new-plan-date" data-date="' + esc(sel) + '">+ Plan</button>' +
        '<button class="ya-btn small" data-ya="new-proj-date" data-date="' + esc(sel) + '">+ Project milestone</button></div>' : '') +
      '</div>';

    const planCard = '<div class="ya-card"><div class="ya-side-card-h"><strong>Plans in ' + esc(monthName) + '</strong><span class="ya-count-pill">' + monthPlans.length + '</span></div>' +
      (monthPlans.length
        ? '<div class="ya-pill-row">' + monthPlans.map(p =>
            '<button class="ya-plan-pill" data-ya="edit-plan" data-id="' + esc(p.id) + '">' + esc(p.title) + ' <span>' + esc(fmt(p.start_date)) + '</span></button>').join('') + '</div>'
        : '<p class="ya-muted ya-day-empty">No plans this month. Pick a date and add one.</p>') + '</div>';

    const head = '<div class="ya-cal-bar">' +
      '<div class="ya-cal-nav">' +
      '<button class="ya-btn small ghost ya-sq" data-ya="cal-prev" aria-label="Previous month">‹</button>' +
      '<h2 class="ya-cal-title">' + esc(monthName) + '</h2>' +
      '<button class="ya-btn small ghost ya-sq" data-ya="cal-next" aria-label="Next month">›</button>' +
      '<button class="ya-btn small ghost" data-ya="cal-today">Today</button></div>' +
      '<div class="ya-cal-ctrl">' + toggles +
      '<div class="ya-seg"><button class="' + (S.calMode === 'month' ? 'on' : '') + '" data-ya="cal-mode" data-m="month">Grid</button>' +
      '<button class="' + (S.calMode === 'agenda' ? 'on' : '') + '" data-ya="cal-mode" data-m="agenda">Agenda</button></div></div></div>' +
      '<p class="ya-cal-sum">' + count('plan') + ' plan(s) · ' + count('project') + ' project milestone(s) · ' + count('task') + ' task(s) in ' + esc(monthName) + '</p>';

    return '<div class="ya-cal-layout"><div class="ya-card ya-cal-main">' + head + calBody + '</div>' +
      '<aside class="ya-cal-side">' + dayPanel + planCard + '</aside></div>';
  }

  /* ---------- modals ---------- */
  function openDetail(kind, r) {
    const rows = kind === 'member'
      ? Object.keys(r).filter(k => k !== 'id').map(k => [k.replace(/_/g, ' '), r[k]])
      : APP_DETAIL.map(([label, k]) => [label, k === 'created_at' || k === 'reviewed_at' ? fmt(r[k]) : r[k]]);
    let buttons = '';
    let notes = '';
    if (kind === 'member') {
      buttons = '<button class="ya-btn ghost" data-ya="edit-member" data-kind="member" data-id="' + esc(r.id) + '">Edit</button>' +
                '<button class="ya-btn danger" data-ya="delete" data-kind="member" data-id="' + esc(r.id) + '">Delete</button>';
    } else {
      if (r.status === 'pending') buttons += '<button class="ya-btn ok" data-ya="approve-open" data-id="' + esc(r.id) + '">Approve</button><button class="ya-btn warn" data-ya="reject" data-id="' + esc(r.id) + '">Reject</button>';
      if (r.status === 'rejected') buttons += '<button class="ya-btn ghost" data-ya="restore" data-id="' + esc(r.id) + '">Move to pending</button>';
      notes = '<h3 style="margin-top:18px">Admin notes</h3><label class="ya-field"><textarea name="admin_notes" rows="3">' + esc(r.admin_notes || '') + '</textarea></label><div class="ya-actions start"><button class="ya-btn small" data-ya="save-notes" data-id="' + esc(r.id) + '">Save note</button></div><p class="ya-msg" id="ya-msg" role="status"></p>';
      buttons += '<button class="ya-btn danger" data-ya="delete" data-kind="app" data-id="' + esc(r.id) + '">Delete</button>';
    }
    openModal('<h3>' + esc(r.full_name || 'Record') + '</h3><dl class="ya-dl">' +
      rows.map(([k, v]) => '<dt>' + esc(k) + '</dt><dd>' + (v == null || v === '' ? '<span class="ya-muted">—</span>' : esc(cellVal(v))) + '</dd>').join('') +
      '</dl>' + notes + '<div class="ya-actions">' + buttons + '<button class="ya-btn ghost" data-ya="close">Close</button></div>');
  }
  async function openApprove(r) {
    const idRes = await sb().rpc('next_member_id');
    if (idRes.error) return toast('Could not generate a Member ID: ' + idRes.error.message, false);
    openModal('<h3>Approve application</h3>' +
      '<p>' + esc(r.full_name) + ' (' + esc(r.email) + ') will be added to <strong>members</strong> with the Member ID below, and the application marked approved.</p>' +
      '<div class="ya-grid2">' +
      '<label class="ya-field"><span>Member ID (automatic)</span><input value="' + esc(idRes.data) + '" readonly class="ya-readonly"></label>' +
      affiliationSelect(guessAffiliation(r.institution)) +
      '</div><p class="ya-msg" id="ya-msg" role="status"></p>' +
      '<div class="ya-actions"><button class="ya-btn ghost" data-ya="close">Cancel</button>' +
      '<button class="ya-btn ok" data-ya="approve-submit" data-id="' + esc(r.id) + '">Approve and add member</button></div>');
  }
  function openEditMember(r, previewId) {
    const adding = !r;
    const fields = MEMBER_FIELDS.map(([k, label, req]) => {
      if (k === 'affiliation') return affiliationSelect(adding ? '' : r[k]);
      const v = adding ? (k === 'status' ? 'Active' : '') : r[k];
      return '<label class="ya-field"><span>' + esc(label) + (req ? ' *' : '') + '</span><input name="' + k + '" value="' + esc(v) + '"></label>';
    }).join('');
    const idField = adding
      ? '<label class="ya-field"><span>Member ID (automatic)</span><input value="' + esc(previewId || '') + '" readonly class="ya-readonly"></label>' +
        '<label class="ya-field"><span>Joined on</span><input name="joined_at" type="date" value="' + todayISO() + '"></label>'
      : '';
    openModal('<h3>' + (adding ? 'Add member' : 'Edit member') + '</h3>' +
      (adding ? '<p class="ya-muted">Adds a person straight to the members list.</p>'
              : '<p class="ya-muted">Member ID: <strong>' + esc(r.member_id) + '</strong></p>') +
      '<div class="ya-grid2">' + idField + fields + '</div><p class="ya-msg" id="ya-msg" role="status"></p>' +
      '<div class="ya-actions"><button class="ya-btn ghost" data-ya="close">Cancel</button>' +
      '<button class="ya-btn" data-ya="save-member" data-kind="member" data-id="' + esc(adding ? '' : r.id) + '">' + (adding ? 'Add member' : 'Save changes') + '</button></div>');
  }
  function openDelete(kind, r) {
    openModal('<h3>Delete this record?</h3><p>' + esc(r.full_name || r.email || r.name || r.title || 'This record') + ' will be removed permanently. This cannot be undone.</p>' +
      '<div class="ya-actions"><button class="ya-btn ghost" data-ya="close">Cancel</button>' +
      '<button class="ya-btn danger" data-ya="confirm-delete" data-kind="' + kind + '" data-id="' + esc(r.id) + '">Delete permanently</button></div>');
  }

  /* ---------- rendering ---------- */
  function badge(s) { return '<span class="ya-b ' + esc(String(s || 'pending').toLowerCase()) + '">' + esc(cap(s || 'pending')) + '</span>'; }
  const btn = (act, kind, id, label, cls) =>
    '<button class="ya-btn small ' + (cls || 'ghost') + '" data-ya="' + act + '" data-kind="' + kind + '" data-id="' + esc(id) + '">' + label + '</button>';

  function sortTh(label, colKey) {
    if (!colKey) return '<th>' + esc(label) + '</th>';
    const arrow = S.sort.col === colKey ? (S.sort.dir === 1 ? ' ▲' : ' ▼') : '';
    return '<th><button class="ya-sort-btn" data-ya="sort" data-col="' + esc(colKey) + '">' + esc(label) + arrow + '</button></th>';
  }

  function appsTable(rows) {
    if (!rows.length) return emptyState();
    const body = rows.map(r => {
      let acts = btn('detail', 'app', r.id, 'View');
      if (r.status === 'pending') acts += btn('approve-open', 'app', r.id, 'Approve', 'ok') + btn('reject', 'app', r.id, 'Reject', 'warn');
      if (r.status === 'rejected') acts += btn('restore', 'app', r.id, 'Restore');
      acts += btn('delete', 'app', r.id, 'Delete', 'danger');
      return '<tr>' +
        '<td data-l="Name"><strong>' + esc(r.full_name) + '</strong></td>' +
        '<td data-l="Email">' + esc(r.email) + '</td>' +
        '<td data-l="Institution">' + esc(r.institution || '—') + '</td>' +
        '<td data-l="Role">' + esc(r.role || '—') + '</td>' +
        '<td data-l="Applied">' + esc(fmt(r.created_at)) + '</td>' +
        '<td data-l="Status">' + badge(r.status) + '</td>' +
        '<td class="ya-acts">' + acts + '</td></tr>';
    }).join('');
    return '<div class="ya-tablewrap"><table class="ya-table"><thead><tr>' +
      sortTh('Name', 'full_name') + sortTh('Email', 'email') + sortTh('Institution', 'institution') +
      sortTh('Role', 'role') + sortTh('Applied', 'created_at') + sortTh('Status', 'status') + '<th></th>' +
      '</tr></thead><tbody>' + body + '</tbody></table></div>';
  }
  function membersTable(rows) {
    if (!rows.length) return emptyState();
    const body = rows.map(r =>
      '<tr>' +
      '<td data-l="Member ID">' + esc(r.member_id) + '</td>' +
      '<td data-l="Name"><strong>' + esc(r.full_name) + '</strong></td>' +
      '<td data-l="Email">' + esc(r.email || '—') + '</td>' +
      '<td data-l="Body">' + esc(r.current_body || '—') + '</td>' +
      '<td data-l="Designation">' + esc(r.current_designation || '—') + '</td>' +
      '<td data-l="Affiliation">' + esc(r.affiliation || '—') + '</td>' +
      '<td data-l="Status">' + badge(r.status) + '</td>' +
      '<td class="ya-acts">' + btn('detail', 'member', r.id, 'View') + btn('edit-member', 'member', r.id, 'Edit') +
      btn('member-role', 'member', r.id, 'Body &amp; role') + btn('delete', 'member', r.id, 'Delete', 'danger') + '</td></tr>').join('');
    return '<div class="ya-tablewrap"><table class="ya-table"><thead><tr>' +
      sortTh('Member ID', 'member_id') + sortTh('Name', 'full_name') + sortTh('Email', 'email') +
      sortTh('Body', 'current_body') + sortTh('Designation', 'current_designation') + sortTh('Affiliation', 'affiliation') +
      sortTh('Status', 'status') + '<th></th>' +
      '</tr></thead><tbody>' + body + '</tbody></table></div>';
  }
  function tableWrap(heads, body) {
    return '<div class="ya-tablewrap"><table class="ya-table"><thead><tr>' +
      heads.map(h => '<th>' + esc(h) + '</th>').join('') + '</tr></thead><tbody>' + body + '</tbody></table></div>';
  }
  function emptyState() {
    return '<div class="ya-empty">' + (S.q ? 'No records match "' + esc(S.q) + '". Try a shorter word.' : 'Nothing here yet.') + '</div>';
  }
  function listHTML() {
    const rows = filterRows(viewList(), S.view === 'members' ? MEMBER_SEARCH : ['full_name', 'email', 'institution']);
    return S.view === 'members' ? membersTable(rows) : appsTable(rows);
  }
  function breakdown(field, names) {
    const total = S.members.length || 1;
    const rows = names.map(n => {
      const c = S.members.filter(m => m[field] === n).length;
      return '<tr><td>' + esc(n) + '</td><td class="ya-num">' + c + '</td>' +
        '<td style="width:40%"><div class="ya-bar"><span style="width:' + Math.round(c / total * 100) + '%"></span></div></td></tr>';
    }).join('');
    const unset = S.members.filter(m => !m[field]).length;
    return '<table class="ya-table"><tbody>' + (rows || '<tr><td class="ya-muted">No entries yet.</td></tr>') +
      (unset ? '<tr><td class="ya-muted">Not set</td><td class="ya-num">' + unset + '</td><td></td></tr>' : '') +
      '</tbody></table>';
  }
  function welcomeHTML() {
    const me = S.user && S.user.id;
    const name = nameOfAdmin(me);
    const email = S.user && S.user.email;
    const linked = name && name !== email;
    const mine = S.tasks.filter(t => t.assignee_user_id === me && t.status !== 'done').length;
    const quickBtns = '<div class="ya-quick-actions">' +
      (canEdit() ? '<button class="ya-btn small ok" data-ya="add-member">+ Member</button>' +
        '<button class="ya-btn small" data-ya="new-plan">+ Plan</button>' +
        '<button class="ya-btn small cy" data-ya="new-project">+ Project</button>' +
        '<button class="ya-btn small ghost" data-ya="nav" data-v="email">Email</button>' : '') +
      '<button class="ya-btn small ghost" data-ya="nav" data-v="calendar">Calendar</button>' +
      '<button class="ya-btn small ghost" data-ya="nav" data-v="export">Export</button>' +
      '</div>';
    return '<div class="ya-welcome"><div><h2>Welcome, ' + esc(linked ? name : (email || '')) + '</h2>' +
      '<p class="ya-muted" style="margin:0">' + esc(ROLE_LABEL[S.role] || 'Viewer') + ' · ' + (mine ? mine + ' open task' + (mine === 1 ? '' : 's') + ' assigned to you' : 'No open tasks assigned to you') + '</p>' +
      (linked ? '' : '<p class="ya-muted ya-note">Your login is not linked to a member name yet. A super admin can link it in Admin Users.</p>') +
      '</div>' + quickBtns + '</div>';
  }
  function overviewHTML() {
    const openTasks = S.tasks.filter(t => t.status !== 'done').length;
    const overdue = S.tasks.filter(t => t.status !== 'done' && t.due_date && t.due_date < todayISO()).length;
    const activePlans = S.plans.filter(p => p.status !== 'completed').length;
    const activeProj = S.projects.filter(p => p.status !== 'completed').length;
    const stat = (label, valStr, cls, navView) =>
      '<button class="ya-stat ' + cls + '" data-ya="nav" data-v="' + navView + '"><span>' + label + '</span><strong>' + valStr + '</strong></button>';
    const upcoming = gatherCalendarItems(true).filter(it => it.end >= todayISO() && !it.done).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);
    const upcomingCard = '<div class="ya-card"><div class="ya-toolbar" style="justify-content:space-between;margin-bottom:8px">' +
      '<h2 class="ya-h2" style="margin:0">Upcoming schedule</h2><button class="ya-linkbtn" data-ya="nav" data-v="calendar">Open calendar →</button></div>' +
      (upcoming.length
        ? '<ul class="ya-day-list">' + upcoming.map(it =>
            '<li class="ya-item"><span class="ya-cal-pill ' + it.kind + '">' + esc(fmt(it.date < todayISO() ? todayISO() : it.date)) + '</span><div class="ya-item-t"><strong>' + esc(it.title) + '</strong><div class="ya-muted ya-item-s">' + esc(it.sub) + '</div></div></li>').join('') + '</ul>'
        : '<p class="ya-muted">No upcoming plans or tasks scheduled.</p>') + '</div>';
    const affCard = '<div class="ya-card"><h2 class="ya-h2" style="margin-top:0">Affiliation Split</h2>' +
      breakdown('affiliation', AFFILIATIONS) + '</div>';

    return welcomeHTML() +
      '<div class="ya-stats">' +
      stat('Total Members', S.members.length, 'ok', 'members') +
      stat('Pending Apps', appsByStatus('pending').length, 'warn', 'pending') +
      stat('Active Plans', activePlans, 'bl', 'plans') +
      stat('Planned Projects', activeProj, 'cy', 'projects') +
      stat('Open Tasks' + (overdue ? ' (' + overdue + ' late)' : ''), openTasks, overdue ? 'bad' : '', 'tasks') +
      '</div>' +
      '<div class="ya-two" style="margin-top:16px">' + upcomingCard + affCard + '</div>' +
      '<div class="ya-two" style="margin-top:16px"><div class="ya-card"><h2 class="ya-h2" style="margin-top:0">Members by body</h2>' + breakdown('current_body', S.groups.map(g => g.name)) + '</div>' +
      '<div class="ya-card"><h2 class="ya-h2" style="margin-top:0">Members by designation</h2>' + breakdown('current_designation', orderedPositions().map(p => p.name)) + '</div></div>' +
      '<h2 class="ya-h2">Latest pending applications</h2>' + appsTable(appsByStatus('pending').slice(0, 5)) +
      (appsByStatus('pending').length > 5 ? '<p><button class="ya-btn ghost" data-ya="nav" data-v="pending">View all pending →</button></p>' : '');
  }

  async function loadAdmins() {
    const res = await sb().rpc('list_admins');
    if (res.error) { S.admins = []; S.error = 'Could not load admin list: ' + res.error.message; return; }
    S.admins = (res.data || []).map(a => ({ id: a.admin_user_id, email: a.admin_email, since: a.admin_since, role: a.admin_role, memberId: a.admin_member_id, memberName: a.admin_member_name }));
  }
  function adminsHTML() {
    const me = S.user && S.user.id;
    const roleCell = a => a.id === me || !isSuper()
      ? esc(ROLE_LABEL[a.role] || a.role)
      : '<select name="admin_role" data-id="' + esc(a.id) + '" aria-label="Role">' +
        ['super_admin', 'admin', 'viewer'].map(r => '<option value="' + r + '"' + (a.role === r ? ' selected' : '') + '>' + esc(ROLE_LABEL[r]) + '</option>').join('') +
        '</select>';
    const memberCell = a => !isSuper()
      ? esc(a.memberName || '—')
      : '<select name="admin_member" data-id="' + esc(a.id) + '" aria-label="Linked member">' +
        '<option value="">— not linked —</option>' +
        S.members.slice().sort((x, y) => String(x.full_name).localeCompare(String(y.full_name))).map(m =>
          '<option value="' + esc(m.id) + '"' + (a.memberId === m.id ? ' selected' : '') + '>' + esc(m.full_name) + ' (' + esc(m.member_id) + ')</option>').join('') +
        '</select>';
    const rows = S.admins.map(a =>
      '<tr><td data-l="Email"><strong>' + esc(a.email) + '</strong>' + (a.id === me ? ' <span class="ya-muted">(you)</span>' : '') + '</td>' +
      '<td data-l="Member">' + memberCell(a) + '</td>' +
      '<td data-l="Role">' + roleCell(a) + '</td>' +
      '<td data-l="Admin since">' + esc(fmt(a.since)) + '</td>' +
      '<td class="ya-acts">' + (a.id === me ? '<span class="ya-muted">—</span>' :
        '<button class="ya-btn small danger" data-ya="remove-admin" data-id="' + esc(a.id) + '" data-email="' + esc(a.email) + '">Remove access</button>') + '</td></tr>').join('');
    return '<div class="ya-toolbar"><button class="ya-btn small ok" data-ya="add-admin">+ Add admin</button>' +
      '<span class="ya-muted">' + S.admins.length + ' admin(s)</span></div>' +
      '<p class="ya-muted ya-note"><strong>Super admin</strong>: everything. <strong>Admin</strong>: view, edit, approve, plans, projects, emails. <strong>Viewer</strong>: read only.</p>' +
      (rows ? tableWrap(['Email', 'Member', 'Role', 'Admin since', ''], rows) : emptyState());
  }
  async function setAdminMember(userId, memberId) {
    const res = await sb().rpc('set_admin_member', { p_user_id: userId, p_member_id: memberId || null });
    if (res.error) toast(res.error.message.indexOf('admin_users_member_unique') >= 0 ? 'That member is already linked to another admin.' : res.error.message, false);
    else toast('Linked member updated.');
    await loadAdmins();
    renderApp();
  }
  function dueLabel(t) {
    if (!t.due_date) return '—';
    const overdue = t.status !== 'done' && t.due_date < todayISO();
    return '<span' + (overdue ? ' style="color:#d6395a;font-weight:700"' : '') + '>' + esc(fmt(t.due_date)) + (overdue ? ' (overdue)' : '') + '</span>';
  }
  function tasksHTML() {
    const me = S.user && S.user.id;
    const f = S.taskFilter;
    const list = S.tasks.filter(t => f === 'all' ? true : f === 'mine' ? t.assignee_user_id === me : t.status === f);
    const statusTxt = { open: 'Open', in_progress: 'In progress', done: 'Done' };
    const rows = list.map(t => {
      const mine = t.assignee_user_id === me;
      let acts = '';
      if (mine) {
        if (t.status === 'open') acts += '<button class="ya-btn small ghost" data-ya="task-status" data-id="' + esc(t.id) + '" data-status="in_progress">Start</button>';
        if (t.status !== 'done') acts += '<button class="ya-btn small ok" data-ya="task-status" data-id="' + esc(t.id) + '" data-status="done">Mark done</button>';
        else acts += '<button class="ya-btn small ghost" data-ya="task-status" data-id="' + esc(t.id) + '" data-status="open">Reopen</button>';
      }
      acts += btn('delete', 'task', t.id, 'Delete', 'danger');
      return '<tr><td data-l="Task"><strong>' + esc(t.title) + '</strong>' + (t.description ? '<div class="ya-muted">' + esc(t.description) + '</div>' : '') + '</td>' +
        '<td data-l="Assigned to">' + esc(nameOfAdmin(t.assignee_user_id) || '—') + (mine ? ' <span class="ya-muted">(you)</span>' : '') + '</td>' +
        '<td data-l="Due">' + dueLabel(t) + '</td>' +
        '<td data-l="Status"><span class="ya-b ' + (t.status === 'done' ? 'approved' : t.status === 'in_progress' ? 'pending' : 'rejected') + '">' + esc(statusTxt[t.status] || t.status) + '</span></td>' +
        '<td class="ya-acts">' + acts + '</td></tr>';
    }).join('');
    const filterSel = '<select id="ya-task-filter" aria-label="Show">' +
      [['all', 'All tasks'], ['mine', 'Assigned to me'], ['open', 'Open'], ['in_progress', 'In progress'], ['done', 'Done']]
        .map(([v, l]) => '<option value="' + v + '"' + (f === v ? ' selected' : '') + '>' + l + '</option>').join('') + '</select>';
    return '<div class="ya-toolbar">' + (canEdit() ? '<button class="ya-btn small ok" data-ya="new-task">+ New task</button>' : '') +
      filterSel + '<span class="ya-muted">' + list.length + ' task(s)</span></div>' +
      (rows ? tableWrap(['Task', 'Assigned to', 'Due', 'Status', ''], rows) : emptyState());
  }
  function openTask() {
    if (!S.directory.length) return toast('No admins to assign to yet.', false);
    const people = S.directory.map(d => '<option value="' + esc(d.id) + '">' + esc(d.name) + '</option>').join('');
    openModal('<h3>New task</h3><div class="ya-grid2">' +
      '<label class="ya-field" style="grid-column:1/-1"><span>Title *</span><input name="title" placeholder="e.g. Prepare AEC slides"></label>' +
      '<label class="ya-field"><span>Assign to *</span><select name="assignee_user_id">' + people + '</select></label>' +
      '<label class="ya-field"><span>Due date</span><input name="due_date" type="date"></label>' +
      '<label class="ya-field" style="grid-column:1/-1"><span>Details</span><textarea name="description" rows="3"></textarea></label>' +
      '</div><p class="ya-msg" id="ya-msg" role="status"></p>' +
      '<div class="ya-actions"><button class="ya-btn ghost" data-ya="close">Cancel</button><button class="ya-btn" data-ya="save-task">Create task</button></div>');
  }
  async function saveTask() {
    const m = modalEl();
    const title = val(m, 'title');
    const assignee = val(m, 'assignee_user_id');
    if (!title) return modalMsg('Title is required.');
    if (!assignee) return modalMsg('Choose who to assign it to.');
    const res = await sb().from(TASKS).insert({
      title: title, assignee_user_id: assignee, due_date: val(m, 'due_date') || null,
      description: val(m, 'description') || null
    }).select('id');
    if (res.error) return modalMsg(res.error.message);
    closeModal();
    const taskId = res.data && res.data[0] && res.data[0].id;
    if (taskId) await notifyTask(taskId, 'assigned');
    else toast('Task created.');
    await loadTasks();
    renderApp();
  }
  async function setTaskStatus(id, status) {
    const res = await sb().rpc('set_task_status', { p_task_id: id, p_status: status });
    if (res.error) return toast(res.error.message, false);
    if (status === 'done') await notifyTask(id, 'done');
    else toast('Task updated.');
    await loadTasks();
    renderApp();
  }
  async function setRole(userId, role) {
    const res = await sb().rpc('set_admin_role', { p_user_id: userId, p_role: role });
    if (res.error) toast(res.error.message, false);
    else toast('Role updated.');
    await loadAdmins();
    renderApp();
  }
  function openAddAdmin() {
    openModal('<h3>Add admin</h3>' +
      '<p class="ya-muted">Enter the email of an existing login in Supabase Authentication.</p>' +
      '<label class="ya-field"><span>Email *</span><input name="admin_email" type="email" placeholder="name@example.com"></label>' +
      '<label class="ya-field"><span>Role *</span><select name="admin_role"><option value="admin" selected>Admin</option><option value="viewer">Viewer</option><option value="super_admin">Super admin</option></select></label>' +
      '<p class="ya-msg" id="ya-msg" role="status"></p>' +
      '<div class="ya-actions"><button class="ya-btn ghost" data-ya="close">Cancel</button>' +
      '<button class="ya-btn" data-ya="save-admin">Make admin</button></div>');
  }
  async function addAdmin() {
    const email = val(modalEl(), 'admin_email');
    if (!email) return modalMsg('Enter an email address.');
    const role = val(modalEl(), 'admin_role') || 'admin';
    const res = await sb().rpc('add_admin', { p_email: email, p_role: role });
    if (res.error) return modalMsg(res.error.message);
    closeModal();
    toast('Admin added: ' + email);
    await loadAdmins();
    renderApp();
  }
  function openRemoveAdmin(userId, email) {
    openModal('<h3>Remove admin access?</h3><p>' + esc(email) + ' will no longer be able to use this dashboard. Their login is kept.</p>' +
      '<div class="ya-actions"><button class="ya-btn ghost" data-ya="close">Cancel</button>' +
      '<button class="ya-btn danger" data-ya="confirm-remove-admin" data-id="' + esc(userId) + '">Remove access</button></div>');
  }
  async function removeAdmin(userId) {
    const res = await sb().rpc('remove_admin', { p_user_id: userId });
    if (res.error) return toast(res.error.message, false);
    closeModal();
    toast('Admin access removed.');
    await loadAdmins();
    renderApp();
  }

  const valueText = v => Array.isArray(v) ? v.join(' ') : (v == null ? '' : String(v));
  function searchResultsHTML() {
    const q = S.gq.trim().toLowerCase();
    if (!q) return '<div class="ya-empty">Type a name, email, Member ID, plan, project, or task above, then press Search.</div>';
    const hit = obj => Object.keys(obj).some(k => !/(^id$|_id$|_at$|_by$)/.test(k) && valueText(obj[k]).toLowerCase().indexOf(q) >= 0);
    const mem = S.members.filter(hit);
    const app = S.apps.filter(hit);
    const pln = S.plans.filter(hit);
    const prj = S.projects.filter(hit);
    const tsk = S.tasks.filter(hit);
    const total = mem.length + app.length + pln.length + prj.length + tsk.length;
    const section = (title, count, body) => count ? '<h2 class="ya-h2">' + esc(title) + ' (' + count + ')</h2>' + body : '';
    return '<p class="ya-muted">' + total + ' result(s) for "' + esc(S.gq) + '"</p>' +
      (total ? '' : '<div class="ya-empty">Nothing matches "' + esc(S.gq) + '".</div>') +
      section('Members', mem.length, membersTable(mem)) +
      section('Applications', app.length, appsTable(app)) +
      section('Club Plans', pln.length, tableWrap(['Plan', 'Category', 'Start Date', 'Status'], pln.map(p => '<tr><td><strong>' + esc(p.title) + '</strong></td><td>' + esc(p.category) + '</td><td>' + esc(fmt(p.start_date)) + '</td><td>' + esc(cap(p.status)) + '</td></tr>').join(''))) +
      section('Projects Planned', prj.length, tableWrap(['Project', 'Lead', 'Target Date', 'Status'], prj.map(p => '<tr><td><strong>' + esc(p.title) + '</strong></td><td>' + esc(p.lead || '—') + '</td><td>' + esc(fmt(p.target_date)) + '</td><td>' + esc(cap(p.status)) + '</td></tr>').join(''))) +
      section('Tasks', tsk.length, tableWrap(['Task', 'Assigned to', 'Status'], tsk.map(t => '<tr><td><strong>' + esc(t.title) + '</strong></td><td>' + esc(nameOfAdmin(t.assignee_user_id) || '—') + '</td><td>' + esc(t.status) + '</td></tr>').join('')));
  }

  function activityHTML() {
    if (!S.activity.length) return emptyState();
    const label = { members: 'Member', membership_applications: 'Application', member_groups: 'Group', member_positions: 'Position' };
    const body = S.activity.map(a =>
      '<tr><td data-l="When">' + esc(new Date(a.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })) + '</td>' +
      '<td data-l="Who">' + esc(a.actor_email || 'Applicant / website') + '</td>' +
      '<td data-l="Action">' + esc(cap(a.action)) + '</td>' +
      '<td data-l="Record">' + esc(label[a.table_name] || a.table_name) + '</td>' +
      '<td data-l="Name"><strong>' + esc(a.summary || '—') + '</strong></td></tr>').join('');
    return '<p class="ya-muted ya-note">The most recent 300 changes recorded by database triggers.</p>' +
      tableWrap(['When', 'Who', 'Action', 'Record', 'Name'], body);
  }

  function viewBody() {
    if (S.view === 'overview') return overviewHTML();
    if (S.view === 'calendar') return calendarHTML();
    if (S.view === 'plans') return plansHTML();
    if (S.view === 'projects') return projectsHTML();
    if (S.view === 'structure') return structureHTML();
    if (S.view === 'activity') return activityHTML();
    if (S.view === 'admins') return adminsHTML();
    if (S.view === 'tasks') return tasksHTML();
    if (S.view === 'search') return searchResultsHTML();
    if (S.view === 'email') return emailHTML();
    if (S.view === 'export') return exportHTML();
    const statusSel = S.view === 'members'
      ? '<select id="ya-status" aria-label="Filter by status">' +
        ['all'].concat(memberStatuses()).map(s =>
          '<option value="' + esc(s) + '"' + (S.status === s ? ' selected' : '') + '>' + (s === 'all' ? 'All statuses' : esc(s)) + '</option>').join('') +
        '</select>' : '';
    const addBtn = S.view === 'members' ? '<button class="ya-btn small ok" data-ya="add-member">+ Add member</button>' : '';
    return '<div class="ya-toolbar">' + addBtn + '<input id="ya-q" type="search" placeholder="Search by name, email, institution or member ID" value="' + esc(S.q) + '">' +
      statusSel + '<span class="ya-muted" id="ya-count"></span></div><div id="ya-list">' + listHTML() + '</div>';
  }

  function navBadge(k) {
    if (k === 'pending' && appsByStatus('pending').length) return ' <span class="ya-nav-badge warn">' + appsByStatus('pending').length + '</span>';
    if (k === 'tasks') {
      const n = S.tasks.filter(t => t.status !== 'done').length;
      if (n) return ' <span class="ya-nav-badge">' + n + '</span>';
    }
    if (k === 'plans' && S.plans.length) return ' <span class="ya-nav-badge">' + S.plans.length + '</span>';
    if (k === 'projects' && S.projects.length) return ' <span class="ya-nav-badge">' + S.projects.length + '</span>';
    return '';
  }

  function shell(content) {
    const navHtml = NAV_GROUPS.map(g => {
      const btns = g.items.filter(([k]) => (k !== 'admins' || isSuper()) && (k !== 'email' || canEdit()))
        .map(([k, l]) => '<button class="ya-nav-btn' + (S.view === k ? ' on' : '') + '" data-ya="nav" data-v="' + k + '"' + (S.view === k ? ' aria-current="page"' : '') + '><span class="ya-nav-l">' + svg(ICON[k] || ICON.overview, 18) + '<span>' + esc(l) + '</span></span>' + navBadge(k) + '</button>').join('');
      return btns ? '<div class="ya-nav-grp"><div class="ya-nav-lbl">' + esc(g.label) + '</div>' + btns + '</div>' : '';
    }).join('');
    const who = nameOfAdmin(S.user && S.user.id) || (S.user && S.user.email) || '';
    const initial = (who.trim().charAt(0) || 'A').toUpperCase();
    return '<div class="ya-wrap"><aside class="ya-side">' +
      '<div class="ya-brand"><span class="ya-logo">' + svg(ICON.bolt, 18) + '</span><span class="ya-brand-t"><b>Yantrika</b><small>Admin Console</small></span></div>' +
      '<div class="ya-nav" role="navigation" aria-label="Admin sections">' + navHtml + '</div>' +
      '<div class="ya-side-foot"><div class="ya-user"><span class="ya-avatar">' + esc(initial) + '</span>' +
      '<span class="ya-user-t"><strong>' + esc(who) + '</strong><span class="ya-role">' + esc(ROLE_LABEL[S.role] || 'Viewer') + '</span></span></div>' +
      '<button class="ya-btn ghost small" data-ya="logout">Sign out</button></div></aside>' +
      '<main class="ya-main">' + content + '</main></div>';
  }

  let lastView = null;
  function renderApp() {
    const r = root();
    if (!r) return;
    const keepY = lastView === S.view ? window.scrollY : 0;
    const title = S.view === 'search' ? 'Search results' : ((VIEWS.find(v => v[0] === S.view) || VIEWS[0])[1]);
    const desc = VIEW_DESC[S.view] || '';
    r.innerHTML = shell('<header class="ya-top"><div class="ya-top-l"><h1>' + esc(title) + '</h1>' +
      (desc ? '<p class="ya-sub">' + esc(desc) + '</p>' : '') + '</div>' +
      '<div class="ya-top-r"><div class="ya-searchbar"><span class="ya-search-ico">' + svg(ICON.search, 16) + '</span>' +
      '<input id="ya-global" type="search" placeholder="Search everything…" value="' + esc(S.gq) + '" aria-label="Search everything">' +
      '<button class="ya-btn small" data-ya="search-run">Search</button></div>' +
      '<button class="ya-btn ghost small" data-ya="reload">' + svg(ICON.refresh, 14) + ' Refresh</button></div></header>' +
      (S.error ? '<div class="ya-error">' + esc(S.error) + ' <button class="ya-btn small" data-ya="reload">Retry</button></div>' : '') +
      (S.notice ? '<div class="ya-notice">' + esc(S.notice) + '</div>' : '') +
      '<div id="ya-body">' + viewBody() + '</div>');
    applyPermissions(r);
    updateCount();
    lastView = S.view;
    if (keepY) window.scrollTo(0, keepY);
  }
  function updateCount() {
    const c = document.getElementById('ya-count');
    if (c && S.view !== 'overview') c.textContent = filterRows(viewList(), S.view === 'members' ? MEMBER_SEARCH : ['full_name', 'email', 'institution']).length + ' shown';
  }
  function showLogin(msg) {
    root().innerHTML = '<div class="ya-login"><div class="ya-card"><div class="ya-brand" style="border:0;padding:0 0 10px"><span class="ya-logo">' + svg(ICON.bolt, 18) + '</span><span class="ya-brand-t"><b>Yantrika</b><small>Admin Console</small></span></div><h1>Sign in</h1><p class="ya-muted">Yantrika administrators only.</p>' +
      '<form id="ya-login" class="ya-login-form">' +
      '<label>Email<input name="email" type="email" required autocomplete="username"></label>' +
      '<label>Password<input name="password" type="password" required autocomplete="current-password"></label>' +
      '<button class="ya-btn" type="submit" style="width:100%">Sign in</button><p id="ya-login-msg" class="ya-msg" role="status">' + esc(msg || '') + '</p></form></div></div>';
  }
  function showDenied() {
    root().innerHTML = '<div class="ya-login"><div class="ya-card"><h1>Access denied</h1>' +
      '<p>This account is not an administrator.</p>' +
      '<button class="ya-btn" data-ya="logout">Sign out</button></div></div>';
  }
  function injectStyles() {
    if (document.getElementById('ya-style')) return;
    const s = document.createElement('style');
    s.id = 'ya-style';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ---------- mount / auth ---------- */
  async function mount() {
    try { await mountUnsafe(); }
    catch (err) {
      console.error('Admin dashboard failed to start:', err);
      const r = root();
      if (r) r.innerHTML = '<div class="ya-error"><strong>The admin page could not start.</strong><br>' + esc((err && err.message) || String(err)) + '</div>';
    }
  }
  async function mountUnsafe() {
    injectStyles();
    if (!document.querySelector('meta[data-ya]')) {
      const m = document.createElement('meta');
      m.name = 'robots'; m.content = 'noindex,nofollow'; m.setAttribute('data-ya', '1');
      document.head.appendChild(m);
    }
    const r = root();
    if (!r) return;
    if (!sb()) { r.innerHTML = '<div class="ya-error">Could not reach the database. Reload the page and try again.</div>'; return; }
    clearSavedLogins();
    r.innerHTML = '<div class="ya-center">Loading…</div>';
    const { data: { session } } = await sb().auth.getSession();
    if (!session) return showLogin();
    S.user = session.user;
    const adm = await sb().rpc('is_admin');
    if (adm.error || adm.data !== true) return showDenied();
    const roleRes = await sb().rpc('my_role');
    S.role = (!roleRes.error && roleRes.data) || 'viewer';
    await loadDirectory();
    S.error = '';
    try { await loadAll(); }
    catch (err) { S.error = 'Could not load data: ' + (err.message || 'unknown error'); }
    await loadTasks();
    if (isSuper()) await loadAdmins();
    renderApp();
  }

  /* ---------- groups and positions ---------- */
  const byName = (a, b) => String(a.name).localeCompare(String(b.name));
  const posById = id => S.positions.find(p => p.id === id);
  const groupById = id => S.groups.find(g => g.id === id);
  const groupNameOf = id => (groupById(id) || {}).name || '';
  const membersIn = (field, name) => S.members.filter(m => m[field] === name).length;
  function positionDepth(p) {
    let d = 0, cur = p; const seen = {};
    while (cur && cur.parent_id && !seen[cur.id]) { seen[cur.id] = 1; d++; cur = posById(cur.parent_id); }
    return d;
  }
  function descendantIds(id) {
    const out = {};
    const walk = pid => S.positions.forEach(p => { if (p.parent_id === pid && !out[p.id]) { out[p.id] = 1; walk(p.id); } });
    walk(id);
    return out;
  }
  function orderedPositions() {
    const out = [];
    const visit = p => { out.push(p); S.positions.filter(c => c.parent_id === p.id).sort(byName).forEach(visit); };
    S.groups.slice().sort((a, b) => a.sort_order - b.sort_order).forEach(g => {
      S.positions.filter(p => p.group_id === g.id && (!p.parent_id || !posById(p.parent_id))).sort(byName).forEach(visit);
    });
    return out;
  }
  const positionLabel = p => '— '.repeat(positionDepth(p)) + p.name + ' (' + groupNameOf(p.group_id) + ')';

  function structureHTML() {
    const groupRows = S.groups.slice().sort((a, b) => a.sort_order - b.sort_order).map(g =>
      '<tr><td data-l="Order">' + esc(g.sort_order) + '</td>' +
      '<td data-l="Group"><button class="ya-linkbtn" data-ya="group-members" data-id="' + esc(g.id) + '">' + esc(g.name) + '</button></td>' +
      '<td data-l="Description">' + esc(g.description || '—') + '</td>' +
      '<td data-l="Members">' + membersIn('current_body', g.name) + '</td>' +
      '<td class="ya-acts">' + btn('edit-group', 'group', g.id, 'Edit') + btn('delete', 'group', g.id, 'Delete', 'danger') + '</td></tr>').join('');
    const posRows = orderedPositions().map(p =>
      '<tr><td data-l="Position"><span style="padding-left:' + (positionDepth(p) * 22) + 'px">' +
      (positionDepth(p) ? '↳ ' : '') + '<button class="ya-linkbtn" data-ya="position-members" data-id="' + esc(p.id) + '">' + esc(p.name) + '</button></span></td>' +
      '<td data-l="Group">' + esc(groupNameOf(p.group_id)) + '</td>' +
      '<td data-l="Reports to">' + esc((posById(p.parent_id) || {}).name || '—') + '</td>' +
      '<td data-l="Members">' + membersIn('current_designation', p.name) + '</td>' +
      '<td class="ya-acts">' + btn('edit-position', 'position', p.id, 'Edit') + btn('delete', 'position', p.id, 'Delete', 'danger') + '</td></tr>').join('');
    const head = (title, act, label) => '<div class="ya-toolbar"><h2 class="ya-h2" style="margin:0 auto 0 0">' + title +
      '</h2><button class="ya-btn small ok" data-ya="' + act + '">' + label + '</button></div>';
    return '<div class="ya-card">' + head('Groups', 'add-group', '+ Add group') +
      (groupRows ? tableWrap(['Order', 'Group', 'Description', 'Members', ''], groupRows) : emptyState()) + '</div>' +
      '<div class="ya-card" style="margin-top:16px">' + head('Positions and hierarchy', 'add-position', '+ Add position') +
      (posRows ? tableWrap(['Position', 'Group', 'Reports to', 'Members', ''], posRows) : emptyState()) + '</div>';
  }
  function openGroupForm(g) {
    openModal('<h3>' + (g ? 'Edit group' : 'Add group') + '</h3><div class="ya-grid2">' +
      '<label class="ya-field"><span>Name *</span><input name="name" value="' + esc(g ? g.name : '') + '"></label>' +
      '<label class="ya-field"><span>Order</span><input name="sort_order" type="number" value="' + esc(g ? g.sort_order : S.groups.length + 1) + '"></label>' +
      '<label class="ya-field" style="grid-column:1/-1"><span>Description</span><textarea name="description" rows="3">' + esc(g ? g.description || '' : '') + '</textarea></label>' +
      '</div><p class="ya-msg" id="ya-msg" role="status"></p>' +
      '<div class="ya-actions"><button class="ya-btn ghost" data-ya="close">Cancel</button>' +
      '<button class="ya-btn" data-ya="save-group" data-id="' + esc(g ? g.id : '') + '">Save</button></div>');
  }
  function openPositionForm(p) {
    const excluded = p ? descendantIds(p.id) : {};
    const groupOpts = S.groups.slice().sort((a, b) => a.sort_order - b.sort_order).map(g =>
      '<option value="' + esc(g.id) + '"' + (p && p.group_id === g.id ? ' selected' : '') + '>' + esc(g.name) + '</option>').join('');
    const parentOpts = '<option value="">None (top level)</option>' + orderedPositions()
      .filter(x => !(p && (x.id === p.id || excluded[x.id])))
      .map(x => '<option value="' + esc(x.id) + '"' + (p && p.parent_id === x.id ? ' selected' : '') + '>' + esc(positionLabel(x)) + '</option>').join('');
    openModal('<h3>' + (p ? 'Edit position' : 'Add position') + '</h3><div class="ya-grid2">' +
      '<label class="ya-field"><span>Name *</span><input name="name" value="' + esc(p ? p.name : '') + '" placeholder="e.g. Chairperson"></label>' +
      '<label class="ya-field"><span>Group *</span><select name="group_id">' + groupOpts + '</select></label>' +
      '<label class="ya-field"><span>Reports to</span><select name="parent_id">' + parentOpts + '</select></label>' +
      '<label class="ya-field"><span>Order</span><input name="sort_order" type="number" value="' + esc(p ? p.sort_order : 0) + '"></label>' +
      '</div><p class="ya-msg" id="ya-msg" role="status"></p>' +
      '<div class="ya-actions"><button class="ya-btn ghost" data-ya="close">Cancel</button>' +
      '<button class="ya-btn" data-ya="save-position" data-id="' + esc(p ? p.id : '') + '">Save</button></div>');
  }
  function openMembersIn(field, name, label, title) {
    const list = S.members.filter(m => m[field] === name).sort((a, b) => String(a.full_name).localeCompare(String(b.full_name)));
    const rows = list.map(m =>
      '<tr><td data-l="Name"><strong>' + esc(m.full_name) + '</strong></td>' +
      '<td data-l="Member ID">' + esc(m.member_id) + '</td>' +
      '<td data-l="Designation">' + esc(m.current_designation || '—') + '</td>' +
      '<td data-l="Email">' + esc(m.email || '—') + '</td>' +
      '<td class="ya-acts">' + btn('detail', 'member', m.id, 'View') + '</td></tr>').join('');
    openModal('<h3>' + esc(label) + ': ' + esc(name) + '</h3>' +
      '<p class="ya-muted">' + list.length + ' member(s). ' + esc(title || '') + '</p>' +
      (rows ? tableWrap(['Name', 'Member ID', 'Designation', 'Email', ''], rows) : '<div class="ya-empty">No one is in this yet.</div>') +
      '<div class="ya-actions"><button class="ya-btn ghost" data-ya="close">Close</button>' +
      '<button class="ya-btn" data-ya="open-members-filter" data-q="' + esc(name) + '">Open in All Members</button></div>');
  }
  function openRole(m) {
    const bodyOpts = '<option value="">— none —</option>' + S.groups.slice().sort((a, b) => a.sort_order - b.sort_order).map(g =>
      '<option value="' + esc(g.name) + '"' + (m.current_body === g.name ? ' selected' : '') + '>' + esc(g.name) + '</option>').join('');
    const posOpts = '<option value="">— none —</option>' + orderedPositions().map(p =>
      '<option value="' + esc(p.name) + '"' + (m.current_designation === p.name ? ' selected' : '') + '>' + esc(positionLabel(p)) + '</option>').join('');
    openModal('<h3>Body &amp; role for ' + esc(m.full_name) + '</h3>' +
      '<div class="ya-grid2"><label class="ya-field"><span>Current body (group)</span><select name="current_body">' + bodyOpts + '</select></label>' +
      '<label class="ya-field"><span>Current designation (position)</span><select name="current_designation">' + posOpts + '</select></label></div>' +
      '<p class="ya-msg" id="ya-msg" role="status"></p>' +
      '<div class="ya-actions"><button class="ya-btn ghost" data-ya="close">Cancel</button>' +
      '<button class="ya-btn" data-ya="save-role" data-id="' + esc(m.id) + '">Save</button></div>');
  }
  async function saveGroup(id) {
    const m = modalEl();
    const name = val(m, 'name');
    if (!name) return modalMsg('Name is required.');
    const payload = { name: name, description: val(m, 'description') || null, sort_order: parseInt(val(m, 'sort_order') || '0', 10) || 0 };
    if (id) {
      const old = groupById(id);
      if (old && old.name !== name) {
        const r = await sb().rpc('rename_group', { p_group_id: id, p_name: name });
        if (r.error) return modalMsg(dbMessage(r.error, 'Could not rename group.'));
      }
      const { name: _n, ...rest } = payload;
      const res = await sb().from(GROUPS).update(rest).eq('id', id).select('id');
      if (res.error) return modalMsg(dbMessage(res.error, 'Could not save group.'));
    } else {
      const res = await sb().from(GROUPS).insert(payload).select('id');
      if (res.error) return modalMsg(dbMessage(res.error, 'Could not save group.'));
    }
    closeModal();
    toast('Group saved.');
    await refresh();
  }
  async function savePosition(id) {
    const m = modalEl();
    const name = val(m, 'name');
    const groupId = val(m, 'group_id');
    if (!name) return modalMsg('Name is required.');
    if (!groupId) return modalMsg('Choose a group.');
    const payload = { group_id: groupId, parent_id: val(m, 'parent_id') || null, sort_order: parseInt(val(m, 'sort_order') || '0', 10) || 0 };
    if (id) {
      const old = posById(id);
      if (old && old.name !== name) {
        const r = await sb().rpc('rename_position', { p_position_id: id, p_name: name });
        if (r.error) return modalMsg(dbMessage(r.error, 'Could not rename position.'));
      }
      const res = await sb().from(POSITIONS).update(payload).eq('id', id).select('id');
      if (res.error) return modalMsg(dbMessage(res.error, 'Could not save position.'));
    } else {
      const res = await sb().from(POSITIONS).insert(Object.assign({ name: name }, payload)).select('id');
      if (res.error) return modalMsg(dbMessage(res.error, 'Could not save position.'));
    }
    closeModal();
    toast('Position saved.');
    await refresh();
  }
  async function saveRole(memberId) {
    const m = modalEl();
    const payload = { current_body: val(m, 'current_body') || null, current_designation: val(m, 'current_designation') || null };
    const res = await sb().from(MEMBERS).update(payload).eq('id', memberId).select('id');
    if (res.error) return modalMsg(dbMessage(res.error, 'Could not save.'));
    if (!res.data || !res.data.length) return modalMsg('Not saved. Check admin permissions.');
    closeModal();
    toast('Body and role updated.');
    await refresh();
  }

  /* ---------- events ---------- */
  async function onClick(e) {
    const el = e.target.closest && e.target.closest('[data-ya]');
    if (!el || !(el.closest('#yadmin-root') || el.closest('#ya-back'))) return;
    const act = el.getAttribute('data-ya');
    const kind = el.getAttribute('data-kind') || 'app';
    const id = el.getAttribute('data-id');
    const row = id != null ? findRow(kind, id) : null;
    switch (act) {
      case 'nav':
        S.view = el.getAttribute('data-v'); S.q = ''; S.sort = { col: '', dir: 1 };
        if (S.view === 'admins' && !isSuper()) S.view = 'overview';
        if (S.view === 'admins') await loadAdmins();
        if (S.view === 'tasks') await loadTasks();
        if (S.view === 'email') await loadQuota();
        renderApp();
        if (['calendar', 'plans', 'projects', 'overview'].indexOf(S.view) >= 0) syncSchedule();
        break;
      case 'sort': {
        const col = el.getAttribute('data-col');
        S.sort.dir = S.sort.col === col ? -S.sort.dir : 1;
        S.sort.col = col;
        const l = document.getElementById('ya-list');
        if (l) l.innerHTML = listHTML();
        break;
      }
      case 'add-admin': openAddAdmin(); break;
      case 'save-admin': await addAdmin(); break;
      case 'remove-admin': openRemoveAdmin(el.getAttribute('data-id'), el.getAttribute('data-email')); break;
      case 'confirm-remove-admin': await removeAdmin(id); break;
      case 'logout': await sb().auth.signOut(); clearSavedLogins(); closeModal(); mount(); break;
      case 'reload': await refresh(); break;
      case 'close': closeModal(); break;
      case 'detail': if (row) openDetail(kind, row); break;
      case 'approve-open': if (row) await openApprove(row); break;
      case 'approve-submit': await approveSubmit(id); break;
      case 'reject': if (row) await setAppStatus(row, 'rejected'); break;
      case 'restore': if (row) await setAppStatus(row, 'pending'); break;
      case 'edit-member': if (row) openEditMember(row); break;
      case 'add-member': await openNewMember(); break;
      case 'save-member': await saveMember(row || null); break;
      case 'delete': if (row) openDelete(kind, row); break;
      case 'confirm-delete': await removeRow(kind, id); break;
      case 'add-group': openGroupForm(null); break;
      case 'edit-group': if (row) openGroupForm(row); break;
      case 'save-group': await saveGroup(id); break;
      case 'add-position': openPositionForm(null); break;
      case 'edit-position': if (row) openPositionForm(row); break;
      case 'save-position': await savePosition(id); break;
      case 'member-role': if (row) openRole(row); break;
      case 'save-notes': await saveNotes(id); break;
      case 'search-run': runSearch(); break;
      case 'group-members': { const g = findRow('group', id); if (g) openMembersIn('current_body', g.name, 'Group', 'Members in this group.'); break; }
      case 'position-members': { const p = findRow('position', id); if (p) openMembersIn('current_designation', p.name, 'Position', 'Members holding this position.'); break; }
      case 'open-members-filter': closeModal(); S.view = 'members'; S.q = el.getAttribute('data-q') || ''; renderApp(); break;
      case 'new-task': openTask(); break;
      case 'save-task': await saveTask(); break;
      case 'task-status': await setTaskStatus(id, el.getAttribute('data-status')); break;
      case 'save-role': await saveRole(id); break;

      /* Email actions */
      case 'email-mode': S.emailMode = el.getAttribute('data-m'); renderApp(); break;
      case 'email-test-conn': await loadQuota(); renderApp(); toast(S.quota ? 'Email function connected!' : 'Still unreachable: ' + S.quotaError, !!S.quota); break;
      case 'email-diag': openEmailDiagnostics(); break;
      case 'send-announcement': await openAnnouncementConfirm(); break;
      case 'confirm-announcement': await sendAnnouncement(); break;
      case 'send-test-email': await sendTestEmailToSelf(); break;
      case 'email-mailto': openEmailMailtoFallback(); break;
      case 'email-copy': await copyRecipientEmails(); break;

      /* Plans & Projects */
      case 'new-plan': openPlanForm(null); break;
      case 'new-plan-date': openPlanForm(null, el.getAttribute('data-date')); break;
      case 'edit-plan': { const p = findRow('plan', id); if (p) openPlanForm(p); break; }
      case 'save-plan': await savePlan(id); break;
      case 'new-project': openProjectForm(null); break;
      case 'new-proj-date': openProjectForm(null, el.getAttribute('data-date')); break;
      case 'edit-project': { const pr = findRow('project', id); if (pr) openProjectForm(pr); break; }
      case 'save-project': await saveProject(id); break;

      /* Calendar */
      case 'cal-prev': S.calMonth--; if (S.calMonth < 0) { S.calMonth = 11; S.calYear--; } renderApp(); break;
      case 'cal-next': S.calMonth++; if (S.calMonth > 11) { S.calMonth = 0; S.calYear++; } renderApp(); break;
      case 'cal-today': { const now = new Date(); S.calYear = now.getFullYear(); S.calMonth = now.getMonth(); S.calSelectedDate = todayISO(); renderApp(); break; }
      case 'cal-mode': S.calMode = el.getAttribute('data-m'); renderApp(); break;
      case 'cal-day': {
        S.calSelectedDate = el.getAttribute('data-date'); renderApp();
        const dp = document.querySelector('.ya-day');
        if (dp) { const r = dp.getBoundingClientRect(); if (r.bottom > window.innerHeight || r.top < 0) dp.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
        break;
      }
      case 'cal-open': {
        const k = el.getAttribute('data-k');
        const dt = el.getAttribute('data-date');
        if (k === 'task') { S.view = 'tasks'; await loadTasks(); renderApp(); break; }
        const rec = findRow(k, id);
        if (rec && canEdit()) { if (k === 'plan') openPlanForm(rec); else openProjectForm(rec); }
        else if (dt) { S.calSelectedDate = dt; renderApp(); }
        break;
      }

      /* Interactive Export */
      case 'exp-cols-all': S.expCols = (EXPORT_DATASETS[S.expDataset] || EXPORT_DATASETS.members).cols.slice(); renderApp(); break;
      case 'exp-cols-min': S.expCols = (EXPORT_DATASETS[S.expDataset] || EXPORT_DATASETS.members).cols.slice(0, 4); renderApp(); break;
      case 'export-backup': exportFullBackupJson(); break;
      case 'export-fmt': {
        const fmtType = el.getAttribute('data-fmt');
        const { ds, cols, rows: expRows } = getExportData();
        const slug = 'yantrika-' + S.expDataset;
        if (fmtType === 'csv') exportCsv(expRows, cols, slug);
        else if (fmtType === 'json') exportJson(expRows, cols, slug, ds.label);
        else if (fmtType === 'pdf') exportPdfReport(expRows, cols, ds.label);
        else if (fmtType === 'copy-json') {
          const txt = JSON.stringify(expRows.map(r => { const o = {}; cols.forEach(c => { o[c] = r[c]; }); return o; }), null, 2);
          navigator.clipboard.writeText(txt).then(() => toast('Copied ' + expRows.length + ' JSON record(s)!')).catch(() => toast('Clipboard blocked.', false));
        }
        break;
      }
    }
  }

  function runSearch() {
    const el = document.getElementById('ya-global');
    S.gq = el ? el.value : S.gq;
    S.view = 'search';
    renderApp();
  }
  function onInput(e) {
    if (e.target.id === 'ya-q') {
      S.q = e.target.value;
      const l = document.getElementById('ya-list');
      if (l) l.innerHTML = listHTML();
      updateCount();
    } else if (e.target.id === 'ya-exp-q') {
      S.expSearch = e.target.value;
      renderApp();
    }
  }
  function onChange(e) {
    const t = e.target;
    if (t.name === 'admin_role') { setRole(t.getAttribute('data-id'), t.value); return; }
    if (t.name === 'admin_member') { setAdminMember(t.getAttribute('data-id'), t.value); return; }
    if (t.id === 'ya-task-filter') { S.taskFilter = t.value; renderApp(); return; }
    if (t.id === 'ya-plan-filter') { S.planFilter = t.value; renderApp(); return; }
    if (t.id === 'ya-proj-filter') { S.projectFilter = t.value; renderApp(); return; }
    if (t.id === 'ya-status') { S.status = t.value; renderApp(); return; }
    if (t.id === 'ya-exp-ds') { S.expDataset = t.value; S.expCols = null; S.expFilterStatus = 'all'; S.expFilterBody = 'all'; S.expSearch = ''; renderApp(); return; }
    if (t.id === 'ya-exp-status') { S.expFilterStatus = t.value; renderApp(); return; }
    if (t.id === 'ya-exp-body') { S.expFilterBody = t.value; renderApp(); return; }
    if (t.name === 'exp_col') {
      const checked = [...document.querySelectorAll('#yadmin-root input[name="exp_col"]:checked')].map(x => x.value);
      S.expCols = checked;
      renderApp();
      return;
    }
    if (t.name === 'cal_show') { S.calShow[t.value] = t.checked; renderApp(); return; }
    if (t.name === 'email_pick') { S.emailSelectedIds[t.value] = t.checked; return; }
    if (t.id === 'ya-email-tpl') {
      const tpl = EMAIL_TEMPLATES.find(x => x.id === t.value);
      if (tpl) {
        const sIn = document.querySelector('#yadmin-root input[name="ann_subject"]');
        const bIn = document.querySelector('#yadmin-root textarea[name="ann_body"]');
        if (sIn) sIn.value = tpl.subject;
        if (bIn) bIn.value = tpl.body;
      }
    }
  }
  async function onSubmit(e) {
    if (e.target.id !== 'ya-login') return;
    e.preventDefault();
    const f = e.target;
    const b = f.querySelector('button[type="submit"]');
    const msg = document.getElementById('ya-login-msg');
    b.disabled = true;
    msg.textContent = 'Signing in…';
    const res = await sb().auth.signInWithPassword({ email: f.elements['email'].value.trim(), password: f.elements['password'].value });
    if (res.error) { b.disabled = false; msg.textContent = 'Sign-in failed. Check the email and password.'; return; }
    mount();
  }

  document.addEventListener('click', onClick);
  document.addEventListener('input', onInput);
  document.addEventListener('change', onChange);
  document.addEventListener('submit', onSubmit);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
    if ((e.key === 'Enter' || e.key === ' ') && e.target && e.target.classList && e.target.classList.contains('ya-cal-cell') && !e.target.classList.contains('empty')) { e.preventDefault(); e.target.click(); }
    if (e.key === 'Enter' && e.target && e.target.id === 'ya-global') runSearch();
  });

  /* keep the schedule fresh: reload when the tab is visible and nothing is being edited */
  setInterval(() => {
    if (!document.hidden && root() && S.user && ['calendar', 'plans', 'projects'].indexOf(S.view) >= 0 && !document.getElementById('ya-back')) syncSchedule();
  }, 60000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && root() && S.user && ['calendar', 'plans', 'projects', 'overview'].indexOf(S.view) >= 0 && !document.getElementById('ya-back')) syncSchedule();
  });

  window.YADMIN = { mount: mount };

  const CSS = `
/* Yantrika admin: same palette, borders and hard shadows as the main site, tidied for a more professional feel. */
#yadmin-root,#ya-back,#ya-toast{
  --ya-line:color-mix(in srgb,var(--ink,#17171d) 14%,transparent);
  --ya-line2:color-mix(in srgb,var(--ink,#17171d) 38%,transparent);
  --ya-muted:color-mix(in srgb,var(--ink,#17171d) 64%,transparent);
  --ya-hover:color-mix(in srgb,var(--ink,#17171d) 5%,transparent);
  --ya-head:color-mix(in srgb,var(--ink,#17171d) 4%,var(--card,#fff));
  --ya-ok-bg:#dcf7ee;--ya-ok-fg:#0b6b4f;--ya-ok-bd:#7fd1b2;
  --ya-wn-bg:#fff4d6;--ya-wn-fg:#7a5a00;--ya-wn-bd:#e6c25c;
  --ya-bd-bg:#fde2e4;--ya-bd-fg:#8a1c2b;--ya-bd-bd:#f0a3ad;
  --ya-in-bg:#e3f0fc;--ya-in-fg:#175a9c;--ya-in-bd:#9cc7ef;
  --ya-ne-bg:#ececf0;--ya-ne-fg:#4a4a57;--ya-ne-bd:#c9c9d3;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) #yadmin-root,:root:not([data-theme="light"]) #ya-back,:root:not([data-theme="light"]) #ya-toast{
  --ya-ok-bg:#12382d;--ya-ok-fg:#8be3c1;--ya-ok-bd:#1f6b55;
  --ya-wn-bg:#3b3010;--ya-wn-fg:#f3d36b;--ya-wn-bd:#7a6420;
  --ya-bd-bg:#3d1a20;--ya-bd-fg:#ff9aa8;--ya-bd-bd:#7d2c39;
  --ya-in-bg:#14304a;--ya-in-fg:#9ccdf5;--ya-in-bd:#2b5a86;
  --ya-ne-bg:#2c2c36;--ya-ne-fg:#c7c7d3;--ya-ne-bd:#464656}}
:root[data-theme="dark"] #yadmin-root,:root[data-theme="dark"] #ya-back,:root[data-theme="dark"] #ya-toast{
  --ya-ok-bg:#12382d;--ya-ok-fg:#8be3c1;--ya-ok-bd:#1f6b55;
  --ya-wn-bg:#3b3010;--ya-wn-fg:#f3d36b;--ya-wn-bd:#7a6420;
  --ya-bd-bg:#3d1a20;--ya-bd-fg:#ff9aa8;--ya-bd-bd:#7d2c39;
  --ya-in-bg:#14304a;--ya-in-fg:#9ccdf5;--ya-in-bd:#2b5a86;
  --ya-ne-bg:#2c2c36;--ya-ne-fg:#c7c7d3;--ya-ne-bd:#464656}

#yadmin-root{width:100%;text-align:left;color:var(--ink,#17171d);font-size:14.5px;line-height:1.55;-webkit-font-smoothing:antialiased}
#yadmin-root *,#ya-back *{box-sizing:border-box}
#yadmin-root h1,#yadmin-root h2,#yadmin-root h3,#ya-back h3{font-family:inherit;letter-spacing:-.01em}
.ya-ico{flex:0 0 auto;vertical-align:-3px}
.ya-wrap{display:grid;grid-template-columns:256px minmax(0,1fr);gap:28px;align-items:start}

/* sidebar */
.ya-side{position:sticky;top:84px;background:var(--card,#fff);border:2px solid var(--dk,#17171d);border-radius:12px;padding:14px;box-shadow:4px 4px 0 var(--dk,#17171d);display:flex;flex-direction:column;gap:12px;max-height:calc(100vh - 100px);overflow:hidden}
.ya-brand{display:flex;align-items:center;gap:10px;padding:2px 4px 12px;border-bottom:1px solid var(--ya-line)}
.ya-logo{display:grid;place-items:center;width:34px;height:34px;border-radius:9px;background:var(--yel,#f1c40f);color:#17171d;border:2px solid var(--dk,#17171d);box-shadow:2px 2px 0 var(--dk,#17171d)}
.ya-brand-t{display:flex;flex-direction:column;line-height:1.15}
.ya-brand-t b{font-family:'Permanent Marker',cursive,sans-serif;font-weight:400;font-size:1.15rem;letter-spacing:.01em}
.ya-brand-t small{font-size:.68rem;text-transform:uppercase;letter-spacing:.1em;color:var(--ya-muted);font-weight:700}
.ya-nav{display:flex;flex-direction:column;gap:14px;overflow-y:auto;flex:1 1 auto;min-height:0;padding-right:2px}
.ya-nav-grp{display:flex;flex-direction:column;gap:2px}
.ya-nav-lbl{font-size:.68rem;text-transform:uppercase;letter-spacing:.1em;color:var(--ya-muted);font-weight:700;padding:2px 10px 4px}
.ya-nav-btn{display:flex;justify-content:space-between;align-items:center;gap:8px;background:none;border:2px solid transparent;text-align:left;cursor:pointer;padding:7px 10px;border-radius:8px;font:inherit;font-size:.9rem;font-weight:500;color:inherit;transition:background .12s}
.ya-nav-l{display:flex;align-items:center;gap:10px;min-width:0}
.ya-nav-l .ya-ico{opacity:.75}
.ya-nav-btn:hover{background:var(--ya-hover)}
.ya-nav-btn.on{background:var(--yel,#f1c40f);color:#17171d;font-weight:700;border-color:var(--dk,#17171d)}
.ya-nav-btn.on .ya-ico{opacity:1}
.ya-nav-badge{font-size:.7rem;font-weight:700;min-width:20px;text-align:center;padding:1px 7px;border-radius:99px;background:var(--ya-hover);color:inherit;border:1px solid var(--ya-line)}
.ya-nav-btn.on .ya-nav-badge{background:rgba(0,0,0,.12);border-color:transparent}
.ya-nav-badge.warn{background:var(--or,#ff8c37);color:#17171d;border-color:transparent}
.ya-side-foot{border-top:1px solid var(--ya-line);padding-top:12px;display:flex;flex-direction:column;gap:10px}
.ya-user{display:flex;align-items:center;gap:10px;min-width:0}
.ya-avatar{display:grid;place-items:center;flex:0 0 auto;width:34px;height:34px;border-radius:50%;background:var(--cy,#33d6a6);color:#17171d;font-weight:700;border:2px solid var(--dk,#17171d)}
.ya-user-t{display:flex;flex-direction:column;min-width:0;line-height:1.25}
.ya-user-t strong{font-size:.85rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ya-role{font-size:.72rem;color:var(--ya-muted);font-weight:600}
.ya-main{min-width:0}

/* page header */
.ya-top{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;margin-bottom:20px;flex-wrap:wrap;padding-bottom:16px;border-bottom:1px solid var(--ya-line)}
.ya-top h1{margin:0;font-size:1.65rem;line-height:1.2}
.ya-sub{margin:4px 0 0;color:var(--ya-muted);font-size:.9rem}
.ya-top-r{display:flex;gap:8px;align-items:center;flex-wrap:nowrap}
.ya-searchbar{display:flex;gap:6px;align-items:center;position:relative;width:min(320px,100%)}
.ya-searchbar input{flex:1;min-width:0;padding-left:34px}
.ya-search-ico{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--ya-muted);pointer-events:none;display:flex}
.ya-h2{font-size:1.05rem;margin:22px 0 10px;font-weight:700}
.ya-note{font-size:.84rem;margin:8px 0 12px;color:var(--ya-muted)}

/* cards, stats */
.ya-card{background:var(--card,#fff);border:2px solid var(--dk,#17171d);border-radius:12px;padding:18px 20px;box-shadow:3px 3px 0 var(--dk,#17171d)}
.ya-card .ya-h2:first-child{margin-top:0}
.ya-stats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px}
.ya-stat{text-align:left;cursor:pointer;font:inherit;color:inherit;background:var(--card,#fff);border:2px solid var(--dk,#17171d);border-radius:12px;padding:14px 16px;box-shadow:3px 3px 0 var(--dk,#17171d);border-top:5px solid var(--ya-ne-bd);transition:transform .12s,box-shadow .12s;display:block;width:100%}
.ya-stat:hover{transform:translate(-1px,-1px);box-shadow:4px 4px 0 var(--dk,#17171d)}
.ya-stat span{display:block;font-size:.72rem;text-transform:uppercase;letter-spacing:.07em;font-weight:700;color:var(--ya-muted)}
.ya-stat strong{display:block;font-size:2rem;line-height:1.15;margin-top:4px;font-variant-numeric:tabular-nums}
.ya-stat.warn{border-top-color:#e0a800}.ya-stat.ok{border-top-color:#1aa37a}.ya-stat.bad{border-top-color:#ec3750}.ya-stat.bl{border-top-color:#338eda}.ya-stat.cy{border-top-color:#33d6a6}
.ya-welcome{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;margin-bottom:18px;padding:16px 20px;border:2px solid var(--dk,#17171d);border-radius:12px;background:linear-gradient(90deg,color-mix(in srgb,var(--yel,#f1c40f) 22%,var(--card,#fff)),var(--card,#fff) 70%);box-shadow:3px 3px 0 var(--dk,#17171d)}
.ya-welcome h2{margin:0 0 2px;font-size:1.25rem}
.ya-quick-actions{display:flex;gap:8px;flex-wrap:wrap}
.ya-two{display:grid;grid-template-columns:1fr 1fr;gap:18px}

/* toolbars and forms */
.ya-toolbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:14px}
.ya-toolbar select{width:auto;min-width:150px}
.ya-toolbar input[type=search]{flex:1 1 240px;min-width:0}
input,select,textarea{font:inherit;font-size:.92rem;padding:8px 11px;border:1.5px solid var(--ya-line2);border-radius:8px;background:var(--card,#fff);color:var(--ink,#17171d);width:100%;transition:border-color .12s,box-shadow .12s}
input:focus,select:focus,textarea:focus{outline:none;border-color:var(--bl,#338eda);box-shadow:0 0 0 3px color-mix(in srgb,var(--bl,#338eda) 28%,transparent)}
textarea{resize:vertical}
.ya-field{display:flex;flex-direction:column;gap:5px;font-size:.88rem}
.ya-field>span{font-size:.76rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--ya-muted)}
.ya-grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.ya-grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.ya-grid2 .ya-field:has(textarea){grid-column:1/-1}
.ya-readonly{background:var(--ya-hover);font-weight:700}

/* buttons */
.ya-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;font:inherit;font-size:.9rem;font-weight:700;padding:8px 15px;border-radius:8px;border:2px solid var(--dk,#17171d);background:var(--yel,#f1c40f);color:#17171d;text-decoration:none;box-shadow:2px 2px 0 var(--dk,#17171d);transition:transform .1s,box-shadow .1s;line-height:1.25;white-space:nowrap}
.ya-btn:hover{transform:translate(-1px,-1px);box-shadow:3px 3px 0 var(--dk,#17171d)}
.ya-btn:active{transform:translate(1px,1px);box-shadow:0 0 0 var(--dk,#17171d)}
.ya-btn:focus-visible{outline:3px solid color-mix(in srgb,var(--bl,#338eda) 55%,transparent);outline-offset:2px}
.ya-btn:disabled{opacity:.5;cursor:not-allowed;transform:none;box-shadow:none}
.ya-btn.ghost{background:transparent;color:var(--ink,#17171d);border:1.5px solid var(--ya-line2);box-shadow:none}
.ya-btn.ghost:hover{background:var(--ya-hover);transform:none;border-color:var(--ink,#17171d)}
.ya-btn.ok{background:#1aa37a;color:#fff}
.ya-btn.cy{background:var(--cy,#33d6a6);color:#17171d}
.ya-btn.warn{background:#ffd966;color:#17171d}
.ya-btn.danger{background:#ec3750;color:#fff}
.ya-btn.small{padding:5px 11px;font-size:.8rem;border-radius:7px}
.ya-btn.ya-sq{width:32px;padding:4px 0;font-size:1.1rem;line-height:1}
.ya-actions{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;margin-top:18px}
.ya-actions.start{justify-content:flex-start;margin-top:14px}
.ya-modal .ya-actions{border-top:1px solid var(--ya-line);padding-top:16px}
.ya-acts{white-space:nowrap}
.ya-acts .ya-btn{margin:2px 4px 2px 0}
.ya-linkbtn{background:none;border:0;padding:0;font:inherit;font-weight:700;font-size:.85rem;cursor:pointer;color:var(--bl,#338eda);text-align:left}
.ya-linkbtn:hover{text-decoration:underline}

/* tables */
.ya-tablewrap{overflow-x:auto;background:var(--card,#fff);border:2px solid var(--dk,#17171d);border-radius:12px;box-shadow:3px 3px 0 var(--dk,#17171d)}
.ya-table{width:100%;border-collapse:collapse;font-size:.88rem}
.ya-table th{text-align:left;padding:11px 14px;font-size:.7rem;text-transform:uppercase;letter-spacing:.08em;font-weight:700;color:var(--ya-muted);background:var(--ya-head);border-bottom:1px solid var(--ya-line2);white-space:nowrap}
.ya-table td{padding:11px 14px;border-bottom:1px solid var(--ya-line);vertical-align:middle}
.ya-table tbody tr{transition:background .1s}
.ya-table tbody tr:hover{background:var(--ya-hover)}
.ya-table tr:last-child td{border-bottom:0}
.ya-sort-btn{background:none;border:0;padding:0;font:inherit;color:inherit;text-transform:inherit;letter-spacing:inherit;cursor:pointer;font-weight:700}
.ya-sort-btn:hover{color:var(--ink,#17171d)}
.ya-num{text-align:right;font-weight:700;font-variant-numeric:tabular-nums}
.ya-card .ya-table{font-size:.88rem}
.ya-card .ya-table td{padding:8px 4px}
.ya-bar{height:8px;background:var(--ya-line);border-radius:99px;overflow:hidden}
.ya-bar span{display:block;height:100%;background:var(--cy,#33d6a6);border-radius:99px}

/* badges, tags, notices */
.ya-b{display:inline-flex;align-items:center;gap:6px;padding:2px 10px;border-radius:999px;font-size:.74rem;font-weight:700;border:1px solid;white-space:nowrap}
.ya-b::before{content:'';width:6px;height:6px;border-radius:50%;background:currentColor}
.ya-b.pending{background:var(--ya-wn-bg);color:var(--ya-wn-fg);border-color:var(--ya-wn-bd)}
.ya-b.approved{background:var(--ya-ok-bg);color:var(--ya-ok-fg);border-color:var(--ya-ok-bd)}
.ya-b.rejected{background:var(--ya-bd-bg);color:var(--ya-bd-fg);border-color:var(--ya-bd-bd)}
.ya-b.info{background:var(--ya-in-bg);color:var(--ya-in-fg);border-color:var(--ya-in-bd)}
.ya-b.neutral{background:var(--ya-ne-bg);color:var(--ya-ne-fg);border-color:var(--ya-ne-bd)}
.ya-tag{display:inline-block;padding:2px 9px;border-radius:6px;font-size:.74rem;font-weight:700;background:var(--ya-hover);border:1px solid var(--ya-line)}
.ya-muted{color:var(--ya-muted)}
.ya-empty{padding:34px;text-align:center;border:1.5px dashed var(--ya-line2);border-radius:12px;color:var(--ya-muted)}
.ya-error{background:var(--ya-bd-bg);color:var(--ya-bd-fg);border:1px solid var(--ya-bd-bd);border-radius:10px;padding:12px 14px;margin-bottom:14px}
.ya-notice{background:var(--ya-wn-bg);color:var(--ya-wn-fg);border:1px solid var(--ya-wn-bd);border-radius:10px;padding:12px 14px;margin-bottom:14px}
.ya-quota{padding:10px 14px;border-radius:10px;border:1px solid var(--ya-line);font-size:.9rem}
.ya-quota.ok{background:var(--ya-ok-bg);color:var(--ya-ok-fg);border-color:var(--ya-ok-bd)}
.ya-quota.bad{background:var(--ya-bd-bg);color:var(--ya-bd-fg);border-color:var(--ya-bd-bd)}
.ya-center{padding:48px;text-align:center;color:var(--ya-muted)}
.ya-msg{font-size:.88rem;min-height:1.2em;margin:10px 0 0;color:var(--ya-bd-fg)}
.ya-chip-grid{display:flex;flex-wrap:wrap;gap:8px}
.ya-chip-check{display:inline-flex;align-items:center;gap:7px;padding:4px 11px;border:1.5px solid var(--ya-line2);border-radius:999px;font-size:.8rem;font-weight:600;cursor:pointer;user-select:none;transition:background .12s}
.ya-chip-check:hover{background:var(--ya-hover)}
.ya-chip-check:has(input:checked){background:var(--ya-hover);border-color:var(--ink,#17171d)}
.ya-chip-check input{width:auto;margin:0;accent-color:var(--dk,#17171d)}
.ya-dl{display:grid;grid-template-columns:150px 1fr;gap:10px 16px;margin:14px 0 0}
.ya-dl dt{font-weight:700;color:var(--ya-muted);font-size:.8rem;text-transform:uppercase;letter-spacing:.04em}
.ya-dl dd{margin:0;word-break:break-word;white-space:pre-wrap}

/* login */
.ya-login{display:flex;justify-content:center;padding:34px 0}
.ya-login .ya-card{width:min(420px,100%);padding:26px}
.ya-login h1{margin:0 0 4px;font-size:1.5rem}
.ya-login-form{display:flex;flex-direction:column;gap:14px;margin-top:16px}
.ya-login-form label{display:flex;flex-direction:column;gap:5px;font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--ya-muted)}
.ya-login-form input{text-transform:none;letter-spacing:0;font-weight:400;color:var(--ink,#17171d)}

/* plans, calendar */
.ya-pill-row{display:flex;flex-wrap:wrap;gap:8px}
.ya-plan-pill{background:var(--yel,#f1c40f);color:#17171d;border:2px solid var(--dk,#17171d);border-radius:8px;padding:4px 10px;font:inherit;font-size:.8rem;font-weight:700;cursor:pointer;text-align:left}
.ya-plan-pill span{font-weight:500;opacity:.7}
.ya-plan-pill:hover{filter:brightness(.96)}
.ya-cal-layout{display:flex;flex-direction:column;gap:18px}
.ya-cal-side{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:18px;align-items:start}
.ya-cal-bar{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.ya-cal-nav{display:flex;align-items:center;gap:8px}
.ya-cal-title{margin:0 6px;font-size:1.25rem;min-width:170px;text-align:center}
.ya-cal-ctrl{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.ya-seg{display:inline-flex;border:1.5px solid var(--ya-line2);border-radius:8px;overflow:hidden}
.ya-seg button{border:0;background:transparent;font:inherit;font-size:.8rem;font-weight:700;padding:5px 12px;cursor:pointer;color:inherit}
.ya-seg button.on{background:var(--yel,#f1c40f);color:#17171d}
.ya-cal-sum{margin:10px 0 14px;font-size:.82rem;color:var(--ya-muted)}
.ya-cal-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:5px}
.ya-cal-head{text-align:center;font-weight:700;font-size:.7rem;text-transform:uppercase;letter-spacing:.08em;color:var(--ya-muted);padding:6px 0}
.ya-cal-cell{min-height:96px;border:1px solid var(--ya-line);border-radius:8px;padding:5px 6px;cursor:pointer;display:flex;flex-direction:column;gap:3px;background:var(--card,#fff);transition:background .1s,border-color .1s;min-width:0}
.ya-cal-cell.wkend{background:var(--ya-head)}
.ya-cal-cell:hover{border-color:var(--ya-line2)}
.ya-cal-cell:focus-visible{outline:3px solid color-mix(in srgb,var(--bl,#338eda) 55%,transparent);outline-offset:1px}
.ya-cal-cell.empty{background:transparent;border-color:transparent;cursor:default}
.ya-cal-cell.today{border:2px solid var(--bl,#338eda)}
.ya-cal-cell.sel{border:2px solid var(--dk,#17171d);box-shadow:3px 3px 0 var(--yel,#f1c40f)}
.ya-cal-num{font-weight:700;font-size:.78rem;width:24px;height:24px;line-height:24px;text-align:center;border-radius:50%}
.ya-cal-cell.today .ya-cal-num{background:var(--bl,#338eda);color:#fff}
.ya-cal-pill{display:inline-block;padding:1px 7px;border-radius:4px;font:inherit;font-size:.7rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;border:0;text-align:left;line-height:1.5}
button.ya-cal-pill{cursor:pointer}
button.ya-cal-pill:hover{filter:brightness(.93)}
.ya-cal-pill.plan{background:#f1c40f;color:#17171d}
.ya-cal-pill.project{background:#33d6a6;color:#17171d}
.ya-cal-pill.task{background:#338eda;color:#fff}
.ya-cal-pill.cont{opacity:.62}
.ya-cal-pill.done{text-decoration:line-through;opacity:.55}
.ya-more{font-size:.7rem;font-weight:700;color:var(--ya-muted);padding-left:2px}
.ya-cal-dot{display:inline-block;width:9px;height:9px;border-radius:50%}
.ya-cal-dot.plan{background:#f1c40f}.ya-cal-dot.project{background:#33d6a6}.ya-cal-dot.task{background:#338eda}
.ya-day-dow{font-size:.7rem;text-transform:uppercase;letter-spacing:.09em;font-weight:700;color:var(--ya-muted)}
.ya-day-title{margin:2px 0 12px;font-size:1.2rem}
.ya-day-empty{margin:4px 0 0;font-size:.88rem}
.ya-day-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:2px}
.ya-item{display:flex;align-items:flex-start;gap:10px;padding:9px 0;border-top:1px solid var(--ya-line)}
.ya-item:first-child{border-top:0}
.ya-item .ya-cal-pill{margin-top:2px;flex:0 0 auto}
.ya-item-t{flex:1;min-width:0}
.ya-item-t strong{display:block;font-size:.9rem;word-break:break-word}
.ya-item-s{font-size:.78rem}
.ya-item.done .ya-item-t strong{text-decoration:line-through;opacity:.6}
.ya-side-card-h{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;font-size:.92rem}
.ya-count-pill{font-size:.72rem;font-weight:700;padding:1px 9px;border-radius:99px;background:var(--ya-hover);border:1px solid var(--ya-line)}

/* modal and toast */
.ya-back{position:fixed;inset:0;background:rgba(10,10,16,.55);backdrop-filter:blur(2px);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px}
.ya-modal{background:var(--card,#fff);color:var(--ink,#17171d);border:2px solid var(--dk,#17171d);border-radius:14px;padding:24px;width:min(680px,100%);max-height:90vh;overflow:auto;box-shadow:6px 6px 0 var(--dk,#17171d);animation:yaPop .16s ease-out}
.ya-modal h3{margin:0 0 14px;font-size:1.25rem}
@keyframes yaPop{from{opacity:0;transform:translateY(8px) scale(.985)}to{opacity:1;transform:none}}
#ya-toast{position:fixed;right:18px;bottom:90px;z-index:300;padding:12px 16px;border-radius:10px;font-weight:600;font-size:.9rem;border:2px solid var(--dk,#17171d);box-shadow:3px 3px 0 var(--dk,#17171d);display:none;max-width:min(400px,90vw)}
#ya-toast.ok{background:var(--ya-ok-bg);color:var(--ya-ok-fg)}
#ya-toast.err{background:var(--ya-bd-bg);color:var(--ya-bd-fg)}

@media (max-width:1100px){
  .ya-cal-side{grid-template-columns:1fr}
}
@media (max-width:900px){
  .ya-wrap{grid-template-columns:minmax(0,1fr);gap:16px}
  .ya-side,.ya-main{min-width:0}
  .ya-side{position:static;padding:12px;max-height:none;overflow:visible}
  .ya-top-r{flex-wrap:wrap}
  .ya-brand{padding-bottom:10px}
  .ya-nav{flex-direction:row;overflow-x:auto;overflow-y:hidden;padding-bottom:4px;gap:14px;flex:none}
  .ya-nav-grp{flex-direction:row;align-items:center;gap:4px}
  .ya-nav-lbl{display:none}
  .ya-nav-btn{white-space:nowrap}
  .ya-stats{grid-template-columns:1fr 1fr}
  .ya-two,.ya-grid2,.ya-grid3{grid-template-columns:1fr}
  .ya-top{align-items:stretch}
  .ya-searchbar{width:100%}
  .ya-cal-cell{min-height:64px}
  .ya-cal-pill{font-size:.62rem;padding:0 4px}
  .ya-cal-title{min-width:0;font-size:1.05rem}
  .ya-tablewrap{overflow:visible;border:0;background:none;box-shadow:none}
  .ya-table thead{display:none}
  .ya-table,.ya-table tbody,.ya-table tr,.ya-table td{display:block;width:100%}
  .ya-table tr{background:var(--card,#fff);border:2px solid var(--dk,#17171d);border-radius:12px;padding:8px 14px;margin-bottom:12px;box-shadow:3px 3px 0 var(--dk,#17171d)}
  .ya-table td{display:flex;justify-content:space-between;gap:12px;border:0;padding:5px 0;text-align:right}
  .ya-table td::before{content:attr(data-l);font-weight:700;color:var(--ya-muted);text-align:left;font-size:.78rem;text-transform:uppercase;letter-spacing:.04em}
  .ya-table td.ya-acts{justify-content:flex-end;flex-wrap:wrap}
  .ya-table td.ya-acts::before{content:none}
  .ya-dl{grid-template-columns:1fr}
  #ya-toast{left:12px;right:12px;bottom:80px;max-width:none}
}
@media (prefers-reduced-motion:reduce){.ya-btn,.ya-stat,.ya-modal{transition:none;animation:none}}
`;
})();
