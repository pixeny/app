import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';

export interface LocationUpdate {
  userId: string;
  rideId?: string;
  location: {
    lat: number;
    lng: number;
  };
  timestamp: string;
}

export interface RideRequest {
  rideId: string;
  origin: {
    lat: number;
    lng: number;
  };
  destination: {
    lat: number;
    lng: number;
  };
  fare: number;
  distance: number;
}

export interface RideAccepted {
  ride: any;
  driver: {
    full_name: string;
    phone: string;
    car_make: string;
    car_model: string;
    license_plate: string;
  };
}

export interface RideStatus {
  ride: any;
}

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token: string) {
    this.token = token;
    
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io('http://localhost:3011', {
      auth: {
        token: this.token
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(roomId: string) {
    if (this.socket) {
      this.socket.emit('join-room', roomId);
    }
  }

  leaveRoom(roomId: string) {
    if (this.socket) {
      this.socket.leave(roomId);
    }
  }

  updateDriverLocation(data: LocationUpdate) {
    if (this.socket) {
      this.socket.emit('driver-location-update', data);
    }
  }

  updateRideStatus(data: any) {
    if (this.socket) {
      this.socket.emit('ride-status-update', data);
    }
  }

  onNewRideRequest(callback: (data: RideRequest) => void) {
    if (this.socket) {
      this.socket.on('new-ride-request', callback);
    }
  }

  onRideAccepted(callback: (data: RideAccepted) => void) {
    if (this.socket) {
      this.socket.on('ride-accepted', callback);
    }
  }

  onRideStarted(callback: (data: RideStatus) => void) {
    if (this.socket) {
      this.socket.on('ride-started', callback);
    }
  }

  onRideCompleted(callback: (data: RideStatus) => void) {
    if (this.socket) {
      this.socket.on('ride-completed', callback);
    }
  }

  onRideCancelled(callback: (data: RideStatus) => void) {
    if (this.socket) {
      this.socket.on('ride-cancelled', callback);
    }
  }

  onLocationUpdate(callback: (data: LocationUpdate) => void) {
    if (this.socket) {
      this.socket.on('location-update', callback);
    }
  }

  onStatusUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('status-update', callback);
    }
  }

  removeListener(event: string, callback?: any) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
export default socketService;
