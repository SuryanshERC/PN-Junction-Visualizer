export const CONSTANTS = {
  k: 1.380649e-23,
  q: 1.602176634e-19,
  h: 6.62607015e-34,
  T: 300,
  ni: 1.5e10,
  epsilonS: 1.04e-12,
  NC: 2.8e25,
  NV: 1.04e25,
  Eg: 1.12,
};

export interface JunctionParams {
  NA: number;
  ND: number;
  T: number;
}

export interface BandDiagramData {
  Vbi: number;
  W: number;
  xp: number;
  xn: number;
  Emax: number;
  EcN: number;
  EvN: number;
  EcP: number;
  EvP: number;
  EF: number;
  Ei: number;
}

export interface CarrierDensities {
  nN: number;
  pN: number;
  nP: number;
  pP: number;
}

export function calculateBuiltInPotential(NA: number, ND: number, T: number): number {
  if (!isFinite(NA) || !isFinite(ND) || NA <= 0 || ND <= 0) {
    return 0;
  }
  const kT = (CONSTANTS.k * T) / CONSTANTS.q;
  const product = NA * ND;
  if (product <= 0 || !isFinite(product)) {
    return 0;
  }
  const ratio = product / (CONSTANTS.ni ** 2);
  if (ratio <= 0 || !isFinite(ratio)) {
    return 0;
  }
  return kT * Math.log(ratio);
}

export function calculateDepletionWidth(NA: number, ND: number, Vbi: number): { W: number; xp: number; xn: number } {
  if (!isFinite(NA) || !isFinite(ND) || !isFinite(Vbi) || NA <= 0 || ND <= 0 || Vbi <= 0) {
    return { W: 0, xp: 0, xn: 0 };
  }

  const product = NA * ND;
  if (product <= 0 || !isFinite(product)) {
    return { W: 0, xp: 0, xn: 0 };
  }

  const W = Math.sqrt(
    (2 * CONSTANTS.epsilonS / CONSTANTS.q) *
    ((NA + ND) / product) *
    Vbi
  );

  if (!isFinite(W) || W <= 0) {
    return { W: 0, xp: 0, xn: 0 };
  }

  const xp = W * (ND / (NA + ND));
  const xn = W * (NA / (NA + ND));

  return { W, xp, xn };
}

export function calculateMaxElectricField(NA: number, _ND: number, xp: number, _xn: number): number {
  if (!isFinite(NA) || !isFinite(xp) || NA <= 0 || xp <= 0) {
    return 0;
  }
  const result = (CONSTANTS.q * NA * xp) / CONSTANTS.epsilonS;
  return isFinite(result) ? result : 0;
}

export function calculateCarrierDensities(NA: number, ND: number): CarrierDensities {
  return {
    nN: ND,
    pN: (CONSTANTS.ni ** 2) / ND,
    nP: (CONSTANTS.ni ** 2) / NA,
    pP: NA,
  };
}

export function calculateBandDiagram(params: JunctionParams): BandDiagramData {
  const { NA, ND, T } = params;
  const kT = (CONSTANTS.k * T) / CONSTANTS.q;

  const Vbi = calculateBuiltInPotential(NA, ND, T);
  const { W, xp, xn } = calculateDepletionWidth(NA, ND, Vbi);
  const Emax = calculateMaxElectricField(NA, ND, xp, xn);

  const EcN = 0;
  const EvN = -CONSTANTS.Eg;
  const EF = -CONSTANTS.Eg / 2 - kT * Math.log(ND / CONSTANTS.ni);

  const bandBendingFactor = 1.8;
  const EcP = -Vbi * bandBendingFactor;
  const EvP = -Vbi * bandBendingFactor - CONSTANTS.Eg;

  const Ei = -CONSTANTS.Eg / 2;

  return {
    Vbi,
    W,
    xp,
    xn,
    Emax,
    EcN,
    EvN,
    EcP,
    EvP,
    EF,
    Ei,
  };
}

export function generateBandProfile(
  bandData: BandDiagramData,
  numPoints: number = 500
): {
  x: number[];
  Ec: number[];
  Ev: number[];
  EF: number[];
  Ei: number[];
} {
  const { xp, xn, EcN, EvN, EcP, EvP, EF, Vbi } = bandData;

  const x: number[] = [];
  const Ec: number[] = [];
  const Ev: number[] = [];
  const EFArray: number[] = [];
  const Ei: number[] = [];

  const totalWidth = (xp + xn) * 3;
  const depletionStart = -xp;
  const depletionEnd = xn;

  const transitionWidth = (xp + xn) * 0.15;

  for (let i = 0; i < numPoints; i++) {
    const pos = -totalWidth / 2 + (i / (numPoints - 1)) * totalWidth;
    x.push(pos * 1e6);

    EFArray.push(EF);

    if (pos < depletionStart - transitionWidth) {
      Ec.push(EcP);
      Ev.push(EvP);
      Ei.push(EcP + CONSTANTS.Eg / 2);
    } else if (pos > depletionEnd + transitionWidth) {
      Ec.push(EcN);
      Ev.push(EvN);
      Ei.push(EcN + CONSTANTS.Eg / 2);
    } else if (pos >= depletionStart - transitionWidth && pos <= depletionStart) {
      const t = (pos - (depletionStart - transitionWidth)) / transitionWidth;
      const smoothT = t * t * (3 - 2 * t);
      Ec.push(EcP * (1 - smoothT * 0.05) + EcP * smoothT * 0.05);
      Ev.push(EvP * (1 - smoothT * 0.05) + EvP * smoothT * 0.05);
      Ei.push(EcP + CONSTANTS.Eg / 2);
    } else if (pos >= depletionEnd && pos <= depletionEnd + transitionWidth) {
      const t = (pos - depletionEnd) / transitionWidth;
      const smoothT = t * t * (3 - 2 * t);
      Ec.push(EcN * smoothT + EcN * (1 - smoothT));
      Ev.push(EvN * smoothT + EvN * (1 - smoothT));
      Ei.push(EcN + CONSTANTS.Eg / 2);
    } else {
      const normalizedPos = (pos - depletionStart) / (depletionEnd - depletionStart);

      const smoothPos = normalizedPos * normalizedPos * (3 - 2 * normalizedPos);
      const bandBendingFactor = 1.8;
      const potential = Vbi * bandBendingFactor * smoothPos;

      Ec.push(EcP + potential);
      Ev.push(EvP + potential);
      Ei.push(EcP + potential + CONSTANTS.Eg / 2);
    }
  }

  return { x, Ec, Ev, EF: EFArray, Ei };
}

export function generatePotentialProfile(
  bandData: BandDiagramData,
  numPoints: number = 100
): { x: number[]; V: number[]; E: number[] } {
  const { xp, xn, Vbi, Emax } = bandData;

  const x: number[] = [];
  const V: number[] = [];
  const E: number[] = [];

  for (let i = 0; i < numPoints; i++) {
    const pos = -xp + (i / (numPoints - 1)) * (xp + xn);
    x.push(pos * 1e6);

    if (pos < 0) {
      V.push((CONSTANTS.q * bandData.xp * 1e9 * Emax / (2 * CONSTANTS.epsilonS)) * Math.pow((pos + xp) / xp, 2));
      E.push(-Emax * (pos + xp) / xp);
    } else {
      V.push(Vbi - (CONSTANTS.q * bandData.xn * 1e9 * Emax / (2 * CONSTANTS.epsilonS)) * Math.pow((xn - pos) / xn, 2));
      E.push(Emax * (xn - pos) / xn);
    }
  }

  return { x, V, E };
}
