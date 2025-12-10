// A simple non-cryptographic hash function generator
// In a real app we might use MurmurHash3, but this is sufficient for visualization

export const getHashIndices = (input: string, size: number, k: number): number[] => {
  const indices: number[] = [];
  
  // FNV-1a hash implementation
  const fnv1a = (str: string, seed: number) => {
    let hash = 2166136261 ^ seed;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0; // Ensure unsigned 32-bit integer
  };

  // Double Hashing Strategy: h_i(x) = (h1(x) + i * h2(x)) % m
  const h1 = fnv1a(input, 0x811c9dc5); 
  const h2 = fnv1a(input, 0x9e3779b9);

  for (let i = 0; i < k; i++) {
    // Add logic to prevent negative numbers just in case, though >>> 0 handles it
    const combinedHash = (h1 + i * h2) >>> 0; 
    indices.push(combinedHash % size);
  }
  
  return indices;
};

export const calculateFalsePositiveRate = (m: number, k: number, n: number): number => {
  // P = (1 - (1 - 1/m)^kn)^k
  // Approximation: (1 - e^(-kn/m))^k
  return Math.pow(1 - Math.exp(-k * n / m), k);
};
