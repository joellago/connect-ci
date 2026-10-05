import { useEffect, useMemo, useState } from 'react';
import { sendOtp, verifyOtp, firebaseReady } from './firebase';

const STORAGE_KEY = 'connect-ci-state';

const sampleProfiles = [
  {
    id: 1,
    name: 'Amandine',
    age: 24,
    city: 'Abidjan',
    neighborhood: 'Yopougon',
    bio: 'J’aime les bons plats, les kdramas et les sorties en fin de semaine.',
    tags: ['Voyage', 'Cuisine', 'Danse'],
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 2,
    name: 'Koffi',
    age: 27,
    city: 'San-Pédro',
    neighborhood: 'Sicogi',
    bio: 'Niveau vibe : foot, musique locale et café de bonne heure.',
    tags: ['Foot', 'Musique', 'Boulot'],
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 3,
    name: 'Nadège',
    age: 23,
    city: 'Bouaké',
    neighborhood: 'Kokondekro',
    bio: 'Toujours prête pour un moment sympa et une vraie conversation.',
    tags: ['Art', 'Voyage', 'Humour'],
    photo: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 4,
    name: 'Yao',
    age: 29,
    city: 'Daloa',
    neighborhood: 'Maraoué',
    bio: 'J’aime le sérieux, la joie et le bon sens de l’humour.',
    tags: ['Business', 'Nature', 'Sport'],
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80'
  }
];

const demoMessages = {
  1: [
    { from: 'them', text: 'Salut toi, ça roule ?' },
    { from: 'me', text: 'Oui, ça va bien. Tu es à Abidjan ?' },
    { from: 'them', text: 'Oui, à Yopougon. Tu préfères le riz gras ou la soupe ?' }
  ],
  2: [
    { from: 'them', text: 'Le weekend on fait un bon café à San-Pédro ?' },
    { from: 'me', text: 'Yess, ça me dit bien 😄' }
  ]
};

const getStoredState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

