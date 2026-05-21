export const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />
);

export const MatchSkeleton = () => (
    <div className="w-full max-w-[340px] h-[60vh] bg-white rounded-[2.5rem] p-8 flex flex-col gap-6 shadow-sm border border-slate-100">
        <Skeleton className="h-3/5 w-full rounded-2xl" />
        <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex justify-center gap-6">
            <Skeleton className="w-14 h-14 rounded-full" />
            <Skeleton className="w-14 h-14 rounded-full" />
        </div>
    </div>
);