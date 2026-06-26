export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#090b10]">
      <div className="space-y-4 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-brand-500/20 border-t-brand-500" />
        <p className="text-sm tracking-[0.18em] text-slate-300">LOADING NEXTGEN</p>
      </div>
    </div>
  );
}
