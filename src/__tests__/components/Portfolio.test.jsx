/** @jest-environment jsdom */
/* eslint-disable no-undef */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PortfolioCard } from '../../components/Portfolio';

jest.mock('../../components/lazy-image', () => function LazyImage() { return null; });

describe('PortfolioCard link rendering', () => {
  test('renders one desktop icon and one github icon for single-string links', () => {
    render(
        <PortfolioCard item={{
          project_name: 'Solo Links',
          image: '',
          text: '',
          link_live: 'https://example.com/live',
          link_github: 'https://github.com/example/repo',
        }}
        />,
    );
    const liveLinks = screen.getAllByLabelText('查看正式網站');
    const githubLinks = screen.getAllByLabelText('查看 Prototype');
    expect(liveLinks).toHaveLength(1);
    expect(liveLinks[0]).toHaveAttribute('href', 'https://example.com/live');
    expect(liveLinks[0]).toHaveAttribute('title', '查看正式網站');
    expect(githubLinks).toHaveLength(1);
    expect(githubLinks[0]).toHaveAttribute('href', 'https://github.com/example/repo');
    expect(githubLinks[0]).toHaveAttribute('title', '查看 Prototype');
  });

  test('renders multiple desktop icons when link_live is an array', () => {
    render(
        <PortfolioCard item={{
          project_name: 'Multi Live',
          image: '',
          text: '',
          link_live: ['https://example.com/a', 'https://example.com/b'],
          link_github: '',
        }}
        />,
    );
    const liveLinks = screen.getAllByLabelText('查看正式網站');
    expect(liveLinks).toHaveLength(2);
    expect(liveLinks.map((a) => a.getAttribute('href'))).toEqual([
      'https://example.com/a',
      'https://example.com/b',
    ]);
  });

  test('renders desktop-icon links before github-icon links regardless of counts', () => {
    const { container } = render(
        <PortfolioCard item={{
          project_name: 'Order Check',
          image: '',
          text: '',
          link_live: ['https://example.com/a', 'https://example.com/b'],
          link_github: ['https://github.com/example/one', 'https://github.com/example/two'],
        }}
        />,
    );
    const icons = container.querySelectorAll('.font-card-icon');
    const order = Array.from(icons).map((el) => (
      el.className.includes('font-card-icon--live') ? 'live' : 'github'
    ));
    expect(order).toEqual(['live', 'live', 'github', 'github']);
  });

  test('renders no link-block at all when both link fields are empty', () => {
    const { container } = render(
        <PortfolioCard item={{
          project_name: 'No Links',
          image: '',
          text: '',
          link_live: '',
          link_github: '',
        }}
        />,
    );
    expect(container.querySelector('.link-block')).toBeNull();
  });
});
