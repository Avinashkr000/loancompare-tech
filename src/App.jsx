import { useMemo, useState } from 'react'

const lenders = [
  { name: 'HDFC Bank', code: 'H', rate: 10.75, fee: 1.5, note: 'Fast approval', tone: 'blue' },
  { name: 'ICICI Bank', code: 'I', rate: 11.1, fee: 1.25, note: 'Low processing fee', tone: 'violet' },
  { name: 'Axis Bank', code: 'A', rate: 11.35, fee: 1, note: 'Flexible tenure', tone: 'amber' },
  { name: 'Kotak Mahindra', code: 'K', rate: 11.6, fee: 0.75, note: 'Quick disbursal', tone: 'green' },
]

const fmt = (value, compact = false) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: compact ? 1 : 0,
}).format(value)

const emi = (principal, annualRate, months) => {
  const r = annualRate / 1200
  if (!r) return principal / months
  const p = (1 + r) ** months
  return principal * r * p / (p - 1)
}

function App() {
  const [amount, setAmount] = useState(900000)
  const [tenure, setTenure] = useState(48)
  const [score, setScore] = useState(770)
  const [purpose, setPurpose] = useState('Personal loan')
  const [view, setView] = useState('compare')
  const [activeOffer, setActiveOffer] = useState(0)
  const [faq, setFaq] = useState(-1)

  const offers = useMemo(() => {
    const scoreAdj = score >= 780 ? -0.3 : score >= 740 ? 0 : score >= 680 ? 0.65 : 1.25
    return lenders.map((lender, index) => {
      const rate = Math.max(8.5, lender.rate + scoreAdj)
      const monthly = emi(amount, rate, tenure)
      const interest = monthly * tenure - amount
      const fee = amount * lender.fee / 100
      return { ...lender, index, rate, monthly, interest, fee, total: interest + fee }
    }).sort((a, b) => a.total - b.total)
  }, [amount, tenure, score])

  const best = offers[0]
  const savings = offers.at(-1).total - best.total
  const scoreState = score >= 780 ? 'Excellent' : score >= 740 ? 'Strong' : score >= 700 ? 'Good' : 'Needs work'
  const scoreProgress = Math.min(100, Math.max(12, ((score - 600) / 250) * 100))

  return (
    <div className="command-app">
      <div className="noise" />
      <div className="glow glow-left" />
      <div className="glow glow-right" />

      <header className="nav">
        <a className="logo" href="#top"><span className="logo-core">LC</span><span>LOAN<span>COMPARE</span></span></a>
        <div className="nav-center"><a className="active" href="#compare">Compare</a><a href="#why">Why us</a><a href="#process">How it works</a></div>
        <div className="nav-right"><span className="live-status"><i /> LIVE ENGINE</span><button onClick={() => document.getElementById('compare')?.scrollIntoView({ behavior: 'smooth' })}>Start <b>↗</b></button></div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-left">
            <div className="hero-kicker"><span>01</span><i /> CREDIT INTELLIGENCE</div>
            <h1>Borrow with <span>precision.</span></h1>
            <p className="hero-lede">One clean view of EMI, rates and real borrowing cost. Shape your scenario and watch the market respond.</p>
            <div className="hero-actions"><button className="hero-primary" onClick={() => document.getElementById('compare')?.scrollIntoView({ behavior: 'smooth' })}>Build my comparison <span>↓</span></button><span className="hero-note">No credit enquiry <b>·</b> No spam</span></div>
            <div className="hero-stats"><div><strong>₹{Math.round(savings / 1000)}K</strong><span>possible savings</span></div><div><strong>{offers.length}</strong><span>lenders modelled</span></div><div><strong>{best.rate.toFixed(2)}%</strong><span>best rate</span></div></div>
          </div>

          <div className="hero-orbit" aria-label="3D loan intelligence visual">
            <div className="orbit-rings"><span /><span /><span /><span /></div>
            <div className="orbital orbital-one">RATE <b>{best.rate.toFixed(2)}%</b></div>
            <div className="orbital orbital-two">SAVING <b>{fmt(savings, true)}</b></div>
            <div className="orbital orbital-three">SCORE <b>{score}</b></div>
            <div className="core-visual">
              <div className="core-face"><span>YOUR</span><strong>{fmt(best.monthly)}</strong><small>MONTHLY EMI</small><em>↓ {best.rate.toFixed(2)}% rate</em></div>
              <div className="core-edge" /><div className="core-glow" />
            </div>
            <div className="floating-token token-a">₹</div><div className="floating-token token-b">%</div><div className="floating-token token-c">↗</div>
          </div>
        </section>

        <div className="ticker"><span>REAL-TIME SCENARIO</span><b>•</b><span>EMI</span><b>•</b><span>INTEREST</span><b>•</b><span>FEES</span><b>•</b><span>TOTAL COST</span><b>•</b><span>ELIGIBILITY READY</span></div>

        <section className="workspace" id="compare">
          <div className="workspace-head"><div><div className="section-index">02 / DECISION DESK</div><h2>Build the deal you <span>want.</span></h2></div><div className="segmented"><button className={view === 'compare' ? 'sel' : ''} onClick={() => setView('compare')}>Compare</button><button className={view === 'insights' ? 'sel' : ''} onClick={() => setView('insights')}>Insights</button></div></div>

          {view === 'compare' ? (
            <div className="desk-grid">
              <aside className="scenario-card">
                <div className="scenario-top"><div><span>YOUR SCENARIO</span><h3>Borrowing profile</h3></div><div className="score-badge">{scoreState.toUpperCase()}</div></div>
                <div className="control"><div className="control-row"><label>Loan amount</label><strong>{fmt(amount)}</strong></div><input type="range" min="100000" max="2500000" step="25000" value={amount} onChange={(e) => setAmount(Number(e.target.value))} /><div className="scale"><span>₹1L</span><span>₹25L</span></div></div>
                <div className="control"><div className="control-row"><label>Tenure</label><strong>{tenure} mo</strong></div><input type="range" min="12" max="84" step="6" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} /><div className="scale"><span>12</span><span>84 months</span></div></div>
                <div className="control"><div className="control-row"><label>Credit score</label><strong>{score}</strong></div><input type="range" min="600" max="850" step="5" value={score} onChange={(e) => setScore(Number(e.target.value))} /><div className="scale"><span>600</span><span>850</span></div></div>
                <label className="purpose"><span>Loan purpose</span><select value={purpose} onChange={(e) => setPurpose(e.target.value)}><option>Personal loan</option><option>Home renovation</option><option>Education</option><option>Medical expense</option><option>Debt consolidation</option></select></label>
                <div className="score-meter"><div className="meter-head"><span>Profile strength</span><strong>{Math.round(scoreProgress)}%</strong></div><div className="meter"><i style={{ width: `${scoreProgress}%` }} /></div><p>{scoreState} profile can unlock more competitive pricing.</p></div>
                <button className="reset" onClick={() => { setAmount(900000); setTenure(48); setScore(770); setPurpose('Personal loan') }}>Reset scenario ↺</button>
              </aside>

              <section className="results-card">
                <div className="results-head"><div><span>MARKET MATCH</span><h3>{offers.length} offers ranked for you</h3></div><div className="saving-pill"><small>BEST vs WORST</small><strong>{fmt(savings)}</strong></div></div>
                <div className="winner-card"><div className="winner-mark">{best.code}</div><div className="winner-copy"><small>01 / BEST MATCH</small><h4>{best.name}</h4><p>{best.note} · lowest estimated total cost</p></div><div className="winner-number"><span>MONTHLY EMI</span><strong>{fmt(best.monthly)}</strong><em>{best.rate.toFixed(2)}% p.a.</em></div></div>
                <div className="offer-table-head"><span>LENDER</span><span>RATE</span><span>EMI</span><span>FEE</span><span>TOTAL COST</span><span /></div>
                <div className="offer-table">{offers.map((offer, index) => <button className={`offer-line ${activeOffer === index ? 'focused' : ''}`} key={offer.name} onClick={() => setActiveOffer(index)}><span className={`lender-dot ${offer.tone}`}>{offer.code}</span><span className="lender-title"><strong>{offer.name}</strong><small>{offer.note}</small></span><strong>{offer.rate.toFixed(2)}%</strong><strong>{fmt(offer.monthly)}</strong><strong>{fmt(offer.fee)}</strong><strong>{fmt(offer.total)}</strong><span className="chevron">→</span></button>)}</div>
                <div className="results-foot"><span><i /> Data is illustrative</span><span>Production → lender API + bureau + eligibility</span></div>
              </section>
            </div>
          ) : (
            <div className="insights-panel"><div className="insight-big"><span>YOUR TOTAL BORROWING COST</span><strong>{fmt(best.total + amount)}</strong><p>principal + interest + processing fee</p></div><div className="insight-grid"><article><span>Monthly commitment</span><strong>{fmt(best.monthly)}</strong><small>{tenure} payments</small></article><article><span>Total interest</span><strong>{fmt(best.interest)}</strong><small>{((best.interest / amount) * 100).toFixed(1)}% of principal</small></article><article><span>Processing fee</span><strong>{fmt(best.fee)}</strong><small>{best.fee / amount * 100}% of principal</small></article><article><span>Compared to highest</span><strong>{fmt(savings)}</strong><small>potential saving</small></article></div></div>
          )}
        </section>

        <section className="story" id="why"><div className="story-copy"><div className="section-index">03 / WHY LOANCOMPARE</div><h2>Stop optimizing the <span>EMI.</span><br />Optimize the decision.</h2><p>Cheap EMI can hide a long tenure. Low rate can hide fees. A good comparison needs all three dimensions at once.</p></div><div className="story-visual"><div className="stack-card card-back"><span>84 MONTHS</span><strong>₹28,940</strong><small>smaller EMI</small></div><div className="stack-card card-mid"><span>10.75% RATE</span><strong>₹32,180</strong><small>lower interest</small></div><div className="stack-card card-front"><span>BEST VALUE</span><strong>₹31,420</strong><small>balanced total cost</small><i>✓</i></div><div className="story-caption">The best offer is rarely<br />just the smallest EMI.</div></div></section>

        <section className="process" id="process"><div className="process-head"><div className="section-index">04 / THE FLOW</div><h2>From “how much?” to <span>“which one?”</span></h2></div><div className="process-line"><article><b>01</b><div className="process-icon">◎</div><h3>Shape it</h3><p>Amount, tenure, score and purpose create your scenario.</p></article><i /><article><b>02</b><div className="process-icon">≋</div><h3>Read it</h3><p>Every offer exposes the cost beneath the headline rate.</p></article><i /><article><b>03</b><div className="process-icon">↗</div><h3>Move</h3><p>Shortlist now, connect eligibility and applications next.</p></article></div></section>

        <section className="faq" id="faq"><div><div className="section-index">05 / FAQ</div><h2>Questions before<br /><span>the next click.</span></h2></div><div className="faq-list">{[['Are lender rates final?', 'No. This frontend uses illustrative pricing. Production pricing should come from connected lender APIs.'],['Does this pull my credit report?', 'No. This MVP does not make bureau calls or hard enquiries.'],['What should we build next?', 'Eligibility engine, lender integrations, consent, authentication, application tracking and analytics.']].map(([q, a], i) => <button key={q} className={faq === i ? 'open' : ''} onClick={() => setFaq(faq === i ? -1 : i)}><span>0{i + 1}</span><div><strong>{q}</strong>{faq === i && <p>{a}</p>}</div><b>{faq === i ? '−' : '+'}</b></button>)}</div></section>
      </main>

      <footer><a className="logo" href="#top"><span className="logo-core">LC</span><span>LOAN<span>COMPARE</span></span></a><span>Compare smarter. Borrow clearer.</span><span>Prototype / 2026</span></footer>
    </div>
  )
}

export default App
