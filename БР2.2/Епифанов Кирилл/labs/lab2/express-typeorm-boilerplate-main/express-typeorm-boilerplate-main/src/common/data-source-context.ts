import { DataSource } from 'typeorm';

let active: DataSource | null = null;

export function setDataSource(ds: DataSource): void {
    active = ds;
}

export function getDataSource(): DataSource {
    if (!active) {
        throw new Error('DataSource not set');
    }
    return active;
}
