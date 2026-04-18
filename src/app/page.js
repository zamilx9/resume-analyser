"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import "primeicons/primeicons.css";
import { analyzeResume } from "@/utils/atsScorer";
import { generateProfessionalResume } from "@/utils/resumeTemplateer";

export default function Home() {
  const [activeTab, setActiveTab] = useState("upload");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [jobDesc, setJobDesc] = useState("");

  const [education, setEducation] = useState("");
  const [skills, setSkills] = useState("");
  const [certifications, setCertifications] = useState("");
  const [eduLoading, setEduLoading] = useState(false);
  const [eduResult, setEduResult] = useState(null);
  const [generatedResume, setGeneratedResume] = useState(null);
  const [liveAtsScore, setLiveAtsScore] = useState(null);

  const [eduUserDetails, setEduUserDetails] = useState({
    fullName: "", email: "", phone: "", location: "", linkedIn: "", github: "", careerObjective: "",
  });

  const [jobDesc2, setJobDesc2] = useState("");
  const [jobLoading, setJobLoading] = useState(false);
  const [jobResult, setJobResult] = useState(null);

  const handleUploadAnalyze = useCallback(async () => {
    if (!uploadFile) { alert("Please select a file"); return; }
    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      const response = await fetch("/api/v1/ats/analyze", { method: "POST", body: formData });
      const data = await response.json();
      if (response.ok) { setUploadResult(data.data); }
      else { alert("Error: " + (data.message || "Failed")); }
    } catch (error) { alert("Error: " + error.message); }
    finally { setUploadLoading(false); }
  }, [uploadFile]);

  const handleGenerateFromEducation = useCallback(async () => {
    if (!education || !skills || !eduUserDetails.fullName) { alert("Fill required fields"); return; }
    setEduLoading(true);
    try {
      const response = await fetch("/api/v1/ats/analyze", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userDetails: eduUserDetails,
          education: education.split("\n").filter(e => e.trim()),
          skills: skills.split("\n").filter(s => s.trim()),
          certifications: certifications ? certifications.split("\n").filter(c => c.trim()) : [],
        }),
      });
      const data = await response.json();
      if (response.ok) { setEduResult(data.data); setGeneratedResume(data.data); }
      else { alert("Error: " + data.message); }
    } catch (error) { alert("Error: " + error.message); }
    finally { setEduLoading(false); }
  }, [education, skills, eduUserDetails]);

  // Calculate live ATS score as user types
  const updateLiveScore = useCallback(() => {
    if (education && skills && eduUserDetails.fullName) {
      try {
        const resumeContent = generateProfessionalResume(
          eduUserDetails,
          education.split("\n").filter(e => e.trim()),
          skills.split("\n").filter(s => s.trim()),
          certifications ? certifications.split("\n").filter(c => c.trim()) : []
        );
        const score = analyzeResume(resumeContent, "");
        setLiveAtsScore(score);
      } catch (error) {
        console.error("Error calculating live score:", error);
      }
    }
  }, [education, skills, certifications, eduUserDetails]);

  // Update live score after each keystroke (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      updateLiveScore();
    }, 500); // Debounce by 500ms

    return () => clearTimeout(timer);
  }, [education, skills, certifications, eduUserDetails.fullName, eduUserDetails.email, eduUserDetails.phone, updateLiveScore]);

  const handleTailorForJob = useCallback(async () => {
    if (!generatedResume) { alert("Generate resume in Education tab first"); return; }
    if (!jobDesc2.trim()) { alert("Enter job description"); return; }
    setJobLoading(true);
    try {
      const response = await fetch("/api/v1/ats/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: generatedResume.resumeText, jobDescription: jobDesc2, userDetails: generatedResume }),
      });
      const data = await response.json();
      if (response.ok) { setJobResult(data.data); }
      else { alert("Error: " + data.message); }
    } catch (error) { alert("Error: " + error.message); }
    finally { setJobLoading(false); }
  }, [generatedResume, jobDesc2]);

  const downloadResume = useCallback((text, filename = "resume.txt") => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text).then(() => alert("Copied to clipboard!"));
  }, []);

  const renderResumeContent = (resumeText) => {
    // Parse header markers
    const headerStart = resumeText.indexOf("<<<HEADER_START>>>");
    const headerEnd = resumeText.indexOf("<<<HEADER_END>>>");
    
    if (headerStart !== -1 && headerEnd !== -1) {
      const headerContent = resumeText.substring(headerStart + 18, headerEnd).trim();
      const bodyContent = resumeText.substring(headerEnd + 16).trim();
      
      // Parse header lines
      const headerLines = headerContent.split('\n').filter(l => l.trim());
      
      return (
        <div className="space-y-4">
          {/* Styled Header */}
          <div className="text-center space-y-2 pb-4 border-b-2 border-gray-300 dark:border-gray-600">
            {headerLines.map((line, idx) => {
              // Name line (marked with ***)
              if (line.includes('***')) {
                const name = line.replace(/\*/g, '').trim();
                return (
                  <div key={idx} className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{name}</div>
                  </div>
                );
              }
              // Location line (marked with ___)
              else if (line.includes('___')) {
                const location = line.replace(/_/g, '').trim();
                return (
                  <div key={idx} className="text-center">
                    <div className="text-base font-semibold text-gray-700 dark:text-gray-300">{location}</div>
                  </div>
                );
              }
              // Contact info
              else if (line.trim()) {
                return (
                  <div key={idx} className="text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400">{line.trim()}</div>
                  </div>
                );
              }
              return null;
            })}
          </div>
          
          {/* Body content */}
          <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 text-sm" style={{ fontFamily: "'Times New Roman', serif", lineHeight: '1.6' }}>
            {bodyContent}
          </pre>
        </div>
      );
    }
    
    // Fallback if no markers found
    return (
      <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-200" style={{ fontFamily: "'Times New Roman', serif", fontSize: '14px', lineHeight: '1.6' }}>
        {resumeText}
      </pre>
    );
  };

  const renderResume = (data) => {
    if (!data || !data.resumeText) return null;
    const resumeText = data.resumeText || "";
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white"><i className="pi pi-file-pdf mr-2"></i>Resume</h3>
          <div className="gap-2 flex">
            <button onClick={() => copyToClipboard(resumeText)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm"><i className="pi pi-copy mr-1"></i>Copy</button>
            <button onClick={() => downloadResume(resumeText, "resume.txt")} className="px-3 py-1 bg-green-600 text-white rounded text-sm"><i className="pi pi-download mr-1"></i>Download</button>
          </div>
        </div>
        {data.score && <div className="grid grid-cols-3 gap-4 mb-4"><div className={`text-center p-4 rounded ${data.score >= 80 ? "bg-green-100" : "bg-yellow-100"}`}><div className="text-3xl font-bold">{data.score}</div><div className="text-sm font-semibold">ATS Score</div></div><div className={`text-center p-4 rounded ${data.matchPercentage >= 75 ? "bg-blue-100" : "bg-orange-100"}`}><div className="text-3xl font-bold">{data.matchPercentage || 0}%</div><div className="text-sm font-semibold">Keyword Match</div></div><div className="text-center p-4 rounded bg-purple-100"><div className="text-3xl font-bold">{data.matchedKeywords || 0}/{data.totalKeywords || 40}</div><div className="text-sm font-semibold">Keywords</div></div></div>}
        <div className="bg-white dark:bg-gray-700 p-4 rounded max-h-64 overflow-y-auto">{renderResumeContent(resumeText)}</div>
        {data.suggestedKeywords && data.suggestedKeywords.length > 0 && <div className="mt-4"><h4 className="text-sm font-bold mb-2"><i className="pi pi-lightbulb mr-1"></i>Missing Keywords:</h4><div className="flex flex-wrap gap-2">{data.suggestedKeywords.slice(0, 8).map((k, i) => <span key={i} className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">+ {k}</span>)}</div></div>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <header className="bg-white dark:bg-gray-800 shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white"><i className="pi pi-file-pdf text-red-500 mr-2"></i>Resume Analyzer</h1>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Transform your resume with instant AI-powered feedback</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex gap-2 mb-4 flex-wrap">
          {[{ id: "upload", label: "📤 Upload & Analyze", icon: "pi-upload" }, { id: "education", label: "🎓 Build & Improve", icon: "pi-graduation-cap" }, { id: "jobmatch", label: "💼 Job Tailor", icon: "pi-briefcase" }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-1 text-sm rounded-lg font-semibold transition-all flex items-center gap-1 ${activeTab === tab.id ? "bg-blue-600 text-white shadow-lg" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>
              <i className={`pi ${tab.icon}`}></i> {tab.label}
            </button>
          ))}
        </div>
        {activeTab === "upload" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1"><i className="pi pi-upload mr-2 text-blue-500"></i>Upload Your Resume</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">Drag and drop your file here</p>
              
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                <i className="pi pi-cloud-upload text-3xl text-gray-300 dark:text-gray-600 block mb-2"></i>
                <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={(e) => setUploadFile(e.target.files[0])} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <p className="text-gray-700 dark:text-gray-300 font-semibold mb-1 text-sm">Drag and drop your resume here</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-2">or</p>
                  <span className="inline-block bg-black text-white px-4 py-1 rounded-lg text-sm font-semibold hover:bg-gray-800">Browse Files</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">Supported: PDF, DOC, DOCX (Max 10MB)</p>
              
              {uploadFile && <p className="text-green-600 mt-2 text-xs"><i className="pi pi-check mr-1"></i>{uploadFile.name}</p>}
              
              <button onClick={handleUploadAnalyze} disabled={uploadLoading || !uploadFile} className={`w-full mt-4 py-2 rounded-lg font-semibold text-sm text-white transition-all ${uploadLoading || !uploadFile ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}>
                {uploadLoading ? <span className="flex items-center justify-center gap-2"><i className="pi pi-spin pi-spinner"></i>Analyzing...</span> : <><i className="pi pi-search mr-2"></i>Analyze Resume</>}
              </button>
            </div>
            <div>{uploadResult ? renderResume(uploadResult) : <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center"><i className="pi pi-inbox text-4xl text-gray-300 dark:text-gray-600"></i><p className="text-gray-600 dark:text-gray-400 mt-3 text-sm">Upload resume to see analysis</p></div>}</div>
          </div>
        )}

        {/* Education Tab */}
        {activeTab === "education" && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                  <i className="pi pi-graduation-cap text-white text-lg"></i>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Build & Improve</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Create professional resumes from your education</p>
                </div>
              </div>

              {liveAtsScore && (
                <div className="grid grid-cols-3 gap-2 mb-3 p-2 bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-700 dark:to-gray-700 rounded-lg">
                  <div className="text-center">
                    <div className={`text-lg font-bold ${liveAtsScore.score >= 80 ? "text-green-600" : liveAtsScore.score >= 50 ? "text-yellow-600" : "text-red-600"}`}>{liveAtsScore.score}</div>
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mt-0.5">ATS Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{liveAtsScore.matchPercentage || 0}%</div>
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mt-0.5">Keywords</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">{liveAtsScore.matchedKeywords || 0}</div>
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mt-0.5">Matched</div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {/* Personal Information */}
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-2 flex items-center gap-1"><i className="pi pi-user text-blue-500 text-xs"></i>Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input type="text" value={eduUserDetails.fullName} onChange={(e) => setEduUserDetails({...eduUserDetails, fullName: e.target.value})} placeholder="Full Name *" className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                    <input type="email" value={eduUserDetails.email} onChange={(e) => setEduUserDetails({...eduUserDetails, email: e.target.value})} placeholder="Email *" className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    <input type="tel" value={eduUserDetails.phone} onChange={(e) => setEduUserDetails({...eduUserDetails, phone: e.target.value})} placeholder="Phone *" className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                    <input type="text" value={eduUserDetails.location} onChange={(e) => setEduUserDetails({...eduUserDetails, location: e.target.value})} placeholder="City, Country" className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                  </div>
                </div>

                {/* Education Section */}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-2 flex items-center gap-1"><i className="pi pi-book text-green-500 text-xs"></i>Education</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Institution / University *</label>
                      <input type="text" value={education} onChange={(e) => setEducation(e.target.value)} placeholder="e.g., Stanford University, MIT, Harvard" className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Graduation Year</label>
                      <input type="text" value={certifications} onChange={(e) => setCertifications(e.target.value)} placeholder="e.g., 2023, Expected 2025" className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                    </div>
                  </div>
                </div>

                {/* Skills Section */}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-2 flex items-center gap-1"><i className="pi pi-th-large text-purple-500 text-xs"></i>Key Skills</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Key Skills (Optional)</label>
                      <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="e.g., Python, Data Analysis, Project Management, Leadership" className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Experience Level</label>
                      <select className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                        <option>Entry Level / Recent Graduate</option>
                        <option>1-3 Years</option>
                        <option>3-5 Years</option>
                        <option>5-10 Years</option>
                        <option>10+ Years</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-2 flex items-center gap-1"><i className="pi pi-link text-red-500 text-xs"></i>Social Links (Optional)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input type="text" value={eduUserDetails.linkedIn} onChange={(e) => setEduUserDetails({...eduUserDetails, linkedIn: e.target.value})} placeholder="LinkedIn URL" className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                    <input type="text" value={eduUserDetails.github} onChange={(e) => setEduUserDetails({...eduUserDetails, github: e.target.value})} placeholder="GitHub URL" className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                  </div>
                </div>

                {/* Career Objective */}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-2 flex items-center gap-1"><i className="pi pi-target text-orange-500 text-xs"></i>Career Objective (Optional)</h4>
                  <textarea value={eduUserDetails.careerObjective} onChange={(e) => setEduUserDetails({...eduUserDetails, careerObjective: e.target.value})} placeholder="E.g., Seeking role to leverage my skills in software development..." rows="2" className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                </div>

                {/* Action Buttons */}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3 flex gap-2">
                  <button onClick={handleGenerateFromEducation} disabled={eduLoading || !education || !skills || !eduUserDetails.fullName} className={`flex-1 py-2 text-sm rounded-lg font-bold text-white transition-all flex items-center justify-center gap-1 ${eduLoading || !education || !skills || !eduUserDetails.fullName ? "bg-gray-400" : "bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg"}`}>
                    {eduLoading ? <><i className="pi pi-spin pi-spinner"></i>Generating...</> : <><i className="pi pi-check"></i>Generate Resume</>}
                  </button>
                </div>
              </div>
            </div>

            {/* Generated Resume Preview */}
            {eduResult && (
              <div className="mt-8">
                {renderResume(eduResult)}
              </div>
            )}
          </div>
        )}

        {/* Job Match Tab */}
        {activeTab === "jobmatch" && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                  <i className="pi pi-bullseye text-white text-lg"></i>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Generate from Job Description</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Paste the job posting and we'll create a tailored resume</p>
                </div>
              </div>

              {!generatedResume ? (
                <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200"><i className="pi pi-exclamation-triangle mr-1"></i>Generate resume in Build & Improve tab first</p>
                </div>
              ) : (
                <div className="mb-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                  <p className="text-xs text-green-800 dark:text-green-200"><i className="pi pi-check-circle mr-1"></i>Base resume ready for tailoring</p>
                </div>
              )}

              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-2 flex items-center gap-1"><i className="pi pi-file-text text-blue-500 text-xs"></i>Job Description</h4>
                <textarea value={jobDesc2} onChange={(e) => setJobDesc2(e.target.value)} placeholder="Paste the complete job description here..." rows="6" className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>

              <div className="mt-3">
                <button onClick={handleTailorForJob} disabled={jobLoading || !generatedResume || !jobDesc2.trim()} className={`w-full py-2 text-sm rounded-lg font-bold text-white transition-all flex items-center justify-center gap-1 ${jobLoading || !generatedResume || !jobDesc2.trim() ? "bg-gray-400" : "bg-gradient-to-r from-purple-500 to-purple-600 hover:shadow-lg"}`}>
                  {jobLoading ? <><i className="pi pi-spin pi-spinner"></i>Tailoring...</> : <><i className="pi pi-magic"></i>Tailor Resume</>}
                </button>
              </div>
            </div>

            {jobResult && (
              <div className="mt-8">
                {renderResume(jobResult)}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-gray-400 py-3 mt-4">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="flex items-center justify-center gap-1 text-xs"><i className="pi pi-heart text-red-500"></i>© 2026 Resume Analyzer</p>
        </div>
      </footer>
    </div>
  );
}

