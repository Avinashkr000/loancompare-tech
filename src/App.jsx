import { useEffect, useMemo, useState } from 'react'

const lenders = [
  { name: 'HDFC Bank', short: 'H', rate: 10.75, fee: 1.5, badge: 'Fast approval', tone: 'cyan' },
  { name: 'ICICI Bank', short: 'I', rate: 11.1, fee: 1.25, badge: 'Low fee', tone: 'violet' },
  { name: 'Axis Bank', short: 'A', rate: 11.35, fee: 1, badge: 'Flexible tenure', tone: 'amber' },
  { name: 'Kotak Mahindra', short: 'K', rate: 11.6, fee: 0.75, badge: 'Quick disbursal', tone: 'green' },
]

const faqs = [
  ['Are these final lender rates?', 'No. This experience uses illustrative pricing so the product flow can be explored before live lender APIs are connected.'],
  ['Will checking here affect my credit score?', 'No bureau pull happens in this MVP. A production flow can separately show soft eligibility checks and hard enquiries.'],
  ['What comes after this frontend?', 'Live lender pricing, eligibility rules, consent, bureau integrations, authentication and application tracking.'],
]

const money = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)

const calculateEmi = (principal, annualRate, months) => {
  const monthlyRate = annualRate / 12 / 100
  if (!monthlyRate) return principal / months
  const power = (1 + monthlyRate) ** months
  return (principal * monthlyRate * power) / (power - 1)
}

