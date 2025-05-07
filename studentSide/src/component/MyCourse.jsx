// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faFilePdf, faVideo, faSpinner, faExclamationTriangle, faDownload } from '@fortawesome/free-solid-svg-icons'; // Added faDownload
// import { useUser } from '../context/UserContext'; // Assuming context gives user info
// import { toast } from 'react-toastify';
// // Reusable Badge Component
// const AccessTypeBadge = ({ accessType }) => (
//     <span className={`
//         inline-block text-xs text-white px-2 py-0.5 rounded-full capitalize font-medium leading-none
//         ${accessType?.toLowerCase() === 'pro' ? 'bg-indigo-600' :
//           accessType?.toLowerCase() === 'classic' ? 'bg-purple-500' :
//           accessType?.toLowerCase() === 'basic' ? 'bg-teal-500' :
//           'bg-gray-500'}
//     `}>
//         {accessType || 'N/A'}
//     </span>
// );

// function MyCourses() {
//     const [pdfs, setPdfs] = useState([]);
//     const [videos, setVideos] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [downloadingPdfId, setDownloadingPdfId] = useState(null);
//     const { user } = useUser(); // Get user from context for welcome message

//     // Fetch Course Materials (PDFs & Videos)
//     useEffect(() => {
//         let isMounted = true; // Flag for cleanup
//         const fetchStudentData = async () => {
//             setLoading(true);
//             setError(null);
//             const token = localStorage.getItem('authToken');
//             if (!token) {
//                 if (isMounted) { setError("Authentication required."); setLoading(false); }
//                 return;
//             }
//             const config = { headers: { Authorization: `Bearer ${token}` } };

//             try {
//                 const endpoint = 'http://localhost:5000/api/student/course-materials';
//                 console.log(`[MyCourses] Fetching from: ${endpoint}`);
//                 const response = await axios.get(endpoint, config);
//                 console.log("Student Course Materials Data:", response.data);
//                 if (isMounted) {
//                     setPdfs(response.data.pdfs || []);
//                     setVideos(response.data.videos || []);
//                 }
//             } catch (err) {
//                 console.error("Error fetching student course materials:", err);
//                  if (isMounted) {
//                     setError(err.response?.data?.message || "Failed to load materials.");
//                     setPdfs([]); setVideos([]);
//                  }
//             } finally {
//                 if (isMounted) setLoading(false);
//             }
//         };
//         fetchStudentData();

//         return () => { isMounted = false; }; // Cleanup function
//     }, []); // Empty array means fetch once on mount
//     const handleDownloadPdf = async (filename, title) => {
//         if (!filename) {
//             toast.error("Invalid file link.");
//             return;
//         }
//         setDownloadingPdfId(filename); // Indicate loading state for this specific button
//         const token = localStorage.getItem('authToken');
//         if (!token) {
//             toast.error("Authentication error. Please log in.");
//             setDownloadingPdfId(null);
//             return;
//         }

//         const downloadUrl = `http://localhost:5000/api/pdfs/download/${encodeURIComponent(filename)}`;
//         console.log("Attempting to download:", downloadUrl);

//         try {
//             const response = await axios.get(downloadUrl, {
//                 headers: {
//                     Authorization: `Bearer ${token}` // <-- ADD AUTH HEADER
//                 },
//                 responseType: 'blob' // <-- IMPORTANT: Receive file as Blob
//             });

//             // --- Trigger Browser Download ---
//             // Create a URL for the blob object
//             const blobUrl = window.URL.createObjectURL(new Blob([response.data]));

//             // Create a temporary link element
//             const link = document.createElement('a');
//             link.href = blobUrl;

//             // Suggest a filename (use title if available, otherwise original filename)
//             // Sanitize title just in case
//             const safeTitle = title ? title.replace(/[/\\?%*:|"<>]/g, '-') : filename;
//             link.setAttribute('download', `${safeTitle}.pdf`); // Set the desired filename

//             // Append link to body, click it, remove it
//             document.body.appendChild(link);
//             link.click();
//             document.body.removeChild(link);

//             // Revoke the object URL to free up memory
//             window.URL.revokeObjectURL(blobUrl);
//             console.log("Download initiated for:", filename);

