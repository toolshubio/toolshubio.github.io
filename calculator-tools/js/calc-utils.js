/* ============================================
   Calculator Utilities - Core Calculation Functions
   Premium Edition with Advanced Features
   ============================================ */

const CalcUtils = {
    // === BASIC MATH ===
    add: (a, b) => a + b,
    subtract: (a, b) => a - b,
    multiply: (a, b) => a * b,
    divide: (a, b) => b !== 0 ? a / b : 'Error: Division by zero',
    power: (a, b) => Math.pow(a, b),
    sqrt: (a) => a >= 0 ? Math.sqrt(a) : 'Error: Negative square root',
    mod: (a, b) => a % b,
    abs: (a) => Math.abs(a),
    floor: (a) => Math.floor(a),
    ceil: (a) => Math.ceil(a),
    round: (a, decimals = 0) => Number(Math.round(a + 'e' + decimals) + 'e-' + decimals),

    // === PERCENTAGE ===
    percentOf: (percent, value) => (percent / 100) * value,
    percentChange: (oldVal, newVal) => oldVal !== 0 ? ((newVal - oldVal) / oldVal) * 100 : 0,
    addPercent: (value, percent) => value * (1 + percent / 100),
    subtractPercent: (value, percent) => value * (1 - percent / 100),
    whatPercent: (part, whole) => whole !== 0 ? (part / whole) * 100 : 0,

    // === ADVANCED PERCENTAGE ===
    Percentage: {
        chain: (base, ...percentages) => {
            return percentages.reduce((acc, p) => acc * (1 + p / 100), base);
        },
        margin: (cost, revenue) => revenue !== 0 ? ((revenue - cost) / revenue) * 100 : 0,
        markup: (cost, revenue) => cost !== 0 ? ((revenue - cost) / cost) * 100 : 0,
        reverseMarkup: (sellingPrice, markupPercent) => sellingPrice / (1 + markupPercent / 100),
        reverseMargin: (sellingPrice, marginPercent) => sellingPrice * (1 - marginPercent / 100),
        stackDiscounts: (price, ...discounts) => {
            return discounts.reduce((acc, d) => acc * (1 - d / 100), price);
        },
        compareScenarios: (base, scenarioA, scenarioB) => {
            const resultA = CalcUtils.Percentage.chain(base, ...scenarioA);
            const resultB = CalcUtils.Percentage.chain(base, ...scenarioB);
            return { A: resultA, B: resultB, difference: resultA - resultB, winner: resultA > resultB ? 'A' : 'B' };
        }
    },

    // === FINANCIAL ===
    emi: (principal, rate, months) => {
        const r = rate / 12 / 100;
        if (r === 0) return principal / months;
        return principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
    },

    simpleInterest: (principal, rate, years) => principal * rate * years / 100,

    compoundInterest: (principal, rate, years, n = 12) => {
        return principal * Math.pow(1 + rate / 100 / n, n * years) - principal;
    },

    futureValue: (principal, rate, years, n = 12) => {
        return principal * Math.pow(1 + rate / 100 / n, n * years);
    },

    futureValueWithContributions: (principal, monthlyContribution, rate, years) => {
        const r = rate / 100 / 12;
        const n = years * 12;
        if (r === 0) return principal + monthlyContribution * n;
        const fvPrincipal = principal * Math.pow(1 + r, n);
        const fvContributions = monthlyContribution * ((Math.pow(1 + r, n) - 1) / r);
        return fvPrincipal + fvContributions;
    },

    presentValue: (futureValue, rate, years) => {
        return futureValue / Math.pow(1 + rate / 100, years);
    },

    mortgage: (principal, rate, years) => {
        const months = years * 12;
        const r = rate / 12 / 100;
        if (r === 0) return principal / months;
        return principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
    },

    totalMortgagePayment: (emi, years) => emi * years * 12,

    // === ADVANCED FINANCIAL ===
    Financial: {
        // Loan amortization schedule
        amortizationSchedule: (principal, rate, years) => {
            const schedule = [];
            const monthlyRate = rate / 12 / 100;
            const months = years * 12;
            const emi = CalcUtils.emi(principal, rate, months);
            let balance = principal;

            for (let i = 1; i <= months; i++) {
                const interest = balance * monthlyRate;
                const principalPaid = emi - interest;
                balance -= principalPaid;
                schedule.push({
                    month: i,
                    payment: emi,
                    principal: principalPaid,
                    interest: interest,
                    balance: Math.max(0, balance)
                });
            }
            return schedule;
        },

        // Prepayment impact calculator
        prepaymentImpact: (principal, rate, years, prepaymentAmount, prepaymentMonth) => {
            const originalEmi = CalcUtils.emi(principal, rate, years * 12);
            const originalTotal = originalEmi * years * 12;

            // Calculate new balance after prepayment
            const schedule = CalcUtils.Financial.amortizationSchedule(principal, rate, years);
            const balanceAtPrepayment = schedule[prepaymentMonth - 1]?.balance || principal;
            const newBalance = balanceAtPrepayment - prepaymentAmount;
            const remainingMonths = (years * 12) - prepaymentMonth;

            const newEmi = CalcUtils.emi(newBalance, rate, remainingMonths);
            const newTotal = (originalEmi * prepaymentMonth) + prepaymentAmount + (newEmi * remainingMonths);

            return {
                originalTotal,
                newTotal,
                savings: originalTotal - newTotal,
                newEmi,
                monthsReduced: 0 // Simplified
            };
        },

        // Floating vs Fixed rate comparison
        compareRates: (principal, fixedRate, floatingRates, years) => {
            const fixedEmi = CalcUtils.emi(principal, fixedRate, years * 12);
            const fixedTotal = fixedEmi * years * 12;

            // Floating assumes array of yearly rates
            let floatingTotal = 0;
            let balance = principal;
            const monthlyPayments = [];

            floatingRates.forEach((yearRate, yearIndex) => {
                for (let month = 0; month < 12; month++) {
                    const r = yearRate / 12 / 100;
                    const remainingMonths = (years - yearIndex) * 12 - month;
                    const emi = CalcUtils.emi(balance, yearRate, remainingMonths);
                    const interest = balance * r;
                    const principal = emi - interest;
                    balance -= principal;
                    floatingTotal += emi;
                    monthlyPayments.push({ month: yearIndex * 12 + month + 1, emi, rate: yearRate });
                }
            });

            return {
                fixedTotal,
                floatingTotal,
                difference: fixedTotal - floatingTotal,
                recommendation: fixedTotal < floatingTotal ? 'Fixed' : 'Floating'
            };
        },

        // CAGR Calculator
        cagr: (startValue, endValue, years) => {
            if (startValue <= 0 || years <= 0) return 0;
            return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
        },

        // SIP Calculator
        sipFutureValue: (monthlyAmount, rate, years) => {
            const r = rate / 100 / 12;
            const n = years * 12;
            if (r === 0) return monthlyAmount * n;
            return monthlyAmount * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
        },

        // Rule of 72
        ruleOf72: (rate) => rate > 0 ? 72 / rate : Infinity,

        // Inflation adjusted value
        inflationAdjusted: (currentValue, inflationRate, years) => {
            return currentValue / Math.pow(1 + inflationRate / 100, years);
        },

        // Retirement calculator
        retirementCorpus: (monthlyExpense, inflationRate, currentAge, retirementAge, lifeExpectancy, returnRate) => {
            const yearsToRetirement = retirementAge - currentAge;
            const retirementYears = lifeExpectancy - retirementAge;

            // Future monthly expense at retirement
            const futureMonthlyExpense = monthlyExpense * Math.pow(1 + inflationRate / 100, yearsToRetirement);

            // Required corpus (simplified - doesn't account for continued inflation/returns)
            const annualExpense = futureMonthlyExpense * 12;
            const realReturn = ((1 + returnRate / 100) / (1 + inflationRate / 100) - 1) * 100;

            // Present value of annuity
            const r = realReturn / 100;
            const corpus = annualExpense * ((1 - Math.pow(1 + r, -retirementYears)) / r);

            return {
                futureMonthlyExpense,
                requiredCorpus: corpus,
                yearsToRetirement,
                retirementYears
            };
        }
    },

    // === HEALTH ===
    bmi: (weight, height) => weight / Math.pow(height / 100, 2),

    bmiCategory: (bmi) => {
        if (bmi < 16) return { category: 'Severe Underweight', color: '#3b82f6', risk: 'high' };
        if (bmi < 17) return { category: 'Moderate Underweight', color: '#60a5fa', risk: 'medium' };
        if (bmi < 18.5) return { category: 'Mild Underweight', color: '#93c5fd', risk: 'low' };
        if (bmi < 25) return { category: 'Normal', color: '#22c55e', risk: 'minimal' };
        if (bmi < 30) return { category: 'Overweight', color: '#f59e0b', risk: 'low' };
        if (bmi < 35) return { category: 'Obese Class I', color: '#f97316', risk: 'medium' };
        if (bmi < 40) return { category: 'Obese Class II', color: '#ef4444', risk: 'high' };
        return { category: 'Obese Class III', color: '#dc2626', risk: 'very high' };
    },

    // BMI with imperial units
    bmiImperial: (weightLbs, heightInches) => {
        return (weightLbs / (heightInches * heightInches)) * 703;
    },

    // Ideal weight range for height
    idealWeightRange: (heightCm) => {
        const heightM = heightCm / 100;
        return {
            min: 18.5 * heightM * heightM,
            max: 24.9 * heightM * heightM
        };
    },

    // Weight change needed to reach target BMI
    weightToTargetBmi: (currentWeight, heightCm, targetBmi) => {
        const heightM = heightCm / 100;
        const targetWeight = targetBmi * heightM * heightM;
        return targetWeight - currentWeight;
    },

    // BMR (Basal Metabolic Rate) - Mifflin-St Jeor Equation
    bmr: (weight, height, age, gender) => {
        if (gender === 'male') {
            return 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
            return 10 * weight + 6.25 * height - 5 * age - 161;
        }
    },

    // TDEE (Total Daily Energy Expenditure)
    calories: (weight, height, age, gender, activity) => {
        const baseBmr = CalcUtils.bmr(weight, height, age, gender);
        const multipliers = {
            sedentary: 1.2,
            light: 1.375,
            moderate: 1.55,
            active: 1.725,
            extreme: 1.9
        };
        return baseBmr * (multipliers[activity] || 1.55);
    },

    // Macros calculator
    macros: (calories, ratio = 'balanced') => {
        const ratios = {
            balanced: { protein: 0.30, carbs: 0.40, fat: 0.30 },
            lowCarb: { protein: 0.40, carbs: 0.20, fat: 0.40 },
            highProtein: { protein: 0.40, carbs: 0.35, fat: 0.25 },
            keto: { protein: 0.25, carbs: 0.05, fat: 0.70 }
        };
        const r = ratios[ratio] || ratios.balanced;
        return {
            protein: { calories: calories * r.protein, grams: (calories * r.protein) / 4 },
            carbs: { calories: calories * r.carbs, grams: (calories * r.carbs) / 4 },
            fat: { calories: calories * r.fat, grams: (calories * r.fat) / 9 }
        };
    },

    // === DATE/TIME ===
    dateDiff: (date1, date2) => {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffMs = Math.abs(d2 - d1);
        return {
            milliseconds: diffMs,
            seconds: Math.floor(diffMs / 1000),
            minutes: Math.floor(diffMs / (1000 * 60)),
            hours: Math.floor(diffMs / (1000 * 60 * 60)),
            days: Math.floor(diffMs / (1000 * 60 * 60 * 24)),
            weeks: Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7)),
            months: Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44)),
            years: Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25))
        };
    },

    age: (birthDate, asOfDate = new Date()) => {
        const today = new Date(asOfDate);
        const birth = new Date(birthDate);
        let years = today.getFullYear() - birth.getFullYear();
        let months = today.getMonth() - birth.getMonth();
        let days = today.getDate() - birth.getDate();

        if (days < 0) { months--; days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
        if (months < 0) { years--; months += 12; }

        // Total days calculation
        const totalDays = Math.floor((today - birth) / (1000 * 60 * 60 * 24));
        const totalWeeks = Math.floor(totalDays / 7);
        const totalMonths = years * 12 + months;

        return { years, months, days, totalDays, totalWeeks, totalMonths };
    },

    // Life expectancy (simplified static data)
    lifeExpectancy: (age, gender, country = 'global') => {
        const baseExpectancy = {
            global: { male: 70, female: 75 },
            US: { male: 76, female: 81 },
            UK: { male: 79, female: 83 },
            India: { male: 69, female: 72 },
            Japan: { male: 81, female: 87 }
        };
        const base = baseExpectancy[country] || baseExpectancy.global;
        const expectancy = gender === 'male' ? base.male : base.female;
        return {
            expectedAge: expectancy,
            yearsRemaining: Math.max(0, expectancy - age),
            daysRemaining: Math.max(0, (expectancy - age) * 365)
        };
    },

    // Date/Time utilities
    DateTime: {
        // Add/subtract duration from date
        addDays: (date, days) => new Date(new Date(date).getTime() + days * 24 * 60 * 60 * 1000),
        addMonths: (date, months) => {
            const d = new Date(date);
            d.setMonth(d.getMonth() + months);
            return d;
        },
        addYears: (date, years) => {
            const d = new Date(date);
            d.setFullYear(d.getFullYear() + years);
            return d;
        },

        // Business days calculation
        businessDays: (startDate, endDate, holidays = []) => {
            const start = new Date(startDate);
            const end = new Date(endDate);
            let count = 0;
            const current = new Date(start);

            const holidaySet = new Set(holidays.map(h => new Date(h).toDateString()));

            while (current <= end) {
                const day = current.getDay();
                const isWeekend = day === 0 || day === 6;
                const isHoliday = holidaySet.has(current.toDateString());

                if (!isWeekend && !isHoliday) count++;
                current.setDate(current.getDate() + 1);
            }
            return count;
        },

        // Timezone difference
        timezoneDiff: (tz1, tz2) => {
            const now = new Date();
            const offset1 = new Date(now.toLocaleString('en-US', { timeZone: tz1 }));
            const offset2 = new Date(now.toLocaleString('en-US', { timeZone: tz2 }));
            return (offset2 - offset1) / (1000 * 60 * 60);
        },

        // Format date for display
        formatDate: (date, format = 'short') => {
            const d = new Date(date);
            const formats = {
                short: { year: 'numeric', month: 'short', day: 'numeric' },
                long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
                iso: null
            };
            if (format === 'iso') return d.toISOString().split('T')[0];
            return d.toLocaleDateString('en-US', formats[format] || formats.short);
        },

        // Generate ICS content
        generateICS: (title, startDate, endDate, description = '') => {
            const formatICSDate = (d) => new Date(d).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            return `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:${title}
DESCRIPTION:${description}
END:VEVENT
END:VCALENDAR`;
        }
    },

    // === TIME CALCULATIONS ===
    Time: {
        // Decimal to standard time (e.g., 1.5 hours = 1:30)
        decimalToTime: (decimal) => {
            const hours = Math.floor(decimal);
            const minutes = Math.round((decimal - hours) * 60);
            return { hours, minutes, formatted: `${hours}:${String(minutes).padStart(2, '0')}` };
        },

        // Standard to decimal (e.g., 1:30 = 1.5)
        timeToDecimal: (hours, minutes) => hours + minutes / 60,

        // Add times
        addTimes: (...times) => {
            const totalMinutes = times.reduce((acc, t) => acc + t.hours * 60 + t.minutes, 0);
            return { hours: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60 };
        },

        // Work shift calculator
        shiftDuration: (startTime, endTime, breakMinutes = 0) => {
            const [startH, startM] = startTime.split(':').map(Number);
            const [endH, endM] = endTime.split(':').map(Number);

            let totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
            if (totalMinutes < 0) totalMinutes += 24 * 60; // Overnight shift
            totalMinutes -= breakMinutes;

            return {
                hours: Math.floor(totalMinutes / 60),
                minutes: totalMinutes % 60,
                decimal: totalMinutes / 60
            };
        },

        // Overflow handling (e.g., 25 hours -> 1 day 1 hour)
        handleOverflow: (hours, minutes, seconds = 0) => {
            let s = seconds % 60;
            let m = (minutes + Math.floor(seconds / 60)) % 60;
            let h = (hours + Math.floor((minutes + Math.floor(seconds / 60)) / 60)) % 24;
            let d = Math.floor((hours + Math.floor((minutes + Math.floor(seconds / 60)) / 60)) / 24);
            return { days: d, hours: h, minutes: m, seconds: s };
        },

        // Time breakdown (total minutes to D:H:M:S)
        breakdown: (totalMinutes) => {
            const d = Math.floor(totalMinutes / (24 * 60));
            const h = Math.floor((totalMinutes % (24 * 60)) / 60);
            const m = Math.floor(totalMinutes % 60);
            return { days: d, hours: h, minutes: m };
        }
    },

    // === UNIT CONVERSIONS ===
    units: {
        length: {
            m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.34, ft: 0.3048, in: 0.0254, yd: 0.9144, nm: 1852
        },
        weight: {
            kg: 1, g: 0.001, mg: 0.000001, lb: 0.453592, oz: 0.0283495, ton: 1000, st: 6.35029
        },
        area: {
            sqm: 1, sqkm: 1000000, sqft: 0.092903, sqmi: 2589988, acre: 4046.86, hectare: 10000
        },
        volume: {
            l: 1, ml: 0.001, gal: 3.78541, qt: 0.946353, pt: 0.473176, cup: 0.236588, floz: 0.0295735
        },
        speed: {
            mps: 1, kph: 0.277778, mph: 0.44704, knot: 0.514444, fps: 0.3048
        },
        data: {
            b: 1, kb: 1024, mb: 1048576, gb: 1073741824, tb: 1099511627776
        },
        temperature: {
            cToF: (c) => c * 9 / 5 + 32,
            fToC: (f) => (f - 32) * 5 / 9,
            cToK: (c) => c + 273.15,
            kToC: (k) => k - 273.15,
            fToK: (f) => (f - 32) * 5 / 9 + 273.15,
            kToF: (k) => (k - 273.15) * 9 / 5 + 32
        }
    },

    convert: (value, fromUnit, toUnit, type) => {
        if (type === 'temperature') {
            const key = `${fromUnit.toLowerCase()}To${toUnit.toUpperCase()}`;
            const fn = CalcUtils.units.temperature[key];
            return fn ? fn(value) : value;
        }
        const table = CalcUtils.units[type];
        if (!table) return value;
        return value * table[fromUnit] / table[toUnit];
    },

    // Multi-convert: convert to all units at once
    convertToAll: (value, fromUnit, type) => {
        const table = CalcUtils.units[type];
        if (!table) return {};
        const results = {};
        for (const unit in table) {
            if (unit !== fromUnit) {
                results[unit] = value * table[fromUnit] / table[unit];
            }
        }
        return results;
    },

    // === GPA ===
    gpa: (grades) => {
        const gradePoints = { 'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'D-': 0.7, 'F': 0 };
        let totalPoints = 0, totalCredits = 0;
        grades.forEach(g => {
            const points = gradePoints[g.grade] || 0;
            totalPoints += points * g.credits;
            totalCredits += g.credits;
        });
        return totalCredits > 0 ? totalPoints / totalCredits : 0;
    },

    // GPA target calculator
    gpaTarget: (currentGpa, currentCredits, targetGpa, remainingCredits) => {
        const totalCredits = currentCredits + remainingCredits;
        const neededPoints = targetGpa * totalCredits;
        const currentPoints = currentGpa * currentCredits;
        const neededGpa = (neededPoints - currentPoints) / remainingCredits;
        return {
            neededGpa,
            possible: neededGpa <= 4.0 && neededGpa >= 0,
            message: neededGpa > 4.0 ? 'Target not achievable' : neededGpa < 0 ? 'Target already exceeded' : 'Achievable'
        };
    },

    // === TAX ===
    tax: (income, brackets) => {
        let tax = 0, remaining = income;
        let prevLimit = 0;

        for (const bracket of brackets) {
            const taxable = Math.min(remaining, bracket.limit - prevLimit);
            if (taxable > 0) {
                tax += taxable * (bracket.rate / 100);
                remaining -= taxable;
            }
            prevLimit = bracket.limit;
            if (remaining <= 0) break;
        }
        return tax;
    },

    // Tax utilities
    Tax: {
        effectiveRate: (income, tax) => income > 0 ? (tax / income) * 100 : 0,

        marginalRate: (income, brackets) => {
            let prevLimit = 0;
            for (const bracket of brackets) {
                if (income <= bracket.limit) return bracket.rate;
                prevLimit = bracket.limit;
            }
            return brackets[brackets.length - 1]?.rate || 0;
        },

        // Common tax bracket presets
        brackets: {
            US2024Single: [
                { limit: 11600, rate: 10 },
                { limit: 47150, rate: 12 },
                { limit: 100525, rate: 22 },
                { limit: 191950, rate: 24 },
                { limit: 243725, rate: 32 },
                { limit: 609350, rate: 35 },
                { limit: Infinity, rate: 37 }
            ],
            US2024Married: [
                { limit: 23200, rate: 10 },
                { limit: 94300, rate: 12 },
                { limit: 201050, rate: 22 },
                { limit: 383900, rate: 24 },
                { limit: 487450, rate: 32 },
                { limit: 731200, rate: 35 },
                { limit: Infinity, rate: 37 }
            ]
        },

        withDeductions: (grossIncome, deductions) => {
            const taxableIncome = Math.max(0, grossIncome - deductions);
            return taxableIncome;
        }
    },

    // === CURRENCY ===
    Currency: {
        // Default offline rates (can be updated via import)
        rates: {
            USD: 1,
            EUR: 0.92,
            GBP: 0.79,
            JPY: 149.50,
            INR: 83.12,
            AUD: 1.53,
            CAD: 1.36,
            CHF: 0.88,
            CNY: 7.24,
            AED: 3.67
        },

        convert: (amount, from, to) => {
            const rates = CalcUtils.Currency.rates;
            if (!rates[from] || !rates[to]) return amount;
            const inUSD = amount / rates[from];
            return inUSD * rates[to];
        },

        convertMultiple: (amount, from, currencies) => {
            const results = {};
            currencies.forEach(to => {
                results[to] = CalcUtils.Currency.convert(amount, from, to);
            });
            return results;
        },

        multiConvert: (amount, from, currencies) => {
            return CalcUtils.Currency.convertMultiple(amount, from, currencies);
        },

        getAllCurrencies: () => {
            return { ...CalcUtils.Currency.rates };
        },

        setRates: (newRates) => {
            CalcUtils.Currency.rates = { ...CalcUtils.Currency.rates, ...newRates };
        },

        exportRates: () => JSON.stringify(CalcUtils.Currency.rates, null, 2),

        importRates: (jsonString) => {
            try {
                const rates = JSON.parse(jsonString);
                CalcUtils.Currency.setRates(rates);
                return true;
            } catch (e) {
                return false;
            }
        }
    },

    // === FORMATTING ===
    formatNumber: (num, decimals = 2) => {
        if (isNaN(num) || num === null || num === undefined) return '0';
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(num);
    },

    formatCurrency: (num, currency = 'USD', decimals = 2) => {
        if (isNaN(num)) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(num);
    },

    formatCompact: (num) => {
        if (isNaN(num)) return '0';
        return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(num);
    },

    formatScientific: (num, decimals = 4) => {
        if (isNaN(num)) return '0';
        return num.toExponential(decimals);
    },

    parseFormattedNumber: (str) => {
        if (typeof str !== 'string') return parseFloat(str) || 0;
        return parseFloat(str.replace(/[^0-9.-]/g, ''));
    },

    // === ENGINEERING & SCIENTIFIC ===
    toEngineering: (num, precision = 3) => {
        if (num === 0) return "0";
        const exp = Math.floor(Math.log10(Math.abs(num)) / 3) * 3;
        const pre = (num / Math.pow(10, exp)).toPrecision(precision);
        return `${pre}e${exp >= 0 ? '+' : ''}${exp}`;
    },

    // === ADVANCED TAX SYSTEM ===
    Tax: {
        effectiveRate: (income, tax) => income > 0 ? (tax / income) * 100 : 0,

        marginalRate: (income, brackets) => {
            for (const bracket of brackets) {
                if (income <= bracket.limit) return bracket.rate;
            }
            return brackets[brackets.length - 1]?.rate || 0;
        },

        calculateTax: (income, brackets, deductions = 0, exemptions = 0) => {
            const taxableIncome = Math.max(0, income - deductions - exemptions);
            let tax = 0;
            let prevLimit = 0;

            for (const bracket of brackets) {
                const limit = bracket.limit || Infinity;
                const chunk = Math.min(taxableIncome - prevLimit, limit - prevLimit);
                if (chunk > 0) {
                    tax += chunk * (bracket.rate / 100);
                }
                prevLimit = limit;
                if (taxableIncome <= prevLimit) break;
            }

            return {
                taxableIncome,
                totalTax: tax,
                effectiveRate: (tax / income) * 100,
                netIncome: income - tax
            };
        },

        // Common tax bracket presets
        brackets: {
            US2024Single: [
                { limit: 11600, rate: 10 },
                { limit: 47150, rate: 12 },
                { limit: 100525, rate: 22 },
                { limit: 191950, rate: 24 },
                { limit: 243725, rate: 32 },
                { limit: 609350, rate: 35 },
                { limit: Infinity, rate: 37 }
            ],
            UK2024: [
                { limit: 12570, rate: 0 },
                { limit: 50270, rate: 20 },
                { limit: 125140, rate: 40 },
                { limit: Infinity, rate: 45 }
            ]
        }
    },

    // === EXPRESSION PARSER ===
    evaluate: (expr) => {
        try {
            // Replace common symbols
            let sanitized = expr
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/−/g, '-')
                .replace(/\^/g, '**')
                .replace(/π/g, Math.PI.toString())
                .replace(/e(?![0-9])/g, Math.E.toString());

            // Only allow safe characters
            sanitized = sanitized.replace(/[^0-9+\-*/.()%\s]/g, '');

            if (!sanitized || sanitized.trim() === '') return 0;

            // Safe evaluation
            return Function('"use strict"; return (' + sanitized + ')')();
        } catch (e) {
            return 'Error';
        }
    },

    // === EQUATION SOLVER ===
    EquationSolver: {
        solveLinear: (a, b, c) => {
            // ax + b = c  =>  x = (c - b) / a
            if (a === 0) return b === c ? 'Infinite Solutions' : 'No Solution';
            return (c - b) / a;
        },

        solveQuadratic: (a, b, c) => {
            // ax^2 + bx + c = 0
            if (a === 0) return [CalcUtils.EquationSolver.solveLinear(b, c, 0)];
            const delta = b * b - 4 * a * c;
            if (delta < 0) return {
                real: false, roots: [
                    { real: -b / (2 * a), imaginary: Math.sqrt(-delta) / (2 * a) },
                    { real: -b / (2 * a), imaginary: -Math.sqrt(-delta) / (2 * a) }
                ]
            };
            if (delta === 0) return [(-b) / (2 * a)];
            return [(-b + Math.sqrt(delta)) / (2 * a), (-b - Math.sqrt(delta)) / (2 * a)];
        }
    },

    // === MEMORY MANAGER ===
    Memory: {
        vars: { A: 0, B: 0, C: 0, D: 0, E: 0, ANS: 0 },
        set: (key, val) => {
            if (key in CalcUtils.Memory.vars) {
                CalcUtils.Memory.vars[key] = parseFloat(val) || 0;
            }
        },
        get: (key) => CalcUtils.Memory.vars[key] || 0,
        clear: () => {
            CalcUtils.Memory.vars = { A: 0, B: 0, C: 0, D: 0, E: 0, ANS: 0 };
        },
        getAll: () => ({ ...CalcUtils.Memory.vars })
    },

    // === STATISTICS ===
    Stats: {
        sum: (arr) => arr.reduce((a, b) => a + b, 0),
        mean: (arr) => arr.length > 0 ? CalcUtils.Stats.sum(arr) / arr.length : 0,
        median: (arr) => {
            if (arr.length === 0) return 0;
            const sorted = [...arr].sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
        },
        mode: (arr) => {
            const freq = {};
            arr.forEach(n => freq[n] = (freq[n] || 0) + 1);
            const maxFreq = Math.max(...Object.values(freq));
            return Object.keys(freq).filter(k => freq[k] === maxFreq).map(Number);
        },
        variance: (arr) => {
            const mean = CalcUtils.Stats.mean(arr);
            return CalcUtils.Stats.mean(arr.map(n => Math.pow(n - mean, 2)));
        },
        stdDev: (arr) => Math.sqrt(CalcUtils.Stats.variance(arr)),
        min: (arr) => Math.min(...arr),
        max: (arr) => Math.max(...arr),
        range: (arr) => CalcUtils.Stats.max(arr) - CalcUtils.Stats.min(arr)
    }
};

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CalcUtils;
}
