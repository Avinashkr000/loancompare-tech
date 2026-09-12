import { useMemo, useState } from 'react'

const lenders = [
  { name: 'HDFC Bank', rate: 10.75, fee: 1.5, badge: 'Fast approval', tone: 'blue' },
  { name: 'ICICI Bank', rate: 11.1, fee: 1.25, badge: 'Low fee', tone: 'violet' },
  { name: 'Axis Bank', rate: 11.35, fee: 1.0, badge: 'Flexible tenure', tone: 'orange' },
  { name: 'Kotak Mahindra', rate: 11.6, fee: 0.75, badge: 'Quick disbursal', tone: 'green' },
]

const formatMoney = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)

function calculateEmi(principal, annualRate, months) {
  const monthlyRate = annualRate / 12 / 100
  if (!monthlyRate) return principal / months
  const power = (1 + monthlyRate) ** months
  return (principal * monthlyRate * power) / (power - 1)
}

function App() {
  const [amount, setAmount] = useState(500000)
  const [tenure, setTenure] = useState(36)
  const [score, setScore] = useState(760)
  const [purpose, setPurpose] = useState('Personal expenses')

  const offers = useMemo(() => {
    const scoreAdjustment = score >= 780 ? -0.35 : score >= 730 ? 0 : score >= 680 ? 0.7 : 1.4

    return lenders
      .map((lender) => {
        const rate = Math.max(8.5, lender.rate + scoreAdjustment)
        const emi = calculateEmi(amount, rate, tenure)
        const totalPayable = emi * tenure
        const totalInterest = totalPayable - amount
        const processingFee = (amount * lender.fee) / 100
        const totalCost = totalInterest + processingFee

        return {
          ...lender,
          rate,
          emi,
          totalPayable,
          totalInterest,
          processingFee,
          totalCost,
        }
      })
      .sort((a, b) => a.totalCost - b.totalCost)
  }, [amount, tenure, score])

  const bestOffer = offers[0]
  const expensiveOffer = offers.at(-1)
  const potentialSaving = expensiveOffer.totalCost - bestOffer.totalCost

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="LoanCompare home">
          <span className="brand-mark">LC</span>
          <span>LoanCompare</span>
        </a>
        <nav>
          <a href="#compare">Compare</a>
          <a href="#how-it-works">How it works</a>
          <a href="#faq">FAQ</a>
        </nav>
        <button className="ghost-button">Sign in</button>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">Smarter borrowing starts here</span>
            <h1>Compare loans. <span>Choose smarter.</span></h1>
            <p>
              Compare rates, monthly EMI, processing fees and total borrowing cost across leading lenders—without the spreadsheet headache.
            </p>
            <div className="trust-row">
              <span>✓ No impact on credit score</span>
              <span>✓ Transparent comparison</span>
              <span>✓ Free to use</span>
            </div>
          </div>

          <div className="hero-stat-card">
            <p>Potential savings</p>
            <strong>{formatMoney(potentialSaving)}</strong>
            <span>between the highest and lowest cost offers shown</span>
            <div className="mini-chart" aria-hidden="true">
              <i style={{ height: '42%' }} />
              <i style={{ height: '58%' }} />
              <i style={{ height: '70%' }} />
              <i style={{ height: '88%' }} />
              <i style={{ height: '100%' }} />
            </div>
          </div>
        </section>

        <section className="compare-section" id="compare">
          <aside className="calculator-card">
            <div>
              <span className="section-kicker">Your requirement</span>
              <h2>Find your best loan</h2>
              <p>Adjust your details and compare estimated offers instantly.</p>
            </div>

            <label>
              <span>Loan amount</span>
              <strong>{formatMoney(amount)}</strong>
              <input
                type="range"
                min="50000"
                max="2000000"
                step="25000"
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value))}
              />
              <small><span>₹50K</span><span>₹20L</span></small>
            </label>

            <label>
              <span>Tenure</span>
              <strong>{tenure} months</strong>
              <input
                type="range"
                min="12"
                max="84"
                step="6"
                value={tenure}
                onChange={(event) => setTenure(Number(event.target.value))}
              />
              <small><span>12 months</span><span>84 months</span></small>
            </label>

            <label>
              <span>Credit score</span>
              <strong>{score}</strong>
              <input
                type="range"
                min="600"
                max="850"
                step="5"
                value={score}
                onChange={(event) => setScore(Number(event.target.value))}
              />
              <small><span>600</span><span>850</span></small>
            </label>

            <label className="select-field">
              <span>Loan purpose</span>
              <select value={purpose} onChange={(event) => setPurpose(event.target.value)}>
                <option>Personal expenses</option>
                <option>Home renovation</option>
                <option>Education</option>
                <option>Medical expense</option>
                <option>Debt consolidation</option>
              </select>
            </label>

            <div className="score-note">
              <span className="score-dot" />
              <div>
                <strong>{score >= 750 ? 'Strong profile' : score >= 700 ? 'Good profile' : 'Fair profile'}</strong>
                <p>Rates shown are illustrative and react to your selected credit score.</p>
              </div>
            </div>
          </aside>

          <div className="offers-panel">
            <div className="offers-heading">
              <div>
                <span className="section-kicker">Live comparison preview</span>
                <h2>{offers.length} offers matched</h2>
              </div>
              <span className="updated-pill">Updated just now</span>
            </div>

            <div className="best-summary">
              <div>
                <span>Best estimated EMI</span>
                <strong>{formatMoney(bestOffer.emi)}<small>/month</small></strong>
              </div>
              <div>
                <span>Lowest rate</span>
                <strong>{bestOffer.rate.toFixed(2)}%</strong>
              </div>
              <div>
                <span>You could save</span>
                <strong>{formatMoney(potentialSaving)}</strong>
              </div>
            </div>

            <div className="offer-list">
              {offers.map((offer, index) => (
                <article className={`offer-card ${index === 0 ? 'recommended' : ''}`} key={offer.name}>
                  {index === 0 && <span className="recommended-label">Best value</span>}
                  <div className="lender-block">
                    <div className={`bank-logo ${offer.tone}`}>{offer.name.charAt(0)}</div>
                    <div>
                      <h3>{offer.name}</h3>
                      <span className="badge">{offer.badge}</span>
                    </div>
                  </div>

                  <div className="offer-metrics">
                    <div><span>Interest rate</span><strong>{offer.rate.toFixed(2)}%</strong></div>
                    <div><span>Monthly EMI</span><strong>{formatMoney(offer.emi)}</strong></div>
                    <div><span>Processing fee</span><strong>{formatMoney(offer.processingFee)}</strong></div>
                    <div><span>Total interest</span><strong>{formatMoney(offer.totalInterest)}</strong></div>
                  </div>

                  <div className="offer-action">
                    <span>Total payable</span>
                    <strong>{formatMoney(offer.totalPayable + offer.processingFee)}</strong>
                    <button>View offer</button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="how-section" id="how-it-works">
          <div className="section-header centered">
            <span className="section-kicker">Simple by design</span>
            <h2>Compare in three quick steps</h2>
            <p>LoanCompare keeps the decision-making focused on what actually changes your cost.</p>
          </div>
          <div className="steps-grid">
            {[
              ['01', 'Tell us what you need', 'Choose your loan amount, tenure and basic credit profile.'],
              ['02', 'Compare the real cost', 'See EMI, interest, fees and total payable side by side.'],
              ['03', 'Pick your best fit', 'Shortlist the offer that balances affordability and overall cost.'],
            ].map(([number, title, body]) => (
              <article className="step-card" key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="faq-section" id="faq">
          <div>
            <span className="section-kicker">Know before you borrow</span>
            <h2>Built for transparent comparison.</h2>
          </div>
          <div className="faq-grid">
            <article><h3>Are these final lender rates?</h3><p>No. This MVP uses illustrative lender data. Final pricing should come from lender or bureau-backed APIs in the production version.</p></article>
            <article><h3>Does checking affect my score?</h3><p>This frontend performs no credit bureau pull. A future eligibility flow should clearly distinguish soft and hard enquiries.</p></article>
            <article><h3>What should the backend add next?</h3><p>Eligibility rules, bureau integration, lender pricing APIs, application tracking, consent logging and secure authentication.</p></article>
          </div>
        </section>
      </main>

      <footer>
        <div className="brand footer-brand"><span className="brand-mark">LC</span><span>LoanCompare</span></div>
        <p>Initial product frontend • Built for the next backend integration phase.</p>
        <span>© 2026 LoanCompare</span>
      </footer>
    </div>
  )
}

export default App
