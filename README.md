# 🍺 Kill Beer — Alcohol Risk Indicator

A visual trainer for assessing alcohol consumption risks. Input your weight, drink volume, alcohol percentage, and Widmark factor to see:
- Pure ethanol content (per unit and total)
- Estimated blood alcohol content (Widmark formula, without metabolism)
- Percentage of estimated lethal dose (~8g/kg)

## 🚀 Features
- Real-time risk calculation
- Responsive design
- Visual feedback for dangerous consumption levels
- Built with modern web technologies

## 🛠️ Tech Stack
- **Runtime**: Bun
- **UI**: React 19, Tailwind CSS v4
- **Animation**: Framer Motion
- **Components**: Radix UI
- **Utilities**: clsx, tailwind-merge, class-variance-authority

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh) (v1.0.0 or later)

### Installation
```bash
bun install
```

### Development
```bash
bun run dev
# or
bun start
```
Then open http://localhost:3000 in your browser.

### Build
```bash
bun run build
# Outputs to dist/
```

## 📊 How It Works
- **Ethanol calculation**: volume(ml) * (ABV/100) * 0.79
- **Lethal dose reference**: ~8g/kg * body weight
- **BAC estimation**: A_g / (r * weight_kg)
- **MAX** is calculated dynamically

## ⚠️ Important Note
This application provides simplified estimates and is not medical advice. Always drink responsibly.

## 📄 License
MIT © [vffuunnyy](https://github.com/vffuunnyy)
