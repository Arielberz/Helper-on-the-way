import { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { apiFetch } from '../../utils/apiFetch';
import { API_BASE } from '../../utils/apiConfig';

function ReportsTable() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [updating, setUpdating] = useState(null);
  const [reviewingReport, setReviewingReport] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [blockUser, setBlockUser] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [page]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`${API_BASE}/api/admin/reports?page=${page}&limit=20`, {
        method: 'GET',
      });

      const response = await res.json();

      if (response.success) {
        setReports(response.data.reports);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || 'Failed to load reports');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reportId, newStatus, notes = '', shouldBlockUser = false) => {
    try {
      setUpdating(reportId);
      const res = await apiFetch(`${API_BASE}/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: newStatus,
          reviewNotes: notes,
          blockUser: shouldBlockUser
        }),
      });

      const response = await res.json();

      if (response.success) {
        // Update local state
        setReports(reports.map(report => 
          report._id === reportId ? { ...report, status: newStatus } : report
        ));
        setReviewingReport(null);
        setReviewNotes('');
        setBlockUser(false);
        alert('Report updated successfully' + (shouldBlockUser ? ' and user blocked' : ''));
      } else {
        alert('Failed to update report: ' + response.message);
      }
    } catch (err) {
      alert('Error updating report: ' + err.message);
    } finally {
      setUpdating(null);
    }
  };

  const handleSubmitReview = () => {
    if (blockUser && !reviewNotes.trim()) {
      alert('Please provide review notes when blocking a user');
      return;
    }
    handleUpdateStatus(reviewingReport._id, 'resolved', reviewNotes, blockUser);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_review':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-green-100 text-green-800';
      case 'reviewed':
        return 'bg-purple-100 text-purple-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredReports = reports.filter((report) =>
    report.reportedUser?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white text-xl">Loading reports...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Reports</h1>
          <p className="text-slate-400 mt-1">Manage user reports and complaints</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search by reported user or reason..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Reported By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Reported User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredReports.map((report) => (
                <tr key={report._id} className="hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {report.reportedBy?.avatar ? (
                          <img className="h-10 w-10 rounded-full" src={report.reportedBy.avatar} alt="" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                            {report.reportedBy?.username?.charAt(0).toUpperCase() || '?'}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">
                          {report.reportedBy?.username || 'Unknown'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {report.reportedUser?.avatar ? (
                          <img className="h-10 w-10 rounded-full" src={report.reportedUser.avatar} alt="" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center text-white font-semibold">
                            {report.reportedUser?.username?.charAt(0).toUpperCase() || '?'}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">
                          {report.reportedUser?.username || 'Unknown'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-300">
                      {report.reason?.replace(/_/g, ' ') || 'N/A'}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 max-w-xs truncate">
                      {report.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(report.status)}`}>
                      {report.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-300">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      {(report.status === 'pending' || report.status === 'in_review') && (
                        <>
                          <button
                            onClick={() => setReviewingReport(report)}
                            disabled={updating === report._id}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                          >
                            Review
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(report._id, 'dismissed')}
                            disabled={updating === report._id}
                            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                          >
                            Dismiss
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
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">
            Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} reports
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.pages}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewingReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-white">Review Report</h2>
                <button
                  onClick={() => {
                    setReviewingReport(null);
                    setReviewNotes('');
                    setBlockUser(false);
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Report Details</h3>
                  <div className="bg-slate-700 rounded-lg p-4 space-y-2">
                    <p className="text-slate-300">
                      <span className="font-semibold">Reported By:</span> {reviewingReport.reportedBy?.username || 'Unknown'}
                    </p>
                    <p className="text-slate-300">
                      <span className="font-semibold">Reported User:</span> {reviewingReport.reportedUser?.username || 'Unknown'}
                    </p>
                    <p className="text-slate-300">
                      <span className="font-semibold">Reason:</span> {reviewingReport.reason?.replace(/_/g, ' ') || 'N/A'}
                    </p>
                    <p className="text-slate-300">
                      <span className="font-semibold">Description:</span><br />
                      {reviewingReport.description}
                    </p>
                    <p className="text-slate-300">
                      <span className="font-semibold">Date:</span> {new Date(reviewingReport.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Review Notes
                  </label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add your review notes here..."
                    rows={4}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="blockUser"
                    checked={blockUser}
                    onChange={(e) => setBlockUser(e.target.checked)}
                    className="w-4 h-4 text-red-600 bg-slate-700 border-slate-600 rounded focus:ring-red-500"
                  />
                  <label htmlFor="blockUser" className="text-sm font-medium text-slate-300">
                    Block the reported user
                  </label>
                </div>

                {blockUser && (
                  <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                    <p className="text-red-400 text-sm">
                      ⚠️ Warning: Blocking this user will prevent them from accessing the platform. This action can be reversed later.
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSubmitReview}
                    disabled={updating === reviewingReport._id}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                  >
                    {blockUser ? 'Block User & Resolve' : 'Resolve Report'}
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(reviewingReport._id, 'dismissed', reviewNotes, false)}
                    disabled={updating === reviewingReport._id}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 font-medium"
                  >
                    Dismiss Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportsTable;
