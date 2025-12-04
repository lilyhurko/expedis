import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Trips from './components/Trips';

jest.mock('./components/OfferCard', () => (props) => (
  <div data-testid="offer-card">
    <h3>{props.offer.title}</h3>
    <span>{props.offer.price}</span>
  </div>
));

jest.mock('./components/UserNavbar', () => () => <div>UserNavbar</div>);
jest.mock('./components/Navbar', () => () => <div>Navbar</div>);
jest.mock('./components/Footer2', () => () => <div>Footer</div>);
jest.mock('./components/TripSearchFilter', () => () => <div>Filter</div>);

beforeEach(() => {
  fetch.mockClear();
});

describe('Trips Component', () => {
  test('renders offers list after fetch', async () => {
    const fakeOffers = [
      {
        _id: '123',
        title: 'Super Trip Test',
        city: 'Kyiv',
        country: 'Ukraine',
        price: 300,
        duration: 7,
        imageUrls: ['img.jpg'],
        status: 'active'
      }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => fakeOffers,
    });

    render(
      <MemoryRouter>
        <Trips />
      </MemoryRouter>
    );


    expect(screen.getByText(/Loading/i)).toBeInTheDocument();

 
    const offerTitle = await screen.findByText('Super Trip Test');
    expect(offerTitle).toBeInTheDocument();

    const offerPrice = await screen.findByText('300');
    expect(offerPrice).toBeInTheDocument();
  });
});