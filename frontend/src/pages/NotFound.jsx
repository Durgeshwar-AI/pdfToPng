import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center font-sans">
      <h1 className="text-[8rem] font-extrabold text-slate-900 m-0 leading-none">
        404
      </h1>
      <h2 className="text-3xl font-semibold text-slate-700 mt-5 mb-2.5">
        Page Not Found
      </h2>
      <p className="text-lg text-slate-500 mb-10 max-w-lg">
        Oops! The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
      </p>
      <Link
        to="/"
        className="inline-block px-7 py-3.5 bg-blue-500 text-white no-underline rounded-lg font-semibold text-base shadow-md transition-transform duration-200 hover:scale-[1.02]"
      >
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFound;