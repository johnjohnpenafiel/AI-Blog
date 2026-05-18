import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { SettingsClient } from "@/components/dashboard/settings/settings-client";

const signOutMock = vi.fn();

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { email: "admin@example.com" } },
    status: "authenticated",
  }),
  signOut: (...args: unknown[]) => signOutMock(...args),
}));

function settingsResponse(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    publishing_mode: "approve_only",
    schedule_frequency: "twice_weekly",
    last_run_at: null,
    next_run_at: null,
    ...overrides,
  };
}

function jsonResponse(
  body: unknown,
  init: { status?: number } = {},
): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { "Content-Type": "application/json" },
  });
}

function installFetchMock(
  routes: Record<string, (req: { method: string; body: unknown }) => Response>,
) {
  const fetchMock = vi.fn(async (input: RequestInfo, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    const method = (init?.method ?? "GET").toUpperCase();
    const key = `${method} ${url}`;
    const handler = routes[key];
    if (!handler) {
      throw new Error(`Unhandled fetch in test: ${key}`);
    }
    let parsedBody: unknown = undefined;
    if (typeof init?.body === "string" && init.body.length > 0) {
      try {
        parsedBody = JSON.parse(init.body);
      } catch {
        parsedBody = init.body;
      }
    }
    return handler({ method, body: parsedBody });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  // ChamferedPanel measures via getBoundingClientRect.
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    x: 0,
    y: 0,
    width: 400,
    height: 200,
    top: 0,
    right: 400,
    bottom: 200,
    left: 0,
    toJSON() {},
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  signOutMock.mockReset();
});

describe("SettingsClient", () => {
  it("renders the current publishing mode with the correct radio checked", async () => {
    installFetchMock({
      "GET /api/settings": () => jsonResponse(settingsResponse()),
    });

    render(<SettingsClient />);

    const approveButton = await screen.findByTestId(
      "publishing-mode-approve_only",
    );
    expect(approveButton.getAttribute("aria-checked")).toBe("true");

    const autoButton = screen.getByTestId("publishing-mode-auto");
    expect(autoButton.getAttribute("aria-checked")).toBe("false");
  });

  it("toggling publishing mode calls PATCH and reflects the new value", async () => {
    const fetchMock = installFetchMock({
      "GET /api/settings": () => jsonResponse(settingsResponse()),
      "PATCH /api/settings": ({ body }) => {
        const payload = body as { publishing_mode?: string } | undefined;
        return jsonResponse(
          settingsResponse({
            publishing_mode: payload?.publishing_mode ?? "approve_only",
          }),
        );
      },
    });

    render(<SettingsClient />);
    const autoButton = await screen.findByTestId("publishing-mode-auto");
    fireEvent.click(autoButton);

    await waitFor(() => {
      expect(autoButton.getAttribute("aria-checked")).toBe("true");
    });

    const patchCalls = (fetchMock as unknown as Mock).mock.calls.filter(
      (c) =>
        (c[1] as RequestInit | undefined)?.method?.toUpperCase() === "PATCH",
    );
    expect(patchCalls).toHaveLength(1);
    expect(patchCalls[0][0]).toBe("/api/settings");
    const sent = JSON.parse(
      (patchCalls[0][1] as RequestInit).body as string,
    );
    expect(sent).toEqual({ publishing_mode: "auto" });
  });

  it("clicking trigger manual run calls POST /api/pipeline/run", async () => {
    const fetchMock = installFetchMock({
      "GET /api/settings": () => jsonResponse(settingsResponse()),
      "POST /api/pipeline/run": () =>
        jsonResponse({
          skipped: false,
          post_id: "00000000-0000-0000-0000-000000000001",
          slug: "test-slug",
          status: "published",
          publishing_mode: "auto",
          published_at: null,
        }),
    });

    render(<SettingsClient />);
    const trigger = await screen.findByTestId("trigger-pipeline-run");
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByTestId("pipeline-run-result")).toBeInTheDocument();
    });

    const postCalls = (fetchMock as unknown as Mock).mock.calls.filter(
      (c) =>
        (c[1] as RequestInit | undefined)?.method?.toUpperCase() === "POST" &&
        c[0] === "/api/pipeline/run",
    );
    expect(postCalls).toHaveLength(1);
  });

  it("clicking logout calls signOut with the login callbackUrl", async () => {
    installFetchMock({
      "GET /api/settings": () => jsonResponse(settingsResponse()),
    });

    render(<SettingsClient />);
    const logout = await screen.findByTestId("logout-button");
    fireEvent.click(logout);

    expect(signOutMock).toHaveBeenCalledWith({ callbackUrl: "/login" });
  });
});
