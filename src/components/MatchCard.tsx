import React from 'react';
import { MatchFixture, MatchPrediction } from '../types';

interface MatchCardProps {
  fixture: MatchFixture;
  prediction: MatchPrediction;
  index: number;
}

const MatchCard: React.FC<MatchCardProps> = ({ fixture, prediction, index }) => {
  const utcDate = new Date(fixture.utcDate);
  const gaboroneDate = new Date(utcDate.toLocaleString('en-US', { timeZone: 'Africa/Gaborone' }));
  
  const status = fixture.status || 'SCHEDULED';
  const liveMinute = (fixture as any).liveMinute;
  const currentScore = (fixture as any).currentScore;
  const goalsList = (fixture as any).goalsList as any[] | undefined;

  // FIX: Auto-force FT if match started > 3 hours ago
  const hoursSinceKickoff = (Date.now() - utcDate.getTime()) / (1000*60*60);
  const isActuallyLive = status === 'LIVE' && liveMinute && hoursSinceKickoff < 3;
  const isFinished = status === 'FT' || status === 'FINISHED' || hoursSinceKickoff >= 3 || (fixture as any).statusShort === 'FT';

  const getWonStatus = () => {
    if (!isFinished || !currentScore) return null;
    const home = currentScore.home ?? 0;
    const away = currentScore.away ?? 0;
    const pick = prediction.result1X2;
    const dc = prediction.doubleChance || '';
    if (dc === '1X') return home >= away;
    if (dc === 'X2') return away >= home;
    if (dc === '12') return home !== away;
    if (pick === '1') return home > away;
    if (pick === '2') return away > home;
    if (pick === 'X') return home === away;
    return false;
  };
  const isWon = getWonStatus();
