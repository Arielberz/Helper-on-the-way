/*
  קובץ זה אחראי על:
  - טבלת הודעות צור קשר בממשק המנהל
  - סינון לפי סטטוס, תאריך
  - סימון הודעות כנקראו/מטופלות

  הקובץ משמש את:
  - מנהלים לשירות לקוחות
  - ניתוב מ-AdminLayout

  הקובץ אינו:
  - שולח תשובות - רק מציג
  - מנהל אימיילים - רק הודעות נכנסות
*/

import { useEffect, useState } from 'react';
import { Search, Mail, MailOpen, Trash2, Eye, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getContactMessages, markContactMessageAsRead, deleteContactMessage } from '../../services/admin.service';
import { useAlert } from '../../context/AlertContext';

function ContactMessagesTable() {
  const { showAlert, showConfirm } = useAlert();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'unread', 'read'
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await getContactMessages(navigate);

      if (response.success) {
        setMessages(response.data.messages);
      } else {
        setError(response.message || 'Failed to load messages');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId, currentStatus) => {
    try {
      const response = await markContactMessageAsRead(messageId, navigate);
      if (response.success) {
        showAlert(currentStatus ? 'סומן כלא נקרא' : 'סומן כנקרא');
        fetchMessages();
      } else {
        showAlert('שגיאה בעדכון הסטטוס: ' + response.message);
      }
    } catch (err) {
      showAlert('שגיאה: ' + err.message);
    }
  };

  const handleDeleteMessage = async (messageId, fullName) => {
    showConfirm(`האם אתה בטוח שברצונך למחוק את ההודעה של ${fullName}?`, async () => {
      try {
        const response = await deleteContactMessage(messageId, navigate);
        if (response.success) {
          showAlert('ההודעה נמחקה בהצלחה');
          fetchMessages();
        } else {
          showAlert('שגיאה במחיקת ההודעה: ' + response.message);
        }
      } catch (err) {
        showAlert('שגיאה: ' + err.message);
      }
    });
  };

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      handleMarkAsRead(message._id, false);
    }
  };

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (message.subject && message.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'unread' && !message.isRead) ||
      (filterStatus === 'read' && message.isRead);

    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const truncateText = (text, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white text-xl">טוען הודעות...</div>
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

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">הודעות צור קשר</h1>
          <p className="text-slate-400 mt-1">
            ניהול כל הפניות מלקוחות ({unreadCount} לא נקראו)
          </p>
        </div>
      </div>


      <div className="flex flex-col sm:flex-row gap-4">

        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="חיפוש לפי שם, אימייל, נושא או תוכן..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
            dir="rtl"
          />
        </div>


        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
          dir="rtl"
        >
          <option value="all">הכל ({messages.length})</option>
          <option value="unread">לא נקרא ({unreadCount})</option>
          <option value="read">נקרא ({messages.length - unreadCount})</option>
        </select>
      </div>


      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" dir="rtl">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                  סטטוס
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                  שם מלא
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                  אימייל
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                  טלפון
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                  נושא
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                  הודעה
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                  תאריך
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                  פעולות
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-slate-400">
                    לא נמצאו הודעות
                  </td>
                </tr>
              ) : (
                filteredMessages.map((message) => (
                  <tr
                    key={message._id}
                    className={`hover:bg-slate-700/50 transition-colors ${
                      !message.isRead ? 'bg-slate-750' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {message.isRead ? (
                        <MailOpen size={20} className="text-slate-400" />
                      ) : (
                        <Mail size={20} className="text-purple-400" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white font-medium">{message.fullName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-slate-300 text-sm">{message.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-slate-300 text-sm">
                        {message.phone || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-300 text-sm">
                        {message.subject || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-300 text-sm max-w-xs">
                        {truncateText(message.message)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-slate-400 text-sm">
                        {formatDate(message.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewMessage(message)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-slate-700 rounded transition-colors"
                          title="צפה בהודעה"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleMarkAsRead(message._id, message.isRead)}
                          className="p-2 text-purple-400 hover:text-purple-300 hover:bg-slate-700 rounded transition-colors"
                          title={message.isRead ? 'סמן כלא נקרא' : 'סמן כנקרא'}
                        >
                          {message.isRead ? <Mail size={18} /> : <MailOpen size={18} />}
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(message._id, message.fullName)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded transition-colors"
                          title="מחק הודעה"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>


      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" dir="rtl">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">פרטי ההודעה</h2>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-slate-400 text-sm font-semibold mb-1">שם מלא</label>
                <p className="text-white text-lg">{selectedMessage.fullName}</p>
              </div>
              <div>
                <label className="block text-slate-400 text-sm font-semibold mb-1">אימייל</label>
                <p className="text-white">
                  <a href={`mailto:${selectedMessage.email}`} className="text-purple-400 hover:underline">
                    {selectedMessage.email}
                  </a>
                </p>
              </div>
              {selectedMessage.phone && (
                <div>
                  <label className="block text-slate-400 text-sm font-semibold mb-1">טלפון</label>
                  <p className="text-white">
                    <a href={`tel:${selectedMessage.phone}`} className="text-purple-400 hover:underline">
                      {selectedMessage.phone}
                    </a>
                  </p>
                </div>
              )}
              {selectedMessage.subject && (
                <div>
                  <label className="block text-slate-400 text-sm font-semibold mb-1">נושא</label>
                  <p className="text-white">{selectedMessage.subject}</p>
                </div>
              )}
              <div>
                <label className="block text-slate-400 text-sm font-semibold mb-1">הודעה</label>
                <p className="text-white whitespace-pre-wrap bg-slate-700 p-4 rounded-lg">
                  {selectedMessage.message}
                </p>
              </div>
              <div>
                <label className="block text-slate-400 text-sm font-semibold mb-1">תאריך</label>
                <p className="text-white">{formatDate(selectedMessage.createdAt)}</p>
              </div>
              <div>
                <label className="block text-slate-400 text-sm font-semibold mb-1">סטטוס</label>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedMessage.isRead
                      ? 'bg-slate-700 text-slate-300'
                      : 'bg-purple-900/30 text-purple-400'
                  }`}
                >
                  {selectedMessage.isRead ? 'נקרא' : 'לא נקרא'}
                </span>
              </div>
            </div>
            <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => handleMarkAsRead(selectedMessage._id, selectedMessage.isRead)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                {selectedMessage.isRead ? 'סמן כלא נקרא' : 'סמן כנקרא'}
              </button>
              <button
                onClick={() => {
                  handleDeleteMessage(selectedMessage._id, selectedMessage.fullName);
                  setSelectedMessage(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                מחק הודעה
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContactMessagesTable;