//         } catch (err) {
//             console.error("Error downloading PDF:", err);
//             const errorMsg = err.response?.data?.message || err.response?.statusText || "Download failed.";
//             // Check if blob error message needs decoding (might not be standard JSON)
//              if (err.response?.data instanceof Blob && err.response?.data.type === "text/plain") {
//                  // Try to read error message from Blob
//                  try {
//                       const text = await err.response.data.text();
//                       console.error("Backend error message:", text);
//                       toast.error(`Download failed: ${text}`);
//                   } catch (readErr) {
//                       toast.error(errorMsg); // Fallback
//                   }
//              } else {
//                   toast.error(errorMsg); // Show error message from JSON or default
//               }
//         } finally {
//             setDownloadingPdfId(null); // Reset loading state for this button
//         }
//     };

//     // --- Render Logic ---

//     if (loading) {
//         return (
//             <div className="flex justify-center items-center h-64 text-indigo-600">
//                 <FontAwesomeIcon icon={faSpinner} spin size="2x" />
//                 <span className="ml-3">Loading Content...</span>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="m-4 p-4 bg-red-100 text-red-700 border border-red-400 rounded text-center">
//                 <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
//                 {error}
//             </div>
//         );
//     }

//     return (
//         <div className="p-4 md:p-6 space-y-8">
//             <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
//                 My Learning Materials {user ? <span className='text-lg font-medium text-indigo-600'>({user.plan?.toUpperCase()} Plan)</span> : ''}
//             </h1>

//             {/* PDF Materials Section */}
//             <section>
//                 <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
//                     <FontAwesomeIcon icon={faFilePdf} className="mr-2 text-red-600" />
//                     Course Documents
//                 </h2>
//                 {pdfs.length > 0 ? (
//                     <ul className="space-y-2">
//                        {pdfs.map(pdf => {
//                             let filename = null;
//                             let isValidLink = false;
//                             if (pdf.fileUrl) {
//                                 try {
//                                     const parts = pdf.fileUrl.split('/');
//                                     filename = parts[parts.length - 1];
//                                      isValidLink = !!filename; // Simple check if filename could be extracted
//                                     } catch (e) {
//                                         console.error("Error parsing filename from fileUrl:", pdf.fileUrl, e);
//                                     }
//                                 }
//                                 const isDownloading = downloadingPdfId === filename; // Check if this PDF is downloading
//                             return (
//                                  <li key={pdf._id} className="bg-white p-3 rounded shadow hover:shadow-md transition-shadow flex justify-between items-center flex-wrap gap-2"> {/* Added flex-wrap and gap */}
//                                       {/* Left side: Title */}
//                                       <div className='flex-1 min-w-0 mr-4'> {/* Allow shrinking/wrapping */}
//                                           <span className='font-medium text-gray-800 break-words'> {/* Allow long titles to wrap */}
//                                               {pdf.title || 'Untitled Document'}
//                                            </span>
//                                            {/* You could add description here if needed */}
//                                        </div>
//                                        {/* Right side: Badge and Download Button */}
//                                        <div className='flex items-center gap-3 flex-shrink-0'> {/* Prevent shrinking */}
//                                            <AccessTypeBadge accessType={pdf.accessType} />
//                                            {isValidLink ? (
//                                    <button
//                                    onClick={() => handleDownloadPdf(filename, pdf.title)}
//                                    disabled={isDownloading} // Disable while downloading this file
//                                    className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center disabled:opacity-50 disabled:cursor-wait"
//                                    title={`Download ${pdf.title || 'PDF'}`}
//                                >
//                                    {isDownloading ? <FontAwesomeIcon icon={faSpinner} spin className="mr-1.5" /> : <FontAwesomeIcon icon={faDownload} className="mr-1.5" />}
//                                    {isDownloading ? 'Downloading...' : 'Download'}
//                                </button>
//                             ) : (
//                                 <span className='text-xs text-gray-400 italic'>(Invalid Link)</span>
//                             )}
//                         </div>
//                   </li>
//               );
//         })}
//     </ul>
//                 ) : (
//                     <div className="text-center py-4 px-4 bg-gray-50 rounded-lg">
//                         <p className="text-gray-500 italic">No PDF documents available for your plan.</p>
//                      </div>
//                 )}
//             </section>

