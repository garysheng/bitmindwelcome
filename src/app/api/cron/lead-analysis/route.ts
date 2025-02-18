import { NextResponse } from 'next/server';
import { runLeadAnalysisCron } from '@/lib/cron/leadAnalysis';

// Set max duration to 300 seconds (5 minutes)
export const maxDuration = 300;

export async function GET() {
  try {
    await runLeadAnalysisCron();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lead analysis cron error:', error);
    return NextResponse.json(
      { error: 'Failed to run lead analysis' },
      { status: 500 }
    );
  }
} 