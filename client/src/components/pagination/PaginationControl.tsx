import React, { useState, useEffect } from "react";
import { Pagination, Dropdown, Form, Button, InputGroup } from "react-bootstrap";
import styles from "./PaginationControl.module.css";

interface PaginationControlProps {
  /** Текущая страница (начиная с 1) */
  currentPage: number;
  /** Общее количество страниц */
  totalPages: number;
  /** Текущий размер страницы */
  pageSize: number;
  /** Доступные варианты размера страницы */
  pageSizeOptions?: number[];
  /** Колбэк при смене страницы */
  onPageChange: (page: number) => void;
  /** Колбэк при смене размера страницы */
  onPageSizeChange: (size: number) => void;
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const PaginationControl: React.FC<PaginationControlProps> = ({
  currentPage,
  totalPages,
  pageSize,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageChange,
  onPageSizeChange,
}) => {
  const [jumpPage, setJumpPage] = useState("");

  // Сбрасываем поле ввода при изменении текущей страницы извне
  useEffect(() => {
    setJumpPage("");
  }, [currentPage]);

  // Формируем список страниц с многоточиями
  const getPageNumbers = (): (number | "...")[] => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | "...")[] = [];

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    let l: number | undefined;
    for (const i of range) {
      if (l !== undefined) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l > 2) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  const handleJump = () => {
    const page = Number(jumpPage);
    if (!Number.isNaN(page) && page >= 1 && page <= totalPages) {
      onPageChange(page);
      setJumpPage("");
    }
  };

  const handleJumpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJumpPage(e.target.value);
  };

  const handleJumpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleJump();
    }
  };

  return (
    <div className={styles.paginationContainer}>
      {/* Слева: выбор количества строк на странице */}
      <div className={styles.paginationSection}>
        <span className={styles.label}>Строк на странице:</span>
        <Dropdown>
          <Dropdown.Toggle variant="outline-secondary" size="sm" id="page-size-dropdown">
            {pageSize}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {pageSizeOptions.map((size) => (
              <Dropdown.Item
                key={size}
                active={size === pageSize}
                onClick={() => onPageSizeChange(size)}
              >
                {size}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {/* По центру: навигация по страницам */}
      <div className={styles.paginationCenter}>
        <Pagination className="mb-0">
          <Pagination.Prev
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          />
          {getPageNumbers().map((item, index) =>
            item === "..." ? (
              <Pagination.Ellipsis key={`ellipsis-${index}`} disabled />
            ) : (
              <Pagination.Item
                key={item}
                active={item === currentPage}
                onClick={() => onPageChange(item)}
              >
                {item}
              </Pagination.Item>
            )
          )}
          <Pagination.Next
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          />
        </Pagination>
      </div>

      {/* Справа: переход на конкретную страницу */}
      <div className={styles.paginationSection}>
        <span className={styles.label}>Перейти на:</span>
        <InputGroup size="sm" className={styles.jumpInputGroup}>
          <Form.Control
            type="number"
            min={1}
            max={totalPages}
            value={jumpPage}
            onChange={handleJumpChange}
            onKeyDown={handleJumpKeyDown}
            onBlur={() => setJumpPage("")} // Очищаем при потере фокуса, если ввод не завершен
            placeholder={`1–${totalPages}`}
          />
          <Button variant="outline-secondary" onClick={handleJump}>
            ОК
          </Button>
        </InputGroup>
        <span className={styles.label}>из {totalPages}</span>
      </div>
    </div>
  );
};

export default PaginationControl;