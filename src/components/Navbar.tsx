import { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, Menu, X, BookmarkCheck, Sliders, Info, Sparkles, ClipboardList, RotateCcw } from 'lucide-react';
import { clearAll } from '../services/storage';

export type Page = 'dashboard' | 'tracker' | 'resources' | 'preferences' | 'saved';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  savedCount: number;
  onOpenDiscovery?: () => void;
}

export function Navbar({ currentPage, onNavigate, savedCount, onOpenDiscovery }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readNotifications, setReadNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNav = (p: Page) => {
    onNavigate(p);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  const handleResetStorage = () => {
    if (window.confirm('Reset all saved bookmarks, tracker pipeline statuses, and student preferences?')) {
      clearAll();
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F8F6F0] border-b border-[#EAE6DF] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mark + Wordmark */}
          <button
            onClick={() => handleNav('dashboard')}
            className="flex items-center gap-2.5 group cursor-pointer text-left focus:outline-none"
            aria-label="Upnext — Home"
          >
            {/* 4-point mark */}
            <div className="w-8 h-8 flex items-center justify-center text-[#10294F] group-hover:scale-105 transition-transform">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L13.8 9.2L21 11L13.8 12.8L12 20L10.2 12.8L3 11L10.2 9.2L12 2Z" />
              </svg>
            </div>
            <span className="font-serif font-bold text-xl text-[#10294F] tracking-tight">
              Upnext
            </span>
          </button>

          {/* Center: Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8" aria-label="Main Navigation">
            <button
              onClick={() => handleNav('dashboard')}
              className={`relative py-5 text-sm font-medium transition-colors cursor-pointer ${
                currentPage === 'dashboard'
                  ? 'text-[#10294F] font-semibold'
                  : 'text-[#5E6E82] hover:text-[#10294F]'
              }`}
            >
              Discover
              {currentPage === 'dashboard' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C2935D] rounded-full" />
              )}
            </button>

            <button
              onClick={() => handleNav('tracker')}
              className={`relative py-5 text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentPage === 'tracker'
                  ? 'text-[#10294F] font-semibold'
                  : 'text-[#5E6E82] hover:text-[#10294F]'
              }`}
            >
              My Pursuit Plan
              {savedCount > 0 && (
                <span className="bg-[#EBF3FA] text-[#1E5B99] text-xs font-semibold px-1.5 py-0.2 rounded-full border border-[#D5E4F2]">
                  {savedCount}
                </span>
              )}
              {currentPage === 'tracker' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C2935D] rounded-full" />
              )}
            </button>

            <button
              onClick={() => handleNav('resources')}
              className={`relative py-5 text-sm font-medium transition-colors cursor-pointer ${
                currentPage === 'resources'
                  ? 'text-[#10294F] font-semibold'
                  : 'text-[#5E6E82] hover:text-[#10294F]'
              }`}
            >
              Resources
              {currentPage === 'resources' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C2935D] rounded-full" />
              )}
            </button>
          </nav>

          {/* Right: Notifications & Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-[#5E6E82] hover:text-[#10294F] hover:bg-black/5 rounded-full transition-colors cursor-pointer"
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
              >
                <Bell size={18} />
                {!readNotifications && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#1E5B99]" />
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-[#E8E4DC] p-3.5 text-sm z-50 animate-in fade-in space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#F0ECE1]">
                    <span className="font-semibold text-xs text-[#10294F]">Upnext Alerts</span>
                    <button
                      onClick={() => setReadNotifications(true)}
                      className="text-[11px] text-[#8E9BAE] hover:text-[#10294F] cursor-pointer"
                    >
                      Mark all read
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-[#F8F6F0] border border-[#EAE6DF]">
                      <p className="font-semibold text-[#10294F] text-[11px]">Curated Demo Catalog Active</p>
                      <p className="text-[#5E6E82] text-[11px] mt-0.5">
                        Seed data contains 14 historical Indian opportunity benchmarks. Zero unverified records are marked as confirmed open.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#EBF3FA] border border-[#D5E4F2]">
                      <p className="font-semibold text-[#1E5B99] text-[11px]">TinyFish Discovery Armed</p>
                      <p className="text-[#5E6E82] text-[11px] mt-0.5">
                        Live agent endpoint prepared at server level. Mock provider available for immediate testing.
                      </p>
                    </div>

                    {savedCount > 0 && (
                      <div className="p-2.5 rounded-lg bg-[#EBF5F0] border border-[#D2E8DC]">
                        <p className="font-semibold text-[#1D6E42] text-[11px]">Pursuit Plan Status</p>
                        <p className="text-[#5E6E82] text-[11px] mt-0.5">
                          You have {savedCount} opportunity record{savedCount > 1 ? 's' : ''} in your pursuit plan.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full hover:bg-black/5 transition-colors cursor-pointer text-[#10294F]"
                aria-expanded={profileDropdownOpen}
                aria-haspopup="true"
              >
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  alt="Student avatar"
                  className="w-7 h-7 rounded-full object-cover border border-[#EAE6DF]"
                />
                <span className="text-sm font-medium text-[#10294F]">Student</span>
                <ChevronDown size={14} className="text-[#5E6E82]" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#E8E4DC] py-1.5 text-sm z-50 animate-in fade-in">
                  <div className="px-3 py-2 border-b border-[#F0ECE1]">
                    <p className="font-semibold text-xs text-[#10294F]">Student Profile</p>
                    <p className="text-[11px] text-[#5E6E82]">College Student • India</p>
                  </div>

                  <button
                    onClick={() => handleNav('preferences')}
                    className="w-full px-3 py-2 text-left text-xs text-[#10294F] hover:bg-[#F8F6F0] flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Sliders size={14} className="text-[#5E6E82]" />
                    Student Profile &amp; Fit
                  </button>

                  <button
                    onClick={() => handleNav('tracker')}
                    className="w-full px-3 py-2 text-left text-xs text-[#10294F] hover:bg-[#F8F6F0] flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <ClipboardList size={14} className="text-[#5E6E82]" />
                      My Pursuit Plan
                    </span>
                    {savedCount > 0 && (
                      <span className="text-[11px] bg-[#EBF3FA] text-[#1E5B99] px-1.5 rounded-full font-medium">
                        {savedCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => handleNav('saved')}
                    className="w-full px-3 py-2 text-left text-xs text-[#10294F] hover:bg-[#F8F6F0] flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <BookmarkCheck size={14} className="text-[#5E6E82]" />
                      Saved Opportunities
                    </span>
                  </button>

                  {onOpenDiscovery && (
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenDiscovery();
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-[#1E5B99] hover:bg-[#EBF3FA] flex items-center gap-2 transition-colors cursor-pointer font-medium"
                    >
                      <Sparkles size={14} className="text-[#1E5B99]" />
                      Live Web Discovery
                    </button>
                  )}

                  <div className="border-t border-[#F0ECE1] my-1" />

                  <button
                    onClick={handleResetStorage}
                    className="w-full px-3 py-2 text-left text-xs text-[#B93825] hover:bg-[#FDF2F0] flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <RotateCcw size={13} className="text-[#B93825]" />
                    Reset Local Storage
                  </button>

                  <div className="px-3 py-1.5 text-[10px] text-[#8E9BAE] flex items-center gap-1.5">
                    <Info size={11} />
                    <span>LocalStorage persistent</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#10294F] hover:bg-black/5 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#EAE6DF] bg-[#F8F6F0] px-4 py-3 space-y-2">
          <button
            onClick={() => handleNav('dashboard')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
              currentPage === 'dashboard'
                ? 'bg-white text-[#10294F] font-semibold shadow-xs'
                : 'text-[#5E6E82] hover:text-[#10294F]'
            }`}
          >
            Discover
          </button>

          <button
            onClick={() => handleNav('tracker')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between ${
              currentPage === 'tracker'
                ? 'bg-white text-[#10294F] font-semibold shadow-xs'
                : 'text-[#5E6E82] hover:text-[#10294F]'
            }`}
          >
            <span>My Pursuit Plan</span>
            {savedCount > 0 && (
              <span className="bg-[#EBF3FA] text-[#1E5B99] text-xs font-semibold px-2 py-0.5 rounded-full">
                {savedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleNav('preferences')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
              currentPage === 'preferences'
                ? 'bg-white text-[#10294F] font-semibold shadow-xs'
                : 'text-[#5E6E82] hover:text-[#10294F]'
            }`}
          >
            Student Profile &amp; Fit
          </button>

          <button
            onClick={() => handleNav('saved')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
              currentPage === 'saved'
                ? 'bg-white text-[#10294F] font-semibold shadow-xs'
                : 'text-[#5E6E82] hover:text-[#10294F]'
            }`}
          >
            Saved Opportunities ({savedCount})
          </button>

          <button
            onClick={() => handleNav('resources')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
              currentPage === 'resources'
                ? 'bg-white text-[#10294F] font-semibold shadow-xs'
                : 'text-[#5E6E82] hover:text-[#10294F]'
            }`}
          >
            Resources
          </button>

          {onOpenDiscovery && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDiscovery();
              }}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-[#1E5B99] bg-[#EBF3FA] flex items-center gap-2"
            >
              <Sparkles size={16} />
              <span>Web Discovery</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}
