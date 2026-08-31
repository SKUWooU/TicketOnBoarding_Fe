import { Grid, Paper } from "@mui/material";
import dayjs from "dayjs";
import PropTypes from "prop-types";

import { SEAT_AVAILABILITY, isSeatSelectable } from "../utils/seatAvailability";
import style from "../styles/ConcertDetail.module.scss";

const STATUS_PRESENTATION = {
  [SEAT_AVAILABILITY.AVAILABLE]: {
    label: "선택 가능",
    styleName: "available",
  },
  [SEAT_AVAILABILITY.HELD]: {
    label: "임시 점유",
    styleName: "held",
  },
  [SEAT_AVAILABILITY.RESERVED]: {
    label: "예약 완료",
    styleName: "reserved",
  },
  [SEAT_AVAILABILITY.UNAVAILABLE]: {
    label: "상태 확인 불가",
    styleName: "unavailable",
  },
};

function formatHoldExpiry(holdExpiresAt) {
  if (!holdExpiresAt) return null;

  const expiry = dayjs(holdExpiresAt);
  return expiry.isValid() ? expiry.format("HH:mm") : null;
}

function getSeatPresentation(seat, selected) {
  if (selected) {
    return {
      label: "선택 좌석",
      styleName: "selected",
    };
  }

  return (
    STATUS_PRESENTATION[seat.availability] ??
    STATUS_PRESENTATION[SEAT_AVAILABILITY.UNAVAILABLE]
  );
}

function getSeatAccessibleLabel(seat, presentation) {
  const expiry =
    seat.availability === SEAT_AVAILABILITY.HELD
      ? formatHoldExpiry(seat.holdExpiresAt)
      : null;

  return `${seat.id}, ${presentation.label}${expiry ? `, ${expiry}까지` : ""}`;
}

function SeatSelectionGrid({ seats, selectedSeats, onSeatClick }) {
  return (
    <>
      <Grid
        container
        spacing={1}
        justifyContent="center"
        className={style.gridContainer}
      >
        {seats.map((row, rowIndex) => (
          <Grid
            container
            item
            spacing={1}
            justifyContent="center"
            key={`row-${rowIndex}`}
          >
            {row.map((seat, seatIndex) => {
              if (!seat) {
                return (
                  <Grid item key={`spacer-${rowIndex}-${seatIndex}`}>
                    <div className={style.spacer}></div>
                  </Grid>
                );
              }

              const selected = selectedSeats.includes(seat.id);
              const presentation = getSeatPresentation(seat, selected);
              const accessibleLabel = getSeatAccessibleLabel(
                seat,
                presentation,
              );
              const holdExpiry =
                seat.availability === SEAT_AVAILABILITY.HELD
                  ? formatHoldExpiry(seat.holdExpiresAt)
                  : null;

              return (
                <Grid item key={seat.id}>
                  <Paper
                    component="button"
                    type="button"
                    disabled={!isSeatSelectable(seat)}
                    aria-pressed={selected}
                    aria-label={accessibleLabel}
                    title={accessibleLabel}
                    className={`${style.seat} ${style[presentation.styleName]}`}
                    onClick={() => onSeatClick(seat)}
                  >
                    <span>{seat.id}</span>
                    {holdExpiry && (
                      <span className={style.seatExpiry} aria-hidden="true">
                        {holdExpiry}
                      </span>
                    )}
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        ))}
      </Grid>

      <div className={style.statusContainer} aria-label="좌석 상태 안내">
        {[
          ["statusAvailable", "선택 가능"],
          ["statusHeld", "임시 점유"],
          ["statusReserved", "예약 완료"],
          ["statusSelected", "선택 좌석"],
        ].map(([statusStyle, label]) => (
          <div className={style.statusItem} key={statusStyle}>
            <span
              className={`${style.seat} ${style[statusStyle]}`}
              aria-hidden="true"
            ></span>
            <p className={style.infoText}>{label}</p>
          </div>
        ))}
      </div>
      <p className={style.holdNotice}>
        임시 점유 좌석은 표시된 만료 시각 이후 서버 재조회 결과에 따라 선택할 수
        있습니다.
      </p>
    </>
  );
}

SeatSelectionGrid.propTypes = {
  seats: PropTypes.arrayOf(PropTypes.array).isRequired,
  selectedSeats: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSeatClick: PropTypes.func.isRequired,
};

export default SeatSelectionGrid;
