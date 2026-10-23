import { Button, Modal } from "react-bootstrap";
import { PortfolioBond } from "../../../../entities/portfolio/model/types";
import { StatusBadge } from "../../../../shared/ui/status-badge/StatusBadge";

interface PortfolioBondDetailsModalProps {
    bond: PortfolioBond | null;
    onClose: () => void;
    onOpenBond: (isin: string) => void;
}

export function PortfolioBondDetailsModal({
    bond,
    onClose,
    onOpenBond,
}: PortfolioBondDetailsModalProps) {
    return (
        <Modal
            show={!!bond}
            onHide={onClose}
            centered
            scrollable
            contentClassName="bg-dark text-white border-secondary"
        >
            <Modal.Header closeButton closeVariant="white" className="border-secondary">
                <Modal.Title>{bond?.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {bond && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={detailRowStyle}>
                            <span style={detailLabelStyle}>ISIN:</span>
                            <span>{bond.isin}</span>
                        </div>
                        <div style={detailRowStyle}>
                            <span style={detailLabelStyle}>Тип:</span>
                            <StatusBadge variantType="type" value={bond.bondType} />
                        </div>
                        <div style={detailRowStyle}>
                            <span style={detailLabelStyle}>Количество:</span>
                            <span>{bond.quantity} шт.</span>
                        </div>
                        <div style={detailRowStyle}>
                            <span style={detailLabelStyle}>Цена:</span>
                            <span>{bond.price} ₽</span>
                        </div>
                        <div style={detailRowStyle}>
                            <span style={detailLabelStyle}>Доходность:</span>
                            <StatusBadge variantType="yield" value={bond.yield} />
                        </div>
                        <div style={{ ...detailRowStyle, borderBottom: "none" }}>
                            <span style={detailLabelStyle}>Итого:</span>
                            <span style={{ color: "#4fc3f7", fontWeight: "bold", fontSize: "18px" }}>
                                {bond.total.toFixed(2)} ₽
                            </span>
                        </div>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer className="border-secondary">
                <Button variant="outline-secondary" onClick={onClose}>
                    Закрыть
                </Button>
                <Button
                    variant="info"
                    className="text-dark fw-bold"
                    disabled={!bond}
                    onClick={() => bond && onOpenBond(bond.isin)}
                >
                    Перейти на страницу облигации
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

const detailRowStyle = {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid #2d3b5e",
    paddingBottom: "8px",
};

const detailLabelStyle = { color: "#a0aabf" };
