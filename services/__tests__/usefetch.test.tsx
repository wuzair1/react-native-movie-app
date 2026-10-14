import React from "react";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import useFetch from "../usefetch";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

describe("useFetch request lifecycle", () => {
  let renderer: ReactTestRenderer;
  let state: ReturnType<typeof useFetch<string>>;

  function mount(fetcher: () => Promise<string>) {
    function Harness() {
      state = useFetch(fetcher, false);
      return null;
    }
    act(() => { renderer = create(<Harness />); });
  }

  afterEach(() => { act(() => renderer.unmount()); });

  it("keeps the newer search result when requests finish out of order", async () => {
    const first = deferred<string>();
    const second = deferred<string>();
    mount(jest.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise));
    let oldRequest!: Promise<string | undefined>;
    let newRequest!: Promise<string | undefined>;
    act(() => { oldRequest = state.refetch(); });
    act(() => { newRequest = state.refetch(); });
    await act(async () => { second.resolve("new"); await newRequest; });
    await act(async () => { first.resolve("old"); expect(await oldRequest).toBeUndefined(); });
    expect(state.data).toBe("new");
    expect(state.loading).toBe(false);
  });

  it("does not repopulate a cleared search when its request finishes", async () => {
    const pending = deferred<string>();
    mount(() => pending.promise);
    let request!: Promise<string | undefined>;
    act(() => { request = state.refetch(); });
    act(() => { state.reset(); });
    await act(async () => { pending.resolve("old"); await request; });
    expect(state.data).toBeNull();
    expect(state.loading).toBe(false);
  });

  it("returns fresh results for tracking and surfaces network failures", async () => {
    mount(jest.fn().mockResolvedValueOnce("fresh").mockRejectedValueOnce(new Error("Offline")));
    await act(async () => { expect(await state.refetch()).toBe("fresh"); });
    await act(async () => { expect(await state.refetch()).toBeUndefined(); });
    expect(state.error?.message).toBe("Offline");
    expect(state.loading).toBe(false);
  });
});
