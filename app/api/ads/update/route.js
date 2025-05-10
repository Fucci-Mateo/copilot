import { NextResponse } from 'next/server';
import { execute_transaction } from '@/lib/data';

export async function POST(req) {
  let query;
  try {
    const { action, percentage, ad_name_pattern, ad_name, budget } = await req.json();
    console.log('Received update request:', { action, percentage, ad_name_pattern, ad_name, budget });

    if (!action) {
      console.log('Missing action parameter');
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    switch (action) {
      case 'increase_budget':
        query = `
          UPDATE facebook_ads 
          SET budget = budget * 1.25
          WHERE ad_name ILIKE '%W03-25 | Statics | Ugly Ad%'
        `;
        console.log('Executing increase budget query:', query);
        break;
      case 'decrease_budget':
        query = `
          UPDATE facebook_ads 
          SET budget = budget * 0.75
          WHERE ad_name ILIKE '%TikTok Campaign: ROAS dropped 30% in last 3 days%'
        `;
        console.log('Executing decrease budget query:', query);
        break;
      case 'update_budget':
        if (!ad_name || budget === undefined) {
          console.log('Missing parameters for update_budget:', { ad_name, budget });
          return NextResponse.json({ error: 'Missing ad_name or budget' }, { status: 400 });
        }
        query = `
          UPDATE facebook_ads 
          SET budget = ${budget}
          WHERE ad_name = '${ad_name}'
        `;
        console.log('Executing direct budget update query:', query);
        break;
      default:
        console.log('Invalid action received:', action);
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    console.log('Executing transaction with query:', query);
    const result = await execute_transaction(query);
    console.log('Transaction result:', result);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error updating ads:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      query: query || 'Query not defined'
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 