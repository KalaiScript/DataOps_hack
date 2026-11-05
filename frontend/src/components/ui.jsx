import React from 'react';

export function SeverityBadge({ severity }) {
  const s = (severity || 'low').toLowerCase();
  let badgeStyle = 'bg-blue-500/15 text-blue-400 border-blue-500/30';

  if (s.includes('crit')) {
    badgeStyle = 'bg-red-500/20 text-red-400 border-red-500/40 font-semibold';
  } else if (s.includes('high')) {
    badgeStyle = 'bg-orange-500/20 text-orange-400 border-orange-500/40 font-semibold';
  } else if (s.includes('med')) {
    badgeStyle = 'bg-amber-500/20 text-amber-400 border-amber-500/40';
  } else if (s.includes('verif') || s.includes('low') || s.includes('auth')) {
    badgeStyle = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border tracking-wide uppercase whitespace-nowrap shrink-0 ${badgeStyle}`}>
      {severity}
    </span>
  );
}

export function ConfidenceBadge({ confidence }) {
  const pct = Math.round((confidence > 1 ? confidence : confidence * 100));
  const color = pct >= 95 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
                pct >= 85 ? 'text-blue-400 bg-blue-500/10 border-blue-500/30' :
                'text-amber-400 bg-amber-500/10 border-amber-500/30';
  return (
    <span className={`inline-flex items-center text-[11px] px-2 py-0.5 rounded border font-mono font-medium whitespace-nowrap shrink-0 ${color}`}>
      {pct}% Conf.
    </span>
  );
}

export function RiskScore({ score }) {
  const val = typeof score === 'number' ? score : parseFloat(score) || 0;
  const color =
    val >= 8 ? 'text-red-400 bg-red-500/15 border-red-500/30' :
    val >= 6 ? 'text-orange-400 bg-orange-500/15 border-orange-500/30' :
    val >= 3 ? 'text-amber-400 bg-amber-500/15 border-amber-500/30' :
    'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold border whitespace-nowrap shrink-0 ${color}`}>
      {val.toFixed(1)} / 10
    </span>
  );
}

export function StatusBadge({ status }) {
  const s = (status || '').toLowerCase();
  let style = 'bg-gray-800 text-gray-300 border-gray-700';

  if (s.includes('comp') || s.includes('approved') || s.includes('verif')) {
    style = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  } else if (s.includes('flag') || s.includes('reject') || s.includes('fail')) {
    style = 'bg-red-500/15 text-red-400 border-red-500/30';
  } else if (s.includes('pend') || s.includes('review') || s.includes('held')) {
    style = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  } else if (s.includes('ingest') || s.includes('running')) {
    style = 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30 animate-pulse';
  }

  return (
    <span className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${style}`}>
      {status}
    </span>
  );
}

export function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-9 h-9 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs text-gray-400 uppercase tracking-widest font-mono">Running Forensic Pipeline...</span>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-gray-800 gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          {title}
        </h1>
        {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
