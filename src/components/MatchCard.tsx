import React from 'react';
import { MatchFixture, MatchPrediction } from '../types';

interface MatchCardProps { fixture: MatchFixture; prediction: MatchPrediction; index: number; }

const MatchCard: React.FC<MatchCardProps> = ({ fixture, prediction }) => {
  const utcDate = new Date(fixture.utcDate);
  const statusRaw = (fixture.status || 'SCHEDULED').toUpperCase();
  const liveMinute = (fixture as any).liveMinute as number | undefined;
  const currentScore = (fixture as any).currentScore as { home: number, away: number }|undefined;
  const goalsList = (fixture as any).goalsList as { player: string, minute: number }[]|undefined;

  // FIXED LIVE LOGIC - forces FT after 130 minutes
  const minutesSinceKickoff = (Date.now() - utcDate.getTime()) / 60000;
  const isLive = statusRaw === 'LIVE' && minutesSinceKickoff >= 0 && minutesSinceKickoff < 130 && !!liveMinute;
  const isFT = statusRaw === 'FT' || statusRaw === 'FINISHED' || statusRaw === 'AET' || statusRaw === 'PEN' || minutesSinceKickoff >= 130 || (fixture as any).statusShort === 'FT';

  const getResult = () => {
    if (!isFT || !currentScore) return null;
    const h=currentScore.home, a=currentScore.away;
    const pick=prediction.result1X2; const dc=prediction.doubleChance||'';
    let won=false;
    if(dc==='12') won=h!==a;
    else if(dc==='1X') won=h>=a; else if(dc==='X2') won=a>=h;
    else if(pick==='1') won=h>a; else if(pick==='2') won=a>h;
    else if(pick==='X') won=h===a;
    return won;
  };
  const won = getResult();

  const timeCAT = utcDate.toLocaleTimeString('en-GB',{timeZone:'Africa/Gaborone',hour:'2-digit',minute:'2-digit'});

  return (
    <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 text-white">
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-400">{timeCAT} CAT {isLive ? `• LIVE ${liveMinute}'` : isFT ? '• FT' : ''}</span>
        <span className={`text-xs px-2 py-1 rounded ${won===true ? 'bg-green-600' : won===false ? 'bg-red-600' : 'bg-slate-700'}`}>{won===true ? 'WON' : won===false ? 'LOST' : statusRaw}</span>
      </div>
      <div className="mt-2 flex justify-between">
        <span>{fixture.homeTeam}</span>
        <span>{currentScore ? `${currentScore.home}-${currentScore.away}` : 'vs'}</span>
        <span>{fixture.awayTeam}</span>
      </div>
      <div className="mt-2 text-xs text-slate-400">
        Pred: {prediction.result1X2} | {prediction.homeTeam} vs {prediction.awayTeam}
      </div>
    </div>
  );
};

export default MatchCard;
