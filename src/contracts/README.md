# API Contracts (Future Backend Integration)

מטרת התיקיה היא להגדיר חוזה API אחיד וברור, כך שאפשר יהיה לעבור מ-Mock ל-Backend אמיתי בלי לשנות את המסכים.

## עקרונות

- המסכים מדברים רק עם hooks.
- hooks מדברים רק עם services.
- services עובדים מול contracts.
- כרגע services מחזירים Mock Data בלבד.

## API Conventions

- Base URL עתידי: `API_BASE_URL` מתוך [apiTypes.ts](apiTypes.ts)
- פורמט תגובה אחיד:

```ts
{
  data,
  meta,
  error
}
```

- פורמט שגיאה אחיד:

```ts
{
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
```

- Pagination:

```ts
{
  page,
  pageSize,
  totalItems,
  totalPages
}
```

- Sorting:

```ts
{
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}
```

- Filtering: טיפוסי filter מוגדרים בכל contract לפי הדומיין.

## איך service נראה היום

- service משתמש בטיפוסים מה-contracts.
- service מחזיר נתונים מתוך `mockData.ts`.
- אין fetch ואין קריאה חיצונית.

## איך service ייראה בעתיד

- שומרים את אותה חתימה פונקציונלית.
- מחליפים את גוף הפונקציה לקריאת fetch/HTTP אמיתית.
- ממפים את התגובה לפורמט המוגדר ב-contract.

דוגמה רעיונית:

```ts
export async function getUsers(params?: GetUsersRequest): Promise<GetUsersResponse["data"]> {
  const response = await fetch(`${API_BASE_URL}${USERS_ENDPOINTS.list}`);
  const payload = (await response.json()) as GetUsersResponse;

  if (payload.error) {
    throw new Error(payload.error.message);
  }

  return payload.data;
}
```

## מה אסור לעשות במסכים

- לא לבצע fetch ישיר מתוך מסך.
- לא להשתמש ב-endpoints או request types במסך.
- לא לגשת ל-mockData ישירות מתוך מסך.

## למה screens מדברים רק עם hooks

- שומר על UI נקי מלוגיקת Data Transport.
- מאפשר החלפה ל-Backend בלי שינוי ב-UI.
- מקל בדיקות ותחזוקה לאורך זמן.
