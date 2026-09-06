import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 font-black text-2xl flex items-center justify-center border border-amber-500/30 mb-4">
        404
      </div>
      <h1 className="text-2xl font-bold text-slate-100">Page Not Found</h1>
      <p className="text-slate-400 text-sm mt-2 max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/admin"
        className="mt-6 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-sm shadow-md transition-all"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}

