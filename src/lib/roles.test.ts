import { describe, expect, it } from "vitest";
import { isAdmin, isRole } from "./roles";

describe("isAdmin", () => {
  it("is true only for the admin role", () => {
    expect(isAdmin({ role: "admin" })).toBe(true);
    expect(isAdmin({ role: "customer" })).toBe(false);
    expect(isAdmin({ role: "Admin" })).toBe(false);
  });

  it("is false when the role is missing", () => {
    expect(isAdmin({})).toBe(false);
    expect(isAdmin({ role: undefined })).toBe(false);
    expect(isAdmin({ role: null })).toBe(false);
  });
});

describe("isRole", () => {
  it("accepts the known roles only", () => {
    expect(isRole("customer")).toBe(true);
    expect(isRole("admin")).toBe(true);
    expect(isRole("owner")).toBe(false);
    expect(isRole(undefined)).toBe(false);
  });
});
