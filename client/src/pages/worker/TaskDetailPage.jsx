import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workerService } from '../../services/workerService';
import { complaintService } from '../../services/complaintService';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { useToast } from '../../hooks/useToast';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import StatusTimeline from '../../components/complaints/StatusTimeline';
import MapViewer from '../../components/complaints/MapViewer';
import ResolutionModal from '../../components/complaints/ResolutionModal';
import { formatDate, formatTimeAgo } from '../../utils/formatters';
import {
  CheckCircle2,
  XCircle,
  Play,
  FileCheck2,
  Calendar,
  Clock,
  MapPin,
  User,
  Send,
  ArrowLeft,
  HardHat
} from 'lucide-react';

export const TaskDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket, joinComplaint, leaveComplaint } = useSocket();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Modals
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const fetchTaskDetails = useCallback(async () => {
    try {
      setLoading(true);
      const [taskRes, commRes] = await Promise.all([
        workerService.getTaskById(id),
        complaintService.getComments(id)
      ]);
      if (taskRes.success) setTask(taskRes.data);
      if (commRes.success) setComments(commRes.data || []);
    } catch (err) {
      toast.error('Failed to load task details');
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchTaskDetails();
  }, [fetchTaskDetails]);

  // Real-time socket events
  useEffect(() => {
    joinComplaint(id);

    if (socket) {
      const handleCommentAdded = (comment) => {
        setComments((prev) => [...prev, comment]);
      };

      socket.on('comment:added', handleCommentAdded);

      return () => {
        leaveComplaint(id);
        socket.off('comment:added', handleCommentAdded);
      };
    }
  }, [id, socket, joinComplaint, leaveComplaint]);

  const handleAcceptTask = async () => {
    try {
      setActionLoading(true);
      const res = await workerService.acceptTask(id);
      if (res.success) {
        toast.success('Task accepted! You are now scheduled for service dispatch.');
        setTask(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept task');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartWork = async () => {
    try {
      setActionLoading(true);
      const formData = new FormData();
      formData.append('status', 'In Progress');
      formData.append('notes', 'Specialist arrived on site and commenced repairs');

      const res = await workerService.updateTaskStatus(id, formData);
      if (res.success) {
        toast.success('Status updated to In Progress');
        setTask(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start work');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectTask = async () => {
    if (!rejectReason.trim()) {
      toast.warning('Please provide a reason for declining this assignment');
      return;
    }
    try {
      setActionLoading(true);
      const res = await workerService.rejectTask(id, rejectReason);
      if (res.success) {
        toast.success('Task declined and returned to review pool');
        navigate('/worker/tasks');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to decline task');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      const res = await complaintService.addComment(id, {
        message: newComment,
        isInternal: isInternalNote
      });
      if (res.success) {
        setNewComment('');
      }
    } catch (err) {
      toast.error('Failed to post message');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return <Loader message="Loading task details..." />;
  }

  if (!task) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
        <h3>Task not found or not assigned to you</h3>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '4rem' }}>
      {/* Top Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--gray-500)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.875rem'
          }}
        >
          <ArrowLeft size={16} /> Back to Task List
        </button>

        {/* Worker Action Bar */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {task.status === 'Assigned' && (
            <>
              <Button variant="success" icon={CheckCircle2} onClick={handleAcceptTask} loading={actionLoading}>
                Accept Task
              </Button>
              <Button variant="danger" icon={XCircle} onClick={() => setIsRejectModalOpen(true)} disabled={actionLoading}>
                Decline
              </Button>
            </>
          )}

          {task.status === 'Accepted' && (
            <Button variant="primary" icon={Play} onClick={handleStartWork} loading={actionLoading}>
              Start Site Work
            </Button>
          )}

          {task.status === 'In Progress' && (
            <Button variant="success" icon={FileCheck2} onClick={() => setIsResolutionModalOpen(true)}>
              Submit Resolution & Photos
            </Button>
          )}
        </div>
      </div>

      <div className="grid-3" style={{ alignItems: 'start' }}>
        {/* Left Column */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Main Info */}
          <Card>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <PriorityBadge priority={task.priority} />
              <StatusBadge status={task.status} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-600)', backgroundColor: 'var(--primary-50)', padding: '2px 8px', borderRadius: '9999px' }}>
                {task.category?.name}
              </span>
            </div>

            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '0.75rem' }}>
              {task.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={15} />
                <span>Assigned {formatDate(task.createdAt, 'MMM dd, yyyy · HH:mm')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={15} />
                <span>SLA: {task.slaDeadline ? formatDate(task.slaDeadline, 'MMM dd, HH:mm') : 'Standard'}</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '1rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--gray-800)', marginBottom: '0.5rem' }}>
                Reported Incident Description
              </h4>
              <p style={{ color: 'var(--gray-700)', fontSize: '0.925rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {task.description}
              </p>
            </div>
          </Card>

          {/* Citizen Photos */}
          {task.images && task.images.length > 0 && (
            <Card title="Citizen Initial Photos">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                {task.images.map((imgUrl, idx) => (
                  <a key={idx} href={imgUrl} target="_blank" rel="noreferrer" style={{ display: 'block', borderRadius: '8px', overflow: 'hidden', height: '140px' }}>
                    <img src={imgUrl} alt={`Evidence ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </a>
                ))}
              </div>
            </Card>
          )}

          {/* Status Timeline */}
          <Card title="Resolution Progress">
            <StatusTimeline timeline={task.timeline || []} currentStatus={task.status} />
          </Card>

          {/* Comments / Discussion Thread */}
          <Card title={`Dispatch Communication & Notes (${comments.length})`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '380px', overflowY: 'auto', marginBottom: '1.25rem' }}>
              {comments.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '2rem' }}>
                  No messages yet.
                </div>
              ) : (
                comments.map((comm) => (
                  <div
                    key={comm._id}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: comm.isInternal ? '#fffbeb' : '#f8fafc',
                      border: comm.isInternal ? '1px dashed #f59e0b' : '1px solid var(--gray-200)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                        {comm.user?.name} ({comm.user?.role})
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                        {formatTimeAgo(comm.createdAt)}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                      {comm.message}
                    </p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddComment} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Post an update or question..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={submittingComment}
                />
                <Button type="submit" variant="primary" icon={Send} loading={submittingComment}>
                  Send
                </Button>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--gray-600)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isInternalNote}
                  onChange={(e) => setIsInternalNote(e.target.checked)}
                />
                <span>Internal Dispatcher Note (Hidden from citizen)</span>
              </label>
            </form>
          </Card>
        </div>

        {/* Right Column: Location & Citizen Contact */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card title="Site Coordinates & Map">
            <MapViewer
              latitude={task.latitude}
              longitude={task.longitude}
              address={task.location?.address}
              title={task.title}
              height="220px"
            />
            <div style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
              <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{task.location?.address}</div>
              {task.location?.landmark && (
                <div style={{ color: 'var(--gray-500)', marginTop: '2px' }}>
                  Landmark: {task.location.landmark}
                </div>
              )}
            </div>
          </Card>

          {/* Citizen Reporter Card */}
          <Card title="Reporter Contact">
            {task.createdBy ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src={task.createdBy.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                  alt={task.createdBy.name}
                  style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--gray-900)' }}>
                    {task.createdBy.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                    {task.createdBy.phone || task.createdBy.email}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>Citizen information hidden</div>
            )}
          </Card>
        </div>
      </div>

      {/* Resolution Submission Modal */}
      <ResolutionModal
        isOpen={isResolutionModalOpen}
        onClose={() => setIsResolutionModalOpen(false)}
        complaintId={task._id}
        onResolvedSuccess={(updated) => setTask(updated)}
      />

      {/* Reject Task Dialog */}
      {isRejectModalOpen && (
        <div className="modal-overlay" onClick={() => setIsRejectModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--gray-200)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Decline Task Assignment</h3>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Reason for declining</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="e.g. Requires heavy hydro-jetting rig outside my current truck equipment..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <Button variant="secondary" onClick={() => setIsRejectModalOpen(false)}>Cancel</Button>
                <Button variant="danger" onClick={handleRejectTask} loading={actionLoading}>Confirm Decline</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetailPage;
