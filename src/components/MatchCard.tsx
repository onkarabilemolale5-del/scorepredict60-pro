import React, { useState } from 'react';
type M = { id:string; homeTeam:string; awayTeam:string; kickoff:string; status:string; score?:string; homeScore?:number; awayScore?:number; elapsed?:number; };
export default function MatchCard({match}:{match:M}){
const [manual,setManual]=useState<string|null>(null);
const kick=new Date(match.kickoff).getTime();
const mins=(Date.now()-kick)/60000;
const auto=match.status==='LIVE'&&mins>=130;
const eff=manual||(auto?'FT':match.status);
const live=eff==='LIVE';
const ft=eff==='FT';
return(
<div className="bg-gray-900 border border-gray-700 rounded-xl p-4 mb-3">
<div className="flex justify-between items-center mb-2">
<span className={live?'bg-red-500 px-3 py-1 rounded-full text-xs':'bg-gray-600 px-3 py-1 rounded-full text-xs'}>
{auto&&!manual?'FT (Auto)':eff} {match.elapsed?`${match.elapsed}'`:''}
</span>
{live&&(<button onClick={()=>setManual('FT')} className="bg-red-600 text-white text-xs px-3 py-1 rounded-full">Force FT</button>)}
</div>
<div className="flex justify-between">
<span>{match.homeTeam}</span>
<span className="font-bold text-green-400">{match.score||`${match.homeScore??0}-${match.awayScore??0}`}</span>
<span>{match.awayTeam}</span>
</div>
<div className="text-xs text-gray-500 mt-1">{Math.floor(mins)}m ago</div>
</div>
);}