//             {/* Video Lessons Section */}
//             <section>
//                  <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
//                      <FontAwesomeIcon icon={faVideo} className="mr-2 text-blue-600" />
//                      Video Lessons
//                  </h2>
//                 {videos.length > 0 ? (
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> {/* Adjusted grid for smaller screens */}
//                         {videos.map(video => (
//                             <div key={video._id} className="bg-white p-3 rounded shadow flex flex-col"> {/* Reduced padding slightly */}
//                                 <h3 className="font-semibold text-gray-800 mb-2 text-sm truncate" title={video.title}>{video.title}</h3> {/* Truncate title */}
//                                 <div className="aspect-video mb-2 bg-black rounded overflow-hidden"> {/* Aspect ratio container */}
//                                      <video width="100%" height="100%" controls preload="metadata" className="object-cover"> {/* Use object-cover */}
//                                          <source src={`http://localhost:5000${video.filePath}`} type="video/mp4" />
//                                          Your browser does not support the video tag.
//                                      </video>
//                                  </div>
//                                  <div className="flex justify-end mt-auto pt-1"> {/* Push badge to bottom */}
//                                      <AccessTypeBadge accessType={video.accessType} />
//                                  </div>
//                              </div>
//                         ))}
//                     </div>
//                 ) : (
//                      <div className="text-center py-4 px-4 bg-gray-50 rounded-lg">
//                         <p className="text-gray-500 italic">No video lessons available for your plan.</p>
//                      </div>
//                  )}
//             </section>
//         </div>
//     );
// }

// export default MyCourses;


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faVideo, faSpinner, faExclamationTriangle, faDownload, faEye } from '@fortawesome/free-solid-svg-icons';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';

const AccessTypeBadge = ({ accessType }) => (
    <span className={`
        inline-block text-xs text-white px-2 py-0.5 rounded-full capitalize font-medium leading-none
        ${accessType?.toLowerCase() === 'pro' ? 'bg-indigo-600' :
          accessType?.toLowerCase() === 'classic' ? 'bg-purple-500' :
          accessType?.toLowerCase() === 'basic' ? 'bg-teal-500' :
          'bg-gray-500'}
    `}>
        {accessType || 'N/A'}
    </span>
);

