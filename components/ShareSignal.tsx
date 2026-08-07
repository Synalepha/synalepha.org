'use client';
import {useState} from 'react';
export function ShareSignal({title,text,url}:{title:string;text:string;url:string}){const [copied,setCopied]=useState(false);async function share(){if(navigator.share){await navigator.share({title,text,url});return}await navigator.clipboard.writeText(`${text} — ${url}`);setCopied(true);setTimeout(()=>setCopied(false),1600)}return <button type="button" onClick={share}>{copied?'Signal copied ✓':'Share this signal'}</button>}
