export const POISSON_CONSTANTS = {
  k: 1.380649e-23,
  q: 1.602176634e-19,
  epsilon0: 8.8541878128e-12,
  epsilonR: 11.7,
  T: 300,
  ni: 1.08e16,
  Eg: 1.12,
  NC: 2.8e25,
  NV: 1.04e25,
};

export interface ElectricFieldData {
  x: number[];
  E: number[];
  potential: number[];
  n: number[];
  p: number[];
}

export interface ChargeDensityData {
  x: number[];
  rho: number[];
  xp: number;
  xn: number;
  NA: number;
  ND: number;
}

export interface PNJunctionProfiles {
  charge: ChargeDensityData;
  electric: ElectricFieldData;
  potential: { x: number[]; V: number[]; Vbi: number };
}

function calculateVT(T: number): number {
  return (POISSON_CONSTANTS.k * T) / POISSON_CONSTANTS.q;
}

export function calculateElectricFieldProfile(
  NA: number,
  ND: number,
  T: number,
  numPoints: number = 500
): ElectricFieldData {
  if (!isFinite(NA) || !isFinite(ND) || NA <= 0 || ND <= 0) {
    return {
      x: [0],
      E: [0],
      potential: [0],
      n: [0],
      p: [0]
    };
  }

  const epsilonSi = POISSON_CONSTANTS.epsilonR * POISSON_CONSTANTS.epsilon0;
  const VT = calculateVT(T);
  const ni = POISSON_CONSTANTS.ni * 1e6;

  const NAm3 = NA * 1e6;
  const NDm3 = ND * 1e6;

  const product = NAm3 * NDm3;
  if (product <= 0 || !isFinite(product)) {
    return {
      x: [0],
      E: [0],
      potential: [0],
      n: [0],
      p: [0]
    };
  }

  const ratio = product / (ni ** 2);
  if (ratio <= 0 || !isFinite(ratio)) {
    return {
      x: [0],
      E: [0],
      potential: [0],
      n: [0],
      p: [0]
    };
  }

  const Vbi = VT * Math.log(ratio);

  if (!isFinite(Vbi) || Vbi <= 0) {
    return {
      x: [0],
      E: [0],
      potential: [0],
      n: [0],
      p: [0]
    };
  }

  const W = Math.sqrt(
    (2 * epsilonSi * Vbi / POISSON_CONSTANTS.q) *
    ((1 / NAm3) + (1 / NDm3))
  );

  if (!isFinite(W) || W <= 0) {
    return {
      x: [0],
      E: [0],
      potential: [0],
      n: [0],
      p: [0]
    };
  }

  const xp = W * (NDm3 / (NAm3 + NDm3));
  const xn = W * (NAm3 / (NAm3 + NDm3));

  if (!isFinite(xp) || !isFinite(xn)) {
    return {
      x: [0],
      E: [0],
      potential: [0],
      n: [0],
      p: [0]
    };
  }

  const Emax = (POISSON_CONSTANTS.q * NAm3 * xp) / epsilonSi;

  if (!isFinite(Emax)) {
    return {
      x: [0],
      E: [0],
      potential: [0],
      n: [0],
      p: [0]
    };
  }

  // Use fixed 0.5 μm range for stable visualization
  const fixedPlotRange = 0.5e-6; // Fixed 0.5 μm range (0.25 μm on each side)
  const domainStart = -fixedPlotRange;
  const domainEnd = fixedPlotRange;
  const dx = (domainEnd - domainStart) / (numPoints - 1);

  const x: number[] = [];
  const E: number[] = [];
  const potential: number[] = [];
  const n: number[] = [];
  const p: number[] = [];

  for (let i = 0; i < numPoints; i++) {
    const pos = domainStart + i * dx;
    x.push(pos * 1e6);

    let Efield = 0;
    let phi = 0;

    if (pos >= -xp && pos < 0) {
      Efield = -(POISSON_CONSTANTS.q * NAm3 / epsilonSi) * (pos + xp);
      phi = -(POISSON_CONSTANTS.q * NAm3 / (2 * epsilonSi)) * Math.pow(pos + xp, 2);
    } else if (pos >= 0 && pos <= xn) {
      Efield = (POISSON_CONSTANTS.q * NDm3 / epsilonSi) * (xn - pos);
      phi = Vbi - (POISSON_CONSTANTS.q * NDm3 / (2 * epsilonSi)) * Math.pow(xn - pos, 2);
    } else if (pos < -xp) {
      Efield = 0;
      phi = 0;
    } else {
      Efield = 0;
      phi = Vbi;
    }

    E.push(Efield / 1e5);
    potential.push(phi);

    const phiClipped = Math.max(-50 * VT, Math.min(50 * VT, phi));

    const nDensity = NDm3 * Math.exp(phiClipped / VT);
    const pDensity = (ni ** 2 / NDm3) * Math.exp(-phiClipped / VT);

    n.push(nDensity / 1e6);
    p.push(pDensity / 1e6);
  }

  return { x, E, potential, n, p };
}

