import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

import MaxIcon from "../assets/max.svg";

const ETHANOL_DENSITY = 0.79; // г/мл

export function BeerRiskTrainerV3() {
  // Вводные
  const [weightKg, setWeightKg] = useState(90);
  const [volumeMl, setVolumeMl] = useState(500);
  const [abv, setAbv] = useState(5);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  
  // Коэффициент r зависит от пола
  const rFactor = useMemo(() => {
    return gender === 'male' ? 0.68 : 0.55;
  }, [gender]);
  
  // Летальный ориентир: 5 ‰ BAC (верхняя граница) по формуле Widmark
  // A_lethal = C_target * r * W, где C_target = 5 ‰ = 5 г/л
  const lethalTargetG = useMemo(() => Math.max(1, 5 * rFactor * weightKg), [rFactor, weightKg]);
  const [maxUnits, setMaxUnits] = useState(30);          // верхняя граница слайдера

  // Количество
  const [count, setCount] = useState(0);

  // Оверлей при 100% и при MAX
  const [showOverlay, setShowOverlay] = useState(false);

  // Базовые расчёты
  const gramsPerUnit = useMemo(() => volumeMl * (abv / 100) * ETHANOL_DENSITY, [volumeMl, abv]);
  const totalGrams = useMemo(() => gramsPerUnit * count, [gramsPerUnit, count]);

  // % к пользовательскому ориентиру
  const pctToLethal = useMemo(() => {
    if (lethalTargetG <= 0) return 0;
    return Math.min(100, (totalGrams / lethalTargetG) * 100);
  }, [totalGrams, lethalTargetG]);

  // Оценка промилле по формуле Вильмáрка без учёта метаболизма
  // ‰ ≈ A_г / (r * масса_кг)
  const promille = useMemo(() => {
    if (weightKg <= 0 || rFactor <= 0) return 0;
    return totalGrams / (rFactor * weightKg);
  }, [totalGrams, rFactor, weightKg]);

  // Рассчёт верхней границы (MAX) из летальной концентрации 4 ‰
  // MAX = floor(lethalTargetG / грамм_в_единице)
  useEffect(() => {
    if (gramsPerUnit > 0) {
      const nextMax = Math.max(0, Math.floor(lethalTargetG / gramsPerUnit));
      setMaxUnits(nextMax);
      if (count > nextMax) setCount(nextMax);
    } else {
      setMaxUnits(0);
      if (count > 0) setCount(0);
    }
  }, [lethalTargetG, gramsPerUnit]);

  const barColor = pctToLethal >= 90 ? "#dc2626" : pctToLethal >= 60 ? "#f59e0b" : "#22c55e";

  useEffect(() => {
    if (count >= 1 && (pctToLethal >= 100 || count >= maxUnits)) setShowOverlay(true);
    else setShowOverlay(false);
  }, [pctToLethal, count, maxUnits]);

  function setMax() { setCount(maxUnits); }
  function resetAll() { setCount(0); }

  return (
    <div className="relative min-h-screen w-screen bg-gradient-to-b from-amber-50 via-amber-50 to-white text-slate-800 overflow-hidden">
      <BeerBackground />
      <div className="relative z-10 w-full max-w-6xl mx-auto p-4 sm:p-8">
        <div className="text-center">
          <motion.h1 initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="text-3xl sm:text-4xl font-extrabold tracking-tight text-amber-700">
            🍺 Индикатор риска
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="mt-3"
          >
            <a 
              href="https://github.com/vffuunnyy/kill-beer" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-amber-700 transition-colors duration-200 rounded-lg hover:bg-amber-50"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
          </motion.div>
        </div>

        <Card className="mt-6 bg-white border border-slate-200 shadow-xl rounded-[calc(1rem+10px)]">
          <CardContent className="p-6 space-y-6">
            {/* Ввод параметров */}
            <section className="rounded-2xl border border-amber-100 bg-gradient-to-b from-white to-amber-50/40 p-4 shadow-sm">
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] items-start">
                <NumField label="Масса" unit="кг" value={weightKg} min={1} step={1} onChange={setWeightKg} />
                <NumField label="Объём" unit="мл" value={volumeMl} min={0} step={50} onChange={setVolumeMl} />
                <NumField label="Крепость" unit="%" value={abv} min={0} step={0.5} onChange={setAbv} />
                <GenderField label="Пол" value={gender} onChange={setGender} />
              </div>
              <div className="mt-3 text-xs text-slate-500">
                Летальная оценка: ~{lethalTargetG.toFixed(0)} г этанола (5 ‰ BAC) • r = {rFactor}
              </div>
            </section>

            {/* Количество */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-slate-700">Количество (шт.)</Label>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold" style={{ color: barColor }}>{pctToLethal.toFixed(0)}%</span>
                  <span className="text-slate-600">риск смерти</span>
                  {pctToLethal >= 90 && <span className="text-xl">💀</span>}
                </div>
              </div>
              <div className="px-1">
                <Slider value={[count]} min={0} max={maxUnits} step={1} onValueChange={(v) => setCount(v[0])} />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                <span className="text-slate-600">В 1 ед.: {gramsPerUnit.toFixed(1)} г этанола</span>
                <span className="text-slate-600">Итого: {totalGrams.toFixed(1)} г • {promille.toFixed(2)} ‰</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Button variant="secondary" className="rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200" onClick={() => setCount(Math.max(0, count - 1))}>−1</Button>
                <div className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 shadow-inner">
                  {count}
                </div>
                <Button variant="secondary" className="rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200" onClick={() => setCount(Math.min(maxUnits, count + 1))}>+1</Button>
                <div className="ml-auto flex items-center gap-2">
                  <Button className="rounded-full bg-white text-slate-800 border border-slate-200 hover:bg-slate-50" variant="secondary" onClick={setMax} aria-label="Max">
                    <img src={MaxIcon} alt="MAX" className="h-4 w-auto" />
                  </Button>
                  <Button className="rounded-full" variant="destructive" onClick={resetAll}>Сброс</Button>
                </div>
              </div>
            </section>

            <section>
              <Label className="text-slate-700">Визуализатор</Label>
              <div className="mt-2 grid grid-cols-6 sm:grid-cols-10 gap-2">
                <AnimatePresence initial={false}>
                  {Array.from({ length: count }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.6, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="aspect-square flex items-center justify-center text-3xl sm:text-4xl rounded-xl bg-amber-100 border border-amber-200"
                      aria-label="единица напитка"
                    >
                      🍺
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>

          </CardContent>
        </Card>
      </div>

      <AnimatePresence>
        {showOverlay && (
          <motion.div
            key="overlay"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.6, rotate: -2 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 160, damping: 14 }}
              className="text-center"
            >
              <div className="text-7xl sm:text-8xl">💀</div>
              <div className="mt-2 text-4xl sm:text-6xl font-extrabold tracking-tight text-red-500">СТОП</div>
              <div className="mt-2 text-sm sm:text-base text-slate-200">А вот и ваша смертельная доза</div>
              <Button className="mt-6" onClick={() => setShowOverlay(false)}>Закрыть</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-slate-700">{label}</Label>
      {children}
    </div>
  );
}

function NumField({
  label,
  unit,
  value,
  min = 0,
  step = 1,
  onChange,
}: {
  label: string;
  unit: string;
  value: number;
  min?: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-slate-700">{label} <span className="text-slate-400">({unit})</span></Label>
      <div className="relative">
        <Input
          type="number"
          value={Number.isFinite(value) ? value : 0}
          step={step}
          onChange={(e) => {
            const n = +e.target.value;
            if (Number.isFinite(n)) onChange(Math.max(min, n));
          }}
          className="pr-16 bg-white border-slate-200 text-slate-800 focus-visible:ring-amber-300"
        />
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium px-2 py-1 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
          {unit}
        </span>
      </div>
    </div>
  );
}

function GenderField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: 'male' | 'female';
  onChange: (v: 'male' | 'female') => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-slate-700">{label}</Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Button
          variant={value === 'male' ? 'default' : 'outline'}
          size="default"
          onClick={() => onChange('male')}
          className="w-full rounded-lg"
        >
          👨 Мужчина
        </Button>
        <Button
          variant={value === 'female' ? 'default' : 'outline'}
          size="default"
          onClick={() => onChange('female')}
          className="w-full rounded-lg"
        >
          👩 Женщина
        </Button>
      </div>
    </div>
  );
}

