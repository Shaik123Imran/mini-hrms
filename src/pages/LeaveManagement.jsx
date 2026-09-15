// pages/LeaveManagement.jsx
import { useState, useMemo, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, X, FileText, Plus } from 'lucide-react';
import { leaveService } from '../services/leaveService';
import { employeeService } from '../services/employeeService';
import { useToast }     from '../context/ToastContext';
import { useAuth }      from '../context/AuthContext';
import { can }          from '../utils/permissions';
import { LEAVE_TYPES, LEAVE_STATUSES } from '../utils/constants';
import { formatDate, getDaysBetween } from '../utils/formatters';
import SearchBar        from '../components/common/SearchBar';
import Select           from '../components/common/Select';
import Input            from '../components/common/Input';
import Badge, { getStatusVariant } from '../components/common/Badge';
import Avatar           from '../components/common/Avatar';
import Modal            from '../components/common/Modal';
import ConfirmDialog    from '../components/common/ConfirmDialog';
import EmptyState       from '../components/common/EmptyState';
import Button           from '../components/common/Button';
import Pagination       from '../components/common/Pagination';

const ITEMS = 10;

export default function LeaveManagement() {
  const { addToast } = useToast();
  const { user } = useAuth();

  const canApprove = can(user, 'leaves.approve');
  const canViewAll = can(user, 'leaves.view');
  const isEmployee = user?.role === 'Employee';

  const [leaves, setLeaves]     = useState(() => leaveService.getLeaves());
  const [search, setSearch]     = useState('');
  const [typeFilter, setType]   = useState('');
  const [statusFilter, setStatus] = useState('');
  const [page, setPage]         = useState(1);
  const [viewLeave, setViewLeave]   = useState(null);
  const [actionTarget, setActionTarget] = useState(null); // { leave, action: 'Approved'|'Rejected' }
  const [processing, setProcessing]     = useState(false);

  // Apply leave modal state
  const employees         = employeeService.getEmployees();
  const employeeOptions   = employees.map((e) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }));
  const [applyOpen, setApplyOpen]   = useState(false);
  const [applyForm, setApplyForm]   = useState(() => ({
    employeeId: isEmployee ? user?.employeeId || '' : '',
    leaveType: '',
    fromDate: '',
    toDate: '',
    reason: '',
  }));
  const [applyErrors, setApplyErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const visibleLeaves = useMemo(
    () => (canViewAll ? leaves : leaves.filter((l) => l.employeeId === user?.employeeId)),
    [leaves, canViewAll, user]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return visibleLeaves.filter((l) => {
      const matchSearch = !q ||
        l.employeeName.toLowerCase().includes(q) ||
        l.employeeId.toLowerCase().includes(q);
      const matchType   = !typeFilter   || l.leaveType === typeFilter;
      const matchStatus = !statusFilter || l.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [visibleLeaves, search, typeFilter, statusFilter]);

  useEffect(() => { setPage(1); }, [search, typeFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS);
  const paginated  = filtered.slice((page - 1) * ITEMS, page * ITEMS);

  const pending  = visibleLeaves.filter((l) => l.status === 'Pending').length;
  const approved = visibleLeaves.filter((l) => l.status === 'Approved').length;
  const rejected = visibleLeaves.filter((l) => l.status === 'Rejected').length;

  const clearFilters = () => { setSearch(''); setType(''); setStatus(''); };
  const hasFilters = search || typeFilter || statusFilter;

  const confirmAction = async () => {
    if (!actionTarget) return;
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 400));
    leaveService.updateStatus(actionTarget.leave.id, actionTarget.action);
    setLeaves(leaveService.getLeaves());
    addToast({
      message: `Leave request for ${actionTarget.leave.employeeName} has been ${actionTarget.action.toLowerCase()}.`,
      type: actionTarget.action === 'Approved' ? 'success' : 'warning',
    });
    setActionTarget(null);
    setProcessing(false);
    setViewLeave(null);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!applyForm.employeeId) errs.employeeId = 'Select an employee.';
    if (!applyForm.leaveType) errs.leaveType = 'Select a leave type.';
    if (!applyForm.fromDate) errs.fromDate = 'From date is required.';
    if (!applyForm.toDate) errs.toDate = 'To date is required.';
    if (applyForm.fromDate && applyForm.toDate && applyForm.toDate < applyForm.fromDate) {
      errs.toDate = 'To date must be on or after the from date.';
    }
    if (!applyForm.reason.trim()) errs.reason = 'Reason is required.';
    else if (applyForm.reason.trim().length < 10) errs.reason = 'Reason must be at least 10 characters.';
    setApplyErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));

    const emp = employees.find((x) => x.id === applyForm.employeeId);
    const days = getDaysBetween(applyForm.fromDate, applyForm.toDate);
    leaveService.addLeave({
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      department: emp.department,
      leaveType: applyForm.leaveType,
      fromDate: applyForm.fromDate,
      toDate: applyForm.toDate,
      days,
      reason: applyForm.reason.trim(),
    });

    setLeaves(leaveService.getLeaves());
    setApplyOpen(false);
    setApplyForm({ employeeId: '', leaveType: '', fromDate: '', toDate: '', reason: '' });
    setApplyErrors({});
    setSubmitting(false);
    addToast({ message: `Leave request submitted for ${emp.firstName} ${emp.lastName}.`, type: 'success' });
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Pending',  value: pending,  color: 'border-amber-400 bg-amber-50' },
          { label: 'Approved', value: approved, color: 'border-emerald-400 bg-emerald-50' },
          { label: 'Rejected', value: rejected, color: 'border-red-400 bg-red-50' },
        ].map((s) => (
          <div key={s.label} className={`card border-l-4 ${s.color} p-4`}>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Search employee..." />
        </div>
        <div className="w-full sm:w-44">
          <Select
            value={typeFilter}
            onChange={(e) => setType(e.target.value)}
            options={LEAVE_TYPES}
            placeholder="All Leave Types"
          />
        </div>
        <div className="w-full sm:w-36">
          <Select
            value={statusFilter}
            onChange={(e) => setStatus(e.target.value)}
            options={LEAVE_STATUSES}
            placeholder="All Statuses"
          />
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X size={14} /> Clear
          </Button>
        )}
        <Button variant="primary" size="md" onClick={() => setApplyOpen(true)}>
          <Plus size={16} /> Apply Leave
        </Button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {paginated.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No leave requests found"
            description="Adjust your filters to see leave requests."
            action={hasFilters && (
              <Button variant="secondary" size="sm" onClick={clearFilters}>Clear Filters</Button>
            )}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead className="table-head">
                  <tr>
                    <th className="table-th pl-5">Employee</th>
                    <th className="table-th">Leave Type</th>
                    <th className="table-th hidden sm:table-cell">From</th>
                    <th className="table-th hidden sm:table-cell">To</th>
                    <th className="table-th hidden md:table-cell">Days</th>
                    <th className="table-th">Status</th>
                    <th className="table-th text-right pr-5">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((leave) => (
                    <tr key={leave.id} className="table-row">
                      <td className="table-td pl-5">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={leave.employeeName} size="sm" />
                          <div>
                            <p className="font-medium text-slate-800 text-sm">{leave.employeeName}</p>
                            <p className="text-xs text-slate-400">{leave.department}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-td text-slate-600">{leave.leaveType}</td>
                      <td className="table-td hidden sm:table-cell text-slate-500">{formatDate(leave.fromDate)}</td>
                      <td className="table-td hidden sm:table-cell text-slate-500">{formatDate(leave.toDate)}</td>
                      <td className="table-td hidden md:table-cell text-slate-500">
                        {leave.days} day{leave.days > 1 ? 's' : ''}
                      </td>
                      <td className="table-td">
                        <Badge variant={getStatusVariant(leave.status)} dot>
                          {leave.status}
                        </Badge>
                      </td>
                      <td className="table-td pr-5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewLeave(leave)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                            title="View details"
                          >
                            <Eye size={15} />
                          </button>
                          {leave.status === 'Pending' && canApprove && (
                            <>
                              <button
                                onClick={() => setActionTarget({ leave, action: 'Approved' })}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                title="Approve"
                              >
                                <CheckCircle size={15} />
                              </button>
                              <button
                                onClick={() => setActionTarget({ leave, action: 'Rejected' })}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Reject"
                              >
                                <XCircle size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={ITEMS}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {/* View Details Modal */}
      {viewLeave && (
        <Modal open={!!viewLeave} onClose={() => setViewLeave(null)} title="Leave Request Details" size="md">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={viewLeave.employeeName} size="md" />
              <div>
                <p className="font-semibold text-slate-900">{viewLeave.employeeName}</p>
                <p className="text-sm text-slate-500">{viewLeave.department}</p>
              </div>
              <div className="ml-auto">
                <Badge variant={getStatusVariant(viewLeave.status)} dot>{viewLeave.status}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Leave Type',  viewLeave.leaveType],
                ['Applied On',  formatDate(viewLeave.appliedOn)],
                ['From Date',   formatDate(viewLeave.fromDate)],
                ['To Date',     formatDate(viewLeave.toDate)],
                ['Duration',    `${viewLeave.days} day${viewLeave.days > 1 ? 's' : ''}`],
              ].map(([k, v]) => (
                <div key={k} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-400">{k}</p>
                  <p className="font-medium text-slate-800 mt-0.5">{v}</p>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-1">Reason</p>
              <p className="text-sm text-slate-700">{viewLeave.reason}</p>
            </div>

            {viewLeave.status === 'Pending' && canApprove && (
              <div className="flex gap-3 pt-2">
                <Button
                  variant="success"
                  size="sm"
                  fullWidth
                  onClick={() => setActionTarget({ leave: viewLeave, action: 'Approved' })}
                >
                  <CheckCircle size={15} /> Approve
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  fullWidth
                  onClick={() => setActionTarget({ leave: viewLeave, action: 'Rejected' })}
                >
                  <XCircle size={15} /> Reject
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Apply leave modal */}
      <Modal
        open={applyOpen}
        onClose={() => { if (!submitting) setApplyOpen(false); }}
        title="Apply for Leave"
        size="md"
      >
        <form onSubmit={handleApply} className="p-6 space-y-4" noValidate>
          <Select
            label="Employee"
            value={applyForm.employeeId}
            onChange={(e) => setApplyForm({ ...applyForm, employeeId: e.target.value })}
            options={employeeOptions}
            placeholder="Select employee"
            error={applyErrors.employeeId}
            required
            disabled={isEmployee}
            hint={isEmployee ? 'Leave is applied for your own account.' : undefined}
          />
          <Select
            label="Leave Type"
            value={applyForm.leaveType}
            onChange={(e) => setApplyForm({ ...applyForm, leaveType: e.target.value })}
            options={LEAVE_TYPES}
            placeholder="Select leave type"
            error={applyErrors.leaveType}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="From Date"
              type="date"
              value={applyForm.fromDate}
              onChange={(e) => setApplyForm({ ...applyForm, fromDate: e.target.value })}
              error={applyErrors.fromDate}
              required
            />
            <Input
              label="To Date"
              type="date"
              min={applyForm.fromDate || undefined}
              value={applyForm.toDate}
              onChange={(e) => setApplyForm({ ...applyForm, toDate: e.target.value })}
              error={applyErrors.toDate}
              required
            />
          </div>
          {applyForm.fromDate && applyForm.toDate && (
            <p className="text-xs text-slate-500 -mt-2">
              Duration: {getDaysBetween(applyForm.fromDate, applyForm.toDate)} day{getDaysBetween(applyForm.fromDate, applyForm.toDate) > 1 ? 's' : ''}
            </p>
          )}
          <div className="flex flex-col">
            <label className="input-label">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Brief reason for the leave"
              value={applyForm.reason}
              onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
              className={`input-field resize-none ${applyErrors.reason ? 'input-error' : ''}`}
            />
            {applyErrors.reason && <p className="input-error-msg">{applyErrors.reason}</p>}
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={() => setApplyOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm action dialog */}
      <ConfirmDialog
        open={!!actionTarget}
        onClose={() => setActionTarget(null)}
        onConfirm={confirmAction}
        loading={processing}
        title={`${actionTarget?.action} Leave Request`}
        message={`Are you sure you want to ${actionTarget?.action?.toLowerCase()} the leave request from ${actionTarget?.leave?.employeeName}?`}
        confirmLabel={actionTarget?.action}
        confirmVariant={actionTarget?.action === 'Approved' ? 'success' : 'danger'}
      />
    </div>
  );
}
