'use client';
import { useEffect, useRef, useState } from 'react';

type Msg = { role: 'user'|'assistant'; content: string; sources?: {title?:string;url:string}[]; image?:string };
const starters = ['Build a modern website with React','Explain a difficult topic simply','Research the latest technology trends','Help me debug my code'];
export default function Home() {
  const [messages,setMessages] = useState<Msg[]>([]);
  const [text,setText] = useState('');
  const [busy,setBusy] = useState(false);
  const [web,setWeb] = useState(false);
  const [imageMode,setImageMode] = useState(false);
  const [voice,setVoice] = useState(false);
  const [about,setAbout] = useState(false);
  const [mobileMenu,setMobileMenu] = useState(false);
  const [error,setError] = useState('');
  const [listening,setListening] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  useEffect(()=>{ try { const saved=localStorage.getItem('rex-chat'); if(saved) setMessages(JSON.parse(saved)); } catch {} },[]);
  useEffect(()=>{ try { localStorage.setItem('rex-chat',JSON.stringify(messages.slice(-60))); } catch {} bottom.current?.scrollIntoView({behavior:'smooth'}); },[messages]);
  async function send(value=text) {
    const prompt=value.trim(); if(!prompt||busy) return;
    setText(''); setError(''); const user:Msg={role:'user',content:prompt}; const next=[...messages,user]; setMessages(next); setBusy(true);
    try {
      if(imageMode) {
        const r=await fetch('/api/image',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt})}); const d=await r.json(); if(!r.ok) throw new Error(d.error||'Image generation failed');
        setMessages(m=>[...m,{role:'assistant',content:'Your image is ready.',image:d.image}]);
      } else {
        const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:next.map(({role,content})=>({role,content})),webSearch:web})}); const d=await r.json(); if(!r.ok) throw new Error(d.error||'Request failed');
        setMessages(m=>[...m,{role:'assistant',content:d.text,sources:d.sources||[]}]);
      }
    } catch(e:any) { setError(e.message||'Something went wrong.'); }
    finally {setBusy(false);setImageMode(false);input.current?.focus();}
  }
  function startVoice() {
    const W=window as any; const SR=W.SpeechRecognition||W.webkitSpeechRecognition;
    if(!SR){setError('Voice input is not supported in this browser. Try Chrome or Edge.');return;}
    const rec=new SR(); rec.lang='en-US'; rec.interimResults=false; rec.onresult=(e:any)=>{const heard=e.results[0][0].transcript;setText(heard);setListening(false);};rec.onerror=()=>setListening(false);rec.onend=()=>setListening(false);rec.start();setListening(true);
  }
  function speak(content:string) { if(!('speechSynthesis' in window)) return; window.speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(content);u.rate=1;window.speechSynthesis.speak(u); }
  function fresh(){setMessages([]);setError('');try{localStorage.removeItem('rex-chat')}catch{} }
  return <main className="shell">
    <aside className={`sidebar ${mobileMenu?'open':''}`}>
      <div className="brand"><div className="brand-mark">R</div><div><b>REX <span>AI</span></b><small>INTELLIGENCE, REIMAGINED</small></div><button className="close-menu" onClick={()=>setMobileMenu(false)}>×</button></div>
      <button className="new-chat" onClick={fresh}><span>＋</span> New conversation</button>
      <div className="side-label">WORKSPACE</div>
      <button className="side-link active" onClick={()=>setAbout(false)}><i>◈</i> Assistant</button>
      <button className="side-link" onClick={()=>{setImageMode(true);setAbout(false);input.current?.focus()}}><i>✧</i> Image studio</button>
      <button className="side-link" onClick={()=>setAbout(true)}><i>ⓘ</i> About REX</button>
      <div className="side-bottom"><div className="status-dot"/> <span>REX systems ready</span><small>WEB EDITION · 1.0</small></div>
    </aside>
    {mobileMenu&&<div className="scrim" onClick={()=>setMobileMenu(false)}/>}
    <section className="main-panel">
      <header className="topbar"><button className="hamburger" onClick={()=>setMobileMenu(true)}>☰</button><div className="crumb">REX AI <span>/</span> <b>{about?'About':'Workspace'}</b></div><div className="top-right"><span className="online"><i/> ONLINE</span><button className="avatar" onClick={()=>setAbout(true)}>R</button></div></header>
      {about ? <div className="about-page"><div className="eyebrow">THE MIND BEHIND THE INTERFACE</div><h1>Built with purpose.<br/><em>Designed for possibility.</em></h1><div className="profile-card"><img src="/developer.png" alt="Developer portrait"/><div><div className="eyebrow">DEVELOPER PROFILE</div><h2>Abishek Bhusal</h2><p className="role">Web &amp; App Developer · Nepal</p><p>Hello! I am <b>Abishek Bhusal</b>, a Web &amp; App Developer based in Nepal. I specialize in designing and engineering high-performance web applications, fluid mobile apps, and interactive user experiences.</p><p>My approach combines clean architecture with visually stunning frontend design. Whether crafting responsive user interfaces or integrating robust backend workflows, I prioritize speed, security, and exceptional UX.</p><a className="official" href="https://ab-dev-studio-prov4.vercel.app/" target="_blank" rel="noreferrer">Visit official website ↗</a></div></div><div className="credit">REX AI · Created by <b>KARAN BAHADUR BHUSAL D.</b></div></div> : <>
      <div className={`conversation ${messages.length?'has-messages':''}`}>
        {messages.length===0 ? <div className="welcome"><div className="orb-wrap"><div className="orb-halo"/><div className="orb"><div className="orb-core"/><div className="orb-ring ring-a"/><div className="orb-ring ring-b"/><div className="orb-glint"/></div></div><div className="eyebrow welcome-tag">YOUR INTELLIGENT COMPANION</div><h1>Think beyond<br/><em>the ordinary.</em></h1><p className="subtitle">Hello. I’m <b>REX</b> — ready to explore ideas, solve problems<br className="desktop-break"/> and turn your next big thought into reality.</p><div className="starter-grid">{starters.map(s=><button key={s} onClick={()=>send(s)}>{s}<span>↗</span></button>)}</div></div> : <div className="messages">{messages.map((m,i)=><article className={`message ${m.role}`} key={i}><div className="msg-icon">{m.role==='user'?'Y':'R'}</div><div className="msg-body"><div className="msg-name">{m.role==='user'?'YOU':'REX AI'}</div>{m.image?<img className="generated" src={m.image} alt="Generated artwork"/>:<div className="msg-text">{m.content}</div>}{m.sources?.length>0&&<div className="sources"><b>Sources</b>{m.sources.map((s,j)=><a key={j} href={s.url} target="_blank" rel="noreferrer">{s.title||s.url} ↗</a>)}</div>}{m.role==='assistant'&&<button className="speak" onClick={()=>speak(m.content)}>▶ Listen</button>}</div></article>)}{busy&&<div className="typing"><span/><span/><span/> REX is thinking</div>}<div ref={bottom}/></div>}
      </div>
      <div className="composer-area"><div className="mode-row"><button className={web?'mode on':''} onClick={()=>setWeb(!web)}>⌕ Web search {web&&<b>ON</b>}</button><button className={imageMode?'mode on':''} onClick={()=>setImageMode(!imageMode)}>✧ Create image</button><span className="mode-note">{imageMode?'IMAGE GENERATION MODE':web?'LIVE WEB SEARCH ENABLED':'AI ASSISTANT'}</span></div><div className="composer"><textarea ref={input} rows={1} value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}} placeholder={imageMode?'Describe the image you imagine…':'Message REX AI…'} /><button className={`mic ${listening?'listening':''}`} title="Voice input" onClick={startVoice}>⌁</button><button className="send" onClick={()=>send()} disabled={busy||!text.trim()} aria-label="Send message">↑</button></div><div className="disclaimer">REX can make mistakes. Verify important information. <span>·</span> Your chats stay in this browser.</div>{error&&<div className="error">{error}</div>}</div>
      </>}
      <footer><span>REX AI <b>●</b> BUILT FOR WHAT’S NEXT</span><a href="https://ab-dev-studio-prov4.vercel.app/" target="_blank" rel="noreferrer">AB DEV STUDIO ↗</a></footer>
    </section>
  </main>;
}
