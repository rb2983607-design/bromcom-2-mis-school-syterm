import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Draggable from 'react-draggable';
import './index.css';

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
  return (
    <div className="w-full bg-[#005EB8] shadow-md rounded-b-xl p-4 flex justify-between items-center text-white">
      <div className="flex items-center">
        <img src="/logo.svg" alt="Bromcom logo" className="h-10 mr-3 inline-block" onError={(e)=>{e.target.style.display='none'}} />
        <div>
          <h1 className="text-xl font-bold">{school}</h1>
          <p className="text-white text-sm">{user.role} {user.group ? `- ${user.group}` : ''}</p>
        </div>
      </div>
      <div>
        <button onClick={onLogout} className="bg-white text-[#005EB8] px-4 py-2 rounded hover:bg-gray-100">Logout</button>
      </div>
    </div>
  );
}

// ========================================
// SECTION 4: SIDEBAR NAVIGATION
// ========================================
function Sidebar({ currentPage, setCurrentPage }) {
  const links = ['Dashboard', 'Behaviour', 'Modules', 'Staff', 'Teachers', 'Parents', 'Admin'];
  return (
    <div className="w-60 bg-[#003F87] text-white min-h-screen p-4 flex flex-col">
      {links.map(link => (
        <button key={link} onClick={() => setCurrentPage(link)}
          className={`w-full text-left p-3 mb-2 rounded ${currentPage===link ? 'bg-[#002B55]' : 'hover:bg-[#002B55]'}`}>
          {link}
        </button>
      ))}
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

  const playAudio = (file, { loop=false, volume=1 } = {}) => { 
    try {
      const audio = new Audio(file);
      audio.volume = volume;
      audio.loop = loop;
      audio.play();
      if (loop) {
        // keep reference so it can be stopped
        setAlarmAudio(audio);
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
    }
  };

  const broadcastPA = () => { 
    if(!paMessage) return; 
    if (!('speechSynthesis' in window)) {
      alert('Speech Synthesis not supported in this browser');
      return;
    }
    const utter = new SpeechSynthesisUtterance(paMessage);
    // apply selected voice if available
    if (voices && voices.length && selectedVoice) {
      const v = voices.find(voice => voice.name === selectedVoice);
      if (v) utter.voice = v;
    }
    utter.rate = rate || 1;
    utter.pitch = pitch || 1;
    utter.volume = 1;
    speechSynthesis.speak(utter);
    setPaMessage(''); 
  };

  const triggerPreset = (type) => {
    // All preset announcements play at full volume
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
      speechSynthesis.speak(utt);
      return;
    }

    if (type === 'lockdown') {
      // announce lockdown and optionally play lockdown audio
      const msg = 'LOCKDOWN: This is an important safety announcement. All students and staff must move to a safe location immediately and follow the lockdown procedure.';
      const utt = new SpeechSynthesisUtterance(msg);
      if (voices && voices.length && selectedVoice) {
        const v = voices.find(voice => voice.name === selectedVoice);
        if (v) utt.voice = v;
      }
      utt.rate = Math.max(0.9, rate - 0.1);
      utt.pitch = Math.max(0.8, pitch - 0.2);
      utt.volume = 1;
      speechSynthesis.speak(utt);
      // play lockdown audio if available
      playAudio('/sounds/lockdown.mp3', { loop: true, volume: 1 });
      return;
    }

    if (type === 'fire') {
      // play fire alarm siren loudly and loop
      stopAlarm();
      playAudio('/sounds/firealarm.mp3', { loop: true, volume: 1 });
      return;
    }

    if (type === 'bell') {
      // play bell 3 times (short bursts)
      for (let i=0;i<3;i++) {
        setTimeout(()=>playAudio('/sounds/bell.mp3', { volume: 1 }), i*1000);
      }
      return;
    }
  };

  // load available voices
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
      {/* Detention Alert Banner */}
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
        <button onClick={()=>playAudio('/sounds/pa.mp3')} className="bg-blue-600 text-white px-4 py-2 rounded">Trigger PA</button>
        <button onClick={()=>playAudio('/sounds/firealarm.mp3')} className="bg-red-600 text-white px-4 py-2 rounded">Fire Alarm</button>
        <button onClick={()=>playAudio('/sounds/lockdown.mp3')} className="bg-gray-800 text-white px-4 py-2 rounded">Lockdown</button>
        <button onClick={()=>{for(let i=0;i<3;i++){setTimeout(()=>playAudio('/sounds/bell.mp3'),i*1000)}}} className="bg-yellow-400 text-black px-4 py-2 rounded">School Bell (3x)</button>
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
      <SectionTitle title="Timetable" color="#003F87" />
      <div className="grid grid-cols-5 gap-2">
        {['Mon','Tue','Wed','Thu','Fri'].map(day=><div key={day} className="bg-white p-4 rounded shadow">{day}</div>)}
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
      <SectionTitle title="Parents" color="#003F87" />
      <p>View your child's attendance, behaviour, and grades.</p>
    </div>
  );
}

// ========================================
// SECTION: STAFF, TEACHERS, ADMIN PAGES
// ========================================
function Staff() {
  return (
    <div>
      <SectionTitle title="Staff" subtitle="Staff directory and contact details" color="#003F87" />
      <div className="bg-white p-4 rounded shadow">Staff list and roles will appear here.</div>
    </div>
  );
}

function Teachers() {
  return (
    <div>
      <SectionTitle title="Teachers" subtitle="Teacher profiles and timetables" color="#003F87" />
      <div className="bg-white p-4 rounded shadow">Teachers' profiles and classes will appear here.</div>
    </div>
  );
}

function Admin() {
  return (
    <div>
      <SectionTitle title="Admin" subtitle="Administration tools and settings" color="#003F87" />
      <div className="bg-white p-4 rounded shadow">Admin controls and reports will appear here.</div>
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
    case 'Admin': PageComponent=Admin; break;
    case 'Parents': PageComponent=Parents; break;
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

ReactDOM.render(<App/>, document.getElementById('root'));
