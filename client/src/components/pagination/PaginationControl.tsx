import React, { useState, useEffect } from "react";
import { Pagination, Form, Button, InputGroup } from "react-bootstrap";
import styles from "./PaginationControl.module.css";

interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
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

  useEffect(() => {
    setJumpPage("");
  }, [currentPage]);

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
      {/* Слева: выбор количества строк */}
      <div className={styles.paginationSection}>
        <span className={styles.label}>Строк на странице:</span>
        
        {/* ✅ Используем Form.Select из Bootstrap */}
        <Form.Select
          size="sm"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className={styles.darkSelect}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </Form.Select>
      </div>

      {/* По центру: пагинация */}
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

      {/* Справа: переход на страницу */}
      <div className={styles.paginationSection}>
        <span className={styles.label}>Перейти на:</span>
        
        {/* ✅ Используем InputGroup из Bootstrap */}
        <InputGroup size="sm" className={styles.jumpInputGroup}>
          <Form.Control
            type="number"
            min={1}
            max={totalPages}
            value={jumpPage}
            onChange={handleJumpChange}
            onKeyDown={handleJumpKeyDown}
            onBlur={() => setJumpPage("")}
            placeholder={`1–${totalPages}`}
            className={styles.darkInput}
          />
          <Button variant="outline-secondary" onClick={handleJump} className={styles.darkButton}>
            ОК
          </Button>
        </InputGroup>
        <span className={styles.label}>из {totalPages}</span>
      </div>
    </div>
  );
};

export default PaginationControl;