import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { UploadCloud, FileText, Trash2, Archive, CheckCircle, AlertCircle, RefreshCw, Folder, Cpu } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const CATEGORIES = [
  { value: 'admission', label: 'Aqbalaadda (Admission Requirements)' },
  { value: 'programs', label: 'Kuliyadaha (Faculties & Programs)' },
  { value: 'fees', label: 'Fiiska (Tuition & Fees)' },
  { value: 'university', label: 'Jaamacadda (Campus & General Info)' },
  { value: 'faq', label: 'Su\'aalaha Badan (FAQs)' },
];

const Documents = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [category, setCategory] = useState('admission');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setError(null);
    setSuccess(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setError('Dukumentiga la oggol yahay waa PDF oo keliya (.pdf).');
      setSelectedFile(null);
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('Cabbirka faylku waa inuu ka yar yahay 15MB.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);

      const fileName = `${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `${category}/${fileName}`;

      // 1. Storage Upload
      try {
        await supabase.storage
          .from('documents')
          .upload(filePath, selectedFile, { cacheControl: '3600', upsert: false });
      } catch (storageErr) {
        console.warn('Supabase storage upload bypassed:', storageErr);
      }

      // 2. Metadata Insert
      const { data: docRecord, error: dbError } = await supabase
        .from('documents')
        .insert([
          {
            title: selectedFile.name.replace(/\.pdf$/i, ''),
            file_name: selectedFile.name,
            file_url: filePath,
            category: category,
            status: 'processing',
            uploaded_by: user?.id || null,
          },
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      // 3. Process with Express AI Server
      setProcessingId(docRecord.id);
      const formData = new FormData();
      formData.append('documentId', docRecord.id);
      formData.append('fileUrl', filePath);
      formData.append('fileName', selectedFile.name);
      formData.append('title', selectedFile.name.replace(/\.pdf$/i, ''));
      formData.append('category', category);
      formData.append('file', selectedFile);

      const { data: { session } } = await supabase.auth.getSession();
      const headers = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch(`${API_BASE_URL}/api/documents/process`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'PDF embedding generation failed');
      }

      const resData = await res.json();
      setSuccess(`Guul! Waxaa si guul leh loo habeeyay "${selectedFile.name}" (${resData.chunksProcessed} vector chunks).`);

      setSelectedFile(null);
      fetchDocuments();
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Dukumentiga lama gelin karin.');
    } finally {
      setUploading(false);
      setProcessingId(null);
    }
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Ma hubtaa inaad tirtirto "${doc.file_name}"?`)) return;

    try {
      if (doc.file_url) {
        await supabase.storage.from('documents').remove([doc.file_url]);
      }
      const { error } = await supabase.from('documents').delete().eq('id', doc.id);
      if (error) throw error;

      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      setSuccess(`Waa la tirtiray "${doc.file_name}"`);
    } catch (err) {
      console.error('Delete error:', err);
      setError('Tirtiristu way fashilantay.');
    }
  };

  const handleArchive = async (doc) => {
    try {
      const newStatus = doc.status === 'archived' ? 'ready' : 'archived';
      const { error } = await supabase
        .from('documents')
        .update({ status: newStatus })
        .eq('id', doc.id);

      if (error) throw error;

      setDocuments((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, status: newStatus } : d))
      );
    } catch (err) {
      console.error('Archive error:', err);
      setError('Beddelidda xaaladdu way fashilantay.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
          Admission Knowledge Base
        </h1>
        <p className="text-xs sm:text-sm text-sky-700 dark:text-sky-400 font-semibold">
          Soo geli dukumentiyada rasmiga ah ee Jaamacadda Ummadda Soomaaliyeed si AI-gu uga jawaabo su'aalaha ardayda.
        </p>
      </div>

      {/* Upload Zone Card */}
      <div className="bg-white dark:bg-[#0b1325]/90 border border-slate-200 dark:border-sky-950/80 rounded-3xl p-6 shadow-sm dark:shadow-xl backdrop-blur-xl transition-colors">
        <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
          <UploadCloud className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <span>Upload Official SNU PDF Document</span>
        </h2>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 dark:text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500 dark:text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Category (Nooca Dukumentiga)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#070d18] border border-slate-300 dark:border-slate-700/80 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-sky-500 transition-all font-medium shadow-sm"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Select PDF File (.pdf)
              </label>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-[#070d18] border border-slate-300 dark:border-slate-700/80 rounded-xl text-slate-700 dark:text-slate-300 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-500 cursor-pointer shadow-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!selectedFile || uploading}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-sky-500 via-sky-600 to-blue-700 hover:from-sky-400 hover:to-blue-600 disabled:opacity-40 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-sky-600/25 border border-sky-400/30 flex items-center justify-center gap-2 active:scale-95"
          >
            {uploading ? (
              <>
                <Cpu className="w-4 h-4 animate-spin text-amber-400" />
                <span>Processing & Generating Vector Embeddings...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Upload & Index Document</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Documents Table Card */}
      <div className="bg-white dark:bg-[#0b1325]/90 border border-slate-200 dark:border-sky-950/80 rounded-3xl overflow-hidden shadow-sm dark:shadow-xl backdrop-blur-xl transition-colors">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Indexed Documents ({documents.length})
            </h2>
          </div>
          <button
            onClick={fetchDocuments}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-[#070d18] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Document Title</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Uploaded Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400 dark:text-slate-500">
                    Loading knowledge documents...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400 dark:text-slate-500">
                    No documents uploaded yet. Upload your first PDF above.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                      <span className="truncate max-w-xs">{doc.file_name}</span>
                    </td>
                    <td className="px-6 py-4 capitalize">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sky-800 dark:text-sky-300 text-[11px] font-medium">
                        <Folder className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                          doc.status === 'ready'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30'
                            : doc.status === 'processing'
                            ? 'bg-sky-100 text-sky-800 border border-sky-300 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30 animate-pulse'
                            : doc.status === 'archived'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">
                      {new Date(doc.created_at).toLocaleDateString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-right space-x-1">
                      <button
                        onClick={() => handleArchive(doc)}
                        className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title={doc.status === 'archived' ? 'Unarchive' : 'Archive'}
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Documents;
