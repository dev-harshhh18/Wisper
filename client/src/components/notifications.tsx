
import { useState, useEffect } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notification } from "@shared/schema";

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetch('/api/notifications')
        .then(res => res.json())
        .then(data => {
          setNotifications(data);
          setUnreadCount(data.filter((n: Notification) => !n.read).length);
        })
        .catch(console.error);
    }
  }, [user]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await fetch(`/api/notifications/${notification.id}/read`, { method: 'POST' });
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

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
                onClick={() => handleNotificationClick(notification)}
              >
                <p className="text-sm">{notification.content}</p>
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
