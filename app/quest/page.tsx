"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { ChangeEvent, KeyboardEvent, PointerEvent } from "react";
import { useRouter } from "next/navigation";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/*  id | Thai name | English name | lat | lon | question                */
/*  Coordinates are approximate reference points of each main city,    */
/*  not geometric centroids of the province boundaries.                */
/* ------------------------------------------------------------------ */
const DATA = `
10|กรุงเทพมหานคร|Bangkok|13.7563|100.5018|ตลาดนัดจตุจักรอยู่ในพื้นที่ใด?
11|สมุทรปราการ|Samut Prakan|13.5991|100.5998|สถานตากอากาศบางปูอยู่ในจังหวัดใด?
12|นนทบุรี|Nonthaburi|13.8621|100.5144|เกาะเกร็ดอยู่ในจังหวัดใด?
13|ปทุมธานี|Pathum Thani|14.0208|100.5250|สวนสนุกดรีมเวิลด์อยู่ในจังหวัดใด?
14|พระนครศรีอยุธยา|Phra Nakhon Si Ayutthaya|14.3532|100.5689|อำเภอผักไห่อยู่ในจังหวัดใด?
15|อ่างทอง|Ang Thong|14.5896|100.4551|อำเภอป่าโมกอยู่ในจังหวัดใด?
16|ลพบุรี|Lop Buri|14.7995|100.6534|ทุ่งทานตะวันบริเวณเขาจีนแลอยู่ในจังหวัดใด?
17|สิงห์บุรี|Sing Buri|14.8936|100.3967|อำเภออินทร์บุรีอยู่ในจังหวัดใด?
18|ชัยนาท|Chai Nat|15.1852|100.1251|อำเภอสรรคบุรีอยู่ในจังหวัดใด?
19|สระบุรี|Saraburi|14.5289|100.9101|อำเภอมวกเหล็กอยู่ในจังหวัดใด?
20|ชลบุรี|Chon Buri|13.3611|100.9847|ชายหาดบางแสนอยู่ในจังหวัดใด?
21|ระยอง|Rayong|12.6814|101.2816|เกาะเสม็ดอยู่ในจังหวัดใด?
22|จันทบุรี|Chanthaburi|12.6113|102.1038|หาดเจ้าหลาวอยู่ในจังหวัดใด?
23|ตราด|Trat|12.2428|102.5175|เกาะกูดอยู่ในจังหวัดใด?
24|ฉะเชิงเทรา|Chachoengsao|13.6904|101.0779|ตลาดบ้านใหม่ริมแม่น้ำบางปะกงอยู่ในจังหวัดใด?
25|ปราจีนบุรี|Prachin Buri|14.0509|101.3727|อำเภอกบินทร์บุรีอยู่ในจังหวัดใด?
26|นครนายก|Nakhon Nayok|14.2069|101.2131|น้ำตกสาริกาอยู่ในจังหวัดใด?
27|สระแก้ว|Sa Kaeo|13.8240|102.0646|ตลาดโรงเกลือ อำเภออรัญประเทศ อยู่ในจังหวัดใด?
30|นครราชสีมา|Nakhon Ratchasima|14.9799|102.0978|อำเภอปากช่องอยู่ในจังหวัดใด?
31|บุรีรัมย์|Buri Ram|14.9930|103.1029|อำเภอนางรองอยู่ในจังหวัดใด?
32|สุรินทร์|Surin|14.8829|103.4937|หมู่บ้านช้างบ้านตากลางอยู่ในจังหวัดใด?
33|ศรีสะเกษ|Si Sa Ket|15.1186|104.3220|อำเภอขุนหาญอยู่ในจังหวัดใด?
34|อุบลราชธานี|Ubon Ratchathani|15.2448|104.8473|สามพันโบกอยู่ในจังหวัดใด?
35|ยโสธร|Yasothon|15.7926|104.1453|พิพิธภัณฑ์พญาคันคากอยู่ในจังหวัดใด?
36|ชัยภูมิ|Chaiyaphum|15.8068|102.0315|ทุ่งดอกกระเจียวในอุทยานแห่งชาติป่าหินงามอยู่ในจังหวัดใด?
37|อำนาจเจริญ|Amnat Charoen|15.8657|104.6258|อำเภอชานุมานอยู่ในจังหวัดใด?
38|บึงกาฬ|Bueng Kan|18.3609|103.6464|หินสามวาฬอยู่ในจังหวัดใด?
39|หนองบัวลำภู|Nong Bua Lam Phu|17.2218|102.4260|อำเภอสุวรรณคูหาอยู่ในจังหวัดใด?
40|ขอนแก่น|Khon Kaen|16.4322|102.8236|อุทยานแห่งชาติภูเวียงอยู่ในจังหวัดใด?
41|อุดรธานี|Udon Thani|17.4138|102.7870|แหล่งโบราณคดีบ้านเชียงอยู่ในจังหวัดใด?
42|เลย|Loei|17.4860|101.7223|อุทยานแห่งชาติภูกระดึงอยู่ในจังหวัดใด?
43|หนองคาย|Nong Khai|17.8783|102.7413|ตลาดท่าเสด็จอยู่ในจังหวัดใด?
44|มหาสารคาม|Maha Sarakham|16.1851|103.3006|อำเภอกันทรวิชัยอยู่ในจังหวัดใด?
45|ร้อยเอ็ด|Roi Et|16.0538|103.6520|บึงพลาญชัยอยู่ในจังหวัดใด?
46|กาฬสินธุ์|Kalasin|16.4314|103.5059|อำเภอสหัสขันธ์อยู่ในจังหวัดใด?
47|สกลนคร|Sakon Nakhon|17.1546|104.1348|ทะเลสาบหนองหารใกล้ตัวเมืองอยู่ในจังหวัดใด?
48|นครพนม|Nakhon Phanom|17.3920|104.7695|อำเภอท่าอุเทนอยู่ในจังหวัดใด?
49|มุกดาหาร|Mukdahan|16.5424|104.7235|อุทยานแห่งชาติภูผาเทิบอยู่ในจังหวัดใด?
50|เชียงใหม่|Chiang Mai|18.7883|98.9853|ดอยอินทนนท์อยู่ในจังหวัดใด?
51|ลำพูน|Lamphun|18.5745|99.0087|อำเภอลี้อยู่ในจังหวัดใด?
52|ลำปาง|Lampang|18.2888|99.4909|ศูนย์อนุรักษ์ช้างไทย อำเภอห้างฉัตร อยู่ในจังหวัดใด?
53|อุตรดิตถ์|Uttaradit|17.6201|100.0993|อำเภอลับแลอยู่ในจังหวัดใด?
54|แพร่|Phrae|18.1446|100.1403|วนอุทยานแพะเมืองผีอยู่ในจังหวัดใด?
55|น่าน|Nan|18.7756|100.7730|อำเภอบ่อเกลือที่มีการทำเกลือภูเขาอยู่ในจังหวัดใด?
56|พะเยา|Phayao|19.1665|99.9019|กว๊านพะเยาอยู่ในจังหวัดใด?
57|เชียงราย|Chiang Rai|19.9105|99.8406|ดอยตุงอยู่ในจังหวัดใด?
58|แม่ฮ่องสอน|Mae Hong Son|19.3020|97.9654|อำเภอปายอยู่ในจังหวัดใด?
60|นครสวรรค์|Nakhon Sawan|15.7030|100.1372|บึงบอระเพ็ดอยู่ในจังหวัดใด?
61|อุทัยธานี|Uthai Thani|15.3835|100.0246|หุบป่าตาดอยู่ในจังหวัดใด?
62|กำแพงเพชร|Kamphaeng Phet|16.4828|99.5227|อุทยานแห่งชาติคลองลานอยู่ในจังหวัดใด?
63|ตาก|Tak|16.8839|99.1258|น้ำตกทีลอซูอยู่ในจังหวัดใด?
64|สุโขทัย|Sukhothai|17.0070|99.8230|อำเภอศรีสัชนาลัยอยู่ในจังหวัดใด?
65|พิษณุโลก|Phitsanulok|16.8211|100.2659|อำเภอเนินมะปรางอยู่ในจังหวัดใด?
66|พิจิตร|Phichit|16.4429|100.3488|บึงสีไฟอยู่ในจังหวัดใด?
67|เพชรบูรณ์|Phetchabun|16.4190|101.1606|ภูทับเบิกอยู่ในจังหวัดใด?
70|ราชบุรี|Ratchaburi|13.5283|99.8134|ตลาดน้ำดำเนินสะดวกอยู่ในจังหวัดใด?
71|กาญจนบุรี|Kanchanaburi|14.0228|99.5328|น้ำตกเอราวัณอยู่ในจังหวัดใด?
72|สุพรรณบุรี|Suphan Buri|14.4745|100.1177|บึงฉวากในอำเภอเดิมบางนางบวชอยู่ในจังหวัดใด?
73|นครปฐม|Nakhon Pathom|13.8199|100.0622|อำเภอสามพรานอยู่ในจังหวัดใด?
74|สมุทรสาคร|Samut Sakhon|13.5475|100.2744|ชุมชนมหาชัยอยู่ในจังหวัดใด?
75|สมุทรสงคราม|Samut Songkhram|13.4098|100.0023|ตลาดน้ำอัมพวาอยู่ในจังหวัดใด?
76|เพชรบุรี|Phetchaburi|13.1119|99.9447|หาดชะอำอยู่ในจังหวัดใด?
77|ประจวบคีรีขันธ์|Prachuap Khiri Khan|11.8126|99.7973|อำเภอหัวหินอยู่ในจังหวัดใด?
80|นครศรีธรรมราช|Nakhon Si Thammarat|8.4304|99.9631|หมู่บ้านคีรีวงอยู่ในจังหวัดใด?
81|กระบี่|Krabi|8.0863|98.9063|หาดไร่เลย์อยู่ในจังหวัดใด?
82|พังงา|Phang Nga|8.4501|98.5255|หมู่เกาะสิมิลันอยู่ในจังหวัดใด?
83|ภูเก็ต|Phuket|7.8804|98.3923|หาดป่าตองอยู่ในจังหวัดใด?
84|สุราษฎร์ธานี|Surat Thani|9.1382|99.3217|เกาะสมุยอยู่ในจังหวัดใด?
85|ระนอง|Ranong|9.9658|98.6348|บ่อน้ำร้อนรักษะวารินอยู่ในจังหวัดใด?
86|ชุมพร|Chumphon|10.4930|99.1800|หาดทุ่งวัวแล่นอยู่ในจังหวัดใด?
90|สงขลา|Songkhla|7.1756|100.6143|อำเภอหาดใหญ่อยู่ในจังหวัดใด?
91|สตูล|Satun|6.6238|100.0674|เกาะหลีเป๊ะอยู่ในจังหวัดใด?
92|ตรัง|Trang|7.5594|99.6114|ถ้ำมรกตบนเกาะมุกอยู่ในจังหวัดใด?
93|พัทลุง|Phatthalung|7.6167|100.0740|ทะเลน้อยในอำเภอควนขนุนอยู่ในจังหวัดใด?
94|ปัตตานี|Pattani|6.8695|101.2501|อำเภอสายบุรีอยู่ในจังหวัดใด?
95|ยะลา|Yala|6.5411|101.2804|อำเภอเบตงอยู่ในจังหวัดใด?
96|นราธิวาส|Narathiwat|6.4255|101.8253|อำเภอสุไหงโก-ลกอยู่ในจังหวัดใด?
`.trim();

