import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppWrapper } from './App'; 

jest.mock('./components/Home', () => () => <div>Home Page Mock</div>);
jest.mock('./components/Login', () => () => <div>Login Page Mock</div>);
jest.mock('./components/Trips', () => () => <div>Trips Page Mock</div>);
jest.mock('./components/RentCar', () => () => <div>Rent Car Mock</div>);
jest.mock('./components/About', () => () => <div>About Mock</div>);
jest.mock('./components/Register', () => () => <div>Register Mock</div>);
jest.mock('./components/TripDetails', () => () => <div>Trip Details Mock</div>);

jest.mock('./layouts/UserLayout', () => {
  const { Outlet } = require('react-router-dom');
  return () => <div>User Layout Mock <Outlet /></div>;
});

jest.mock('./layouts/GuestLayout', () => {
  const { Outlet } = require('react-router-dom');
  return () => <div>Guest Layout Mock <Outlet /></div>;
});

describe('App Routing', () => {
  test('renders Home page on default route "/"', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppWrapper />
      </MemoryRouter>
    );
    expect(screen.getByText('Home Page Mock')).toBeInTheDocument();
  });

  test('renders Login page on "/login" route', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <AppWrapper />
      </MemoryRouter>
    );
    expect(screen.getByText('Login Page Mock')).toBeInTheDocument();
  });
});