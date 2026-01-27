import { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { HiBell, HiX } from "react-icons/hi";
import { useNotifications } from "../../context/NotificationContext";
import { useNavigate } from "react-router-dom";
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
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
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
  border-bottom: 1px solid var(--color-grey-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h3`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-grey-900);
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
  border-bottom: 1px solid var(--color-grey-200);
  background-color: ${(props) => (props.$read ? "transparent" : "var(--color-grey-50)")};
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
  color: var(--color-grey-900);
`;

const MetaContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.2rem;
  min-width: 80px;
`;

const TimeText = styled.span`
  font-size: 1.1rem;
  color: var(--color-grey-500);
`;

const ItemMessage = styled.p`
  font-size: 1.3rem;
  color: var(--color-grey-700);
  line-height: 1.4;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--color-grey-400);
  cursor: pointer;
  padding: 0.2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  margin-left: 0;
  margin-top: 0;

  &:hover {
    background-color: var(--color-red-100);
    color: var(--color-red-600);
  }
`;

const EmptyState = styled.div`
  padding: 3.2rem;
  text-align: center;
  color: var(--color-text-dim);
`;

export default function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
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
    // Handle specific notification types
    if (notification.type === "validation_pending" || notification.type === "manual_validation") {
      navigate("/devices?tab=validation");
      setIsOpen(false);
    } else if (notification.type === "attendance_late" || notification.type === "attendance_early_exit") {
      navigate("/attendance");
      setIsOpen(false);
    } else if (notification.type === "system_alert") {
      // Maybe navigate to logs or settings
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteNotification(id);
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
                    <MetaContainer>
                      <CloseButton onClick={(e) => handleDelete(e, notification.id)}>
                        <HiX size={16} />
                      </CloseButton>
                      <TimeText>
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </TimeText>
                    </MetaContainer>
                  </ItemHeader>
                  <ItemMessage>{notification.message}</ItemMessage>
                </NotificationItem>
              ))
            )}
          </NotificationList>
        </Dropdown>
      )}
    </Container>
  );
}
