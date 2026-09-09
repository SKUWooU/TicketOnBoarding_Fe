import PropTypes from "prop-types";

import style from "../styles/ConcertDetail.module.scss";

function SeatSectionSelector({
  sections,
  selectedSectionCode,
  disabled,
  onSelect,
}) {
  if (!sections.length) return null;

  return (
    <div className={style.sectionSelector} aria-label="좌석 구역 선택">
      {sections.map((section) => {
        const selected = section.sectionCode === selectedSectionCode;
        return (
          <button
            type="button"
            key={section.sectionCode}
            className={`${style.sectionButton} ${selected ? style.sectionButtonSelected : ""}`}
            aria-pressed={selected}
            disabled={disabled}
            onClick={() => onSelect(section.sectionCode)}
          >
            <strong>{section.sectionName}</strong>
            <span>
              선택 가능 {section.availableSeats} · 선택 중 {section.heldSeats} ·
              예약 완료 {section.reservedSeats} / 전체 {section.totalSeats}
            </span>
          </button>
        );
      })}
    </div>
  );
}

SeatSectionSelector.propTypes = {
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      sectionCode: PropTypes.string.isRequired,
      sectionName: PropTypes.string.isRequired,
      availableSeats: PropTypes.number.isRequired,
      heldSeats: PropTypes.number.isRequired,
      reservedSeats: PropTypes.number.isRequired,
      totalSeats: PropTypes.number.isRequired,
    }),
  ).isRequired,
  selectedSectionCode: PropTypes.string,
  disabled: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
};

export default SeatSectionSelector;
