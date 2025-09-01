import { Injectable } from '@nestjs/common';
import { Lead, LeadStatus, LeadSource } from '../entities/lead.entity';

export interface LeadScoringCriteria {
  source: LeadSource;
  estimatedValue?: number;
  daysInStatus: number;
  hasNotes: boolean;
}

@Injectable()
export class LeadScoringService {
  calculateScore(lead: Lead): number {
    let score = 0;

    // Base score by source
    score += this.getSourceScore(lead.source);

    // Value-based scoring
    if (lead.estimatedValue) {
      score += this.getValueScore(lead.estimatedValue);
    }

    // Time-based scoring (urgency)
    score += this.getTimeScore(lead.getDaysInCurrentStatus(), lead.status);

    // Activity-based scoring
    if (lead.notes && lead.notes.trim().length > 0) {
      score += 10; // Bonus for having notes/activity
    }

    return Math.min(100, Math.max(0, score)); // Cap between 0-100
  }

  private getSourceScore(source: LeadSource): number {
    const sourceScores: Record<LeadSource, number> = {
      [LeadSource.REFERRAL]: 40,
      [LeadSource.WEBSITE]: 30,
      [LeadSource.TRADE_SHOW]: 25,
      [LeadSource.EMAIL_CAMPAIGN]: 20,
      [LeadSource.SOCIAL_MEDIA]: 15,
      [LeadSource.COLD_CALL]: 10,
      [LeadSource.OTHER]: 5,
    };

    return sourceScores[source] || 0;
  }

  private getValueScore(estimatedValue: number): number {
    if (estimatedValue >= 100000) return 30;
    if (estimatedValue >= 50000) return 25;
    if (estimatedValue >= 25000) return 20;
    if (estimatedValue >= 10000) return 15;
    if (estimatedValue >= 5000) return 10;
    return 5;
  }

  private getTimeScore(daysInStatus: number, status: LeadStatus): number {
    // Penalize leads that have been stagnant too long
    if (status === LeadStatus.NEW && daysInStatus > 7) return -10;
    if (status === LeadStatus.CONTACTED && daysInStatus > 14) return -15;
    if (status === LeadStatus.QUALIFIED && daysInStatus > 30) return -20;

    // Bonus for recently active leads
    if (daysInStatus <= 1) return 10;
    if (daysInStatus <= 3) return 5;

    return 0;
  }

  getLeadPriority(score: number): 'high' | 'medium' | 'low' {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }
}
