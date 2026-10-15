import PropTypes from "prop-types";
import style from "../styles/ConcertDetail.module.scss";

export default function AdmissionPanel({ admission, busy, onLogin }) {
  const { status, seconds } = admission;
  if (["IDLE", "DISABLED"].includes(status)) return null;
  const text =
    {
      CHECKING: "구매 입장 상태를 확인하고 있습니다.",
      JOINING: "대기 등록 중입니다.",
      LEAVING: "대기실에서 나가고 있습니다.",
      NOT_JOINED: "이 회차는 대기 등록 후 입장할 수 있습니다.",
      WAITING: `현재 대기 순번 ${admission.position}번 · 등록 유지 ${seconds}초`,
      ADMITTED: `구매 입장 완료 · 입장권 유효 시간 ${seconds}초`,
      EXPIRED: "대기 또는 입장 시간이 만료되었습니다. 다시 등록해 주세요.",
      LEFT: "대기실에서 나왔습니다.",
    }[status] ?? admission.message;
  return (
    <section className={style.admissionPanel} aria-label="구매 대기실">
      <h3>구매 대기실</h3>
      <p role="status" aria-live="polite">
        {text}
      </p>
      <p>입장권은 좌석 확보가 아닙니다. 좌석 임시 점유 시간과 별개입니다.</p>
      {admission.opensAt && (
        <p>입장 시작: {new Date(admission.opensAt).toLocaleString("ko-KR")}</p>
      )}
      <div className={style.admissionActions}>
        {status === "AUTH_REQUIRED" ? (
          <button type="button" onClick={onLogin}>
            로그인
          </button>
        ) : null}
        {["NOT_JOINED", "EXPIRED", "LEFT", "FULL"].includes(status) && (
          <button
            type="button"
            disabled={busy || admission.pending}
            onClick={admission.join}
          >
            대기 등록
          </button>
        )}
        {status === "ERROR" && (
          <button type="button" disabled={busy} onClick={admission.refresh}>
            입장 상태 다시 확인
          </button>
        )}
        {admission.canLeave && (
          <button
            type="button"
            disabled={busy || admission.pending}
            onClick={admission.leave}
          >
            대기실 나가기
          </button>
        )}
      </div>
    </section>
  );
}
AdmissionPanel.propTypes = {
  admission: PropTypes.shape({
    status: PropTypes.string.isRequired,
    seconds: PropTypes.number.isRequired,
    position: PropTypes.number,
    message: PropTypes.string,
    opensAt: PropTypes.string,
    pending: PropTypes.bool.isRequired,
    canLeave: PropTypes.bool.isRequired,
    join: PropTypes.func.isRequired,
    leave: PropTypes.func.isRequired,
    refresh: PropTypes.func.isRequired,
  }).isRequired,
  busy: PropTypes.bool,
  onLogin: PropTypes.func.isRequired,
};
