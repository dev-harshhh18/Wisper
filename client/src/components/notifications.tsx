import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Notification } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useEncryption } from "@/hooks/use-encryption";

export function Notifications() {
  const { user } = useAuth();
  const { decrypt } = useEncryption();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    enabled: !!user,
  });

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", `/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws?userId=${user.id}`;
    const websocket = new WebSocket(wsUrl);

    websocket.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      setUnreadCount(prev => prev + 1);
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
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
                  if (!notification.read) {
                    markAsReadMutation.mutate(notification.id);
                  }
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