import React from 'react';
import { MatchFixture, MatchPrediction } from '../types';

interface MatchCardProps { fixture: MatchFixture; prediction: MatchPrediction; index: number; }

const MatchCard: React.FC<MatchCardProps> = ({ fixture, prediction }) => {
  const utcDate = new Date(fixture.utcDate);
  const statusRaw = (fixture.status || 'SCHEDULED').toUpperCase();
  const hoursSince = (Date.now() - utcDate.getTime())/3600000;
  const liveMinute = (fixture as any).liveMinute as number | undefined;
  const currentScore = (fixture as any).currentScore as {home:number, away:number}|undefined;
  const goalsList = (fixture as any).goalsList as {team:string, player:string, minute:number}[]|undefined;

  // FIXED LIVE LOGIC
  const isLive = statusRaw === 'LIVE' && !!liveMinute && hoursSince < 3;
  const isFT = statusRaw === 'FT' || statusRaw === 'FINISHED' || hoursSince >= 3 || (fixture as any).statusShort === 'FT';

  const getResult = () => {
    if (!isFT || !currentScore) return null;
    const h=currentScore.home, a=currentScore.away;
    const pick=prediction.result1X2; const dc=prediction.doubleChance||'';
    let won=false;
    if(dc==='1X') won=h>=a; else if(dc==='X2') won=a>=h; else if(dc==='12') won=h!==a;
    else if(pick==='1') won=h>a; else if(pick==='2') won=a>h; else if(pick==='X') won=h===a;
    return won;
  };
  const won = getResult();
  
  const timeCAT = utcDate.toLocaleTimeString('en-GB',{timeZone:'Africa/Gaborone',hour:'2-digit',minute:'2-digit'});

  return (
    <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 text-white">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-slate-400">{timeCAT} CAT</span>
        {isLive && <span className="bg-red-600 px-2 py-0.5 rounded text-xs animate-pulse">LIVE {liveMinute}'</span>}
        {isFT && <span className="bg-slate-700 px-2 py-0.5 rounded text-xs">FT</span>}
        {isFT && won!==null && <span className={`px-2 py-0.5 rounded text-xs font-bold ${won?'bg-green-600':'bg-red-600'}`}>{won?'WON ✅':'LOST ❌'}</span>}
      </div>
      <div className="flex justify-between items-center">
        <span className="font-bold">{fixture.homeTeam}</span>
        <span className="font-mono text-xl">{currentScore ? `${currentScore.home} - ${currentScore.away}` : '- : -'}</span>
        <span className="font-bold">{fixture.awayTeam}</span>
      </div>
      {isLive && goalsList && goalsList.length>0 && (
        <div className="mt-2 text-xs text-slate-300">{goalsList.map((g,i)=><div key={i}>{g.player} {g.minute}' ({g.team})</div>)}</div>
      )}
      {!isLive && !isFT && <div className="mt-2 text-xs">Prediction: {prediction.result1X2} {prediction.doubleChance?`(${prediction.doubleChance})`:''} - {prediction.confidence}%</div>}
      {isFT && !currentScore && <div className="mt-2 text-xs text-yellow-400">Final score loading...</div>}
    </div>
  );
};
export default MatchCard;