const EXTRA = [
  ["10", "สวนลุมพินีอยู่ในพื้นที่ใด?"],
  ["11", "อำเภอบางพลีอยู่ในจังหวัดใด?"],
  ["12", "อำเภอบางบัวทองอยู่ในจังหวัดใด?"],
  ["13", "อำเภอคลองหลวงอยู่ในจังหวัดใด?"],
  ["14", "อำเภอเสนาอยู่ในจังหวัดใด?"],
  ["20", "เกาะล้านอยู่ในจังหวัดใด?"],
  ["21", "ทุ่งโปรงทองที่ปากน้ำประแสอยู่ในจังหวัดใด?"],
  ["22", "ชุมชนริมน้ำจันทบูรอยู่ในจังหวัดใด?"],
  ["23", "เกาะช้างฝั่งอ่าวไทยตะวันออกอยู่ในจังหวัดใด?"],
  ["30", "อำเภอวังน้ำเขียวอยู่ในจังหวัดใด?"],
  ["34", "อุทยานแห่งชาติผาแต้มอยู่ในจังหวัดใด?"],
  ["38", "น้ำตกถ้ำพระ อำเภอเซกา อยู่ในจังหวัดใด?"],
  ["41", "ทะเลบัวแดงที่หนองหานกุมภวาปีอยู่ในจังหวัดใด?"],
  ["42", "อำเภอเชียงคานอยู่ในจังหวัดใด?"],
  ["50", "อำเภอแม่ริมอยู่ในจังหวัดใด?"],
  ["55", "ดอยเสมอดาวในอุทยานแห่งชาติศรีน่านอยู่ในจังหวัดใด?"],
  ["57", "อำเภอแม่สายอยู่ในจังหวัดใด?"],
  ["58", "ทุ่งดอกบัวตองดอยแม่อูคออยู่ในจังหวัดใด?"],
  ["67", "อำเภอเขาค้ออยู่ในจังหวัดใด?"],
  ["71", "อำเภอสังขละบุรีอยู่ในจังหวัดใด?"],
  ["81", "หมู่เกาะพีพีอยู่ในจังหวัดใด?"],
  ["82", "เขาหลักอยู่ในจังหวัดใด?"],
  ["84", "เขื่อนรัชชประภาหรือเขื่อนเชี่ยวหลานอยู่ในจังหวัดใด?"],
];

