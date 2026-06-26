import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-8 text-center font-sans">
      <h1 className="m-0 text-[8rem] leading-none font-extrabold text-slate-900">404</h1>
      <h2 className="mt-5 mb-2.5 text-3xl font-semibold text-slate-700">Page Not Found</h2>
      <p className="mb-10 max-w-lg text-lg text-slate-500">
        Oops! The page you are looking for doesn't exist, has been moved, or is temporarily
        unavailable.
      </p>
      <Link
        to="/"
        className="inline-block rounded-lg bg-blue-500 px-7 py-3.5 text-base font-semibold text-white no-underline shadow-md transition-transform duration-200 hover:scale-[1.02]"
      >
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFound;
