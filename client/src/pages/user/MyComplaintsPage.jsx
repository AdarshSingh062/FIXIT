import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { categoryService } from '../../services/categoryService';
import ComplaintCard from '../../components/complaints/ComplaintCard';
import ComplaintFilter from '../../components/complaints/ComplaintFilter';
import Pagination from '../../components/common/Pagination';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { PlusCircle } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

export const MyComplaintsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || '';

  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 9 });
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebounce(search, 400);

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getCategories();
      if (res.success) setCategories(res.data || []);
    } catch (err) {
      // ignore
    }
  };

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 9,
        search: debouncedSearch,
        category,
        status,
        priority
      };
      const res = await complaintService.getMyComplaints(params);
      if (res.success) {
        setComplaints(res.data || []);
        setPagination(res.pagination || { total: 0, totalPages: 1, limit: 9 });
      }
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, category, status, priority]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleReset = () => {
    setSearch('');
    setCategory('');
    setStatus('');
    setPriority('');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Reported Issues</h1>
          <p className="page-subtitle">
            Track real-time resolution progress, worker updates, and citizen verifications.
          </p>
        </div>
        <Link to="/complaints/new">
          <Button variant="primary" icon={PlusCircle}>
            Report New Problem
          </Button>
        </Link>
      </div>

      {/* Filter Component */}
      <ComplaintFilter
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        status={status}
        setStatus={setStatus}
        priority={priority}
        setPriority={setPriority}
        categories={categories}
        onReset={handleReset}
      />

      {loading ? (
        <Loader message="Fetching your issues..." />
      ) : complaints.length === 0 ? (
        <EmptyState
          title="No reported issues match your criteria"
          description="Try adjusting your search query or reset the active filter options."
          actionLabel="Reset Filters"
          onAction={handleReset}
        />
      ) : (
        <>
          <div className="grid-3">
            {complaints.map((item) => (
              <ComplaintCard key={item._id} complaint={item} />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            pageSize={pagination.limit}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </>
      )}
    </div>
  );
};

export default MyComplaintsPage;
