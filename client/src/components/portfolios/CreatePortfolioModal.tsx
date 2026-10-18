import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import styles from "./CreatePortfolioModal.module.css";
import { PortfolioType, MOCK_PORTFOLIO_LIMITS, PORTFOLIO_TYPES } from "./mockPortfolioTypes";

interface CreatePortfolioModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (newPortfolio: { name: string; description: string; type: PortfolioType }) => void;
    existingNames: string[];
    userId: number;
}

export const CreatePortfolioModal: React.FC<CreatePortfolioModalProps> = ({ isOpen, onClose, onCreate, existingNames }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<PortfolioType>("conservative");
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setName("");
            setDescription("");
            setType("conservative");
            setError("");
        }
    }, [isOpen]);

    const handleCreate = () => {
        setError("");
        if (!name.trim()) { setError("Введите название портфеля"); return; }
        if (name.trim().length < 3) { setError("Название должно содержать минимум 3 символа"); return; }
        if (name.trim().length > 50) { setError("Название не должно превышать 50 символов"); return; }
        const exists = existingNames.find((n) => n.toLowerCase() === name.trim().toLowerCase());
        if (exists) { setError("Портфель с таким названием уже существует"); return; }

        onCreate({ name: name.trim(), description: description.trim(), type });
    };

    return (
        <Modal show={isOpen} onHide={onClose} centered contentClassName={styles.modalContent}>
            <Modal.Header closeButton closeVariant="white" style={{ borderBottomColor: '#2d3b5e' }}>
                <Modal.Title>➕ Создать портфель</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}

                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Название портфеля <span className="text-danger">*</span></Form.Label>
                        <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Например: Мой портфель" maxLength={50} autoFocus />
                        <Form.Text className="text-muted">{name.length}/50</Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Описание <span className="text-muted fw-normal">(необязательно)</span></Form.Label>
                        <Form.Control as="textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Краткое описание портфеля..." maxLength={200} />
                        <Form.Text className="text-muted">{description.length}/200</Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Тип портфеля</Form.Label>
                        <div className="d-flex flex-column gap-2">
                            {PORTFOLIO_TYPES.map((t) => {
                                const info = MOCK_PORTFOLIO_LIMITS[t];
                                return (
                                    <div key={t} className={`${styles.typeCard} ${type === t ? styles.typeCardActive : ""}`} onClick={() => setType(t)}>
                                        <Form.Check type="radio" id={`type-${t}`} name="portfolioType" checked={type === t} onChange={() => setType(t)} label={
                                            <div>
                                                <div className="fw-bold">{info.icon} {info.title}</div>
                                                <div className="small text-muted">{info.description}</div>
                                                <div className="small text-info mt-1">До {info.maxBonds} шт. • До {info.maxYield}%</div>
                                            </div>
                                        } />
                                    </div>
                                );
                            })}
                        </div>
                    </Form.Group>
                </Form>
            </Modal.Body>

            <Modal.Footer style={{ borderTopColor: '#2d3b5e' }}>
                <Button variant="outline-secondary" onClick={onClose}>Отмена</Button>
                <Button variant="info" onClick={handleCreate} className="text-dark fw-bold">Создать</Button>
            </Modal.Footer>
        </Modal>
    );
};