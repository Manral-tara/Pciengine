import { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, ListChecks, FileBarChart, Settings, ChevronDown, LogOut, BookOpen, Languages, Check, Command, FolderOpen } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useTranslation, type Language } from '../contexts/LanguageContext';
import { ProjectManager } from './ProjectManager';
import type { Project } from './ProjectManager';
import type { Screen } from '../App';
import type { Settings as AppSettings } from '../App';

interface NavigationProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  onSettingsClick: () => void;
  onSignOut: () => void;
  onHowToUseClick: () => void;
  user: any;
  settings?: AppSettings;
  currentProjectId: string | null;
  onProjectSelect: (projectId: string | null) => void;
  onProjectCreate: (project: Project) => void;
  onAIGenerateClick?: () => void;
}

export function Navigation({ currentScreen, onNavigate, onSettingsClick, onSignOut, onHowToUseClick, user, settings, currentProjectId, onProjectSelect, onProjectCreate, onAIGenerateClick }: NavigationProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t, language, setLanguage } = useTranslation();

  // Use branding from settings or defaults
  const primaryColor = settings?.primaryColor || '#2BBBEF';
  const secondaryColor = settings?.secondaryColor || '#4AFFA8';
  const accentColor = settings?.accentColor || '#010029';
  const companyName = settings?.companyName || 'Plataforma Technologies';
  const companyTagline = settings?.companyTagline || 'PCI Engine';
  const logoUrl = settings?.logoUrl || '';

  // Get initials from company name for logo fallback
  const getCompanyInitials = () => {
    return companyName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
        setShowLanguageMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { id: 'dashboard' as Screen, label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'projects' as Screen, label: 'Projects', icon: FolderOpen },
    { id: 'audit' as Screen, label: 'Audit', icon: ListChecks },
    { id: 'reporting' as Screen, label: t('nav.reporting'), icon: FileBarChart },
  ];

  const getUserInitials = () => {
    const name = user?.user_metadata?.name || user?.email || 'User';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getUserName = () => {
    return user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  };

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: t('lang.english'), flag: '🇺🇸' },
    { code: 'es', name: t('lang.spanish'), flag: '🇪🇸' },
    { code: 'pt', name: t('lang.portuguese'), flag: '🇧🇷' },
    { code: 'fr', name: t('lang.french'), flag: '🇫🇷' },
    { code: 'de', name: t('lang.german'), flag: '🇩🇪' },
    { code: 'zh', name: t('lang.chinese'), flag: '🇨🇳' },
    { code: 'ja', name: t('lang.japanese'), flag: '🇯🇵' },
  ];

  const currentLanguageName = languages.find(lang => lang.code === language);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white px-6 py-4 dark:border-white/10 dark:bg-[#0C0F2C]">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={`${companyName} logo`}
                className="h-10 w-10 rounded-lg object-cover"
                onError={(e) => {
                  // Fallback to initials if image fails to load
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-white"
              style={{ 
                backgroundImage: `linear-gradient(to bottom right, ${primaryColor}, ${secondaryColor})`,
                display: logoUrl ? 'none' : 'flex'
              }}
            >
              <span>{getCompanyInitials()}</span>
            </div>
            <div>
              <div className="text-[#010029] dark:text-white">{companyName}</div>
              <div className="text-gray-500 dark:text-gray-400" style={{ fontSize: '12px' }}>{companyTagline}</div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-colors ${
                    currentScreen === item.id
                      ? 'bg-gray-100 text-[#010029] dark:bg-[#161A3A] dark:text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-[#161A3A] dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          {/* Project Selector */}
          <ProjectManager
            currentProjectId={currentProjectId}
            onProjectSelect={onProjectSelect}
            onProjectCreate={onProjectCreate}
            onAIGenerateClick={onAIGenerateClick}
            compact
          />

          {/* Command Palette Hint */}
          <div className="hidden items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-600 transition-all hover:border-[#2BBBEF] hover:bg-[#2BBBEF]/10 md:flex dark:border-white/10 dark:bg-[#161A3A] dark:text-gray-400 dark:hover:border-[#2BBBEF]">
            <Command className="h-3.5 w-3.5" />
            <kbd className="rounded bg-white px-2 py-0.5 text-xs font-semibold text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-300">
              ⌘K
            </kbd>
            <span className="text-xs">Quick Access</span>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />
          
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-[#161A3A]"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] text-white">
                {getUserInitials()}
              </div>
              <span className="text-gray-900 dark:text-white">{getUserName()}</span>
              <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-white/10 dark:bg-[#161A3A] dark:shadow-[0_0_30px_rgba(74,255,168,0.15)]">
                <div className="border-b border-gray-100 px-4 py-3 dark:border-white/10">
                  <div className="text-gray-900 dark:text-white">{getUserName()}</div>
                  <div className="text-gray-500 dark:text-gray-400" style={{ fontSize: '13px' }}>{user?.email}</div>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onSettingsClick();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-[#0C0F2C]"
                  >
                    <Settings className="h-4 w-4" />
                    {t('nav.settings')}
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onHowToUseClick();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-[#0C0F2C]"
                  >
                    <BookOpen className="h-4 w-4" />
                    {t('nav.howToUse')}
                  </button>
                  
                  {/* Language Selector */}
                  <div className="relative">
                    <button
                      onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                      className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-[#0C0F2C]"
                    >
                      <div className="flex items-center gap-2">
                        <Languages className="h-4 w-4" />
                        {t('nav.language')}
                      </div>
                      <div className="flex items-center gap-1">
                        <span style={{ fontSize: '13px' }}>
                          {currentLanguageName?.flag} {currentLanguageName?.name}
                        </span>
                        <ChevronDown className={`h-3 w-3 transition-transform ${showLanguageMenu ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                    
                    {/* Language Submenu */}
                    {showLanguageMenu && (
                      <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-white/5 dark:bg-[#0C0F2C]">
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              setLanguage(lang.code);
                              setShowLanguageMenu(false);
                            }}
                            className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 transition-colors ${
                              language === lang.code
                                ? 'bg-gradient-to-r from-[#4AFFA8]/10 to-[#2BBBEF]/10 text-[#2BBBEF] dark:from-[#4AFFA8]/20 dark:to-[#2BBBEF]/20 dark:text-[#4AFFA8]'
                                : 'text-gray-600 hover:bg-white dark:text-gray-400 dark:hover:bg-[#161A3A]'
                            }`}
                          >
                            <span className="flex items-center gap-2" style={{ fontSize: '13px' }}>
                              <span>{lang.flag}</span>
                              <span>{lang.name}</span>
                            </span>
                            {language === lang.code && (
                              <Check className="h-4 w-4 text-[#4AFFA8]" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="my-1 border-t border-gray-100 dark:border-white/10" />
                  
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onSignOut();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="h-4 w-4" />
                    {t('nav.signOut')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}