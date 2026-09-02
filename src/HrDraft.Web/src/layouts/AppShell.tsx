import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BrandLogo, Drawer, Menu } from '../components';
import type { MenuAction } from '../components';
import { useAppConfig } from '../config/ConfigProvider';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { mockCurrentUser } from '../mocks/mockData';

const NAV = [
  { to: '/', label: 'Tools', shortLabel: 'Tools' },
  { to: '/history', label: 'History', shortLabel: 'History' },
  { to: '/profile', label: 'Company profile', shortLabel: 'Profile' },
];

export function AppShell() {
  const breakpoint = useBreakpoint();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const { branding } = useAppConfig();
  const user = mockCurrentUser;
  const quota = `${user.generationsToday} / ${user.dailyGenerationLimit} generations today`;

  const accountActions: MenuAction[] = [
    { id: 'profile', label: 'Company profile', onSelect: () => navigate('/profile') },
    ...(user.role === 'HrAdmin'
      ? [{ id: 'access', label: 'Team access', onSelect: () => navigate('/admin/access') }]
      : []),
    { id: 'signout', label: 'Sign out', onSelect: () => navigate('/login') },
  ];

  const isPhone = breakpoint === 'phone';

  return (
    <div className="app-frame">
      <header className="topbar chrome-pad">
        <div className="topbar-left">
          <Link to="/" className="topbar-brand">
            <BrandLogo surface="dark" size="sm" />
          </Link>

          {/* The product name is desktop-only — tablet needs the room. */}
          {breakpoint === 'desktop' ? (
            <span className="topbar-eyebrow">{branding.productName}</span>
          ) : null}

          {!isPhone
            ? NAV.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.to === '/'} className="topbar-link">
                  {breakpoint === 'tablet' ? item.shortLabel : item.label}
                </NavLink>
              ))
            : null}
        </div>

        <div className="topbar-right">
          <span className="topbar-quota">
            {isPhone ? `${user.generationsToday}/${user.dailyGenerationLimit}` : quota}
          </span>

          <div className="topbar-account">
            <button
              type="button"
              className="avatar avatar-button"
              aria-haspopup="menu"
              aria-expanded={accountOpen}
              aria-label={`Account menu for ${user.displayName}`}
              onClick={() => setAccountOpen((o) => !o)}
            >
              {user.initials}
            </button>
            <Menu
              open={accountOpen}
              label="Account"
              actions={accountActions}
              onClose={() => setAccountOpen(false)}
              header={
                <>
                  <div className="menu-header-name">{user.displayName}</div>
                  <div className="text-muted menu-header-role">
                    {branding.departmentName} · {user.role === 'HrAdmin' ? 'Admin' : 'User'}
                  </div>
                </>
              }
            />
          </div>

          {isPhone ? (
            <button
              type="button"
              className="hamburger"
              aria-label="Open navigation"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(true)}
            >
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </header>

      <Drawer open={drawerOpen} label="Navigation" onClose={() => setDrawerOpen(false)}>
        <BrandLogo surface="dark" size="sm" />
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className="drawer-link"
            onClick={() => setDrawerOpen(false)}
          >
            {item.label}
          </NavLink>
        ))}
        <Link to="/login" className="drawer-link" onClick={() => setDrawerOpen(false)}>
          Sign out
        </Link>
        <span className="drawer-footer">{quota}</span>
      </Drawer>

      {/* The grid paper is painted once, here, so it fills the viewport whatever
          the page's height. Painting it per page left flat gaps below and beside
          short content, and two stacked layers never aligned their origins. */}
      <main className="app-content paper">
        {/* Keyed on the path so same-route navigations (one draft to another)
            remount rather than carry stale form state across. No transition
            animation — navigation is instant by choice. */}
        <div key={location.pathname} className="page-frame">
          <Outlet />
        </div>
      </main>

      {/* Phone gets a persistent tab bar; the drawer covers the rest. */}
      {isPhone ? (
        <nav className="tabbar" aria-label="Sections">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className="tabbar-item"
            >
              {item.shortLabel}
            </NavLink>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
