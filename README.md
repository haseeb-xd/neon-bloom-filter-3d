# 🌸 Neon Bloom Filter 3D

<div align="center">

A high-fidelity, interactive 3D visualization of a Counting Bloom Filter. Experience data structures like never before with real-time visual feedback, neon cyber-aesthetics, and intuitive controls.

[![React](https://img.shields.io/badge/React-19.2.1-61DAFB?logo=react)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-0.181.2-000000?logo=three.js)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?logo=vite)](https://vitejs.dev/)

[Live Demo](#) • [Features](#features) • [Installation](#installation) • [Usage](#usage)

</div>

---

## ✨ Features

### 🎯 Core Functionality
- **Interactive Bloom Filter Operations**: Insert, check, and delete items with real-time visualization
- **Counting Bloom Filter**: Supports deletion operations (unlike standard Bloom Filters)
- **Dynamic Configuration**: Adjustable array size (10-200) and hash function count (1-10)
- **Real-time Statistics**: Track items count, fill rate, and estimated false positive rate

### 🎨 Visual Experience
- **3D Grid Visualization**: Each bit represented as a glowing 3D box in a neon cyber-aesthetic
- **Color-Coded Operations**:
  - 🔵 **Cyan**: Active bits
  - 🟢 **Green**: Match found
  - 🔴 **Red**: Missing bits (not found)
  - 🟠 **Orange**: False positive detection
  - 🟣 **Purple**: Deletion operation
- **Animated Transitions**: Smooth color and height transitions for visual feedback
- **Connection Beams**: Visual lines connecting operations to affected bits
- **Floating Labels**: Real-time operation status display

### 🧮 Educational Features
- **False Positive Detection**: Automatically identifies and highlights false positives
- **Hash Visualization**: See exactly which bits are affected by each operation
- **Collision Visualization**: Watch how multiple items can set the same bits
- **Scalable Display**: Automatically adjusts camera and text size for any array size

---

## 🚀 Installation

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/neon-bloom-filter-3d.git
   cd neon-bloom-filter-3d
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` (or the port shown in your terminal)

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📖 Usage

### Basic Operations

1. **Insert an Item**
   - Enter a value in the input field
   - Click **INSERT** or press Enter
   - Watch as the hash functions set the corresponding bits

2. **Check Membership**
   - Enter a value to check
   - Click **CHECK**
   - See if all required bits are set (green = found, red = not found)
   - False positives are highlighted in orange

3. **Delete an Item**
   - Enter a value that exists in the filter
   - Click **DELETE**
   - The corresponding bit counters are decremented

### Configuration

- **Array Size (m)**: Adjust the size of the bit array (10-200)
  - Larger arrays = lower false positive rate but more memory
  - Smaller arrays = higher false positive rate but less memory

- **Hash Functions (k)**: Set the number of hash functions (1-10)
  - More hash functions = lower false positive rate but slower operations
  - Fewer hash functions = faster operations but higher false positive rate

### Understanding the Visualization

- **Box Height**: Represents the counter value (for counting bloom filters)
- **Box Color**: Indicates the current state or operation
- **Index Numbers**: Displayed above each box for reference
- **Count Labels**: Show when multiple items share the same bit (x2, x3, etc.)

---

## 🧠 How Bloom Filters Work

### What is a Bloom Filter?

A **Bloom Filter** is a probabilistic data structure that efficiently tests whether an element is a member of a set. It can have **false positives** (saying an item exists when it doesn't) but **never false negatives** (if it says an item doesn't exist, it definitely doesn't).

### How It Works

1. **Initialization**: Start with an array of `m` bits, all set to 0
2. **Insertion**: 
   - Hash the item with `k` different hash functions
   - Set the bits at the resulting positions to 1
3. **Query**: 
   - Hash the item with the same `k` hash functions
   - If all `k` bits are set, the item *might* be in the set
   - If any bit is 0, the item is *definitely* not in the set

### Counting Bloom Filter

This implementation uses a **Counting Bloom Filter**, which:
- Uses counters instead of single bits
- Allows deletion by decrementing counters
- Prevents false negatives from deletions

### False Positive Rate

The probability of a false positive is approximately:
```
P ≈ (1 - e^(-kn/m))^k
```
Where:
- `m` = array size
- `k` = number of hash functions
- `n` = number of items inserted

---

## 🛠️ Technologies Used

- **[React](https://reactjs.org/)** - UI framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Three.js](https://threejs.org/)** - 3D graphics
- **[React Three Fiber](https://docs.pmnd.rs/react-three-fiber)** - React renderer for Three.js
- **[@react-three/drei](https://github.com/pmndrs/drei)** - Useful helpers for R3F
- **[Vite](https://vitejs.dev/)** - Build tool and dev server
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling (via CDN)

### Hash Function

The implementation uses **FNV-1a hash** with **double hashing**:
- Primary hash: FNV-1a with seed `0x811c9dc5`
- Secondary hash: FNV-1a with seed `0x9e3779b9`
- Combined: `h_i(x) = (h1(x) + i * h2(x)) % m`

This generates `k` distinct hash values from just two hash function calls.

---

## 📁 Project Structure

```
neon-bloom-filter-3d/
├── App.tsx                 # Main application component
├── bloomLogic.ts           # Bloom filter algorithms and hash functions
├── types.ts                # TypeScript type definitions
├── index.tsx               # Application entry point
├── components/
│   └── Simulation.tsx      # 3D visualization component
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

---

## 🎓 Educational Value

This project is perfect for:
- **Students** learning data structures and algorithms
- **Developers** understanding probabilistic data structures
- **Educators** teaching hash functions and set membership
- **Anyone** curious about how modern systems handle large-scale membership queries

### Key Concepts Demonstrated

- Hash functions and collision handling
- Probabilistic data structures
- Space-time tradeoffs
- False positive rates
- Counting data structures

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. Some areas for improvement:

- Additional hash function implementations
- Performance optimizations for large arrays
- Mobile responsiveness improvements
- Accessibility enhancements
- Additional visualization modes

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 💝 Support

If you find this project helpful or educational, consider supporting the development:

[![Patreon](https://c5.patreon.com/external/logo/become_a_patron_button.png)](https://www.patreon.com/checkout/HaseebAnsari/9950942)

---

## 🙏 Acknowledgments

- Built with [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) and the amazing Three.js community
- Inspired by the need for better data structure visualizations
- Special thanks to all contributors and users

---

## 📧 Contact

For questions, suggestions, or feedback, please open an issue on GitHub.

---

<div align="center">

**Made with ❤️ and lots of ☕**

⭐ Star this repo if you find it useful!

</div>

