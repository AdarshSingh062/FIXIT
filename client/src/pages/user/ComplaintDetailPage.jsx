import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { useToast } from '../../hooks/useToast';
import { complaintService } from '../../services/complaintService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import StatusTimeline from '../../components/complaints/StatusTimeline';
import MapViewer from '../../components/complaints/MapViewer';
import RatingModal from '../../components/complaints/RatingModal';
import ConfirmModal from '../../components/common/ConfirmModal';
import { formatDate, formatTimeAgo } from '../../utils/formatters';
import {
  MapPin,
  Calendar,
  Clock,
  HardHat,
  User,
  Star,
  Send,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Trash2,
  ArrowLeft,
  Image as ImageIcon,
  MessageSquare
} from 'lucide-react';

export const ComplaintDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket, joinComplaint, leaveComplaint } = useSocket();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Modals
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');

  const fetchComplaintDetails = useCallback(async () => {
    try {
      setLoading(true);
      const [compRes, commRes] = await Promise.all([
        complaintService.getComplaintById(id),
        complaintService.getComments(id)
      ]);

      if (compRes.success) setComplaint(compRes.data);
      if (commRes.success) setComments(commRes.data || []);
    } catch (err) {
      toast.error('Failed to load complaint details');
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchComplaintDetails();
  }, [fetchComplaintDetails]);

  // Join WebSocket room for live comments and status updates
  useEffect(() => {
    joinComplaint(id);

    if (socket) {
      const handleCommentAdded = (comment) => {
        setComments((prev) => [...prev, comment]);
      };

      const handleStatusUpdated = (updateData) => {
        setComplaint((prev) => ({
          ...prev,
          status: updateData.status,
          resolutionNotes: updateData.notes || prev.resolutionNotes,
          resolutionImages: updateData.resolutionImages || prev.resolutionImages
        }));
        toast.info(`Issue status updated to: ${updateData.status}`);
      };

      socket.on('comment:added', handleCommentAdded);
      socket.on('status_updated', handleStatusUpdated);

      return () => {
        leaveComplaint(id);
        socket.off('comment:added', handleCommentAdded);
        socket.off('status_updated', handleStatusUpdated);
      };
    }
  }, [id, socket, joinComplaint, leaveComplaint, toast]);

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
      toast.error('Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComplaint = async () => {
    try {
      const res = await complaintService.deleteComplaint(id);
      if (res.success) {
        toast.success('Complaint deleted successfully');
        navigate('/my-complaints');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete complaint');
    }
  };

  const handleReopenComplaint = async () => {
    if (!reopenReason.trim()) {
      toast.warning('Please state why the problem was not satisfactorily resolved');
      return;
    }
    try {
      const res = await complaintService.reopenComplaint(id, reopenReason);
      if (res.success) {
        toast.success('Complaint reopened and escalated to dispatch');
        setComplaint(res.data);
        setIsReopenModalOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reopen complaint');
    }
  };

  if (loading) {
    return <Loader message="Loading ticket details..." />;
  }

  if (!complaint) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
        <h3>Complaint not found</h3>
        <Link to="/my-complaints" style={{ color: 'var(--primary-600)', marginTop: '1rem', display: 'inline-block' }}>
          Back to My Complaints
        </Link>
      </div>
    );
  }

  const isCreator = user && complaint.createdBy && user.id === complaint.createdBy._id;
  const isWorker = user && complaint.assignedWorker && user.id === complaint.assignedWorker._id;
  const isAdmin = user && user.role === 'admin';

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '4rem' }}>
      {/* Top Breadcrumb & Actions */}
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
          <ArrowLeft size={16} /> Back
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {isCreator && complaint.status === 'Resolved' && (
            <>
              <Button variant="success" size="sm" icon={CheckCircle2} onClick={() => setIsRatingModalOpen(true)}>
                Verify Resolution & Rate
              </Button>
              <Button variant="danger" size="sm" icon={RotateCcw} onClick={() => setIsReopenModalOpen(true)}>
                Dispute & Reopen
              </Button>
            </>
          )}

          {isCreator && complaint.status === 'Pending' && (
            <Button variant="danger" size="sm" icon={Trash2} onClick={() => setIsDeleteModalOpen(true)}>
              Delete Ticket
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Column Details & Timeline, Right Column Worker & Location */}
      <div className="grid-3" style={{ alignItems: 'start' }}>
        {/* Left 2 Columns */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header Card */}
          <Card>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <PriorityBadge priority={complaint.priority} />
              <StatusBadge status={complaint.status} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-600)', backgroundColor: 'var(--primary-50)', padding: '2px 8px', borderRadius: '9999px' }}>
                {complaint.category?.name}
              </span>
            </div>

            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.65rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '0.75rem', lineHeight: 1.3 }}>
              {complaint.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={15} />
                <span>Reported {formatDate(complaint.createdAt, 'MMM dd, yyyy · HH:mm')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={15} />
                <span>SLA Deadline: {complaint.slaDeadline ? formatDate(complaint.slaDeadline, 'MMM dd, HH:mm') : 'Standard'}</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '1rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--gray-800)', marginBottom: '0.5rem' }}>
                Problem Description
              </h4>
              <p style={{ color: 'var(--gray-700)', fontSize: '0.925rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {complaint.description}
              </p>
            </div>

            {/* Smart Priority Reason explanation */}
            {complaint.priorityReason && (
              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '10px 14px',
                  backgroundColor: 'var(--gray-50)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--gray-200)',
                  fontSize: '0.8rem',
                  color: 'var(--gray-600)'
                }}
              >
                <strong>Priority Assessment Note:</strong> {complaint.priorityReason}
              </div>
            )}
          </Card>

          {/* Initial Citizen Photos Gallery */}
          {complaint.images && complaint.images.length > 0 && (
            <Card title="Reported Photos">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                {complaint.images.map((imgUrl, idx) => (
                  <a key={idx} href={imgUrl} target="_blank" rel="noreferrer" style={{ display: 'block', borderRadius: '8px', overflow: 'hidden', height: '140px' }}>
                    <img
                      src={imgUrl}
                      alt={`Photo ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.2s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                  </a>
                ))}
              </div>
            </Card>
          )}

          {/* Resolution Evidence Card (If Resolved or Closed) */}
          {(complaint.resolutionImages?.length > 0 || complaint.resolutionNotes) && (
            <Card
              title="Resolution Evidence & Repair Report"
              subtitle="Submitted by assigned field specialist"
              style={{ borderLeft: '4px solid var(--success-500)' }}
            >
              {complaint.resolutionNotes && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gray-700)', marginBottom: '4px' }}>
                    Technical Action Notes:
                  </h5>
                  <p style={{ color: 'var(--gray-800)', fontSize: '0.9rem', lineHeight: 1.5, backgroundColor: 'var(--success-50)', padding: '12px', borderRadius: '6px' }}>
                    {complaint.resolutionNotes}
                  </p>
                </div>
              )}

              {complaint.resolutionImages?.length > 0 && (
                <div>
                  <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gray-700)', marginBottom: '8px' }}>
                    After Repair Proof Photos:
                  </h5>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                    {complaint.resolutionImages.map((imgUrl, idx) => (
                      <a key={idx} href={imgUrl} target="_blank" rel="noreferrer" style={{ display: 'block', borderRadius: '8px', overflow: 'hidden', height: '140px' }}>
                        <img
                          src={imgUrl}
                          alt={`Resolution ${idx + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Lifecycle Status Timeline */}
          <Card title="Resolution Progress Timeline">
            <StatusTimeline
              timeline={complaint.timeline || []}
              currentStatus={complaint.status}
            />
          </Card>

          {/* Real-Time Comments & Discussion */}
          <Card
            title={`Discussion & Progress Notes (${comments.length})`}
            subtitle="Real-time communication with field workers & dispatch"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '4px' }}>
              {comments.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '2rem' }}>
                  No messages yet. Ask a question or post a note below.
                </div>
              ) : (
                comments.map((comm) => {
                  const isAuthorMe = user && comm.user?._id === user.id;
                  return (
                    <div
                      key={comm._id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: comm.isInternal ? '#fffbeb' : isAuthorMe ? 'var(--primary-50)' : 'var(--gray-50)',
                        border: comm.isInternal ? '1px dashed #f59e0b' : '1px solid var(--gray-200)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <img
                            src={comm.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                            alt={comm.user?.name}
                            style={{ width: '22px', height: '22px', borderRadius: '50%' }}
                          />
                          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--gray-900)' }}>
                            {comm.user?.name || 'User'}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                            ({comm.user?.role || 'citizen'})
                          </span>
                          {comm.isInternal && (
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#b45309', backgroundColor: '#fef3c7', padding: '1px 6px', borderRadius: '4px' }}>
                              Internal Note
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                          {formatTimeAgo(comm.createdAt)}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--gray-800)', lineHeight: 1.5, margin: 0 }}>
                        {comm.message}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Comment Input Form */}
            <form onSubmit={handleAddComment} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type a message or question..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={submittingComment}
                />
                <Button type="submit" variant="primary" icon={Send} loading={submittingComment} disabled={!newComment.trim()}>
                  Send
                </Button>
              </div>

              {(isAdmin || isWorker) && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--gray-600)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isInternalNote}
                    onChange={(e) => setIsInternalNote(e.target.checked)}
                  />
                  <span>Post as Internal Worker/Admin Note (hidden from citizen)</span>
                </label>
              )}
            </form>
          </Card>
        </div>

        {/* Right 1 Column: Location & Assigned Worker */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Map Viewer Card */}
          <Card title="Reported Location">
            <MapViewer
              latitude={complaint.latitude}
              longitude={complaint.longitude}
              address={complaint.location?.address}
              title={complaint.title}
              height="220px"
            />
            <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--gray-600)' }}>
              <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{complaint.location?.address}</div>
              {complaint.location?.landmark && (
                <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: '2px' }}>
                  Landmark: {complaint.location.landmark}
                </div>
              )}
            </div>
          </Card>

          {/* Assigned Worker Profile Card */}
          <Card title="Assigned Field Specialist">
            {complaint.assignedWorker ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                  <img
                    src={complaint.assignedWorker.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'}
                    alt={complaint.assignedWorker.name}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--gray-900)' }}>
                      {complaint.assignedWorker.name}
                    </h4>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                      {complaint.assignedWorker.workerDetails?.department || 'Field Services'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'var(--gray-50)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-200)', fontSize: '0.8rem' }}>
                  <div>
                    <div style={{ color: 'var(--gray-400)' }}>Specialization</div>
                    <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>
                      {complaint.assignedWorker.workerDetails?.specialization || 'Civil Works'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--gray-400)' }}>Rating</div>
                    <div style={{ fontWeight: 700, color: 'var(--warning-600)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <Star size={12} fill="#f59e0b" /> {complaint.assignedWorker.workerDetails?.avgRating || 5.0}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--gray-400)' }}>
                <HardHat size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.6 }} />
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Unassigned</div>
                <div style={{ fontSize: '0.75rem' }}>Awaiting municipal dispatcher allocation</div>
              </div>
            )}
          </Card>

          {/* Citizen Rating Card (if rated) */}
          {complaint.rating && (
            <Card title="Citizen Feedback Rating" style={{ borderLeft: '4px solid #f59e0b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={20}
                    fill={star <= complaint.rating.rating ? '#f59e0b' : 'transparent'}
                    color={star <= complaint.rating.rating ? '#f59e0b' : '#cbd5e1'}
                  />
                ))}
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--gray-800)', marginLeft: '4px' }}>
                  {complaint.rating.rating}.0 / 5.0
                </span>
              </div>
              {complaint.rating.review && (
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', fontStyle: 'italic', margin: '4px 0 0' }}>
                  "{complaint.rating.review}"
                </p>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Modals */}
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        complaintId={complaint._id}
        workerName={complaint.assignedWorker?.name}
        onRatingSuccess={() => fetchComplaintDetails()}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteComplaint}
        title="Delete Complaint"
        message="Are you sure you want to permanently delete this complaint ticket? This action cannot be undone."
        confirmLabel="Delete Ticket"
        variant="danger"
      />

      {/* Reopen Modal */}
      {isReopenModalOpen && (
        <div className="modal-overlay" onClick={() => setIsReopenModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--gray-200)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Dispute Resolution & Reopen Issue</h3>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Why is this problem not resolved?</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="Explain what is still broken or unsafe on site..."
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <Button variant="secondary" onClick={() => setIsReopenModalOpen(false)}>Cancel</Button>
                <Button variant="danger" onClick={handleReopenComplaint}>Reopen Ticket</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintDetailPage;
