import { NextResponse } from 'next/server';
import { execute_select, execute_transaction } from '@/lib/data';

// GET: Fetch all ads with mock performance metrics
export async function GET() {
  try {
    const ads = await execute_select('SELECT ad_name, active, budget FROM ads');
    // Add mock performance metrics
    const adsWithMetrics = ads.map(ad => ({
      ...ad,
      spent: Math.floor(Math.random() * 1000) + 100, // mock spent
      revenue: Math.floor(Math.random() * 2000) + 200, // mock revenue
      roas: (Math.random() * 3).toFixed(2), // mock roas
      cpc: (Math.random() * 2).toFixed(2), // mock cpc
      ctr: (Math.random() * 5).toFixed(2), // mock ctr
    }));
    return NextResponse.json({ ads: adsWithMetrics });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Update ad status or budget
export async function PATCH(req) {
  try {
    const { ad_name, active, budget } = await req.json();
    if (typeof ad_name !== 'string') {
      return NextResponse.json({ error: 'ad_name is required' }, { status: 400 });
    }
    if (typeof active === 'boolean') {
      await execute_transaction('UPDATE ads SET active = $1 WHERE ad_name = $2', [active, ad_name]);
    }
    if (typeof budget === 'number') {
      await execute_transaction('UPDATE ads SET budget = $1 WHERE ad_name = $2', [budget, ad_name]);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 