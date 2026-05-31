# FitPlan Admin

FitPlan Admin הוא לוח ניהול Hebrew-first ו-RTL עבור מאמנים ותזונאים. זהו דשבורד דמו שנבנה ב-Next.js + TypeScript + Tailwind, עם Mock Data כברירת מחדל ועם שכבת הכנה ל-API אמיתי בעתיד.

## מה יש במערכת

- דשבורד סקירה ראשי.
- ניהול משתמשים.
- ניהול תוכניות אימון ותזונה.
- ספריית תרגילים ומתכונים.
- מעקב התקדמות ואנליטיקות.
- התחברות דמו עם role-based UI.

## התקנה

```bash
npm install
```

## קובצי סביבה

העתיקו את [.env.example](.env.example) ל-`.env.local` ועדכנו ערכים לפי הצורך.

ברירת המחדל היא Mock, כך שהאפליקציה עובדת גם בלי Backend.

## הרצה מקומית

```bash
npm run dev
```

האפליקציה תרוץ בדרך כלל ב-[http://localhost:3000](http://localhost:3000).

## משתמשי דמו

- `admin@fitplan.co.il / 123456`
- `coach@fitplan.co.il / 123456`
- `nutritionist@fitplan.co.il / 123456`

## Role-Based UI

המערכת מציגה תפריטים ומסכים לפי התפקיד של המשתמש המחובר. זה כולל Sidebar, ניתוב, והרשאות תצוגה בסיסיות עבור Admin, Coach ו-Nutritionist.

## Mock Data

השירותים משתמשים ב-Mock Data כברירת מחדל. זה מאפשר לעבוד על ה-UI וה-UX בלי תלות בשרת אמיתי.

## USE_MOCK_API

- `USE_MOCK_API=true` - מצב ברירת מחדל. השירותים משתמשים ב-Mock Data.
- `USE_MOCK_API=false` - המערכת תתחיל לנסות להשתמש ב-API דרך `httpClient` עבור Users בלבד, בלי לשנות את המסכים.

## מעבר עתידי ל-API אמיתי

כדי לעבור לשרת אמיתי בעתיד, צריך:

1. להגדיר `NEXT_PUBLIC_USE_MOCK_API=false`.
2. להגדיר `NEXT_PUBLIC_API_BASE_URL` לכתובת ה-backend.
3. לספק endpoints שתואמים לחוזים תחת `src/contracts/`.
4. להחזיר response envelope אחיד עם `data`, `meta`, `error`.

## פקודות שימושיות

```bash
npm run lint
npm run build
```

## הערה טכנית

הפרויקט לא בנוי כ-Monorepo, לא Mobile, ולא מחובר עדיין ל-Backend אמיתי. המטרה כרגע היא לשמור על דשבורד יציב, מוכן להרחבה עתידית בלי לשבור את חוויית הדמו.
