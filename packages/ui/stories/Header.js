import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from 'react/jsx-runtime'

import { Button } from './Button'
import './header.css'
export const Header = ({ user, onLogin, onLogout, onCreateAccount }) =>
  _jsx('header', {
    children: _jsxs('div', {
      className: 'storybook-header',
      children: [
        _jsxs('div', {
          children: [
            _jsx('svg', {
              width: '32',
              height: '32',
              viewBox: '0 0 32 32',
              xmlns: 'http://www.w3.org/2000/svg',
              children: _jsxs('g', {
                fill: 'none',
                fillRule: 'evenodd',
                children: [
                  _jsx('path', {
                    d: 'M10 0h12a10 10 0 0110 10v12a10 10 0 01-10 10H10A10 10 0 010 22V10A10 10 0 0110 0z',
                    fill: '#FFF',
                  }),
                  _jsx('path', {
                    d: 'M5.3 10.6l10.4 6v11.1l-10.4-6v-11zm11.4-6.2l9.7 5.5-9.7 5.6V4.4z',
                    fill: '#555AB9',
                  }),
                  _jsx('path', {
                    d: 'M27.2 10.6v11.2l-10.5 6V16.5l10.5-6zM15.7 4.4v11L6 10l9.7-5.5z',
                    fill: '#91BAF8',
                  }),
                ],
              }),
            }),
            _jsx('h1', { children: 'Acme' }),
          ],
        }),
        _jsx('div', {
          children: user
            ? _jsxs(_Fragment, {
                children: [
                  _jsxs('span', {
                    className: 'welcome',
                    children: ['Welcome, ', _jsx('b', { children: user.name }), '!'],
                  }),
                  _jsx(Button, { size: 'small', onClick: onLogout, label: 'Log out' }),
                ],
              })
            : _jsxs(_Fragment, {
                children: [
                  _jsx(Button, { size: 'small', onClick: onLogin, label: 'Log in' }),
                  _jsx(Button, {
                    primary: true,
                    size: 'small',
                    onClick: onCreateAccount,
                    label: 'Sign up',
                  }),
                ],
              }),
        }),
      ],
    }),
  })
//# sourceMappingURL=Header.js.map
