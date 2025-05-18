declare module 'leaflet' {
  export interface Map {
    setView(center: [number, number], zoom: number): this
    off(): this
    remove(): void
  }

  export interface LayerGroup {
    clearLayers(): this
    addTo(map: Map): this
  }

  export interface Marker {
    on(event: string, handler: Function): this
    addTo(map: Map | LayerGroup): this
  }

  export function map(element: HTMLElement): Map
  export function layerGroup(): LayerGroup
  export function marker(latlng: [number, number]): Marker
  export function tileLayer(urlTemplate: string, options?: any): any

  export default {
    map,
    layerGroup,
    marker,
    tileLayer,
  }
}
