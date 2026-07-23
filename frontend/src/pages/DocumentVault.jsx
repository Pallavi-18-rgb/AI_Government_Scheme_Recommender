import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, CheckCircle, AlertTriangle, FileText, Sparkles, Shield, Eye, Lock, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const DocumentVault = () => {
  const { t } = useLanguage();
  const { activePreset } = useTheme();

  const [documents, setDocuments] = useState([
    {
      id: 1,
      type: 'Aadhaar Card',
      docNo: 'XXXX-XXXX-8912',
      status: 'Verified',
      issuer: 'UIDAI',
      extractedData: { Name: 'Verified Citizen', DOB: '1998-05-14', Gender: 'Male', Address: 'Karnataka, India' },
      confidence: 99.4,
      updatedAt: '2026-06-01'
    },
    {
      id: 2,
      type: 'Income Certificate',
      docNo: 'INC-2026-88219',
      status: 'Verified',
      issuer: 'Revenue Department',
      extractedData: { AnnualIncome: '₹ 1,80,000', IssueDate: '2025-08-10', ExpiryDate: '2028-08-10' },
      confidence: 97.8,
      updatedAt: '2026-06-10'
    },
    {
      id: 3,
      type: 'Caste / Community Certificate',
      docNo: 'CST-2024-11029',
      status: 'Needs Renewal',
      issuer: 'Tahsildar Office',
      extractedData: { Category: 'OBC', IssueDate: '2021-01-15' },
      confidence: 94.2,
      updatedAt: '2026-01-15'
    },
    {
      id: 4,
      type: 'Disability Certificate',
      docNo: 'DIS-NOT-UPLOADED',
      status: 'Not Uploaded',
      issuer: 'N/A',
      extractedData: {},
      confidence: 0,
      updatedAt: 'N/A'
    }
  ]);

  const [uploadingType, setUploadingType] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(documents[0]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  const handleSimulatedUpload = (docType) => {
    setUploadingType(docType);
    setUploading(true);

    setTimeout(() => {
      setDocuments((prevDocs) =>
        prevDocs.map((doc) => {
          if (doc.type === docType) {
            return {
              ...doc,
              docNo: `DOC-${Math.floor(100000 + Math.random() * 900000)}`,
              status: 'Verified',
              confidence: 98.6,
              updatedAt: new Date().toISOString().split('T')[0],
              extractedData: {
                ...doc.extractedData,
                Status: 'AI OCR Extraction Verified Successfully',
                VerifiedAt: new Date().toLocaleTimeString()
              }
            };
          }
          return doc;
        })
      );
      setUploading(false);
      setUploadingType(null);
      setUploadSuccess(`AI Verified & Uploaded ${docType} successfully!`);
      setTimeout(() => setUploadSuccess(null), 4000);
    }, 1800);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className={`p-8 rounded-3xl bg-gradient-to-r ${activePreset.headerBg} text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-sky-200">Security & Vault</span>
          <h1 className="text-3xl font-black mt-1">{t('documents')}</h1>
          <p className="text-sm text-slate-200 mt-1">Upload & verify your identity certificates with instant AI OCR validation.</p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-md border border-white/20 text-xs font-semibold">
          <Shield className="w-4 h-4 text-emerald-300" />
          <span>256-Bit Encrypted Storage</span>
        </div>
      </div>

      {uploadSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center shadow-sm">
          <CheckCircle className="w-5 h-5 text-emerald-600 mr-2" />
          {uploadSuccess}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Document List Panel */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Your Identity Certificates ({documents.length})</h2>
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className={`p-5 rounded-3xl border cursor-pointer transition-all duration-300 ${
                selectedDoc?.id === doc.id
                  ? 'bg-white border-2 border-blue-500 shadow-md'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <FileText className="w-4 h-4 text-slate-400 mr-2" />
                  <span className="font-bold text-slate-900 text-sm">{doc.type}</span>
                </div>
                {doc.status === 'Verified' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" /> Verified
                  </span>
                ) : doc.status === 'Needs Renewal' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" /> Renewal
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    Not Uploaded
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-mono mt-1">{doc.docNo}</p>
              
              <div className="mt-4 flex justify-between items-center text-xs">
                <span className="text-slate-400">Issuer: {doc.issuer}</span>
                {doc.status !== 'Verified' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSimulatedUpload(doc.type);
                    }}
                    disabled={uploading && uploadingType === doc.type}
                    className="px-3 py-1 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors flex items-center text-xs"
                  >
                    {uploading && uploadingType === doc.type ? (
                      <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                    ) : (
                      <Upload className="w-3 h-3 mr-1" />
                    )}
                    Upload
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* AI OCR Verification Detail Panel */}
        <div className="lg:col-span-2 space-y-6">
          {selectedDoc ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
              <div className="flex justify-between items-start border-b border-slate-100 pb-6">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Document Analysis</span>
                  <h2 className="text-2xl font-black text-slate-900 mt-1">{selectedDoc.type}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Document ID: <span className="font-mono font-bold text-slate-700">{selectedDoc.docNo}</span></p>
                </div>
                {selectedDoc.status === 'Verified' && (
                  <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center">
                    <Sparkles className="w-4 h-4 text-emerald-600 mr-1.5" />
                    AI Confidence: {selectedDoc.confidence}%
                  </div>
                )}
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800 text-sm">Drag & drop your certificate file here (PDF, PNG, JPG)</h3>
                <p className="text-xs text-slate-400 mt-1">Maximum file size: 5MB. Automatic AI extraction enabled.</p>
                <button
                  onClick={() => handleSimulatedUpload(selectedDoc.type)}
                  disabled={uploading}
                  className="mt-4 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all inline-flex items-center"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Scanning Document with AI...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" /> Upload & Scan {selectedDoc.type}
                    </>
                  )}
                </button>
              </div>

              {/* Extracted Fields */}
              {Object.keys(selectedDoc.extractedData).length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center">
                    <Sparkles className="w-4 h-4 text-sky-500 mr-2" /> Extracted Fields (AI OCR)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(selectedDoc.extractedData).map(([key, val]) => (
                      <div key={key} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-xs text-slate-400 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <p className="text-sm font-bold text-slate-900 mt-1">{val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center text-slate-400">
              Select a document to inspect AI OCR verification details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentVault;
