import { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { DashboardScreen } from './components/DashboardScreen';
import { ReportsScreen } from './components/ReportsScreen';
import { AuditScreen } from './components/AuditScreen';
import { SettingsModal } from './components/SettingsModal';
import { AuthScreen } from './components/AuthScreen';
import { UserManual } from './components/UserManual';
import { CommandPalette } from './components/CommandPalette';
import { CSVImport } from './components/CSVImport';
import { TaskTemplatesModal } from './components/TaskTemplatesModal';
import { AIProjectGenerator } from './components/AIProjectGenerator';
import { CelebrationConfetti, SuccessAnimation } from './components/CelebrationConfetti';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import type { TaskTemplate } from './data/taskTemplates';
import { ProjectManager, type Project } from './components/ProjectManager';
import type { Task } from './components/TaskTable';
import * as api from './services/api';

export interface Settings {
  hourlyRate: number;
  companyName: string;
  companyTagline: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  footerText: string;
}

export type Screen = 'dashboard' | 'projects' | 'reports' | 'audit';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState<Settings>({
    hourlyRate: 66,
    companyName: 'Plataforma Technologies',
    companyTagline: 'PCI Engine',
    logoUrl: '',
    primaryColor: '#2BBBEF',
    secondaryColor: '#4AFFA8',
    accentColor: '#010029',
    footerText: 'PCI Engine by Plataforma Technologies — AI-Powered Project Accuracy Modeling',
  });

  // New feature states
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [aiProjectGeneratorOpen, setAiProjectGeneratorOpen] = useState(false);

  // Project management states
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Load settings from backend
  useEffect(() => {
    if (isAuthenticated) {
      loadSettings();
    }
  }, [isAuthenticated]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command Palette: Ctrl/Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const checkAuth = async () => {
    try {
      const { user } = await api.getSession();
      setIsAuthenticated(!!user);
      setUser(user);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const loadSettings = async () => {
    try {
      const loadedSettings = await api.getSettings();
      if (loadedSettings) {
        setSettings(loadedSettings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleAuthSuccess = async (user: any) => {
    setIsAuthenticated(true);
    await loadSettings();
  };

  const handleLogout = async () => {
    try {
      await api.signOut();
      setIsAuthenticated(false);
      setCurrentScreen('dashboard');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSettingsSave = async (newSettings: Settings) => {
    try {
      await api.updateSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  };

  // Command palette action handler
  const handleCommandAction = (action: string) => {
    switch (action) {
      case 'new-task':
        // This will be handled by DashboardScreen - trigger via event or state
        setCurrentScreen('dashboard');
        break;
      case 'generate-proposal':
        setCurrentScreen('dashboard');
        break;
      case 'export-csv':
        // Will be handled by current screen
        break;
      case 'import-csv':
        setCsvImportOpen(true);
        break;
      case 'template-ecommerce':
      case 'template-mobile':
      case 'template-api':
      case 'template-saas':
        setTemplatesOpen(true);
        break;
      default:
        break;
    }
  };

  // CSV import handler
  const handleCSVImport = (tasks: any[]) => {
    setShowConfetti(true);
    setSuccessMessage(`Successfully imported ${tasks.length} tasks!`);
    setShowSuccess(true);
    // Tasks will be handled by DashboardScreen through events
  };

  // Template selection handler
  const handleTemplateSelect = (template: TaskTemplate) => {
    setShowConfetti(true);
    setSuccessMessage(`Loaded ${template.tasks.length} tasks from ${template.name} template!`);
    setShowSuccess(true);
    // Template tasks will be handled by DashboardScreen
  };

  // Handle project selection
  const handleProjectSelect = async (projectId: string | null) => {
    setCurrentProjectId(projectId);
    setCurrentScreen('dashboard'); // Switch to dashboard when changing projects
  };

  // Handle project creation
  const handleProjectCreate = (project: Project) => {
    setCurrentProjectId(project.id);
    setShowConfetti(true);
    setSuccessMessage(`Project "${project.name}" created successfully!`);
    setShowSuccess(true);
  };

  // Handle AI-generated project
  const handleAIProjectGenerated = async (project: Project, tasks: Task[]) => {
    try {
      // Save the project to backend
      await api.createProject(project);
      
      // Save the tasks to the project
      await api.saveProjectTasks(project.id, tasks);
      
      // Set as current project
      setCurrentProjectId(project.id);
      setCurrentScreen('dashboard');
      
      // Show celebration
      setShowConfetti(true);
      setSuccessMessage(`AI generated "${project.name}" with ${tasks.length} tasks!`);
      setShowSuccess(true);
    } catch (error) {
      console.error('Failed to save AI-generated project:', error);
      alert('Failed to save project. Please try again.');
    }
  };

  // Show auth screen if checking or not authenticated
  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#010029]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#2BBBEF] border-t-transparent"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-white dark:bg-[#010029]">
          <Navigation
            currentScreen={currentScreen}
            onNavigate={setCurrentScreen}
            onSettingsClick={() => setSettingsOpen(true)}
            onHowToUseClick={() => setShowGuide(true)}
            onSignOut={handleLogout}
            user={user}
            settings={settings}
            currentProjectId={currentProjectId}
            onProjectSelect={handleProjectSelect}
            onProjectCreate={handleProjectCreate}
            onAIGenerateClick={() => setAiProjectGeneratorOpen(true)}
          />
          
          <main className="container mx-auto px-6 py-8">
            {currentScreen === 'dashboard' && <DashboardScreen settings={settings} currentProjectId={currentProjectId} />}
            {currentScreen === 'projects' && (
              <ProjectManager
                currentProjectId={currentProjectId}
                onProjectSelect={handleProjectSelect}
                onProjectCreate={handleProjectCreate}
                onAIGenerateClick={() => setAiProjectGeneratorOpen(true)}
              />
            )}
            {currentScreen === 'reports' && <ReportsScreen settings={settings} />}
            {currentScreen === 'audit' && <AuditScreen settings={settings} />}
          </main>

          {settingsOpen && (
            <SettingsModal
              isOpen={settingsOpen}
              onClose={() => setSettingsOpen(false)}
              settings={settings}
              onSave={handleSettingsSave}
            />
          )}

          {showGuide && (
            <UserManual
              isOpen={showGuide}
              onClose={() => setShowGuide(false)}
            />
          )}

          {commandPaletteOpen && (
            <CommandPalette
              isOpen={commandPaletteOpen}
              onClose={() => setCommandPaletteOpen(false)}
              onNavigate={(screen) => setCurrentScreen(screen as Screen)}
              onAction={handleCommandAction}
            />
          )}

          {csvImportOpen && (
            <CSVImport
              isOpen={csvImportOpen}
              onClose={() => setCsvImportOpen(false)}
              onImport={handleCSVImport}
            />
          )}

          {templatesOpen && (
            <TaskTemplatesModal
              isOpen={templatesOpen}
              onClose={() => setTemplatesOpen(false)}
              onSelectTemplate={handleTemplateSelect}
            />
          )}

          {aiProjectGeneratorOpen && (
            <AIProjectGenerator
              isOpen={aiProjectGeneratorOpen}
              onClose={() => setAiProjectGeneratorOpen(false)}
              onProjectGenerated={handleAIProjectGenerated}
            />
          )}

          {showConfetti && <CelebrationConfetti />}
          {showSuccess && (
            <SuccessAnimation
              message={successMessage}
              onClose={() => setShowSuccess(false)}
            />
          )}
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;