function App() {
  const [amount, setAmount] = useState(750000)
  const [tenure, setTenure] = useState(48)
  const [score, setScore] = useState(765)
  const [purpose, setPurpose] = useState('Personal expenses')
  const [activeFaq, setActiveFaq] = useState(0)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMove = (event) => {
      setMouse({ x: event.clientX / window.innerWidth - 0.5, y: event.clientY / window.innerHeight - 0.5 })
    }
    window.addEventListener('pointermove', handleMove)
    return () => window.removeEventListener('pointermove', handleMove)
  }, [])

  const offers = useMemo(() => {
    const scoreAdjustment = score >= 780 ? -0.35 : score >= 730 ? 0 : score >= 680 ? 0.7 : 1.4
    return lenders
      .map((lender) => {
        const rate = Math.max(8.5, lender.rate + scoreAdjustment)
        const emi = calculateEmi(amount, rate, tenure)
        const totalInterest = emi * tenure - amount
        const processingFee = (amount * lender.fee) / 100
        return {
          ...lender,
          rate,
          emi,
          totalInterest,
          processingFee,
          totalCost: totalInterest + processingFee,
        }
      })
      .sort((a, b) => a.totalCost - b.totalCost)
  }, [amount, tenure, score])

  const best = offers[0]
  const worst = offers[offers.length - 1]
  const savings = worst.totalCost - best.totalCost
  const scoreLabel = score >= 780 ? 'Elite profile' : score >= 750 ? 'Strong profile' : score >= 700 ? 'Good profile' : 'Needs improvement'

  const tiltStyle = {
    transform: `rotateX(${mouse.y * -3.5}deg) rotateY(${mouse.x * 5.5}deg)`,
  }

  return (
    <div className="site-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="topbar">
        <a className="brand" href="#top">
          <span className="brand-mark"><span>LC</span></span>
          <span>LoanCompare</span>
        </a>
        <nav>
          <a href="#compare">Compare</a>
          <a href="#experience">Experience</a>
          <a href="#faq">FAQ</a>
        </nav>
        <button className="nav-cta" onClick={() => document.getElementById('compare')?.scrollIntoView({ behavior: 'smooth' })}>Start comparing <span>↗</span></button>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-copy">
            <div className="pill"><span className="pulse-dot" /> Smarter borrowing, redesigned</div>
            <h1>Find the loan that <span>moves with you.</span></h1>
            <p>See the real cost of borrowing across lenders, tune your profile in real time, and make the decision with clarity—not spreadsheets.</p>
            <div className="hero-actions">
              <button className="primary-cta" onClick={() => document.getElementById('compare')?.scrollIntoView({ behavior: 'smooth' })}>Explore your offers <span>↓</span></button>
              <div className="micro-trust"><span>✓ No hard enquiry</span><span>✓ Transparent costs</span></div>
            </div>
            <div className="hero-proof">
              <div className="avatar-stack"><span>H</span><span>I</span><span>A</span><span>K</span></div>
              <div><strong>4 lender simulations</strong><small>updated instantly as you adjust your profile</small></div>
            </div>
          </div>

          <div className="hero-stage" aria-label="Interactive 3D loan comparison preview">
            <div className="stage-grid" />
            <div className="halo halo-a" />
            <div className="halo halo-b" />
            <div className="float-chip chip-rate"><small>Best rate</small><strong>{best.rate.toFixed(2)}%</strong><span>↓ 0.35%</span></div>
            <div className="float-chip chip-save"><small>Potential saving</small><strong>{money(savings)}</strong><span>across shown offers</span></div>
            <div className="scene" style={tiltStyle}>
              <div className="scene-shadow" />
              <div className="main-card glass-panel">
                <div className="card-topline"><span>LOANCOMPARE / LIVE</span><span className="live-dot" /></div>
                <div className="card-heading"><div><small>Best estimated EMI</small><strong>{money(best.emi)}<em>/mo</em></strong></div><span className="spark-badge">AI MATCH</span></div>
                <div className="orbital-chart">
                  <div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit-core"><strong>{Math.round((1 - best.totalCost / (best.totalCost + amount)) * 100)}%</strong><small>fit score</small></div>
                  <span className="orbit-dot dot-one" /><span className="orbit-dot dot-two" /><span className="orbit-dot dot-three" />
                </div>
                <div className="mini-metrics"><div><span>Principal</span><strong>{money(amount)}</strong></div><div><span>Tenure</span><strong>{tenure} mo</strong></div><div><span>Credit</span><strong>{score}</strong></div></div>
              </div>
              <div className="depth-card depth-back">{Array.from({ length: 5 }).map((_, i) => <span key={i} />)}</div>
              <div className="coin coin-one">₹</div><div className="coin coin-two">%</div><div className="coin coin-three">↗</div>
            </div>
            <div className="stage-caption"><span>Drag your eyes around</span><span>3D product preview</span></div>
          </div>
        </section>

        <section className="ticker" aria-label="LoanCompare highlights">
          <span>FAST COMPARISON</span><i /><strong>EMI + INTEREST + FEES</strong><i /><span>PERSONALIZED RATES</span><i /><strong>4 LENDERS</strong><i /><span>BUILT FOR CLARITY</span>
        </section>

        <section className="compare-section" id="compare">
          <div className="section-intro"><div><span className="eyebrow">01 / Compare</span><h2>Your numbers.<br /><span>Their best offers.</span></h2></div><p>Move the sliders. Watch the offer stack re-rank itself. Every value below is computed from your current scenario.</p></div>
          <div className="compare-grid">
            <aside className="control-panel glass-panel">
              <div className="panel-heading"><div><small>YOUR SCENARIO</small><h3>Borrowing profile</h3></div><span className="secure-badge">SECURE</span></div>
              <label className="range-control"><div><span>Loan amount</span><strong>{money(amount)}</strong></div><input type="range" min="50000" max="2000000" step="25000" value={amount} onChange={(e) => setAmount(Number(e.target.value))} /><small><span>₹50K</span><span>₹20L</span></small></label>
              <label className="range-control"><div><span>Tenure</span><strong>{tenure} months</strong></div><input type="range" min="12" max="84" step="6" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} /><small><span>12</span><span>84</span></small></label>
              <label className="range-control"><div><span>Credit score</span><strong>{score}</strong></div><input type="range" min="600" max="850" step="5" value={score} onChange={(e) => setScore(Number(e.target.value))} /><small><span>600</span><span>850</span></small></label>
              <label className="select-control"><span>Loan purpose</span><select value={purpose} onChange={(e) => setPurpose(e.target.value)}><option>Personal expenses</option><option>Home renovation</option><option>Education</option><option>Medical expense</option><option>Debt consolidation</option></select></label>
              <div className="profile-state"><span className="state-ring">✓</span><div><strong>{scoreLabel}</strong><p>Illustrative pricing adjusts with your score.</p></div></div>
              <div className="control-footer"><span>Scenario strength</span><strong>{Math.min(99, Math.max(52, Math.round((score - 540) / 3.2)))} / 100</strong></div>
            </aside>

            <div className="result-area">
              <div className="result-head"><div><small>LIVE OFFER RANKING</small><h3>Best fit, on top.</h3></div><div className="result-total"><span>You could save</span><strong>{money(savings)}</strong></div></div>
              <div className="best-banner glass-panel"><div className="best-icon">✦</div><div><small>RECOMMENDED FOR YOU</small><strong>{best.name}</strong><span>{best.badge} · lowest illustrated total cost</span></div><div className="best-price"><span>EMI / month</span><strong>{money(best.emi)}</strong></div></div>
              <div className="offer-stack">
                {offers.map((offer, index) => (
                  <article key={offer.name} className={`offer-row ${index === 0 ? 'top-offer' : ''}`}>
                    <div className={`lender-mark ${offer.tone}`}>{offer.short}</div>
                    <div className="lender-name"><strong>{offer.name}</strong><span>{offer.badge}</span></div>
                    <div className="metric"><span>Rate</span><strong>{offer.rate.toFixed(2)}%</strong></div>
                    <div className="metric"><span>EMI</span><strong>{money(offer.emi)}</strong></div>
                    <div className="metric hide-mobile"><span>Fees</span><strong>{money(offer.processingFee)}</strong></div>
                    <button className="row-action">View <span>→</span></button>
                  </article>
                ))}
              </div>
              <div className="comparison-note"><span>i</span><p>Illustrative lender data for prototype purposes. Production version should pull rates, eligibility and fees from live partner APIs.</p></div>
            </div>
          </div>
        </section>

        <section className="feature-section" id="experience">
          <div className="feature-copy"><span className="eyebrow">02 / Product thinking</span><h2>A finance product that feels <span>alive.</span></h2><p>The interface is designed around one job: reduce decision friction. Motion, hierarchy, pricing clarity and real-time calculations all point toward the same moment—knowing which loan actually makes sense.</p><div className="feature-stats"><div><strong>01</strong><span>One decision surface</span></div><div><strong>04</strong><span>Lenders side by side</span></div><div><strong>∞</strong><span>Scenarios to explore</span></div></div></div>
          <div className="feature-visual"><div className="rings"><div /><div /><div /><div /><div /></div><div className="feature-core"><span>₹</span><strong>clarity</strong><small>over complexity</small></div><div className="orbit-label label-a">EMI</div><div className="orbit-label label-b">RATE</div><div className="orbit-label label-c">FEES</div><div className="orbit-label label-d">FIT</div></div>
        </section>

        <section className="process-section">
          <div className="section-intro compact"><div><span className="eyebrow">03 / Flow</span><h2>Three moves.<br /><span>One clear decision.</span></h2></div><p>Start broad, understand the cost, then narrow down. The same mental model can power the production application flow.</p></div>
          <div className="process-grid"><article><span>01</span><div className="process-icon">⌁</div><h3>Shape your scenario</h3><p>Amount, tenure, score and purpose become one flexible profile.</p></article><article><span>02</span><div className="process-icon">◉</div><h3>Read the true cost</h3><p>EMI is only one number. We surface rates, fees and total payable together.</p></article><article><span>03</span><div className="process-icon">↗</div><h3>Move with confidence</h3><p>Shortlist a lender now; plug in eligibility and application APIs next.</p></article></div>
        </section>

        <section className="faq-section" id="faq"><div className="faq-intro"><span className="eyebrow">04 / FAQ</span><h2>Clear answers.<br /><span>No fine print maze.</span></h2><p>Prototype now, production-grade integrations next.</p></div><div className="faq-list">{faqs.map(([question, answer], index) => <button key={question} className={`faq-item ${activeFaq === index ? 'open' : ''}`} onClick={() => setActiveFaq(activeFaq === index ? -1 : index)}><span className="faq-number">0{index + 1}</span><div><strong>{question}</strong>{activeFaq === index && <p>{answer}</p>}</div><span className="faq-toggle">{activeFaq === index ? '−' : '+'}</span></button>)}</div></section>
      </main>

      <footer><a className="brand" href="#top"><span className="brand-mark"><span>LC</span></span><span>LoanCompare</span></a><div><span>Prototype / 2026</span><span>Built for the next integration phase</span></div><a href="#top">Back to top ↑</a></footer>
    </div>
  )
}

export default App
