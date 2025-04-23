// // src/component/MyCourses.jsx (New File)

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faFilePdf, faVideo, faEdit, faSpinner, faExclamationTriangle,faDownload } from '@fortawesome/free-solid-svg-icons';
// import { Navigate, useNavigate } from 'react-router-dom';
// import { useUser } from '../context/UserContext'; // Assuming context provides user info

// // Reusable Badge Component (or import if defined elsewhere)
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
//     const [quizzes, setQuizzes] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const { user } = useUser(); // Get user info from context
//     const navigate=useNavigate();
//     useEffect(() => {
//         const fetchStudentData = async () => {
//             setLoading(true);
//             setError(null);
//             const token = localStorage.getItem('authToken');

//             if (!token) {
//                 setError("Authentication required. Please log in.");
//                 setLoading(false);
//                 return;
//             }

//             try {
//                 const response = await axios.get('http://localhost:5000/api/student/dashboard', {
//                     headers: { Authorization: `Bearer ${token}` }
//                 });
//                 console.log("Student Dashboard Data:", response.data);
//                 setPdfs(response.data.pdfs || []);
//                 setVideos(response.data.videos || []);
//                 setQuizzes(response.data.quizzes || []);
//             } catch (err) {
//                 console.error("Error fetching student data:", err);
//                  setError(err.response?.data?.message || "Failed to load data. Please try again.");
//                  // Clear data on error
//                  setPdfs([]);
//                  setVideos([]);
//                  setQuizzes([]);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchStudentData();
//     }, []); // Fetch once on mount

//      const handleStartQuiz = (quizId) => {
//         navigate(`/student/quiz/${quizId}`);
//          // TODO: Navigate to the quiz taking page, e.g., navigate(`/student/quiz/${quizId}`);
//      };


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
//             {/* Welcome Message */}
//             <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
//                 My Learning Materials {user ? `for ${user.plan?.toUpperCase()} Plan` : ''}
//             </h1>

//             {/* Course Materials (PDFs) Section */}
//             <section>
//                 <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
//                     <FontAwesomeIcon icon={faFilePdf} className="mr-2 text-red-600" />
//                     Course Materials (PDF)
//                 </h2>
//                 {pdfs.length > 0 ? (
//                     <ul className="space-y-3">
//                         {pdfs.map(pdf => (
//                             <li key={pdf._id} className="bg-white p-3 rounded shadow hover:shadow-md transition-shadow flex justify-between items-center">
//                                 <div>
//                                      <a
//                                         href={`http://localhost:5000/api/pdfs/download/${pdf.fileUrl}`}
//                                         target="_blank"
//                                         rel="noopener noreferrer"
//                                         className="text-indigo-700 hover:underline font-medium mr-4"
//                                         download={pdf.title ? `${pdf.title.replace(/[/\\?%*:|"<>]/g, '-')}.pdf` : 'download.pdf'} // Use title as filename (sanitize it)
//                                      >
//                                          {pdf.title || 'Untitled PDF'}
//                                      </a>
//                                      {/* Optional: Add date or other info */}
//                                      <p className="text-xs text-gray-500">Added: {new Date(pdf.createdAt).toLocaleDateString()}</p>
//                                 </div>
//                                 <div className='flex items-center gap-2'> {/* Group badge and potential download icon */}
//         {/* <AccessTypeBadge accessType={pdf.accessType} /> */}
//         {/* Optional: Add a download icon link as well */}
        
//         <a href={`http://localhost:5000${pdf.fileUrl}`}
//            download={pdf.title ? `${pdf.title.replace(/[/\\?%*:|"<>]/g, '-')}.pdf` : 'download.pdf'}
//            title="Download PDF"
//            className="text-gray-500 hover:text-indigo-600">
//            <FontAwesomeIcon icon={faDownload} /> 
//         </a>
       
//     </div>
//                                 <AccessTypeBadge accessType={pdf.accessType} />
//                             </li>
//                         ))}
//                     </ul>
//                 ) : (
//                     <p className="text-gray-500 italic">No PDF materials available for your plan.</p>
//                 )}
//             </section>

