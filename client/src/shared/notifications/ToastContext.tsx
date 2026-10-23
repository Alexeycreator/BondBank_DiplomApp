import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Toast, ToastContainer } from "react-bootstrap";

type ToastVariant = "success" | "danger" | "warning" | "info";

interface ToastMessage {
    id: number;
    title: string;
    message: string;
    variant: ToastVariant;
}

interface ToastContextType {
    showToast: (title: string, message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within ToastProvider");
    return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = useCallback((title: string, message: string, variant: ToastVariant = "success") => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, title, message, variant }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 4000);
    }, []);

    const removeToast = (id: number) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <ToastContainer position="top-end" className="p-3" style={{ position: "fixed", zIndex: 9999 }}>
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        bg={toast.variant}
                        onClose={() => removeToast(toast.id)}
                        delay={4000}
                        autohide
                        className="mb-2"
                    >
                        <Toast.Header closeButton closeVariant="white">
                            <strong className="me-auto">{toast.title}</strong>
                        </Toast.Header>
                        <Toast.Body className={toast.variant === "warning" || toast.variant === "info" ? "text-dark" : "text-white"}>
                            {toast.message}
                        </Toast.Body>
                    </Toast>
                ))}
            </ToastContainer>
        </ToastContext.Provider>
    );
};
