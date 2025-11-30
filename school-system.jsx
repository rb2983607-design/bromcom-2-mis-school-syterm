import React, { useState } from 'react';
import Draggable from 'react-draggable';

// Get base URL from Vite for proper asset paths
const BASE_URL = import.meta.env.BASE_URL || '/';

// Small reusable section title so each page can have a distinct look
function SectionTitle({ title, subtitle, color }) {
  return (
    <div className="mb-4">
      <h2 className="section-title" style={{ color: color || undefined }}>{title}</h2>
      {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
    </div>
  );
}

// ========================================
// SECTION 1: FAKE DATABASE
// ========================================
const accountsDB = [
  { email: 'student@school.com', password: 'student123', role: 'Student', name: 'Ayaan Khan', group: 'Group 4' },
  { email: 'teacher@school.com', password: 'teacher123', role: 'Staff', name: 'Mrs. Smith', group: 'Group 5' },
  { email: 'admin@school.com', password: 'admin123', role: 'Admin', name: 'Mr. Admin', group: 'Admin' },
  { email: 'parent@school.com', password: 'parent123', role: 'Parent', name: 'Parent Khan', child: 'Ayaan Khan', group: 'Group 4' }
];

const studentsData = [
  { name: 'Ayaan Khan', attendance: Array(30).fill(true), behaviourLog: [1,4,2,3,4], points: 10, group: 'Group 4' },
  { name: 'Liam Patel', attendance: Array(30).fill(true), behaviourLog: [4,4,3,2,4], points: 5, group: 'Group 4' },
  { name: 'Zara Malik', attendance: Array(30).fill(true), behaviourLog: [3,2,1,2,2], points: 12, group: 'Group 4' },
  { name: 'Noah Williams', attendance: Array(30).fill(true), behaviourLog: [4,1,2,3,4], points: 3, group: 'Group 5' }
];

// ========================================
// BEHAVIOUR RATING SCALE
// ========================================
const behaviourScale = {
  1: 'Excellent',
  2: 'Good',
  3: 'Disruptive',
  4: 'Poor',
  5: 'Physical Conflict'
};

// ========================================
// SECTION 2: AUTHENTICATION
// ========================================
function AuthScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (schoolCode !== '15586') return setError('Invalid School Code');
    const user = accountsDB.find(u => u.email === email && u.password === password);
    if(user) onLogin(user);
    else setError('Invalid Email or Password');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-4">Login</h2>
        <input type="text" placeholder="School Code" value={schoolCode}
          onChange={e=>setSchoolCode(e.target.value)} 
          className="w-full p-2 mb-2 border rounded"/>
        <input type="email" placeholder="Email" value={email}
          onChange={e=>setEmail(e.target.value)} 
          className="w-full p-2 mb-2 border rounded"/>
        <input type="password" placeholder="Password" value={password}
          onChange={e=>setPassword(e.target.value)} 
          className="w-full p-2 mb-2 border rounded"/>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <button onClick={handleLogin} className="w-full bg-[#005EB8] text-white p-2 rounded hover:bg-[#004C9A]">Login</button>
      </div>
    </div>
  );
}

