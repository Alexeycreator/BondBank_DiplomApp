import React, { useRef, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import styles from "./ImportExport.module.css";
import { useToast } from "../../../../shared/notifications/ToastContext";
import { importBondsFile } from "../../../../service/filesApi";
import { ApiRequestError } from "../../../../shared/api/client";

export interface ImportBondsProps {
  onImport: () => void | Promise<void>;
}

const ImportBonds: React.FC<ImportBondsProps> = ({ onImport }) => {
  const [showModal, setShowModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [typeFile, setTypeFile] = useState("MoscowExchange");
  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      await importBondsFile(file, typeFile);
      await onImport();
      showToast("Успешно", "Данные успешно импортированы", "success");
      setShowModal(false); // Закрываем модалку после успеха
    } catch (err: unknown) {
      const msg =
        err instanceof ApiRequestError
          ? err.serverMessage || err.message
          : err instanceof Error
            ? err.message
            : "Не удалось импортировать файл";
      console.error("Ошибка импорта:", err);
      showToast("Ошибка", msg, "danger");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      {/* Кнопка, которая остается в шапке */}
      <Button
        variant="info"
        className="text-dark fw-bold"
        onClick={() => setShowModal(true)}
      >
        📥 Импорт CSV
      </Button>

      {/* Модальное окно с выбором биржи */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        contentClassName="bg-dark text-white border-secondary"
      >
        <Modal.Header
          closeButton
          closeVariant="white"
          className="border-secondary"
        >
          <Modal.Title>Импорт облигаций</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Выберите биржу</Form.Label>
            <Form.Select
              value={typeFile}
              onChange={(e) => setTypeFile(e.target.value)}
              disabled={isUploading}
              className={styles.darkSelect}
            >
              <option value="MoscowExchange">Московская</option>
              <option value="LjubljanaStockExchange">Люблянская</option>
              <option value="WienerBoerse">Венская</option>
              <option value="SixGroup">Швейцарская</option>
            </Form.Select>
          </Form.Group>

          <Form.Group>
            <Form.Label>Файл CSV</Form.Label>
            <Form.Control
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isUploading}
              ref={inputRef}
              className={styles.darkInput}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-secondary">
          <Button
            variant="outline-secondary"
            onClick={() => setShowModal(false)}
            disabled={isUploading}
          >
            Отмена
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ImportBonds;
