import { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { HiBell, HiCheck, HiX } from "react-icons/hi";
import { useNotifications } from "../../context/NotificationContext";
import { useNavigate } from "react-router-dom";
import ValidationQueueModal from "../validation/ValidationQueueModal";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const Container = styled.div`
  position: relative;
`;

const BellButton = styled.button`
  background: none;
  border: none;
  position: relative;
  cursor: pointer;
  padding: 0.8rem;
  border-radius: 50%;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: var(--color-grey-100);
  }

  & svg {
    width: 2.4rem;
    height: 2.4rem;
    color: var(--color-grey-600);
  }
`;

const Badge = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  background-color: var(--color-red-500);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  border: 2px solid var(--color-bg-main);
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  width: 36rem;
  background-color: var(--color-bg-elevated);
  border: 1px solid var(--color-border-card);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  margin-top: 0.8rem;
  display: flex;
  flex-direction: column;
  max-height: 80vh;
`;

const Header = styled.div`
  padding: 1.6rem;
  border-bottom: 1px solid var(--color-border-card);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h3`
  font-size: 1.6rem;
  font-weight: 600;
`;

const MarkReadButton = styled.button`
  background: none;
  border: none;
  color: var(--color-brand-600);
  font-size: 1.2rem;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const NotificationList = styled.div`
  overflow-y: auto;
  flex: 1;
`;

const NotificationItem = styled.div<{ $read: boolean }>`
  padding: 1.2rem 1.6rem;
  border-bottom: 1px solid var(--color-border-card);
  background-color: ${(props) => (props.$read ? "transparent" : "var(--color-brand-50)")};
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--color-grey-50);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.4rem;
`;

const ItemTitle = styled.span`
  font-weight: 600;
  font-size: 1.4rem;
  color: var(--color-text-strong);
`;

const ItemTime = styled.span`
  font-size: 1.1rem;
  color: var(--color-text-dim);
`;

const ItemMessage = styled.p`
  font-size: 1.3rem;
  color: var(--color-text-main);
  line-height: 1.4;
`;

const EmptyState = styled.div`
  padding: 3.2rem;
  text-align: center;
  color: var(--color-text-dim);
`;

export default function NotificationCenter() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const [showValidationModal, setShowValidationModal] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNotificationClick = async (notification: any) => {
        if (!notification.is_read) {
            await markAsRead(notification.id);
        }

        // Handle specific notification types
        if (notification.type === "validation_request") {
            setShowValidationModal(true);
            setIsOpen(false);
        } else if (notification.type === "system_alert") {
            // Maybe navigate to logs or settings
        }
    };

    return (
        <Container ref={containerRef}>
            <BellButton onClick={() => setIsOpen(!isOpen)}>
                <HiBell />
                {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
            </BellButton>

            {isOpen && (
                <Dropdown>
                    <Header>
                        <Title>Notifications</Title>
                        {unreadCount > 0 && (
                            <MarkReadButton onClick={() => markAllAsRead()}>
                                Tout marquer comme lu
                            </MarkReadButton>
                        )}
                    </Header>

                    <NotificationList>
                        {notifications.length === 0 ? (
                            <EmptyState>Aucune notification</EmptyState>
                        ) : (
                            notifications.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    $read={notification.is_read}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <ItemHeader>
                                        <ItemTitle>{notification.title}</ItemTitle>
                                        <ItemTime>
                                            {formatDistanceToNow(new Date(notification.created_at), {
                                                addSuffix: true,
                                                locale: fr,
                                            })}
                                        </ItemTime>
                                    </ItemHeader>
                                    <ItemMessage>{notification.message}</ItemMessage>
                                </NotificationItem>
                            ))
                        )}
                    </NotificationList>
                </Dropdown>
            )}

            {showValidationModal && (
                <ValidationQueueModal onClose={() => setShowValidationModal(false)} />
            )}
        </Container>
    );
}