/* ---------- types ---------- */
interface Province {
  id: string;
  th: string;
  en: string;
  lat: number;
  lon: number;
  q: string;
}
interface Question {
  answer: string;
  text: string;
}
interface Answer {
  question: Question;
  chosen: string;
  correct: boolean;
  distance: number;
  score: number;
}
interface View {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface Drag {
  pointerId: number;
  startView: View;
  clientX: number;
  clientY: number;
  target: string | null;
  moved: boolean;
}
interface LoginData {
  username?: string;
  session?: string;
  loginDate?: string;
}
type Ring = number[][];
type Polygon = Ring[];
type Grouped = Map<string, Polygon[]>;
interface GeoFeature {
  properties?: Record<string, unknown> | null;
  geometry?: { type: string; coordinates: unknown } | null;
}
interface GeoCollection {
  type?: string;
  features?: GeoFeature[];
}

const PROVINCES: Province[] = DATA.split("\n").map((row): Province => {
  const [id, th, en, lat, lon, q] = row.split("|");
  return { id, th, en, lat: Number(lat), lon: Number(lon), q };
});
const BY_ID = new Map<string, Province>(
  PROVINCES.map((p) => [p.id, p] as [string, Province])
);
const getProvince = (id: string): Province => {
  const p = BY_ID.get(id);
  if (!p) throw new Error("Unknown province id: " + id);
  return p;
};
const nameOf = (id: string): string => BY_ID.get(id)?.th ?? id;
const QUESTIONS: Question[] = [
  ...PROVINCES.map((p) => ({ answer: p.id, text: p.q })),
  ...EXTRA.map(([answer, text]) => ({ answer, text })),
];

if (
  PROVINCES.length !== 77 ||
  BY_ID.size !== 77 ||
  QUESTIONS.length !== 100 ||
  QUESTIONS.some((q) => !BY_ID.has(q.answer))
) {
  throw new Error("ข้อมูลจังหวัดหรือคำถามไม่ครบ");
}

const CACHE_KEY = "thai-map-quest-geo-v3";
const MAP_URL =
  "https://gist.githubusercontent.com/jeepkd/" +
  "4e31e6a10f8297b9de50c62856927ecf/raw/thailand.json";
const FULL_VIEW: View = { x: 0, y: 0, w: 760, h: 1150 };

/* ------------------------------------------------------------------ */
/*  Login storage (external store for useSyncExternalStore)            */
/* ------------------------------------------------------------------ */
const LOGIN_KEY = "login";
const LOGIN_EVENT = "login-change";

function subscribeLogin(callback: () => void) {
  window.addEventListener("storage", callback); // changes from other tabs
  window.addEventListener(LOGIN_EVENT, callback); // changes from this tab
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(LOGIN_EVENT, callback);
  };
}

// Return the raw string (a primitive) so the snapshot is stable between renders
function getLoginSnapshot(): string | null {
  try {
    return localStorage.getItem(LOGIN_KEY);
  } catch {
    return null;
  }
}

// Used on the server and during hydration, so there is no mismatch
function getLoginServerSnapshot(): string | null {
  return null;
}

/* ------------------------------------------------------------------ */
/*  Geo helpers                                                        */
/* ------------------------------------------------------------------ */
// Equirectangular projection tuned for Thailand's latitude
function project(lon: number, lat: number) {
  return [30 + (lon - 96.5) * 72, 25 + (21 - lat) * 70];
}

