import {NextRequest,NextResponse} from 'next/server';
import {z} from 'zod';
import {createServerClient} from '@supabase/ssr';

const sessionInput=z.object({access_token:z.string().min(20),refresh_token:z.string().min(20)});

export async function POST(request:NextRequest){
  const parsed=sessionInput.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({error:'Invalid session.'},{status:400});
  const response=NextResponse.json({ok:true});
  const supabase=createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies:{
        getAll:()=>request.cookies.getAll(),
        setAll(items){items.forEach(({name,value,options})=>response.cookies.set(name,value,options))}
      }
    }
  );
  const {data,error}=await supabase.auth.setSession(parsed.data);
  if(error||!data.user)return NextResponse.json({error:'This email link is invalid or expired.'},{status:401});
  return response;
}
