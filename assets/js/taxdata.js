/* AI Money Tools — shared tax data & calculation helpers
   UK figures: 2026/27 tax year (6 Apr 2026 – 5 Apr 2027)
   US figures: 2025 & 2026 tax years (IRS Rev. Proc. 2025-32 / Notice 2025-67)
   Update this single file when HMRC / IRS thresholds change. */
(function () {
  'use strict';

  var UK = {
    taxYear: '2026/27',
    personalAllowance: 12570,
    paTaperStart: 100000,            // PA reduced £1 per £2 above this
    // rUK bands as [upper taxable limit (above PA), rate]
    bands: [[37700, 0.20], [112570, 0.40], [Infinity, 0.45]],
    scotBands: [[3967, 0.19], [16956, 0.20], [31092, 0.21], [62430, 0.42], [112570, 0.45], [Infinity, 0.48]],
    ni: { lower: 12570, upper: 50270, mainRate: 0.08, upperRate: 0.02 },
    class4: { lower: 12570, upper: 50270, mainRate: 0.06, upperRate: 0.02 },
    dividendAllowance: 500,
    dividendRates: [0.0875, 0.3375, 0.3935],
    cgt: { exempt: 3000, basicRate: 0.18, higherRate: 0.24, basicBand: 37700 },
    isa: 20000, lisa: 4000, lisaBonus: 0.25, jisa: 9000,
    pensionAnnualAllowance: 60000,
    tradingAllowance: 1000,
    personalSavingsAllowance: { basic: 1000, higher: 500, additional: 0 },
    studentLoans: {
      plan1: { threshold: 26900, rate: 0.09, label: 'Plan 1 (pre-2012 England/Wales, NI)' },
      plan2: { threshold: 29385, rate: 0.09, label: 'Plan 2 (England/Wales 2012–2023)' },
      plan4: { threshold: 33795, rate: 0.09, label: 'Plan 4 (Scotland)' },
      plan5: { threshold: 25000, rate: 0.09, label: 'Plan 5 (England, from Sep 2023)' },
      pg:    { threshold: 21000, rate: 0.06, label: 'Postgraduate Loan' }
    },
    sdlt: {
      standard: [[125000, 0], [250000, 0.02], [925000, 0.05], [1500000, 0.10], [Infinity, 0.12]],
      ftb:      [[300000, 0], [500000, 0.05]],   // relief lost above £500k
      ftbCap: 500000,
      surcharge: 0.05
    },
    iht: { nrb: 325000, rnrb: 175000, rate: 0.40, rnrbTaperStart: 2000000 }
  };

  var US = {
    defaultYear: 2026,
    years: {
      2025: {
        std: { single: 15750, mfj: 31500, hoh: 23625 },
        brackets: {
          single: [[11925,0.10],[48475,0.12],[103350,0.22],[197300,0.24],[250525,0.32],[626350,0.35],[Infinity,0.37]],
          mfj:    [[23850,0.10],[96950,0.12],[206700,0.22],[394600,0.24],[501050,0.32],[751600,0.35],[Infinity,0.37]],
          hoh:    [[17000,0.10],[64850,0.12],[103350,0.22],[197300,0.24],[250500,0.32],[626350,0.35],[Infinity,0.37]]
        },
        ltcg: { single: [48350, 533400], mfj: [96700, 600050] },
        k401: 23500, k401Catch: 7500, ira: 7000, iraCatch: 1000,
        rothPhase: { single: [150000, 165000], mfj: [236000, 246000] },
        estateExemption: 13990000
      },
      2026: {
        std: { single: 16100, mfj: 32200, hoh: 24150 },
        brackets: {
          single: [[12400,0.10],[50400,0.12],[105700,0.22],[201775,0.24],[256225,0.32],[640600,0.35],[Infinity,0.37]],
          mfj:    [[24800,0.10],[100800,0.12],[211400,0.22],[403550,0.24],[512450,0.32],[768700,0.35],[Infinity,0.37]],
          hoh:    [[17700,0.10],[67450,0.12],[105700,0.22],[201775,0.24],[256200,0.32],[640600,0.35],[Infinity,0.37]]
        },
        ltcg: { single: [49450, 545500], mfj: [98900, 613700] },
        k401: 24500, k401Catch: 8000, ira: 7500, iraCatch: 1100,
        rothPhase: { single: [153000, 168000], mfj: [242000, 252000] },
        estateExemption: 15000000
      }
    },
    seTax: { rate: 0.153, base: 0.9235, ssRate: 0.124, medRate: 0.029, ssWageBase: 176100 },
    fica: { ss: 0.062, medicare: 0.0145, addlMedicare: 0.009, addlThreshold: 200000 },
    estateRate: 0.40
  };

  /* progressive tax over cumulative band limits: bands = [[upperLimit, rate], ...] */
  function progressive(amount, bands) {
    var tax = 0, prev = 0, detail = [];
    for (var i = 0; i < bands.length && amount > prev; i++) {
      var upper = bands[i][0], rate = bands[i][1];
      var slice = Math.min(amount, upper) - prev;
      if (slice > 0) { tax += slice * rate; detail.push({ from: prev, to: Math.min(amount, upper), rate: rate, slice: slice, tax: slice * rate }); }
      prev = upper;
    }
    return { tax: tax, detail: detail };
  }

  /* UK income tax on non-savings income. Returns {pa, taxable, tax, detail} */
  function ukIncomeTax(gross, scotland) {
    var pa = UK.personalAllowance;
    if (gross > UK.paTaperStart) pa = Math.max(0, pa - (gross - UK.paTaperStart) / 2);
    var taxable = Math.max(0, gross - pa);
    var r = progressive(taxable, scotland ? UK.scotBands : UK.bands);
    return { pa: pa, taxable: taxable, tax: r.tax, detail: r.detail };
  }

  function ukNI(gross) {
    var n = UK.ni, t = 0;
    if (gross > n.lower) t += (Math.min(gross, n.upper) - n.lower) * n.mainRate;
    if (gross > n.upper) t += (gross - n.upper) * n.upperRate;
    return t;
  }

  function ukClass4(profit) {
    var n = UK.class4, t = 0;
    if (profit > n.lower) t += (Math.min(profit, n.upper) - n.lower) * n.mainRate;
    if (profit > n.upper) t += (profit - n.upper) * n.upperRate;
    return t;
  }

  function ukStudentLoan(gross, plan) {
    var p = UK.studentLoans[plan];
    if (!p) return 0;
    return Math.max(0, gross - p.threshold) * p.rate;
  }

  function ukSDLT(price, type) {
    // type: 'standard' | 'ftb' | 'additional'
    if (type === 'ftb' && price <= UK.sdlt.ftbCap) {
      return progressive(price, UK.sdlt.ftb).tax;
    }
    var base = progressive(price, UK.sdlt.standard).tax;
    if (type === 'additional') base += price * UK.sdlt.surcharge;
    return base;
  }

  function usFedTax(taxable, status, year) {
    var y = US.years[year] || US.years[US.defaultYear];
    return progressive(Math.max(0, taxable), y.brackets[status] || y.brackets.single);
  }

  function usSETax(netProfit) {
    var base = Math.max(0, netProfit) * US.seTax.base;
    var ss = Math.min(base, US.seTax.ssWageBase) * US.seTax.ssRate;
    var med = base * US.seTax.medRate;
    return { base: base, ss: ss, medicare: med, total: ss + med, deduction: (ss + med) / 2 };
  }

  /* loan amortisation: monthly payment for principal P, annual rate r%, n months */
  function pmt(P, annualRatePct, months) {
    var i = (annualRatePct / 100) / 12;
    if (months <= 0) return 0;
    if (i === 0) return P / months;
    return P * i / (1 - Math.pow(1 + i, -months));
  }

  /* future value of series: start lump + monthly contributions, annual growth % */
  function fv(start, monthly, annualPct, years) {
    var i = annualPct / 100 / 12, n = Math.round(years * 12);
    var fvStart = start * Math.pow(1 + i, n);
    var fvSeries = i === 0 ? monthly * n : monthly * ((Math.pow(1 + i, n) - 1) / i);
    return fvStart + fvSeries;
  }

  window.AMTD = {
    UK: UK, US: US,
    progressive: progressive,
    ukIncomeTax: ukIncomeTax, ukNI: ukNI, ukClass4: ukClass4,
    ukStudentLoan: ukStudentLoan, ukSDLT: ukSDLT,
    usFedTax: usFedTax, usSETax: usSETax,
    pmt: pmt, fv: fv
  };
})();
