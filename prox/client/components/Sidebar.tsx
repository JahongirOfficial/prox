import React, { useState } from 'react';

const SidebarContext = React.createContext({
  isOpen: false,
  setIsOpen: () => {},
  activeTab: 'Bosh sahifa',
  setActiveTab: () => {},
  activeProject: '',
  setActiveProject: () => {},
  isLoggedIn: false,
  setIsLoggedIn: () => {}
});

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Bosh sahifa');
  const [activeProject, setActiveProject] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <SidebarContext.Provider value={{
      isOpen,
      setIsOpen,
      activeTab,
      setActiveTab,
      activeProject,
      setActiveProject,
      isLoggedIn,
      setIsLoggedIn
    }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function SidebarInset({ children, className = '' }) {
  return (
    <div className={`flex-1 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
}

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
