import { NextResponse } from 'next/server';
import { execute_select, execute_transaction, get_ads, update_ad_status } from '@/lib/data';

// GET: Fetch all ads with mock performance metrics
export async function GET() {
  try {
    console.log('Fetching ads');
    const ads = await get_ads();
    // Add mock performance metrics
    console.log(ads);
    console.log('Adding mock performance metrics');
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
    const { ad_name, active } = await req.json();
    if (typeof ad_name !== 'string') {
      return NextResponse.json({ error: 'ad_name is required' }, { status: 400 });
    }
    if (typeof active === 'boolean') {
      await update_ad_status(ad_name, active);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 