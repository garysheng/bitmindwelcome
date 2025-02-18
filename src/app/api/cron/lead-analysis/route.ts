import { NextResponse } from 'next/server';
import { runLeadAnalysisCron } from '@/lib/cron/leadAnalysis';

// Set max duration to 300 seconds (5 minutes)
export const maxDuration = 300;

export async function GET(request: Request) {
  try {
    // Verify cron secret to ensure this is a legitimate cron request
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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