import { describe, it, expect } from 'vitest';
import { computeDelta, extractFeatures } from './feature_extractor.js';

// ─── helpers ────────────────────────────────────────────────────────────────

const makeLm = (x = 0, y = 0, z = 0) => ({ x, y, z });

const emptyPose = () => ({ landmarks: [] });
const emptyHands = () => ({ landmarks: [], handedness: [] });

// ─── computeDelta ────────────────────────────────────────────────────────────

describe('computeDelta', () => {
  const makeBuffer = (n = 20) =>
    Array.from({ length: n }, (_, i) =>
      Array.from({ length: 225 }, (_, j) => (i + 1) * 0.01 + j * 0.001)
    );

  it('output has same number of frames as input', () => {
    expect(computeDelta(makeBuffer()).length).toBe(20);
  });

  it('each output frame has 450 values (225 original + 225 delta)', () => {
    const result = computeDelta(makeBuffer());
    result.forEach(frame => expect(frame.length).toBe(450));
  });

  it('first frame delta (indices 225–449) is all zeros', () => {
    const result = computeDelta(makeBuffer());
    const deltas = result[0].slice(225);
    expect(deltas.every(v => v === 0)).toBe(true);
  });

  it('second frame delta equals frame[1] − frame[0]', () => {
    const buf = makeBuffer();
    const result = computeDelta(buf);
    for (let j = 0; j < 225; j++) {
      expect(result[1][225 + j]).toBeCloseTo(buf[1][j] - buf[0][j], 10);
    }
  });

  it('original features are preserved unchanged in first 225 values', () => {
    const buf = makeBuffer();
    const result = computeDelta(buf);
    buf.forEach((frame, i) => {
      frame.forEach((v, j) => expect(result[i][j]).toBe(v));
    });
  });

  it('all-zero input produces all-zero output', () => {
    const buf = Array.from({ length: 20 }, () => new Array(225).fill(0));
    const result = computeDelta(buf);
    result.forEach(frame => expect(frame.every(v => v === 0)).toBe(true));
  });
});

// ─── extractFeatures ─────────────────────────────────────────────────────────

describe('extractFeatures', () => {
  it('returns array of 225 values', () => {
    expect(extractFeatures(emptyPose(), emptyHands()).length).toBe(225);
  });

  it('returns all zeros when no landmarks detected', () => {
    const frame = extractFeatures(emptyPose(), emptyHands());
    expect(frame.every(v => v === 0)).toBe(true);
  });

  it('nose landmark is normalized to (0, 0)', () => {
    const nose = makeLm(0.5, 0.3);
    const lms = [nose, ...Array(32).fill(makeLm())];
    const pose = { landmarks: [lms] };
    const frame = extractFeatures(pose, emptyHands());
    expect(frame[0]).toBeCloseTo(0);   // nose x − nose_x
    expect(frame[1]).toBeCloseTo(0);   // nose y − nose_y
  });

  it('second pose landmark is correctly normalized relative to nose', () => {
    const nose = makeLm(0.5, 0.3);
    const lm1  = makeLm(0.6, 0.4, 0.1);
    const lms  = [nose, lm1, ...Array(31).fill(makeLm())];
    const pose = { landmarks: [lms] };
    const frame = extractFeatures(pose, emptyHands());
    expect(frame[3]).toBeCloseTo(0.6 - 0.5);   // x offset
    expect(frame[4]).toBeCloseTo(0.4 - 0.3);   // y offset
    expect(frame[5]).toBeCloseTo(0.1);           // z unchanged
  });

  it('left hand landmarks are written starting at index 99', () => {
    const lms = [makeLm(0.2, 0.2), ...Array(20).fill(makeLm())];
    const hands = {
      landmarks: [lms],
      handedness: [[{ categoryName: 'Left' }]],
    };
    const frame = extractFeatures(emptyPose(), hands);
    expect(frame[99]).toBeCloseTo(0.2);
    expect(frame[100]).toBeCloseTo(0.2);
  });

  it('right hand landmarks are written starting at index 162', () => {
    const lms = [makeLm(0.7, 0.8), ...Array(20).fill(makeLm())];
    const hands = {
      landmarks: [lms],
      handedness: [[{ categoryName: 'Right' }]],
    };
    const frame = extractFeatures(emptyPose(), hands);
    expect(frame[162]).toBeCloseTo(0.7);
    expect(frame[163]).toBeCloseTo(0.8);
  });

  it('left and right hand slots are independent', () => {
    const leftLms  = [makeLm(0.1, 0.1), ...Array(20).fill(makeLm())];
    const rightLms = [makeLm(0.9, 0.9), ...Array(20).fill(makeLm())];
    const hands = {
      landmarks: [leftLms, rightLms],
      handedness: [[{ categoryName: 'Left' }], [{ categoryName: 'Right' }]],
    };
    const frame = extractFeatures(emptyPose(), hands);
    expect(frame[99]).toBeCloseTo(0.1);
    expect(frame[162]).toBeCloseTo(0.9);
  });
});
