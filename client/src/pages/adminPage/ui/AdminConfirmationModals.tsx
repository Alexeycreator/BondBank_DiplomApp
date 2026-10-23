import { Button, Modal } from "react-bootstrap";

interface AdminConfirmationModalsProps {
  showCancelChanges: boolean;
  userToDelete: string | number | null;
  newsToDelete: number | null;
  onCloseCancelChanges: () => void;
  onConfirmCancelChanges: () => void;
  onCloseDeleteUser: () => void;
  onConfirmDeleteUser: () => void;
  onCloseDeleteNews: () => void;
  onConfirmDeleteNews: () => void;
}

const AdminConfirmationModals = ({
  showCancelChanges,
  userToDelete,
  newsToDelete,
  onCloseCancelChanges,
  onConfirmCancelChanges,
  onCloseDeleteUser,
  onConfirmDeleteUser,
  onCloseDeleteNews,
  onConfirmDeleteNews,
}: AdminConfirmationModalsProps) => (
  <>
    <Modal
      show={showCancelChanges}
      onHide={onCloseCancelChanges}
      centered
      contentClassName="bg-dark text-white border-secondary"
    >
      <Modal.Header closeButton closeVariant="white" className="border-secondary">
        <Modal.Title>Отмена изменений</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Вы уверены, что хотите отменить все несохранённые изменения?
      </Modal.Body>
      <Modal.Footer className="border-secondary">
        <Button variant="outline-secondary" onClick={onCloseCancelChanges}>
          Нет, продолжить
        </Button>
        <Button variant="danger" onClick={onConfirmCancelChanges}>
          Да, отменить
        </Button>
      </Modal.Footer>
    </Modal>

    <Modal
      show={userToDelete !== null}
      onHide={onCloseDeleteUser}
      centered
      contentClassName="bg-dark text-white border-secondary"
    >
      <Modal.Header closeButton closeVariant="white" className="border-secondary">
        <Modal.Title>Удаление пользователя</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Вы уверены, что хотите удалить этого пользователя? Это действие
        необратимо.
      </Modal.Body>
      <Modal.Footer className="border-secondary">
        <Button variant="outline-secondary" onClick={onCloseDeleteUser}>
          Отмена
        </Button>
        <Button variant="danger" onClick={onConfirmDeleteUser}>
          Удалить
        </Button>
      </Modal.Footer>
    </Modal>

    <Modal
      show={newsToDelete !== null}
      onHide={onCloseDeleteNews}
      centered
      contentClassName="bg-dark text-white border-secondary"
    >
      <Modal.Header closeButton closeVariant="white" className="border-secondary">
        <Modal.Title>Удаление новости</Modal.Title>
      </Modal.Header>
      <Modal.Body>Вы уверены, что хотите удалить эту новость?</Modal.Body>
      <Modal.Footer className="border-secondary">
        <Button variant="outline-secondary" onClick={onCloseDeleteNews}>
          Отмена
        </Button>
        <Button variant="danger" onClick={onConfirmDeleteNews}>
          Удалить
        </Button>
      </Modal.Footer>
    </Modal>
  </>
);

export default AdminConfirmationModals;
