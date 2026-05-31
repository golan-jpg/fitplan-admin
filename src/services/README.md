# Services Layer

השירותים הם שכבת הביניים בין hooks למסד הנתונים העתידי.

## איך זה עובד היום

- ברירת המחדל היא `USE_MOCK_API=true`.
- `src/services/usersService.ts` ממשיך להשתמש ב-Mock Data.
- `usersApiService.ts` קיים כהכנה ל-API אמיתי בלבד.
- שאר השירותים נשארים Mock-backed כמו קודם.

## איך עוברים ל-API אמיתי בעתיד

1. מגדירים `NEXT_PUBLIC_USE_MOCK_API=false`.
2. מגדירים `NEXT_PUBLIC_API_BASE_URL` לכתובת השרת.
3. מחליפים את Backend כך שיחזיר את פורמט ה-contracts.
4. בודקים שהשירותים מחזירים את אותו shape ל-hooks ולמסכים.

## מה Backend צריך לספק

- Endpoints תואמים ל-Users contract.
- Response envelope עקבי של `data`, `meta`, `error`.
- Error format אחיד עם `code` ו-`message`.
- תמיכה ב-query params של סינון, מיון ו-pagination לפי החוזה.

## למה מסכים לא צריכים לקרוא ל-fetch ישירות

- כדי לשמור על הפרדה בין UI לבין Data Transport.
- כדי שמעבר Mock -> API לא ידרוש שינוי במסכים.
- כדי לשמור על שפה אחת של טיפוסים, שגיאות והתנהגות בכל המערכת.
