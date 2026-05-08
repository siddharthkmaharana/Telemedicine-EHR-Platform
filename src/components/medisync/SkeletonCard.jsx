import React from 'react';

export function SkeletonLine({ width = 'full', height = '4' }) {
    return (
        <div className={`h-${height} w-${width} rounded-lg shimmer`}
            style={{ background: 'rgba(255,255,255,0.06)' }} />
    );
}

export default function SkeletonCard() {
    return (
        <div className="card-surface p-6 space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl shimmer" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <div className="space-y-2 flex-1">
                    <SkeletonLine width="1/2" />
                    <SkeletonLine width="1/4" height="3" />
                </div>
            </div>
            <SkeletonLine />
            <SkeletonLine width="3/4" />
        </div>
    );
}
