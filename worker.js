var ISTIGHFAR_COUNT = 5;var MORNING_AFTER_FAJR_MIN = 20;var EVENING_AFTER_MAGHRIB_MIN = 0;var CATCHUP_MIN = 30;var BATCH = 30;var QURAN_AFTER_FAJR_MIN = 5;
var QURAN_PAGES = 604;var QURAN_MSG_LIMIT = 3800;var QURAN_GIVEUP_MIN = 20;var QUIZ_AT_MIN = 16 * 60;var QUIZ_POINTS = 5;var QUIZ_FIRST_BONUS = 5;var QUIZ_WINDOW_H = 24;
var QUIZ_MAX_ANSWER_LEN = 100;var LEADERBOARD_AT_MIN = 22 * 60;var TOMORROW_AT_MIN = 21 * 60 + 30;var LEADERBOARD_TOP = 10;var OWNER_USERNAME = "Youssefhekal";
var LAT = 30.0444;var LON = 31.2357;var TZ_NAME = "Africa/Cairo";var AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";var arNum = (n) => String(n).replace(/\d/g, (d) => AR_DIGITS[d]);
var MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];var monthKey = (t) => `${t.y}-${String(t.m).padStart(2, "0")}`;
var rad = (d) => d * Math.PI / 180;var deg = (r) => r * 180 / Math.PI;var sin = (d) => Math.sin(rad(d));var cos = (d) => Math.cos(rad(d));var fix = (a, b) => {a -= b * Math.floor(a / b);
return a < 0 ? a + b : a;};function julian(y, m, d) {if (m <= 2) {y -= 1;m += 12;} const A = Math.floor(y / 100);const B = 2 - A + Math.floor(A / 4);return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
} function sunPosition(jd) {const D = jd - 2451545;const g = fix(357.529 + 0.98560028 * D, 360);const q = fix(280.459 + 0.98564736 * D, 360);const L = fix(q + 1.915 * sin(g) + 0.02 * sin(2 * g), 360);
const e = 23.439 - 36e-8 * D;const RA = fix(deg(Math.atan2(cos(e) * sin(L), cos(L))) / 15, 24);let eqt = q / 15 - RA;if (eqt > 12) eqt -= 24;if (eqt < -12) eqt += 24;
return { decl: deg(Math.asin(sin(e) * sin(L))), eqt };} function prayerTimes(y, m, d) {const jd = julian(y, m, d) - LON / (15 * 24);const noon = (t) => fix(12 - sunPosition(jd + t).eqt, 24);
const angleTime = (angle, t, ccw) => {const decl = sunPosition(jd + t).decl;const v = (-sin(angle) - sin(decl) * sin(LAT)) / (cos(decl) * cos(LAT));const h = deg(Math.acos(Math.max(-1, Math.min(1, v)))) / 15;
return noon(t) + (ccw ? -h : h);};const shift = tzOffset(Date.UTC(y, m - 1, d, 12)) - LON / 15;const fajr = angleTime(19.5, 5 / 24, true) + shift;const sunrise = angleTime(0.833, 6 / 24, true) + shift;
const maghrib = angleTime(0.833, 18 / 24, false) + shift;const isha = angleTime(17.5, 18 / 24, false) + shift;const dhuhr = noon(12 / 24) + shift;const asrDecl = sunPosition(jd + 15 / 24).decl;
const asrAngle = -deg(Math.atan(1 / (1 + Math.tan(rad(Math.abs(LAT - asrDecl))))));const asr = angleTime(asrAngle, 15 / 24, false) + shift;return { fajr: fajr * 60,
sunrise: sunrise * 60, dhuhr: dhuhr * 60, asr: asr * 60, maghrib: maghrib * 60, isha: isha * 60 };} function tzOffset(ms) {try {const d = new Date(ms);
let diff = Number(new Intl.DateTimeFormat("en-US", { timeZone: TZ_NAME, hour: "numeric", hourCycle: "h23" }).format(d)) - d.getUTCHours();if (diff > 12) diff -= 24;
if (diff < -12) diff += 24;return diff;} catch {return 2;}} function meccaNow(ms) {const t = new Date(ms + tzOffset(ms) * 36e5);return { y: t.getUTCFullYear(),
m: t.getUTCMonth() + 1, d: t.getUTCDate(), minutes: t.getUTCHours() * 60 + t.getUTCMinutes() + t.getUTCSeconds() / 60 };} function schedule(y, m, d) {const t = prayerTimes(y, m, d);
const ev = [{ id: "quran", at: t.fajr + QURAN_AFTER_FAJR_MIN, kind: "quran" }, { id: "morning", at: t.fajr + MORNING_AFTER_FAJR_MIN, kind: "morning" }];
const span = t.isha - t.fajr;for (let i = 1; i <= ISTIGHFAR_COUNT; i++) {ev.push({ id: `istighfar${i}`, at: t.fajr + span * i / (ISTIGHFAR_COUNT + 1),
kind: "istighfar", n: i });} ev.push({ id: "evening", at: t.maghrib + EVENING_AFTER_MAGHRIB_MIN, kind: "evening" });ev.push({ id: "quiz", at: QUIZ_AT_MIN,
kind: "quiz" });ev.push({ id: "tomorrow", at: TOMORROW_AT_MIN, kind: "tomorrow" });if (new Date(Date.UTC(y, m, 0)).getUTCDate() === d) {ev.push({ id: "leaderboard",
at: LEADERBOARD_AT_MIN, kind: "leaderboard" });} return { times: t, events: ev.sort((a, b) => a.at - b.at) };}
var DAYS_AR = ["الأحد", "الاثنين", "الثلاثاء",
"الأربعاء", "الخميس", "الجمعة", "السبت"];function tomorrowText(n) {const dt = new Date(n * 864e5);const y = dt.getUTCFullYear(), m = dt.getUTCMonth() + 1, d = dt.getUTCDate();
const t = prayerTimes(y, m, d);const lines = [`🕌 مواقيت الصلاة بكرة — ${DAYS_AR[dt.getUTCDay()]} ${arNum(d)} ${MONTHS_AR[m - 1]}`, "", `الفجر: ${clock(t.fajr)}`,
`الشروق: ${clock(t.sunrise)}`, `الظهر: ${clock(t.dhuhr)}`, `العصر: ${clock(t.asr)}`, `المغرب: ${clock(t.maghrib)}`, `العشاء: ${clock(t.isha)}`];if (tzOffset(Date.UTC(y, m - 1, d, 12)) !== tzOffset(Date.UTC(y, m - 1, d - 1, 12))) {lines.push("", "⚠️ الساعة هتتغير بعد نص الليل (التوقيت الصيفي/الشتوي)، والمواعيد دي بالتوقيت الجديد.");
} lines.push("", "بتوقيت القاهرة 🤍");return lines.join("\n");} function clock(min) {min = Math.round(min);let h = Math.floor(min / 60) % 24;const mm = String(min % 60).padStart(2, "0");
const suffix = h >= 12 ? "م" : "ص";h = h % 12 || 12;return `${h}:${mm} ${suffix}`;} async function tg(env, method, body = {}) {const res = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, { method: "POST",
headers: { "content-type": "application/json" }, body: JSON.stringify(body) });return res.json();} var send = (env, chat_id, text, extra = {}) => tg(env, "sendMessage", { chat_id,
text, ...extra });function timesText() {const m = meccaNow(Date.now());const { times, events } = schedule(m.y, m.m, m.d);const lines = ["🕌 مواعيد اليوم (بتوقيت القاهرة)\n",
`الفجر: ${clock(times.fajr)}`];for (const e of events) {if (e.kind === "quran") lines.push(`📖 صفحة القرآن: ${clock(e.at)}`);if (e.kind === "morning") lines.push(`🌅 أذكار الصباح: ${clock(e.at)}`);
if (e.kind === "istighfar") lines.push(`🌿 تذكير الاستغفار ${e.n}: ${clock(e.at)}`);if (e.kind === "evening") lines.push(`🌙 أذكار المساء: ${clock(e.at)}`);
if (e.kind === "quiz") lines.push(`🧠 سؤال اليوم: ${clock(e.at)}`);if (e.kind === "tomorrow") lines.push(`🕌 مواقيت بكرة: ${clock(e.at)}`);if (e.kind === "leaderboard") lines.push(`🏆 ترتيب أوائل الشهر: ${clock(e.at)}`);
} lines.push(`العشاء: ${clock(times.isha)}`);lines.push("\nالمواعيد محسوبة بطريقة الهيئة المصرية العامة للمساحة، وممكن تختلف دقيقة أو اتنين عن التقويم الرسمي.");
return lines.join("\n");} var ISTIGHFAR = "أَسْتَغْفِرُ اللَّهَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ";var AYAT_KURSI = "اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ";
var IKHLAS = "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ\nقُلْ هُوَ اللَّهُ أَحَدٌ * اللَّهُ الصَّمَدُ * لَمْ يَلِدْ وَلَمْ يُولَدْ * وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ";
var FALAQ = "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ\nقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ * مِنْ شَرِّ مَا خَلَقَ * وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ * وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ * وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ";
var NAS = "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ\nقُلْ أَعُوذُ بِرَبِّ النَّاسِ * مَلِكِ النَّاسِ * إِلَهِ النَّاسِ * مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ * الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ * مِنَ الْجِنَّةِ وَالنَّاسِ";
var SAYYID = "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ";
var AFIYA = "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ";var BISMILLAH = "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ";
var RADITU = "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صلى الله عليه وسلم نَبِيًّا";var SUBHAN = "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ";
var TAHLIL = "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ";function azkarText(kind) {const morning = kind === "morning";
const head = morning ? "🌅 أذكار الصباح" : "🌙 أذكار المساء";const part1 = morning ? "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ" : "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ";
const part2 = morning ? "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ" : "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ";
const nima = morning ? "اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ" : "اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ";
const fitra = morning ? "أَصْبَحْنَا عَلَى فِطْرَةِ الْإِسْلَامِ، وَعَلَى كَلِمَةِ الْإِخْلَاصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صلى الله عليه وسلم، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ" : "أَمْسَيْنَا عَلَى فِطْرَةِ الْإِسْلَامِ، وَعَلَى كَلِمَةِ الْإِخْلَاصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صلى الله عليه وسلم، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ";
const items = [["أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ — آية الكرسي (مرة)", AYAT_KURSI], ["الإخلاص والفلق والناس (3 مرات)", [IKHLAS, FALAQ, NAS].join("\n\n")],
["(مرة)", part1], ["(مرة)", part2], ["سيد الاستغفار (مرة)", SAYYID], ["(مرة)", nima], ["(3 مرات)", AFIYA], ["(3 مرات)", BISMILLAH], ["(3 مرات)", RADITU],
["(مرة)", fitra]];if (!morning) items.push(["(3 مرات)", "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ"]);items.push(["(100 مرة)", SUBHAN], ["(10 مرات)",
TAHLIL]);const blocks = [head, ...items.map(([label, body]) => `${label}
${body}`), "تقبّل الله منا ومنكم 🤍"];const AZKAR_MSG_LIMIT = 1500;const msgs = [];
let cur = "";for (const b of blocks) {if (cur && cur.length + 2 + b.length > AZKAR_MSG_LIMIT) {msgs.push(cur);cur = b;} else {cur = cur ? cur + "\n\n" + b : b;
}} if (cur) msgs.push(cur);return msgs;} function istighfarText(n) {return `🌿 تذكير بالاستغفار (${n}/${ISTIGHFAR_COUNT})

${ISTIGHFAR}`;} var MENU_TEXT = "🤍 اختار من القايمة:";
var MAIN_MENU = {inline_keyboard: [[{ text: "📖 ورد القرآن (صفحة النهارده)", callback_data: "q" }],[{ text: "🌅 أذكار الصباح", callback_data: "az:morning" },
{ text: "🌙 أذكار المساء", callback_data: "az:evening" }],[{ text: "🤲 أذكار وأدعية متنوعة", callback_data: "d" }],[{ text: "⭐ الأذكار المضافة", callback_data: "c" }]]};
var DUAS = [["🕌 دخول المسجد", "بِسْمِ اللَّهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ", "يُقال عند الدخول بالرجل اليمنى."],
["🚪 الخروج من المسجد", "بِسْمِ اللَّهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ", "يُقال عند الخروج بالرجل اليسرى."],
["🏠 دخول المنزل", "بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى رَبِّنَا تَوَكَّلْنَا", "ثم يُسلِّم على أهله."],["🚶 الخروج من المنزل",
"بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ"],["🚿 دخول الخلاء والخروج منه", "عند الدخول:\nبِسْمِ اللَّهِ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ\n\nعند الخروج:\nغُفْرَانَكَ"],
["🍽️ قبل الأكل وبعده", "قبل الأكل:\nبِسْمِ اللَّهِ\n\nلو نسيت في أوله:\nبِسْمِ اللَّهِ فِي أَوَّلِهِ وَآخِرِهِ\n\nبعد الأكل:\nالْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ"],
["💧 بعد الوضوء", "أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ\n\nاللَّهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِينَ"],
["📢 عند سماع الأذان", "تقول مثل ما يقول المؤذن، وبعد الانتهاء من الأذان تصلي على النبي ﷺ ثم تقول:\n\nاللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ"],
["🤲 أذكار بعد الصلاة", "أَسْتَغْفِرُ اللَّهَ (ثلاثًا)\n\nاللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ\n\nسُبْحَانَ اللَّهِ (33)\nالْحَمْدُ لِلَّهِ (33)\nاللَّهُ أَكْبَرُ (33)\n\nثم تُتِمُّ المئة بـ:\nلَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ"],
["😴 دعاء النوم", "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا"],["🌄 دعاء الاستيقاظ", "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ"],
["👕 دعاء لبس الثوب", "الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَذَا الثَّوْبَ وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ"],["🚗 دعاء الركوب والسفر",
"اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ\n\nسُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ"],
["😔 دعاء الهم والحزن", "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ"],
["🆘 دعاء الكرب", "لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ"],
["🩺 زيارة المريض", "لَا بَأْسَ، طَهُورٌ إِنْ شَاءَ اللَّهُ"]];function duaListMarkup() {const rows = [];for (let i = 0; i < DUAS.length; i += 2) {const row = [{ text: DUAS[i][0],
callback_data: `d:${i}` }];if (DUAS[i + 1]) row.push({ text: DUAS[i + 1][0], callback_data: `d:${i + 1}` });rows.push(row);} rows.push([{ text: "🏠 القايمة الرئيسية",
callback_data: "menu" }]);return { inline_keyboard: rows };} var duaBackMarkup = () => ({ inline_keyboard: [[{ text: "⬅️ رجوع للأذكار", callback_data: "dl" }],
[{ text: "🏠 القايمة الرئيسية", callback_data: "menu" }]] });var duaText = ([title, text, note]) => `${title}

${text}${note ? `

