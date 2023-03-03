export interface DepartureTime {
  timePlanned: string;
  timeReal: string;
  countdown: number;
}

export interface Vehicle {
  name: string;
  towards: string;
  direction: string;
  richtungsId: string;
  barrierFree: boolean;
  realtimeSupported: boolean;
  trafficjam: boolean;
  type: string;
  attributes: any;
  linienId: number;
}

export interface Departure {
  departureTime: DepartureTime;
  vehicle?: Vehicle;
}

export interface Line {
  name: string;
  towards: string;
  direction: string;
  platform: string;
  richtungsId: string;
  barrierFree: boolean;
  realtimeSupported: boolean;
  trafficjam: boolean;
  departures: {
    departure: Departure[];
  };
  type: string;
  lineId: number;
}

export interface Properties {
  name: string;
  title: string;
  municipality: string;
  municipalityId: number;
  type: string;
  coordName: string;
  attributes: any;
}

export interface Geometry {
  type: string;
  coordinates: number[];
}

export interface LocationStop {
  type: string;
  geometry: Geometry;
  properties: Properties;
}

export interface Monitor {
  lines: Line[];

  locationStop: LocationStop;
  attributes: any;
}

export interface Data {
  monitors: Monitor[];
}

export interface ApiResponse {
  data: Data;
  createdAt: Date;
}
