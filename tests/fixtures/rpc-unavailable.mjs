// Child-process fault injection only. Production scripts never import this fixture.
globalThis.fetch = async () => { throw new Error('fetch failed: provider-detail-canary'); };