${note}` : ""}

تقبّل الله منا ومنكم 🤍`;
var DUA_LIST_TEXT = "🤲 اختار الذكر أو الدعاء:";var CUSTOM_MAX = 60;var CUSTOM_TEXT_MAX = 3500;var MENU_BTN = { text: "🏠 القايمة الرئيسية", callback_data: "menu" };
function autoTitle(text) {const first = String(text).split("\n").map((l) => l.trim()).find(Boolean) || "ذكر";const t = first.replace(/\s+/g, " ");return t.length > 28 ? t.slice(0, 28).trimEnd() + "…" : t;
} async function listCustomAzkar(env) {return (await env.DB.prepare("SELECT id, title, text FROM custom_azkar ORDER BY id").all()).results;}
async function addCustomZikr(env, text, titleArg) {text = String(text || "").trim();
if (!text) return { ok: false, reason: "empty" };if (text.length > CUSTOM_TEXT_MAX) return { ok: false, reason: "long" };const rows = await listCustomAzkar(env);
if (rows.length >= CUSTOM_MAX) return { ok: false, reason: "max" };if (rows.some((r) => r.text === text)) return { ok: false, reason: "dup" };const title = String(titleArg || "").trim() || autoTitle(text);
await env.DB.prepare("INSERT INTO custom_azkar(title, text, created) VALUES(?,?,?)").bind(title, text, Math.floor(Date.now() / 1e3)).run();return { ok: true,
title };} async function deleteCustomZikr(env, id) {const r = await env.DB.prepare("DELETE FROM custom_azkar WHERE id=?").bind(id).run();return !!(r.meta && r.meta.changes);
} function customListView(rows) {if (!rows.length) return { text: "⭐ لسه مفيش أذكار مضافة.", markup: { inline_keyboard: [[MENU_BTN]] } };const kb = [];
for (let i = 0; i < rows.length; i += 2) {const row = [{ text: rows[i].title, callback_data: `c:${rows[i].id}` }];if (rows[i + 1]) row.push({ text: rows[i + 1].title,
callback_data: `c:${rows[i + 1].id}` });kb.push(row);} kb.push([MENU_BTN]);return { text: "⭐ الأذكار المضافة:", markup: { inline_keyboard: kb } };} var customText = (r) => `${r.text}

تقبّل الله منا ومنكم 🤍`;
var customBackMarkup = () => ({ inline_keyboard: [[{ text: "⬅️ رجوع للأذكار المضافة", callback_data: "cl" }], [MENU_BTN]] });function customDeleteView(rows) {if (!rows.length) return { text: "✅ مفيش أذكار مضافة.",
markup: void 0 };const lines = rows.map((r, i) => `${i + 1}) ${r.title}`);const kb = [];for (let i = 0; i < rows.length; i += 5) kb.push(rows.slice(i, i + 5).map((r, j) => ({ text: `🗑 ${i + j + 1}`,
callback_data: `x:${r.id}` })));return { text: "🗑 اضغط على رقم الذكر اللي عايز تمسحه:\n\n" + lines.join("\n"), markup: { inline_keyboard: kb } };} var stripMarks = (s) => s.replace(/[\u0640\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, "").replace(/\u0671/g, "ا");
var BASMALA_PLAIN = "بسم الله الرحمن الرحيم";var quranCache = { page: 0, msgs: null };function formatQuranPage(page, ayahs) {const head = `📖 ورد اليوم من القرآن الكريم
صفحة ${arNum(page)} من ${arNum(QURAN_PAGES)}${ayahs[0].juz ? ` — الجزء ${arNum(ayahs[0].juz)}` : ""}`;
const footer = "\n\nتقبّل الله منا ومنكم 🤍";const units = [];let afterHeader = false;for (const a of ayahs) {let text = String(a.text).trim();if (a.numberInSurah === 1 && a.surah) {units.push({ pre: "\n\n",
str: `❁ ${a.surah.name} ❁` });afterHeader = true;if (a.surah.number !== 1) {const tokens = text.split(/\s+/);const first4 = tokens.slice(0, 4).join(" ");
if (stripMarks(first4) === BASMALA_PLAIN) {units.push({ pre: "\n", str: first4 });text = tokens.slice(4).join(" ");}}} units.push({ pre: afterHeader ? "\n" : " ",
str: `${text} ﴿${arNum(a.numberInSurah)}﴾` });afterHeader = false;} const chunks = [];let cur = head + "\n\n";units.forEach((u, i) => {const pre = i === 0 ? "" : u.pre;
if (cur.length + pre.length + u.str.length > QURAN_MSG_LIMIT) {chunks.push(cur.trimEnd());cur = u.str;} else {cur += pre + u.str;}});chunks.push(cur + footer);
return chunks;} var QURAN_TOTAL_AYAHS = 6236;var compact = (ayahs) => ayahs.map((a) => [a.surah.number, a.surah.name, a.numberInSurah, a.juz, String(a.text).trim()]);
var expand = (rows) => rows.map(([s, name, n, juz, text]) => ({ text, numberInSurah: n, juz, surah: { number: s, name } }));function validPage(rows) {return Array.isArray(rows) && rows.length > 0 && rows.every((r) => Array.isArray(r) && r.length === 5 && Number.isInteger(r[0]) && r[0] >= 1 && r[0] <= 114 && typeof r[1] === "string" && Number.isInteger(r[2]) && r[2] >= 1 && typeof r[4] === "string" && /[\u0621-\u064A]/.test(r[4]));
} async function downloadPage(page) {const res = await fetch(`https://api.alquran.cloud/v1/page/${page}/quran-uthmani`);if (!res.ok) throw new Error(`quran api status ${res.status}`);
const j = await res.json();const ayahs = j && j.data && j.data.ayahs;if (!Array.isArray(ayahs) || !ayahs.length) throw new Error("quran api: bad response");
const rows = compact(ayahs);if (!validPage(rows)) throw new Error(`quran api: invalid page ${page}`);return rows;}
var savePage = (env, page, rows) => env.DB.prepare("INSERT OR REPLACE INTO quran_pages(page, data) VALUES(?,?)").bind(page, JSON.stringify(rows)).run();
async function fetchQuranPage(env, page) {if (quranCache.page === page && quranCache.msgs) return quranCache.msgs;let rows = null;const r = await env.DB.prepare("SELECT data FROM quran_pages WHERE page=?").bind(page).first();
if (r) {try {const p = JSON.parse(r.data);if (validPage(p)) rows = p;} catch {}} if (!rows) {rows = await downloadPage(page);await savePage(env, page, rows);
} const msgs = formatQuranPage(page, expand(rows));quranCache = { page, msgs };return msgs;} async function quranLibraryStatus(env) {const r = await env.DB.prepare("SELECT COUNT(*) AS c, COALESCE(SUM(json_array_length(data)), 0) AS a FROM quran_pages").first();
return { pages: r ? r.c : 0, ayahs: r ? r.a : 0 };} async function fillQuranLibrary(env, max) {const have = new Set((await env.DB.prepare("SELECT page FROM quran_pages").all()).results.map((x) => x.page));
if (have.size >= QURAN_PAGES) return 0;let added = 0;for (let p = 1; p <= QURAN_PAGES && added < max; p++) {if (have.has(p)) continue;try {await savePage(env, p, await downloadPage(p));
added++;} catch (e) {console.error("quran fill error, page", p, e);break;}} return added;} async function quranPending(env, m, create) {const row = await env.DB.prepare("SELECT v FROM kv WHERE k='quran_page'").first();
if (row) return parseInt(row.v, 10) || 1;let p = 1;const old = await env.DB.prepare("SELECT v FROM kv WHERE k='quran_start'").first();if (old) {const today = Math.floor(Date.UTC(m.y, m.m - 1, m.d) / 864e5);
p = ((today - parseInt(old.v, 10)) % QURAN_PAGES + QURAN_PAGES) % QURAN_PAGES + 1;} if (create) await env.DB.prepare("INSERT OR IGNORE INTO kv(k, v) VALUES('quran_page', ?)").bind(String(p)).run();
return p;} async function syncTodayQuranJob(env, n) {const t = meccaNow(Date.now());const dateKey = `${t.y}-${String(t.m).padStart(2, "0")}-${String(t.d).padStart(2, "0")}`;
const r = await env.DB.prepare("UPDATE jobs SET n=? WHERE key=? AND done=0").bind(n, `${dateKey}:quran`).run();return !!(r.meta && r.meta.changes > 0);
} var QURAN_SENT_NOTE = "\nℹ️ ورد النهارده اتبعت خلاص، فالصفحة دي هتنزل بكرة. عشان تشوفها دلوقتي اكتب /quran ومعاها الرقم، مثلًا: /quran ";async function quranPageFor(env, m, create) {const dateKey = `${m.y}-${String(m.m).padStart(2, "0")}-${String(m.d).padStart(2, "0")}`;
const job = await env.DB.prepare("SELECT n FROM jobs WHERE key=?").bind(`${dateKey}:quran`).first();if (job && job.n) return job.n;return quranPending(env, m, create);
}
var QUESTIONS = [["من هو أول من أسلم من الرجال الأحرار؟", "أبو بكر الصديق", ["ابو بكر", "ابوبكر", "الصديق"]],["ما اسم أول زوجة للنبي ﷺ؟", "خديجة بنت خويلد",
["خديجة"]],["في أي مدينة وُلد النبي ﷺ؟", "مكة المكرمة", ["مكة"]],["ما اسم الغار الذي نزل فيه الوحي أول مرة على النبي ﷺ؟", "غار حراء", ["حراء"]],["ما هي أول كلمة نزلت من القرآن الكريم؟",
"اقرأ", []],["كم عدد أركان الإسلام؟", "خمسة", ["خمس", "5"]],["كم عدد أركان الإيمان؟", "ستة", ["ست", "6"]],["من هو الصحابي الملقب بـ «سيف الله المسلول»؟",
"خالد بن الوليد", ["خالد"]],["من هو الخليفة الملقب بـ «الفاروق»؟", "عمر بن الخطاب", ["عمر"]],["من هو الخليفة الملقب بـ «ذي النورين»؟", "عثمان بن عفان",
["عثمان"]],["من هو أول مؤذن في الإسلام؟", "بلال بن رباح", ["بلال"]],["في أي سنة هجرية وقعت غزوة بدر الكبرى؟", "السنة الثانية للهجرة", ["الثانية", "2",
"اثنين", "اثنتين"]],["كم كان عدد المسلمين في غزوة بدر تقريبًا؟", "313", ["ثلاثمائة وثلاثة عشر", "ثلاث مئة وثلاثة عشر", "ثلاثمئة وثلاثة عشر"]],["ما اسم ناقة النبي ﷺ المشهورة؟",
"القصواء", []],["من هو الصحابي الملقب بـ «أمين هذه الأمة»؟", "أبو عبيدة بن الجراح", ["ابو عبيدة", "ابن الجراح"]],["من هي أول شهيدة في الإسلام؟", "سمية بنت خياط",
["سمية"]],["من هو قائد الرماة في غزوة أحد؟", "عبد الله بن جبير", ["عبدالله بن جبير", "ابن جبير"]],["في أي سنة هجرية فُتحت مكة؟", "السنة الثامنة للهجرة",
["الثامنة", "8", "ثمانية", "ثمان"]],["كم سنة مكث النبي ﷺ في مكة بعد البعثة قبل الهجرة؟", "13 سنة", ["13", "ثلاثة عشر", "ثلاث عشرة"]],["ما اسم أول مسجد بُني في الإسلام؟",
"مسجد قباء", ["قباء"]],["من هو الصحابي الذي نام في فراش النبي ﷺ ليلة الهجرة؟", "علي بن أبي طالب", ["علي"]],["من هو صاحب النبي ﷺ في الغار؟", "أبو بكر الصديق",
["ابو بكر", "ابوبكر", "الصديق"]],["من هو الصحابي الملقب بـ «حِبّ رسول الله»؟", "أسامة بن زيد", ["اسامة"]],["من هو الصحابي الذي اهتز عرش الرحمن لموته؟",
"سعد بن معاذ", ["سعد"]],["من هي أم المؤمنين الملقبة بـ «الصديقة بنت الصديق»؟", "عائشة بنت أبي بكر", ["عائشة", "عايشة"]],["من هو الصحابي الملقب بـ «ترجمان القرآن»؟",
"عبد الله بن عباس", ["ابن عباس", "عبدالله بن عباس"]],["من هو أكثر الصحابة روايةً للحديث؟", "أبو هريرة", ["ابو هريرة", "ابوهريرة"]],["ما اسم زوجة فرعون المؤمنة؟",
"آسية بنت مزاحم", ["اسية"]],["ما هي أطول سورة في القرآن؟", "البقرة", []],["ما هي أقصر سورة في القرآن؟", "الكوثر", []],["كم عدد سور القرآن الكريم؟", "114 سورة",
["114", "مئة وأربعة عشر", "مائة وأربعة عشر"]],["كم عدد أجزاء القرآن الكريم؟", "30 جزءًا", ["30", "ثلاثون", "ثلاثين"]],["ما هي السورة التي تُسمّى «قلب القرآن»؟",
"يس", ["ياسين"]],["ما هي السورة التي لا تبدأ بالبسملة؟", "التوبة", ["براءة"]],["ما هي السورة التي تعدل ثلث القرآن؟", "الإخلاص", ["قل هو الله احد"]],["ما هي السورة التي تُسمّى «عروس القرآن»؟",
"الرحمن", []],["ما هي أعظم آية في القرآن الكريم؟", "آية الكرسي", ["الكرسي"]],["كم عدد آيات سورة الفاتحة؟", "سبع آيات", ["7", "سبع", "سبعة"]],["في أي سورة ورد اسم «أحمد» للنبي ﷺ؟",
"سورة الصف", ["الصف"]],["من هو النبي الأكثر ذكرًا في القرآن الكريم؟", "موسى عليه السلام", ["موسى"]],["ما هي السورة التي يُستحب قراءتها يوم الجمعة؟", "سورة الكهف",
["الكهف"]],["ما هي السورة الوحيدة التي سُميت باسم امرأة؟", "مريم", []],["ما هي أطول آية في القرآن الكريم؟", "آية الدَّين", ["الدين", "اية الدين"]],["أكمل: «وما خلقت الجن والإنس إلا ...»",
"ليعبدون", []],["أكمل: «إن مع العسر ...»", "يسرا", []],["أكمل: «ومن يتق الله يجعل له ...»", "مخرجًا", []],["أكمل الحديث: «إنما الأعمال ...»", "بالنيات",
["النيات"]],["أكمل الحديث: «الدين ...»", "النصيحة", []],["أكمل الحديث: «المسلم من سلم المسلمون من ...»", "لسانه ويده", ["لسانه"]],["أكمل الحديث: «من كان يؤمن بالله واليوم الآخر فليقل خيرًا أو ...»",
"ليصمت", ["فليصمت", "يصمت"]],["أكمل دعاء الاستيقاظ: «الحمد لله الذي أحيانا بعد ما أماتنا وإليه ...»", "النشور", []],["من هو أبو الأنبياء؟", "إبراهيم عليه السلام",
["ابراهيم"]],["من هو النبي الذي ابتلعه الحوت؟", "يونس عليه السلام", ["يونس", "ذو النون"]],["من هو النبي الذي ألان الله له الحديد؟", "داود عليه السلام",
["داود", "داوود"]],["من هو النبي الذي سخّر الله له الريح والجن؟", "سليمان عليه السلام", ["سليمان"]],["من هو النبي الملقب بـ «كليم الله»؟", "موسى عليه السلام",
["موسى"]],["من هو أول الرسل إلى أهل الأرض؟", "نوح عليه السلام", ["نوح"]],["من هو النبي الذي ضُرب به المثل في الصبر على المرض؟", "أيوب عليه السلام", ["ايوب"]],
["من هو النبي الذي وُلد من غير أب؟", "عيسى عليه السلام", ["المسيح"]],["من هو أبو البشر؟", "آدم عليه السلام", ["ادم"]],["من هو النبي الذي أُلقي في النار فكانت بردًا وسلامًا؟",
"إبراهيم عليه السلام", ["ابراهيم"]],["كم عدد الأنبياء المذكورين بأسمائهم في القرآن الكريم؟", "25 نبيًّا", ["25", "خمسة وعشرون", "خمس وعشرون", "خمسة وعشرين",
"خمس وعشرين"]],["ما اسم الكتاب الذي أنزله الله على داود عليه السلام؟", "الزبور", []],["ما اسم الكتاب الذي أنزله الله على عيسى عليه السلام؟", "الإنجيل",
[]],["ما اسم الملك الموكل بالوحي؟", "جبريل عليه السلام", ["جبريل", "جبرائيل", "جبرايل"]],["ما اسم الملك الموكل بالنفخ في الصور؟", "إسرافيل", []],["ما اسم الملك الموكل بالقطر (المطر)؟",
"ميكائيل", ["ميكال"]],["ما اسم خازن النار؟", "مالك", []],["ما اسم الملك الموكل بقبض الأرواح؟", "ملك الموت", ["عزرائيل"]],["كم عدد أبواب الجنة؟", "ثمانية",
["8", "ثمان", "ثماني"]],["ما اسم باب الجنة الخاص بالصائمين؟", "الريّان", []],["كم عدد ركعات صلاة الفجر (الفريضة)؟", "ركعتان", ["2", "ركعتين", "اثنين",
"اثنتين"]],["كم عدد ركعات صلاة المغرب؟", "ثلاث ركعات", ["3", "ثلاثة", "ثلاث"]],["كم عدد ركعات فريضة العشاء؟", "أربع ركعات", ["4", "اربعة", "اربع"]],["ما هي الصلاة التي لا ركوع فيها ولا سجود؟",
"صلاة الجنازة", ["الجنازة", "جنازة"]],["ما هو الشهر الذي فُرض فيه الصيام؟", "شهر رمضان", ["رمضان"]],["ما اسم الليلة التي هي خير من ألف شهر؟", "ليلة القدر",
["القدر"]],["ما هي الصلاة الوسطى على الراجح؟", "صلاة العصر", ["العصر"]],["كم عدد أشواط الطواف حول الكعبة؟", "سبعة أشواط", ["7", "سبع", "سبعة"]],["ما اسم المكان الذي يقف فيه الحجاج يوم التاسع من ذي الحجة؟",
"عرفة", ["عرفات", "جبل عرفة"]],["كم نصاب زكاة الذهب بالجرام؟", "85 جرامًا", ["85", "خمسة وثمانين", "خمس وثمانين"]],["كم نسبة زكاة المال؟", "ربع العشر (2.5%)",
["2.5", "ربع العشر", "اثنين ونص", "اثنين ونصف"]],["ما هو أول ما يُحاسب عليه العبد يوم القيامة من حقوق الله؟", "الصلاة", []],["كم عدد التكبيرات في صلاة الجنازة؟",
"أربع تكبيرات", ["4", "اربعة", "اربع"]],["ما هو أول مسجد وُضع في الأرض؟", "المسجد الحرام", ["الحرام", "الكعبة"]]];
var normAns = (s) => String(s).replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 1776)).replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 1632)).replace(/[\u0640\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, "").replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/ؤ/g, "و").replace(/ئ/g, "ي").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean).map((t) => t.length > 4 && t.startsWith("ال") ? t.slice(2) : t).join(" ");
var ACCEPT = QUESTIONS.map(([, shown, alts]) => [shown, ...alts || []].map(normAns).filter(Boolean));function isCorrect(qid, text) {const t = " " + normAns(text) + " ";
return (ACCEPT[qid] || []).some((a) => t.includes(" " + a + " "));} function mulberry32(a) {return function () {a |= 0;a = a + 1831565813 | 0;let t = Math.imul(a ^ a >>> 15, 1 | a);
t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;return ((t ^ t >>> 14) >>> 0) / 4294967296;};} function quizIdAt(k) {const N = QUESTIONS.length;const idx = [...Array(N).keys()];
const rnd = mulberry32(Math.floor(k / N) * 7919 + 12345);for (let i = N - 1; i > 0; i--) {const j = Math.floor(rnd() * (i + 1));[idx[i], idx[j]] = [idx[j],
idx[i]];} return idx[k % N];} async function quizDayFor(env, m, create) {const today = Math.floor(Date.UTC(m.y, m.m - 1, m.d) / 864e5);const read = () => env.DB.prepare("SELECT v FROM kv WHERE k='quiz_start'").first();
let row = await read();if (!row) {if (!create) return 0;await env.DB.prepare("INSERT OR IGNORE INTO kv(k, v) VALUES('quiz_start', ?)").bind(String(today)).run();
row = await read();} return Math.max(0, today - parseInt(row.v, 10));} function quizText(n, isChannel) {const qid = n % 1e3;const prev = Math.floor(n / 1e3) - 1;
const lines = ["🧠 سؤال اليوم", "", QUESTIONS[qid][0], ""];lines.push(isChannel ? "💬 اكتب إجابتك في التعليقات (المناقشة) تحت المنشور ده 👇" : "💬 جاوب بالرد على الرسالة دي 👇");
lines.push(`🏆 الإجابة الصح بـ ${arNum(QUIZ_POINTS)} نقاط، وأول واحد يجاوب صح بياخد ${arNum(QUIZ_FIRST_BONUS)} نقاط زيادة. وآخر الشهر بننزل ترتيب الأوائل.`);
if (prev >= 0 && QUESTIONS[prev]) lines.push("", `💡 إجابة سؤال أمس: ${QUESTIONS[prev][1]}`);return lines.join("\n");} var MEDALS = ["🥇", "🥈", "🥉"];
function boardText(rows, month, final) {const title = `🏆 ${final ? "ترتيب الأوائل" : "ترتيب المتصدرين حاليًا"} — ${MONTHS_AR[parseInt(month.slice(5, 7), 10) - 1]} ${arNum(month.slice(0, 4))}`;
const lines = rows.map((r, i) => `${MEDALS[i] || arNum(i + 1) + "."} ${r.name} — ${arNum(r.pts)} نقطة (${arNum(r.n)} إجابة صح)`);return [title, "", ...lines,
"", final ? "مبروك للفايزين وبالتوفيق للجميع، وسؤال جديد كل يوم 🤍" : "في سؤال جديد كل يوم، شارك وزوّد نقطك! 🧠"].join("\n");} async function standings(env, chatId, month, limit) {return (await env.DB.prepare("SELECT MAX(name) AS name, SUM(points) AS pts, COUNT(*) AS n FROM scores WHERE chat_id=? AND month=? GROUP BY user_id ORDER BY pts DESC, n DESC, MIN(ts) ASC LIMIT ?").bind(chatId, month, limit).all()).results;
} async function leaderboardMessages(env, chatId, month) {const rows = await standings(env, chatId, month, LEADERBOARD_TOP);return rows.length ? [boardText(rows, month, true)] : null;
} async function recordThread(m, env) {const fo = m.forward_origin;const chId = fo && fo.chat ? fo.chat.id : m.forward_from_chat && m.forward_from_chat.id;
const chMsg = fo && fo.message_id ? fo.message_id : m.forward_from_message_id;if (!chId || !chMsg) return;await env.DB.prepare("INSERT OR REPLACE INTO threads(group_id, group_msg_id, channel_id, channel_msg_id, created) VALUES(?,?,?,?,?)").bind(m.chat.id, m.message_id, chId, chMsg, Math.floor(Date.now() / 1e3)).run();
}
async function findQuizPost(m, env) {const rep = m.reply_to_message;const getPost = (chat, msg) => env.DB.prepare("SELECT chat_id, message_id, qid, qkey, created FROM quiz_posts WHERE chat_id=? AND message_id=?").bind(chat, msg).first();
if (rep) {let p = await getPost(m.chat.id, rep.message_id);if (p) return p;if (rep.is_automatic_forward) {const fo = rep.forward_origin;const chId = fo && fo.chat ? fo.chat.id : rep.forward_from_chat && rep.forward_from_chat.id;
const chMsg = fo && fo.message_id ? fo.message_id : rep.forward_from_message_id;if (chId && chMsg) {p = await getPost(chId, chMsg);if (p) return p;}}}
const rootId = m.message_thread_id || rep && rep.message_thread_id;if (rootId) {const t = await env.DB.prepare("SELECT channel_id, channel_msg_id FROM threads WHERE group_id=? AND group_msg_id=?").bind(m.chat.id, rootId).first();
if (t) return getPost(t.channel_id, t.channel_msg_id);} return null;} async function handleAnswer(m, env) {const u = m.from;if (!u || u.is_bot || u.id === 777e3 || u.id === 1087968824) return;
if (!m.text || m.text.length > QUIZ_MAX_ANSWER_LEN) return;if (!m.reply_to_message && !m.message_thread_id) return;const post = await findQuizPost(m, env);
if (!post) return;if (Date.now() / 1e3 - post.created > QUIZ_WINDOW_H * 3600) return;if (!isCorrect(post.qid, m.text)) return;const done = await env.DB.prepare("SELECT 1 AS x FROM scores WHERE chat_id=? AND user_id=? AND qkey=?").bind(post.chat_id, u.id, post.qkey).first();
if (done) return;const cnt = await env.DB.prepare("SELECT COUNT(*) AS c FROM scores WHERE chat_id=? AND qkey=?").bind(post.chat_id, post.qkey).first();
const first = !cnt || !cnt.c;const pts = QUIZ_POINTS + (first ? QUIZ_FIRST_BONUS : 0);const name = ([u.first_name, u.last_name].filter(Boolean).join(" ") || u.username || "مشارك").slice(0, 30);
const t = meccaNow(Date.now());const r = await env.DB.prepare("INSERT OR IGNORE INTO scores(chat_id, user_id, qkey, name, points, month, ts) VALUES(?,?,?,?,?,?,?)").bind(post.chat_id, u.id, post.qkey, name, pts, monthKey(t), Math.floor(Date.now() / 1e3)).run();
if (!r.meta || !r.meta.changes) return;await send(env, m.chat.id, `✅ إجابة صحيحة يا ${name}! +${arNum(pts)} نقطة${first ? "\n🥇 وأنت أول واحد يجاوب صح، بونص زيادة!" : ""}`, { reply_parameters: { message_id: m.message_id,
allow_sending_without_reply: true } });} async function cmdTop(m, env) {let chatId = m.chat.id;const ch = await env.DB.prepare("SELECT chat_id FROM subs WHERE linked=? LIMIT 1").bind(chatId).first();
if (ch) chatId = ch.chat_id;const month = monthKey(meccaNow(Date.now()));const rows = await standings(env, chatId, month, LEADERBOARD_TOP);if (!rows.length) return send(env, m.chat.id, "لسه مفيش حد جاوب صح الشهر ده. كن أول واحد! 🧠");
return send(env, m.chat.id, boardText(rows, month, false));} async function textFor(env, kind, n) {if (kind === "quran") return fetchQuranPage(env, n);
if (kind === "tomorrow") return [tomorrowText(n)];return kind === "istighfar" ? [istighfarText(n)] : azkarText(kind);} var schemaReady = false;async function ensureSchema(env) {if (schemaReady) return;
await env.DB.batch([env.DB.prepare("CREATE TABLE IF NOT EXISTS subs (id INTEGER PRIMARY KEY AUTOINCREMENT, chat_id INTEGER UNIQUE, type TEXT, created INTEGER)"),
env.DB.prepare("CREATE TABLE IF NOT EXISTS jobs (key TEXT PRIMARY KEY, kind TEXT, n INTEGER, cursor INTEGER DEFAULT 0, done INTEGER DEFAULT 0, created INTEGER)"),
env.DB.prepare("CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT)"),env.DB.prepare("CREATE TABLE IF NOT EXISTS quiz_posts (chat_id INTEGER, message_id INTEGER, qid INTEGER, qkey TEXT, created INTEGER, PRIMARY KEY(chat_id, message_id))"),
env.DB.prepare("CREATE TABLE IF NOT EXISTS threads (group_id INTEGER, group_msg_id INTEGER, channel_id INTEGER, channel_msg_id INTEGER, created INTEGER, PRIMARY KEY(group_id, group_msg_id))"),
env.DB.prepare("CREATE TABLE IF NOT EXISTS scores (chat_id INTEGER, user_id INTEGER, qkey TEXT, name TEXT, points INTEGER, month TEXT, ts INTEGER, PRIMARY KEY(chat_id, user_id, qkey))"),
env.DB.prepare("CREATE TABLE IF NOT EXISTS quran_pages (page INTEGER PRIMARY KEY, data TEXT)"),env.DB.prepare("CREATE TABLE IF NOT EXISTS custom_azkar (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, text TEXT, created INTEGER)"),
env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_scores_month ON scores(chat_id, month)")]);const cols = (await env.DB.prepare("PRAGMA table_info(subs)").all()).results.map((c) => c.name);
for (const [name, type] of [["title", "TEXT"], ["username", "TEXT"], ["linked", "INTEGER"]]) {if (!cols.includes(name)) await env.DB.prepare(`ALTER TABLE subs ADD COLUMN ${name} ${type}`).run();
} schemaReady = true;}
async function isSubscribed(env, chatId) {return !!await env.DB.prepare("SELECT id FROM subs WHERE chat_id=?").bind(chatId).first();
} async function subscribe(env, chat) {const title = chat.title || [chat.first_name, chat.last_name].filter(Boolean).join(" ") || null;const linked = chat.linked_chat_id === void 0 ? null : chat.linked_chat_id;
await env.DB.prepare("INSERT INTO subs(chat_id, type, created, title, username, linked) VALUES(?,?,?,?,?,?) ON CONFLICT(chat_id) DO UPDATE SET title=COALESCE(excluded.title, subs.title), username=COALESCE(excluded.username, subs.username), linked=COALESCE(excluded.linked, subs.linked)").bind(chat.id, chat.type, Math.floor(Date.now() / 1e3), title, chat.username || null, linked).run();
} async function unsubscribe(env, chatId) {await env.DB.prepare("DELETE FROM subs WHERE chat_id=?").bind(chatId).run();} async function processJob(env, job) {const special = job.kind === "quiz" || job.kind === "leaderboard";
let texts = null;if (!special) {try {texts = await textFor(env, job.kind, job.n);} catch (e) {console.error("text error:", e);if (Date.now() / 1e3 - job.created > QURAN_GIVEUP_MIN * 60) {await env.DB.prepare("UPDATE jobs SET done=1 WHERE key=?").bind(job.key).run();
} return;}} const batch = Math.max(1, Math.floor(BATCH / (texts ? texts.length : 2)));const rows = (await env.DB.prepare("SELECT id, chat_id, type FROM subs WHERE id > ? ORDER BY id LIMIT ?").bind(job.cursor, batch).all()).results;
const month = job.key.slice(0, 7);const dateKey = job.key.slice(0, 10);const posts = [];for (const r of rows) {let msgs = texts;if (job.kind === "quiz") msgs = [quizText(job.n, r.type === "channel")];
else if (job.kind === "leaderboard") {msgs = await leaderboardMessages(env, r.chat_id, month);if (!msgs) continue;} for (const text of msgs) {const res = await send(env, r.chat_id, text);
if (!res.ok) {if (/blocked|chat not found|kicked|deactivated|not a member|forbidden|no rights|not enough rights/i.test(String(res.description))) {await unsubscribe(env, r.chat_id);
} break;} if (job.kind === "quiz") {posts.push(env.DB.prepare("INSERT OR REPLACE INTO quiz_posts(chat_id, message_id, qid, qkey, created) VALUES(?,?,?,?,?)").bind(r.chat_id, res.result.message_id, job.n % 1e3, dateKey, Math.floor(Date.now() / 1e3)));
}}} if (posts.length) await env.DB.batch(posts);const finished = rows.length < batch;const cursor = rows.length ? rows[rows.length - 1].id : job.cursor;
await env.DB.prepare("UPDATE jobs SET cursor=?, done=? WHERE key=?").bind(cursor, finished ? 1 : 0, job.key).run();if (finished && job.kind === "quran") {await env.DB.prepare("UPDATE kv SET v=? WHERE k='quran_page' AND v=?").bind(String(job.n % QURAN_PAGES + 1), String(job.n)).run();
}} async function tick(env) {await ensureSchema(env);const now = Date.now();const m = meccaNow(now);const dateKey = `${m.y}-${String(m.m).padStart(2, "0")}-${String(m.d).padStart(2, "0")}`;
const { events } = schedule(m.y, m.m, m.d);const due = events.filter((e) => m.minutes >= e.at && m.minutes < e.at + CATCHUP_MIN);if (due.length) {for (const e of due) {if (e.kind === "quran") e.n = await quranPageFor(env, m, true);
if (e.kind === "tomorrow") e.n = Math.floor(Date.UTC(m.y, m.m - 1, m.d) / 864e5) + 1;if (e.kind === "quiz") {const k = await quizDayFor(env, m, true);
e.n = quizIdAt(k) + 1e3 * (k > 0 ? quizIdAt(k - 1) + 1 : 0);}} await env.DB.batch(due.map((e) => env.DB.prepare("INSERT OR IGNORE INTO jobs(key, kind, n, created) VALUES(?,?,?,?)").bind(`${dateKey}:${e.id}`, e.kind, e.n || 0, Math.floor(now / 1e3))));
await env.DB.prepare("DELETE FROM jobs WHERE created < ?").bind(Math.floor(now / 1e3) - 3 * 86400).run();await env.DB.prepare("DELETE FROM quiz_posts WHERE created < ?").bind(Math.floor(now / 1e3) - 7 * 86400).run();
await env.DB.prepare("DELETE FROM threads WHERE created < ?").bind(Math.floor(now / 1e3) - 7 * 86400).run();} const job = await env.DB.prepare("SELECT key, kind, n, cursor, created FROM jobs WHERE done=0 ORDER BY created LIMIT 1").first();
if (job) await processJob(env, job);else await fillQuranLibrary(env, 10);}
async function isGroupAdmin(m, env) {if (m.sender_chat && m.sender_chat.id === m.chat.id) return true;
const r = await tg(env, "getChatMember", { chat_id: m.chat.id, user_id: m.from.id });return !!(r.ok && ["creator", "administrator"].includes(r.result.status));
} var botId = null;async function getBotId(env) {if (!botId) {const me = await tg(env, "getMe");botId = me.ok ? me.result.id : null;} return botId;} function parseChannelRef(arg) {const t = (arg || "").trim();
let r = /^(?:https?:\/\/)?t\.me\/([A-Za-z]\w{3,})\/?$/i.exec(t);if (r) return "@" + r[1];r = /^@?([A-Za-z]\w{3,})$/.exec(t);if (r) return "@" + r[1];if (/^-100\d{5,}$/.test(t)) return t;
return null;} async function resolveChannel(m, env, arg) {const reply = (text) => send(env, m.chat.id, text);const ref = parseChannelRef(arg);if (!ref) {await reply("اكتب الأمر كده:\n/addchannel @يوزر_القناة\nأو الصق رابط القناة العام.");
return null;} const info = await tg(env, "getChat", { chat_id: ref });if (!info.ok || info.result.type !== "channel") {await reply("مش لاقي قناة بالاسم ده. اتأكد من اليوزر (القنوات العامة بس بيوزر، والخاصة تكتب رقمها اللي بيبدأ بـ -100).");
return null;} const ch = info.result;const bm = await tg(env, "getChatMember", { chat_id: ch.id, user_id: await getBotId(env) });if (!bm.ok || bm.result.status !== "administrator" || bm.result.can_post_messages === false) {await reply("لازم تضيف البوت **أدمن** في القناة وتديله صلاحية «نشر الرسائل»، وبعدين جرّب الأمر تاني.".replace(/\*\*/g, ""));
return null;} const um = await tg(env, "getChatMember", { chat_id: ch.id, user_id: m.from.id });if (!um.ok || !["creator", "administrator"].includes(um.result.status)) {await reply("لازم تكون أدمن في القناة دي عشان تضيفها. 🔒");
return null;} return ch;} async function cmdAddChannel(m, env, arg) {if (m.chat.type !== "private") return send(env, m.chat.id, "اكتب الأمر ده في الخاص مع البوت. 🔒");
const ch = await resolveChannel(m, env, arg);if (!ch) return;const was = await isSubscribed(env, ch.id);await subscribe(env, { id: ch.id, type: "channel",
title: ch.title, username: ch.username, linked_chat_id: ch.linked_chat_id || 0 });if (was) return send(env, m.chat.id, `القناة «${ch.title}» مضافة بالفعل ✅` + await discussionNote(env, ch));
const t = await send(env, ch.id, "✅ تم تفعيل صفحة القرآن اليومية وتذكيرات الاستغفار وأذكار الصباح والمساء في القناة. 🤍");if (!t.ok) {await unsubscribe(env, ch.id);
return send(env, m.chat.id, `تعذّر النشر في القناة: ${t.description}`);} return send(env, m.chat.id, `✅ تمت إضافة القناة «${ch.title}». الأذكار والتذكيرات وسؤال اليوم هتنزل فيها في مواعيدها.` + await discussionNote(env, ch));
} async function cmdRemoveChannel(m, env, arg) {if (m.chat.type !== "private") return send(env, m.chat.id, "اكتب الأمر ده في الخاص مع البوت. 🔒");const ch = await resolveChannel(m, env, arg);
if (!ch) return;await unsubscribe(env, ch.id);return send(env, m.chat.id, `تم إيقاف التذكيرات في القناة «${ch.title}». 🤍`);} var HELP = "أهلاً بيك! 🤍\nالبوت ده بيبعتلك صفحة من القرآن كل يوم بعد الفجر، وبيفكرك بالاستغفار 5 مرات في اليوم من الفجر لحد العشاء، وبيبعتلك أذكار الصباح وأذكار المساء، بتوقيت القاهرة.\n\n/start — تفعيل التذكيرات\n/stop — إيقاف التذكيرات\n/times — مواعيد النهارده\n/quran — صفحة القرآن بتاعة النهارده\n/test — رسالة تجريبية دلوقتي\n/top — ترتيب المتصدرين للشهر ده\n/menu — قايمة الأزرار (الورد والأذكار والأدعية)\n\n🧠 كل يوم بينزل سؤال ديني، جاوب عليه في التعليقات (المناقشة) أو بالرد على الرسالة، وكل إجابة صح ليها نقط، وآخر الشهر بينزل ترتيب الأوائل.\n\nللقنوات (اكتب الأوامر دي هنا في الخاص، وأنت أدمن في القناة والبوت أدمن فيها بصلاحية النشر):\n/addchannel @يوزر_القناة\n/removechannel @يوزر_القناة";
async function onCommand(name, m, env, arg = "") {const chat = m.chat;const isGroup = chat.type === "group" || chat.type === "supergroup";const needsAdmin = isGroup && (name === "start" || name === "stop");
if (needsAdmin && !await isGroupAdmin(m, env)) {return send(env, chat.id, "الأمر ده للأدمنز بس. 🔒");} switch (name) {case "start": {const was = await isSubscribed(env, chat.id);
await subscribe(env, chat);return send(env, chat.id, (was ? "التذكيرات شغالة بالفعل ✅\n\n" : "✅ تم تفعيل التذكيرات.\n\n") + HELP + "\n\n" + timesText(), { reply_markup: MAIN_MENU });
} case "stop": await unsubscribe(env, chat.id);return send(env, chat.id, "تم إيقاف التذكيرات. اكتب /start لو حبيت ترجعها. 🤍");case "times": return send(env, chat.id, timesText());
case "test": return send(env, chat.id, istighfarText(1));case "quran": {try {const want = parseInt(normDigits(arg), 10);const page = want >= 1 && want <= QURAN_PAGES ? want : await quranPageFor(env, meccaNow(Date.now()), true);
for (const t of await fetchQuranPage(env, page)) await send(env, chat.id, t);} catch (e) {console.error("quran cmd error:", e);return send(env, chat.id, "مقدرتش أجيب الصفحة دلوقتي، جرّب تاني بعد شوية.");
} return;} case "top": return cmdTop(m, env);case "setpage": return cmdSetPage(m, env, arg);case "quranstatus": return cmdQuranStatus(m, env);case "skip": return cmdMoveQuran(m, env, arg, 1);
case "back": return cmdMoveQuran(m, env, arg, -1);case "addzikr": return cmdAddZikr(m, env, arg);case "cancel": return cmdCancel(m, env);case "delzikr": return cmdDelZikr(m, env, arg);
case "channels": return cmdChannels(m, env);case "addchannel": return cmdAddChannel(m, env, arg);case "removechannel": return cmdRemoveChannel(m, env, arg);
case "menu": case "azkar": return sendMenu(env, chat.id);case "help": return send(env, chat.id, HELP, { reply_markup: MAIN_MENU });}} async function cmdSetPage(m, env, arg) {if (m.chat.type !== "private") return send(env, m.chat.id, "اكتب الأمر ده في الخاص مع البوت. 🔒");
if (!await isOwner(m, env)) return send(env, m.chat.id, "الأمر ده للمشرف بس. 🔒");const n = parseInt(String(arg).replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 1632)), 10);
if (!Number.isInteger(n) || n < 1 || n > QURAN_PAGES) {return send(env, m.chat.id, `اكتب الأمر كده:
/setpage 2
(رقم من 1 لـ ${QURAN_PAGES}، وده رقم الصفحة اللي هتتبعت في الورد الجاي)`);
} await env.DB.prepare("INSERT OR REPLACE INTO kv(k, v) VALUES('quran_page', ?)").bind(String(n)).run();const live = await syncTodayQuranJob(env, n);const tt = meccaNow(Date.now());
const hasToday = await env.DB.prepare("SELECT 1 AS x FROM jobs WHERE key=?").bind(`${tt.y}-${String(tt.m).padStart(2, "0")}-${String(tt.d).padStart(2, "0")}:quran`).first();
const note = !live && hasToday ? QURAN_SENT_NOTE + n : "";return send(env, m.chat.id, `✅ تمام. الورد الجاي صفحة ${n}، ولما يتبعت البوت ينقل لوحده للصفحة اللي بعدها. 📖` + note);
} async function isOwner(m, env) {if (!m.from) return false;const row = await env.DB.prepare("SELECT v FROM kv WHERE k='owner_id'").first();if (row) return String(m.from.id) === row.v;
if ((m.from.username || "").toLowerCase() === OWNER_USERNAME.toLowerCase()) {await env.DB.prepare("INSERT OR IGNORE INTO kv(k, v) VALUES('owner_id', ?)").bind(String(m.from.id)).run();
return true;} return false;}
async function cmdChannels(m, env) {if (m.chat.type !== "private") return send(env, m.chat.id, "اكتب الأمر ده في الخاص مع البوت. 🔒");
if (!await isOwner(m, env)) return send(env, m.chat.id, "الأمر ده للمشرف بس. 🔒");const missing = (await env.DB.prepare("SELECT chat_id FROM subs WHERE type='channel' AND (title IS NULL OR linked IS NULL) LIMIT 20").all()).results;
for (const r of missing) {const info = await tg(env, "getChat", { chat_id: r.chat_id });if (info.ok) {await env.DB.prepare("UPDATE subs SET title=?, username=?, linked=? WHERE chat_id=?").bind(info.result.title || null, info.result.username || null, info.result.linked_chat_id || 0, r.chat_id).run();
} else {await env.DB.prepare("UPDATE subs SET title=COALESCE(title, '(القناة مش متاحة للبوت)'), linked=COALESCE(linked, 0) WHERE chat_id=?").bind(r.chat_id).run();
}} const counts = (await env.DB.prepare("SELECT type, COUNT(*) AS c FROM subs GROUP BY type").all()).results;const by = Object.fromEntries(counts.map((r) => [r.type,
r.c]));const groups = (by.group || 0) + (by.supergroup || 0);const chans = (await env.DB.prepare("SELECT chat_id, title, username, linked FROM subs WHERE type='channel' ORDER BY id").all()).results;
const head = `📊 المشتركين في البوت
📢 قنوات: ${chans.length}
👥 جروبات: ${groups}
👤 خاص: ${by.private || 0}` + (chans.length ? "\n\n📢 القنوات:" : "");
if (!chans.length) return send(env, m.chat.id, head);const lines = chans.map((c, i) => `${i + 1}. ${c.title || "—"}${c.username ? ` (@${c.username})` : ""}
   🆔 ${c.chat_id}
   💬 ${c.linked ? "المناقشة مربوطة ✅" : "مفيش مناقشة مربوطة ⚠️"}`);
const chunks = [];let cur = head;for (const l of lines) {if (cur.length + l.length + 2 > 3800) {chunks.push(cur);cur = "";} cur += (cur ? "\n\n" : "") + l;
} chunks.push(cur);for (const c of chunks) await send(env, m.chat.id, c);if (missing.length === 20) await send(env, m.chat.id, "فيه قنوات تانية لسه بتتحدّث بياناتها، اكتب /channels تاني.");
} async function discussionNote(env, ch) {const g = ch.linked_chat_id;if (!g) return "\n\n⚠️ القناة مفيهاش جروب مناقشة مربوط. سؤال اليوم بيتجاوب عليه في التعليقات، فاربط جروب من إعدادات القناة ← المناقشة.";
const bm = await tg(env, "getChatMember", { chat_id: g, user_id: await getBotId(env) });if (!bm.ok || ["left", "kicked"].includes(bm.result.status)) {return "\n\n⚠️ ضيف البوت في جروب المناقشة وخليه أدمن، عشان يشوف الإجابات ويحسب النقط. 🧠";
} if (!["administrator", "creator"].includes(bm.result.status)) {return "\n\n⚠️ البوت في جروب المناقشة بس مش أدمن. خليه أدمن عشان يشوف كل التعليقات ويحسب النقط. 🧠";
} return "\n\n🧠 جروب المناقشة جاهز لسؤال اليوم ✅";} async function onMessage(m, env) {if (m.is_automatic_forward) return recordThread(m, env);if (!m.text) return;
const cmd = /^\/(\w+)(?:@(\w+))?(?:\s|$)/.exec(m.text);if (!cmd) {if (m.chat.type === "private" && await ownerTextAction(m, env)) return;return handleAnswer(m, env);
} if (cmd[2]) {const me = await tg(env, "getMe");if (!me.ok || me.result.username.toLowerCase() !== cmd[2].toLowerCase()) return;} const arg = m.text.replace(/^\/\w+(?:@\w+)?\s*/, "");
return onCommand(cmd[1].toLowerCase(), m, env, arg);} async function handleUpdate(u, env) {await ensureSchema(env);if (u.message) return onMessage(u.message, env);
if (u.callback_query) return onCallback(u.callback_query, env);if (u.my_chat_member) {const st = u.my_chat_member.new_chat_member.status;if (st === "left" || st === "kicked") return unsubscribe(env, u.my_chat_member.chat.id);
}}
var index_default = { async fetch(request, env, ctx) {const url = new URL(request.url);if (url.pathname === "/setup") {if (!env.WEBHOOK_SECRET || url.searchParams.get("key") !== env.WEBHOOK_SECRET) {return new Response("forbidden", { status: 403 });
} await ensureSchema(env);const res = await tg(env, "setWebhook", { url: `${url.origin}/webhook`, secret_token: env.WEBHOOK_SECRET, allowed_updates: ["message",
"my_chat_member", "callback_query"], drop_pending_updates: true });return new Response(JSON.stringify(res, null, 2), { headers: { "content-type": "application/json" } });
} if (url.pathname === "/webhook" && request.method === "POST") {if (request.headers.get("X-Telegram-Bot-Api-Secret-Token") !== env.WEBHOOK_SECRET) {return new Response("forbidden", { status: 403 });
} const update = await request.json();ctx.waitUntil(handleUpdate(update, env).catch((e) => console.error("handler error:", e)));return new Response("ok");
} return new Response("Azkar bot is running 🤍");}, async scheduled(event, env, ctx) {ctx.waitUntil(tick(env).catch((e) => console.error("tick error:", e)));
} };var sendMenu = (env, chatId) => send(env, chatId, MENU_TEXT, { reply_markup: MAIN_MENU });async function editOrSend(env, msg, text, reply_markup) {const r = await tg(env, "editMessageText", { chat_id: msg.chat.id,
message_id: msg.message_id, text, reply_markup });if (!r.ok && !/not modified/i.test(String(r.description))) await send(env, msg.chat.id, text, { reply_markup });
} async function sendQuranToday(env, chatId) {try {const page = await quranPageFor(env, meccaNow(Date.now()), true);for (const t of await fetchQuranPage(env, page)) await send(env, chatId, t);
} catch (e) {console.error("quran button error:", e);await send(env, chatId, "مقدرتش أجيب الصفحة دلوقتي، جرّب تاني بعد شوية.");}} async function onCallback(q, env) {await tg(env, "answerCallbackQuery", { callback_query_id: q.id });
const msg = q.message;const data = q.data || "";if (!msg || !msg.chat) return;const chatId = msg.chat.id;if (data === "menu") return sendMenu(env, chatId);
if (data === "q") return sendQuranToday(env, chatId);if (data === "az:morning" || data === "az:evening") {for (const part of azkarText(data.slice(3))) {const r = await send(env, chatId, part);
if (!r.ok) break;} return;} if (data === "d") return send(env, chatId, DUA_LIST_TEXT, { reply_markup: duaListMarkup() });if (data === "dl") return editOrSend(env, msg, DUA_LIST_TEXT, duaListMarkup());
if (data === "c") {const v = customListView(await listCustomAzkar(env));return send(env, chatId, v.text, { reply_markup: v.markup });} if (data === "cl") {const v = customListView(await listCustomAzkar(env));
return editOrSend(env, msg, v.text, v.markup);} const cm = /^c:(\d+)$/.exec(data);if (cm) {const r = (await listCustomAzkar(env)).find((x) => x.id === Number(cm[1]));
return editOrSend(env, msg, r ? customText(r) : "الذكر ده اتمسح.", customBackMarkup());} const xm = /^x:(\d+)$/.exec(data);if (xm) {if (!await isOwner({ from: q.from }, env)) return;
await deleteCustomZikr(env, Number(xm[1]));const v = customDeleteView(await listCustomAzkar(env));return editOrSend(env, msg, v.text, v.markup);} const mm = /^d:(\d+)$/.exec(data);
if (mm && DUAS[Number(mm[1])]) return editOrSend(env, msg, duaText(DUAS[Number(mm[1])]), duaBackMarkup());} async function cmdQuranStatus(m, env) {if (!await isOwner(m, env)) return send(env, m.chat.id, "الأمر ده للمشرف بس. 🔒");
await fillQuranLibrary(env, 15);const s = await quranLibraryStatus(env);const ok = s.pages === QURAN_PAGES && s.ayahs === QURAN_TOTAL_AYAHS;return send(env, m.chat.id, `📚 مكتبة القرآن: ${s.pages}/${QURAN_PAGES} صفحة، ${s.ayahs}/${QURAN_TOTAL_AYAHS} آية
` + (ok ? "✅ المكتبة كاملة والعدد مطابق، والبوت مبقاش محتاج الإنترنت لصفحات القرآن." : "⏳ لسه بتتحمّل تلقائي كل دقيقة. اكتب /quranstatus تاني عشان تشوف التقدم."));
} var normDigits = (t) => String(t || "").replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 1632)).replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 1776));
var OWNER_ONLY = "الأمر ده للمشرف بس. 🔒";var PRIVATE_ONLY = "اكتب الأمر ده في الخاص مع البوت. 🔒";
async function cmdMoveQuran(m, env, arg, dir) {if (!await isOwner(m, env)) return send(env, m.chat.id, OWNER_ONLY);
const k = Math.max(1, Math.min(QURAN_PAGES - 1, parseInt(normDigits(arg), 10) || 1));const cur = await quranPending(env, meccaNow(Date.now()), true);const next = ((cur - 1 + dir * k) % QURAN_PAGES + QURAN_PAGES) % QURAN_PAGES + 1;
await env.DB.prepare("INSERT OR REPLACE INTO kv(k, v) VALUES('quran_page', ?)").bind(String(next)).run();const live = await syncTodayQuranJob(env, next);
const tt = meccaNow(Date.now());const hasToday = await env.DB.prepare("SELECT 1 AS x FROM jobs WHERE key=?").bind(`${tt.y}-${String(tt.m).padStart(2, "0")}-${String(tt.d).padStart(2, "0")}:quran`).first();
const note = !live && hasToday ? QURAN_SENT_NOTE + next : "";return send(env, m.chat.id, `✅ ${dir > 0 ? "تخطّيت" : "رجّعت"} ${k} صفحة. الورد الجاي: صفحة ${next}. 📖` + note);
} var cleanTitle = (t) => {const x = String(t || "").split("\n")[0].replace(/\s+/g, " ").trim();return x.length > 40 ? x.slice(0, 40).trimEnd() + "…" : x;
};var setAwait = (env, uid, obj) => env.DB.prepare("INSERT OR REPLACE INTO kv(k, v) VALUES(?, ?)").bind(`await_add:${uid}`, JSON.stringify({ ...obj, t: Math.floor(Date.now() / 1e3) })).run();
var CANCEL_HINT = "\n(للإلغاء اكتب: الغاء)";async function addZikrFlow(m, env, nameArg) {const name = cleanTitle(nameArg);if (!name) {await setAwait(env, m.from.id, { s: "title" });
return send(env, m.chat.id, "✍️ ده ذكر إيه؟ اكتب اسمه (هو اللي هيظهر على الزر)، مثلًا: دعاء الاستخارة" + CANCEL_HINT);} await setAwait(env, m.from.id, { s: "text",
title: name });return send(env, m.chat.id, `👍 تمام، «${name}».
دلوقتي ابعت نص الذكر في رسالة واحدة. ✍️` + CANCEL_HINT);} async function cmdAddZikr(m, env, arg) {if (m.chat.type !== "private") return send(env, m.chat.id, PRIVATE_ONLY);
if (!await isOwner(m, env)) return send(env, m.chat.id, OWNER_ONLY);return addZikrFlow(m, env, arg);} async function delZikrFlow(m, env, arg) {const rows = await listCustomAzkar(env);
if (!rows.length) return send(env, m.chat.id, "مفيش أذكار مضافة تتمسح.");const n = parseInt(normDigits(arg), 10);if (n >= 1 && n <= rows.length) {const r = rows[n - 1];
await deleteCustomZikr(env, r.id);return send(env, m.chat.id, `🗑 اتمسح الذكر «${r.title}».`);} const v = customDeleteView(rows);return send(env, m.chat.id, v.text, { reply_markup: v.markup });
} async function cmdDelZikr(m, env, arg) {if (m.chat.type !== "private") return send(env, m.chat.id, PRIVATE_ONLY);if (!await isOwner(m, env)) return send(env, m.chat.id, OWNER_ONLY);
return delZikrFlow(m, env, arg);} async function ownerTextAction(m, env) {const t = m.text || "";const add = /^\s*[اأإ]ضف\s+ذكر\s*/.exec(t);const del = /^\s*(?:امسح|مسح|احذف|حذف)\s+ذكر\s*/.exec(t);
if (add || del) {if (!await isOwner(m, env)) return false;if (add) await addZikrFlow(m, env, t.slice(add[0].length));else await delZikrFlow(m, env, t.slice(del[0].length));
return true;} if (!m.from) return false;const key = `await_add:${m.from.id}`;const row = await env.DB.prepare("SELECT v FROM kv WHERE k=?").bind(key).first();
if (!row) return false;await env.DB.prepare("DELETE FROM kv WHERE k=?").bind(key).run();let st = null;try {st = JSON.parse(row.v);} catch {} if (!st || Date.now() / 1e3 - st.t > 600) return false;
if (!await isOwner(m, env)) return false;if (/^\s*(?:الغاء|إلغاء|الغي|إلغي)\s*$/.test(t)) {await send(env, m.chat.id, "تم الإلغاء. ✅");return true;} if (st.s === "title") {await addZikrFlow(m, env, t);
return true;} if (st.s === "text") {const r = await addCustomZikr(env, t, st.title);if (r.ok) {await send(env, m.chat.id, `✅ اتضاف الذكر «${r.title}»
هتلاقيه في زر ⭐ الأذكار المضافة (اكتب /menu).`);
return true;} const why = { empty: "الذكر فاضي.", long: `الذكر طويل قوي (الحد ${CUSTOM_TEXT_MAX} حرف).`, max: `وصلت للحد الأقصى (${CUSTOM_MAX} ذكر). امسح ذكر الأول.`,
dup: "الذكر ده مضاف قبل كده." }[r.reason];if (r.reason === "long" || r.reason === "empty") await setAwait(env, m.from.id, { s: "text", title: st.title });
await send(env, m.chat.id, "⚠️ " + why + (r.reason === "long" || r.reason === "empty" ? "\nابعت نص تاني أو اكتب: الغاء" : ""));return true;} return false;
} async function cmdCancel(m, env) {if (m.from) await env.DB.prepare("DELETE FROM kv WHERE k=?").bind(`await_add:${m.from.id}`).run();return send(env, m.chat.id, "تم الإلغاء. ✅");
} var entry_default = index_default;export default entry_default;
