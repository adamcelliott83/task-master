import { loginSchema, registerSchema } from "@/schemas/auth";

describe("loginSchema", () => {
  it("validates valid credentials", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const validRegistration = {
    name: "John Doe",
    email: "john@example.com",
    password: "securePass123",
    confirmPassword: "securePass123",
  };

  it("validates a valid registration", () => {
    const result = registerSchema.safeParse(validRegistration);
    expect(result.success).toBe(true);
  });

  it("rejects name shorter than 2 characters", () => {
    const result = registerSchema.safeParse({ ...validRegistration, name: "J" });
    expect(result.success).toBe(false);
  });

  it("rejects password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      confirmPassword: "differentPassword",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten();
      expect(errors.fieldErrors.confirmPassword).toBeDefined();
    }
  });

  it("rejects invalid email format", () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });
});
