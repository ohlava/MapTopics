import { useState } from 'react';
import { Moon, Sun, User, Key, Palette } from 'lucide-react';
import './SettingsView.css';

const SettingsView = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [knowledgeLevel, setKnowledgeLevel] = useState('intermediate');

  return (
    <div className="settings-view">
      <div className="settings-container">
        <div className="settings-header">
          <h2>Settings</h2>
          <p>Customize your learning experience</p>
        </div>

        <div className="settings-sections">
          {/* General Settings */}
          <div className="settings-section">
            <h3>General</h3>
            
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-icon">
                  {darkMode ? <Moon size={20} /> : <Sun size={20} />}
                </div>
                <div>
                  <h4>Theme</h4>
                  <p>Choose your preferred theme</p>
                </div>
              </div>
              <button 
                className="toggle-button"
                onClick={() => setDarkMode(!darkMode)}
              >
                {darkMode ? 'Dark' : 'Light'}
              </button>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-icon">
                  <Key size={20} />
                </div>
                <div>
                  <h4>API Keys</h4>
                  <p>Manage your API configurations</p>
                </div>
              </div>
              <button className="settings-button">Configure</button>
            </div>
          </div>

          {/* Learning Preferences */}
          <div className="settings-section">
            <h3>Learning Preferences</h3>
            
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-icon">
                  <User size={20} />
                </div>
                <div>
                  <h4>Knowledge Level</h4>
                  <p>Adjust content complexity</p>
                </div>
              </div>
              <select 
                value={knowledgeLevel}
                onChange={(e) => setKnowledgeLevel(e.target.value)}
                className="settings-select"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-icon">
                  <Palette size={20} />
                </div>
                <div>
                  <h4>Content Sources</h4>
                  <p>Choose information sources</p>
                </div>
              </div>
              <button className="settings-button">Customize</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
