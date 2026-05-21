import { Droplets, Dumbbell, UtensilsCrossed, Info } from "lucide-react";

interface Meal {
  time: string;
  name: string;
  kcal: number;
  items: string[];
  isTraining?: boolean;
}

const MEALS: Meal[] = [
  {
    time: "06:15",
    name: "Pré-treino",
    kcal: 200,
    items: ["Banana", "Whey protein ou", "Torrada + mel + café"],
  },
  {
    time: "07:00",
    name: "Treino CrossFit",
    kcal: 0,
    items: [],
    isTraining: true,
  },
  {
    time: "08:00–08:30",
    name: "Pós-treino + Pequeno-almoço",
    kcal: 750,
    items: [
      "Opção A: Whey + aveia + banana + mel",
      "Opção B: 4 ovos + 2 torradas + sumo de laranja",
    ],
  },
  {
    time: "10:30",
    name: "Snack",
    kcal: 300,
    items: ["Iogurte grego", "Granola", "Fruta"],
  },
  {
    time: "13:00",
    name: "Almoço",
    kcal: 720,
    items: [
      "180g de fonte proteica",
      "150g arroz / massa / batata doce",
      "Legumes variados",
      "Azeite",
    ],
  },
  {
    time: "19:30",
    name: "Jantar",
    kcal: 580,
    items: [
      "150g salmão / atum / carne magra",
      "Legumes salteados",
      "80g leguminosas",
      "Azeite",
    ],
  },
  {
    time: "21:30",
    name: "Ceia (opcional)",
    kcal: 100,
    items: ["Iogurte grego", "Frutos secos"],
  },
];

interface Tip {
  icon: React.ReactNode;
  title: string;
  text: string;
}

const TIPS: Tip[] = [
  {
    icon: <Droplets size={16} className="text-blue-500" />,
    title: "Hidratação",
    text: "3–3.5L de água/dia. Nos dias de treino intenso, adiciona eletrólitos.",
  },
  {
    icon: <Info size={16} className="text-gray-400" />,
    title: "Dias sem treino",
    text: "Reduz 50–70g de hidratos. Mantém proteína e gordura iguais.",
  },
  {
    icon: <Dumbbell size={16} className="text-green-500" />,
    title: "Whey",
    text: "Toma após o treino. Podes substituir por 180g frango ou 4 ovos.",
  },
  {
    icon: <UtensilsCrossed size={16} className="text-amber-500" />,
    title: "Ajuste",
    text: "Se não ganhar peso em 2–3 semanas, adiciona 150–200 kcal em hidratos.",
  },
];

const TOTAL_KCAL = 2900;
const PROTEIN_G = 175;
const CARBS_G = 345;
const FAT_G = 80;

// Macro caloric contribution
const proteinKcal = PROTEIN_G * 4;
const carbsKcal = CARBS_G * 4;
const fatKcal = FAT_G * 9;
const totalMacroKcal = proteinKcal + carbsKcal + fatKcal;

export function NutricaoTab() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
          Plano Nutricional
        </div>
        <div className="font-bold text-gray-900 text-base">
          CrossFit · Ganho muscular + performance
        </div>
        <div className="text-xs text-gray-400 mt-0.5">
          ♂ 1.68m · 69kg · Treino às 07:00
        </div>
      </div>

      {/* Daily targets */}
      <div className="grid grid-cols-2 gap-3">
        <MacroCard
          label="Calorias"
          value={`${TOTAL_KCAL}`}
          color="bg-orange-50 text-orange-600"
        />
        <MacroCard
          label="Proteína"
          value={`${PROTEIN_G}g`}
          color="bg-blue-50 text-blue-600"
        />
        <MacroCard
          label="Hidratos"
          value={`${CARBS_G}g`}
          color="bg-green-50 text-green-600"
        />
        <MacroCard
          label="Gordura"
          value={`${FAT_G}g`}
          color="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Macro distribution bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4 space-y-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
          Distribuição de macros
        </div>
        <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
          <div
            className="bg-blue-500 rounded-l-full"
            style={{ width: `${(proteinKcal / totalMacroKcal) * 100}%` }}
            title="Proteína"
          />
          <div
            className="bg-green-500"
            style={{ width: `${(carbsKcal / totalMacroKcal) * 100}%` }}
            title="Hidratos"
          />
          <div
            className="bg-amber-400 rounded-r-full"
            style={{ width: `${(fatKcal / totalMacroKcal) * 100}%` }}
            title="Gordura"
          />
        </div>
        <div className="flex gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
            Prot. {Math.round((proteinKcal / totalMacroKcal) * 100)}%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            Hidr. {Math.round((carbsKcal / totalMacroKcal) * 100)}%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            Gord. {Math.round((fatKcal / totalMacroKcal) * 100)}%
          </span>
        </div>
      </div>

      {/* Meal timeline */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Horário de refeições
          </div>
        </div>
        <div className="px-4 py-2">
          {MEALS.map((meal, i) => (
            <div key={i} className="flex gap-3 py-3 relative">
              {/* Timeline line */}
              {i < MEALS.length - 1 && (
                <div className="absolute left-[19px] top-10 bottom-0 w-px bg-gray-100" />
              )}
              {/* Time dot */}
              <div className="shrink-0 flex flex-col items-center gap-1">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold
                  ${meal.isTraining ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"}`}
                >
                  {meal.isTraining ? (
                    <Dumbbell size={16} />
                  ) : (
                    meal.time.slice(0, 2)
                  )}
                </div>
              </div>
              {/* Content */}
              <div className="flex-1 pb-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-xs text-gray-400 font-medium">
                    {meal.time}
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    {meal.name}
                  </span>
                  {meal.kcal > 0 && (
                    <span className="text-xs text-orange-500 font-semibold ml-auto">
                      ~{meal.kcal} kcal
                    </span>
                  )}
                </div>
                {meal.items.length > 0 && (
                  <ul className="mt-1 space-y-0.5">
                    {meal.items.map((item, j) => (
                      <li
                        key={j}
                        className="text-xs text-gray-500 flex items-start gap-1.5"
                      >
                        <span className="text-gray-300 mt-0.5">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips grid */}
      <div className="grid grid-cols-2 gap-3">
        {TIPS.map((tip, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm px-3 py-3 space-y-1"
          >
            <div className="flex items-center gap-1.5">
              {tip.icon}
              <span className="text-xs font-bold text-gray-700">
                {tip.title}
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{tip.text}</p>
          </div>
        ))}
      </div>

      {/* Bottom padding */}
      <div className="h-2" />
    </div>
  );
}

function MacroCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-gray-100 shadow-sm px-4 py-3 ${color.split(" ")[0]}`}
    >
      <div className={`text-2xl font-bold ${color.split(" ")[1]}`}>{value}</div>
      <div className="text-xs text-gray-500 font-medium mt-0.5">{label}</div>
    </div>
  );
}
