'use client';

import { useEffect, useMemo, useState } from 'react';
import { Edit2, Plus, Trash2, UserRound, X } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from '@/components/shared/ImageUpload';

const emptyForm = {
  name: '',
  employeeCode: '',
  avatar: '',
  email: '',
  phone: '',
  roleName: '',
  roleSlug: '',
  departmentCode: '',
  department: '',
  designationCode: '',
  designation: '',
  reportingTo: '',
  reportingToName: '',
  hod: '',
  hodName: '',
  isHod: false,
  canReceiveReports: false,
  salary: 0,
  joiningDate: '',
  employmentType: 'full_time',
  workLocation: '',
  emergencyContact: '',
  performanceScore: 3,
  dailyLog: '',
  isActive: true,
};

export default function TeamPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [teamRes, deptRes, desigRes, roleRes] = await Promise.all([
        fetch('/api/team?status=active'),
        fetch('/api/departments?status=active'),
        fetch('/api/designations?status=active'),
        fetch('/api/roles'),
      ]);
      const [team, dept, desig, roleData] = await Promise.all([teamRes.json(), deptRes.json(), desigRes.json(), roleRes.json()]);
      if (team.success) setEmployees(team.data);
      if (dept.success) setDepartments(dept.data);
      if (desig.success) setDesignations(desig.data);
      if (roleData.success) setRoles(roleData.data.filter((role: any) => role.isActive !== false));
    } catch {
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const filteredDesignations = useMemo(() => {
    if (!form.departmentCode) return designations;
    return designations.filter((item) => !item.departmentCode || item.departmentCode === form.departmentCode);
  }, [designations, form.departmentCode]);

  const reportingOptions = useMemo(
    () => employees.filter((employee) => employee._id !== editTarget?._id && (employee.canReceiveReports || employee.isHod)),
    [employees, editTarget?._id]
  );

  const hodOptions = useMemo(
    () => employees.filter((employee) => employee._id !== editTarget?._id && employee.isHod),
    [employees, editTarget?._id]
  );

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (employee: any) => {
    setEditTarget(employee);
    setForm({
      ...emptyForm,
      ...employee,
      joiningDate: employee.joiningDate ? new Date(employee.joiningDate).toISOString().slice(0, 10) : '',
    });
    setModalOpen(true);
  };

  const chooseDepartment = (departmentCode: string) => {
    const department = departments.find((item) => item.code === departmentCode);
    setForm({
      ...form,
      departmentCode,
      department: department?.name || '',
      hod: department?.hod || '',
      hodName: department?.hodName || '',
      designationCode: '',
      designation: '',
      reportingTo: '',
      reportingToName: '',
    });
  };

  const chooseDesignation = (designationCode: string) => {
    const designation = designations.find((item) => item.code === designationCode);
    const defaultRole = roles.find((role) => role.name === designation?.defaultRole || role.slug === designation?.defaultRole);
    setForm({
      ...form,
      designationCode,
      designation: designation?.title || '',
      departmentCode: designation?.departmentCode || form.departmentCode,
      reportingTo: designation?.reportingTo || '',
      reportingToName: designation?.reportingToName || '',
      roleName: defaultRole?.name || designation?.defaultRole || form.roleName,
      roleSlug: defaultRole?.slug || form.roleSlug,
    });
  };

  const chooseRole = (value: string) => {
    const role = roles.find((item) => item.name === value || item.slug === value);
    setForm({
      ...form,
      roleName: role?.name || value,
      roleSlug: role?.slug || form.roleSlug,
    });
  };

  const chooseReportingTo = (value: string) => {
    const employee = employees.find((item) => item.employeeCode === value || item.name === value);
    setForm({
      ...form,
      reportingTo: employee?.employeeCode || value.toUpperCase(),
      reportingToName: employee?.name || form.reportingToName,
    });
  };

  const chooseHod = (value: string) => {
    const employee = employees.find((item) => item.employeeCode === value || item.name === value);
    setForm({
      ...form,
      hod: employee?.employeeCode || value.toUpperCase(),
      hodName: employee?.name || form.hodName,
    });
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch(editTarget ? `/api/team/${editTarget._id}` : '/api/team', {
        method: editTarget ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          salary: Number(form.salary || 0),
          performanceScore: Number(form.performanceScore || 0),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editTarget ? 'Team member updated' : 'Team member created');
        setModalOpen(false);
        fetchAll();
      } else {
        toast.error(data.error || 'Save failed');
      }
    } catch {
      toast.error('Network error while saving team member');
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (employee: any) => {
    const res = await fetch(`/api/team/${employee._id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      toast.success('Team member deactivated');
      fetchAll();
    } else {
      toast.error(data.error || 'Action failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Team Management
          </h1>
          <p className="text-sm text-zinc-500">Add departments and designations once, then reuse them here with auto reporting details.</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-amber-500 dark:text-black">
          <Plus className="h-4 w-4" />
          Add Member
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-800/50">
            <tr>
              <th className="px-5 py-3">Employee</th>
              <th className="px-5 py-3">Department</th>
              <th className="px-5 py-3">Designation</th>
              <th className="px-5 py-3">Reports To / HOD</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-zinc-500">Loading team...</td></tr>
            ) : employees.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-zinc-500">No team members found.</td></tr>
            ) : employees.map((employee) => (
              <tr key={employee._id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02]">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {employee.avatar ? (
                      <img src={employee.avatar} alt={employee.name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-white/10">
                        <UserRound className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-zinc-950 dark:text-white">{employee.name}</p>
                      <p className="font-mono text-xs text-zinc-500">{employee.employeeCode || '-'}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {employee.isHod && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">HOD</span>}
                        {employee.canReceiveReports && <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-600">Manager</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">{employee.department || '-'}</td>
                <td className="px-5 py-4">{employee.designation || '-'}</td>
                <td className="px-5 py-4">
                  <p>{employee.reportingToName || (employee.canReceiveReports ? 'Self' : '-')}</p>
                  <p className="text-xs text-zinc-500">HOD: {employee.hodName || (employee.isHod ? 'Self' : '-')}</p>
                </td>
                <td className="px-5 py-4">{employee.roleName || '-'}</td>
                <td className="px-5 py-4 text-right">
                  <button onClick={() => openEdit(employee)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/10">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => deactivate(employee)} className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white p-5 shadow-2xl dark:bg-zinc-950">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-zinc-950 dark:text-white">{editTarget ? 'Edit Team Member' : 'Add Team Member'}</h2>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10"><X className="h-4 w-4" /></button>
            </div>

            <form onSubmit={save} className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="md:col-span-3">
                <ImageUpload label="Employee Photo" value={form.avatar} folder="team" onChange={(avatar) => setForm({ ...form, avatar })} />
              </div>
              <Field label="Name"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} /></Field>
              <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
                <span className="block text-xs font-semibold uppercase tracking-wide text-zinc-500">Employee Code</span>
                <span>{editTarget ? (form.employeeCode || 'Already generated') : 'Auto generated from Settings'}</span>
              </div>
              <Field label="Role">
                <>
                  <input
                    list="team-roles"
                    value={form.roleName}
                    onChange={(e) => chooseRole(e.target.value)}
                    className={inputClass}
                    placeholder="Search role..."
                  />
                  <datalist id="team-roles">
                    {roles.map((role) => <option key={role._id} value={role.name}>{role.slug}</option>)}
                  </datalist>
                </>
              </Field>
              <Field label="Email"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} /></Field>
              <Field label="Phone"><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} /></Field>
              <Field label="Employment Type">
                <select value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })} className={inputClass}>
                  {['full_time', 'part_time', 'contract', 'intern'].map((item) => <option key={item} value={item}>{item.replaceAll('_', ' ')}</option>)}
                </select>
              </Field>
              <Field label="Department">
                <>
                  <input
                    list="team-departments"
                    value={form.departmentCode}
                    onChange={(e) => chooseDepartment(e.target.value)}
                    className={inputClass}
                    placeholder="Search department..."
                  />
                  <datalist id="team-departments">
                    {departments.map((item) => <option key={item._id} value={item.code}>{item.name}</option>)}
                  </datalist>
                </>
              </Field>
              <Field label="Designation">
                <>
                  <input
                    list="team-designations"
                    value={form.designationCode}
                    onChange={(e) => chooseDesignation(e.target.value)}
                    className={inputClass}
                    placeholder="Search designation..."
                  />
                  <datalist id="team-designations">
                    {filteredDesignations.map((item) => <option key={item._id} value={item.code}>{item.title}</option>)}
                  </datalist>
                </>
              </Field>
              <Field label="Salary"><input type="number" min="0" value={form.salary} onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })} className={inputClass} /></Field>
              <div className="md:col-span-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-white/5">
                <p className="text-sm font-semibold text-zinc-950 dark:text-white">Reporting Assignment</p>
                <p className="mt-1 text-xs text-zinc-500">Department/designation master sirf create karo. HOD aur reporting yahan employee ke hisaab se assign karo.</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <Field label="Reports To">
                    <>
                      <input
                        list="team-reporting-options"
                        value={form.reportingTo}
                        onChange={(e) => chooseReportingTo(e.target.value)}
                        className={inputClass}
                        placeholder="Search employee code/name..."
                      />
                      <datalist id="team-reporting-options">
                        {reportingOptions.map((employee) => <option key={employee._id} value={employee.employeeCode || employee.name}>{employee.name}</option>)}
                      </datalist>
                    </>
                  </Field>
                  <Field label="Reports To Name"><input value={form.reportingToName} onChange={(e) => setForm({ ...form, reportingToName: e.target.value })} className={inputClass} placeholder="Auto from employee" /></Field>
                  <Field label="Department HOD">
                    <>
                      <input
                        list="team-hod-options"
                        value={form.hod}
                        onChange={(e) => chooseHod(e.target.value)}
                        className={inputClass}
                        placeholder="Search HOD code/name..."
                      />
                      <datalist id="team-hod-options">
                        {hodOptions.map((employee) => <option key={employee._id} value={employee.employeeCode || employee.name}>{employee.name}</option>)}
                      </datalist>
                    </>
                  </Field>
                  <Field label="HOD Name"><input value={form.hodName} onChange={(e) => setForm({ ...form, hodName: e.target.value })} className={inputClass} placeholder="Auto from employee" /></Field>
                </div>
              </div>
              <Field label="Joining Date"><input type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} className={inputClass} /></Field>
              <Field label="Work Location"><input value={form.workLocation} onChange={(e) => setForm({ ...form, workLocation: e.target.value })} className={inputClass} /></Field>
              <Field label="Emergency Contact"><input value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} className={inputClass} /></Field>
              <label className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-white/5">
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">This member is HOD</span>
                <input type="checkbox" checked={form.isHod} onChange={(e) => setForm({ ...form, isHod: e.target.checked, canReceiveReports: e.target.checked ? true : form.canReceiveReports })} className="h-4 w-4 accent-amber-500" />
              </label>
              <label className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-white/5">
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">Can receive reports</span>
                <input type="checkbox" checked={form.canReceiveReports} onChange={(e) => setForm({ ...form, canReceiveReports: e.target.checked })} className="h-4 w-4 accent-amber-500" />
              </label>
              <Field label="Performance Score"><input type="number" min="1" max="5" value={form.performanceScore} onChange={(e) => setForm({ ...form, performanceScore: Number(e.target.value) })} className={inputClass} /></Field>
              <label className="md:col-span-3">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Daily Log / Notes</span>
                <textarea value={form.dailyLog} onChange={(e) => setForm({ ...form, dailyLog: e.target.value })} rows={3} className={inputClass} />
              </label>
              <div className="flex justify-end gap-3 md:col-span-3">
                <button type="button" disabled={saving} onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:text-zinc-300 dark:hover:bg-white/10">Cancel</button>
                <button disabled={saving} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-amber-500 dark:text-black">
                  {saving ? 'Saving...' : 'Save Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputClass = 'w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm text-zinc-950 dark:border-white/10 dark:bg-white/5 dark:text-white';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</span>
      {children}
    </label>
  );
}