function BeerBackground() {
  const [beers, setBeers] = useState([]);

  useEffect(() => {
    const qty = 50;
    setBeers(Array.from({ length: qty }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // % от ширины
      size: 28 + Math.random() * 26, // px
      duration: 14 + Math.random() * 12, // быстрее старт и цикл
      delay: Math.random() * 10, // минимальная задержка появления
      yStartVh: 100 + Math.random() * 5, // старт ближе к нижнему краю, а не "издалека"
      xDrift: (Math.random() - 0.5) * 40, // px влево/вправо
      rotate: (Math.random() - 0.5) * 20,
      opacity: 0.18 + Math.random() * 0.22,
    })));
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {beers.map((b) => (
        <motion.div
          key={b.id}
          initial={{ y: `${b.yStartVh ?? 102}vh`, x: 0, rotate: -b.rotate, opacity: b.opacity }}
          animate={{ y: "-1vh", x: [0, b.xDrift, -b.xDrift, 0], rotate: b.rotate, opacity: b.opacity }}
          transition={{ duration: b.duration, delay: b.delay, repeat: Infinity as any, ease: "linear" }}
          style={{ position: "absolute", left: `${b.left}%`, fontSize: `${b.size}px`, filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.08))" }}
        >
          🍺
        </motion.div>
      ))}
    </div>
  );
}
