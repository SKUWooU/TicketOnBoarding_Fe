import ReactPaginate from "react-paginate";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const Pagination = ({ pageCount, onPageChange, currentPage }) => {
  return (
    <ReactPaginate
      previousLabel={<FiChevronLeft />}
      nextLabel={<FiChevronRight />}
      pageCount={pageCount}
      onPageChange={onPageChange}
      containerClassName={"pagination"}
      pageLinkClassName={"pagination__link"}
      activeLinkClassName={"pagination__link__active"}
      pageRangeDisplayed={pageCount} // 페이지 번호를 충분히 많이 표시
      marginPagesDisplayed={pageCount} // 마진 페이지 번호를 충분히 많이 표시
    />
  );
};

export default Pagination;
