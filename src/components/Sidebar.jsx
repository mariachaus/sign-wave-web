import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import '../styles/components/Sidebar.scss';

const Icon = ({ children }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const NavItem = ({ active, onClick, icon, badge = 0, children }) => (
  <button
    className={`dashboard-nav-item${active ? ' dashboard-nav-item--active' : ''}`}
    onClick={onClick}
  >
    {icon}
    {children}
    {badge > 0 && <span className="dashboard-nav-item__badge">{badge}</span>}
  </button>
);

const ICONS = {
  home: (
    <Icon><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></Icon>
  ),
  friends: (
    <Icon><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></Icon>
  ),
  learn: (
    <Icon><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></Icon>
  ),
  library: (
    <Icon><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></Icon>
  ),
  practice: (
    <Icon><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></Icon>
  ),
  image: (
    <Icon><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></Icon>
  ),
  webcam: (
    <Icon><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></Icon>
  ),
  videoData: (
    <Icon><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><polygon points="10 11 8 13 10 15 10 11" /><line x1="16" y1="13" x2="12" y2="13" /></Icon>
  ),
  inference: (
    <Icon><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></Icon>
  ),
  profile: (
    <Icon><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></Icon>
  ),
  settings: (
    <Icon><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></Icon>
  ),
};


const Sidebar = ({ isAdmin = false, activeTab = null, onTabChange = null }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const [requestsCount, setRequestsCount] = useState(0);

  const loadRequests = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    axios
      .get(`${API_BASE_URL}/api/friends/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setRequestsCount(res.data.incoming?.length || 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadRequests();
  }, [pathname, loadRequests]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') loadRequests();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('friends:changed', loadRequests);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('friends:changed', loadRequests);
    };
  }, [loadRequests]);

  const onDashboard = pathname === '/';
  const showMlTools = isAdmin && onDashboard && typeof onTabChange === 'function';
  const startsWith = (p) => pathname === p || pathname.startsWith(`${p}/`);

  const goHome = () => {
    if (onTabChange) onTabChange(null);
    if (!onDashboard) navigate('/');
  };

  const mlTabs = [
    { id: 'image', icon: ICONS.image, label: t('tab_image') },
    { id: 'webcam', icon: ICONS.webcam, label: t('tab_webcam') },
    { id: 'videoData', icon: ICONS.videoData, label: t('tab_video_data') },
    { id: 'inferenceTest', icon: ICONS.inference, label: 'Inference Test' },
  ];

  return (
    <aside className="dashboard-sidebar">
      <nav className="dashboard-sidebar__nav">
        <NavItem active={onDashboard && !activeTab} onClick={goHome} icon={ICONS.home}>
          {t('dashboard') || 'Dashboard'}
        </NavItem>

        <NavItem
          active={startsWith('/friends') || startsWith('/users')}
          onClick={() => navigate('/friends')}
          icon={ICONS.friends}
          badge={requestsCount}
        >
          {t('friends')}
        </NavItem>

        <div className="dashboard-sidebar__divider" />
        <span className="dashboard-sidebar__label">{t('learn')}</span>
        <NavItem active={startsWith('/learn')} onClick={() => navigate('/learn')} icon={ICONS.learn}>
          {t('learn')}
        </NavItem>
        <NavItem active={startsWith('/gestures')} onClick={() => navigate('/gestures')} icon={ICONS.library}>
          {t('library_of_gestures')}
        </NavItem>
        <NavItem active={startsWith('/practice')} onClick={() => navigate('/practice')} icon={ICONS.practice}>
          {t('practice')}
        </NavItem>

        {showMlTools && (
          <>
            <div className="dashboard-sidebar__divider" />
            <span className="dashboard-sidebar__label">ML Tools</span>
            {mlTabs.map((tab) => (
              <NavItem
                key={tab.id}
                active={activeTab === tab.id}
                onClick={() => onTabChange(tab.id)}
                icon={tab.icon}
              >
                {tab.label}
              </NavItem>
            ))}
          </>
        )}

        <div className="dashboard-sidebar__bottom">
          <NavItem active={startsWith('/profile')} onClick={() => navigate('/profile')} icon={ICONS.profile}>
            {t('my_profile')}
          </NavItem>
          <NavItem active={startsWith('/settings')} onClick={() => navigate('/settings')} icon={ICONS.settings}>
            {t('settings')}
          </NavItem>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;