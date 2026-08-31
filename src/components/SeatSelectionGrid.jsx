import { Grid, Paper } from "@mui/material";
import PropTypes from "prop-types";

import { SEAT_AVAILABILITY, isSeatSelectable } from "../utils/seatAvailability";
import style from "../styles/ConcertDetail.module.scss";

const STATUS_PRESENTATION = {
  [SEAT_AVAILABILITY.AVAILABLE]: {
    label: "선택 가능",
    styleName: "available",
  },
  [SEAT_AVAILABILITY.HELD]: {
    label: "다른 사용자가 선택 중",
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

function getSeatPresentation(seat, selected) {
  if (selected) {
    return {
      label: "내가 선택한 좌석",
      styleName: "selected",
    };
  }

  return (
    STATUS_PRESENTATION[seat.availability] ??
    STATUS_PRESENTATION[SEAT_AVAILABILITY.UNAVAILABLE]
  );
}

function SeatSelectionGrid({
  seats,
  selectedSeats,
  interactionDisabled = false,
  onSeatClick,
}) {
  return (
    <>
      <Grid
        container
        spacing={1}
        justifyContent="center"
        className={style.gridContainer}
        aria-busy={interactionDisabled}
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
              const accessibleLabel = `${seat.id}, ${presentation.label}`;

              return (
                <Grid item key={seat.id}>
                  <Paper
                    component="button"
                    type="button"
                    disabled={
                      interactionDisabled ||
                      (!selected && !isSeatSelectable(seat))
                    }
                    aria-pressed={selected}
                    aria-label={accessibleLabel}
                    title={accessibleLabel}
                    className={`${style.seat} ${style[presentation.styleName]}`}
                    onClick={() => onSeatClick(seat)}
                  >
                    {seat.id}
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
          ["statusHeld", "다른 사용자 선택 중"],
          ["statusReserved", "예약 완료"],
          ["statusSelected", "내가 선택"],
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
        다른 사용자의 정확한 점유 만료 시각은 표시하지 않습니다.
      </p>
    </>
  );
}

SeatSelectionGrid.propTypes = {
  seats: PropTypes.arrayOf(PropTypes.array).isRequired,
  selectedSeats: PropTypes.arrayOf(PropTypes.string).isRequired,
  interactionDisabled: PropTypes.bool,
  onSeatClick: PropTypes.func.isRequired,
};

export default SeatSelectionGrid;
