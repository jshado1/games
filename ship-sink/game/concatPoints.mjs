const concatPoints = (dir, a, b) => dir === 'vertical'
  ? `${a}.${b}`
  : `${b}.${a}`;

export default concatPoints;