function normalizeName(value: string) {
  return String(value)
    .normalize("NFKC")
    .toLowerCase()
    .trim()
    .replace(/^จังหวัด\s*/, "")
    .replace(/^changwat\s*/, "")
    .replace(/\s+province$/, "")
    .replace(/[\s._\-’'()]/g, "");
}

const NAME_TO_ID = new Map();
for (const p of PROVINCES) {
  NAME_TO_ID.set(normalizeName(p.th), p.id);
  NAME_TO_ID.set(normalizeName(p.en), p.id);
}
const ALIASES: Record<string, string[]> = {
  10: ["Krung Thep Maha Nakhon", "Bangkok Metropolis", "กรุงเทพฯ"],
  14: ["Ayutthaya"],
  19: ["Sara Buri"],
  30: ["Khorat", "Korat", "Nakorn Ratchasima"],
  33: ["Sisaket", "Si Saket", "Sri Sa Ket"],
  38: ["Bung Kan", "Bungkan"],
  39: ["Nong Bua Lamphu"],
  54: ["Phare"],
  65: ["Pitsanulok"],
  80: ["Nakhon Sri Thammarat", "Nakorn Si Thammarat"],
  93: ["Phattalung"],
};
for (const [id, names] of Object.entries(ALIASES)) {
  names.forEach((name) => NAME_TO_ID.set(normalizeName(name), id));
}

function identifyProvince(properties: Record<string, unknown> = {}): string | null {
  for (const value of Object.values(properties)) {
    if (typeof value !== "string") continue;
    const id = NAME_TO_ID.get(normalizeName(value));
    if (id) return id;
  }
  const allowedCodes = new Set([
    "provcode", "provincecode", "changwatcode",
    "adm1pcode", "admpcode", "pcode", "chaicod",
  ]);
  for (const [key, value] of Object.entries(properties)) {
    const cleanedKey = key.toLowerCase().replace(/[_\s-]/g, "");
    if (!allowedCodes.has(cleanedKey)) continue;
    const code = String(value).trim().toUpperCase().replace(/^TH[-_]?/, "");
    if (BY_ID.has(code)) return code;
  }
  return null;
}

function validateGeoJSON(data: GeoCollection | null | undefined): Grouped {
  const features = data?.features;
  if (data?.type !== "FeatureCollection" || !Array.isArray(features)) {
    throw new Error("ต้องเป็น GeoJSON แบบ FeatureCollection");
  }
  const grouped: Grouped = new Map();

  for (const feature of features) {
    const id = identifyProvince(feature.properties || {});
    if (!id) {
      throw new Error(
        "จับคู่ชื่อจังหวัดไม่ได้: " +
          JSON.stringify(feature.properties || {}).slice(0, 160)
      );
    }
    const g = feature.geometry;
    if (!g || !["Polygon", "MultiPolygon"].includes(g.type)) {
      throw new Error("รูปทรงจังหวัดต้องเป็น Polygon หรือ MultiPolygon");
    }
    const polygons = (g.type === "Polygon" ? [g.coordinates] : g.coordinates) as Polygon[];
    if (!Array.isArray(polygons) || !polygons.length) {
      throw new Error("ไม่มีพิกัดขอบเขต");
    }
    for (const polygon of polygons) {
      if (!Array.isArray(polygon) || !polygon.length) {
        throw new Error("ข้อมูล polygon ไม่สมบูรณ์");
      }
      for (const ring of polygon) {
        if (!Array.isArray(ring) || ring.length < 4) {
          throw new Error("ข้อมูลเส้นขอบไม่สมบูรณ์");
        }
        for (const point of ring) {
          if (
            !Array.isArray(point) ||
            !Number.isFinite(point[0]) ||
            !Number.isFinite(point[1]) ||
            point[0] < 95 || point[0] > 107 ||
            point[1] < 5 || point[1] > 22
          ) {
            throw new Error("พิกัดต้องเป็นลองจิจูด/ละติจูดของประเทศไทย");
          }
        }
      }
    }
    if (!grouped.has(id)) grouped.set(id, []);
    grouped.get(id)?.push(...polygons);
  }

  const missing = PROVINCES.filter((p) => !grouped.has(p.id));
  if (missing.length || grouped.size !== 77) {
    throw new Error(
      "ข้อมูลไม่ครบ 77 พื้นที่ ขาด: " + missing.map((p) => p.th).join(", ")
    );
  }
  return grouped;
}

function polygonPath(polygons: Polygon[]): string {
  return polygons
    .map((polygon) =>
      polygon
        .map(
          (ring) =>
            ring
              .map((point, index) => {
                const [x, y] = project(point[0], point[1]);
                return (index === 0 ? "M" : "L") + x.toFixed(2) + "," + y.toFixed(2);
              })
              .join(" ") + " Z"
        )
        .join(" ")
    )
    .join(" ");
}

/* ------------------------------------------------------------------ */
/*  Game helpers                                                       */
/* ------------------------------------------------------------------ */
function shuffle<T>(input: T[]): T[] {
  const array = [...input];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function createRound(): Question[] {
  const used = new Set<string>();
  const chosen: Question[] = [];
  for (const question of shuffle(QUESTIONS)) {
    if (used.has(question.answer)) continue;
    used.add(question.answer);
    chosen.push(question);
    if (chosen.length === 5) break;
  }
  return chosen;
}

// Haversine great-circle distance
function distanceKm(idA: string, idB: string): number {
  const a = getProvince(idA);
  const b = getProvince(idB);
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(Math.min(1, h)), Math.sqrt(Math.max(0, 1 - h)));
}

function calculateScore(correct: boolean, distance: number): number {
  if (correct) return 20;
  return Math.max(0, Math.min(19, Math.round(20 * Math.exp(-distance / 250))));
}

function rank(score: number): string {
  if (score === 100) return "สุดยอดนักสำรวจไทย";
  if (score >= 80) return "เซียนแผนที่";
  if (score >= 60) return "นักเดินทางตัวจริง";
  if (score >= 40) return "นักสำรวจดาวรุ่ง";
  return "เริ่มต้นการผจญภัย";
}

const sumScore = (answers: Answer[]): number => answers.reduce((s, a) => s + a.score, 0);

/* ------------------------------------------------------------------ */
/*  Score card (canvas)                                                */
/* ------------------------------------------------------------------ */
function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
  color: string
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawCard(canvas: HTMLCanvasElement, answers: Answer[]) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const total = sumScore(answers);
  const exact = answers.filter((a) => a.correct).length;
  const font = "system-ui, sans-serif";

  const gradient = ctx.createLinearGradient(0, 0, 1200, 800);
  gradient.addColorStop(0, "#162b45");
  gradient.addColorStop(0.55, "#28204c");
  gradient.addColorStop(1, "#103d40");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 800);

  ctx.strokeStyle = "#ffffff09";
  ctx.lineWidth = 1;
  for (let x = 0; x < 1200; x += 60) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 800); ctx.stroke();
  }
  for (let y = 0; y < 800; y += 60) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1200, y); ctx.stroke();
  }

  ctx.fillStyle = "#8d7aff24";
  ctx.beginPath(); ctx.arc(1120, 80, 260, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#52e0bc13";
  ctx.beginPath(); ctx.arc(70, 750, 250, 0, Math.PI * 2); ctx.fill();

  ctx.textAlign = "center";
  ctx.fillStyle = "#63e4c5";
  ctx.font = `800 29px ${font}`;
  ctx.fillText("THAILAND MAP QUEST", 600, 86);

  ctx.fillStyle = "#d4def0";
  ctx.font = `500 27px ${font}`;
  ctx.fillText("77 พื้นที่ • 5 คำถาม • คุณรู้จักไทยแค่ไหน?", 600, 142);

  ctx.fillStyle = "#ffffff";
  ctx.font = `900 188px ${font}`;
  ctx.fillText(String(total), 600, 352);

  ctx.fillStyle = "#b5c3dc";
  ctx.font = `600 32px ${font}`;
  ctx.fillText("คะแนนจาก 100", 600, 410);

  roundedRect(ctx, 320, 446, 560, 66, 33, "#ffffff10");
  ctx.fillStyle = "#63e4c5";
  ctx.font = `800 33px ${font}`;
  ctx.fillText(rank(total), 600, 490);

  answers.forEach((answer, index) => {
    const x = 139 + index * 188;
    roundedRect(ctx, x, 549, 170, 107, 18, answer.correct ? "#174f45" : "#2d3654");
    ctx.fillStyle = "#bdcce1";
    ctx.font = `500 22px ${font}`;
    ctx.fillText(`ข้อ ${index + 1}`, x + 85, 586);
    ctx.fillStyle = answer.correct ? "#70ffd4" : "#ffffff";
    ctx.font = `800 34px ${font}`;
    ctx.fillText(`${answer.score}/20`, x + 85, 633);
  });

  ctx.fillStyle = "#d4def0";
  ctx.font = `500 26px ${font}`;
  ctx.fillText(`ตอบตรงจังหวัด ${exact}/5 ข้อ — มาลองทำคะแนนให้มากกว่านี้!`, 600, 721);

  ctx.fillStyle = "#a1b6cc";
  ctx.font = `400 20px ${font}`;
  ctx.fillText("เล่น • สำรวจ • เรียนรู้ประเทศไทย", 600, 766);

  canvas.setAttribute(
    "aria-label",
    `คะแนน ${total} จาก 100 ตอบตรงจังหวัด ${exact} จาก 5 ข้อ`
  );
}