export function calculateCarrierProfile(
  _NA: number,
  ND: number,
  T: number,
  xArray: number[],
  potentialArray: number[]
): { n: number[]; p: number[] } {
  const VT = calculateVT(T);
  const ni = POISSON_CONSTANTS.ni * 1e6;
  const NDm3 = ND * 1e6;

  const n: number[] = [];
  const p: number[] = [];

  for (let i = 0; i < xArray.length; i++) {
    const phi = potentialArray[i];
    const phiClipped = Math.max(-50 * VT, Math.min(50 * VT, phi));

    const nDensity = NDm3 * Math.exp(phiClipped / VT);
    const pDensity = (ni ** 2 / NDm3) * Math.exp(-phiClipped / VT);

    n.push(nDensity / 1e6);
    p.push(pDensity / 1e6);
  }

  return { n, p };
}

export function calculatePNJunctionProfiles(
  NA: number,
  ND: number,
  T: number,
  numPoints: number = 500
): PNJunctionProfiles {
  const epsilonSi = POISSON_CONSTANTS.epsilonR * POISSON_CONSTANTS.epsilon0;
  const VT = calculateVT(T);
  const ni = POISSON_CONSTANTS.ni * 1e6; // Convert to m^-3
  
  const NAm3 = NA * 1e6; // Convert cm^-3 to m^-3
  const NDm3 = ND * 1e6; // Convert cm^-3 to m^-3

  // Calculate built-in potential
  const Vbi = VT * Math.log((NAm3 * NDm3) / (ni ** 2));

  // Calculate depletion widths
  const W = Math.sqrt(
    (2 * epsilonSi * Vbi / POISSON_CONSTANTS.q) *
    ((1 / NAm3) + (1 / NDm3))
  );

  const xp = W * (NDm3 / (NAm3 + NDm3));
  const xn = W * (NAm3 / (NAm3 + NDm3));

  // Create extended domain for plotting - fixed 0.5 μm per unit scale
  const fixedPlotRange = 0.5e-6; // Fixed 0.5 μm range (0.25 μm on each side) for stable visualization
  const domainStart = -fixedPlotRange;
  const domainEnd = fixedPlotRange;
  const dx = (domainEnd - domainStart) / (numPoints - 1);

  const x: number[] = [];
  const rho: number[] = [];
  const E: number[] = [];
  const V: number[] = [];

  // Calculate maximum electric field at junction for continuity (used for reference)
  // const Emax = (POISSON_CONSTANTS.q * NAm3 * xp) / epsilonSi;

  // Calculate profiles with smooth transitions
  for (let i = 0; i < numPoints; i++) {
    const pos = domainStart + i * dx;
    x.push(pos * 1e6); // Convert to μm for display

    let chargeDensity = 0;
    let electricField = 0;
    let potential = 0;

    if (pos >= -xp && pos <= xn) {
      // Within depletion region - piecewise constant charge density
      if (pos < 0) {
        // P-side depletion region - constant negative charge
        chargeDensity = -POISSON_CONSTANTS.q * NAm3;
        electricField = -(POISSON_CONSTANTS.q * NAm3 / epsilonSi) * (pos + xp);
        // Potential from p-side integration
        potential = -(POISSON_CONSTANTS.q * NAm3 / (2 * epsilonSi)) * Math.pow(pos + xp, 2);
      } else {
        // N-side depletion region - constant positive charge
        chargeDensity = POISSON_CONSTANTS.q * NDm3;
        electricField = (POISSON_CONSTANTS.q * NDm3 / epsilonSi) * (xn - pos);
        // Potential from n-side integration, ensuring continuity
        const potentialAtJunction = -(POISSON_CONSTANTS.q * NAm3 / (2 * epsilonSi)) * Math.pow(xp, 2);
        potential = potentialAtJunction - (POISSON_CONSTANTS.q * NDm3 / (2 * epsilonSi)) * Math.pow(pos, 2) + 
                   (POISSON_CONSTANTS.q * NDm3 / epsilonSi) * xn * pos;
      }
    } else {
      // Neutral regions - zero charge density
      chargeDensity = 0;
      electricField = 0;
      if (pos < -xp) {
        potential = 0; // Reference potential in p-neutral
      } else {
        potential = Vbi; // Potential in n-neutral
      }
    }

    rho.push(chargeDensity / 1e6); // Convert to C/cm^3 for display (keep original sign)
    E.push(Math.abs(electricField) / 1e5); // Take modulus and convert to V/cm for display
    V.push(Math.abs(potential)); // Take modulus for continuous potential display
  }

  return {
    charge: {
      x,
      rho,
      xp: xp * 1e6, // Convert to μm
      xn: xn * 1e6, // Convert to μm
      NA,
      ND
    },
    electric: {
      x,
      E,
      potential: V,
      n: [], // Will be calculated separately if needed
      p: []  // Will be calculated separately if needed
    },
    potential: {
      x,
      V,
      Vbi
    }
  };
}
