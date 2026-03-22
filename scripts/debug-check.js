const events = require('../data/events.json');

const tmApi = events.filter(e => e.sourceId === 'ticketmaster-api');
const tmNoUrl = tmApi.filter(e => !e.url);
console.log('TM API events:', tmApi.length);
console.log('TM API with no URL:', tmNoUrl.length);
console.log('');
console.log('Sample TM API events:');
tmApi.slice(0, 5).forEach(e => console.log(`  ${e.title} | url: ${e.url}`));
console.log('');

const nonTm = events.filter(e => e.sourceId !== 'ticketmaster-api');
const nonTmNoUrl = nonTm.filter(e => !e.url);
console.log('Non-TM events:', nonTm.length);
console.log('Non-TM with no URL:', nonTmNoUrl.length);
console.log('');

// Date distribution for today
const today = '2026-02-26';
const todayEvents = events.filter(e => e.date === today);
console.log('Events for today (' + today + '):', todayEvents.length);
todayEvents.forEach(e => console.log(`  [${e.cat}] ${e.title} @ ${e.venue}`));
console.log('');

// Check what the default view shows (default is "today" preset)
const tomorrow = '2026-02-27';
const thisWeek = events.filter(e => {
  const d = new Date(e.date);
  const t = new Date(today);
  return d >= t && d < new Date(t.getTime() + 7 * 86400000);
});
console.log('Events this week:', thisWeek.length);

// Seed events count
console.log('');
console.log('=== Summary ===');
console.log('Total events:', events.length);
console.log('With URL:', events.filter(e => !!e.url).length);
console.log('Without URL:', events.filter(e => !e.url).length);
console.log('Categories:', JSON.stringify(
  events.reduce((a, e) => { a[e.cat] = (a[e.cat] || 0) + 1; return a; }, {}), null, 2
));
