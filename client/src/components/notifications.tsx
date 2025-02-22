import { useState, useEffect } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notification } from "@shared/schema";


export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetch('/api/notifications')
        .then(res => res.json())
        .then(data => setNotifications(data))
        .catch(console.error);
    }
  }, [user]); 

  const getNotificationContent = (notification: Notification) => {
    if (notification.type === 'like' || notification.type === 'comment') {
      const match = notification.content.match(/"([^"]+)"/);
      if (match) {
        const encryptedContent = match[1];
        const decryptedContent = decrypt(encryptedContent) || 'Content unavailable';
        return notification.content.replace(match[0], `"${decryptedContent}"`);
      }
    }
    return notification.content;
  };

  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b last:border-b-0 ${
                  notification.read ? 'bg-background' : 'bg-muted'
                }`}
                onClick={() => {

                }}
              >
                <p className="text-sm">{getNotificationContent(notification)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(notification.createdAt!).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}