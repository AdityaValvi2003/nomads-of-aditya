'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const links = [['Journeys','/journeys'],['Blog','/blog'],['Dream Destinations','/dream-destinations'],['About Me','/about'],['Contact','/contact']];
export default function Header(){
 const [dark,setDark]=useState(true); const [open,setOpen]=useState(false); const [scrolled,setScrolled]=useState(false);
 useEffect(()=>{document.documentElement.dataset.theme=dark?'dark':'light';},[dark]);
 useEffect(()=>{const f=()=>setScrolled(window.scrollY>24); window.addEventListener('scroll',f); return()=>window.removeEventListener('scroll',f)},[]);
 return <header className={`site-header ${scrolled?'scrolled':''}`}><Link className="brand" href="/">NOMADS <span>OF ADITYA</span></Link><nav className="desktop-nav">{links.map(([l,h])=><Link key={h} href={h}>{l}</Link>)}<button aria-label="Toggle theme" onClick={()=>setDark(v=>!v)}>{dark?'☼':'☾'}</button></nav><button className="mobile-menu" onClick={()=>setOpen(v=>!v)} aria-label="Open menu">☰</button>{open&&<div className="mobile-panel">{links.map(([l,h])=><Link key={h} href={h} onClick={()=>setOpen(false)}>{l}</Link>)}<button onClick={()=>setDark(v=>!v)}>{dark?'Switch to Light':'Switch to Dark'}</button></div>}</header>
}
