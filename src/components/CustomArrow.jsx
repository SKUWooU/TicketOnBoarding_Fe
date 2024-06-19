import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

export function NextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <FaArrowRight
      className={className}
      style={{
        ...style,
        display: "block",
        color: "black",
        backgroundColor: "white",
        borderRadius: "50%",
        padding: "10px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
        right: "-50px",
        zIndex: 1,
        cursor: "pointer",
        transition: "transform 0.2s",
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.5)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    />
  );
}

export function PrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <FaArrowLeft
      className={className}
      style={{
        ...style,
        display: "block",
        color: "black",
        backgroundColor: "white",
        borderRadius: "50%",
        padding: "10px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
        left: "-50px",
        zIndex: 1,
        cursor: "pointer",
        transition: "transform 0.2s",
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    />
  );
}
