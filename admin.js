/*
 * Yantrika Admin Dashboard (UI only).
 * Loaded on every page; renders only at #/admin.
 * Access control is enforced by Supabase RLS and the approve_application()
 * function (supabase/admin_dashboard.sql). Hiding this page is NOT security.
 */
(function () {
  'use strict';

  const APPS = 'membership_applications';
  const MEMBERS = 'members';
  const GROUPS = 'member_groups';
  const POSITIONS = 'member_positions';
  const ACTIVITY = 'admin_activity';
  const VIEWS = [
    ['overview', 'Dashboard Overview'],
    ['members', 'All Members'],
    ['structure', 'Groups & Positions'],
    ['pending', 'Pending Applications'],
    ['approved', 'Approved Applications'],
    ['rejected', 'Rejected Applications'],
    ['activity', 'Activity Log'],
    ['export', 'Export Data']
  ];
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

  const S = { apps: [], members: [], groups: [], positions: [], activity: [], view: 'overview', q: '', status: 'all', error: '', notice: '', user: null };

  /* ---------- helpers ---------- */
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const cap = s => s ? String(s).charAt(0).toUpperCase() + String(s).slice(1) : '';
  const fmt = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  // The admin uses its own client that keeps the login in memory only, so it is
  // never saved in the browser: every visit (and every reload) asks for the password again.
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
  // Remove any login saved by earlier versions of this page.
  function clearSavedLogins() {
    try {
      Object.keys(localStorage)
        .filter(k => /^sb-.*-auth-token/.test(k))
        .forEach(k => localStorage.removeItem(k));
    } catch (e) { /* storage blocked: nothing to clear */ }
  }
  const root = () => document.getElementById('yadmin-root');
  const val = (m, name) => ((m.querySelector('[name="' + name + '"]') || {}).value || '').trim();
  const todayISO = () => new Date().toISOString().slice(0, 10);
  const cellVal = v => Array.isArray(v) ? v.join(', ') : (v == null || v === '' ? '—' : v);

  function toast(msg, ok = true) {
    let t = document.getElementById('ya-toast');
    if (!t) { t = document.createElement('div'); t.id = 'ya-toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.className = 'ya-toast ' + (ok ? 'ok' : 'err');
    t.style.display = 'block';
    clearTimeout(t._h);
    t._h = setTimeout(() => { t.style.display = 'none'; }, 4200);
  }
  function openModal(html) {
    closeModal();
    const back = document.createElement('div');
    back.className = 'ya-back';
    back.id = 'ya-back';
    back.innerHTML = '<div class="ya-modal" role="dialog" aria-modal="true">' + html + '</div>';
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

  /* ---------- data ---------- */
  // Core data (applications and members) is required. Newer tables are optional:
  // if one is missing, the rest of the dashboard still works and a notice says what to run.
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
      ? 'Some features are unavailable because part of the database setup is missing. Run the whole supabase/admin_dashboard.sql file in the SQL Editor, then press Refresh. (' + missing[0] + ')'
      : '';
  }
  async function refresh() {
    try { await loadAll(); S.error = ''; }
    catch (err) { S.error = 'Could not load data: ' + (err.message || 'unknown error'); }
    renderApp();
  }
  const appsByStatus = s => S.apps.filter(r => r.status === s);
  const memberStatuses = () => [...new Set(S.members.map(m => m.status).filter(Boolean))].sort();

  function filterRows(list, fields) {
    const q = S.q.trim().toLowerCase();
    if (!q) return list;
    return list.filter(r => fields.some(f => String(r[f] || '').toLowerCase().includes(q)));
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
  const LIST_FOR = { member: () => S.members, app: () => S.apps, group: () => S.groups, position: () => S.positions };
  const TABLE_FOR = { member: MEMBERS, app: APPS, group: GROUPS, position: POSITIONS };
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
    if (err.code === '23514') return 'End date cannot be before the start date.';
    return m || fallback;
  }

  async function approveSubmit(appId) {
    const m = modalEl();
    const memberId = val(m, 'member_id');
    const affiliation = val(m, 'affiliation');
    if (!memberId) return modalMsg('Enter the Member ID.');
    if (!affiliation) return modalMsg('Enter the affiliation.');
    modalMsg('Approving…');
    const res = await sb().rpc('approve_application', {
      p_application_id: appId, p_member_id: memberId, p_affiliation: affiliation
    });
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

  async function saveMember(member) {
    const m = modalEl();
    const adding = !member;
    const payload = {};
    if (adding) {
      payload.member_id = val(m, 'member_id');
      if (!payload.member_id) return modalMsg('Member ID is required.');
      payload.joined_at = val(m, 'joined_at') || todayISO();
    }
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
    const res = adding
      ? await sb().from(MEMBERS).insert(payload).select('id')
      : await sb().from(MEMBERS).update(payload).eq('id', member.id).select('id');
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
    const res = await sb().from(TABLE_FOR[kind] || APPS).delete().eq('id', id).select('id');
    if (res.error) return toast(dbMessage(res.error, 'Delete failed.'), false);
    if (!res.data || !res.data.length) return toast('Nothing was deleted. Check admin permissions.', false);
    closeModal();
    toast('Deleted.');
    await refresh();
  }

  /* ---------- export ---------- */
  function csvCell(v) {
    let s = Array.isArray(v) ? v.join('; ') : (v == null ? '' : String(v));
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replace(/"/g, '""') + '"';
  }
  function exportCsv(rows, cols, name) {
    const lines = [cols.join(',')].concat(rows.map(r => cols.map(c => csvCell(r[c])).join(',')));
    const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name + '-' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast('Exported ' + rows.length + ' record(s).');
  }
  const MEMBER_COLS = ['member_id', 'full_name', 'email', 'phone', 'institution', 'department', 'affiliation',
    'academic_year', 'current_body', 'current_designation', 'linkedin_url', 'joined_at', 'status'];
  const APP_COLS = ['full_name', 'email', 'phone', 'institution', 'department', 'programme', 'academic_year',
    'role', 'interest', 'experience', 'message', 'linkedin_url', 'status', 'created_at', 'reviewed_at'];

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
  function openApprove(r) {
    openModal('<h3>Approve application</h3>' +
      '<p>' + esc(r.full_name) + ' (' + esc(r.email) + ') will be added to <strong>members</strong> and the application marked approved.</p>' +
      '<div class="ya-grid2">' +
      '<label class="ya-field"><span>Member ID *</span><input name="member_id" placeholder="As used in your members list"></label>' +
      '<label class="ya-field"><span>Affiliation *</span><input name="affiliation" value="' + esc(r.institution || '') + '"></label>' +
      '</div><p class="ya-msg" id="ya-msg" role="status"></p>' +
      '<div class="ya-actions"><button class="ya-btn ghost" data-ya="close">Cancel</button>' +
      '<button class="ya-btn ok" data-ya="approve-submit" data-id="' + esc(r.id) + '">Approve and add member</button></div>');
  }
  function openEditMember(r) {
    const adding = !r;
    const fields = MEMBER_FIELDS.map(([k, label, req]) => {
      const v = adding ? (k === 'status' ? 'Active' : '') : r[k];
      return '<label class="ya-field"><span>' + esc(label) + (req ? ' *' : '') + '</span><input name="' + k + '" value="' + esc(v) + '"></label>';
    }).join('');
    const idField = adding
      ? '<label class="ya-field"><span>Member ID *</span><input name="member_id" placeholder="As used in your members list"></label>' +
        '<label class="ya-field"><span>Joined on</span><input name="joined_at" type="date" value="' + todayISO() + '"></label>'
      : '';
    openModal('<h3>' + (adding ? 'Add member' : 'Edit member') + '</h3>' +
      (adding ? '<p class="ya-muted">Adds a person straight to the members list. Use this for people who did not apply through the website.</p>'
              : '<p class="ya-muted">Member ID: <strong>' + esc(r.member_id) + '</strong></p>') +
      '<div class="ya-grid2">' + idField + fields + '</div><p class="ya-msg" id="ya-msg" role="status"></p>' +
      '<div class="ya-actions"><button class="ya-btn ghost" data-ya="close">Cancel</button>' +
      '<button class="ya-btn" data-ya="save-member" data-kind="member" data-id="' + esc(adding ? '' : r.id) + '">' + (adding ? 'Add member' : 'Save changes') + '</button></div>');
  }
  function openDelete(kind, r) {
    openModal('<h3>Delete this record?</h3><p>' + esc(r.full_name || r.email || r.name || 'This record') + ' will be removed permanently. This cannot be undone.</p>' +
      '<div class="ya-actions"><button class="ya-btn ghost" data-ya="close">Cancel</button>' +
      '<button class="ya-btn danger" data-ya="confirm-delete" data-kind="' + kind + '" data-id="' + esc(r.id) + '">Delete permanently</button></div>');
  }

  /* ---------- rendering ---------- */
  function badge(s) { return '<span class="ya-b ' + esc(String(s || 'pending').toLowerCase()) + '">' + esc(cap(s || 'pending')) + '</span>'; }
  const btn = (act, kind, id, label, cls) =>
    '<button class="ya-btn small ' + (cls || 'ghost') + '" data-ya="' + act + '" data-kind="' + kind + '" data-id="' + esc(id) + '">' + label + '</button>';

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
    return tableWrap(['Name', 'Email', 'Institution', 'Role', 'Applied', 'Status', ''], body);
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
    return tableWrap(['Member ID', 'Name', 'Email', 'Body', 'Designation', 'Affiliation', 'Status', ''], body);
  }
  function tableWrap(heads, body) {
    return '<div class="ya-tablewrap"><table class="ya-table"><thead><tr>' +
      heads.map(h => '<th>' + esc(h) + '</th>').join('') + '</tr></thead><tbody>' + body + '</tbody></table></div>';
  }
  function emptyState() {
    return '<div class="ya-empty">' + (S.q ? 'No records match your search.' : 'Nothing to show here yet.') + '</div>';
  }
  function listHTML() {
    const rows = filterRows(viewList(), S.view === 'members' ? ['full_name', 'email', 'member_id', 'affiliation'] : ['full_name', 'email']);
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
  function overviewHTML() {
    const stat = (label, val, cls) => '<div class="ya-stat ' + cls + '"><span>' + label + '</span><strong>' + val + '</strong></div>';
    return '<div class="ya-stats">' +
      stat('Members', S.members.length, 'ok') +
      stat('Pending Applications', appsByStatus('pending').length, 'warn') +
      stat('Approved Applications', appsByStatus('approved').length, '') +
      stat('Rejected Applications', appsByStatus('rejected').length, 'bad') + '</div>' +
      '<p class="ya-muted ya-note">Members are the people in your members list. Approving a pending application adds that person to it.</p>' +
      '<div class="ya-two"><div class="ya-card"><h2 class="ya-h2">Members by body</h2>' + breakdown('current_body', S.groups.map(g => g.name)) + '</div>' +
      '<div class="ya-card"><h2 class="ya-h2">Members by designation</h2>' + breakdown('current_designation', orderedPositions().map(p => p.name)) + '</div></div>' +
      '<h2 class="ya-h2">Latest pending applications</h2>' + appsTable(appsByStatus('pending').slice(0, 5)) +
      (appsByStatus('pending').length > 5 ? '<p><button class="ya-btn ghost" data-ya="nav" data-v="pending">View all pending →</button></p>' : '');
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
    return '<p class="ya-muted ya-note">The most recent 300 changes. Entries are written by the database, so they cannot be skipped.</p>' +
      tableWrap(['When', 'Who', 'Action', 'Record', 'Name'], body);
  }
  function exportHTML() {
    const b = (f, label) => '<button class="ya-btn" data-ya="export" data-f="' + f + '">' + label + '</button>';
    return '<div class="ya-card"><h2 class="ya-h2">Download CSV</h2>' +
      '<p class="ya-muted">These files contain personal details. Store and share them carefully.</p>' +
      '<div class="ya-actions start">' + b('members', 'Members (' + S.members.length + ')') +
      b('pending', 'Pending applications (' + appsByStatus('pending').length + ')') +
      b('approved', 'Approved applications (' + appsByStatus('approved').length + ')') +
      b('rejected', 'Rejected applications (' + appsByStatus('rejected').length + ')') +
      b('all', 'All applications (' + S.apps.length + ')') + '</div></div>';
  }
  function viewBody() {
    if (S.view === 'overview') return overviewHTML();
    if (S.view === 'structure') return structureHTML();
    if (S.view === 'activity') return activityHTML();
    if (S.view === 'export') return exportHTML();
    const statusSel = S.view === 'members'
      ? '<select id="ya-status" aria-label="Filter by status">' +
        ['all'].concat(memberStatuses()).map(s =>
          '<option value="' + esc(s) + '"' + (S.status === s ? ' selected' : '') + '>' + (s === 'all' ? 'All statuses' : esc(s)) + '</option>').join('') +
        '</select>' : '';
    const addBtn = S.view === 'members' ? '<button class="ya-btn small ok" data-ya="add-member">+ Add member</button>' : '';
    return '<div class="ya-toolbar">' + addBtn + '<input id="ya-q" type="search" placeholder="Search by name, email or member ID" value="' + esc(S.q) + '">' +
      statusSel + '<span class="ya-muted" id="ya-count"></span></div><div id="ya-list">' + listHTML() + '</div>';
  }
  function shell(content) {
    const nav = VIEWS.map(([k, l]) =>
      '<button class="ya-nav-btn' + (S.view === k ? ' on' : '') + '" data-ya="nav" data-v="' + k + '">' + esc(l) + '</button>').join('');
    return '<div class="ya-wrap"><aside class="ya-side"><div class="ya-brand">Yantrika Admin</div>' +
      '<nav class="ya-nav">' + nav + '</nav><div class="ya-side-foot"><div class="ya-user">' + esc(S.user && S.user.email) + '</div>' +
      '<button class="ya-btn ghost small" data-ya="logout">Logout</button></div></aside><main class="ya-main">' + content + '</main></div>';
  }
  function renderApp() {
    const r = root();
    if (!r) return;
    const title = (VIEWS.find(v => v[0] === S.view) || VIEWS[0])[1];
    r.innerHTML = shell('<header class="ya-top"><h1>' + esc(title) + '</h1><button class="ya-btn ghost small" data-ya="reload">Refresh</button></header>' +
      (S.error ? '<div class="ya-error">' + esc(S.error) + ' <button class="ya-btn small" data-ya="reload">Retry</button></div>' : '') +
      (S.notice ? '<div class="ya-notice">' + esc(S.notice) + '</div>' : '') +
      '<div id="ya-body">' + viewBody() + '</div>');
    updateCount();
  }
  function updateCount() {
    const c = document.getElementById('ya-count');
    if (c && S.view !== 'overview') c.textContent = filterRows(viewList(), S.view === 'members' ? ['full_name', 'email', 'member_id', 'affiliation'] : ['full_name', 'email']).length + ' shown';
  }
  function showLogin(msg) {
    root().innerHTML = '<div class="ya-login"><div class="ya-card"><h1>Admin sign-in</h1><p class="ya-muted">Yantrika administrators only.</p>' +
      '<form id="ya-login" class="ya-login-form">' +
      '<label>Email<input name="email" type="email" required autocomplete="username"></label>' +
      '<label>Password<input name="password" type="password" required autocomplete="current-password"></label>' +
      '<button class="ya-btn" type="submit">Sign in</button><p id="ya-login-msg" class="ya-msg" role="status">' + esc(msg || '') + '</p></form></div></div>';
  }
  function showDenied() {
    root().innerHTML = '<div class="ya-login"><div class="ya-card"><h1>Access denied</h1>' +
      '<p>This account is not an administrator. If you should have access, ask the club admin to add it.</p>' +
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
    try {
      await mountUnsafe();
    } catch (err) {
      console.error('Admin dashboard failed to start:', err);
      const r = root();
      if (r) r.innerHTML = '<div class="ya-error"><strong>The admin page could not start.</strong><br>' +
        esc((err && err.message) || String(err)) + '<br><span class="ya-muted">Open the browser console (F12) for details.</span></div>';
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
    S.error = '';
    try { await loadAll(); }
    catch (err) { S.error = 'Could not load data: ' + (err.message || 'unknown error'); }
    renderApp();
  }

  /* ---------- groups and positions (stored as members.current_body / current_designation) ---------- */
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
      '<td data-l="Group"><strong>' + esc(g.name) + '</strong></td>' +
      '<td data-l="Description">' + esc(g.description || '—') + '</td>' +
      '<td data-l="Members">' + membersIn('current_body', g.name) + '</td>' +
      '<td class="ya-acts">' + btn('edit-group', 'group', g.id, 'Edit') + btn('delete', 'group', g.id, 'Delete', 'danger') + '</td></tr>').join('');
    const posRows = orderedPositions().map(p =>
      '<tr><td data-l="Position"><span style="padding-left:' + (positionDepth(p) * 22) + 'px">' +
      (positionDepth(p) ? '↳ ' : '') + '<strong>' + esc(p.name) + '</strong></span></td>' +
      '<td data-l="Group">' + esc(groupNameOf(p.group_id)) + '</td>' +
      '<td data-l="Reports to">' + esc((posById(p.parent_id) || {}).name || '—') + '</td>' +
      '<td data-l="Members">' + membersIn('current_designation', p.name) + '</td>' +
      '<td class="ya-acts">' + btn('edit-position', 'position', p.id, 'Edit') + btn('delete', 'position', p.id, 'Delete', 'danger') + '</td></tr>').join('');
    const head = (title, act, label) => '<div class="ya-toolbar"><h2 class="ya-h2" style="margin:0 auto 0 0">' + title +
      '</h2><button class="ya-btn small ok" data-ya="' + act + '">' + label + '</button></div>';
    return '<p class="ya-muted ya-note">Groups are the bodies (stored in each member\'s "current body"). Positions sit inside a group, and "Reports to" builds the hierarchy (stored in each member\'s "current designation"). Set a member\'s body and position from All Members, using the Body &amp; role button.</p>' +
      '<div class="ya-card" style="margin-top:12px">' + head('Groups', 'add-group', '+ Add group') +
      (groupRows ? tableWrap(['Order', 'Group', 'Description', 'Members', ''], groupRows) : emptyState()) + '</div>' +
      '<div class="ya-card" style="margin-top:16px">' + head('Positions and hierarchy', 'add-position', '+ Add position') +
      (posRows ? tableWrap(['Position', 'Group', 'Reports to', 'Members', ''], posRows) : emptyState()) + '</div>';
  }

  function openGroupForm(g) {
    openModal('<h3>' + (g ? 'Edit group' : 'Add group') + '</h3><div class="ya-grid2">' +
      '<label class="ya-field"><span>Name *</span><input name="name" value="' + esc(g ? g.name : '') + '"></label>' +
      '<label class="ya-field"><span>Order</span><input name="sort_order" type="number" value="' + esc(g ? g.sort_order : S.groups.length + 1) + '"></label>' +
      '<label class="ya-field" style="grid-column:1/-1"><span>Description</span><textarea name="description" rows="3">' + esc(g ? g.description || '' : '') + '</textarea></label>' +
      '</div><p class="ya-muted ya-note">Renaming a group also updates every member who is in it.</p>' +
      '<p class="ya-msg" id="ya-msg" role="status"></p>' +
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
      '</div><p class="ya-muted ya-note">Renaming a position also updates every member who holds it.</p>' +
      '<p class="ya-msg" id="ya-msg" role="status"></p>' +
      '<div class="ya-actions"><button class="ya-btn ghost" data-ya="close">Cancel</button>' +
      '<button class="ya-btn" data-ya="save-position" data-id="' + esc(p ? p.id : '') + '">Save</button></div>');
  }
  function openRole(m) {
    const bodyOpts = '<option value="">— none —</option>' + S.groups.slice().sort((a, b) => a.sort_order - b.sort_order).map(g =>
      '<option value="' + esc(g.name) + '"' + (m.current_body === g.name ? ' selected' : '') + '>' + esc(g.name) + '</option>').join('');
    const posOpts = '<option value="">— none —</option>' + orderedPositions().map(p =>
      '<option value="' + esc(p.name) + '"' + (m.current_designation === p.name ? ' selected' : '') + '>' + esc(positionLabel(p)) + '</option>').join('');
    openModal('<h3>Body &amp; role for ' + esc(m.full_name) + '</h3>' +
      '<div class="ya-grid2"><label class="ya-field"><span>Current body (group)</span><select name="current_body">' + bodyOpts + '</select></label>' +
      '<label class="ya-field"><span>Current designation (position)</span><select name="current_designation">' + posOpts + '</select></label></div>' +
      '<p class="ya-muted ya-note">Choose from the lists you set up under Groups &amp; Positions.</p>' +
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
      case 'nav': S.view = el.getAttribute('data-v'); S.q = ''; renderApp(); break;
      case 'logout': await sb().auth.signOut(); clearSavedLogins(); closeModal(); mount(); break;
      case 'reload': await refresh(); break;
      case 'close': closeModal(); break;
      case 'detail': if (row) openDetail(kind, row); break;
      case 'approve-open': if (row) openApprove(row); break;
      case 'approve-submit': await approveSubmit(id); break;
      case 'reject': if (row) await setAppStatus(row, 'rejected'); break;
      case 'restore': if (row) await setAppStatus(row, 'pending'); break;
      case 'edit-member': if (row) openEditMember(row); break;
      case 'add-member': openEditMember(null); break;
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
      case 'save-role': await saveRole(id); break;
      case 'export': {
        const f = el.getAttribute('data-f');
        if (f === 'members') exportCsv(S.members, MEMBER_COLS, 'yantrika-members');
        else if (f === 'all') exportCsv(S.apps, APP_COLS, 'yantrika-applications');
        else exportCsv(appsByStatus(f), APP_COLS, 'yantrika-applications-' + f);
        break;
      }
    }
  }
  function onInput(e) {
    if (e.target.id !== 'ya-q') return;
    S.q = e.target.value;
    const l = document.getElementById('ya-list');
    if (l) l.innerHTML = listHTML();
    updateCount();
  }
  function onChange(e) {
    if (e.target.id !== 'ya-status') return;
    S.status = e.target.value;
    renderApp();
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
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  window.YADMIN = { mount: mount };

  const CSS = `
#yadmin-root{width:100%;text-align:left;color:var(--ink,#17171d);font-size:15px;line-height:1.5}
#yadmin-root *,#ya-back *{box-sizing:border-box}
.ya-wrap{display:grid;grid-template-columns:230px minmax(0,1fr);gap:24px;align-items:start}
.ya-side{position:sticky;top:84px;background:var(--card,#fff);border:1px solid rgba(128,128,128,.25);border-radius:14px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,.06);display:flex;flex-direction:column;gap:12px}
.ya-brand{font-weight:700;font-size:1.05rem;padding:4px 8px}
.ya-nav{display:flex;flex-direction:column;gap:4px}
.ya-nav-btn{background:none;border:0;text-align:left;cursor:pointer;padding:9px 12px;border-radius:8px;font:inherit;color:inherit}
.ya-nav-btn:hover{background:rgba(128,128,128,.12)}
.ya-nav-btn.on{background:var(--yel,#f1c40f);color:#17171d;font-weight:700}
.ya-side-foot{border-top:1px solid rgba(128,128,128,.25);padding-top:12px;display:flex;flex-direction:column;gap:8px}
.ya-user{font-size:.8rem;opacity:.7;word-break:break-all}
.ya-main{min-width:0}
.ya-top{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap}
.ya-top h1{margin:0;font-size:1.5rem}
.ya-h2{font-size:1.1rem;margin:24px 0 10px}
.ya-note{font-size:.85rem;margin:8px 0 0}
.ya-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
.ya-stat{background:var(--card,#fff);border:1px solid rgba(128,128,128,.25);border-radius:14px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,.06);border-top:4px solid #999}
.ya-stat span{display:block;font-size:.85rem;opacity:.75}
.ya-stat strong{font-size:2rem;line-height:1.2}
.ya-stat.warn{border-top-color:#e0a800}.ya-stat.ok{border-top-color:#1aa37a}.ya-stat.bad{border-top-color:#d6395a}
.ya-card{background:var(--card,#fff);border:1px solid rgba(128,128,128,.25);border-radius:14px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,.06)}
.ya-toolbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:12px}
.ya-toolbar input[type=search]{flex:1 1 220px;min-width:0}
input,select,textarea{font:inherit;padding:9px 11px;border:1px solid rgba(128,128,128,.4);border-radius:8px;background:var(--bg,#fff);color:var(--ink,#17171d);width:100%}
textarea{resize:vertical}
.ya-field{display:flex;flex-direction:column;gap:4px;font-size:.9rem}
.ya-grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.ya-grid2 .ya-field:has(textarea){grid-column:1/-1}
.ya-btn{display:inline-block;cursor:pointer;font:inherit;font-weight:700;padding:9px 16px;border-radius:10px;border:1px solid #17171d;background:var(--yel,#f1c40f);color:#17171d;text-decoration:none;transition:transform .1s}
.ya-btn:hover{transform:translateY(-1px)}
.ya-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
.ya-btn.ghost{background:transparent;color:var(--ink,#17171d)}
.ya-btn.ok{background:#1aa37a;color:#fff;border-color:#1aa37a}
.ya-btn.warn{background:#ffd966;border-color:#b58b00}
.ya-btn.danger{background:#d6395a;color:#fff;border-color:#d6395a}
.ya-btn.small{padding:5px 10px;font-size:.82rem;border-radius:8px}
.ya-actions{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;margin-top:18px}
.ya-actions.start{justify-content:flex-start}
.ya-acts{white-space:nowrap}
.ya-acts .ya-btn{margin:2px 3px 2px 0}
.ya-tablewrap{overflow-x:auto;background:var(--card,#fff);border:1px solid rgba(128,128,128,.25);border-radius:12px}
.ya-table{width:100%;border-collapse:collapse;font-size:.9rem}
.ya-table th{text-align:left;padding:10px 12px;font-size:.8rem;text-transform:uppercase;letter-spacing:.04em;opacity:.7;border-bottom:1px solid rgba(128,128,128,.25)}
.ya-table td{padding:10px 12px;border-bottom:1px solid rgba(128,128,128,.15);vertical-align:middle}
.ya-table tr:last-child td{border-bottom:0}
.ya-b{display:inline-block;padding:2px 10px;border-radius:999px;font-size:.78rem;font-weight:700;border:1px solid}
.ya-b.pending{background:#fff4d6;color:#7a5a00;border-color:#e6c25c}
.ya-b.approved{background:#dcf7ee;color:#0b6b4f;border-color:#7fd1b2}
.ya-b.rejected{background:#fde2e4;color:#8a1c2b;border-color:#f0a3ad}
.ya-empty{padding:28px;text-align:center;border:1px dashed rgba(128,128,128,.4);border-radius:12px;opacity:.8}
.ya-error{background:#fde2e4;color:#8a1c2b;border:1px solid #f0a3ad;border-radius:10px;padding:12px 14px;margin-bottom:14px}
.ya-muted{opacity:.7}
.ya-center{padding:40px;text-align:center;opacity:.8}
.ya-login{display:flex;justify-content:center;padding:30px 0}
.ya-login .ya-card{width:min(420px,100%)}
.ya-login-form{display:flex;flex-direction:column;gap:12px;margin-top:12px}
.ya-login-form label{display:flex;flex-direction:column;gap:4px;font-size:.9rem}
.ya-checks{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
.ya-check{display:flex;gap:8px;align-items:center;font-size:.95rem}
.ya-check input{width:auto}
.ya-two{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:6px}
.ya-num{text-align:right;font-weight:700}
.ya-bar{height:8px;background:rgba(128,128,128,.2);border-radius:99px;overflow:hidden}
.ya-bar span{display:block;height:100%;background:var(--cy,#33d6a6)}
@media (max-width:820px){.ya-two{grid-template-columns:1fr}}
.ya-notice{background:#fff4d6;color:#5c4500;border:1px solid #e6c25c;border-radius:10px;padding:12px 14px;margin-bottom:14px}
.ya-msg{font-size:.9rem;min-height:1.2em;margin:0}
.ya-dl{display:grid;grid-template-columns:150px 1fr;gap:8px 14px;margin:12px 0 0}
.ya-dl dt{font-weight:700;opacity:.75}
.ya-dl dd{margin:0;word-break:break-word;white-space:pre-wrap}
.ya-back{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px}
.ya-modal{background:var(--card,#fff);color:var(--ink,#17171d);border:3px solid #17171d;border-radius:14px;padding:22px;width:min(640px,100%);max-height:90vh;overflow:auto;box-shadow:6px 6px 0 #17171d}
.ya-modal h3{margin:0 0 6px;font-size:1.3rem}
#ya-toast{position:fixed;right:18px;bottom:90px;z-index:300;padding:12px 16px;border-radius:10px;font-weight:700;border:2px solid #17171d;box-shadow:4px 4px 0 #17171d;display:none;max-width:min(380px,90vw)}
#ya-toast.ok{background:#dcf7ee;color:#0b6b4f}
#ya-toast.err{background:#fde2e4;color:#8a1c2b}
@media (max-width:820px){
  .ya-wrap{grid-template-columns:1fr;gap:14px}
  .ya-side{position:static;padding:12px}
  .ya-nav{flex-direction:row;overflow-x:auto;padding-bottom:4px}
  .ya-nav-btn{white-space:nowrap}
  .ya-stats{grid-template-columns:1fr 1fr}
  .ya-grid2{grid-template-columns:1fr}
  .ya-tablewrap{overflow:visible;border:0;background:none}
  .ya-table thead{display:none}
  .ya-table,.ya-table tbody,.ya-table tr,.ya-table td{display:block;width:100%}
  .ya-table tr{background:var(--card,#fff);border:1px solid rgba(128,128,128,.25);border-radius:12px;padding:8px 12px;margin-bottom:10px}
  .ya-table td{display:flex;justify-content:space-between;gap:12px;border:0;padding:4px 0;text-align:right}
  .ya-table td::before{content:attr(data-l);font-weight:700;opacity:.65;text-align:left}
  .ya-table td.ya-acts{justify-content:flex-end;flex-wrap:wrap}
  .ya-table td.ya-acts::before{content:none}
  .ya-dl{grid-template-columns:1fr}
  #ya-toast{left:12px;right:12px;bottom:80px;max-width:none}
}
`;
})();
