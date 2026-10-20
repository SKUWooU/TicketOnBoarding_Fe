import { useCallback, useEffect, useRef, useState } from "react";
import {
  getAdmissionPolicy,
  getAdmission,
  joinAdmission,
  leaveAdmission,
} from "../api/admissionApi";

const empty = (scope) => ({
  scope,
  status: "CHECKING",
  policy: null,
  data: null,
  deadline: 0,
});
const uuid = /^[a-f0-9-]{36}$/;

function checkedPolicy(policy) {
  if (policy?.enabled === false) return policy;
  if (
    policy?.enabled !== true ||
    typeof policy.generation !== "string" ||
    !Number.isFinite(Date.parse(policy.opensAt))
  )
    throw new Error("Invalid policy");
  const interval = policy.pollIntervalMillis ?? 5000;
  if (
    policy.pollIntervalMillis === null ||
    !Number.isSafeInteger(interval) ||
    interval < 1000 ||
    interval > 30000
  )
    throw new Error("Invalid polling interval");
  return {
    ...policy,
    pollIntervalMillis: interval,
  };
}

function checkedSnapshot(data, policy) {
  const snapshot = data?.admission;
  const remaining =
    Date.parse(snapshot?.expiresAt) - Date.parse(data?.serverNow);
  if (
    data?.generation !== policy.generation ||
    !uuid.test(snapshot?.queueEntryId) ||
    !["WAITING", "ADMITTED", "LEFT", "EXPIRED"].includes(snapshot?.state) ||
    !Number.isFinite(remaining) ||
    (snapshot.state === "ADMITTED" && !uuid.test(snapshot.token)) ||
    (snapshot.state === "WAITING" &&
      (!Number.isInteger(snapshot.position) || snapshot.position < 1))
  ) {
    throw new Error("Invalid admission response");
  }
  return {
    status: snapshot.state,
    data,
    deadline: performance.now() + Math.max(0, remaining),
  };
}

function failure(error) {
  if (error?.response?.status === 401)
    return {
      status: "AUTH_REQUIRED",
      message: "로그인 후 대기 등록할 수 있습니다.",
    };
  if (error?.response?.status === 429)
    return {
      status: "FULL",
      message: "대기실이 가득 찼습니다. 잠시 후 다시 등록해 주세요.",
    };
  return {
    status: "ERROR",
    message:
      "입장 상태를 확인하지 못했습니다. 다시 확인하기 전에는 새 좌석을 선택할 수 없습니다.",
  };
}

export default function useAdmission({ concertId, timeId, isLoggedIn }) {
  const scope = JSON.stringify([concertId, timeId, isLoggedIn]);
  const [state, setState] = useState(() => empty(scope));
  const [now, setNow] = useState(() => performance.now());
  const request = useRef({ sequence: 0, controller: null });
  const currentScope = useRef(scope);
  currentScope.current = scope;

  const perform = useCallback(
    async (operation, previous) => {
      request.current.controller?.abort();
      const controller = new AbortController();
      const sequence = ++request.current.sequence;
      request.current.controller = controller;
      const current = () =>
        currentScope.current === scope &&
        sequence === request.current.sequence &&
        !controller.signal.aborted;
      if (operation !== "poll")
        setState({
          ...previous,
          scope,
          status:
            operation === "join"
              ? "JOINING"
              : operation === "leave"
                ? "LEAVING"
                : "CHECKING",
        });
      try {
        const policy =
          operation === "refresh"
            ? checkedPolicy(
                await getAdmissionPolicy(concertId, timeId, controller.signal),
              )
            : previous.policy;
        if (!current()) return;
        if (!policy.enabled) {
          setState({ ...empty(scope), status: "DISABLED", policy });
          return;
        }
        if (!isLoggedIn) {
          setState({
            ...empty(scope),
            policy,
            ...failure({ response: { status: 401 } }),
          });
          return;
        }
        let data;
        if (operation === "leave") {
          await leaveAdmission(
            concertId,
            timeId,
            previous.data.generation,
            previous.data.admission.queueEntryId,
            controller.signal,
          );
          if (current()) setState({ ...empty(scope), policy, status: "LEFT" });
          return;
        }
        try {
          data =
            operation === "join"
              ? await joinAdmission(concertId, timeId, controller.signal)
              : await getAdmission(concertId, timeId, controller.signal);
        } catch (error) {
          if (
            operation !== "join" &&
            error?.response?.status === 404 &&
            error.response.data?.code === "ADMISSION_NOT_JOINED"
          ) {
            if (current())
              setState({ ...empty(scope), policy, status: "NOT_JOINED" });
            return;
          }
          throw error;
        }
        if (current()) {
          setState({ scope, policy, ...checkedSnapshot(data, policy) });
          setNow(performance.now());
        }
      } catch (error) {
        if (current()) setState({ ...previous, scope, ...failure(error) });
      }
    },
    [concertId, timeId, scope, isLoggedIn],
  );

  useEffect(() => {
    const activeRequest = request.current;
    if (timeId != null) perform("refresh", empty(scope));
    return () => {
      activeRequest.sequence += 1;
      activeRequest.controller?.abort();
    };
  }, [perform, scope, timeId]);

  // One outstanding read; no JOIN from timers. Successful reads never renew a lease.
  useEffect(() => {
    if (
      state.scope !== scope ||
      !["WAITING", "ADMITTED"].includes(state.status)
    )
      return undefined;
    const timer = window.setTimeout(
      () => perform("poll", state),
      state.policy.pollIntervalMillis + Math.floor(Math.random() * 1000),
    );
    return () => window.clearTimeout(timer);
  }, [state, scope, perform]);

  useEffect(() => {
    if (
      state.scope !== scope ||
      !["WAITING", "ADMITTED"].includes(state.status)
    )
      return undefined;
    const timer = window.setInterval(() => setNow(performance.now()), 1000);
    return () => window.clearInterval(timer);
  }, [state.scope, state.status, scope]);

  const view = state.scope === scope ? state : empty(scope);
  const seconds = Math.max(0, Math.ceil((view.deadline - now) / 1000));
  const expired =
    ["WAITING", "ADMITTED"].includes(view.status) && seconds === 0;
  const status = expired ? "EXPIRED" : view.status;
  const canPurchase = status === "DISABLED" || status === "ADMITTED";
  const refresh = () => perform("refresh", empty(scope));
  const onPurchaseError = useCallback(
    (error) => {
      if (
        currentScope.current !== scope ||
        !["ADMISSION_REQUIRED", "ADMISSION_UNAVAILABLE"].includes(
          error?.response?.data?.code,
        )
      )
        return;
      request.current.sequence += 1;
      request.current.controller?.abort();
      setState((previous) => ({ ...previous, scope, ...failure(error) }));
    },
    [scope],
  );

  return {
    status: timeId == null ? "IDLE" : status,
    canPurchase: timeId != null && canPurchase,
    token: status === "ADMITTED" ? view.data?.admission.token : undefined,
    position: view.data?.admission.position,
    seconds,
    message: view.message,
    opensAt: view.policy?.opensAt,
    pending: ["CHECKING", "JOINING", "LEAVING"].includes(status),
    refresh,
    join: () => perform("join", view),
    leave: () => perform("leave", view),
    canLeave: !!view.data && !["EXPIRED", "LEFT"].includes(status),
    onPurchaseError,
  };
}