function App() {
  const stored = getStoredState();
  const [step, setStep] = useState(stored?.step || 'signup');
  const [form, setForm] = useState({
    age: stored?.form?.age || '',
    city: stored?.form?.city || 'Abidjan',
    neighborhood: stored?.form?.neighborhood || 'Yopougon',
    phone: stored?.form?.phone || '',
    otp: stored?.form?.otp || '',
    name: stored?.form?.name || ''
  });
  const [error, setError] = useState('');
  const [profiles] = useState(sampleProfiles);
  const [currentIndex, setCurrentIndex] = useState(stored?.currentIndex || 0);
  const [matches, setMatches] = useState(stored?.matches || [{ id: 1, name: 'Amandine', city: 'Abidjan' }]);
  const [chat, setChat] = useState(stored?.chat || demoMessages);
  const [activeTab, setActiveTab] = useState(stored?.activeTab || 'discover');
  const [selectedMatch, setSelectedMatch] = useState(stored?.selectedMatch || 1);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        step,
        form,
        currentIndex,
        matches,
        chat,
        activeTab,
        selectedMatch
      })
    );
  }, [step, form, currentIndex, matches, chat, activeTab, selectedMatch]);

  const currentProfile = profiles[currentIndex] || null;
  const appReady = useMemo(
    () => Boolean(form.age && form.city && form.neighborhood && form.phone && form.name),
    [form]
  );

  const handleFieldChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSendOtp = async () => {
    if (!form.name.trim()) {
      setError('Écris ton prénom avant de continuer.');
      return;
    }

    if (!form.phone || !form.phone.startsWith('+225')) {
      setError('Le numéro doit commencer par +225.');
      return;
    }

    try {
      const result = await sendOtp(form.phone);
      if (result?.demoCode) {
        setForm(prev => ({ ...prev, otp: result.demoCode }));
      }
      setStep('otp');
      setError('');
    } catch (e) {
      setError('Le code n’a pas pu être envoyé. Réessaie dans quelques secondes.');
    }
  };

  const handleVerifyOtp = async () => {
    if (!form.otp) {
      setError('Saisis le code reçu.');
      return;
    }

    try {
      const ok = await verifyOtp(form.otp);
      if (!ok) {
        setError('Le code OTP est invalide.');
        return;
      }
      setStep('app');
      setError('');
    } catch (e) {
      setError('Vérification impossible, réessaye.');
    }
  };

  const handleLike = () => {
    const likedProfile = currentProfile;
    if (!likedProfile) return;

    const isMutual = Math.random() > 0.45;
    if (isMutual) {
      setMatches(prev => {
        const exists = prev.some(item => item.id === likedProfile.id);
        if (exists) return prev;
        return [...prev, { id: likedProfile.id, name: likedProfile.name, city: likedProfile.city }];
      });
      setChat(prev => ({
        ...prev,
        [likedProfile.id]: prev[likedProfile.id] || [
          { from: 'them', text: `Salut ${likedProfile.name}, on est match ! 😍` }
        ]
      }));
      setSelectedMatch(likedProfile.id);
    }

    setCurrentIndex(prev => prev + 1);
  };

  const handlePass = () => {
    setCurrentIndex(prev => Math.min(prev + 1, profiles.length));
  };

  const sendMessage = (profileId, text) => {
    setChat(prev => ({
      ...prev,
      [profileId]: [...(prev[profileId] || []), { from: 'me', text }]
    }));
  };

  const currentMatch = matches.find(item => item.id === selectedMatch) || matches[0];

  return (
    <div className="app-shell">
      <div className="app-frame">
        {step === 'signup' && (
          <section className="panel">
            <div className="brand-box">
              <span className="brand-badge">CI</span>
              <div>
                <p className="eyebrow">Rencontre à la mode ivoirienne</p>
                <h1>Connect CI</h1>
              </div>
            </div>

            <h2>Crée ton profil</h2>
            <p className="subtext">Découvre des profils près de chez toi, style simple et 100% local.</p>

            <div className="fields">
              <label>
                <span>Prénom</span>
                <input type="text" value={form.name} onChange={e => handleFieldChange('name', e.target.value)} placeholder="Marie" />
              </label>

              <label>
                <span>Âge</span>
                <input type="number" min="18" max="60" value={form.age} onChange={e => handleFieldChange('age', e.target.value)} placeholder="22" />
              </label>

              <label>
                <span>Ville</span>
                <input type="text" value={form.city} onChange={e => handleFieldChange('city', e.target.value)} placeholder="Abidjan" />
              </label>

              <label>
                <span>Quartier</span>
                <input type="text" value={form.neighborhood} onChange={e => handleFieldChange('neighborhood', e.target.value)} placeholder="Yopougon" />
              </label>

              <label>
                <span>Numéro</span>
                <input type="tel" value={form.phone} onChange={e => handleFieldChange('phone', e.target.value)} placeholder="+225 07 12 34 56 78" />
              </label>
            </div>

            {error && <p className="error">{error}</p>}

            <button className="primary-btn" disabled={!appReady} onClick={handleSendOtp}>
              Envoyer le code OTP
            </button>

            <p className="footer-note">
              OTP Firebase prêt. En mode démo, le code est <strong>123456</strong>.
            </p>
          </section>
        )}

        {step === 'otp' && (
          <section className="panel">
            <div className="brand-box mini">
              <span className="brand-badge">✓</span>
              <div>
                <p className="eyebrow">Vérification</p>
                <h1>Code OTP</h1>
              </div>
            </div>

            <h2>Entre le code reçu</h2>
            <p className="subtext">Nous avons envoyé le code au {form.phone || 'numéro'}.</p>

            <div className="otp-box">
              <input
                type="text"
                maxLength="6"
                value={form.otp}
                onChange={e => handleFieldChange('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
              />
            </div>

            {error && <p className="error">{error}</p>}

            <button className="primary-btn" onClick={handleVerifyOtp}>Valider</button>
            <button className="ghost-btn" onClick={() => setStep('signup')}>Modifier le numéro</button>
          </section>
        )}

        {step === 'app' && (
          <>
            <header className="topbar">
              <div>
                <span className="small-label">Connect CI</span>
                <h3>La vibe locale</h3>
              </div>
              <div className="avatar-bubble">{form.name.slice(0, 2).toUpperCase() || 'CI'}</div>
            </header>

            <nav className="tabs">
              <button className={activeTab === 'discover' ? 'tab active' : 'tab'} onClick={() => setActiveTab('discover')}>Découvrir</button>
              <button className={activeTab === 'matches' ? 'tab active' : 'tab'} onClick={() => setActiveTab('matches')}>Matchs</button>
              <button className={activeTab === 'messages' ? 'tab active' : 'tab'} onClick={() => setActiveTab('messages')}>Messages</button>
            </nav>

            {activeTab === 'discover' && (
              <section className="discover">
                {currentProfile ? (
                  <>
                    <div className="profile-card">
                      <img src={currentProfile.photo} alt={currentProfile.name} />
                      <div className="profile-overlay">
                        <div className="profile-header">
                          <div>
                            <h2>{currentProfile.name}, {currentProfile.age}</h2>
                            <p>{currentProfile.city} · {currentProfile.neighborhood}</p>
                          </div>
                        </div>
                        <p className="bio">{currentProfile.bio}</p>
                        <div className="tags">
                          {currentProfile.tags.map(tag => (
                            <span key={tag}>{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="actions">
                      <button className="pass-btn" onClick={handlePass}>Passer</button>
                      <button className="like-btn" onClick={handleLike}>J’aime</button>
                    </div>
                  </>
                ) : (
                  <div className="empty-state">
                    <h3>Plus de profils pour l’instant</h3>
                    <p>Reviens un peu plus tard pour plus de vibes.</p>
                  </div>
                )}
              </section>
            )}

            {activeTab === 'matches' && (
              <section className="matches-panel">
                <div className="match-list">
                  {matches.map(match => (
                    <button key={match.id} className={selectedMatch === match.id ? 'match-item active' : 'match-item'} onClick={() => setSelectedMatch(match.id)}>
                      <span className="dot" />
                      <span>{match.name}</span>
                      <small>{match.city}</small>
                    </button>
                  ))}
                </div>
                {currentMatch && (
                  <div className="match-card">
                    <h3>{currentMatch.name}</h3>
                    <p>Match mutuel validé. Tu peux maintenant commencer à discuter.</p>
                  </div>
                )}
              </section>
            )}

            {activeTab === 'messages' && (
              <section className="messages-panel">
                <div className="chat-box">
                  {(chat[currentMatch?.id] || []).map((msg, index) => (
                    <div key={`${msg.from}-${index}`} className={msg.from === 'me' ? 'bubble me' : 'bubble them'}>
                      {msg.text}
                    </div>
                  ))}
                </div>

                <div className="composer">
                  <input
                    type="text"
                    placeholder="Écris ton message..."
                    onKeyDown={event => {
                      if (event.key === 'Enter' && currentMatch && event.target.value.trim()) {
                        sendMessage(currentMatch.id, event.target.value.trim());
                        event.target.value = '';
                      }
                    }}
                  />
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
