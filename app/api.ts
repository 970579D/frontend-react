const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

// Key used for the username in request bodies.
// Change to "user" if your backend expects { user, password }.
const USERNAME_FIELD = "username";

export interface ApiResponse<T> {
  status: "success" | "error";
  message: string;
  data: T | null;
}

export interface UserRecord {
  id: number;
  username: string;
  password: string;
  create_date: string;
  last_update: string;
}

export interface LoginRecord {
  id: number;
  username: string;
  login_date: string;
  logout_date: string | null;
  session: string;
}

export class ApiError extends Error {}

const MESSAGES: Record<string, string> = {
  "User already exists": "ชื่อผู้ใช้นี้ถูกใช้แล้ว",
  "Login already exists": "บัญชีนี้มีการเข้าสู่ระบบค้างอยู่แล้ว",
  "Login does not exist": "ไม่พบเซสชันนี้ในระบบ",
};

export const translate = (message: string): string => MESSAGES[message] ?? message;

async function request<T>(path: string, init: RequestInit): Promise<ApiResponse<T>> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init.headers },
    });
  } catch {
    throw new ApiError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ตรวจสอบว่า API ทำงานอยู่และอนุญาต CORS");
  }

  let body: Partial<ApiResponse<T>> | null = null;
  try {
    body = (await res.json()) as Partial<ApiResponse<T>> | null;
  } catch {
    /* handled below */
  }
  if (
    !body ||
    (body.status !== "success" && body.status !== "error") ||
    typeof body.message !== "string"
  ) {
    throw new ApiError(`เซิร์ฟเวอร์ตอบกลับผิดรูปแบบ (HTTP ${res.status})`);
  }
  return { status: body.status, message: body.message, data: body.data ?? null };
}

function unwrap<T>(res: ApiResponse<T>): T | null {
  if (res.status !== "success") throw new ApiError(translate(res.message));
  return res.data;
}

const credentials = (username: string, password: string) =>
  JSON.stringify({ [USERNAME_FIELD]: username, password });

/** POST /users */
export async function register(username: string, password: string): Promise<UserRecord> {
  const user = unwrap(
    await request<UserRecord>("/users", {
      method: "POST",
      body: credentials(username, password),
    })
  );
  if (!user) throw new ApiError("เซิร์ฟเวอร์ไม่ส่งข้อมูลผู้ใช้กลับมา");
  return user;
}

/** POST /login — the API returns the new login as a one-item array */
export async function login(username: string, password: string): Promise<LoginRecord> {
  const list = unwrap(
    await request<LoginRecord[]>("/login", {
      method: "POST",
      body: credentials(username, password),
    })
  );
  const first = list?.[0];
  if (!first?.session) throw new ApiError("เซิร์ฟเวอร์ไม่ส่งข้อมูลเซสชันกลับมา");
  return first;
}

/** PUT /login/logout?session=... */
export async function logout(session: string): Promise<void> {
  unwrap(
    await request<null>(`/login/logout?session=${encodeURIComponent(session)}`, {
      method: "PUT",
    })
  );
}
