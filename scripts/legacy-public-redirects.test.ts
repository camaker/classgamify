import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { redirectLegacyPublicRoute } from '../src/seo/legacy-public-redirects';

const cases = [
  ['/blog/$slug', '/blog'],
  ['/blog/%24slug', '/blog'],
  ['/create/create', '/create'],
  ['/(pages)/about', '/about'],
  ['/(pages)/teachers', '/teachers'],
  ['/(pages)/contact', '/contact'],
  ['/(pages)/contact/contact', '/contact'],
  ['/(pages)/roadmap', '/roadmap'],
  ['/(legals)/terms', '/terms'],
  ['/(legals)/cookie', '/cookie'],
  ['/(legals)/terms/terms', '/terms'],
] as const;

describe('legacy public redirects', () => {
  for (const [legacyPath, destination] of cases) {
    it(`redirects ${legacyPath} to ${destination}`, () => {
      const response = redirectLegacyPublicRoute(
        new Request(`https://classgamify.com${legacyPath}?source=gsc`)
      );

      assert.equal(response?.status, 308);
      assert.equal(
        response?.headers.get('location'),
        `https://classgamify.com${destination}?source=gsc`
      );
    });
  }

  it('does not redirect an unknown path', () => {
    assert.equal(
      redirectLegacyPublicRoute(
        new Request('https://classgamify.com/unknown-path')
      ),
      null
    );
  });
});
