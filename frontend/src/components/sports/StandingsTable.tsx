import React from 'react';
import Link from 'next/link';
import { StandingRow } from '../../types/sports';

export const StandingsTable: React.FC<{ standings: StandingRow[]; title?: string }> = ({
  standings,
  title = 'League Standings',
}) => {
  if (!standings || standings.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-gray-400">
        Standings telemetry currently updating from sports provider.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl glass-panel border border-slate-800">
      <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">{title}</h3>
        <span className="text-[11px] font-medium text-gray-400">2025-2026 Season</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-gray-400 font-semibold border-b border-slate-800 text-[11px]">
            <tr>
              <th className="px-4 py-2.5 w-10 text-center">#</th>
              <th className="px-4 py-2.5">Club</th>
              <th className="px-3 py-2.5 text-center">PL</th>
              <th className="px-3 py-2.5 text-center">W</th>
              <th className="px-3 py-2.5 text-center">D</th>
              <th className="px-3 py-2.5 text-center">L</th>
              <th className="px-3 py-2.5 text-center hidden sm:table-cell">GD</th>
              <th className="px-4 py-2.5 text-right font-bold text-cyan-400">PTS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {standings.map((row) => (
              <tr key={row.teamId} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-3 text-center font-bold text-gray-300">
                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 rounded-md text-[11px] ${
                      row.rank <= 4
                        ? 'bg-cyan-500/20 text-cyan-400 font-bold'
                        : 'text-gray-400'
                    }`}
                  >
                    {row.rank}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-white">
                  <Link href={`/teams/${row.teamId}`} className="flex items-center space-x-2.5 hover:text-cyan-400 transition-colors">
                    {row.badgeUrl && (
                      <img src={row.badgeUrl} alt={row.teamName} className="w-5 h-5 object-contain" />
                    )}
                    <span className="truncate max-w-[140px] sm:max-w-xs">{row.teamName}</span>
                  </Link>
                </td>
                <td className="px-3 py-3 text-center text-gray-300">{row.played}</td>
                <td className="px-3 py-3 text-center text-gray-300">{row.won}</td>
                <td className="px-3 py-3 text-center text-gray-300">{row.drawn}</td>
                <td className="px-3 py-3 text-center text-gray-300">{row.lost}</td>
                <td className="px-3 py-3 text-center text-gray-400 hidden sm:table-cell">
                  {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                </td>
                <td className="px-4 py-3 text-right font-black text-cyan-400">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
