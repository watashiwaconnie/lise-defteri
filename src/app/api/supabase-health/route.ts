import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Basit bir sorgu çalıştır - public şema üzerinde herhangi bir tablo
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      return NextResponse.json({ 
        status: 'error', 
        message: error.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      status: 'connected', 
      message: 'Supabase connection successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      message: error.message 
    }, { status: 500 });
  }
}