function MyCourses() {
    const [pdfs, setPdfs] = useState([]);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloadingPdfId, setDownloadingPdfId] = useState(null);
    const [previewPdf, setPreviewPdf] = useState(null);
    const { user } = useUser();

    // Fetch Course Materials (PDFs & Videos)
    useEffect(() => {
        let isMounted = true;
        const fetchStudentData = async () => {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('authToken');
            if (!token) {
                if (isMounted) { setError("Authentication required."); setLoading(false); }
                return;
            }
            const config = { headers: { Authorization: `Bearer ${token}` } };

            try {
                const endpoint = 'http://localhost:5000/api/student/course-materials';
                const response = await axios.get(endpoint, config);
                if (isMounted) {
                    setPdfs(response.data.pdfs || []);
                    setVideos(response.data.videos || []);
                }
            } catch (err) {
                console.error("Error fetching student course materials:", err);
                 if (isMounted) {
                    setError(err.response?.data?.message || "Failed to load materials.");
                    setPdfs([]); setVideos([]);
                 }
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchStudentData();

        return () => { isMounted = false; };
    }, []);

    const handleDownloadPdf = async (filename, title) => {
        if (!filename) {
            toast.error("Invalid file link.");
            return;
        }
        setDownloadingPdfId(filename);
        const token = localStorage.getItem('authToken');
        if (!token) {
            toast.error("Authentication error. Please log in.");
            setDownloadingPdfId(null);
            return;
        }

        try {
            const response = await axios.get(
                `http://localhost:5000/api/pdfs/download/${encodeURIComponent(filename)}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob'
                }
            );

            const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = blobUrl;
            const safeTitle = title ? title.replace(/[/\\?%*:|"<>]/g, '-') : filename;
            link.setAttribute('download', `${safeTitle}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
            toast.success("Download started!");

        } catch (err) {
            console.error("Error downloading PDF:", err);
            const errorMsg = err.response?.data?.message || "Download failed.";
            toast.error(errorMsg);
        } finally {
            setDownloadingPdfId(null);
        }
    };

    const handlePreviewPdf = (pdf) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            toast.error("Please log in to preview files");
            return;
        }
        const filename = pdf.fileUrl.split('/').pop();
        const previewUrl = `http://localhost:5000/api/pdfs/preview/${filename}`;
        try {
            // Verify the file exists and is accessible
            const response =  axios.get(previewUrl, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                responseType: 'blob' // Important for binary data
            });
    
            // Create blob URL for the PDF
            const blobUrl = URL.createObjectURL(new Blob([response.data]));
            setPreviewPdf({
                url: blobUrl,
                title: pdf.title
            });
        } catch (error) {
            console.error("Preview error:", error);
            toast.error(error.response?.data?.message || "Failed to load preview");
        }
    };

    const closePreview = () => {
        setPreviewPdf(null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 text-indigo-600">
                <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                <span className="ml-3">Loading Content...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="m-4 p-4 bg-red-100 text-red-700 border border-red-400 rounded text-center">
                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                {error}
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-8">
            {/* PDF Preview Modal */}
            {previewPdf && (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold">{previewPdf.title}</h3>
                <button onClick={() => setPreviewPdf(null)}>✕</button>
            </div>
            <div className="flex-1 overflow-hidden">
                <iframe 
                    src={`${previewPdf.url}?token=${localStorage.getItem('authToken')}`}
                    className="w-full h-full"
                    title="PDF Preview"
                />
            </div>
        </div>
    </div>
)}

            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                My Learning Materials {user && (
                    <span className='text-lg font-medium text-indigo-600'>
                        ({user.plan?.toUpperCase()} Plan)
                    </span>
                )}
            </h1>

            {/* PDF Materials Section */}
            <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
                    <FontAwesomeIcon icon={faFilePdf} className="mr-2 text-red-600" />
                    Course Documents
                </h2>
                {pdfs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pdfs.map(pdf => {
                            const filename = pdf.fileUrl?.split('/').pop();
                            const isValidLink = !!filename;
                            const isDownloading = downloadingPdfId === filename;

                            return (
                                <div key={pdf._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-gray-800 truncate" title={pdf.title || 'Untitled Document'}>
                                                    {pdf.title || 'Untitled Document'}
                                                </h3>
                                            </div>
                                            <AccessTypeBadge accessType={pdf.accessType} />
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 flex justify-end space-x-3">
                                        {isValidLink && (
                                            <>
                                                <button
                                                    onClick={() => handlePreviewPdf(pdf)}
                                                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                                                    title="Preview PDF"
                                                >
                                                    <FontAwesomeIcon icon={faEye} className="mr-1.5" />
                                                    Preview
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadPdf(filename, pdf.title)}
                                                    disabled={isDownloading}
                                                    className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline flex items-center disabled:opacity-50 disabled:cursor-wait"
                                                    title={`Download ${pdf.title || 'PDF'}`}
                                                >
                                                    {isDownloading ? (
                                                        <FontAwesomeIcon icon={faSpinner} spin className="mr-1.5" />
                                                    ) : (
                                                        <FontAwesomeIcon icon={faDownload} className="mr-1.5" />
                                                    )}
                                                    Download
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-4 px-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 italic">No PDF documents available for your plan.</p>
                    </div>
                )}
            </section>

            {/* Video Lessons Section */}
            <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
                    <FontAwesomeIcon icon={faVideo} className="mr-2 text-blue-600" />
                    Video Lessons
                </h2>
                {videos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {videos.map(video => (
                            <div key={video._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="aspect-video bg-black">
                                    <video 
                                        controls 
                                        preload="metadata" 
                                        className="w-full h-full object-cover"
                                        title={video.title}
                                    >
                                        <source src={`http://localhost:5000${video.filePath}`} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-800 mb-2 truncate" title={video.title}>
                                        {video.title}
                                    </h3>
                                    <div className="flex justify-end">
                                        <AccessTypeBadge accessType={video.accessType} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4 px-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 italic">No video lessons available for your plan.</p>
                    </div>
                )}
            </section>
        </div>
    );
}

export default MyCourses;