//             {/* Video Lessons Section */}
//             <section>
//                  <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
//                      <FontAwesomeIcon icon={faVideo} className="mr-2 text-blue-600" />
//                      Video Lessons
//                  </h2>
//                 {videos.length > 0 ? (
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         {videos.map(video => (
//                             <div key={video._id} className="bg-white p-4 rounded shadow hover:shadow-md transition-shadow">
//                                  <h3 className="font-semibold text-gray-800 mb-2">{video.title}</h3>
//                                  {/* Basic Video Player */}
//                                  <video width="100%" controls preload="metadata" className="rounded mb-2 max-h-60"> {/* Limit height */}
//                                      <source src={`http://localhost:5000${video.filePath}`} type="video/mp4" /> {/* Adjust type if needed */}
//                                      Your browser does not support the video tag.
//                                  </video>
//                                  <div className="flex justify-end">
//                                       <AccessTypeBadge accessType={video.accessType} />
//                                  </div>
//                             </div>
//                         ))}
//                     </div>
//                 ) : (
//                      <p className="text-gray-500 italic">No video lessons available for your plan.</p>
//                 )}
//             </section>

//             {/* Available Quizzes Section */}
//             <section>
//                  <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
//                       <FontAwesomeIcon icon={faEdit} className="mr-2 text-green-600" />
//                       Available Quizzes
//                  </h2>
//                 {quizzes.length > 0 ? (
//                     <ul className="space-y-3">
//                         {quizzes.map(quiz => (
//                             <li key={quiz._id} className="bg-white p-3 rounded shadow hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center">
//                                 <div className="mb-2 sm:mb-0">
//                                      <h3 className="font-semibold text-gray-800">{quiz.title}</h3>
//                                      {quiz.description && <p className="text-sm text-gray-600 mt-1">{quiz.description}</p>}
//                                      <div className="text-xs text-gray-500 mt-1 space-x-3">
//                                          <span>{quiz.questionCount} Questions</span>
//                                          {quiz.timeLimitMinutes && <span> | {quiz.timeLimitMinutes} min limit</span>}
//                                      </div>
//                                 </div>
//                                 <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
//                                       <AccessTypeBadge accessType={quiz.accessType} />
//                                       <button
//                                          onClick={() => handleStartQuiz(quiz._id)}
//                                          className="bg-indigo-600 text-white text-sm font-medium px-3 py-1 rounded hover:bg-indigo-700 transition-colors whitespace-nowrap"
//                                       >
//                                          Start Quiz
//                                       </button>
//                                 </div>
//                             </li>
//                         ))}
//                     </ul>
//                 ) : (
//                      <p className="text-gray-500 italic">No quizzes currently available for your plan.</p>
//                 )}
//             </section>

//         </div>
//     );
// }

// export default MyCourses;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faVideo, faSpinner, faExclamationTriangle, faDownload } from '@fortawesome/free-solid-svg-icons';
import { useUser } from '../context/UserContext';

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
    const { user } = useUser();

    useEffect(() => {
        const fetchStudentData = async () => {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('authToken');

            if (!token) {
                setError("Authentication required. Please log in.");
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get('http://localhost:5000/api/student/dashboard', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPdfs(response.data.pdfs || []);
                setVideos(response.data.videos || []);
            } catch (err) {
                console.error("Error fetching student data:", err);
                setError(err.response?.data?.message || "Failed to load data. Please try again.");
                setPdfs([]);
                setVideos([]);
            } finally {
                setLoading(false);
            }
        };

        fetchStudentData();
    }, []);

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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                My Learning Materials {user ? `for ${user.plan?.toUpperCase()} Plan` : ''}
            </h1>

            {/* PDF Materials Section */}
            <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
                    <FontAwesomeIcon icon={faFilePdf} className="mr-2 text-red-600" />
                    Course Materials (PDF)
                </h2>
                {pdfs.length > 0 ? (
                    <ul className="space-y-3">
                        {pdfs.map(pdf => (
                            <li key={pdf._id} className="bg-white p-3 rounded shadow hover:shadow-md transition-shadow flex justify-between items-center">
                                <div>
                                    <a
                                        href={`http://localhost:5000/api/pdfs/download/${pdf.fileUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-700 hover:underline font-medium mr-4"
                                        download={pdf.title ? `${pdf.title.replace(/[/\\?%*:|"<>]/g, '-')}.pdf` : 'download.pdf'}
                                    >
                                        {pdf.title || 'Untitled PDF'}
                                    </a>
                                    <p className="text-xs text-gray-500">Added: {new Date(pdf.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <a href={`http://localhost:5000${pdf.fileUrl}`}
                                       download={pdf.title ? `${pdf.title.replace(/[/\\?%*:|"<>]/g, '-')}.pdf` : 'download.pdf'}
                                       title="Download PDF"
                                       className="text-gray-500 hover:text-indigo-600">
                                       <FontAwesomeIcon icon={faDownload} /> 
                                    </a>
                                </div>
                                <AccessTypeBadge accessType={pdf.accessType} />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 italic">No PDF materials available for your plan.</p>
                )}
            </section>

            {/* Video Lessons Section */}
            <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
                    <FontAwesomeIcon icon={faVideo} className="mr-2 text-blue-600" />
                    Video Lessons
                </h2>
                {videos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {videos.map(video => (
                            <div key={video._id} className="bg-white p-4 rounded shadow hover:shadow-md transition-shadow">
                                <h3 className="font-semibold text-gray-800 mb-2">{video.title}</h3>
                                <video width="100%" controls preload="metadata" className="rounded mb-2 max-h-60">
                                    <source src={`http://localhost:5000${video.filePath}`} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                                <div className="flex justify-end">
                                    <AccessTypeBadge accessType={video.accessType} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 italic">No video lessons available for your plan.</p>
                )}
            </section>
        </div>
    );
}

export default MyCourses;