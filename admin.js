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
  const TASKS = 'admin_tasks';
  const VIEWS = [
    ['overview', 'Dashboard Overview'],
    ['members', 'All Members'],
    ['structure', 'Groups & Positions'],
    ['tasks', 'Tasks'],
    ['email', 'Send email'],
    ['pending', 'Pending Applications'],
    ['approved', 'Approved Applications'],
    ['rejected', 'Rejected Applications'],
    ['activity', 'Activity Log'],
    ['admins', 'Admin Users'],
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

  const S = { apps: [], members: [], groups: [], positions: [], activity: [], admins: [], tasks: [], directory: [], taskFilter: 'all', view: 'overview', q: '', status: 'all', error: '', notice: '', user: null, role: 'viewer', gq: '', quota: null };

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
  // Roles: super_admin (everything), admin (edit, no deletes or admin management), viewer (read only).
  // The database enforces these rules; the dashboard only hides what a role cannot use.
  const ROLE_LABEL = { super_admin: 'Super admin', admin: 'Admin', viewer: 'Viewer' };
  const EDIT_ACTS = ['send-announcement', 'add-member', 'edit-member', 'member-role', 'save-member', 'approve-open', 'approve-submit',
    'reject', 'restore', 'save-notes', 'add-group', 'edit-group', 'save-group', 'add-position', 'edit-position',
    'save-position', 'save-role', 'new-task', 'save-task'];
  const SUPER_ACTS = ['delete', 'confirm-delete', 'add-admin', 'save-admin', 'remove-admin', 'confirm-remove-admin'];
  const canEdit = () => S.role === 'super_admin' || S.role === 'admin';
  const isSuper = () => S.role === 'super_admin';
  function allowedAct(act) {
    if (EDIT_ACTS.indexOf(act) >= 0) return canEdit();
    if (SUPER_ACTS.indexOf(act) >= 0) return isSuper();
    return true;
  }
  // Remove buttons this role cannot use, and make notes read-only for viewers.
  function applyPermissions(scope) {
    scope.querySelectorAll('[data-ya]').forEach(el => {
      if (!allowedAct(el.getAttribute('data-ya'))) el.remove();
    });
    if (!canEdit()) scope.querySelectorAll('textarea[name="admin_notes"]').forEach(t => { t.readOnly = true; });
  }
  const AFFILIATIONS = ['IACS', 'Non-IACS'];
  // Affiliation is a fixed choice in the database. Show a dropdown that offers the allowed values,
  // plus the current value if it is something else (so older records can still be opened and fixed).
  function affiliationSelect(current) {
    const opts = AFFILIATIONS.slice();
    if (current && opts.indexOf(current) < 0) opts.push(current);
    const sel = current || AFFILIATIONS[0];
    return '<label class="ya-field"><span>Affiliation *</span><select name="affiliation">' +
      opts.map(o => '<option value="' + esc(o) + '"' + (o === sel ? ' selected' : '') + '>' + esc(o) + '</option>').join('') +
      '</select></label>';
  }
  // Pre-select IACS when the institution mentions IACS, otherwise Non-IACS.
  const guessAffiliation = inst => /iacs|indian association for the cultivation/i.test(inst || '') ? 'IACS' : 'Non-IACS';
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
  async function loadDirectory() {
    const res = await sb().rpc('admin_directory');
    S.directory = res.error ? [] : (res.data || []).map(d => ({ id: d.dir_user_id, name: d.dir_name, role: d.dir_role }));
  }
  const nameOfAdmin = uid => ((S.directory.find(d => d.id === uid)) || {}).name || '';
  async function loadTasks() {
    await loadDirectory();
    const res = await sb().from(TASKS).select('*').order('created_at', { ascending: false });
    if (res.error) { S.tasks = []; S.error = 'Could not load tasks: ' + res.error.message; return; }
    S.tasks = res.data || [];
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
  const LIST_FOR = { member: () => S.members, app: () => S.apps, group: () => S.groups, position: () => S.positions, task: () => S.tasks };
  const MEMBER_SEARCH = ['full_name', 'email', 'member_id', 'affiliation', 'current_body', 'current_designation', 'phone', 'institution'];
  const TABLE_FOR = { member: MEMBERS, app: APPS, group: GROUPS, position: POSITIONS, task: TASKS };
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
    if (adding) {
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
    let res;
    if (adding) {
      // generate the ID now; if someone else took it a moment ago, try once more
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
    const res = await sb().from(TABLE_FOR[kind] || APPS).delete().eq('id', id).select('id');
    if (res.error) return toast(dbMessage(res.error, 'Delete failed.'), false);
    if (!res.data || !res.data.length) return toast('Nothing was deleted. Check admin permissions.', false);
    closeModal();
    toast('Deleted.');
    if (kind === 'task') await loadTasks();
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
      (adding ? '<p class="ya-muted">Adds a person straight to the members list. Use this for people who did not apply through the website.</p>'
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
    return '<div class="ya-empty">' + (S.q ? 'No records match "' + esc(S.q) + '". Try a shorter word.' : 'Nothing here yet.') + '</div>';
  }
  function listHTML() {
    const rows = filterRows(viewList(), S.view === 'members' ? MEMBER_SEARCH : ['full_name', 'email']);
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
    return '<div class="ya-welcome"><h2>Welcome, ' + esc(linked ? name : (email || '')) + '</h2>' +
      '<p class="ya-muted">' + esc(ROLE_LABEL[S.role] || 'Viewer') + ' · ' + (mine ? mine + ' open task' + (mine === 1 ? '' : 's') + ' assigned to you' : 'No open tasks assigned to you') + '</p>' +
      (linked ? '' : '<p class="ya-muted ya-note">Your login is not linked to a member name yet. A super admin can link it in Admin Users.</p>') +
      '</div>';
  }
  function setupChecklistHTML() {
    const linked = S.directory.length > 0 && S.directory.every(d => d.name && d.name.indexOf('@') < 0);
    const items = [
      ['Add your members', S.members.length > 0, 'members'],
      ['Set up the groups (bodies)', S.groups.length > 0, 'structure'],
      ['Set up positions', S.positions.length > 0, 'structure'],
      ['Link every admin login to a member name', linked, 'admins']
    ];
    if (!items.some(i => !i[1])) return '';
    return '<div class="ya-card ya-checklist"><h2 class="ya-h2">Getting started</h2>' +
      '<p class="ya-muted">A few steps to finish setting things up:</p><ul>' +
      items.map(([label, done, view]) => '<li>' + (done ? '✓ ' : '○ ') + esc(label) +
        (done ? '' : ' <button class="ya-linkbtn" data-ya="nav" data-v="' + view + '">Go</button>') + '</li>').join('') +
      '</ul></div>';
  }
  function overviewHTML() {
    return welcomeHTML() + setupChecklistHTML() + overviewCards();
  }
  function overviewCards() {
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
      '<p class="ya-muted ya-note"><strong>Super admin</strong>: everything, including deleting records and managing admins. <strong>Admin</strong>: view and edit, approve, notes, groups and positions, but no deleting and no admin management. <strong>Viewer</strong>: view only.</p>' +
      '<p class="ya-muted ya-note">The person must already have a login: create it in Supabase under Authentication, then Users, then Add user.</p>' +
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
  // ---- email (sent by the send-email function, which holds the Brevo key)
  const EMAIL_FN = 'send-email';
  const CHUNK = 40;
  const CHUNK_PAUSE_MS = 1500;
  async function loadQuota() {
    const res = await sb().functions.invoke(EMAIL_FN, { body: { action: 'quota' } });
    S.quota = res.error ? null : res.data;
    S.quotaError = res.error ? (res.error.message || 'unknown error') : '';
    return S.quota;
  }
  async function notifyTask(taskId, event) {
    const res = await sb().functions.invoke(EMAIL_FN, { body: { action: 'task', task_id: taskId, event: event } });
    if (res.error) { toast('Saved, but the email was not sent. ' + (res.error.message || ''), false); return false; }
    return true;
  }
  function emailHTML() {
    const q = S.quota;
    const left = q ? Math.max(0, q.daily_limit - q.sent_today) : null;
    const withEmail = S.members.filter(m => m.email);
    const groups = S.groups.slice().sort((a, b) => a.sort_order - b.sort_order);
    const groupOpts = '<option value="">Everyone with an email address</option>' +
      groups.map(g => '<option value="' + esc(g.name) + '">' + esc(g.name) + '</option>').join('');
    return '<div class="ya-card"><h2 class="ya-h2">Send an announcement</h2>' +
      '<p class="ya-muted">Each person gets their own email. Sent in small batches with a short pause.</p>' +
      '<div class="ya-quota ' + (left === 0 ? 'bad' : '') + '">' +
      (q ? 'Emails sent today: <strong>' + q.sent_today + '</strong> of <strong>' + q.daily_limit + '</strong> (<strong>' + left + '</strong> left)'
         : 'Could not read today\'s email count. Check that the email function is set up.') + '</div>' +
      '<div class="ya-grid2" style="margin-top:12px">' +
      '<label class="ya-field"><span>Send to</span><select name="ann_group">' + groupOpts + '</select></label>' +
      '<label class="ya-field"><span>Subject *</span><input name="ann_subject" placeholder="e.g. Workshop on Saturday"></label>' +
      '<label class="ya-field" style="grid-column:1/-1"><span>Message *</span><textarea name="ann_body" rows="6"></textarea></label>' +
      '</div><p class="ya-muted ya-note">' + withEmail.length + ' member(s) have an email address. Members without one are skipped.</p>' +
      '<div class="ya-actions start"><button class="ya-btn ok" data-ya="send-announcement">Review and send</button></div></div>';
  }
  async function openAnnouncementConfirm() {
    const body = document.querySelector('#yadmin-root textarea[name="ann_body"]');
    const message = body ? body.value.trim() : '';
    const group = (document.querySelector('#yadmin-root select[name="ann_group"]') || {}).value || '';
    const subj = (document.querySelector('#yadmin-root input[name="ann_subject"]') || {}).value.trim();
    if (!subj || !message) return toast('Add a subject and a message first.', false);
    const recips = S.members.filter(m => m.email && (!group || m.current_body === group));
    if (!recips.length) return toast('No members with an email address in that group.', false);
    if (!S.quota) {
      await loadQuota();
      if (!S.quota) return toast('Could not reach the email function. Check that send-email is deployed and its secrets are set. (' + (S.quotaError || 'no details') + ')', false);
    }
    const left = Math.max(0, S.quota.daily_limit - S.quota.sent_today);
    if (left === 0) return toast('The daily email limit (' + S.quota.daily_limit + ') has been reached for today.', false);
    if (recips.length > left) return toast('Only ' + left + ' email(s) left today. Choose a smaller group.', false);
    S.pendingAnn = { subject: subj, message: message, ids: recips.map(m => m.id), group: group };
    openModal('<h3>Send this announcement?</h3>' +
      '<p><strong>' + esc(subj) + '</strong></p><p class="ya-muted">To ' + recips.length + ' member(s)' + (group ? ' in ' + esc(group) : '') + '.</p>' +
      '<div class="ya-dl" style="white-space:pre-wrap;border:1px solid rgba(128,128,128,.25);border-radius:10px;padding:10px">' + esc(message) + '</div>' +
      '<p class="ya-msg" id="ya-msg" role="status"></p>' +
      '<div class="ya-actions"><button class="ya-btn ghost" data-ya="close">Cancel</button>' +
      '<button class="ya-btn ok" data-ya="confirm-announcement">Send now</button></div>');
  }
  async function sendAnnouncement() {
    const a = S.pendingAnn;
    if (!a) return;
    let sent = 0, failed = 0, firstError = '';
    const chunks = [];
    for (let i = 0; i < a.ids.length; i += CHUNK) chunks.push(a.ids.slice(i, i + CHUNK));
    for (let c = 0; c < chunks.length; c++) {
      modalMsg('Sending batch ' + (c + 1) + ' of ' + chunks.length + '…');
      const res = await sb().functions.invoke(EMAIL_FN, { body: { action: 'announcement', member_ids: chunks[c], subject: a.subject, message: a.message } });
      if (res.error) {
        failed += chunks[c].length;
        firstError = firstError || (res.error.message || 'The email service did not respond.');
        break;
      }
      sent += res.data.sent || 0;
      failed += res.data.failed || 0;
      if (!firstError && res.data.failures && res.data.failures.length) firstError = res.data.failures[0];
      if (c < chunks.length - 1) await new Promise(r => setTimeout(r, CHUNK_PAUSE_MS));
    }
    S.pendingAnn = null;
    closeModal();
    toast('Sent ' + sent + '. ' + (failed ? failed + ' not sent. ' + firstError : ''), failed === 0);
    await loadQuota();
    renderApp();
  }

  function tasksHTML() {
    const me = S.user && S.user.id;
    const f = S.taskFilter;
    const list = S.tasks.filter(t =>
      f === 'all' ? true : f === 'mine' ? t.assignee_user_id === me : t.status === f);
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
      '<p class="ya-muted ya-note">Assign a task to an admin. The assignee can start it and mark it done.</p>' +
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
      '<p class="ya-muted">Enter the email of an existing login. Create the login first in Supabase: Authentication, then Users, then Add user.</p>' +
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
    if (!q) return '<div class="ya-empty">Type a name, email, Member ID, group, position, or task above, then press Search.</div>';
    const hit = obj => Object.keys(obj).some(k =>
      !/(^id$|_id$|_at$|_by$)/.test(k) && valueText(obj[k]).toLowerCase().indexOf(q) >= 0);
    const mem = S.members.filter(hit);
    const app = S.apps.filter(hit);
    const grp = S.groups.filter(hit);
    const pos = S.positions.filter(hit);
    const tsk = S.tasks.filter(hit);
    const adm = isSuper() ? S.admins.filter(a => hit({ email: a.email, name: a.memberName || '' })) : [];
    const act = S.activity.filter(hit).slice(0, 50);
    const total = mem.length + app.length + grp.length + pos.length + tsk.length + adm.length + act.length;
    const section = (title, count, body) => count ? '<h2 class="ya-h2">' + esc(title) + ' (' + count + ')</h2>' + body : '';
    const memBody = tableWrap(['Name', 'Member ID', 'Body', 'Designation', ''], mem.map(m =>
      '<tr><td data-l="Name"><strong>' + esc(m.full_name) + '</strong></td><td data-l="Member ID">' + esc(m.member_id) + '</td>' +
      '<td data-l="Body">' + esc(m.current_body || '—') + '</td><td data-l="Designation">' + esc(m.current_designation || '—') + '</td>' +
      '<td class="ya-acts">' + btn('detail', 'member', m.id, 'View') + '</td></tr>').join(''));
    const appBody = tableWrap(['Name', 'Email', 'Status', ''], app.map(a =>
      '<tr><td data-l="Name"><strong>' + esc(a.full_name) + '</strong></td><td data-l="Email">' + esc(a.email) + '</td>' +
      '<td data-l="Status">' + badge(a.status) + '</td><td class="ya-acts">' + btn('detail', 'app', a.id, 'View') + '</td></tr>').join(''));
    const grpBody = tableWrap(['Group', 'Members', ''], grp.map(g =>
      '<tr><td data-l="Group"><strong>' + esc(g.name) + '</strong></td><td data-l="Members">' + membersIn('current_body', g.name) + '</td>' +
      '<td class="ya-acts">' + btn('group-members', 'group', g.id, 'Show people') + '</td></tr>').join(''));
    const posBody = tableWrap(['Position', 'Group', 'Members', ''], pos.map(p =>
      '<tr><td data-l="Position"><strong>' + esc(p.name) + '</strong></td><td data-l="Group">' + esc(groupNameOf(p.group_id)) + '</td>' +
      '<td data-l="Members">' + membersIn('current_designation', p.name) + '</td>' +
      '<td class="ya-acts">' + btn('position-members', 'position', p.id, 'Show people') + '</td></tr>').join(''));
    const tskBody = tableWrap(['Task', 'Assigned to', 'Status'], tsk.map(t =>
      '<tr><td data-l="Task"><strong>' + esc(t.title) + '</strong></td><td data-l="Assigned to">' + esc(nameOfAdmin(t.assignee_user_id) || '—') + '</td>' +
      '<td data-l="Status">' + esc(t.status) + '</td></tr>').join(''));
    const admBody = tableWrap(['Email', 'Role', ''], adm.map(a =>
      '<tr><td data-l="Email">' + esc(a.email) + '</td><td data-l="Role">' + esc(ROLE_LABEL[a.role] || a.role) + '</td>' +
      '<td class="ya-acts"><button class="ya-btn small ghost" data-ya="nav" data-v="admins">Open Admin Users</button></td></tr>').join(''));
    const actBody = tableWrap(['When', 'Who', 'Action', 'Name'], act.map(a =>
      '<tr><td data-l="When">' + esc(new Date(a.created_at).toLocaleDateString('en-IN')) + '</td><td data-l="Who">' + esc(a.actor_email || 'Website') + '</td>' +
      '<td data-l="Action">' + esc(cap(a.action)) + '</td><td data-l="Name">' + esc(a.summary || '—') + '</td></tr>').join(''));
    return '<p class="ya-muted">' + total + ' result' + (total === 1 ? '' : 's') + ' for "' + esc(S.gq) + '"</p>' +
      (total ? '' : '<div class="ya-empty">Nothing matches "' + esc(S.gq) + '". Try a shorter word, or check the spelling.</div>') +
      section('Members', mem.length, memBody) +
      section('Applications', app.length, appBody) +
      section('Groups', grp.length, grpBody) +
      section('Positions', pos.length, posBody) +
      section('Tasks', tsk.length, tskBody) +
      section('Admin accounts', adm.length, admBody) +
      section('Activity log', act.length, actBody);
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
    return '<div class="ya-toolbar">' + addBtn + '<input id="ya-q" type="search" placeholder="Search by name, email or member ID" value="' + esc(S.q) + '">' +
      statusSel + '<span class="ya-muted" id="ya-count"></span></div><div id="ya-list">' + listHTML() + '</div>';
  }
  function shell(content) {
    const nav = VIEWS.filter(([k]) => (k !== 'admins' || isSuper()) && (k !== 'email' || canEdit())).map(([k, l]) =>
      '<button class="ya-nav-btn' + (S.view === k ? ' on' : '') + '" data-ya="nav" data-v="' + k + '">' + esc(l) + '</button>').join('');
    return '<div class="ya-wrap"><aside class="ya-side"><div class="ya-brand">Yantrika Admin</div>' +
      '<nav class="ya-nav">' + nav + '</nav><div class="ya-side-foot"><div class="ya-user"><strong>' + esc(nameOfAdmin(S.user && S.user.id) || (S.user && S.user.email)) + '</strong><br><span class="ya-muted">' + esc(ROLE_LABEL[S.role] || 'Viewer') + '</span></div>' +
      '<button class="ya-btn ghost small" data-ya="logout">Logout</button></div></aside><main class="ya-main">' + content + '</main></div>';
  }
  function renderApp() {
    const r = root();
    if (!r) return;
    const title = S.view === 'search' ? 'Search results' : ((VIEWS.find(v => v[0] === S.view) || VIEWS[0])[1]);
    r.innerHTML = shell('<header class="ya-top"><h1>' + esc(title) + '</h1>' +
      '<div class="ya-searchbar"><input id="ya-global" type="search" placeholder="Search everything: name, email, Member ID, group, task…" value="' + esc(S.gq) + '" aria-label="Search everything">' +
      '<button class="ya-btn small" data-ya="search-run">Search</button></div>' +
      '<button class="ya-btn ghost small" data-ya="reload">Refresh</button></header>' +
      (S.error ? '<div class="ya-error">' + esc(S.error) + ' <button class="ya-btn small" data-ya="reload">Retry</button></div>' : '') +
      (S.notice ? '<div class="ya-notice">' + esc(S.notice) + '</div>' : '') +
      '<div id="ya-body">' + viewBody() + '</div>');
    applyPermissions(r);
    updateCount();
  }
  function updateCount() {
    const c = document.getElementById('ya-count');
    if (c && S.view !== 'overview') c.textContent = filterRows(viewList(), S.view === 'members' ? MEMBER_SEARCH : ['full_name', 'email']).length + ' shown';
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
  function openMembersIn(field, name, label, title) {
    const list = S.members.filter(m => m[field] === name).sort((a, b) => String(a.full_name).localeCompare(String(b.full_name)));
    const rows = list.map(m =>
      '<tr><td data-l="Name"><strong>' + esc(m.full_name) + '</strong></td>' +
      '<td data-l="Member ID">' + esc(m.member_id) + '</td>' +
      '<td data-l="Designation">' + esc(m.current_designation || '—') + '</td>' +
      '<td data-l="Email">' + esc(m.email || '—') + '</td>' +
      '<td class="ya-acts">' + btn('detail', 'member', m.id, 'View') + '</td></tr>').join('');
    openModal('<h3>' + esc(label) + ': ' + esc(name) + '</h3>' +
      '<p class="ya-muted">' + list.length + ' member' + (list.length === 1 ? '' : 's') + '. ' + esc(title || '') + '</p>' +
      (rows ? tableWrap(['Name', 'Member ID', 'Designation', 'Email', ''], rows)
            : '<div class="ya-empty">No one is in this yet. Add people from All Members, using the Body &amp; role button.</div>') +
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
      case 'nav':
        S.view = el.getAttribute('data-v'); S.q = '';
        if (S.view === 'admins' && !isSuper()) S.view = 'overview';
        if (S.view === 'admins') await loadAdmins();
        if (S.view === 'tasks') await loadTasks();
        if (S.view === 'email') await loadQuota();
        renderApp();
        break;
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
      case 'group-members': { const g = findRow('group', id); if (g) openMembersIn('current_body', g.name, 'Group', 'Everyone whose current body is this group.'); break; }
      case 'position-members': { const p = findRow('position', id); if (p) openMembersIn('current_designation', p.name, 'Position', 'Everyone currently holding this position.'); break; }
      case 'open-members-filter': closeModal(); S.view = 'members'; S.q = el.getAttribute('data-q') || ''; renderApp(); break;
      case 'new-task': openTask(); break;
      case 'send-announcement': await openAnnouncementConfirm(); break;
      case 'confirm-announcement': await sendAnnouncement(); break;
      case 'save-task': await saveTask(); break;
      case 'task-status': await setTaskStatus(id, el.getAttribute('data-status')); break;
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
  function runSearch() {
    const el = document.getElementById('ya-global');
    S.gq = el ? el.value : S.gq;
    S.view = 'search';
    renderApp();
  }
  function onInput(e) {
    if (e.target.id !== 'ya-q') return;
    S.q = e.target.value;
    const l = document.getElementById('ya-list');
    if (l) l.innerHTML = listHTML();
    updateCount();
  }
  function onChange(e) {
    if (e.target.name === 'admin_role') { setRole(e.target.getAttribute('data-id'), e.target.value); return; }
    if (e.target.name === 'admin_member') { setAdminMember(e.target.getAttribute('data-id'), e.target.value); return; }
    if (e.target.id === 'ya-task-filter') { S.taskFilter = e.target.value; renderApp(); return; }
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
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Enter' && e.target && e.target.id === 'ya-global') runSearch();
  });

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
.ya-readonly{background:rgba(128,128,128,.12);font-weight:700}
.ya-searchbar{display:flex;gap:8px;flex:1 1 360px;max-width:560px}
.ya-searchbar input{flex:1;min-width:0}
.ya-linkbtn{background:none;border:0;padding:0;font:inherit;font-weight:700;cursor:pointer;text-decoration:underline;color:inherit;text-align:left}
.ya-checklist ul{list-style:none;padding:0;margin:8px 0 0;display:flex;flex-direction:column;gap:6px}
.ya-checklist li{display:flex;gap:8px;align-items:center}
.ya-welcome h2{margin:0 0 4px;font-size:1.4rem}
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
