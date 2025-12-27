import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function HomePage({ user, setUser }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [projects, setProjects] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Check if user has visited before
  useEffect(() => {
    const hasVisited = localStorage.getItem('logicguard_visited');
    if (hasVisited) {
      setIsReturningUser(true);
    } else {
      localStorage.setItem('logicguard_visited', 'true');
      setIsReturningUser(false);
    }
  }, []);

  // Fetch projects when user is available or when projects tab is active
  useEffect(() => {
    if (user?.id && activeTab === 'projects') {
      fetchProjects();
    }
  }, [user?.id, activeTab]);

  // Fetch history when user is available or when history tab is active
  useEffect(() => {
    if (user?.id && activeTab === 'history') {
      fetchHistory();
    }
  }, [user?.id, activeTab]);

  const fetchProjects = async () => {
    if (!user?.id) return;
    setIsLoadingProjects(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects?user_id=${user.id}`);
      const data = await response.json();
      if (data.success) {
        setProjects(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
    setIsLoadingProjects(false);
  };

  const fetchHistory = async () => {
    if (!user?.id) return;
    setIsLoadingHistory(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/history?user_id=${user.id}`);
      const data = await response.json();
      if (data.success) {
        setHistory(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
    setIsLoadingHistory(false);
  };

  // Filter projects based on search query
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.language?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter history based on search query
  const filteredHistory = history.filter(item =>
    item.code_snippet?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.language?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    setUser(null);
    navigate('/welcome');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  const handleNewProject = () => {
    navigate('/app');
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // Helper function to get language icon
  const getLanguageIcon = (language) => {
    const lang = (language || 'python').toLowerCase();

    const icons = {
      python: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z"/>
        </svg>
      ),
      javascript: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z"/>
        </svg>
      ),
      typescript: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z"/>
        </svg>
      ),
      java: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.851 18.56s-.917.534.653.714c1.902.218 2.874.187 4.969-.211 0 0 .552.346 1.321.646-4.699 2.013-10.633-.118-6.943-1.149M8.276 15.933s-1.028.761.542.924c2.032.209 3.636.227 6.413-.308 0 0 .384.389.987.602-5.679 1.661-12.007.13-7.942-1.218M13.116 11.475c1.158 1.333-.304 2.533-.304 2.533s2.939-1.518 1.589-3.418c-1.261-1.772-2.228-2.652 3.007-5.688 0-.001-8.216 2.051-4.292 6.573M19.33 20.504s.679.559-.747.991c-2.712.822-11.288 1.069-13.669.033-.856-.373.75-.89 1.254-.998.527-.114.828-.093.828-.093-.953-.671-6.156 1.317-2.643 1.887 9.58 1.553 17.462-.7 14.977-1.82M9.292 13.21s-4.362 1.036-1.544 1.412c1.189.159 3.561.123 5.77-.062 1.806-.152 3.618-.477 3.618-.477s-.637.272-1.098.587c-4.429 1.165-12.986.623-10.522-.568 2.082-1.006 3.776-.892 3.776-.892M17.116 17.584c4.503-2.34 2.421-4.589.968-4.285-.355.074-.515.138-.515.138s.132-.207.385-.297c2.875-1.011 5.086 2.981-.928 4.562 0-.001.07-.062.09-.118M14.401 0s2.494 2.494-2.365 6.33c-3.896 3.077-.888 4.832-.001 6.836-2.274-2.053-3.943-3.858-2.824-5.539 1.644-2.469 6.197-3.665 5.19-7.627M9.734 23.924c4.322.277 10.959-.153 11.116-2.198 0 0-.302.775-3.572 1.391-3.688.694-8.239.613-10.937.168 0-.001.553.457 3.393.639"/>
        </svg>
      ),
      cpp: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.394 6c-.167-.29-.398-.543-.652-.69L12.926.22c-.509-.294-1.34-.294-1.848 0L2.26 5.31c-.508.293-.923 1.013-.923 1.6v10.18c0 .294.104.62.271.91.167.29.398.543.652.69l8.816 5.09c.508.293 1.34.293 1.848 0l8.816-5.09c.254-.147.485-.4.652-.69.167-.29.27-.616.27-.91V6.91c.003-.294-.1-.62-.268-.91zM12 19.11c-3.92 0-7.109-3.19-7.109-7.11 0-3.92 3.19-7.11 7.11-7.11a7.133 7.133 0 016.156 3.553l-3.076 1.78a3.567 3.567 0 00-3.08-1.78A3.56 3.56 0 008.444 12 3.56 3.56 0 0012 15.555a3.57 3.57 0 003.08-1.778l3.078 1.78A7.135 7.135 0 0112 19.11zm7.11-6.715h-.79v.79h-.79v-.79h-.79v-.79h.79v-.79h.79v.79h.79zm2.962 0h-.79v.79h-.79v-.79h-.79v-.79h.79v-.79h.79v.79h.79z"/>
        </svg>
      ),
      c: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.5921 9.1962s-.354-3.298-3.627-3.39c-3.2741-.09-4.9552 2.474-4.9552 6.14 0 3.6651 1.858 6.5972 5.0451 6.5972 3.184 0 3.5381-3.665 3.5381-3.665l3.4311.936s.36 4.064-3.5765 5.625c-3.9376 1.5621-7.6552-1.1621-8.7141-2.316-1.06-1.154-2.6181-3.2091-2.6181-6.8551 0-3.647 1.6011-5.7971 2.7991-6.9551 1.198-1.158 3.0871-2.5141 6.6951-2.5141 3.608 0 5.5301 2.6951 5.9091 4.5891l-3.9272.808z"/>
        </svg>
      ),
      go: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M1.811 10.231c-.047 0-.058-.023-.035-.059l.246-.315c.023-.035.081-.058.128-.058h4.172c.046 0 .058.035.035.07l-.199.303c-.023.036-.082.07-.117.07zM.047 11.306c-.047 0-.059-.023-.035-.058l.245-.316c.023-.035.082-.058.129-.058h5.328c.047 0 .07.035.058.07l-.093.28c-.012.047-.058.07-.105.07zm2.828 1.075c-.047 0-.059-.035-.035-.07l.163-.292c.023-.035.07-.07.117-.07h2.337c.047 0 .07.035.07.082l-.023.28c0 .047-.047.082-.082.082zm12.129-2.36c-.736.187-1.239.327-1.963.514-.176.046-.187.058-.34-.117-.174-.199-.303-.327-.548-.444-.737-.362-1.45-.257-2.115.175-.795.514-1.204 1.274-1.192 2.22.011.935.654 1.706 1.577 1.835.795.105 1.46-.175 1.987-.77.105-.13.198-.27.315-.434H10.47c-.245 0-.304-.152-.222-.35.152-.362.432-.97.596-1.274a.315.315 0 01.292-.187h4.253c-.023.316-.023.631-.07.947a4.983 4.983 0 01-.958 2.29c-.841 1.11-1.94 1.8-3.33 1.986-1.145.152-2.209-.07-3.143-.77-.865-.655-1.356-1.52-1.484-2.595-.152-1.274.222-2.419.993-3.424.83-1.086 1.928-1.776 3.272-2.02 1.098-.2 2.15-.07 3.096.571.62.41 1.063.97 1.356 1.648.07.105.023.164-.117.2m3.868 6.461c-1.064-.024-2.034-.328-2.852-1.029a3.665 3.665 0 01-1.262-2.255c-.21-1.32.152-2.489.947-3.529.853-1.122 1.881-1.706 3.272-1.95 1.192-.21 2.314-.095 3.33.595.923.63 1.496 1.484 1.648 2.605.198 1.578-.257 2.863-1.344 3.962-.771.783-1.718 1.273-2.805 1.495-.315.06-.63.07-.934.106zm2.78-4.72c-.011-.153-.011-.27-.034-.387-.21-1.157-1.274-1.81-2.384-1.554-1.087.245-1.788.935-2.045 2.033-.21.912.234 1.835 1.075 2.21.643.28 1.285.244 1.905-.07.923-.48 1.425-1.228 1.484-2.233z"/>
        </svg>
      ),
      rust: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.8346 11.7033l-1.0073-.6236a13.7268 13.7268 0 00-.0283-.2936l.8656-.8069a.3483.3483 0 00-.1154-.578l-1.1066-.414a8.4958 8.4958 0 00-.087-.2856l.6904-.9587a.3462.3462 0 00-.2257-.5446l-1.1663-.1894a9.3574 9.3574 0 00-.1407-.2622l.4747-1.0749a.3437.3437 0 00-.3245-.4908l-1.1864.0585a6.8649 6.8649 0 00-.1873-.2268l.2373-1.1536a.3442.3442 0 00-.4117-.4117l-1.1536.2373a8.3949 8.3949 0 00-.2267-.1873l.0584-1.1864a.3438.3438 0 00-.4908-.3246l-1.0749.4747c-.0864-.0495-.1741-.0981-.2623-.1407l-.1893-1.1663a.3447.3447 0 00-.5. 446-.2257l-.9587.6904a9.0236 9.0236 0 00-.2856-.087l-.414-1.1066a.3483.3483 0 00-.578-.1154l-.8069.8656a9.6565 9.6565 0 00-.2936-.0284l-.6236-1.0073a.3442.3442 0 00-.5765 0l-.6236 1.0073a13.7268 13.7268 0 00-.2936.0284l-.8069-.8656a.3483.3483 0 00-.578.1154l-.414 1.1066a8.4958 8.4958 0 00-.2856.087l-.9587-.6904a.3462.3462 0 00-.5. 446.2257l-.1894 1.1663a9.3574 9.3574 0 00-.2622.1407l-1.0749-.4747a.3437.3437 0 00-.4908.3246l.0585 1.1864a6.8649 6.8649 0 00-.2268.1873l-1.1536-.2373a.3442.3442 0 00-.4117.4117l.2373 1.1536a8.3949 8.3949 0 00-.1873.2267l-1.1864-.0584a.3438.3438 0 00-.3246.4908l.4747 1.0749c-.0495.0864-.0981.1741-.1407.2623l-1.1663.1893a.3447.3447 0 00-.2257.5446l.6904.9587a9.0236 9.0236 0 00-.087.2856l-1.1066.414a.3483.3483 0 00-.1154.578l.8656.8069c-.0098.0971-.019.1943-.0283.2936l-1.0073.6236a.3442.3442 0 000 .5765l1.0073.6236c.0093.0993.0185.1965.0283.2936l-.8656.8069a.3483.3483 0 00.1154.5. 78l1.1066.414c.0267.0973.0554.19.087.2856l-.6904.9587a.3462.3462 0 00.2257.5447l1.1663.1893c.0426.0882.0912.1759.1407.2622l-.4747 1.0749a.3437.3437 0 00.3245.4908l1.1864-.0585c.0608.0768.1226.1527.1873.2268l-.2373 1.1536a.3442.3442 0 00.4117.4117l1.1536-.2373c.0741.0647.15.1265.2267.1873l-.0584 1.1864a.3438.3438 0 00.4908.3246l1.0749-.4747c.0864.0495.1741.0981.2623.1407l.1893 1.1663a.3447.3447 0 00.5446.2257l.9587-.6904a9.0236 9.0236 0 00.2856.087l.414 1.1066a.3483.3483 0 00.578.1154l.8069-.8656c.0971.0098.1943.019.2936.0283l.6236 1.0073a.3442.3442 0 00.5765 0l.6236-1.0073c.0993-.0093.1965-.0185.2936-.0283l.8069.8656a.3483.3483 0 00.578-.1154l.414-1.1066a8.4958 8.4958 0 00.2856-.087l.9587.6904a.3462.3462 0 00.5446-.2257l.1894-1.1663c.0881-.0426.1758-.0912.2622-.1407l1.0749.4747a.3437.3437 0 00.4908-.3246l-.0585-1.1864a6.8649 6.8649 0 00.2268-.1873l1.1536.2373a.3442.3442 0 00.4117-.4117l-.2373-1.1536c.0647-.0741.1265-.15.1873-.2268l1.1864.0585a.3438.3438 0 00.3246-.4908l-.4747-1.0749c.0495-.0864.0981-.1741.1407-.2622l1.1663-.1894a.3447.3447 0 00.2257-.5446l-.6904-.9587a9.0236 9.0236 0 00.087-.2856l1.1066-.414a.3483.3483 0 00.1154-.578l-.8656-.8069c.0098-.0971.019-.1943.0283-.2936l1.0073-.6236a.3442.3442 0 000-.5765z"/>
        </svg>
      )
    };

    return icons[lang] || icons.python;
  };

  return (
    <div className="home-page">
      {/* Top Navigation Bar */}
      <nav className="home-navbar">
        <div className="navbar-left">
          <div className="navbar-logo" onClick={() => setActiveTab('home')}>
            <img src="/2.png" alt="LogicGuard Logo" className="navbar-logo-image" />
          </div>

          <div className="navbar-tabs">
            <button
              className={`navbar-tab ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => setActiveTab('home')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9,22 9,12 15,12 15,22" />
              </svg>
              Home
            </button>
            <button
              className={`navbar-tab ${activeTab === 'projects' ? 'active' : ''}`}
              onClick={() => setActiveTab('projects')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Projects
            </button>
            <button
              className={`navbar-tab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" />
              </svg>
              History
            </button>
            <button
              className={`navbar-tab ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
              Settings
            </button>
          </div>
        </div>

        <div className="navbar-center">
          <form className="search-form" onSubmit={handleSearch}>
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        <div className="navbar-right">
          <div className="user-menu">
            {user?.picture ? (
              <img src={user.picture} alt={user.name} className="user-avatar" />
            ) : (
              <div className="user-avatar-placeholder">
                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
            )}
            <div className="user-dropdown">
              <div className="user-info">
                <span className="user-name">{user?.name || 'User'}</span>
                <span className="user-email">{user?.email}</span>
              </div>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item" onClick={() => setActiveTab('settings')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
                Settings
              </button>
              <button className="dropdown-item logout" onClick={handleLogout}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16,17 21,12 16,7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="home-content">
        {/* HOME TAB - Centered Welcome */}
        {activeTab === 'home' && (
          <motion.div
            className="tab-content home-tab-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="home-center-content">
              <motion.h1
                className="home-welcome-title"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {isReturningUser
                  ? `Welcome back, ${user?.name?.split(' ')[0] || 'Developer'}!`
                  : `Welcome, ${user?.name?.split(' ')[0] || 'Developer'}!`}
              </motion.h1>
              <motion.p
                className="home-welcome-subline"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                What's we cookin' today?
              </motion.p>

              <motion.button
                className="start-project-btn"
                onClick={handleNewProject}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Start a New Project
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* PROJECTS TAB */}
        {activeTab === 'projects' && (
          <motion.div
            className="tab-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="content-header">
              <h1>My Projects</h1>
              <p>Manage and review your code analysis projects</p>
            </div>

            {/* Search Results Info */}
            {searchQuery && (
              <div className="search-results-info">
                {filteredProjects.length === 0 ? (
                  <p>No projects found for "{searchQuery}"</p>
                ) : (
                  <p>Found {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} matching "{searchQuery}"</p>
                )}
              </div>
            )}

            <div className="projects-grid">
              {/* New Project Card - Always show if no search query */}
              {!searchQuery && (
                <motion.div
                  className="project-card new-project-card"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNewProject}
                >
                  <div className="new-project-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                  <h3>New Analysis</h3>
                  <p>Start a new code review</p>
                </motion.div>
              )}

              {/* Loading State */}
              {isLoadingProjects && (
                <div className="loading-message">Loading projects...</div>
              )}

              {/* Render filtered projects from database */}
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  className="project-card"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className={`project-icon ${project.language || 'python'}`}>
                    {getLanguageIcon(project.language)}
                  </div>
                  <div className="project-info">
                    <h3>{project.name}</h3>
                    <p>{project.description || `Last updated: ${formatDate(project.updated_at)}`}</p>
                    <div className="project-stats">
                      <span className="stat language">{project.language || 'Python'}</span>
                      <span className="stat analyses">{project.analysis_count || 0} Analyses</span>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Empty state when no projects and not loading */}
              {!isLoadingProjects && projects.length === 0 && !searchQuery && (
                <div className="empty-projects-message">
                  <p>You don't have any projects yet. Start a new analysis to create one!</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <motion.div
            className="tab-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="content-header">
              <h1>Analysis History</h1>
              <p>View your past code analysis results</p>
            </div>

            {/* Search Results Info */}
            {searchQuery && (
              <div className="search-results-info">
                {filteredHistory.length === 0 ? (
                  <p>No history found for "{searchQuery}"</p>
                ) : (
                  <p>Found {filteredHistory.length} result{filteredHistory.length !== 1 ? 's' : ''} matching "{searchQuery}"</p>
                )}
              </div>
            )}

            {/* Loading State */}
            {isLoadingHistory && (
              <div className="loading-message">Loading history...</div>
            )}

            <div className="history-list">
              {/* Render filtered history from database */}
              {filteredHistory.map((item) => (
                <div key={item.id} className="history-item">
                  <div className="history-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14,2 14,8 20,8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10,9 9,9 8,9" />
                    </svg>
                  </div>
                  <div className="history-info">
                    <h4>{item.code_snippet}</h4>
                    <p>{item.language} - {formatDate(item.created_at)}</p>
                  </div>
                  <div className="history-score">
                    <span className={`score ${item.score >= 80 ? 'good' : item.score >= 50 ? 'average' : 'poor'}`}>
                      {item.score || 'N/A'}
                    </span>
                  </div>
                </div>
              ))}

              {/* Empty state when no history and not loading */}
              {!isLoadingHistory && history.length === 0 && !searchQuery && (
                <div className="empty-history-message">
                  <p>No analysis history yet. Start analyzing code to build your history!</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <motion.div
            className="tab-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="content-header">
              <h1>Settings</h1>
              <p>Manage your account and preferences</p>
            </div>

            <div className="settings-sections">
              <div className="settings-section">
                <h3>Profile</h3>
                <div className="settings-card">
                  <div className="profile-settings">
                    {user?.picture ? (
                      <img src={user.picture} alt={user.name} className="settings-avatar" />
                    ) : (
                      <div className="settings-avatar-placeholder">
                        {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div className="profile-info">
                      <h4>{user?.name || 'User'}</h4>
                      <p>{user?.email}</p>
                      <span className="provider-badge">
                        {user?.provider === 'google' ? 'Google Account' :
                         user?.provider === 'github' ? 'GitHub Account' : 'Email'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h3>Preferences</h3>
                <div className="settings-card">
                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Default Language</h4>
                      <p>Set your preferred programming language</p>
                    </div>
                    <select className="setting-select">
                      <option value="python">Python</option>
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="java">Java</option>
                    </select>
                  </div>
                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Email Notifications</h4>
                      <p>Receive email updates about your analyses</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h3>Account</h3>
                <div className="settings-card">
                  <button className="danger-btn" onClick={handleLogout}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                      <polyline points="16,17 21,12 16,7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default HomePage;