// ========================================
// SECTION 3: HEADER
// ========================================
function SchoolHeader({ user, school, onLogout }) {
  const [paMessage, setPaMessage] = useState('');
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [alarmAudio, setAlarmAudio] = useState(null);
  const [alarmActive, setAlarmActive] = useState(false);
  const [volume, setVolume] = useState(1);
  const [confirm, setConfirm] = useState(null); // {type, message}
  const [recording, setRecording] = useState(false);
  const [voiceBlob, setVoiceBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  React.useEffect(() => {
    const load = () => {
      const v = window.speechSynthesis.getVoices() || [];
      setVoices(v);
      if (v.length && !selectedVoice) setSelectedVoice(v[0].name);
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const playAudioHeader = (file, { loop=false, volume=1 } = {}) => {
    try {
      const a = new Audio(file);
      a.loop = loop; a.volume = (typeof volume === 'number' ? volume : 1); a.play();
      if (loop) { setAlarmAudio(a); setAlarmActive(true); }
      return a;
    } catch(e){ console.error(e); return null; }
  };

  const stopAlarmHeader = () => {
    if (alarmAudio) { try{ alarmAudio.pause(); alarmAudio.currentTime = 0; }catch(e){} setAlarmAudio(null); setAlarmActive(false); }
  };

  const broadcastHeader = () => {
    if (!paMessage) return;
    if (!('speechSynthesis' in window)) { alert('Speech Synthesis not available'); return; }
    const u = new SpeechSynthesisUtterance(paMessage);
    if (voices.length && selectedVoice) {
      const v = voices.find(x=>x.name===selectedVoice);
      if (v) u.voice = v;
    }
    u.rate = 1; u.pitch = 1; u.volume = 1;
    // If voice message was recorded, play TTS first then voice
    if (voiceBlob) {
      u.onend = () => {
        const audio = new Audio(URL.createObjectURL(voiceBlob));
        audio.volume = volume;
        audio.play();
      };
    }
    speechSynthesis.speak(u);
    setPaMessage('');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setVoiceBlob(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (e) {
      alert('Microphone access denied: ' + e.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const clearVoiceMessage = () => {
    setVoiceBlob(null);
  };

  const triggerHeaderPreset = (type, skipConfirm=false) => {
    if (type === 'general') {
      const msg = 'Attention please. This is a general announcement.';
      const u = new SpeechSynthesisUtterance(msg);
      speechSynthesis.speak(u);
      return;
    }
    if (type === 'lockdown') {
      if (!skipConfirm) { setConfirm({ type: 'lockdown', message: 'Trigger LOCKDOWN alarm and announcement? This will loop loud audio.' }); return; }
      const msg = 'LOCKDOWN: Please follow the lockdown procedure now.';
      speechSynthesis.speak(new SpeechSynthesisUtterance(msg));
      playAudioHeader(`${BASE_URL}sounds/lockdown.mp3`, { loop:true, volume: volume });
      return;
    }
    if (type === 'fire') {
      if (!skipConfirm) { setConfirm({ type: 'fire', message: 'Trigger FIRE alarm and announcement? This will loop loud audio.' }); return; }
      speechSynthesis.speak(new SpeechSynthesisUtterance('FIRE ALARM. Evacuate immediately.'));
      playAudioHeader(`${BASE_URL}sounds/firealarm.mp3`, { loop:true, volume: volume });
      return;
    }
    if (type === 'bell') {
      for (let i=0;i<3;i++) setTimeout(()=>playAudioHeader(`${BASE_URL}sounds/bell.mp3`, { volume: volume }), i*800);
      return;
    }
  };

  return (
    <div className="app-header">
      <div style={{display:'flex', alignItems:'center', gap:16, flex:1}}>
        <img src={`${BASE_URL}logo.svg`} alt="Bromcom logo" onError={(e)=>{e.target.style.display='none'}} style={{height:44, width:44, borderRadius:8}} />
        <div>
          <div className="title">{school}</div>
          <div className="sub">{user.role} {user.group ? `- ${user.group}` : ''}</div>
        </div>
      </div>

      <div style={{display:'flex', alignItems:'center', gap:12, flex:2, justifyContent:'flex-end'}}>
        <div style={{display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.06)', padding:'6px 12px', borderRadius:8, border:'1px solid rgba(255,255,255,0.12)'}}>
          <input value={paMessage} onChange={e=>setPaMessage(e.target.value)} placeholder="PA message" style={{padding:'6px 8px', borderRadius:6, border:'1px solid rgba(255,255,255,0.15)', width:200, background:'rgba(255,255,255,0.06)', color:'white', fontSize:'0.875rem'}} />
          <select value={selectedVoice} onChange={e=>setSelectedVoice(e.target.value)} style={{padding:'6px 8px', borderRadius:6, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', color:'white', fontSize:'0.875rem'}}>
            {voices.length === 0 && <option>Loading voices...</option>}
            {voices.map(v=> <option key={v.name} value={v.name}>{v.name}</option>)}
          </select>
          <button onClick={broadcastHeader} className="btn btn-primary" style={{padding:'6px 10px', fontSize:'0.8125rem'}}>Speak</button>
          <button onClick={recording ? stopRecording : startRecording} className={`btn ${recording ? 'btn-danger' : 'btn-ghost'}`} style={{padding:'6px 10px', fontSize:'0.8125rem'}}>
            {recording ? '⏹' : '🎤'}
          </button>
          {voiceBlob && <button onClick={clearVoiceMessage} className="btn btn-ghost" title="Clear voice message" style={{padding:'6px 8px', fontSize:'0.75rem'}}>✕</button>}
          {voiceBlob && <span className="muted" style={{fontSize:11}}>🎙️</span>}
        </div>

        <div style={{display:'flex', gap:6, alignItems:'center'}}>
          <button onClick={()=>triggerHeaderPreset('general')} className="btn btn-ghost" style={{padding:'6px 10px', fontSize:'0.8125rem'}}>General</button>
          <button onClick={()=>triggerHeaderPreset('lockdown')} className="btn btn-danger" style={{padding:'6px 10px', fontSize:'0.8125rem'}}>Lockdown</button>
          <button onClick={()=>triggerHeaderPreset('fire')} className="btn btn-danger" style={{padding:'6px 10px', fontSize:'0.8125rem'}}>Fire</button>
          <button onClick={()=>triggerHeaderPreset('bell')} className="btn btn-ghost" style={{padding:'6px 10px', fontSize:'0.8125rem'}}>Bell</button>
          <button onClick={stopAlarmHeader} className="btn btn-ghost" style={{padding:'6px 10px', fontSize:'0.8125rem'}}>Stop</button>
        </div>

        <div style={{display:'flex', alignItems:'center', gap:6, paddingLeft:12, borderLeft:'1px solid rgba(255,255,255,0.15)'}}>
          <label className="muted" style={{fontSize:'0.8125rem', fontWeight:500}}>Vol</label>
          <input type="range" min="0" max="1" step="0.01" value={volume} onChange={e=>setVolume(parseFloat(e.target.value))} style={{width:60}} />
        </div>

        <div className="user-pill">
          <div style={{width:32, height:32, borderRadius:999, background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.875rem'}}>{(user.name||'U').split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
          <div style={{fontSize:'0.8125rem', fontWeight:600}}>{user.name}</div>
        </div>
        <button onClick={onLogout} className="btn btn-ghost" style={{padding:'6px 12px', fontSize:'0.8125rem'}}>Logout</button>
      </div>
    {confirm && (
      <div style={{position:'fixed', left:0, top:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999}}>
        <div className="card" style={{maxWidth:480, background:'white'}}>
          <h3 style={{margin:'0 0 0.5rem 0', fontSize:'1.125rem', fontWeight:700, color:'var(--bromcom-dark)'}}>Confirm Action</h3>
          <p style={{margin:'0 0 1rem 0', color:'var(--gray-600)', fontSize:'0.9375rem'}}>{confirm.message}</p>
          <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
            <button onClick={()=>setConfirm(null)} className="btn btn-ghost">Cancel</button>
            <button onClick={()=>{ triggerHeaderPreset(confirm.type, true); setConfirm(null); }} className="btn btn-danger">Confirm</button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
 }// ========================================
// SECTION 4: SIDEBAR NAVIGATION
// ========================================
function Sidebar({ currentPage, setCurrentPage }) {
  const links = ['Dashboard', 'Attendance', 'Behaviour', 'Modules', 'Staff', 'Teachers', 'Parents', 'Admin'];
  const icons = {
    Dashboard: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 13h8V3H3v10zM13 21h8V11h-8v10zM13 3v6h8V3h-8zM3 21h8v-6H3v6z" fill="currentColor"/></svg>),
    Attendance: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 11h5v5H7zM3 5h18v16H3zM8 1v4" stroke="currentColor" strokeWidth="0"/></svg>),
    Behaviour: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5" fill="currentColor"/></svg>),
    Modules: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" fill="currentColor"/></svg>),
    Staff: (<svg width="18" height="18" viewBox="0 0 24 24"><path d="M16 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM8 11c1.657 0 3-1.343 3-3S9.657 5 8 5 5 6.343 5 8s1.343 3 3 3zM2 20c0-2.667 4-4 6-4s6 1.333 6 4v1H2v-1z" fill="currentColor"/></svg>),
    Teachers: (<svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 2l4 4-4 4-4-4 4-4zm0 10c4 0 8 2 8 6v2H4v-2c0-4 4-6 8-6z" fill="currentColor"/></svg>),
    Parents: (<svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zM4 20v-1a4 4 0 014-4h8a4 4 0 014 4v1H4z" fill="currentColor"/></svg>),
    Admin: (<svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 8a4 4 0 100 8 4 4 0 000-8zm9.4 4a7.9 7.9 0 01-.1 1l2.1 1.6-2 3.4-2.5-.5a8 8 0 01-1.5 1.2l-.4 2.6h-4l-.4-2.6a8 8 0 01-1.5-1.2L4.6 18l-2-3.4L4.7 13A7.9 7.9 0 014.6 12 8 8 0 0112 4a8 8 0 019.4 8z" fill="currentColor"/></svg>)
  };

  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`app-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="brand" style={{display:'flex', alignItems:'center', gap:12}}>
        <img src={`${BASE_URL}logo.svg`} alt="logo" onError={(e)=>{e.target.style.display='none'}} style={{height:40, width:40}} />
        {!collapsed && (
          <div>
            <div style={{fontWeight:800, fontSize:'1rem', letterSpacing:'-0.5px'}}>Bromcom</div>
            <div style={{fontSize:'0.75rem', opacity:0.85, fontWeight:500}}>School MIS</div>
          </div>
        )}
      </div>
      <div style={{flex:1, marginTop:8}}>
        {links.map(link => (
          <button key={link} onClick={() => setCurrentPage(link)}
            title={link}
            className={`nav-button ${currentPage===link? 'active':''}`}
            style={{display:'flex', alignItems:'center', gap:10, fontSize:collapsed ? '0.75rem' : '0.9375rem'}}>
            <span style={{display:'inline-flex', width:20, height:20, justifyContent:'center', alignItems:'center', flexShrink:0}}>{icons[link]}</span>
            {!collapsed && <span>{link}</span>}
          </button>
        ))}
      </div>

      <div style={{padding:8, borderTop:'1px solid rgba(255,255,255,0.08)'}}>
        <button onClick={()=>setCollapsed(s=>!s)} className="nav-button" style={{width:'100%', fontSize:'0.8125rem', justifyContent:'center', gap:6}}>
          {collapsed ? '»' : '«'} 
          {!collapsed && 'Collapse'}
        </button>
      </div>
    </div>
  );
}

// ========================================
// SECTION 5: PAGE - DASHBOARD
// ========================================
function Dashboard() {
  return (
    <div className="space-y-4">
      <SectionTitle title="Dashboard" color="#003F87" />
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">Attendance Overview</div>
        <div className="bg-white p-4 rounded shadow">Behaviour Points</div>
        <div className="bg-white p-4 rounded shadow">Upcoming Events</div>
        <div className="bg-white p-4 rounded shadow">Recent Alerts</div>
      </div>
    </div>
  );
}

// ========================================
// SECTION 6: PAGE - BEHAVIOUR
// ========================================
function Behaviour() {
  const getBehaviourDescription = (scores) => {
    return scores.map(s => behaviourScale[s]).join(', ');
  };

  const hasDetention = (behaviourLog) => {
    return behaviourLog.filter(b => b === 4).length >= 2;
  };

  return (
    <div>
      <SectionTitle title="Behaviour & Detention System" subtitle="Track behaviour ratings and detention triggers" color="#003F87" />
      <p className="text-sm text-gray-600 mb-3"><strong>Scale:</strong> 1 = Excellent | 2 = Good | 3 = Disruptive | 4 = Poor | 5 = Physical Conflict</p>
      <p className="text-sm text-red-600 mb-3"><strong>Detention Trigger:</strong> 2 or more ratings of 4 (Poor)</p>
      <table className="w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Student</th>
            <th className="p-2 border">Behaviour Ratings</th>
            <th className="p-2 border">Behaviour Description</th>
            <th className="p-2 border">Poor Count</th>
            <th className="p-2 border">Detention</th>
            <th className="p-2 border">Attendance %</th>
          </tr>
        </thead>
        <tbody>
          {studentsData.map(s => {
            const detention = hasDetention(s.behaviourLog);
            const poorCount = s.behaviourLog.filter(b => b === 4).length;
            const attendancePercent = Math.round((s.attendance.filter(a => a).length / s.attendance.length) * 100);
            return (
              <tr key={s.name} className={detention ? 'bg-gray-100' : ''}>
                <td className="p-2 border">{s.name}</td>
                <td className={`p-2 border ${detention ? 'bg-red-400 text-white font-bold' : ''}`}>{s.behaviourLog.join(', ')}</td>
                <td className={`p-2 border text-xs ${detention ? 'bg-red-400 text-white font-bold' : ''}`}>{getBehaviourDescription(s.behaviourLog)}</td>
                <td className={`p-2 border text-center font-bold ${detention ? 'bg-red-400 text-white' : ''}`}>{poorCount}</td>
                <td className={`p-2 border text-center font-bold ${detention ? 'bg-red-500 text-white' : ''}`}>{detention ? '✓ YES' : 'No'}</td>
                <td className={`p-2 border text-center ${detention ? 'bg-red-400 text-white font-bold' : ''}`}>{attendancePercent}%</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  );
}

// ========================================
// SECTION 7: PAGE - MODULES (SEATING & PA)
// ========================================
function Modules() {
  const [positions, setPositions] = useState(studentsData.map(()=>({x:0,y:0})));
  const [paMessage, setPaMessage] = useState('');
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [alarmAudio, setAlarmAudio] = useState(null);
  const [detentionTriggered, setDetentionTriggered] = useState({});

  const handleStop = (idx, e, d) => {
    const newPos = [...positions];
    newPos[idx] = {x:d.x, y:d.y};
    setPositions(newPos);
  };

  const [currentAnnouncement, setCurrentAnnouncement] = useState('');
  const [alarmActive, setAlarmActive] = useState(false);

  const playAudio = (file, { loop=false, volume=1 } = {}) => { 
    try {
      const audio = new Audio(file);
      audio.volume = volume;
      audio.loop = loop;
      audio.play();
      if (loop) {
        setAlarmAudio(audio);
        setAlarmActive(true);
      }
      return audio;
    } catch (err) {
      console.error('Error playing audio', err);
      return null;
    }
  };

  const stopAlarm = () => {
    if (alarmAudio) {
      try { alarmAudio.pause(); alarmAudio.currentTime = 0; } catch(e){}
      setAlarmAudio(null);
      setAlarmActive(false);
      setCurrentAnnouncement('');
    }
  };

  const broadcastPA = () => { 
    if(!paMessage) return; 
    if (!('speechSynthesis' in window)) {
      alert('Speech Synthesis not supported in this browser');
      return;
    }
    const utter = new SpeechSynthesisUtterance(paMessage);
    if (voices && voices.length && selectedVoice) {
      const v = voices.find(voice => voice.name === selectedVoice);
      if (v) utter.voice = v;
    }
    utter.rate = rate || 1;
    utter.pitch = pitch || 1;
    utter.volume = 1;
    setCurrentAnnouncement(paMessage);
    utter.onend = () => { setCurrentAnnouncement(''); };
    speechSynthesis.speak(utter);
    setPaMessage(''); 
  };

  const triggerPreset = (type) => {
    if (!('speechSynthesis' in window) && (type === 'general' || type === 'lockdown')) {
      alert('Speech Synthesis not supported in this browser');
      return;
    }

    if (type === 'general') {
      const msg = 'Attention please. This is a general announcement. Please listen for further instructions.';
      const utt = new SpeechSynthesisUtterance(msg);
      if (voices && voices.length && selectedVoice) {
        const v = voices.find(voice => voice.name === selectedVoice);
        if (v) utt.voice = v;
      }
      utt.rate = rate;
      utt.pitch = pitch;
      utt.volume = 1;
      setCurrentAnnouncement(msg);
      utt.onend = () => setCurrentAnnouncement('');
      speechSynthesis.speak(utt);
      return;
    }

    if (type === 'lockdown') {
      const msg = 'LOCKDOWN: This is an important safety announcement. All students and staff must move to a safe location immediately and follow the lockdown procedure.';
      const utt = new SpeechSynthesisUtterance(msg);
      if (voices && voices.length && selectedVoice) {
        const v = voices.find(voice => voice.name === selectedVoice);
        if (v) utt.voice = v;
      }
      utt.rate = Math.max(0.9, rate - 0.1);
      utt.pitch = Math.max(0.8, pitch - 0.2);
      utt.volume = 1;
      setCurrentAnnouncement(msg);
      utt.onend = () => setCurrentAnnouncement('');
      speechSynthesis.speak(utt);
      playAudio(`${BASE_URL}sounds/lockdown.mp3`, { loop: true, volume: 1 });
      return;
    }

    if (type === 'fire') {
      stopAlarm();
      setCurrentAnnouncement('FIRE ALARM - Please evacuate immediately');
      playAudio(`${BASE_URL}sounds/firealarm.mp3`, { loop: true, volume: 1 });
      return;
    }

    if (type === 'bell') {
      const msg = 'School bell.';
      setCurrentAnnouncement('School Bell (3x)');
      for (let i=0;i<3;i++) {
        setTimeout(()=>playAudio(`${BASE_URL}sounds/bell.mp3`, { volume: 1 }), i*1000);
      }
      setTimeout(()=>setCurrentAnnouncement(''), 3500);
      return;
    }
  };

  React.useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices() || [];
      setVoices(v);
      if (v.length && !selectedVoice) setSelectedVoice(v[0].name);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  // Check for detention triggers and announce automatically
  const checkDetentionTriggers = () => {
    const newTriggered = {};
    studentsData.forEach((student, idx) => {
      const hasDetention = student.behaviourLog.filter(b => b === 4).length >= 2;
      const wasTriggered = detentionTriggered[idx];
      
      if (hasDetention && !wasTriggered) {
        // Detention just triggered - announce it
        newTriggered[idx] = true;
        const announcement = `DETENTION ALERT: ${student.name} has triggered detention system. 2 or more poor behaviour ratings recorded. Attendance and behaviour records flagged.`;
        const utter = new SpeechSynthesisUtterance(announcement);
        utter.rate = 0.9;
        utter.volume = 1;
        speechSynthesis.speak(utter);
      } else if (hasDetention) {
        newTriggered[idx] = true;
      }
    });
    setDetentionTriggered(newTriggered);
  };

  // Auto-check detention on component load
  React.useEffect(() => {
    checkDetentionTriggers();
  }, []);

  return (
    <div className="space-y-6">
      {currentAnnouncement && (
        <div className={`p-3 rounded ${alarmActive ? 'bg-red-700 text-white' : 'bg-indigo-600 text-white'}`}>
          <strong>{alarmActive ? 'ALARM ACTIVE:' : 'ANNOUNCEMENT:'}</strong> {currentAnnouncement}
        </div>
      )}
      {Object.keys(detentionTriggered).length > 0 && (
        <div className="bg-red-600 text-white p-4 rounded-lg shadow-lg border-2 border-red-800">
          <h3 className="text-lg font-bold">🚨 DETENTION ALERT - AUTO TRIGGERED</h3>
          <div className="mt-2">
            {studentsData.map((s, idx) => detentionTriggered[idx] && (
              <div key={s.name} className="text-sm mt-1">
                <strong>{s.name}</strong> - {s.behaviourLog.filter(b => b === 4).length} Poor ratings | 
                Attendance: {Math.round((s.attendance.filter(a => a).length / s.attendance.length) * 100)}%
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="bg-white p-4 rounded shadow">
        <SectionTitle title="Seating Plan" subtitle="Drag students to arrange seating" color="#003F87" />
        <p className="text-sm text-gray-600 mb-2"><span style={{color: 'rgb(239, 68, 68)'}}>🔴 Red = Detention Triggered</span> | <span style={{color: 'rgb(34, 197, 94)'}}>🟢 Green = Good Behaviour</span></p>
        <div className="relative w-full h-80 border border-gray-300 rounded bg-gray-50">
          {studentsData.map((s,idx)=>{
            const hasDetention = s.behaviourLog.filter(b => b === 4).length >= 2;
            const poorCount = s.behaviourLog.filter(b => b === 4).length;
            const attendancePercent = Math.round((s.attendance.filter(a => a).length / s.attendance.length) * 100);
            return (
              <Draggable key={idx} position={positions[idx]} onStop={(e,d)=>handleStop(idx,e,d)}>
                <div className={`absolute p-3 rounded shadow cursor-pointer text-center text-sm font-semibold w-32 ${
                  hasDetention ? 'bg-red-500 text-white border-2 border-red-700' : 'bg-green-300 text-gray-800 border-2 border-green-600'
                }`}>
                  <div className="font-bold">{s.name}</div>
                  <div className="text-xs mt-1">📊 Attendance: {attendancePercent}%</div>
                  <div className="text-xs">⚠️ Poor Ratings: {poorCount}x</div>
                  {hasDetention && <div className="text-xs mt-1 bg-red-700 px-1 rounded">🔴 DETENTION</div>}
                </div>
              </Draggable>
            )
          })}
        </div>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <SectionTitle title="PA System" subtitle="Type a message and press Enter to speak" color="#003F87" />
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <select value={selectedVoice} onChange={e=>setSelectedVoice(e.target.value)} className="border p-2 rounded">
              {voices.length === 0 && <option>Loading voices...</option>}
              {voices.map(v => (
                <option key={v.name} value={v.name}>{v.name} {v.lang ? `(${v.lang})` : ''}</option>
              ))}
            </select>
            <div className="text-sm">Rate
              <input type="range" min="0.5" max="2" step="0.1" value={rate} onChange={e=>setRate(parseFloat(e.target.value))} className="ml-2"/>
            </div>
            <div className="text-sm">Pitch
              <input type="range" min="0" max="2" step="0.1" value={pitch} onChange={e=>setPitch(parseFloat(e.target.value))} className="ml-2"/>
            </div>
          </div>
          <div className="flex space-x-2">
            <input type="text" value={paMessage} onChange={e=>setPaMessage(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') broadcastPA(); }}
              placeholder="Type message and press Enter (or click Broadcast)" className="border p-2 rounded flex-1"/>
            <button onClick={broadcastPA} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Broadcast</button>
          </div>
          <div className="flex items-center space-x-2 mt-3">
            <button onClick={()=>triggerPreset('general')} className="bg-indigo-600 text-white px-3 py-2 rounded">General</button>
            <button onClick={()=>triggerPreset('lockdown')} className="bg-red-700 text-white px-3 py-2 rounded">Lockdown</button>
            <button onClick={()=>triggerPreset('fire')} className="bg-red-600 text-white px-3 py-2 rounded">Fire Alarm</button>
            <button onClick={()=>triggerPreset('bell')} className="bg-yellow-400 text-black px-3 py-2 rounded">School Bell (3x)</button>
            <button onClick={stopAlarm} className="bg-gray-300 text-black px-3 py-2 rounded">Stop Alarm</button>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded shadow flex space-x-2">
        <button onClick={()=>playAudio(`${BASE_URL}sounds/pa.mp3`)} className="bg-blue-600 text-white px-4 py-2 rounded">Trigger PA</button>
        <button onClick={()=>playAudio(`${BASE_URL}sounds/firealarm.mp3`)} className="bg-red-600 text-white px-4 py-2 rounded">Fire Alarm</button>
        <button onClick={()=>playAudio(`${BASE_URL}sounds/lockdown.mp3`)} className="bg-gray-800 text-white px-4 py-2 rounded">Lockdown</button>
        <button onClick={()=>{for(let i=0;i<3;i++){setTimeout(()=>playAudio(`${BASE_URL}sounds/bell.mp3`),i*1000)}}} className="bg-yellow-400 text-black px-4 py-2 rounded">School Bell (3x)</button>
      </div>
    </div>
  );
}

// ========================================
// SECTION 8: PAGE - TIMETABLE
// ========================================
function Timetable() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Timetable</h2>
      <div className="grid grid-cols-5 gap-2">
        {['Mon','Tue','Wed','Thu','Fri'].map(day=><div key={day} className="bg-white p-4 rounded shadow">{day}</div>)}
      </div>
    </div>
  );
}

// ========================================
// SECTION 8A: PAGE - ATTENDANCE
// ========================================
function Attendance() {
  const [attendanceState, setAttendanceState] = React.useState(() => {
    try {
      const raw = localStorage.getItem('attendance_v1');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    // initialize from studentsData
    const init = {};
    studentsData.forEach(s => { init[s.name] = { records: s.attendance.slice(), note: '' }; });
    return init;
  });

  const [showSaved, setShowSaved] = React.useState(false);
  const [viewMode, setViewMode] = React.useState('last30'); // 'last30' or 'today'
  const [importMsg, setImportMsg] = React.useState('');

  const dateLabels = React.useMemo(() => {
    const arr = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      arr.push(d.toISOString().slice(0, 10));
    }
    return arr;
  }, []);

  const todayIndex = dateLabels.length - 1;

  React.useEffect(() => {
    try { localStorage.setItem('attendance_v1', JSON.stringify(attendanceState)); } catch(e){}
  }, [attendanceState]);

  const togglePresent = (studentName, dayIndex) => {
    setAttendanceState(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next[studentName].records[dayIndex] = !next[studentName].records[dayIndex];
      return next;
    });
  };

  const setAll = (present=true) => {
    setAttendanceState(prev => {
      const next = {};
      Object.keys(prev).forEach(k => { next[k] = { ...prev[k], records: prev[k].records.map(()=>present) }; });
      return next;
    });
  };

  const updateNote = (studentName, note) => {
    setAttendanceState(prev => ({ ...prev, [studentName]: { ...prev[studentName], note } }));
  };

  const saveAttendance = () => {
    try {
      localStorage.setItem('attendance_v1', JSON.stringify(attendanceState));
      setShowSaved(true);
      setTimeout(()=>setShowSaved(false), 1800);
    } catch (e) { console.error(e); }
  };

  const resetAttendance = () => {
    const init = {};
    studentsData.forEach(s => { init[s.name] = { records: s.attendance.slice(), note: '' }; });
    setAttendanceState(init);
    setShowSaved(true);
    setTimeout(()=>setShowSaved(false), 1400);
  };

  const importCSVFile = async (file) => {
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(l=>l.trim());
      const [header, ...rows] = lines;
      let updated = { ...attendanceState };
      rows.forEach(r => {
        const cols = r.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(c=>c.replace(/^"|"$/g, ''));
        const name = cols[0];
        const att = (cols[1] || '').split('|');
        const note = cols[3] || '';
        if (!updated[name]) return;
        // map att to booleans (P => true)
        const rec = att.map(v => v.trim().toUpperCase() === 'P');
        // ensure length
        if (rec.length === dateLabels.length) {
          updated[name].records = rec;
          updated[name].note = note;
        }
      });
      setAttendanceState(updated);
      setImportMsg('Imported successfully');
      setTimeout(()=>setImportMsg(''),2000);
    } catch(e){ console.error(e); setImportMsg('Import failed'); setTimeout(()=>setImportMsg(''),3000); }
  };

  const exportCSV = () => {
    const header = ['Student','Attendance(Last30)','PresentCount','Note'];
    const rows = Object.keys(attendanceState).map(name => {
      const rec = attendanceState[name].records;
      const presentCount = rec.filter(Boolean).length;
      return [name, rec.map(r=> r ? 'P' : 'A').join('|'), presentCount, (attendanceState[name].note||'')];
    });
    const csv = [header, ...rows].map(r => r.map(c => '"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'attendance_export.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <SectionTitle title="Attendance" subtitle="Quickly mark and manage attendance. Click a cell to toggle present/absent. Add notes per student." color="#003F87" />
      <div className="flex items-center space-x-2">
        <button onClick={()=>setAll(true)} className="btn btn-primary">Mark All Present</button>
        <button onClick={()=>setAll(false)} className="btn btn-danger">Mark All Absent</button>
        <button onClick={saveAttendance} className="btn btn-ghost">Save</button>
        <button onClick={resetAttendance} className="btn btn-ghost">Reset</button>
        <button onClick={exportCSV} className="btn btn-primary">Export CSV</button>
        <label className="btn btn-ghost" style={{display:'inline-flex',alignItems:'center',gap:8}}>
          Import CSV
          <input type="file" accept="text/csv" style={{display:'none'}} onChange={e=>{ if(e.target.files && e.target.files[0]) importCSVFile(e.target.files[0]); e.target.value=''; }} />
        </label>
        <div className="ml-2">
          <select value={viewMode} onChange={e=>setViewMode(e.target.value)} className="border rounded p-1">
            <option value="last30">Last 30 days</option>
            <option value="today">Today (Roll-call)</option>
          </select>
        </div>
        {showSaved && <div className="badge">Saved</div>}
        {importMsg && <div className="muted">{importMsg}</div>}
      </div>
      <div className="muted text-sm">Tip: Click each cell to toggle Present (P) / Absent (A). Use notes to record reasons.</div>
      <div className="overflow-x-auto card">
        {viewMode === 'last30' ? (
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">Student</th>
                <th className="p-2">Last 30 Days</th>
                <th className="p-2">Present</th>
                <th className="p-2">Note</th>
              </tr>
              <tr className="text-left muted text-xs">
                <th></th>
                <th className="p-2">{dateLabels.slice(0,7).map(d=>d.split('-').slice(1).join('/')).join(' ')} ...</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(attendanceState).map(name => {
                const rec = attendanceState[name].records;
                const presentCount = rec.filter(Boolean).length;
                return (
                  <tr key={name} className="border-b">
                    <td className="p-2 font-bold">{name}</td>
                    <td className="p-2 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {rec.map((r,idx)=> (
                          <button key={idx} onClick={()=>togglePresent(name, idx)} className={`w-6 h-6 rounded text-xs flex items-center justify-center ${r ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>{r? 'P':'A'}</button>
                        ))}
                      </div>
                    </td>
                    <td className="p-2">{presentCount}/{rec.length}</td>
                    <td className="p-2">
                      <textarea value={attendanceState[name].note || ''} onChange={e=>updateNote(name, e.target.value)} className="border p-1 w-full rounded" placeholder="Write notes..." />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          // Today roll-call view
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button onClick={()=>{ setAll(true); saveAttendance(); }} className="btn btn-primary">Mark All Present</button>
              <button onClick={()=>{ setAll(false); saveAttendance(); }} className="btn btn-danger">Mark All Absent</button>
              <button onClick={saveAttendance} className="btn btn-ghost">Save Roll-call</button>
            </div>
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left border-b">
                  <th className="p-2">Student</th>
                  <th className="p-2">Today ({dateLabels[todayIndex]})</th>
                  <th className="p-2">Note</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(attendanceState).map(name => {
                  const rec = attendanceState[name].records;
                  const todayPresent = rec[todayIndex];
                  return (
                    <tr key={name} className="border-b">
                      <td className="p-2 font-bold">{name}</td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <button onClick={()=>{ togglePresent(name, todayIndex); saveAttendance(); }} className={`btn ${todayPresent? 'btn-primary':'btn-ghost'}`}>{todayPresent? 'Present':'Absent'}</button>
                        </div>
                      </td>
                      <td className="p-2"><input value={attendanceState[name].note||''} onChange={e=>updateNote(name,e.target.value)} className="border p-1 w-full rounded" /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ========================================
// SECTION 9: PAGE - PARENTS
// ========================================
function Parents() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Parents</h2>
      <p>View your child's attendance, behaviour, and grades.</p>
    </div>
  );
}

// ========================================
// SECTION 9A: PAGE - STAFF
// ========================================
function Staff() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Staff Directory</h2>
      <p>View staff members and their roles.</p>
    </div>
  );
}

// ========================================
// SECTION 9B: PAGE - TEACHERS
// ========================================
function Teachers() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Teachers</h2>
      <p>View teacher profiles and contact information.</p>
    </div>
  );
}

// ========================================
// SECTION 9C: PAGE - ADMIN
// ========================================
function Admin() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
      <p>Administrative controls and system settings.</p>
    </div>
  );
}

// ========================================
// SECTION 10: MAIN APPLICATION
// ========================================
function App() {
  const [user, setUser] = useState(null);
  const [school, setSchool] = useState('');
  const [page, setPage] = useState('Dashboard');

  const login = (u)=>{ setUser(u); setSchool('Bromcom High'); };
  const logout = ()=>{ setUser(null); setSchool(''); setPage('Dashboard'); };

  if(!user) return <AuthScreen onLogin={login} />;

  let PageComponent;
  switch(page){
    case 'Dashboard': PageComponent=Dashboard; break;
    case 'Behaviour': PageComponent=Behaviour; break;
    case 'Modules': PageComponent=Modules; break;
    case 'Timetable': PageComponent=Timetable; break;
    case 'Staff': PageComponent=Staff; break;
    case 'Teachers': PageComponent=Teachers; break;
    case 'Parents': PageComponent=Parents; break;
    case 'Admin': PageComponent=Admin; break;
    default: PageComponent=Dashboard;
  }

  return (
    <div className="flex">
      <Sidebar currentPage={page} setCurrentPage={setPage}/>
      <div className="flex-1 p-4">
        <SchoolHeader user={user} school={school} onLogout={logout}/>
        <PageComponent/>
      </div>
    </div>
  );
}

export default App;
