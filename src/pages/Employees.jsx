// pages/Employees.jsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2, Filter, X } from 'lucide-react';
import { employeeService } from '../services/employeeService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { can } from '../utils/permissions';
import { DEPARTMENTS, EMPLOYMENT_STATUSES, ITEMS_PER_PAGE } from '../utils/constants';
import { formatDate } from '../utils/formatters';
import SearchBar    from '../components/common/SearchBar';
import Select       from '../components/common/Select';
import Button       from '../components/common/Button';
import Badge, { getStatusVariant } from '../components/common/Badge';
import Avatar       from '../components/common/Avatar';
import Pagination   from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState   from '../components/common/EmptyState';
import { Users }    from 'lucide-react';

export default function Employees() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();

  const canCreate = can(user, 'employees.create');
  const canEdit   = can(user, 'employees.edit');
  const canDelete = can(user, 'employees.delete');

  const [employees, setEmployees] = useState([]);
  const [search, setSearch]       = useState('');
  const [deptFilter, setDept]     = useState('');
  const [statusFilter, setStatus] = useState('');
  const [page, setPage]           = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]   = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setEmployees(employeeService.getEmployees());
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return employees.filter((emp) => {
      const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
      const matchSearch = !q ||
        fullName.includes(q) ||
        emp.id.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        emp.designation.toLowerCase().includes(q);
      const matchDept   = !deptFilter   || emp.department === deptFilter;
      const matchStatus = !statusFilter || emp.employmentStatus === statusFilter;
      return matchSearch && matchDept && matchStatus;
    });
  }, [employees, search, deptFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, deptFilter, statusFilter]);

  const clearFilters = () => { setSearch(''); setDept(''); setStatus(''); };
  const hasFilters = search || deptFilter || statusFilter;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await new Promise((r) => setTimeout(r, 400));
    employeeService.deleteEmployee(deleteTarget.id);
    setEmployees(employeeService.getEmployees());
    addToast({ message: `${deleteTarget.firstName} ${deleteTarget.lastName} has been removed.`, type: 'success' });
    setDeleteTarget(null);
    setDeleting(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">All Employees</h2>
          <p className="text-sm text-slate-500">{employees.length} total employees</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-slate-100' : ''}
          >
            <Filter size={15} /> Filters {hasFilters && `(${[search,deptFilter,statusFilter].filter(Boolean).length})`}
          </Button>
          {canCreate && (
            <Button size="sm" onClick={() => navigate('/employees/add')}>
              <Plus size={15} /> Add Employee
            </Button>
          )}
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="card p-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by name, ID, email..."
            />
          </div>
          <div className="w-full sm:w-44">
            <Select
              value={deptFilter}
              onChange={(e) => setDept(e.target.value)}
              options={DEPARTMENTS}
              placeholder="All Departments"
            />
          </div>
          <div className="w-full sm:w-40">
            <Select
              value={statusFilter}
              onChange={(e) => setStatus(e.target.value)}
              options={EMPLOYMENT_STATUSES}
              placeholder="All Statuses"
            />
          </div>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="whitespace-nowrap">
              <X size={14} /> Clear
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {paginated.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No employees found"
            description={hasFilters ? 'Try adjusting your search or filters.' : 'Add your first employee to get started.'}
            action={
              hasFilters ? (
                <Button variant="secondary" size="sm" onClick={clearFilters}>Clear Filters</Button>
              ) : canCreate ? (
                <Button size="sm" onClick={() => navigate('/employees/add')}>
                  <Plus size={15} /> Add Employee
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead className="table-head">
                  <tr>
                    <th className="table-th pl-5">Employee</th>
                    <th className="table-th">Department</th>
                    <th className="table-th">Designation</th>
                    <th className="table-th hidden md:table-cell">Joining Date</th>
                    <th className="table-th">Status</th>
                    <th className="table-th text-right pr-5">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((emp) => (
                    <tr key={emp.id} className="table-row">
                      <td className="table-td pl-5">
                        <div className="flex items-center gap-3">
                          <Avatar name={`${emp.firstName} ${emp.lastName}`} size="sm" />
                          <div>
                            <p className="font-medium text-slate-800">
                              {emp.firstName} {emp.lastName}
                            </p>
                            <p className="text-xs text-slate-400">{emp.id} · {emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-td">{emp.department}</td>
                      <td className="table-td text-slate-500">{emp.designation}</td>
                      <td className="table-td hidden md:table-cell text-slate-500">
                        {formatDate(emp.joiningDate)}
                      </td>
                      <td className="table-td">
                        <Badge variant={getStatusVariant(emp.employmentStatus)} dot>
                          {emp.employmentStatus}
                        </Badge>
                      </td>
                      <td className="table-td pr-5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/employees/${emp.id}`)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                            title="View profile"
                            aria-label={`View ${emp.firstName}`}
                          >
                            <Eye size={15} />
                          </button>
                          {canEdit && (
                            <button
                              onClick={() => navigate(`/employees/${emp.id}/edit`)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                              title="Edit employee"
                              aria-label={`Edit ${emp.firstName}`}
                            >
                              <Pencil size={15} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => setDeleteTarget(emp)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete employee"
                              aria-label={`Delete ${emp.firstName}`}
                            >
                              <Trash2 size={15} />
                            </button>
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
              pageSize={ITEMS_PER_PAGE}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Employee"
        message={`Are you sure you want to remove ${deleteTarget?.firstName} ${deleteTarget?.lastName}? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