/* ------------------------------------------------------------------ */
/*  Static grid lines for the map                                      */
/* ------------------------------------------------------------------ */
const GRID_LON: { lon: number; x: number }[] = [];
for (let lon = 97; lon <= 106; lon++) GRID_LON.push({ lon, x: project(lon, 20.8)[0] });
const GRID_LAT: { lat: number; y: number }[] = [];
for (let lat = 6; lat <= 20; lat += 2) GRID_LAT.push({ lat, y: project(97, lat)[1] });

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function ThailandMapQuest() {
  const router = useRouter();

  const [phase, setPhase] = useState("home"); // home | play | result
  const [round, setRound] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [reviewing, setReviewing] = useState<{ answer: Answer; index: number } | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  const [geo, setGeo] = useState<Grouped | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadStatus, setLoadStatus] = useState(
    "พร้อมเล่นด้วยตำแหน่งจังหวัดครบ 77 พื้นที่"
  );

  const [view, setView] = useState<View>(FULL_VIEW);
  const [shareStatus, setShareStatus] = useState("");
  const [shareText, setShareText] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const questionRef = useRef<HTMLHeadingElement>(null);
  const shareTextRef = useRef<HTMLTextAreaElement>(null);
  const reviewRef = useRef<HTMLElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const playingRef = useRef(false);
  const pendingGeoRef = useRef<Grouped | null>(null);
  const loadingRef = useRef(false);
  const geoReadyRef = useRef(false);

  const total = sumScore(answers);
  const exact = answers.filter((a) => a.correct).length;

  /* ---------- login (read from localStorage without setState in effect) ---------- */
  const rawLogin = useSyncExternalStore(
    subscribeLogin,
    getLoginSnapshot,
    getLoginServerSnapshot
  );

  const loginData = useMemo<LoginData>(() => {
    try {
      return rawLogin ? (JSON.parse(rawLogin) as LoginData) : {};
    } catch {
      return {};
    }
  }, [rawLogin]);

  // Route guard: redirect (no setState). Read storage directly because
  // rawLogin is null during the hydration render.
  useEffect(() => {
    if (!localStorage.getItem(LOGIN_KEY)) router.replace("/login");
  }, [router]);

  /* ---------- geo loading ---------- */
  const installGeo = useCallback((grouped: Grouped) => {
    setGeo(grouped);
    geoReadyRef.current = true;
  }, []);

  const applyPendingGeo = useCallback(() => {
    if (!pendingGeoRef.current) return;
    installGeo(pendingGeoRef.current);
    pendingGeoRef.current = null;
  }, [installGeo]);

  const acceptGeo = useCallback(
    (grouped: Grouped) => {
      // Don't swap the map style in the middle of a round
      if (playingRef.current) {
        pendingGeoRef.current = grouped;
        setLoadStatus("โหลดขอบเขตครบแล้ว จะนำมาใช้เมื่อจบรอบปัจจุบัน");
      } else {
        installGeo(grouped);
        setLoadStatus("พร้อมเล่น: ขอบเขตครบ 77 พื้นที่");
      }
    },
    [installGeo]
  );

  const loadOnlineMap = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setLoadStatus("เล่นได้ทันทีด้วยจุดจังหวัด — กำลังโหลดขอบเขตเพิ่มเติม…");

    try {
      let cached = null;
      try { cached = localStorage.getItem(CACHE_KEY); } catch { /* ignore */ }

      if (cached) {
        try {
          acceptGeo(validateGeoJSON(JSON.parse(cached)));
          return;
        } catch {
          try { localStorage.removeItem(CACHE_KEY); } catch { /* ignore */ }
        }
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      try {
        const response = await fetch(MAP_URL, { signal: controller.signal });
        if (!response.ok) throw new Error("HTTP " + response.status);
        const data = await response.json();
        acceptGeo(validateGeoJSON(data));
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch { /* quota */ }
      } finally {
        clearTimeout(timeout);
      }
    } catch (error) {
      const err = error as Error;
      const reason = err.name === "AbortError" ? "หมดเวลารอเครือข่าย" : err.message;
      setLoadStatus(
        (geoReadyRef.current
          ? "ใช้ขอบเขตที่โหลดไว้แล้วต่อได้"
          : "พร้อมเล่นด้วยจุดจังหวัดครบ 77 พื้นที่") +
          "\nโหลดขอบเขตเพิ่มเติมไม่สำเร็จ: " + reason
      );
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [acceptGeo]);

  useEffect(() => {
    loadOnlineMap();
  }, [loadOnlineMap]);

  async function importGeoJSON(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = (await file.text()).replace(/^\uFEFF/, "").trim();
      if (text.startsWith("<")) {
        throw new Error("ไฟล์นี้เป็น HTML กรุณาใช้ไฟล์ JSON จากปุ่ม Raw");
      }
      const data = JSON.parse(text);
      acceptGeo(validateGeoJSON(data));
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
    } catch (error) {
      setLoadStatus("นำเข้าไม่สำเร็จ: " + (error as Error).message + "\nยังเล่นต่อด้วยแผนที่เดิมได้");
    }
  }

  /* ---------- map view ---------- */
  const resetView = () => setView(FULL_VIEW);

  function zoom(factor: number) {
    setView((v) => {
      const newW = Math.max(95, Math.min(760, v.w * factor));
      const ratio = newW / v.w;
      const newH = v.h * ratio;
      return { x: v.x + (v.w - newW) / 2, y: v.y + (v.h - newH) / 2, w: newW, h: newH };
    });
  }

  function mapPoint(clientX: number, clientY: number) {
    const svg = svgRef.current;
    if (!svg) return null;
    const matrix = svg.getScreenCTM();
    if (!matrix) return null;
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    return point.matrixTransform(matrix.inverse());
  }

  function onPointerDown(event: PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg || event.button !== 0 || dragRef.current) return;
    if (!mapPoint(event.clientX, event.clientY)) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startView: { ...view },
      clientX: event.clientX,
      clientY: event.clientY,
      target: (event.target as Element).closest("[data-id]")?.getAttribute("data-id") ?? null,
      moved: false,
    };
    svg.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<SVGSVGElement>) {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    const distance = Math.hypot(event.clientX - drag.clientX, event.clientY - drag.clientY);
    if (distance > 6) drag.moved = true;
    if (!drag.moved) return;

    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scale = Math.min(rect.width / drag.startView.w, rect.height / drag.startView.h);
    setView({
      ...drag.startView,
      x: drag.startView.x - (event.clientX - drag.clientX) / scale,
      y: drag.startView.y - (event.clientY - drag.clientY) / scale,
    });
  }

  function onPointerUp(event: PointerEvent<SVGSVGElement>) {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    dragRef.current = null;
    if (svgRef.current?.hasPointerCapture(event.pointerId)) {
      svgRef.current.releasePointerCapture(event.pointerId);
    }
    if (!drag.moved && drag.target) chooseProvince(drag.target);
  }

  function onMapKeyDown(event: KeyboardEvent<SVGSVGElement>) {
    const id = (event.target as Element).closest?.("[data-id]")?.getAttribute("data-id");
    if (id && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      chooseProvince(id);
    }
  }

  /* ---------- game flow ---------- */
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  function setPlayingBoth(value: boolean) {
    playingRef.current = value;
    setPlaying(value);
  }

  function startGame() {
    applyPendingGeo();
    setRound(createRound());
    setAnswers([]);
    setCurrent(0);
    setSelected(null);
    setReviewing(null);
    setReviewOpen(false);
    setShareStatus("");
    setShareText(null);
    setPlayingBoth(true);
    setView(FULL_VIEW);
    setPhase("play");
    scrollTop();
  }

  function chooseProvince(id: string) {
    if (!playingRef.current || !BY_ID.has(id)) return;
    setSelected(id);
  }

  function confirmAnswer() {
    if (!playing || !selected) return;
    const question = round[current];
    const correct = selected === question.answer;
    const distance = correct ? 0 : distanceKm(selected, question.answer);
    const score = calculateScore(correct, distance);
    const nextAnswers: Answer[] = [...answers, { question, chosen: selected, correct, distance, score }];

    setAnswers(nextAnswers);
    setSelected(null);
    setView(FULL_VIEW);

    if (current + 1 === 5) {
      setPlayingBoth(false);
      applyPendingGeo();
      setPhase("result");
      scrollTop();
    } else {
      setCurrent(current + 1);
    }
  }

  function showAnswerMap(answer: Answer, index: number) {
    setPlayingBoth(false);
    setReviewing({ answer, index });
    setSelected(null);
    setView(FULL_VIEW);
    setPhase("play");
    scrollTop();
  }

  function backToResult() {
    setReviewing(null);
    setPhase("result");
    scrollTop();
  }

  function toggleReview() {
    const open = !reviewOpen;
    setReviewOpen(open);
    if (open) setTimeout(() => reviewRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
  }

  // Focus the question heading when it changes
  useEffect(() => {
    if (phase === "play") questionRef.current?.focus({ preventScroll: true });
  }, [phase, current, reviewing]);

  // Draw the score card whenever the result screen is shown
  useEffect(() => {
    if (phase === "result" && canvasRef.current && answers.length === 5) {
      drawCard(canvasRef.current, answers);
    }
  }, [phase, answers]);

  /* ---------- share / save ---------- */
  function getShareText() {
    const lines = [
      `ฉันได้ ${total}/100 คะแนน ใน Thailand Map Quest!`,
      `ตอบตรงจังหวัด ${exact}/5 ข้อ — ${rank(total)}`,
      "คุณรู้จักประเทศไทยดีแค่ไหน? มาลองกัน!",
    ];
    if (
      ["https:", "http:"].includes(location.protocol) &&
      !["localhost", "127.0.0.1", "[::1]"].includes(location.hostname)
    ) {
      const url = new URL(location.href);
      url.search = "";
      url.hash = "";
      lines.push(url.href);
    }
    return lines.join("\n");
  }

  const cardBlob = () =>
    new Promise<Blob>((resolve, reject) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        reject(new Error("สร้างภาพไม่สำเร็จ"));
        return;
      }
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("สร้างภาพไม่สำเร็จ"))),
        "image/png"
      );
    });

  function downloadBlob(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `thailand-map-quest-${total}-points.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }

  async function saveCard() {
    try {
      downloadBlob(await cardBlob());
      setShareStatus("สร้างไฟล์ภาพแล้ว หากใช้มือถือให้เลือกบันทึกตามเมนูของเบราว์เซอร์");
    } catch (error) {
      setShareStatus((error as Error).message);
    }
  }

  async function shareScore() {
    setSharing(true);
    const text = getShareText();
    try {
      const blob = await cardBlob();

      if (typeof File !== "undefined" && navigator.share && navigator.canShare) {
        const file = new File([blob], "thailand-map-quest.png", { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({ title: "Thailand Map Quest", text, files: [file] });
            setShareStatus("ส่งข้อมูลไปยังเมนูแชร์ของอุปกรณ์แล้ว");
            return;
          } catch (error) {
            if ((error as Error).name === "AbortError") return;
          }
        }
      }

      // Fallback: download the image and copy the text
      downloadBlob(blob);
      setShareText(text);
      try {
        if (!navigator.clipboard || !window.isSecureContext) throw new Error();
        await navigator.clipboard.writeText(text);
        setShareStatus("ดาวน์โหลดภาพและคัดลอกข้อความแล้ว นำไปแชร์ในแอปที่ต้องการได้เลย");
      } catch {
        setShareStatus("ดาวน์โหลดภาพแล้ว คัดลอกข้อความด้านล่างเพื่อใช้แชร์");
        setTimeout(() => {
          shareTextRef.current?.focus();
          shareTextRef.current?.select();
        }, 0);
      }
    } catch (error) {
      setShareStatus("แชร์ไม่สำเร็จ: " + (error as Error).message);
    } finally {
      setSharing(false);
    }
  }

  /* ---------- map paint state ---------- */
  function paintState(id: string) {
    if (reviewing) {
      if (id === reviewing.answer.question.answer) return "correct";
      if (id === reviewing.answer.chosen) return "wrong";
      return "";
    }
    return id === selected ? "selected" : "";
  }

  const areaClass = (id: string) => {
    const s = paintState(id);
    return "area" + (s === "correct" ? " correctArea" : s === "wrong" ? " wrongArea" : s === "selected" ? " selected" : "");
  };
  const dotClass = (id: string) => {
    const s = paintState(id);
    return "dot" + (s === "correct" ? " correctDot" : s === "wrong" ? " wrongDot" : s === "selected" ? " selected" : "");
  };

  // Selected dot is drawn last so it sits on top
  const orderedProvinces = useMemo<Province[]>(() => {
    if (!selected) return PROVINCES;
    return [
      ...PROVINCES.filter((p) => p.id !== selected),
      ...PROVINCES.filter((p) => p.id === selected),
    ];
  }, [selected]);

  const areaEntries = useMemo<[string, string][]>(
    () =>
      geo
        ? [...geo].map(([id, polygons]) => [id, polygonPath(polygons)] as [string, string])
        : [],
    [geo]
  );

  /* ---------- derived labels ---------- */
  const question = reviewing ? reviewing.answer.question : round[current];
  const playStatus = reviewing
    ? `คุณเลือก ${nameOf(reviewing.answer.chosen)} · ได้ ${reviewing.answer.score}/20 คะแนน`
    : current === 0
    ? "เลือกจังหวัดแรกได้เลย"
    : `บันทึกคำตอบแล้ว ${current} ข้อ`;

  /* ---------------------------------------------------------------- */
  return (
    <>
      <style>{CSS}</style>
      <main className="wrap">
        <header>
          <div className="brand">THAILAND <span>MAP QUEST</span></div>
          <div className="right-zone">
            <div className="badge">77 พื้นที่ · 100 คำถาม</div>
            {loginData.username && <div className="badge">{loginData.username}</div>}
          </div>
        </header>

        {phase === "home" && (
          <section className="panel hero">
            <div className="eyebrow">EXPLORE THAILAND</div>
            <h1>รู้จักประเทศไทย<br />ดีแค่ไหน?</h1>
            <p className="muted">
              อ่านคำใบ้ แล้วเลือกจังหวัดบนแผนที่ ตอบตรงจังหวัดได้เต็ม ตอบใกล้ยังมีคะแนน!
            </p>
            <div className="stats">
              <div className="stat"><strong>5</strong><small>ข้อ / รอบ</small></div>
              <div className="stat"><strong>20</strong><small>คะแนน / ข้อ</small></div>
              <div className="stat"><strong>100</strong><small>คะแนนเต็ม</small></div>
            </div>
            <p className="muted">
              เริ่มเล่นได้ทันทีด้วยแผนที่จุดจังหวัดที่ฝังไว้ในเกม
              หากโหลดขอบเขตออนไลน์สำเร็จ เกมจะแสดงพื้นที่จังหวัดเพิ่มเติม
            </p>
            <div className="actions">
              <button className="primary" onClick={startGame}>เริ่มเล่น</button>
              <button onClick={loadOnlineMap} disabled={loading}>ลองโหลดขอบเขตใหม่</button>
            </div>
            <p className="status" role="status">{loadStatus}</p>
            <details style={{ marginTop: 18 }}>
              <summary>นำเข้าไฟล์ขอบเขต GeoJSON เอง</summary>
              <p className="muted" style={{ fontSize: 13, marginTop: 10 }}>
                ไม่จำเป็นต้องใช้ตัวเลือกนี้เพื่อเริ่มเล่น
                ไฟล์ต้องมีขอบเขตและชื่อจังหวัดครบทั้ง 77 พื้นที่
              </p>
              <input type="file" accept=".json,.geojson" onChange={importGeoJSON} disabled={loading} />
            </details>
          </section>
        )}

        {phase === "play" && question && (
          <section>
            <div className="layout">
              <aside className="panel side">
                <div className="eyebrow">
                  {reviewing ? `เฉลยข้อ ${reviewing.index + 1} / 5` : `QUESTION ${current + 1} / 5`}
                </div>
                <div className="progress">
                  <div id="progressFill" style={{ width: `${reviewing ? 100 : current * 20}%` }} />
                </div>
                <h2 id="question" ref={questionRef} tabIndex={-1}>{question.text}</h2>
                <p className="muted">
                  {reviewing
                    ? "สีเขียว = คำตอบที่ถูกต้อง · สีชมพู = จังหวัดที่เลือกผิด"
                    : "แตะจุดหรือพื้นที่จังหวัด แล้วกดยืนยันคำตอบ"}
                </p>
                <div className="selection" aria-live="polite">
                  <small>{reviewing ? "คำตอบที่ถูกต้อง" : "จังหวัดที่เลือก"}</small>
                  <div id="selectedName">
                    {reviewing
                      ? nameOf(reviewing.answer.question.answer)
                      : selected
                      ? nameOf(selected)
                      : "ยังไม่ได้เลือก"}
                  </div>
                </div>
                {reviewing ? (
                  <button style={{ width: "100%", marginTop: 10 }} onClick={backToResult}>
                    กลับหน้าคะแนน
                  </button>
                ) : (
                  <button id="confirmBtn" className="primary" disabled={!selected} onClick={confirmAnswer}>
                    {current === 4 ? "ยืนยันและดูคะแนน" : "ยืนยันคำตอบ"}
                  </button>
                )}
                <p className="status" role="status">{playStatus}</p>
                <p className="muted" style={{ fontSize: 12, marginTop: 18 }}>
                  ตอบถูก 20 คะแนน · ตอบผิด 0–19 คะแนน<br />
                  ระยะทางเป็นเส้นตรงระหว่างจุดอ้างอิงเมืองหลัก
                  ไม่ใช่ระยะขับรถหรือระยะจากจุดที่แตะ
                </p>
              </aside>

              <section className="panel mapPanel">
                <div className="toolbar">
                  <span id="modeLabel">
                    {geo
                      ? "ขอบเขตจังหวัด + จุดอ้างอิง · 77 พื้นที่"
                      : "แผนที่ตำแหน่งจังหวัด · 77 พื้นที่"}
                  </span>
                  <button onClick={() => zoom(0.65)} aria-label="ซูมเข้า">＋</button>
                  <button onClick={() => zoom(1 / 0.65)} aria-label="ซูมออก">−</button>
                  <button onClick={resetView}>ดูทั้งหมด</button>
                </div>
                <svg
                  id="map"
                  ref={svgRef}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
                  aria-label="แผนที่เลือกจังหวัดของประเทศไทย"
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={() => { dragRef.current = null; }}
                  onLostPointerCapture={() => { dragRef.current = null; }}
                  onKeyDown={onMapKeyDown}
                >
                  <g>
                    {GRID_LON.map(({ lon, x }) => (
                      <g key={"lon" + lon}>
                        <line x1={x} y1={20} x2={x} y2={1120} className="gridLine" />
                        <text x={x + 4} y={1138} className="axisLabel">{lon}°E</text>
                      </g>
                    ))}
                    {GRID_LAT.map(({ lat, y }) => (
                      <g key={"lat" + lat}>
                        <line x1={15} y1={y} x2={735} y2={y} className="gridLine" />
                        <text x={18} y={y - 5} className="axisLabel">{lat}°N</text>
                      </g>
                    ))}
                  </g>
                  <g>
                    {areaEntries.map(([id, d]) => (
                      <path
                        key={id}
                        d={d}
                        className={areaClass(id)}
                        fillRule="evenodd"
                        data-id={id}
                        tabIndex={0}
                        role="button"
                        aria-label={"เลือก " + nameOf(id)}
                      >
                        <title>{nameOf(id)}</title>
                      </path>
                    ))}
                  </g>
                  <g>
                    {orderedProvinces.map((p) => {
                      const [cx, cy] = project(p.lon, p.lat);
                      return (
                        <circle
                          key={p.id}
                          cx={cx}
                          cy={cy}
                          r={p.id === selected ? 7.5 : 5.5}
                          className={dotClass(p.id)}
                          data-id={p.id}
                          tabIndex={0}
                          role="button"
                          aria-label={"เลือก " + p.th}
                        >
                          <title>{p.th}</title>
                        </circle>
                      );
                    })}
                  </g>
                </svg>
                <p className="mapHint">
                  กด + เพื่อเลือกจุดที่อยู่ใกล้กัน · ลากเพื่อเลื่อนแผนที่ · เลือกใหม่ได้ก่อนยืนยัน
                </p>
              </section>
            </div>
          </section>
        )}

        {phase === "result" && (
          <section>
            <div className="panel resultPanel">
              <div className="eyebrow">CHALLENGE COMPLETED</div>
              <h1>{rank(total)}</h1>
              <p className="muted">{`${total}/100 คะแนน · ตอบตรงจังหวัด ${exact}/5 ข้อ`}</p>
              <canvas
                id="scoreCard"
                ref={canvasRef}
                width={1200}
                height={800}
                role="img"
                aria-label="ภาพสรุปคะแนน"
              />
              <div className="actions">
                <button className="primary" onClick={shareScore} disabled={sharing}>แชร์คะแนน</button>
                <button onClick={saveCard}>บันทึกภาพ PNG</button>
                <button className="mint" onClick={toggleReview} aria-expanded={reviewOpen}>
                  {reviewOpen ? "ซ่อนเฉลย" : "ดูเฉลย"}
                </button>
                <button onClick={startGame}>เล่นใหม่</button>
              </div>
              <p className="status" role="status">{shareStatus}</p>
              {shareText !== null && (
                <textarea
                  id="shareText"
                  ref={shareTextRef}
                  readOnly
                  value={shareText}
                  aria-label="ข้อความสำหรับคัดลอกแชร์"
                />
              )}
            </div>

            {reviewOpen && (
              <section id="review" ref={reviewRef}>
                <h2>เฉลยและคะแนนรายข้อ</h2>
                {answers.map((answer, index) => (
                  <article className="reviewItem" key={index}>
                    <h3>{`${index + 1}. ${answer.question.text}`}</h3>
                    <div className="reviewGrid">
                      <ReviewCell label="คำตอบที่ถูกต้อง" value={nameOf(answer.question.answer)} className="good" />
                      <ReviewCell label="คุณเลือก" value={nameOf(answer.chosen)} className={answer.correct ? "good" : "bad"} />
                      <ReviewCell
                        label="ระยะห่างของจุดอ้างอิง"
                        value={answer.correct ? "0 กม." : `ประมาณ ${answer.distance.toFixed(1)} กม.`}
                      />
                      <ReviewCell label="คะแนน" value={`${answer.score}/20`} />
                    </div>
                    <button onClick={() => showAnswerMap(answer, index)}>ดูตำแหน่งบนแผนที่</button>
                  </article>
                ))}
              </section>
            )}
          </section>
        )}

        <footer>
          76 จังหวัดและกรุงเทพมหานคร รวม 77 พื้นที่สำหรับเกม<br />
          ตำแหน่งและขอบเขตใช้เพื่อการเรียนรู้ ไม่ใช่เอกสารอ้างอิงทางกฎหมาย<br />
          ข้อมูลขอบเขต:{" "}
          <a
            href="https://gist.github.com/jeepkd/4e31e6a10f8297b9de50c62856927ecf"
            target="_blank"
            rel="noopener noreferrer"
          >
            github
          </a>
        </footer>
      </main>
    </>
  );
}

function ReviewCell({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="reviewCell">
      <small>{label}</small>
      <strong className={className}>{value}</strong>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles (unchanged from the original HTML)                          */
/* ------------------------------------------------------------------ */
const CSS = `
:root{
  --bg:#090f1e;--panel:#141e33;--line:#2d3b56;
  --text:#eef3ff;--muted:#afbed8;--purple:#8270ff;
  --mint:#54e0bd;--red:#ffa2af
}
*{box-sizing:border-box}
body{
  margin:0;color:var(--text);
  background:radial-gradient(ellipse at top left,#252047,transparent 55%),var(--bg);
  font-family:system-ui,-apple-system,"Segoe UI",sans-serif;
  line-height:1.6
}
button,input{font:inherit}
button{
  border:0;border-radius:12px;padding:11px 17px;
  background:#2c3b59;color:var(--text);
  font-weight:750;cursor:pointer
}
button:hover:not(:disabled){filter:brightness(1.15)}
button:disabled{opacity:.45;cursor:not-allowed}
button:focus-visible,input:focus-visible{outline:3px solid var(--mint);outline-offset:3px}
.primary{background:var(--purple);color:white}
.mint{background:var(--mint);color:#07352c}
.wrap{max-width:1190px;margin:auto;padding:22px 16px 40px}
header{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:22px}
.brand{font-size:20px;font-weight:900;letter-spacing:-.7px}
.brand span{color:var(--mint)}
.badge{padding:5px 11px;border:1px solid var(--line);border-radius:30px;color:var(--muted);font-size:12px}
.right-zone{display:flex;gap:6px;}
.panel{background:linear-gradient(145deg,#19253b,#111a2d);border:1px solid var(--line);border-radius:22px;padding:24px}
.hero{max-width:800px;margin:30px auto;padding:clamp(22px,5vw,44px)}
h1,h2,h3,p{margin-top:0}
h1{font-size:clamp(30px,5vw,48px);line-height:1.25}
h2{line-height:1.45}
.muted{color:var(--muted)}
.eyebrow{font-size:12px;letter-spacing:2px;color:var(--mint);font-weight:800;margin-bottom:12px}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:24px 0}
.stat{text-align:center;padding:13px 8px;background:#ffffff05;border:1px solid var(--line);border-radius:14px}
.stat strong{display:block;font-size:29px;color:var(--mint)}
.stat small{color:var(--muted)}
.actions{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.status{font-size:13px;color:var(--muted);margin:15px 0 0;white-space:pre-line}
.layout{display:grid;grid-template-columns:320px minmax(0,1fr);gap:18px;align-items:start}
.side{position:sticky;top:15px}
#question{font-size:23px;min-height:125px}
.progress{height:7px;background:#2b3954;border-radius:9px;margin:18px 0 22px;overflow:hidden}
#progressFill{height:100%;background:var(--mint);width:0;transition:width .2s}
.selection{margin:18px 0 12px;padding:14px;background:#0a1325;border:1px dashed #67789a;border-radius:14px}
.selection small{display:block;color:var(--muted)}
#selectedName{font-size:21px;font-weight:800}
#confirmBtn{width:100%}
.mapPanel{padding:0;overflow:hidden}
.toolbar{padding:12px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;border-bottom:1px solid var(--line)}
.toolbar button{padding:7px 13px}
#modeLabel{font-size:12px;color:var(--muted);flex:1;min-width:160px}
#map{display:block;width:100%;height:670px;background:#0b1728;touch-action:none;user-select:none}
.gridLine{stroke:#25374c;stroke-width:1;vector-effect:non-scaling-stroke}
.axisLabel{fill:#6f849f;font-size:12px}
.area{fill:#354c70;stroke:#a8bbd0;stroke-width:.8;vector-effect:non-scaling-stroke;cursor:pointer}
.area:hover{fill:#506d93}
.area.selected{fill:#9077ff;stroke:#fff;stroke-width:2}
.area.correctArea{fill:#1d816d;stroke:#7effd9;stroke-width:2}
.area.wrongArea{fill:#963f66;stroke:#ffb1c9;stroke-width:2}
.dot{fill:#6ce1c3;stroke:#102238;stroke-width:1.4;vector-effect:non-scaling-stroke;cursor:pointer}
.dot:hover{fill:white}
.dot.selected{fill:#beacff;stroke:white;stroke-width:2}
.dot.correctDot{fill:#63ffd2;stroke:white;stroke-width:2}
.dot.wrongDot{fill:#ff809f;stroke:white;stroke-width:2}
.area:focus,.dot:focus{outline:none;stroke:white;stroke-width:3}
.mapHint{font-size:12px;color:var(--muted);padding:10px 14px;margin:0}
.resultPanel{max-width:820px;margin:auto;text-align:center}
.resultPanel .actions{justify-content:center}
#scoreCard{display:block;width:100%;height:auto;margin:22px auto;border-radius:18px;border:1px solid #41516c}
#review{max-width:920px;margin:25px auto}
.reviewItem{padding:20px;background:var(--panel);border:1px solid var(--line);border-radius:16px;margin:12px 0}
.reviewItem h3{font-size:18px;margin-bottom:12px}
.reviewGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:14px}
.reviewCell{padding:10px;background:#ffffff05;border-radius:10px}
.reviewCell small{display:block;color:var(--muted)}
.good{color:var(--mint)}
.bad{color:var(--red)}
#shareText{
  width:100%;min-height:105px;margin-top:15px;padding:12px;
  border-radius:12px;background:#0b1324;color:white;
  border:1px solid var(--line);font:inherit
}
footer{text-align:center;color:var(--muted);font-size:12px;margin-top:28px}
a{color:#b9afff}
@media(max-width:760px){
  .wrap{padding:15px 10px 30px}
  .layout{grid-template-columns:1fr}
  .side{position:static;padding:18px}
  #question{min-height:0;font-size:21px}
  #map{height:60vh;min-height:390px}
  .hero{margin:10px auto}
  .brand{font-size:17px}
  .badge{font-size:10px}
  .reviewGrid{grid-template-columns:1fr}
}
`;
