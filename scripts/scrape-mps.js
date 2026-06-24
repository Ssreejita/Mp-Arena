// scripts/scrape-mps.js
// Run: node scripts/scrape-mps.js
// Data source: github.com/Vonter/india-representatives-activity (CC BY 4.0)
// Original analysis, topic categorisation, and scoring by this project.

const fs = require('fs');

const CSV_URL =
  'https://raw.githubusercontent.com/Vonter/india-representatives-activity/main/csv/Lok%20Sabha/18th.csv';

// ── Ministry → Topic grouping (YOUR original categorisation layer) ────────────
const TOPIC_MAP = {
  'Economy & Finance':    ['Finance','Commerce And Industry','Corporate Affairs','Statistics And Programme Implementation','Planning','Cooperation','Micro, Small And Medium Enterprises','Skill Development And Entrepreneurship','Textiles','Heavy Industries','Steel','Coal','Mines','Petroleum And Natural Gas','Food Processing Industries'],
  'Agriculture & Rural':  ['Agriculture And Farmers Welfare','Rural Development','Fisheries, Animal Husbandry And Dairying','Jal Shakti','Panchayati Raj','Food Processing Industries'],
  'Health & Social':      ['Health And Family Welfare','Women And Child Development','Social Justice And Empowerment','Tribal Affairs','Minority Affairs','Ayush','Labour And Employment'],
  'Infrastructure':       ['Railways','Road Transport And Highways','Civil Aviation','Ports, Shipping And Waterways','Power','Housing And Urban Affairs','Communication','New And Renewable Energy'],
  'Defence & Security':   ['Defence','Home Affairs','External Affairs','Parliamentary Affairs','Personnel, Public Grievances And Pensions'],
  'Education & Science':  ['Education','Science And Technology','Electronics And Information Technology','Atomic Energy','Space','Earth Sciences','Youth Affairs And Sports','Culture','Information And Broadcasting','Tourism'],
  'Environment':          ['Environment, Forest And Climate Change','Chemicals And Fertilizers','Development Of North Eastern Region','Law And Justice'],
};

function parseRow(line) {
  return line.split(';').map(v => v.replace(/^"|"$/g, '').trim());
}

function computeScore(attendance, questions, debates, bills) {
  const a = Math.min(parseFloat(attendance) || 0, 100);
  const q = Math.min(parseInt(questions)   || 0, 500);
  const d = Math.min(parseInt(debates)     || 0, 200);
  const b = Math.min(parseInt(bills)       || 0, 20);
  return Math.round(
    (a * 0.35) +
    (q / 500 * 25) +
    (d / 200 * 25) +
    (b / 20  * 15)
  );
}

function getTopicScores(mp, headers) {
  const scores = {};
  for (const [topic, ministries] of Object.entries(TOPIC_MAP)) {
    scores[topic] = ministries.reduce((sum, ministry) => {
      const col = `Questions (${ministry})`;
      const idx = headers.indexOf(col);
      return sum + (idx >= 0 ? (parseFloat(mp[col]) || 0) : 0);
    }, 0);
  }
  return scores;
}

function getTopTopics(topicScores, n = 3) {
  return Object.entries(topicScores)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([topic]) => topic);
}

async function main() {
  console.log('📥 Fetching 18th Lok Sabha data...');
  const res  = await fetch(CSV_URL);
  const text = await res.text();
  const lines = text.split('\n').filter(l => l.trim());
  const headers = parseRow(lines[0]);

  const mps = lines.slice(1)
    .map((line, i) => {
      const row = parseRow(line);
      const mp  = {};
      headers.forEach((h, idx) => { mp[h] = row[idx] || ''; });

      if (!mp['Name'] || !mp['Constituency']) return null;

      const attendance    = parseFloat((mp['Attendance'] || '0').replace('%','')) || 0;
      const questions     = parseInt(mp['Questions'])          || 0;
      const debates       = parseInt(mp['Debates'])            || 0;
      const bills         = parseInt(mp['Private Member Bills']) || 0;
      const topicScores   = getTopicScores(mp, headers);
      const topTopics     = getTopTopics(topicScores);

      return {
        id:                `mp-${i + 1}`,
        name:              mp['Name'],
        constituency:      mp['Constituency'],
        state:             mp['State'],
        party:             mp['Party'],
        gender:            mp['Gender'] || '',
        age:               parseInt(mp['Age']) || null,
        education:         mp['Education'] || '',
        is_minister:       mp['Minister'] === 'Yes',
        term:              mp['No. of Term'] || 'First Term',
        start_of_term:     mp['Start of Term'] || '',
        attendance_rate:   attendance,
        questions_count:   questions,
        debates_count:     debates,
        bills_sponsored:   bills,
        overall_score:     computeScore(attendance, questions, debates, bills),
        topic_scores:      topicScores,   // ← full breakdown by ministry group
        top_topics:        topTopics,     // ← e.g. ["Economy & Finance", "Health & Social"]
        image_url:         `https://ui-avatars.com/api/?name=${encodeURIComponent(mp['Name'])}&background=1e3a5f&color=fff&size=128&bold=true`,
        prs_url:           `https://prsindia.org/mptrack/18-lok-sabha/${mp['Name'].toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}`,
      };
    })
    .filter(Boolean);

  fs.mkdirSync('./lib', { recursive: true });
  fs.writeFileSync('./lib/mp-data.json', JSON.stringify(mps, null, 2));

  // ── Summary stats ────────────────────────────────────────────────────────────
  const withAttendance = mps.filter(m => m.attendance_rate > 0);
  const avgAttendance  = (withAttendance.reduce((s, m) => s + m.attendance_rate, 0) / withAttendance.length).toFixed(1);
  const parties        = [...new Set(mps.map(m => m.party))].length;
  const states         = [...new Set(mps.map(m => m.state))].length;

  console.log(`\n✅ Done! Saved ${mps.length} MPs to lib/mp-data.json`);
  console.log(`📊 Avg attendance : ${avgAttendance}%`);
  console.log(`🏛️  Parties        : ${parties}`);
  console.log(`🗺️  States         : ${states}`);
  console.log(`🔍 Sample MP      :`, JSON.stringify(mps[0], null, 2).slice(0, 400));
}

main().catch(console.error);